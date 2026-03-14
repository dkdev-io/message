'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { generateScriptSuggestion, generateCampaignScripts } from '@/lib/services/ai'

export async function suggestScript(campaignId: string, instruction: string): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (!instruction.trim()) {
    throw new Error('Please provide an instruction for the AI.')
  }

  // Load campaign details
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('name, description')
    .eq('id', campaignId)
    .single()

  if (campaignError || !campaign) {
    throw new Error('Campaign not found.')
  }

  // Load current active script if any
  const { data: activeScript } = await supabase
    .from('script_versions')
    .select('body')
    .eq('campaign_id', campaignId)
    .eq('is_active', true)
    .limit(1)
    .single()

  const suggestion = await generateScriptSuggestion({
    campaignName: campaign.name,
    campaignDescription: campaign.description ?? '',
    currentScript: activeScript?.body ?? undefined,
    instruction,
  })

  return suggestion
}

export async function generateScriptsFromDocs(
  campaignId: string,
  instruction?: string
): Promise<{
  initialScript: string
  branches: Array<{ label: string; keywords: string[]; responseBody: string }>
}> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Load campaign details
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('name, description')
    .eq('id', campaignId)
    .single()

  if (campaignError || !campaign) {
    throw new Error('Campaign not found.')
  }

  // Load all documents for this campaign
  const { data: documents, error: docError } = await supabase
    .from('campaign_documents')
    .select('name, content')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true })

  if (docError) {
    throw new Error('Failed to load campaign documents.')
  }

  if (!documents || documents.length === 0) {
    throw new Error('No documents uploaded. Please add campaign materials first.')
  }

  // Concatenate all document content
  const documentContent = documents
    .map((doc) => `--- ${doc.name} ---\n${doc.content}`)
    .join('\n\n')

  const result = await generateCampaignScripts({
    campaignName: campaign.name,
    campaignDescription: campaign.description ?? '',
    documentContent,
    instruction: instruction || undefined,
  })

  return result
}
