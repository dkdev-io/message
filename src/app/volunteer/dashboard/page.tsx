import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Inbox, MessageSquare } from 'lucide-react'

export default async function VolunteerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: assignments } = await supabase
    .from('volunteer_assignments')
    .select(`
      id,
      is_active,
      campaigns(
        id,
        name,
        description,
        status
      )
    `)
    .eq('volunteer_id', user.id)
    .eq('is_active', true)

  // Get message counts per campaign
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const campaignIds = (assignments || [])
    .map((a: any) => {
      const c = Array.isArray(a.campaigns) ? a.campaigns[0] : a.campaigns
      return c?.id
    })
    .filter(Boolean)

  let messageCounts: Record<string, number> = {}
  if (campaignIds.length > 0) {
    const { data: counts } = await supabase
      .from('messages')
      .select('campaign_id')
      .eq('volunteer_id', user.id)
      .eq('direction', 'outbound')
      .in('campaign_id', campaignIds)

    if (counts) {
      messageCounts = counts.reduce((acc: Record<string, number>, msg: { campaign_id: string }) => {
        acc[msg.campaign_id] = (acc[msg.campaign_id] || 0) + 1
        return acc
      }, {})
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl text-[var(--color-text)] mb-8">VOLUNTEER DASHBOARD</h1>

        {!assignments || assignments.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare size={48} className="mx-auto mb-4 text-[var(--color-muted)] opacity-30" />
            <h2 className="font-display text-2xl text-[var(--color-text)] mb-2">NO CAMPAIGNS ASSIGNED</h2>
            <p className="text-[var(--color-muted)]">
              Ask your campaign organizer for an invite link to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {assignments.map((assignment: any) => {
              const campaign = Array.isArray(assignment.campaigns) ? assignment.campaigns[0] : assignment.campaigns
              if (!campaign) return null

              const sentCount = messageCounts[campaign.id] || 0

              return (
                <div
                  key={assignment.id}
                  className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-muted)]/20"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-xl text-[var(--color-text)]">{campaign.name}</h3>
                      {campaign.description && (
                        <p className="text-sm text-[var(--color-muted)] mt-1">{campaign.description}</p>
                      )}
                      <p className="text-sm text-[var(--color-muted)] mt-2">
                        {sentCount} message{sentCount !== 1 ? 's' : ''} sent
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'active' ? 'bg-green-500/10 text-green-500' :
                        campaign.status === 'paused' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-[var(--color-muted)]/10 text-[var(--color-muted)]'
                      }`}>
                        {campaign.status.toUpperCase()}
                      </span>
                      <Link
                        href={`/dashboard/campaigns/${campaign.id}/inbox`}
                        className="flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg px-4 py-2 text-sm font-display transition-colors"
                      >
                        <Inbox size={16} />
                        INBOX
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
