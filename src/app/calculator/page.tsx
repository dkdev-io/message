'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from '@/components/ThemeProvider'
import Breadcrumbs from '@/components/Breadcrumbs'

const platforms = [
  {
    name: 'Message',
    color: 'var(--color-accent)',
    perSegment: 0.01,
    setupFee: 199,
    monthlyFee: 0,
    note: 'Pay As You Go plan',
  },
  {
    name: 'Hustle',
    color: '#FF6B6B',
    perSegment: 0.04,
    setupFee: 100,
    monthlyFee: 0,
    note: 'PAYGO plan',
  },
  {
    name: 'Scale to Win',
    color: '#4ECDC4',
    perSegment: 0.015,
    setupFee: 0,
    monthlyFee: 0,
    note: 'Per segment pricing',
  },
]

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatCurrencyExact(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export default function CalculatorPage() {
  const { theme } = useTheme()
  const [messageCount, setMessageCount] = useState(10000)
  const [segmentsPerMessage, setSegmentsPerMessage] = useState(1)

  const totalSegments = messageCount * segmentsPerMessage

  const costs = platforms.map((p) => ({
    ...p,
    messagingCost: totalSegments * p.perSegment,
    totalCost: totalSegments * p.perSegment + p.setupFee + p.monthlyFee,
  }))

  const messageCost = costs.find((c) => c.name === 'Message')!
  const maxCost = Math.max(...costs.map((c) => c.totalCost))

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Breadcrumbs />
      <div className="max-w-4xl mx-auto px-6 py-12">

        <div className="text-center mb-12">
          <Image
            src={theme === 'dark' ? '/message/assets/logo-dark.png' : '/message/assets/logo-light.png'}
            alt="Message logo"
            width={80}
            height={80}
            className="mx-auto mb-4"
          />
          <h1 className="font-display text-4xl md:text-5xl mb-2">
            COST CALCULATOR
          </h1>
          <p className="text-[var(--color-muted)]">
            See how Message compares to Hustle and Scale to Win
          </p>
        </div>

        {/* Input Controls */}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-muted)]/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[var(--color-muted)] mb-2">
                Number of messages
              </label>
              <input
                type="number"
                min={100}
                step={100}
                value={messageCount}
                onChange={(e) => setMessageCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-lg bg-[var(--color-bg)] border border-[var(--color-muted)]/30 px-4 py-3 text-[var(--color-text)] text-lg outline-none focus:border-[var(--color-accent)] transition"
              />
              <input
                type="range"
                min={1000}
                max={500000}
                step={1000}
                value={messageCount}
                onChange={(e) => setMessageCount(parseInt(e.target.value))}
                className="w-full mt-2 accent-[var(--color-accent)]"
              />
              <div className="flex justify-between text-xs text-[var(--color-muted)] mt-1">
                <span>1K</span>
                <span>100K</span>
                <span>250K</span>
                <span>500K</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-[var(--color-muted)] mb-2">
                Segments per message
              </label>
              <div className="flex gap-2">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSegmentsPerMessage(s)}
                    className={`flex-1 rounded-lg px-4 py-3 text-lg font-bold transition ${
                      segmentsPerMessage === s
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'bg-[var(--color-bg)] border border-[var(--color-muted)]/30 text-[var(--color-text)]'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--color-muted)] mt-2">
                1 segment = 160 characters. Most campaign texts are 1-2 segments.
              </p>
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-[var(--color-muted)]">
            Total segments: <span className="text-[var(--color-text)] font-bold">{totalSegments.toLocaleString()}</span>
          </div>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {costs.map((platform) => {
            const isMessage = platform.name === 'Message'
            const savings = platform.totalCost - messageCost.totalCost

            return (
              <div
                key={platform.name}
                className={`bg-[var(--color-surface)] rounded-xl p-6 border text-center ${
                  isMessage
                    ? 'ring-2 ring-[var(--color-accent)] border-[var(--color-accent)]/30'
                    : 'border-[var(--color-muted)]/20'
                }`}
              >
                {isMessage && (
                  <span className="inline-block bg-[var(--color-accent)] text-white text-xs rounded-full px-3 py-1 mb-3">
                    BEST VALUE
                  </span>
                )}

                <h3 className="font-display text-2xl mb-1">{platform.name}</h3>
                <p className="text-xs text-[var(--color-muted)] mb-4">{platform.note}</p>

                <div className="mb-4">
                  <span className="text-4xl font-display">{formatCurrency(platform.totalCost)}</span>
                  <p className="text-xs text-[var(--color-muted)] mt-1">total cost</p>
                </div>

                <div className="space-y-2 text-sm text-left">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Per segment</span>
                    <span className="text-[var(--color-text)]">{formatCurrencyExact(platform.perSegment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Messaging cost</span>
                    <span className="text-[var(--color-text)]">{formatCurrency(platform.messagingCost)}</span>
                  </div>
                  {platform.setupFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-muted)]">Setup fee</span>
                      <span className="text-[var(--color-text)]">{formatCurrency(platform.setupFee)}</span>
                    </div>
                  )}
                </div>

                {!isMessage && savings > 0 && (
                  <div className="mt-4 pt-4 border-t border-[var(--color-muted)]/20">
                    <p className="text-sm">
                      <span className="text-red-400 font-bold">+{formatCurrency(savings)}</span>
                      <span className="text-[var(--color-muted)]"> more than Message</span>
                    </p>
                  </div>
                )}

                {isMessage && (
                  <div className="mt-4 pt-4 border-t border-[var(--color-muted)]/20">
                    <Link
                      href="/signup?plan=payg"
                      className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-full px-6 py-2 font-bold transition inline-block text-sm"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Visual Bar Comparison */}
        <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-muted)]/20 mb-8">
          <h3 className="font-display text-xl mb-4 text-center">COST COMPARISON</h3>
          <div className="space-y-4">
            {costs.map((platform) => {
              const percentage = maxCost > 0 ? (platform.totalCost / maxCost) * 100 : 0

              return (
                <div key={platform.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--color-text)] font-bold">{platform.name}</span>
                    <span className="text-[var(--color-text)]">{formatCurrency(platform.totalCost)}</span>
                  </div>
                  <div className="h-8 bg-[var(--color-bg)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(percentage, 2)}%`,
                        backgroundColor: platform.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pricing Source Note */}
        <p className="text-xs text-[var(--color-muted)] text-center mb-8">
          Pricing sourced from public websites as of March 2026.
          Hustle: $0.04/segment + $100 setup (PAYGO).
          Scale to Win: $0.015/segment, no setup fee.
          Message: $0.01/segment + $199 setup (Pay As You Go).
          Actual costs may vary based on plan, volume, and message length.
        </p>

      </div>
    </div>
  )
}
