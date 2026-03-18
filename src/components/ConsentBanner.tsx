'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('message-consent')
    if (!consent) {
      setVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('message-consent', JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
    }))
    setVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('message-consent', JSON.stringify({
      accepted: false,
      timestamp: new Date().toISOString(),
    }))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] bg-[var(--color-surface)] border-t border-[var(--color-muted)]/20 shadow-lg">
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col sm:flex-row items-center gap-4">
        <p className="text-sm text-[var(--color-text)] flex-1">
          We use local storage to save your preferences and form submissions on your device.
          No data is sent to external servers. Read our{' '}
          <Link href="/privacy" className="text-[var(--color-accent)] underline hover:opacity-80 transition">
            Privacy &amp; Data Use Policy
          </Link>.
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDecline}
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition px-4 py-2"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-bold rounded-full px-6 py-2 transition"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
