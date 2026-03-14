'use client'

import { useState } from 'react'

export default function EmailCapture() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    const stored = localStorage.getItem('message-email-captures')
    const emails: string[] = stored ? JSON.parse(stored) : []
    emails.push(email)
    localStorage.setItem('message-email-captures', JSON.stringify(emails))

    setEmail('')
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <p className="text-center text-[var(--color-text)]">
        Thanks! We&apos;ll keep you posted.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row justify-center">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-full md:rounded-l-full md:rounded-r-none px-6 py-3 bg-[var(--color-bg)] border border-[var(--color-muted)]/30 text-[var(--color-text)] w-full md:w-auto"
      />
      <button
        type="submit"
        className="mt-2 md:mt-0 rounded-full md:rounded-r-full md:rounded-l-none bg-[var(--color-accent)] text-white px-6 py-3 font-bold w-full md:w-auto"
      >
        Get Updates First
      </button>
    </form>
  )
}
