'use client'

import { Smartphone, Phone, Wifi, HelpCircle } from 'lucide-react'

interface VoterAnalysisProps {
  counts: {
    mobile: number
    landline: number
    voip: number
    unknown: number
    total: number
  }
}

export default function VoterAnalysis({ counts }: VoterAnalysisProps) {
  const eligible = counts.mobile + counts.voip
  const total = counts.total

  if (total === 0) return null

  const segments = [
    { label: 'Mobile', count: counts.mobile, color: 'bg-green-500', icon: Smartphone, sendable: true },
    { label: 'VoIP', count: counts.voip, color: 'bg-blue-500', icon: Wifi, sendable: true },
    { label: 'Landline', count: counts.landline, color: 'bg-red-500', icon: Phone, sendable: false },
    { label: 'Unknown', count: counts.unknown, color: 'bg-gray-500', icon: HelpCircle, sendable: false },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--color-text)]">
          Phone Type Analysis
        </p>
        <p className="text-sm text-[var(--color-accent)] font-medium">
          {eligible} of {total} eligible for SMS
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-3 rounded-full overflow-hidden flex bg-[var(--color-muted)]/10">
        {segments.map((seg) =>
          seg.count > 0 ? (
            <div
              key={seg.label}
              className={`${seg.color} transition-all`}
              style={{ width: `${(seg.count / total) * 100}%` }}
            />
          ) : null
        )}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
              seg.sendable
                ? 'border-green-500/30 bg-green-500/5'
                : 'border-[var(--color-muted)]/20 bg-[var(--color-muted)]/5'
            }`}
          >
            <seg.icon size={14} className={seg.sendable ? 'text-green-500' : 'text-[var(--color-muted)]'} />
            <div>
              <p className="font-medium text-[var(--color-text)]">{seg.count}</p>
              <p className="text-xs text-[var(--color-muted)]">
                {seg.label}{seg.sendable ? '' : ' (excluded)'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
