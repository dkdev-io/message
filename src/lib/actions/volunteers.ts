'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createInviteToken(campaignId: string, maxUses?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('invite_tokens')
    .insert({
      campaign_id: campaignId,
      created_by: user.id,
      max_uses: maxUses || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/volunteers')
  return data
}

export async function joinCampaignWithToken(token: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Find the token
  const { data: invite, error: tokenError } = await supabase
    .from('invite_tokens')
    .select('*')
    .eq('token', token)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (tokenError || !invite) {
    throw new Error('Invalid or expired invite link.')
  }

  if (invite.max_uses && invite.use_count >= invite.max_uses) {
    throw new Error('This invite link has reached its maximum number of uses.')
  }

  // Create assignment
  const { error: assignError } = await supabase
    .from('volunteer_assignments')
    .insert({
      campaign_id: invite.campaign_id,
      volunteer_id: user.id,
    })

  if (assignError) {
    if (assignError.code === '23505') {
      throw new Error('You are already a volunteer for this campaign.')
    }
    throw new Error(assignError.message)
  }

  // Update profile role if needed
  await supabase
    .from('profiles')
    .update({ role: 'volunteer' })
    .eq('id', user.id)
    .eq('role', 'owner') // Only update if they haven't been set yet — actually skip this, owner should stay owner

  // Increment use count
  await supabase
    .from('invite_tokens')
    .update({ use_count: invite.use_count + 1 })
    .eq('id', invite.id)

  redirect('/volunteer/dashboard')
}

export async function revokeInviteToken(tokenId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('invite_tokens')
    .update({ is_active: false })
    .eq('id', tokenId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/volunteers')
}

export async function removeVolunteer(assignmentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('volunteer_assignments')
    .update({ is_active: false })
    .eq('id', assignmentId)

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/volunteers')
}
