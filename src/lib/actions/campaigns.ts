'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createCampaign(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  const { data, error } = await supabase
    .from('campaigns')
    .insert({ owner_id: user.id, name, description })
    .select()
    .single()

  if (error) throw new Error(error.message)

  redirect(`/dashboard/campaigns/${data.id}`)
}

export async function updateCampaign(campaignId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  const { error } = await supabase
    .from('campaigns')
    .update({ name, description, updated_at: new Date().toISOString() })
    .eq('id', campaignId)
    .eq('owner_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/campaigns/${campaignId}`)
  redirect(`/dashboard/campaigns/${campaignId}`)
}

export async function updateCampaignStatus(campaignId: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('campaigns')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', campaignId)
    .eq('owner_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/campaigns/${campaignId}`)
  revalidatePath('/dashboard')
}

export async function launchCampaign(campaignId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get campaign with owner's Twilio creds
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*, profiles!inner(twilio_account_sid, twilio_auth_token, twilio_phone_number)')
    .eq('id', campaignId)
    .eq('owner_id', user.id)
    .single()

  if (!campaign) throw new Error('Campaign not found')

  const profile = Array.isArray(campaign.profiles) ? campaign.profiles[0] : campaign.profiles
  const launchAccountSid = profile?.twilio_account_sid || process.env.TWILIO_ACCOUNT_SID
  const launchAuthToken = profile?.twilio_auth_token || process.env.TWILIO_AUTH_TOKEN
  const launchPhoneNumber = profile?.twilio_phone_number || process.env.TWILIO_PHONE_NUMBER
  if (!launchAccountSid || !launchAuthToken || !launchPhoneNumber) {
    throw new Error('Twilio credentials not configured. Go to Settings to add them.')
  }

  // Get active script
  const { data: activeScript } = await supabase
    .from('script_versions')
    .select('body')
    .eq('campaign_id', campaignId)
    .eq('is_active', true)
    .single()

  if (!activeScript) throw new Error('No active script found. Create a script before launching.')

  // Get eligible voters (mobile + voip) who haven't been messaged yet
  const { data: eligibleVoters } = await supabase
    .from('voters')
    .select('id, phone, first_name, state, phone_type')
    .eq('campaign_id', campaignId)
    .in('phone_type', ['mobile', 'voip'])
    .eq('opted_out', false)

  if (!eligibleVoters || eligibleVoters.length === 0) {
    throw new Error('No eligible voters to message.')
  }

  // Check which voters already have outbound messages
  const { data: existingMessages } = await supabase
    .from('messages')
    .select('voter_id')
    .eq('campaign_id', campaignId)
    .eq('direction', 'outbound')

  const messagedVoterIds = new Set(existingMessages?.map((m) => m.voter_id) || [])
  const unmessagedVoters = eligibleVoters.filter((v) => !messagedVoterIds.has(v.id))

  if (unmessagedVoters.length === 0) {
    throw new Error('All eligible voters have already been messaged.')
  }

  // Set campaign status to active
  await supabase
    .from('campaigns')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', campaignId)

  // Import compliance and twilio
  const { checkCompliance } = await import('@/lib/services/compliance')
  const { sendSms } = await import('@/lib/services/twilio')

  let sent = 0
  let failed = 0
  const statusCallback = process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/message/api/webhooks/twilio/status`
    : undefined

  for (const voter of unmessagedVoters) {
    try {
      // Compliance check
      const compliance = await checkCompliance(voter.phone, voter.state, supabase, voter.phone_type)
      if (!compliance.allowed) {
        failed++
        continue
      }

      // Personalize script
      const body = activeScript.body.replace(/{first_name}/gi, voter.first_name || 'there')

      // Create message record
      const { data: message } = await supabase
        .from('messages')
        .insert({
          campaign_id: campaignId,
          voter_id: voter.id,
          volunteer_id: user.id,
          direction: 'outbound',
          status: 'queued',
          body,
        })
        .select('id')
        .single()

      // Send via Twilio
      const twilioResult = await sendSms({
        accountSid: launchAccountSid,
        authToken: launchAuthToken,
        from: launchPhoneNumber,
        to: voter.phone,
        body,
        statusCallback,
      })

      await supabase
        .from('messages')
        .update({
          status: 'sent',
          twilio_sid: twilioResult.sid,
          sent_at: new Date().toISOString(),
        })
        .eq('id', message!.id)

      sent++

      // Rate limit: ~1 message per second
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      failed++
      console.error(`Failed to send to voter ${voter.id}:`, error)
    }
  }

  revalidatePath(`/dashboard/campaigns/${campaignId}`)
  revalidatePath(`/dashboard/campaigns/${campaignId}/inbox`)
  revalidatePath('/dashboard')

  return { sent, failed, total: unmessagedVoters.length }
}

export async function submitTenDlcRegistration(
  campaignId: string,
  formData: {
    brandName: string
    ein: string
    vertical: string
    useCase: string
    sampleMessage: string
    websiteUrl: string
    contactEmail: string
    contactPhone: string
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get campaign with owner's Twilio creds, falling back to env vars
  const { data: campaignWithCreds } = await supabase
    .from('campaigns')
    .select('*, profiles!inner(twilio_account_sid, twilio_auth_token)')
    .eq('id', campaignId)
    .eq('owner_id', user.id)
    .single()

  if (!campaignWithCreds) {
    throw new Error('Campaign not found or you are not the owner.')
  }

  const profile = Array.isArray(campaignWithCreds.profiles) ? campaignWithCreds.profiles[0] : campaignWithCreds.profiles
  const twilioAccountSid = profile?.twilio_account_sid || process.env.TWILIO_ACCOUNT_SID
  const twilioAuthToken = profile?.twilio_auth_token || process.env.TWILIO_AUTH_TOKEN

  if (!twilioAccountSid || !twilioAuthToken) {
    throw new Error('Twilio credentials not configured. Go to Settings to add them.')
  }

  const { registerBrand } = await import('@/lib/services/twilio')

  // Register brand
  const brandResult = await registerBrand(
    twilioAccountSid,
    twilioAuthToken,
    {
      brandName: formData.brandName,
      ein: formData.ein,
      vertical: formData.vertical,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      websiteUrl: formData.websiteUrl,
    }
  )

  // Store registration data
  await supabase
    .from('campaigns')
    .update({
      ten_dlc_status: 'pending',
      ten_dlc_brand_sid: brandResult.brandSid,
      ten_dlc_data: formData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', campaignId)
    .eq('owner_id', user.id)

  revalidatePath(`/dashboard/campaigns/${campaignId}`)
  return brandResult
}

export async function deleteCampaign(campaignId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', campaignId)
    .eq('owner_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
