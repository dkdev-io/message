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
  if (!profile?.twilio_account_sid || !profile?.twilio_auth_token || !profile?.twilio_phone_number) {
    throw new Error('Twilio credentials not configured. Go to Settings to add them.')
  }

  // Compliance check
  const complianceResult = await checkCompliance(voter.phone, voter.state, supabase)
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
      accountSid: profile.twilio_account_sid,
      authToken: profile.twilio_auth_token,
      from: profile.twilio_phone_number,
      to: voter.phone,
      body,
      statusCallback: `${process.env.NEXT_PUBLIC_SUPABASE_URL ? '' : ''}${process.env.NEXT_PUBLIC_APP_URL || ''}/message/api/webhooks/twilio/status`,
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
