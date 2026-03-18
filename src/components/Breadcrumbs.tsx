'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

const labelMap: Record<string, string> = {
  '': 'Home',
  'calculator': 'Calculator',
  'privacy': 'Privacy Policy',
  'testing': 'SMS Testing Consent',
  'campaigns': 'Campaigns',
  'volunteer': 'Volunteer',
  'signup': 'Sign Up',
  'login': 'Log In',
}

export default function Breadcrumbs() {
  const pathname = usePathname()

  // Strip basePath prefix if present
  const path = pathname.replace(/^\/message/, '') || '/'

  // Don't show on homepage
  if (path === '/') return null

  const segments = path.split('/').filter(Boolean)

  const crumbs = [
    { label: 'Home', href: '/' },
    ...segments.map((seg, i) => ({
      label: labelMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1),
      href: '/' + segments.slice(0, i + 1).join('/'),
    })),
  ]

  return (
    <nav aria-label="Breadcrumb" className="max-w-[1200px] mx-auto px-4 py-2">
      <ol className="flex items-center gap-1 text-sm">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1
          return (
            <li key={crumb.href} className="flex items-center gap-1">
              {i > 0 && (
                <ChevronRight className="h-3 w-3 text-[var(--color-muted)]" />
              )}
              {isLast ? (
                <span className="text-[var(--color-text)]">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
