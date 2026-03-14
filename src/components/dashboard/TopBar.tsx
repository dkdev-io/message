'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ThemeToggle } from '@/components/ThemeToggle'

interface TopBarProps {
  userEmail?: string
  userName?: string
}

export default function TopBar({ userEmail, userName }: TopBarProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-muted)]/20 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <span className="text-sm text-[var(--color-muted)]">
          {userName || userEmail}
        </span>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </header>
  )
}
