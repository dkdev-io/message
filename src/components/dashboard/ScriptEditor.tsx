'use client'

import { useState, useTransition } from 'react'
import { saveScript } from '@/lib/actions/scripts'
import { Save, Clock, ChevronDown, ChevronUp, Check, AlertCircle } from 'lucide-react'

interface ScriptVersion {
  version: number
  body: string
  created_at: string
}

interface ScriptEditorProps {
  campaignId: string
  initialScript: string
  versions: ScriptVersion[]
}

const MAX_CHARS = 1600

export default function ScriptEditor({ campaignId, initialScript, versions }: ScriptEditorProps) {
  const [body, setBody] = useState(initialScript)
  const [showVersions, setShowVersions] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const charCount = body.length
  const isOverLimit = charCount > MAX_CHARS

  function handleSave() {
    if (isOverLimit || !body.trim()) return

    setFeedback(null)
    startTransition(async () => {
      try {
        await saveScript(campaignId, body)
        setFeedback({ type: 'success', message: 'Script saved successfully.' })
      } catch (err) {
        setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save script.' })
      }
    })
  }

  function loadVersion(v: ScriptVersion) {
    setBody(v.body)
    setShowVersions(false)
    setFeedback(null)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => {
            setBody(e.target.value)
            setFeedback(null)
          }}
          rows={8}
          placeholder="Write your SMS script here. Use {first_name} for personalization..."
          className="w-full bg-[var(--color-bg)] border border-[var(--color-muted)]/30 rounded-lg px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] transition-colors resize-none font-mono text-sm"
        />
        <div className={`text-xs text-right mt-1 ${isOverLimit ? 'text-red-500' : 'text-[var(--color-muted)]'}`}>
          {charCount} / {MAX_CHARS} characters
        </div>
      </div>

      {feedback && (
        <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
          feedback.type === 'success'
            ? 'bg-green-500/10 text-green-500'
            : 'bg-red-500/10 text-red-500'
        }`}>
          {feedback.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
          {feedback.message}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isPending || isOverLimit || !body.trim()}
          className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2.5 font-display text-sm transition-colors"
        >
          <Save size={14} />
          {isPending ? 'SAVING...' : 'SAVE SCRIPT'}
        </button>

        {versions.length > 0 && (
          <button
            onClick={() => setShowVersions(!showVersions)}
            className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-text)] text-sm transition-colors"
          >
            <Clock size={14} />
            Version History ({versions.length})
            {showVersions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {showVersions && versions.length > 0 && (
        <div className="border border-[var(--color-muted)]/20 rounded-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto">
            {versions.map((v) => (
              <button
                key={v.version}
                onClick={() => loadVersion(v)}
                className="w-full text-left px-4 py-3 border-b border-[var(--color-muted)]/10 last:border-b-0 hover:bg-[var(--color-muted)]/5 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[var(--color-text)]">
                    Version {v.version}
                  </span>
                  <span className="text-xs text-[var(--color-muted)]">
                    {new Date(v.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-muted)] line-clamp-2">{v.body}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
