import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { processVoterUpload } from '@/lib/services/voter-upload'
import * as XLSX from 'xlsx'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File
  const campaignId = formData.get('campaignId') as string

  if (!file || !campaignId) {
    return NextResponse.json({ error: 'File and campaignId are required' }, { status: 400 })
  }

  // Verify campaign ownership
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id')
    .eq('id', campaignId)
    .eq('owner_id', user.id)
    .single()

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
  }

  // Fetch Twilio credentials for phone type lookup
  const { data: profile } = await supabase
    .from('profiles')
    .select('twilio_account_sid, twilio_auth_token')
    .eq('id', user.id)
    .single()

  const accountSid = profile?.twilio_account_sid || process.env.TWILIO_ACCOUNT_SID
  const authToken = profile?.twilio_auth_token || process.env.TWILIO_AUTH_TOKEN
  const twilioCredentials = accountSid && authToken
    ? { accountSid, authToken }
    : undefined

  try {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]) as Array<Record<string, unknown>>

    // Normalize column names to snake_case
    const normalizedRows = rows.map((row) => {
      const normalized: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(row)) {
        const normalizedKey = key
          .toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '')
        normalized[normalizedKey] = value
      }
      return normalized
    })

    const result = await processVoterUpload(normalizedRows as { phone: string; [key: string]: unknown }[], campaignId, supabase, twilioCredentials)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process file' },
      { status: 500 }
    )
  }
}
