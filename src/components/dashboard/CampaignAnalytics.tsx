'use client'

import { TrendingUp, CheckCheck, Reply, UserX, AlertTriangle } from 'lucide-react'

interface CampaignAnalyticsProps {
  stats: {
    sent: number
    delivered: number
    failed: number
    inbound: number
    optedOut: number
  }
  dailyVolume: Array<{ date: string; outbound: number; inbound: number }>
}

export default function CampaignAnalytics({ stats, dailyVolume }: CampaignAnalyticsProps) {
  const totalOutbound = stats.sent + stats.delivered + stats.failed
  const deliveryRate = totalOutbound > 0 ? ((stats.delivered / totalOutbound) * 100) : 0
  const responseRate = totalOutbound > 0 ? ((stats.inbound / totalOutbound) * 100) : 0
  const maxDaily = Math.max(...dailyVolume.map((d) => d.outbound + d.inbound), 1)

  const statCards = [
    {
      label: 'Sent',
      value: totalOutbound,
      icon: TrendingUp,
      color: 'text-[var(--color-accent)]',
    },
    {
      label: 'Delivered',
      value: deliveryRate > 0 ? `${deliveryRate.toFixed(1)}%` : '—',
      sub: `${stats.delivered} of ${totalOutbound}`,
      icon: CheckCheck,
      color: 'text-green-500',
    },
    {
      label: 'Response Rate',
      value: responseRate > 0 ? `${responseRate.toFixed(1)}%` : '—',
      sub: `${stats.inbound} replies`,
      icon: Reply,
      color: 'text-blue-500',
    },
    {
      label: 'Opt-Outs',
      value: stats.optedOut,
      icon: UserX,
      color: stats.optedOut > 0 ? 'text-red-500' : 'text-[var(--color-muted)]',
    },
  ]

  if (totalOutbound === 0 && stats.inbound === 0) {
    return (
      <div className="text-center py-8">
        <TrendingUp size={28} className="mx-auto mb-3 text-[var(--color-muted)]/40" />
        <p className="text-sm text-[var(--color-muted)]">No message data yet. Analytics will appear after sending messages.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className="bg-[var(--color-bg)] rounded-lg border border-[var(--color-muted)]/10 p-4 text-center">
            <card.icon size={18} className={`mx-auto mb-2 ${card.color}`} />
            <p className="font-display text-xl text-[var(--color-text)]">{card.value}</p>
            <p className="text-xs text-[var(--color-muted)]">{card.label}</p>
            {card.sub && (
              <p className="text-xs text-[var(--color-muted)]/60 mt-0.5">{card.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Failed messages warning */}
      {stats.failed > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
          <AlertTriangle size={14} />
          {stats.failed} message{stats.failed !== 1 ? 's' : ''} failed to deliver.
        </div>
      )}

      {/* Daily Volume Chart */}
      {dailyVolume.length > 0 && (
        <div>
          <p className="text-xs text-[var(--color-muted)] mb-3 font-medium uppercase tracking-wide">
            Message Volume (Last 14 Days)
          </p>
          <div className="flex items-end gap-1 h-32">
            {dailyVolume.map((day) => {
              const outH = ((day.outbound / maxDaily) * 100)
              const inH = ((day.inbound / maxDaily) * 100)
              const dateObj = new Date(day.date + 'T12:00:00')
              const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[var(--color-text)] text-[var(--color-bg)] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {label}: {day.outbound} out, {day.inbound} in
                  </div>
                  <div className="w-full flex flex-col items-center gap-px" style={{ height: '100px' }}>
                    <div className="w-full flex flex-col justify-end h-full gap-px">
                      {day.inbound > 0 && (
                        <div
                          className="w-full bg-blue-500/60 rounded-t-sm min-h-[2px]"
                          style={{ height: `${inH}%` }}
                        />
                      )}
                      {day.outbound > 0 && (
                        <div
                          className="w-full bg-[var(--color-accent)] rounded-t-sm min-h-[2px]"
                          style={{ height: `${outH}%` }}
                        />
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] text-[var(--color-muted)] leading-none mt-1 hidden sm:block">
                    {dateObj.toLocaleDateString('en-US', { day: 'numeric' })}
                  </span>
                </div>
              )
            })}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-[var(--color-accent)]" />
              <span className="text-xs text-[var(--color-muted)]">Outbound</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-blue-500/60" />
              <span className="text-xs text-[var(--color-muted)]">Inbound</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
