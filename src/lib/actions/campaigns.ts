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
