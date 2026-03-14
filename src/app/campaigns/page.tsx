'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';

export default function CampaignsPage() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [captured, setCaptured] = useState(false);

  const handleCapture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const existing = JSON.parse(localStorage.getItem('message-email-captures') || '[]');
    existing.push({ email, source: 'campaigns', timestamp: new Date().toISOString() });
    localStorage.setItem('message-email-captures', JSON.stringify(existing));
    setCaptured(true);
    setEmail('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center px-6">
        <Image
          src={theme === 'dark' ? '/message/assets/logo-dark.png' : '/message/assets/logo-light.png'}
          alt="Message logo"
          width={80}
          height={80}
          className="mx-auto mb-8"
        />
        <h1 className="font-display text-4xl text-[var(--color-text)] mb-4">
          CAMPAIGNS
        </h1>
        <p className="text-[var(--color-muted)] mb-8">
          Dashboard coming soon &mdash; sign up to get notified
        </p>

        {captured ? (
          <p className="text-[var(--color-accent)] font-semibold mb-8">
            You&apos;re on the list!
          </p>
        ) : (
          <form onSubmit={handleCapture} className="flex gap-2 max-w-sm mx-auto mb-8">
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-lg bg-[var(--color-bg)] border border-[var(--color-muted)]/30 px-4 py-3 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] transition"
            />
            <button
              type="submit"
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-full px-6 py-3 font-bold transition"
            >
              Notify Me
            </button>
          </form>
        )}

        <Link
          href="/"
          className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition"
        >
          &larr; Back to Home
        </Link>
      </div>
    </div>
  );
}
