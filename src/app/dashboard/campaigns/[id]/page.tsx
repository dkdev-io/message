import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2, Play, Pause, CheckCircle, FileText, Users, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { updateCampaignStatus, deleteCampaign } from '@/lib/actions/campaigns'
import ScriptEditor from '@/components/dashboard/ScriptEditor'
import VoterUpload from '@/components/dashboard/VoterUpload'

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Load campaign with voter and message counts
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*, voters(count), messages(count)')
    .eq('id', id)
    .single()

  if (!campaign) notFound()

  // Load active script and all versions
  const { data: scriptVersions } = await supabase
    .from('script_versions')
    .select('version, body, created_at, is_active')
    .eq('campaign_id', id)
    .order('version', { ascending: false })

  const activeScript = scriptVersions?.find((s) => s.is_active)
  const versions = (scriptVersions ?? []).map(({ version, body, created_at }) => ({
    version,
    body,
    created_at,
  }))

  // Load first 20 voters
  const { data: voters } = await supabase
    .from('voters')
    .select('id, first_name, last_name, phone, state')
    .eq('campaign_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  const voterCount = campaign.voters?.[0]?.count ?? 0
  const messageCount = campaign.messages?.[0]?.count ?? 0

  const statusBadgeClass =
    campaign.status === 'active'
      ? 'bg-green-500/10 text-green-500'
      : campaign.status === 'paused'
        ? 'bg-yellow-500/10 text-yellow-500'
        : campaign.status === 'completed'
          ? 'bg-[var(--color-muted)]/10 text-[var(--color-muted)]'
          : 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'

  // Bind server actions
  const activateAction = updateCampaignStatus.bind(null, id, 'active')
  const pauseAction = updateCampaignStatus.bind(null, id, 'paused')
  const completeAction = updateCampaignStatus.bind(null, id, 'completed')
  const deleteAction = deleteCampaign.bind(null, id)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back to Dashboard</span>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-3xl text-[var(--color-text)]">{campaign.name}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadgeClass}`}>
                {campaign.status.toUpperCase()}
              </span>
            </div>
            {campaign.description && (
              <p className="text-[var(--color-muted)] text-sm">{campaign.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/campaigns/${id}/edit`}
              className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-text)] border border-[var(--color-muted)]/30 rounded-lg px-3 py-2 text-sm transition-colors"
            >
              <Pencil size={14} />
              Edit
            </Link>
            <form action={deleteAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 border border-red-500/30 hover:border-red-500/50 rounded-lg px-3 py-2 text-sm transition-colors"
                onClick={(e) => {
                  if (!confirm('Are you sure you want to delete this campaign? This cannot be undone.')) {
                    e.preventDefault()
                  }
                }}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Status Controls */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-muted)]/20 p-6">
        <h2 className="font-display text-lg text-[var(--color-text)] mb-4">STATUS CONTROLS</h2>
        <div className="flex items-center gap-3">
          {campaign.status !== 'active' && (
            <form action={activateAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2.5 text-sm font-display transition-colors"
              >
                <Play size={14} />
                ACTIVATE
              </button>
            </form>
          )}
          {campaign.status !== 'paused' && campaign.status !== 'completed' && (
            <form action={pauseAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg px-4 py-2.5 text-sm font-display transition-colors"
              >
                <Pause size={14} />
                PAUSE
              </button>
            </form>
          )}
          {campaign.status !== 'completed' && (
            <form action={completeAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-2 border border-[var(--color-muted)]/30 text-[var(--color-muted)] hover:text-[var(--color-text)] rounded-lg px-4 py-2.5 text-sm font-display transition-colors"
              >
                <CheckCircle size={14} />
                COMPLETE
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-muted)]/20 p-6 text-center">
          <Users size={22} className="mx-auto mb-2 text-[var(--color-accent)]" />
          <p className="font-display text-2xl text-[var(--color-text)]">{voterCount}</p>
          <p className="text-xs text-[var(--color-muted)]">Voters</p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-muted)]/20 p-6 text-center">
          <MessageSquare size={22} className="mx-auto mb-2 text-[var(--color-accent)]" />
          <p className="font-display text-2xl text-[var(--color-text)]">{messageCount}</p>
          <p className="text-xs text-[var(--color-muted)]">Messages</p>
        </div>
        <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-muted)]/20 p-6 text-center">
          <FileText size={22} className="mx-auto mb-2 text-[var(--color-accent)]" />
          <p className="font-display text-2xl text-[var(--color-text)]">{versions.length}</p>
          <p className="text-xs text-[var(--color-muted)]">Script Versions</p>
        </div>
      </div>

      {/* Script Section */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-muted)]/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={18} className="text-[var(--color-accent)]" />
          <h2 className="font-display text-lg text-[var(--color-text)]">SMS SCRIPT</h2>
        </div>
        <ScriptEditor
          campaignId={id}
          initialScript={activeScript?.body ?? ''}
          versions={versions}
        />
      </div>

      {/* Voters Section */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-muted)]/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[var(--color-accent)]" />
            <h2 className="font-display text-lg text-[var(--color-text)]">VOTERS ({voterCount})</h2>
          </div>
        </div>

        <VoterUpload campaignId={id} />

        {voters && voters.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-muted)]/20">
                  <th className="text-left py-2 px-3 text-xs font-medium text-[var(--color-muted)] uppercase">Name</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-[var(--color-muted)] uppercase">Phone</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-[var(--color-muted)] uppercase">State</th>
                </tr>
              </thead>
              <tbody>
                {voters.map((voter) => (
                  <tr key={voter.id} className="border-b border-[var(--color-muted)]/10 last:border-b-0">
                    <td className="py-2.5 px-3 text-[var(--color-text)]">
                      {voter.first_name} {voter.last_name}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--color-muted)]">{voter.phone}</td>
                    <td className="py-2.5 px-3 text-[var(--color-muted)]">{voter.state ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {voterCount > 20 && (
              <p className="text-xs text-[var(--color-muted)] mt-3 text-center">
                Showing 20 of {voterCount} voters
              </p>
            )}
          </div>
        )}
      </div>

      {/* Messages Section */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-muted)]/20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-[var(--color-accent)]" />
            <h2 className="font-display text-lg text-[var(--color-text)]">MESSAGES ({messageCount})</h2>
          </div>
          <Link
            href={`/dashboard/campaigns/${id}/inbox`}
            className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
          >
            View Inbox
          </Link>
        </div>
      </div>
    </div>
  )
}
