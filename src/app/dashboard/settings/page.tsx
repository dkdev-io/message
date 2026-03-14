import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsForm from '@/components/dashboard/SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('twilio_account_sid, twilio_auth_token, twilio_phone_number')
    .eq('id', user.id)
    .single()

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--color-text)] mb-8">SETTINGS</h1>
      <SettingsForm
        initialSettings={{
          twilio_account_sid: profile?.twilio_account_sid ?? '',
          twilio_auth_token: profile?.twilio_auth_token ?? '',
          twilio_phone_number: profile?.twilio_phone_number ?? '',
        }}
      />
    </div>
  )
}
