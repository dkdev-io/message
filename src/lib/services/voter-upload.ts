import type { SupabaseClient } from '@supabase/supabase-js'
import { hashPhone } from './compliance'

interface UploadResult {
  total: number
  inserted: number
  duplicates: number
  invalidPhones: number
  optedOut: number
  errors: string[]
}

interface VoterRow {
  first_name?: string
  last_name?: string
  phone: string
  state?: string
  county?: string
  precinct?: string
  party?: string
  [key: string]: unknown
}

function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

export async function processVoterUpload(
  rows: VoterRow[],
  campaignId: string,
  supabase: SupabaseClient
): Promise<UploadResult> {
  const result: UploadResult = {
    total: rows.length,
    inserted: 0,
    duplicates: 0,
    invalidPhones: 0,
    optedOut: 0,
    errors: [],
  }

  // Get all opt-outs for batch checking
  const { data: optOuts } = await supabase
    .from('global_opt_outs')
    .select('phone_hash')

  const optOutSet = new Set(optOuts?.map((o) => o.phone_hash) || [])

  const votersToInsert: Array<{
    campaign_id: string
    first_name: string | null
    last_name: string | null
    phone: string
    state: string | null
    county: string | null
    precinct: string | null
    party: string | null
    custom_fields: Record<string, unknown>
  }> = []

  const seenPhones = new Set<string>()

  for (const row of rows) {
    if (!row.phone) {
      result.invalidPhones++
      continue
    }

    const phone = normalizePhone(String(row.phone))
    if (!phone) {
      result.invalidPhones++
      continue
    }

    if (seenPhones.has(phone)) {
      result.duplicates++
      continue
    }
    seenPhones.add(phone)

    // Check opt-out
    if (optOutSet.has(hashPhone(phone))) {
      result.optedOut++
      continue
    }

    const knownFields = ['first_name', 'last_name', 'phone', 'state', 'county', 'precinct', 'party']
    const customFields: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(row)) {
      if (!knownFields.includes(key) && value !== undefined && value !== null && value !== '') {
        customFields[key] = value
      }
    }

    votersToInsert.push({
      campaign_id: campaignId,
      first_name: row.first_name || null,
      last_name: row.last_name || null,
      phone,
      state: row.state || null,
      county: row.county || null,
      precinct: row.precinct || null,
      party: row.party || null,
      custom_fields: customFields,
    })
  }

  // Batch insert with conflict handling
  if (votersToInsert.length > 0) {
    const batchSize = 500
    for (let i = 0; i < votersToInsert.length; i += batchSize) {
      const batch = votersToInsert.slice(i, i + batchSize)
      const { data, error } = await supabase
        .from('voters')
        .upsert(batch, { onConflict: 'campaign_id,phone', ignoreDuplicates: true })
        .select('id')

      if (error) {
        result.errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`)
      } else {
        result.inserted += data?.length || 0
      }
    }

    result.duplicates += votersToInsert.length - result.inserted
  }

  return result
}
