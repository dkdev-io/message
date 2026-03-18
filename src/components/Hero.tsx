'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'

export default function Hero() {
  const { theme } = useTheme()

  return (
    <section
      id="about"
      className="py-12 md:py-16 flex items-center justify-center"
    >
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col items-center text-center">
        <div className="animate-fade-up">
          <Image
            src={
              theme === 'dark'
                ? '/message/assets/logo-dark.png'
                : '/message/assets/logo-light.png'
            }
            alt="Message logo"
            width={150}
            height={150}
          />
        </div>

        <h1 className="font-display text-4xl md:text-6xl animate-fade-up animate-delay-200">
          DON&apos;T GET HUSTLED
        </h1>

        <p className="text-[var(--color-muted)] text-lg md:text-xl animate-fade-up animate-delay-400">
          Message Does More With Less
        </p>

        <Link
          href="/login"
          className="mt-8 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-full px-8 py-4 font-bold hover:translate-y-[-2px] hover:shadow-lg transition animate-fade-up animate-delay-600"
        >
          Get Started
        </Link>
      </div>
    </section>
  )
}
