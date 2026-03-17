import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Pencil, Trash2, Play, Pause, CheckCircle, FileText, Users, MessageSquare, GitBranch, FolderOpen, Rocket, Send, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { updateCampaignStatus } from '@/lib/actions/campaigns'
import DeleteCampaignButton from '@/components/dashboard/DeleteCampaignButton'
import CampaignDocuments from '@/components/dashboard/CampaignDocuments'
import ScriptEditor from '@/components/dashboard/ScriptEditor'
import ResponseBranches from '@/components/dashboard/ResponseBranches'
import VoterUpload from '@/components/dashboard/VoterUpload'
import VoterAnalysis from '@/components/dashboard/VoterAnalysis'
import CampaignLauncher from '@/components/dashboard/CampaignLauncher'
import QuickSend from '@/components/dashboard/QuickSend'
import ScriptPdfExport from '@/components/dashboard/ScriptPdfExport'
import TenDlcSetup from '@/components/dashboard/TenDlcSetup'

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Load campaign with voter and message counts + owner's Twilio creds
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*, voters(count), messages(count), profiles!inner(twilio_account_sid, twilio_auth_token)')
    .eq('id', id)
    .single()

  if (!campaign) notFound()

  const ownerProfile = Array.isArray(campaign.profiles) ? campaign.profiles[0] : campaign.profiles
  const hasTwilioCreds = !!(
    (ownerProfile?.twilio_account_sid && ownerProfile?.twilio_auth_token) ||
    (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  )

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

  // Load response branches
  const { data: responseBranches } = await supabase
    .from('response_branches')
    .select('*')
    .eq('campaign_id', id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Load campaign documents
  const { data: campaignDocuments } = await supabase
    .from('campaign_documents')
    .select('*')
    .eq('campaign_id', id)
    .order('created_at', { ascending: false })

  // Load first 20 voters with phone_type
  const { data: voters } = await supabase
    .from('voters')
    .select('id, first_name, last_name, phone, state, phone_type')
    .eq('campaign_id', id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Get phone type counts for voter analysis
  const { data: allVoterTypes } = await supabase
    .from('voters')
    .select('phone_type')
    .eq('campaign_id', id)

  const phoneTypeCounts = {
    mobile: 0,
    landline: 0,
    voip: 0,
    unknown: 0,
    total: 0,
  }
  if (allVoterTypes) {
    phoneTypeCounts.total = allVoterTypes.length
    for (const v of allVoterTypes) {
      const pt = v.phone_type as keyof typeof phoneTypeCounts
      if (pt in phoneTypeCounts && pt !== 'total') phoneTypeCounts[pt]++
    }
  }

  const voterCount = campaign.voters?.[0]?.count ?? 0
  const messageCount = campaign.messages?.[0]?.count ?? 0
  const eligibleCount = phoneTypeCounts.mobile + phoneTypeCounts.voip

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
  // deleteAction removed — handled by DeleteCampaignButton client component

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
            <DeleteCampaignButton campaignId={id} />
          </div>
        </div>
      </div>

      {/* 10DLC Compliance Registration */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-muted)]/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-[var(--color-accent)]" />
          <h2 className="font-display text-lg text-[var(--color-text)]">10DLC COMPLIANCE</h2>
        </div>
        <TenDlcSetup
          campaignId={id}
          campaignName={campaign.name}
          tenDlcStatus={(campaign as Record<string, unknown>).ten_dlc_status as string | null}
          brandSid={(campaign as Record<string, unknown>).ten_dlc_brand_sid as string | null}
          campaignSid={(campaign as Record<string, unknown>).ten_dlc_campaign_sid as string | null}
          hasTwilioCreds={hasTwilioCreds}
        />
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

      {/* Campaign Launch */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-muted)]/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Rocket size={18} className="text-[var(--color-accent)]" />
          <h2 className="font-display text-lg text-[var(--color-text)]">LAUNCH CAMPAIGN</h2>
        </div>
        <CampaignLauncher
          campaignId={id}
          eligibleCount={eligibleCount}
          activeScriptPreview={activeScript?.body ?? null}
          campaignStatus={campaign.status}
        />
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

      {/* Campaign Documents Section */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-muted)]/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen size={18} className="text-[var(--color-accent)]" />
          <h2 className="font-display text-lg text-[var(--color-text)]">CAMPAIGN DOCUMENTS</h2>
        </div>
        <p className="text-xs text-[var(--color-muted)] mb-4">
          Upload campaign materials to generate AI-powered SMS scripts and response branches.
        </p>
        <CampaignDocuments
          campaignId={id}
          initialDocuments={campaignDocuments ?? []}
        />
      </div>

      {/* Script Section */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-muted)]/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[var(--color-accent)]" />
            <h2 className="font-display text-lg text-[var(--color-text)]">SMS SCRIPT</h2>
          </div>
          <ScriptPdfExport
            campaignName={campaign.name}
            campaignDescription={campaign.description}
            activeScript={activeScript?.body ?? null}
            branches={(responseBranches ?? []).map((b) => ({
              id: b.id,
              label: b.label,
              keywords: b.keywords,
              response_body: b.response_body,
            }))}
          />
        </div>
        <ScriptEditor
          campaignId={id}
          initialScript={activeScript?.body ?? ''}
          versions={versions}
        />
      </div>

      {/* Response Branches Section */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-muted)]/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch size={18} className="text-[var(--color-accent)]" />
          <h2 className="font-display text-lg text-[var(--color-text)]">RESPONSE BRANCHES</h2>
        </div>
        <p className="text-xs text-[var(--color-muted)] mb-4">
          Define suggested responses for volunteers based on voter reply keywords.
        </p>
        <ResponseBranches
          campaignId={id}
          initialBranches={responseBranches ?? []}
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

        {/* Voter Phone Type Analysis */}
        {phoneTypeCounts.total > 0 && (
          <div className="mt-6">
            <VoterAnalysis counts={phoneTypeCounts} />
          </div>
        )}

        {voters && voters.length > 0 && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-muted)]/20">
                  <th className="text-left py-2 px-3 text-xs font-medium text-[var(--color-muted)] uppercase">Name</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-[var(--color-muted)] uppercase">Phone</th>
                  <th className="text-left py-2 px-3 text-xs font-medium text-[var(--color-muted)] uppercase">Type</th>
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
                    <td className="py-2.5 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        voter.phone_type === 'mobile' ? 'bg-green-500/10 text-green-500' :
                        voter.phone_type === 'voip' ? 'bg-blue-500/10 text-blue-500' :
                        voter.phone_type === 'landline' ? 'bg-red-500/10 text-red-500' :
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        {voter.phone_type || 'unknown'}
                      </span>
                    </td>
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

      {/* Quick Send */}
      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-muted)]/20 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Send size={18} className="text-[var(--color-accent)]" />
          <h2 className="font-display text-lg text-[var(--color-text)]">QUICK SEND</h2>
        </div>
        <p className="text-xs text-[var(--color-muted)] mb-4">
          Send an SMS to individual phone numbers or email campaign info directly.
        </p>
        <QuickSend campaignId={id} activeScript={activeScript?.body ?? null} />
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
