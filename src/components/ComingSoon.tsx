'use client'

import { useState } from 'react'
import { PhoneCall, Coins, Users } from 'lucide-react'

const features = [
  {
    icon: PhoneCall,
    title: 'Predictive Dial Integration',
    description:
      'Call and SMS follow-up integrated together — just like we all communicate with friends.',
    stagger: 'stagger-1',
  },
  {
    icon: Coins,
    title: 'Integrated Credit System',
    description:
      'Use your credits for more than just SMS. Calls, data, analytics — one balance.',
    stagger: 'stagger-2',
  },
  {
    icon: Users,
    title: 'Ongoing Support Community',
    description:
      'Open source community where you learn to maximize your SMS program.',
    stagger: 'stagger-3',
  },
]

export default function ComingSoon() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    const existing = JSON.parse(
      localStorage.getItem('message-email-captures') || '[]'
    )
    existing.push(email)
    localStorage.setItem('message-email-captures', JSON.stringify(existing))

    setEmail('')
    setSubmitted(true)
  }

  return (
    <section id="coming-soon" className="py-20 md:py-28">
      <h2 className="font-display text-3xl md:text-5xl text-center mb-4">
        MESSAGE GROWS WITH YOU
      </h2>

      <p className="text-[var(--color-muted)] text-center max-w-2xl mx-auto mb-12">
        Leading political tech companies update their software 10X less than their peers.
        We won&apos;t.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1200px] mx-auto px-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <div
              key={feature.title}
              className={`fade-up ${feature.stagger} bg-[var(--color-surface)] rounded-xl p-8 border border-[var(--color-muted)]/20 text-center opacity-80 hover:translate-y-[-4px] hover:shadow-lg transition`}
            >
              <span className="inline-block bg-[var(--color-accent)]/20 text-[var(--color-accent)] text-xs uppercase rounded-full px-3 py-1 mb-4">
                COMING SOON
              </span>

              <div className="flex justify-center mb-4">
                <Icon className="w-8 h-8 text-[var(--color-accent)]" />
              </div>

              <h3 className="font-display text-xl mb-2">{feature.title}</h3>

              <p className="text-[var(--color-muted)]">{feature.description}</p>
            </div>
          )
        })}
      </div>

      <div className="max-w-md mx-auto mt-12 px-6">
        {submitted ? (
          <p className="text-center text-[var(--color-accent)] font-bold">
            Thanks! We&apos;ll keep you posted.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-l-full px-4 py-3 border border-[var(--color-muted)]/20 bg-[var(--color-surface)] outline-none"
              required
            />
            <button
              type="submit"
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-r-full px-6 py-3 font-bold transition whitespace-nowrap"
            >
              Get Updates First
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
