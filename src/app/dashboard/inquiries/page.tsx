'use client'

import { useState, useEffect } from 'react'
import { Trash2, Mail, MessageSquare } from 'lucide-react'

interface Inquiry {
  name: string
  email: string
  question: string
  timestamp: string
}

interface Signup {
  name: string
  email: string
  phone: string
  campaignName: string
  plan: string | null
  timestamp: string
}

export default function InquiriesPage() {
  const [questions, setQuestions] = useState<Inquiry[]>([])
  const [signups, setSignups] = useState<Signup[]>([])
  const [activeTab, setActiveTab] = useState<'questions' | 'signups'>('questions')

  useEffect(() => {
    setQuestions(JSON.parse(localStorage.getItem('message-questions') || '[]').reverse())
    setSignups(JSON.parse(localStorage.getItem('message-signups') || '[]').reverse())
  }, [])

  const clearQuestions = () => {
    if (confirm('Clear all questions?')) {
      localStorage.removeItem('message-questions')
      setQuestions([])
    }
  }

  const clearSignups = () => {
    if (confirm('Clear all signups?')) {
      localStorage.removeItem('message-signups')
      setSignups([])
    }
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--color-text)] mb-8">INQUIRIES</h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[var(--color-muted)]/20">
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 pb-3 font-display text-lg transition-colors ${
            activeTab === 'questions'
              ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]'
              : 'text-[var(--color-muted)]'
          }`}
        >
          <span className="flex items-center gap-2">
            <MessageSquare size={16} />
            QUESTIONS ({questions.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('signups')}
          className={`px-4 pb-3 font-display text-lg transition-colors ${
            activeTab === 'signups'
              ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]'
              : 'text-[var(--color-muted)]'
          }`}
        >
          <span className="flex items-center gap-2">
            <Mail size={16} />
            SIGNUPS ({signups.length})
          </span>
        </button>
      </div>

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <div>
          {questions.length > 0 && (
            <button
              onClick={clearQuestions}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 mb-4 transition-colors"
            >
              <Trash2 size={14} /> Clear All
            </button>
          )}

          {questions.length === 0 ? (
            <p className="text-[var(--color-muted)] text-center py-12">No questions submitted yet.</p>
          ) : (
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={i} className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-muted)]/20 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[var(--color-text)]">{q.name || 'Anonymous'}</span>
                      {q.email && <span className="text-xs text-[var(--color-muted)]">{q.email}</span>}
                    </div>
                    <span className="text-xs text-[var(--color-muted)]">
                      {new Date(q.timestamp).toLocaleDateString()} {new Date(q.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text)]">{q.question}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Signups Tab */}
      {activeTab === 'signups' && (
        <div>
          {signups.length > 0 && (
            <button
              onClick={clearSignups}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 mb-4 transition-colors"
            >
              <Trash2 size={14} /> Clear All
            </button>
          )}

          {signups.length === 0 ? (
            <p className="text-[var(--color-muted)] text-center py-12">No signups captured yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-muted)]/20">
                    <th className="text-left py-2 px-3 text-xs font-medium text-[var(--color-muted)] uppercase">Name</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-[var(--color-muted)] uppercase">Email</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-[var(--color-muted)] uppercase">Phone</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-[var(--color-muted)] uppercase">Campaign</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-[var(--color-muted)] uppercase">Plan</th>
                    <th className="text-left py-2 px-3 text-xs font-medium text-[var(--color-muted)] uppercase">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {signups.map((s, i) => (
                    <tr key={i} className="border-b border-[var(--color-muted)]/10">
                      <td className="py-2.5 px-3 text-[var(--color-text)]">{s.name}</td>
                      <td className="py-2.5 px-3 text-[var(--color-muted)]">{s.email}</td>
                      <td className="py-2.5 px-3 text-[var(--color-muted)]">{s.phone}</td>
                      <td className="py-2.5 px-3 text-[var(--color-muted)]">{s.campaignName}</td>
                      <td className="py-2.5 px-3 text-[var(--color-muted)]">{s.plan || '-'}</td>
                      <td className="py-2.5 px-3 text-[var(--color-muted)] text-xs">{new Date(s.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
