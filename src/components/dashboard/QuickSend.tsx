'use client'

import { useState, useTransition } from 'react'
import { Send, Mail, CheckCircle, AlertTriangle } from 'lucide-react'
import { quickSend, sendCampaignInfoEmail } from '@/lib/actions/messages'

interface QuickSendProps {
  campaignId: string
  activeScript: string | null
}

export default function QuickSend({ campaignId, activeScript }: QuickSendProps) {
  const [mode, setMode] = useState<'sms' | 'email'>('sms')
  const [input, setInput] = useState('')
  const [body, setBody] = useState(activeScript || '')
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null)
  const [error, setError] = useState('')

  function handleSend() {
    setError('')
    setResult(null)

    const items = input
      .split(/[,\n]+/)
      .map((s) => s.trim())
      .filter(Boolean)

    if (items.length === 0) {
      setError(mode === 'sms' ? 'Enter at least one phone number.' : 'Enter at least one email.')
      return
    }

    startTransition(async () => {
      try {
        if (mode === 'sms') {
          if (!body.trim()) { setError('Message body is required.'); return }
          const res = await quickSend(campaignId, items, body)
          setResult(res)
        } else {
          const res = await sendCampaignInfoEmail(campaignId, items)
          setResult(res)
        }
        setInput('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Send failed')
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex gap-1 bg-[var(--color-muted)]/10 rounded-lg p-1 w-fit">
        <button
          onClick={() => { setMode('sms'); setResult(null); setError('') }}
          className={`px-3 py-1.5 text-xs font-display rounded-md transition-colors ${
            mode === 'sms' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          SMS
        </button>
        <button
          onClick={() => { setMode('email'); setResult(null); setError('') }}
          className={`px-3 py-1.5 text-xs font-display rounded-md transition-colors ${
            mode === 'email' ? 'bg-[var(--color-accent)] text-white' : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          EMAIL
        </button>
      </div>

      {/* Input */}
      <div>
        <label className="text-xs text-[var(--color-muted)] mb-1 block">
          {mode === 'sms' ? 'Phone number(s) — comma-separated or one per line' : 'Email address(es) — comma-separated or one per line'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'sms' ? '555-123-4567, 555-987-6543' : 'voter@example.com, volunteer@example.com'}
          rows={2}
          className="w-full bg-[var(--color-bg)] border border-[var(--color-muted)]/20 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]/50 focus:outline-none focus:border-[var(--color-accent)] resize-none"
        />
      </div>

      {/* Message body (SMS only) */}
      {mode === 'sms' && (
        <div>
          <label className="text-xs text-[var(--color-muted)] mb-1 block">
            Message body
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            maxLength={1600}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-muted)]/20 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
          />
          <p className="text-xs text-[var(--color-muted)] text-right mt-1">{body.length}/1600</p>
        </div>
      )}

      {/* Feedback */}
      {result && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-500 text-sm">
          <CheckCircle size={16} />
          Sent {result.sent}.{result.failed > 0 && ` ${result.failed} failed.`}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={isPending}
        className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-display transition-colors"
      >
        {mode === 'sms' ? <Send size={14} /> : <Mail size={14} />}
        {isPending ? 'SENDING...' : mode === 'sms' ? 'SEND SMS' : 'SEND EMAIL'}
      </button>
    </div>
  )
}
