'use client'

import { useState, useTransition } from 'react'
import { saveBranch, updateBranch, deleteBranch } from '@/lib/actions/branches'
import { Plus, Trash2, Save, Loader2, Check, AlertCircle, GitBranch } from 'lucide-react'

interface Branch {
  id: string
  campaign_id: string
  label: string
  keywords: string[]
  response_body: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface LocalBranch {
  id: string | null
  label: string
  keywords: string
  responseBody: string
  sortOrder: number
  dirty: boolean
}

interface ResponseBranchesProps {
  campaignId: string
  initialBranches: Branch[]
}

const MAX_CHARS = 1600

const DEFAULT_BRANCHES: Omit<LocalBranch, 'id' | 'dirty'>[] = [
  { label: 'Positive / Yes', keywords: 'yes, sure, absolutely, count me in, agree, support, love', responseBody: '', sortOrder: 0 },
  { label: 'Negative / No', keywords: 'no, not interested, stop, remove, disagree, against', responseBody: '', sortOrder: 1 },
  { label: 'Question', keywords: 'what, how, when, where, why, who, can you, tell me, explain', responseBody: '', sortOrder: 2 },
  { label: 'Not Interested', keywords: 'busy, leave me alone, don\'t contact, unsubscribe, opt out', responseBody: '', sortOrder: 3 },
]

function branchToLocal(b: Branch): LocalBranch {
  return {
    id: b.id,
    label: b.label,
    keywords: b.keywords.join(', '),
    responseBody: b.response_body,
    sortOrder: b.sort_order,
    dirty: false,
  }
}

export default function ResponseBranches({ campaignId, initialBranches }: ResponseBranchesProps) {
  const [branches, setBranches] = useState<LocalBranch[]>(
    initialBranches.map(branchToLocal)
  )
  const [isPending, startTransition] = useTransition()
  const [savingId, setSavingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function addBranch() {
    setBranches((prev) => [
      ...prev,
      {
        id: null,
        label: '',
        keywords: '',
        responseBody: '',
        sortOrder: prev.length,
        dirty: true,
      },
    ])
  }

  function updateLocal(index: number, field: keyof LocalBranch, value: string | number) {
    setBranches((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value, dirty: true } : b))
    )
    setFeedback(null)
  }

  function handleSaveBranch(index: number) {
    const branch = branches[index]
    if (!branch.label.trim() || !branch.responseBody.trim()) {
      setFeedback({ type: 'error', message: 'Label and response body are required.' })
      return
    }

    const keywordsArray = branch.keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)

    const tempId = branch.id ?? `temp-${index}`
    setSavingId(tempId)
    setFeedback(null)

    startTransition(async () => {
      try {
        if (branch.id) {
          await updateBranch(branch.id, campaignId, {
            label: branch.label,
            keywords: keywordsArray,
            responseBody: branch.responseBody,
            sortOrder: branch.sortOrder,
          })
          setBranches((prev) =>
            prev.map((b, i) => (i === index ? { ...b, dirty: false } : b))
          )
        } else {
          const saved = await saveBranch(campaignId, {
            label: branch.label,
            keywords: keywordsArray,
            responseBody: branch.responseBody,
            sortOrder: branch.sortOrder,
          })
          setBranches((prev) =>
            prev.map((b, i) => (i === index ? { ...b, id: saved.id, dirty: false } : b))
          )
        }
        setFeedback({ type: 'success', message: `Branch "${branch.label}" saved.` })
      } catch (err) {
        setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to save branch.' })
      } finally {
        setSavingId(null)
      }
    })
  }

  function handleDeleteBranch(index: number) {
    const branch = branches[index]

    if (branch.id) {
      startTransition(async () => {
        try {
          await deleteBranch(branch.id!, campaignId)
          setBranches((prev) => prev.filter((_, i) => i !== index))
          setFeedback({ type: 'success', message: `Branch "${branch.label}" deleted.` })
        } catch (err) {
          setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete branch.' })
        }
      })
    } else {
      setBranches((prev) => prev.filter((_, i) => i !== index))
    }
  }

  function createDefaultBranches() {
    setBranches(
      DEFAULT_BRANCHES.map((d) => ({
        ...d,
        id: null,
        dirty: true,
      }))
    )
  }

  return (
    <div className="space-y-4">
      {branches.length === 0 ? (
        <div className="text-center py-8">
          <GitBranch size={32} className="mx-auto mb-3 text-[var(--color-muted)] opacity-40" />
          <p className="text-sm text-[var(--color-muted)] mb-4">
            No response branches yet. Create default branches to get started.
          </p>
          <button
            onClick={createDefaultBranches}
            className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg px-4 py-2.5 font-display text-sm transition-colors"
          >
            <Plus size={14} />
            CREATE DEFAULT BRANCHES
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {branches.map((branch, index) => {
              const branchKey = branch.id ?? `new-${index}`
              const isSaving = savingId === (branch.id ?? `temp-${index}`)
              const isOverLimit = branch.responseBody.length > MAX_CHARS

              return (
                <div
                  key={branchKey}
                  className="border border-[var(--color-muted)]/20 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] shrink-0" />
                      <input
                        type="text"
                        value={branch.label}
                        onChange={(e) => updateLocal(index, 'label', e.target.value)}
                        placeholder="Branch label (e.g. Positive Response)"
                        className="flex-1 bg-[var(--color-bg)] border border-[var(--color-muted)]/30 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] transition-colors font-display"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteBranch(index)}
                      className="ml-3 text-[var(--color-muted)] hover:text-red-500 transition-colors"
                      title="Delete branch"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs text-[var(--color-muted)] mb-1">
                      Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={branch.keywords}
                      onChange={(e) => updateLocal(index, 'keywords', e.target.value)}
                      placeholder="yes, sure, absolutely, count me in"
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-muted)]/30 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[var(--color-muted)] mb-1">
                      Suggested Response
                    </label>
                    <textarea
                      value={branch.responseBody}
                      onChange={(e) => updateLocal(index, 'responseBody', e.target.value)}
                      rows={3}
                      placeholder="Write the suggested volunteer response for this branch..."
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-muted)]/30 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] transition-colors resize-none font-mono"
                    />
                    <div className={`text-xs text-right mt-1 ${isOverLimit ? 'text-red-500' : 'text-[var(--color-muted)]'}`}>
                      {branch.responseBody.length} / {MAX_CHARS} characters
                    </div>
                  </div>

                  {branch.dirty && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSaveBranch(index)}
                        disabled={isPending || isOverLimit || !branch.label.trim() || !branch.responseBody.trim()}
                        className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-3 py-2 font-display text-xs transition-colors"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            SAVING...
                          </>
                        ) : (
                          <>
                            <Save size={12} />
                            SAVE BRANCH
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <button
            onClick={addBranch}
            className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-text)] border border-dashed border-[var(--color-muted)]/30 hover:border-[var(--color-muted)]/60 rounded-lg px-4 py-2.5 text-sm transition-colors w-full justify-center"
          >
            <Plus size={14} />
            Add Branch
          </button>
        </>
      )}

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
    </div>
  )
}
