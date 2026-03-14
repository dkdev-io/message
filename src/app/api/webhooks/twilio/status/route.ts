import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: Request) {
  const formData = await request.formData()
  const messageSid = formData.get('MessageSid') as string
  const messageStatus = formData.get('MessageStatus') as string
  const errorCode = formData.get('ErrorCode') as string | null
  const errorMessage = formData.get('ErrorMessage') as string | null

  if (!messageSid || !messageStatus) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  const statusMap: Record<string, string> = {
    queued: 'queued',
    sent: 'sent',
    delivered: 'delivered',
    undelivered: 'failed',
    failed: 'failed',
  }

  const mappedStatus = statusMap[messageStatus] || messageStatus

  await supabase
    .from('messages')
    .update({
      status: mappedStatus,
      error_code: errorCode || null,
      error_message: errorMessage || null,
    })
    .eq('twilio_sid', messageSid)

  return NextResponse.json({ success: true })
}
