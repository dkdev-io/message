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
    title: 'VOTERCONTACT.IO',
    content: (
      <p className="text-[var(--color-muted)] text-sm">
        Visit <a href="https://votercontact.io" className="hover:text-[var(--color-accent)] transition underline">votercontact.io</a> to learn more about our full suite of political technology tools.
      </p>
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
  const [openSections, setOpenSections] = useState<boolean[]>([false, false, false, false, false])

  const toggleSection = (index: number) => {
    setOpenSections((prev) => {
      const next = [...prev]
      next[index] = !next[index]
      return next
    })
  }

  return (
    <footer className="bg-[var(--color-surface)] border-t border-[var(--color-muted)]/20 py-4">
      <div className="max-w-[1200px] mx-auto px-6">
        <h3 className="font-display text-lg text-[var(--color-text)] text-center mb-2">LEARN MORE</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-0">
          {columns.map((col, i) => (
            <div key={col.title} className="text-center">
              <button
                className="flex w-full items-center justify-center gap-1.5 py-2"
                onClick={() => toggleSection(i)}
              >
                <h4 className="font-display text-sm text-[var(--color-text)]">{col.title}</h4>
                <ChevronDown
                  className={`h-3 w-3 text-[var(--color-muted)] transition-transform ${
                    openSections[i] ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openSections[i] ? 'max-h-40 pb-2' : 'max-h-0'
                }`}
              >
                {col.content}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-2 pt-2 border-t border-[var(--color-muted)]/20 flex items-center justify-center gap-4">
          <p className="text-[var(--color-muted)] text-xs">
            Website by Dev/D.
          </p>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}
