'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
  }, [supabase.auth])

  if (loading) return null

  if (user) {
    return (
      <Link
        href="/dashboard"
        className="bg-[var(--color-accent)] text-white rounded-full px-4 py-2 font-display text-lg hover:opacity-90 transition-opacity"
      >
        Dashboard
      </Link>
    )
  }

  return (
    <Link
      href="/login"
      className="bg-[var(--color-accent)] text-white rounded-full px-4 py-2 font-display text-lg hover:opacity-90 transition-opacity"
    >
      Sign In
    </Link>
  )
}
