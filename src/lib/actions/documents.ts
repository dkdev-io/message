'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function uploadDocument(
  campaignId: string,
  name: string,
  content: string,
  docType: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (!name.trim()) throw new Error('Document name is required.')
  if (!content.trim()) throw new Error('Document content is required.')
  if (!['pdf', 'docx', 'txt', 'paste'].includes(docType)) {
    throw new Error('Invalid document type.')
  }

  const { data, error } = await supabase
    .from('campaign_documents')
    .insert({
      campaign_id: campaignId,
      name: name.trim(),
      content: content.trim(),
      doc_type: docType,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/campaigns/${campaignId}`)
  return data
}

export async function getDocuments(campaignId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('campaign_documents')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function deleteDocument(docId: string, campaignId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('campaign_documents')
    .delete()
    .eq('id', docId)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/campaigns/${campaignId}`)
}
