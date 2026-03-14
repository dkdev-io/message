'use client'

import Link from 'next/link'

const plans = [
  {
    title: 'SELF HOSTED',
    price: '$5',
    priceSuffix: '/mo',
    description: 'Flexible support',
    cta: '/signup?plan=self-hosted',
    highlighted: false,
    stagger: 'stagger-1',
  },
  {
    title: 'PAY AS YOU GO',
    price: '$0.01',
    priceSuffix: '/message',
    description: '+ $199 setup fee',
    cta: '/signup?plan=payg',
    highlighted: true,
    stagger: 'stagger-2',
  },
  {
    title: 'LARGE VOLUME',
    price: 'At Cost',
    priceSuffix: '',
    description: 'Flexible retainer, SMS credits at cost',
    cta: '/signup?plan=enterprise',
    highlighted: false,
    stagger: 'stagger-3',
  },
]

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28">
      <h2 className="font-display text-3xl md:text-5xl text-center mb-16">
        MESSAGE DOES MORE FOR LESS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1200px] mx-auto px-6">
        {plans.map((plan) => (
          <div
            key={plan.title}
            className={`fade-up ${plan.stagger} bg-[var(--color-surface)] rounded-xl p-8 border border-[var(--color-muted)]/20 text-center hover:translate-y-[-4px] hover:shadow-lg transition ${
              plan.highlighted ? 'ring-2 ring-[var(--color-accent)] md:scale-105' : ''
            }`}
          >
            {plan.highlighted && (
              <span className="inline-block bg-[var(--color-accent)] text-white text-xs rounded-full px-3 py-1 mb-4">
                MOST POPULAR
              </span>
            )}

            <h3 className="font-display text-xl mb-4">{plan.title}</h3>

            <div className="mb-4">
              <span className="text-4xl font-display">{plan.price}</span>
              {plan.priceSuffix && (
                <span className="text-sm text-[var(--color-muted)]">{plan.priceSuffix}</span>
              )}
            </div>

            <p className="text-[var(--color-muted)]">{plan.description}</p>

            <Link
              href={plan.cta}
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-full px-6 py-3 font-bold transition inline-block mt-6"
            >
              Get Started
            </Link>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <Link
          href="/calculator"
          className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-full px-6 py-3 font-bold transition inline-block"
        >
          Not Sure Which Plan? Use Our Calculator
        </Link>
      </div>
    </section>
  )
}
