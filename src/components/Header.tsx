'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { ThemeToggle } from '@/components/ThemeToggle'
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Used in JSX below, do not remove
import AuthButton from '@/components/AuthButton'

interface HeaderProps {
  onAskMeClick: () => void
  onMenuClick: () => void
}

export default function Header({ onAskMeClick, onMenuClick }: HeaderProps) {
  const { theme } = useTheme()

  const logoSrc =
    theme === 'dark'
      ? '/message/assets/logo-dark.png'
      : '/message/assets/logo-light.png'

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-[var(--color-bg)]/80">
      <div className="mx-auto max-w-[1200px] flex items-center justify-between px-4 py-3">
        {/* Left: Logo + Wordmark */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={logoSrc}
            alt="MESSAGE logo"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
          <span className="font-display text-2xl tracking-wide text-[var(--color-text)]">
            MESSAGE
          </span>
        </Link>

        {/* Center/Right: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#about"
            className="font-display text-lg text-[var(--color-text)] hover:opacity-80 transition-opacity"
          >
            About
          </a>
          <Link
            href="/campaigns"
            className="font-display text-lg text-[var(--color-text)] hover:opacity-80 transition-opacity"
          >
            Campaigns
          </Link>
          <Link
            href="/volunteer"
            className="font-display text-lg text-[var(--color-text)] hover:opacity-80 transition-opacity"
          >
            Volunteer
          </Link>
          <button
            onClick={onAskMeClick}
            className="bg-[var(--color-accent)] text-white rounded-full px-4 py-2 font-display text-lg hover:opacity-90 transition-opacity"
          >
            Ask Me
          </button>
          <AuthButton />
          <ThemeToggle />
        </nav>

        {/* Mobile: Hamburger */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-[var(--color-text)]"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>
      </div>
    </header>
  )
}
