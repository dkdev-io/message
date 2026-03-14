'use client'

import { useState, useTransition } from 'react'
import { createInviteToken, revokeInviteToken } from '@/lib/actions/volunteers'
import { Link2, Copy, Check, Trash2, Loader2, Plus } from 'lucide-react'

interface InviteToken {
  id: string
  token: string
  maxUses: number | null
  useCount: number
  expiresAt: string
}

interface InviteLinkGeneratorProps {
  campaignId: string
  campaignName: string
  existingTokens: InviteToken[]
}

export default function InviteLinkGenerator({ campaignId, campaignName, existingTokens }: InviteLinkGeneratorProps) {
  const [tokens, setTokens] = useState<InviteToken[]>(existingTokens)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function getInviteUrl(token: string) {
    return `${window.location.origin}/message/volunteer/join/${token}`
  }

  function handleGenerate() {
    setError(null)
    startTransition(async () => {
      try {
        const data = await createInviteToken(campaignId)
        setTokens((prev) => [
          ...prev,
          {
            id: data.id,
            token: data.token,
            maxUses: data.max_uses,
            useCount: data.use_count,
            expiresAt: data.expires_at,
          },
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create invite link.')
      }
    })
  }

  function handleRevoke(tokenId: string) {
    startTransition(async () => {
      try {
        await revokeInviteToken(tokenId)
        setTokens((prev) => prev.filter((t) => t.id !== tokenId))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to revoke invite link.')
      }
    })
  }

  async function handleCopy(tokenId: string, token: string) {
    try {
      await navigator.clipboard.writeText(getInviteUrl(token))
      setCopiedId(tokenId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // Fallback for non-secure contexts
      const textArea = document.createElement('textarea')
      textArea.value = getInviteUrl(token)
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedId(tokenId)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-[var(--color-muted)] uppercase tracking-wide">
          Invite Links
        </h3>
        <button
          onClick={handleGenerate}
          disabled={isPending}
          className="flex items-center gap-1.5 text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Generate Link
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500 mb-3">{error}</p>
      )}

      {tokens.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)] italic">
          No invite links yet. Generate one to invite volunteers to {campaignName}.
        </p>
      ) : (
        <div className="space-y-2">
          {tokens.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 bg-[var(--color-bg)] rounded-lg px-4 py-3"
            >
              <Link2 size={16} className="text-[var(--color-accent)] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-text)] truncate font-mono">
                  /volunteer/join/{t.token.slice(0, 8)}...
                </p>
                <p className="text-xs text-[var(--color-muted)]">
                  {t.useCount} use{t.useCount !== 1 ? 's' : ''}
                  {t.maxUses ? ` / ${t.maxUses} max` : ''}
                </p>
              </div>
              <button
                onClick={() => handleCopy(t.id, t.token)}
                className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors p-1"
                title="Copy link"
              >
                {copiedId === t.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
              <button
                onClick={() => handleRevoke(t.id)}
                disabled={isPending}
                className="text-red-400 hover:text-red-300 transition-colors p-1 disabled:opacity-50"
                title="Revoke link"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
