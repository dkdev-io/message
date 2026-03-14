'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function saveScript(campaignId: string, body: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get current max version
  const { data: existing } = await supabase
    .from('script_versions')
    .select('version')
    .eq('campaign_id', campaignId)
    .order('version', { ascending: false })
    .limit(1)

  const nextVersion = existing && existing.length > 0 ? existing[0].version + 1 : 1

  // Deactivate previous versions
  await supabase
    .from('script_versions')
    .update({ is_active: false })
    .eq('campaign_id', campaignId)

  // Insert new version
  const { error } = await supabase
    .from('script_versions')
    .insert({
      campaign_id: campaignId,
      body,
      version: nextVersion,
      is_active: true,
      created_by: user.id,
    })

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/campaigns/${campaignId}`)
}
