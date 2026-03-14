import Link from 'next/link'
import { Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*, voters(count), messages(count)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-[var(--color-text)]">CAMPAIGNS</h1>
        <Link
          href="/dashboard/campaigns/new"
          className="flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg px-4 py-2.5 font-display text-lg transition-colors"
        >
          <Plus size={18} />
          NEW CAMPAIGN
        </Link>
      </div>

      {!campaigns || campaigns.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4 opacity-20">📱</div>
          <h2 className="font-display text-2xl text-[var(--color-text)] mb-2">NO CAMPAIGNS YET</h2>
          <p className="text-[var(--color-muted)] mb-6">Create your first campaign to start reaching voters.</p>
          <Link
            href="/dashboard/campaigns/new"
            className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg px-6 py-3 font-display text-lg transition-colors"
          >
            <Plus size={18} />
            CREATE CAMPAIGN
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Link
              key={campaign.id}
              href={`/dashboard/campaigns/${campaign.id}`}
              className="block bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-muted)]/20 hover:border-[var(--color-accent)]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl text-[var(--color-text)]">{campaign.name}</h3>
                  {campaign.description && (
                    <p className="text-sm text-[var(--color-muted)] mt-1">{campaign.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-[var(--color-muted)]">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    campaign.status === 'active' ? 'bg-green-500/10 text-green-500' :
                    campaign.status === 'paused' ? 'bg-yellow-500/10 text-yellow-500' :
                    campaign.status === 'completed' ? 'bg-[var(--color-muted)]/10 text-[var(--color-muted)]' :
                    'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                  }`}>
                    {campaign.status.toUpperCase()}
                  </span>
                  <span>{campaign.voters?.[0]?.count ?? 0} voters</span>
                  <span>{campaign.messages?.[0]?.count ?? 0} messages</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
