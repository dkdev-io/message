import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import InboxView from '@/components/dashboard/InboxView'

interface InboxPageProps {
  params: Promise<{ id: string }>
}

export default async function InboxPage({ params }: InboxPageProps) {
  const { id: campaignId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Load campaign
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, name')
    .eq('id', campaignId)
    .single()

  if (!campaign) redirect('/dashboard')

  // Load voters for this campaign with their latest message
  const { data: voters } = await supabase
    .from('voters')
    .select('id, first_name, last_name, phone')
    .eq('campaign_id', campaignId)
    .order('last_name', { ascending: true })

  // Load all messages for this campaign
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true })

  // Load response branches for this campaign
  const { data: branches } = await supabase
    .from('response_branches')
    .select('id, label, keywords, response_body')
    .eq('campaign_id', campaignId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  return (
    <div className="-m-6 flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-6 py-4 border-b border-[var(--color-muted)]/20">
        <h1 className="font-display text-2xl text-[var(--color-text)]">
          {campaign.name} — INBOX
        </h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <InboxView
          campaignId={campaignId}
          initialMessages={messages || []}
          voters={voters || []}
          branches={branches || []}
        />
      </div>
    </div>
  )
}
