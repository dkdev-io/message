'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface AskMeModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AskMeModal({ isOpen, onClose }: AskMeModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [question, setQuestion] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const entry = {
      name,
      email,
      question,
      timestamp: new Date().toISOString(),
    }
    const existing = JSON.parse(localStorage.getItem('message-questions') || '[]')
    existing.push(entry)
    localStorage.setItem('message-questions', JSON.stringify(existing))
    setSubmitted(true)
  }

  const handleClose = () => {
    setName('')
    setEmail('')
    setQuestion('')
    setSubmitted(false)
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--color-surface)] rounded-xl p-8 w-full max-w-md z-50">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-[var(--color-muted)] hover:text-[var(--color-text)] transition"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="font-display text-2xl text-[var(--color-text)] mb-6">ASK ME</h2>

        {submitted ? (
          <div className="text-center">
            <p className="text-[var(--color-text)] mb-6">
              Thanks, we&apos;ll get back to you!
            </p>
            <button
              onClick={handleClose}
              className="w-full bg-[var(--color-accent)] text-white rounded-full py-3 font-bold"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-[var(--color-bg)] border border-[var(--color-muted)]/30 px-4 py-3 text-[var(--color-text)] mb-4"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg bg-[var(--color-bg)] border border-[var(--color-muted)]/30 px-4 py-3 text-[var(--color-text)] mb-4"
            />
            <textarea
              placeholder="Question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              className="w-full rounded-lg bg-[var(--color-bg)] border border-[var(--color-muted)]/30 px-4 py-3 text-[var(--color-text)] mb-4"
            />
            <button
              type="submit"
              className="w-full bg-[var(--color-accent)] text-white rounded-full py-3 font-bold"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </>
  )
}
