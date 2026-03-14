'use client'

import { useState, useTransition } from 'react'
import { sendMessage } from '@/lib/actions/messages'
import { Send, Loader2 } from 'lucide-react'

const MAX_CHARS = 1600

interface ComposeBoxProps {
  campaignId: string
  voterId: string
  onSent: () => void
}

export default function ComposeBox({ campaignId, voterId, onSent }: ComposeBoxProps) {
  const [body, setBody] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const charCount = body.length
  const isOverLimit = charCount > MAX_CHARS

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim() || isOverLimit || isPending) return
    setError(null)

    startTransition(async () => {
      try {
        await sendMessage(campaignId, voterId, body.trim())
        setBody('')
        onSent()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message.')
      }
    })
  }

  return (
    <div className="border-t border-[var(--color-muted)]/20 px-4 py-3">
      {error && (
        <p className="text-xs text-red-500 mb-2">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type a message..."
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            className="w-full rounded-xl bg-[var(--color-surface)] border border-[var(--color-muted)]/20 px-4 py-2.5 pr-16 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] transition resize-none"
            style={{ minHeight: '40px', maxHeight: '120px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`
            }}
          />
          <span className={`absolute bottom-1.5 right-3 text-xs ${
            isOverLimit ? 'text-red-500' : 'text-[var(--color-muted)]'
          }`}>
            {charCount}/{MAX_CHARS}
          </span>
        </div>
        <button
          type="submit"
          disabled={!body.trim() || isOverLimit || isPending}
          className="shrink-0 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-xl p-2.5 transition-colors disabled:opacity-50"
        >
          {isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  )
}
