'use client'

import Link from 'next/link'
import { X } from 'lucide-react'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  onAskMeClick: () => void
}

export default function MobileNav({ isOpen, onClose, onAskMeClick }: MobileNavProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-72 z-50 bg-[var(--color-surface)] shadow-lg transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 text-[var(--color-text)]"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-4 px-6 pt-4">
          <a
            href="#about"
            onClick={onClose}
            className="font-display text-xl text-[var(--color-text)] hover:opacity-80 transition-opacity"
          >
            About
          </a>
          <Link
            href="/campaigns"
            onClick={onClose}
            className="font-display text-xl text-[var(--color-text)] hover:opacity-80 transition-opacity"
          >
            Campaigns
          </Link>
          <Link
            href="/volunteer"
            onClick={onClose}
            className="font-display text-xl text-[var(--color-text)] hover:opacity-80 transition-opacity"
          >
            Volunteer
          </Link>
          <button
            onClick={() => {
              onAskMeClick()
              onClose()
            }}
            className="bg-[var(--color-accent)] text-white rounded-full px-4 py-2 font-display text-xl hover:opacity-90 transition-opacity mt-2"
          >
            Ask Me
          </button>
        </nav>
      </div>
    </>
  )
}
