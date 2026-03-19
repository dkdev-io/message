import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { processOptOut } from '@/lib/services/compliance'

export async function POST(request: Request) {
  const formData = await request.formData()
  const from = formData.get('From') as string
  const to = formData.get('To') as string
  const body = formData.get('Body') as string
  const messageSid = formData.get('MessageSid') as string

  if (!from || !body) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Use service role for webhook processing
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  // Check for STOP/opt-out keywords
  const optOutKeywords = ['stop', 'unsubscribe', 'cancel', 'end', 'quit']
  if (optOutKeywords.includes(body.trim().toLowerCase())) {
    await processOptOut(from, supabase)

    // Mark voter as opted out across all campaigns
    await supabase
      .from('voters')
      .update({ opted_out: true })
      .eq('phone', from)

    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>You have been unsubscribed. Reply START to re-subscribe.</Message></Response>',
      { headers: { 'Content-Type': 'text/xml' } }
    )
  }

  // Find the voter and campaign this message belongs to
  const { data: voter } = await supabase
    .from('voters')
    .select('id, campaign_id')
    .eq('phone', from)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (voter) {
    const { data: insertedMsg } = await supabase.from('messages').insert({
      campaign_id: voter.campaign_id,
      voter_id: voter.id,
      direction: 'inbound',
      status: 'received',
      body,
      twilio_sid: messageSid,
    }).select('id').single()

    // Categorize reply in background (fire-and-forget)
    if (insertedMsg) {
      import('@/lib/services/ai').then(({ categorizeReply }) => {
        categorizeReply(body).then((result) => {
          supabase.from('messages').update({
            category: result.category,
            sentiment: result.sentiment,
            ai_confidence: result.confidence,
          }).eq('id', insertedMsg.id).then(() => {})
        }).catch((err) => {
          console.error('Reply categorization failed:', err)
        })
      })
    }
  }

  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    { headers: { 'Content-Type': 'text/xml' } }
  )
}
