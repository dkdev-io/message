'use client'

import { useState, useTransition } from 'react'
import { Rocket, AlertTriangle, CheckCircle } from 'lucide-react'
import { launchCampaign } from '@/lib/actions/campaigns'

interface CampaignLauncherProps {
  campaignId: string
  eligibleCount: number
  activeScriptPreview: string | null
  campaignStatus: string
}

export default function CampaignLauncher({
  campaignId,
  eligibleCount,
  activeScriptPreview,
  campaignStatus,
}: CampaignLauncherProps) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)
  const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null)
  const [error, setError] = useState('')

  const canLaunch = eligibleCount > 0 && activeScriptPreview && campaignStatus !== 'completed'

  function handleLaunch() {
    setError('')
    setResult(null)
    startTransition(async () => {
      try {
        const res = await launchCampaign(campaignId)
        setResult(res)
        setShowConfirm(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Launch failed')
        setShowConfirm(false)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--color-text)]">
            <span className="font-medium">{eligibleCount}</span> eligible voters (mobile + VoIP)
          </p>
          {activeScriptPreview && (
            <p className="text-xs text-[var(--color-muted)] mt-1 truncate max-w-md">
              Script: &ldquo;{activeScriptPreview.slice(0, 80)}...&rdquo;
            </p>
          )}
        </div>
      </div>

      {!canLaunch && (
        <p className="text-xs text-[var(--color-muted)]">
          {!activeScriptPreview ? 'Create an active script before launching.' : eligibleCount === 0 ? 'Upload voters with mobile/VoIP numbers.' : 'Campaign is completed.'}
        </p>
      )}

      {result && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-500 text-sm">
          <CheckCircle size={16} />
          Sent {result.sent} of {result.total} messages.{result.failed > 0 && ` ${result.failed} failed.`}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {isPending && (
        <div className="space-y-2">
          <p className="text-sm text-[var(--color-accent)]">Sending messages...</p>
          <div className="h-2 rounded-full bg-[var(--color-muted)]/10 overflow-hidden">
            <div className="h-full bg-[var(--color-accent)] rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      )}

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          disabled={!canLaunch || isPending}
          className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2.5 text-sm font-display transition-colors"
        >
          <Rocket size={14} />
          LAUNCH CAMPAIGN
        </button>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5">
          <AlertTriangle size={18} className="text-yellow-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--color-text)]">
              Send initial script to {eligibleCount} voters?
            </p>
            <p className="text-xs text-[var(--color-muted)] mt-1">This will send SMS messages and incur Twilio charges.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLaunch}
              disabled={isPending}
              className="px-3 py-1.5 text-sm bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isPending ? 'Sending...' : 'Confirm Launch'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
