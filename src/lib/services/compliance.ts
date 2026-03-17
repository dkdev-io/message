import { createHash } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

interface ComplianceResult {
  allowed: boolean
  reason?: string
}

export function hashPhone(phone: string): string {
  const normalized = phone.replace(/\D/g, '')
  return createHash('sha256').update(normalized).digest('hex')
}

export async function checkCompliance(
  phone: string,
  state: string | null,
  supabase: SupabaseClient,
  phoneType?: string | null
): Promise<ComplianceResult> {
  // Block landline numbers from SMS
  if (phoneType === 'landline') {
    return { allowed: false, reason: 'Cannot send SMS to landline numbers.' }
  }

  // Check global opt-out
  const phoneHash = hashPhone(phone)
  const { data: optOut } = await supabase
    .from('global_opt_outs')
    .select('phone_hash')
    .eq('phone_hash', phoneHash)
    .single()

  if (optOut) {
    return { allowed: false, reason: 'Recipient has opted out of all messages.' }
  }

  // Check quiet hours
  const stateCode = state?.toUpperCase() || 'DEFAULT'
  const { data: quietHours } = await supabase
    .from('quiet_hours')
    .select('*')
    .eq('state_code', stateCode)
    .single()

  const rules = quietHours || (await supabase
    .from('quiet_hours')
    .select('*')
    .eq('state_code', 'DEFAULT')
    .single()).data

  if (rules) {
    // Get current time in the state's timezone
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      hour12: false,
      timeZone: rules.timezone,
    })
    const currentHour = parseInt(formatter.format(now))

    // Check if within quiet hours (e.g., 21-8 means quiet from 9pm to 8am)
    if (rules.start_hour > rules.end_hour) {
      // Spans midnight
      if (currentHour >= rules.start_hour || currentHour < rules.end_hour) {
        return {
          allowed: false,
          reason: `Quiet hours in ${rules.state_name}: ${rules.start_hour}:00–${rules.end_hour}:00 (${rules.timezone}). Source: ${rules.source}`,
        }
      }
    } else {
      if (currentHour >= rules.start_hour && currentHour < rules.end_hour) {
        return {
          allowed: false,
          reason: `Quiet hours in ${rules.state_name}: ${rules.start_hour}:00–${rules.end_hour}:00 (${rules.timezone}). Source: ${rules.source}`,
        }
      }
    }
  }

  return { allowed: true }
}

export async function processOptOut(phone: string, supabase: SupabaseClient): Promise<void> {
  const phoneHash = hashPhone(phone)
  await supabase
    .from('global_opt_outs')
    .upsert({ phone_hash: phoneHash })
}
