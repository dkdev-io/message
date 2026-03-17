'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { checkCompliance } from '@/lib/services/compliance'
import { sendSms } from '@/lib/services/twilio'

export async function sendMessage(campaignId: string, voterId: string, body: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get voter
  const { data: voter } = await supabase
    .from('voters')
    .select('*')
    .eq('id', voterId)
    .single()

  if (!voter) throw new Error('Voter not found')

  // Get campaign owner's Twilio creds
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*, profiles!inner(twilio_account_sid, twilio_auth_token, twilio_phone_number)')
    .eq('id', campaignId)
    .single()

  if (!campaign) throw new Error('Campaign not found')

  const profile = Array.isArray(campaign.profiles) ? campaign.profiles[0] : campaign.profiles
  const msgAccountSid = profile?.twilio_account_sid || process.env.TWILIO_ACCOUNT_SID
  const msgAuthToken = profile?.twilio_auth_token || process.env.TWILIO_AUTH_TOKEN
  const msgPhoneNumber = profile?.twilio_phone_number || process.env.TWILIO_PHONE_NUMBER
  if (!msgAccountSid || !msgAuthToken || !msgPhoneNumber) {
    throw new Error('Twilio credentials not configured. Go to Settings to add them.')
  }

  // Compliance check (includes phone type filtering)
  const complianceResult = await checkCompliance(voter.phone, voter.state, supabase, voter.phone_type)
  if (!complianceResult.allowed) {
    throw new Error(`Message blocked: ${complianceResult.reason}`)
  }

  // Create message record
  const { data: message, error: msgError } = await supabase
    .from('messages')
    .insert({
      campaign_id: campaignId,
      voter_id: voterId,
      volunteer_id: user.id,
      direction: 'outbound',
      status: 'queued',
      body,
    })
    .select()
    .single()

  if (msgError) throw new Error(msgError.message)

  // Send via Twilio
  try {
    const twilioResult = await sendSms({
      accountSid: msgAccountSid,
      authToken: msgAuthToken,
      from: msgPhoneNumber,
      to: voter.phone,
      body,
      statusCallback: process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/message/api/webhooks/twilio/status`
        : undefined,
    })

    await supabase
      .from('messages')
      .update({
        status: 'sent',
        twilio_sid: twilioResult.sid,
        sent_at: new Date().toISOString(),
      })
      .eq('id', message.id)
  } catch (error) {
    await supabase
      .from('messages')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', message.id)

    throw error
  }

  revalidatePath(`/dashboard/campaigns/${campaignId}/inbox`)
}

export async function quickSend(campaignId: string, phones: string[], body: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get campaign with Twilio creds
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*, profiles!inner(twilio_account_sid, twilio_auth_token, twilio_phone_number)')
    .eq('id', campaignId)
    .single()

  if (!campaign) throw new Error('Campaign not found')

  const profile = Array.isArray(campaign.profiles) ? campaign.profiles[0] : campaign.profiles
  const qsAccountSid = profile?.twilio_account_sid || process.env.TWILIO_ACCOUNT_SID
  const qsAuthToken = profile?.twilio_auth_token || process.env.TWILIO_AUTH_TOKEN
  const qsPhoneNumber = profile?.twilio_phone_number || process.env.TWILIO_PHONE_NUMBER
  if (!qsAccountSid || !qsAuthToken || !qsPhoneNumber) {
    throw new Error('Twilio credentials not configured.')
  }

  let sent = 0
  let failed = 0

  for (const rawPhone of phones) {
    const digits = rawPhone.replace(/\D/g, '')
    let phone: string
    if (digits.length === 10) phone = `+1${digits}`
    else if (digits.length === 11 && digits.startsWith('1')) phone = `+${digits}`
    else { failed++; continue }

    // Upsert voter if not exists
    const { data: voter } = await supabase
      .from('voters')
      .upsert(
        { campaign_id: campaignId, phone, first_name: null, last_name: null },
        { onConflict: 'campaign_id,phone', ignoreDuplicates: false }
      )
      .select('id, phone, state, phone_type')
      .single()

    if (!voter) { failed++; continue }

    // Compliance check
    const complianceResult = await checkCompliance(voter.phone, voter.state, supabase, voter.phone_type)
    if (!complianceResult.allowed) { failed++; continue }

    // Create and send
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

    try {
      const twilioResult = await sendSms({
        accountSid: qsAccountSid,
        authToken: qsAuthToken,
        from: qsPhoneNumber,
        to: voter.phone,
        body,
        statusCallback: process.env.NEXT_PUBLIC_APP_URL
          ? `${process.env.NEXT_PUBLIC_APP_URL}/message/api/webhooks/twilio/status`
          : undefined,
      })

      await supabase
        .from('messages')
        .update({ status: 'sent', twilio_sid: twilioResult.sid, sent_at: new Date().toISOString() })
        .eq('id', message!.id)

      sent++
    } catch {
      await supabase
        .from('messages')
        .update({ status: 'failed', error_message: 'Send failed' })
        .eq('id', message!.id)
      failed++
    }
  }

  revalidatePath(`/dashboard/campaigns/${campaignId}/inbox`)
  return { sent, failed }
}

export async function sendCampaignInfoEmail(campaignId: string, emails: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('name, description')
    .eq('id', campaignId)
    .single()

  if (!campaign) throw new Error('Campaign not found')

  // Get active script
  const { data: activeScript } = await supabase
    .from('script_versions')
    .select('body')
    .eq('campaign_id', campaignId)
    .eq('is_active', true)
    .single()

  const { sendEmail } = await import('@/lib/services/email')

  let sent = 0
  let failed = 0

  for (const email of emails) {
    try {
      await sendEmail({
        to: email.trim(),
        subject: `Campaign Info: ${campaign.name}`,
        html: `<h2>${campaign.name}</h2><p>${campaign.description || ''}</p>${activeScript ? `<h3>Script</h3><p>${activeScript.body}</p>` : ''}`,
      })
      sent++
    } catch {
      failed++
    }
  }

  return { sent, failed }
}
