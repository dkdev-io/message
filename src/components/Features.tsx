'use client'

import Link from 'next/link'
import { Sparkles, BarChart3, Database } from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'AI-Assisted Campaign Creation',
    description:
      'Build targeted SMS campaigns in minutes with AI that understands political messaging.',
    stagger: 'stagger-1',
  },
  {
    icon: BarChart3,
    title: 'AI-Assisted Analysis',
    description:
      'Real-time insights on delivery, response rates, and voter engagement — powered by AI.',
    stagger: 'stagger-2',
  },
  {
    icon: Database,
    title: 'Deep Data Analysis',
    description:
      'Go beyond surface metrics. Analyze voter segments, message performance, and optimize your outreach strategy.',
    stagger: 'stagger-3',
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <h2 className="font-display text-3xl md:text-5xl text-center mb-4">
          MESSAGE DOES MORE
        </h2>
        <p className="text-[var(--color-muted)] text-center max-w-2xl mx-auto mb-12">
          Messaging apps have fallen behind. We use the latest tech to help campaigns do more.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className={`bg-[var(--color-surface)] rounded-xl p-8 border border-[var(--color-muted)]/20 hover:translate-y-[-4px] hover:shadow-lg transition fade-up ${feature.stagger}`}
            >
              <feature.icon
                size={40}
                className="text-[var(--color-accent)]"
              />
              <h3 className="font-display text-xl mt-4 mb-2">
                {feature.title}
              </h3>
              <p className="text-[var(--color-muted)]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/signup"
            className="inline-block bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-full px-8 py-4 font-bold hover:translate-y-[-2px] hover:shadow-lg transition"
          >
            Get Message
          </Link>
        </div>
      </div>
    </section>
  )
}
