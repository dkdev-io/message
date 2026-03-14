'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function saveTwilioSettings(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const accountSid = formData.get('twilio_account_sid') as string
  const authToken = formData.get('twilio_auth_token') as string
  const phoneNumber = formData.get('twilio_phone_number') as string

  // Validate credentials with Twilio
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`,
    {
      headers: {
        Authorization: 'Basic ' + btoa(`${accountSid}:${authToken}`),
      },
    }
  )

  if (!response.ok) {
    throw new Error('Invalid Twilio credentials. Please check your Account SID and Auth Token.')
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      twilio_account_sid: accountSid,
      twilio_auth_token: authToken,
      twilio_phone_number: phoneNumber,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/settings')
}
