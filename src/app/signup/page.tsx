'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeProvider';

function SignUpForm() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry = {
      name,
      email,
      phone,
      campaignName,
      plan: plan || null,
      timestamp: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('message-signups') || '[]');
    existing.push(entry);
    localStorage.setItem('message-signups', JSON.stringify(existing));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center">
        <Image
          src={theme === 'dark' ? '/message/assets/logo-dark.png' : '/message/assets/logo-light.png'}
          alt="Message logo"
          width={60}
          height={60}
          className="mx-auto mb-8"
        />
        <h1 className="font-display text-3xl text-[var(--color-text)] mb-6">
          THANK YOU
        </h1>
        <p className="text-[var(--color-muted)] mb-8">
          Thanks for signing up! We&apos;ll be in touch soon.
        </p>
        <Link
          href="/"
          className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition"
        >
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-20 px-6">
      <Image
        src={theme === 'dark' ? '/message/assets/logo-dark.png' : '/message/assets/logo-light.png'}
        alt="Message logo"
        width={60}
        height={60}
        className="mx-auto mb-8"
      />
      <h1 className="font-display text-3xl text-center text-[var(--color-text)] mb-8">
        SIGN UP
      </h1>

      {plan && (
        <div className="text-center mb-6 text-[var(--color-accent)] font-semibold">
          Selected plan: {plan}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label className="block text-[var(--color-text)] text-sm mb-1">Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg bg-[var(--color-bg)] border border-[var(--color-muted)]/30 px-4 py-3 text-[var(--color-text)] mb-4 outline-none focus:border-[var(--color-accent)] transition"
        />

        <label className="block text-[var(--color-text)] text-sm mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg bg-[var(--color-bg)] border border-[var(--color-muted)]/30 px-4 py-3 text-[var(--color-text)] mb-4 outline-none focus:border-[var(--color-accent)] transition"
        />

        <label className="block text-[var(--color-text)] text-sm mb-1">Phone Number</label>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg bg-[var(--color-bg)] border border-[var(--color-muted)]/30 px-4 py-3 text-[var(--color-text)] mb-4 outline-none focus:border-[var(--color-accent)] transition"
        />

        <label className="block text-[var(--color-text)] text-sm mb-1">Campaign Name</label>
        <input
          type="text"
          required
          value={campaignName}
          onChange={(e) => setCampaignName(e.target.value)}
          className="w-full rounded-lg bg-[var(--color-bg)] border border-[var(--color-muted)]/30 px-4 py-3 text-[var(--color-text)] mb-4 outline-none focus:border-[var(--color-accent)] transition"
        />

        <button
          type="submit"
          className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-full py-3 font-bold transition mt-4"
        >
          Submit
        </button>
      </form>

      <div className="text-center mt-8">
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

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto py-20 px-6 text-center text-[var(--color-muted)]">
          Loading...
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
