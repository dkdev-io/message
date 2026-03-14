'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function getBranches(campaignId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('response_branches')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function saveBranch(
  campaignId: string,
  branch: { label: string; keywords: string[]; responseBody: string; sortOrder: number }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('response_branches')
    .insert({
      campaign_id: campaignId,
      label: branch.label,
      keywords: branch.keywords,
      response_body: branch.responseBody,
      sort_order: branch.sortOrder,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/campaigns/${campaignId}`)
  return data
}

export async function updateBranch(
  branchId: string,
  campaignId: string,
  data: { label?: string; keywords?: string[]; responseBody?: string; sortOrder?: number }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.label !== undefined) updatePayload.label = data.label
  if (data.keywords !== undefined) updatePayload.keywords = data.keywords
  if (data.responseBody !== undefined) updatePayload.response_body = data.responseBody
  if (data.sortOrder !== undefined) updatePayload.sort_order = data.sortOrder

  const { error } = await supabase
    .from('response_branches')
    .update(updatePayload)
    .eq('id', branchId)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/campaigns/${campaignId}`)
}

export async function deleteBranch(branchId: string, campaignId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('response_branches')
    .delete()
    .eq('id', branchId)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/campaigns/${campaignId}`)
}
