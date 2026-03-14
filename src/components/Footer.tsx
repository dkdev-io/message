'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

const columns = [
  {
    title: 'ABOUT DEV/D',
    content: (
      <p className="text-[var(--color-muted)] text-sm">
        Dev/D builds modern political technology that campaigns actually want to use.
      </p>
    ),
  },
  {
    title: 'FEATURES',
    content: (
      <div className="flex flex-col">
        <a href="#features" className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition text-sm block py-1">
          AI-Assisted Campaign Creation
        </a>
        <a href="#features" className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition text-sm block py-1">
          AI-Assisted Analysis
        </a>
        <a href="#features" className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition text-sm block py-1">
          Deep Data Analysis
        </a>
      </div>
    ),
  },
  {
    title: 'PRICING',
    content: (
      <div className="flex flex-col">
        <a href="#pricing" className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition text-sm block py-1">
          Self Hosted
        </a>
        <a href="#pricing" className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition text-sm block py-1">
          Pay As You Go
        </a>
        <a href="#pricing" className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition text-sm block py-1">
          Large Volume
        </a>
      </div>
    ),
  },
  {
    title: 'COMING SOON',
    content: (
      <div className="flex flex-col">
        <a href="#coming-soon" className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition text-sm block py-1">
          Predictive Dial
        </a>
        <a href="#coming-soon" className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition text-sm block py-1">
          Integrated Credits
        </a>
        <a href="#coming-soon" className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition text-sm block py-1">
          Support Community
        </a>
      </div>
    ),
  },
]

export default function Footer() {
  const [openSections, setOpenSections] = useState<boolean[]>([false, false, false, false])

  const toggleSection = (index: number) => {
    setOpenSections((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  return (
    <footer className="bg-[var(--color-surface)] border-t border-[var(--color-muted)]/20 py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {columns.map((col, i) => (
            <div key={col.title}>
              {/* Mobile accordion header */}
              <button
                className="flex w-full items-center justify-between md:pointer-events-none"
                onClick={() => toggleSection(i)}
              >
                <h4 className="font-display text-[var(--color-text)]">{col.title}</h4>
                <ChevronDown
                  className={`h-4 w-4 text-[var(--color-muted)] transition-transform md:hidden ${
                    openSections[i] ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Content: hidden on mobile unless open, always visible on md+ */}
              <div className={`mt-3 ${openSections[i] ? 'block' : 'hidden'} md:block`}>
                {col.content}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[var(--color-muted)]/20 flex justify-between items-center">
          <p className="text-[var(--color-muted)] text-sm">
            &copy; 2026 Dev/D. All rights reserved.
          </p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}
