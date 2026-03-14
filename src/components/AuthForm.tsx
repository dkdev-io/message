'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { sendWelcomeEmail } from '@/lib/actions/email'

type Mode = 'signin' | 'signup'

export default function AuthForm() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setSuccessMessage('Check your email for a confirmation link to complete sign up.')
      // Send welcome email (fire-and-forget, don't block signup flow)
      sendWelcomeEmail(email, fullName).catch(console.error)
      setLoading(false)
      return
    }

    setLoading(false)
  }

  const handleDevSkip = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: 'dpeterkelly@gmail.com',
      password: 'testpassword123',
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard')
  }

  const switchMode = (newMode: Mode) => {
    setMode(newMode)
    setError(null)
    setSuccessMessage(null)
  }

  return (
    <div className="bg-[var(--color-surface)] rounded-2xl p-8 shadow-lg">
      {/* Tabs */}
      <div className="flex mb-6 border-b border-[var(--color-muted)]/20">
        <button
          type="button"
          onClick={() => switchMode('signin')}
          className={`flex-1 pb-3 font-display text-lg tracking-wide transition-colors ${
            mode === 'signin'
              ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]'
              : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          SIGN IN
        </button>
        <button
          type="button"
          onClick={() => switchMode('signup')}
          className={`flex-1 pb-3 font-display text-lg tracking-wide transition-colors ${
            mode === 'signup'
              ? 'text-[var(--color-accent)] border-b-2 border-[var(--color-accent)]'
              : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
          }`}
        >
          SIGN UP
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Success */}
      {successMessage && (
        <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 text-sm">
          {successMessage}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label htmlFor="fullName" className="block text-sm text-[var(--color-muted)] mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Doe"
              required
              className="w-full bg-[var(--color-surface)] border border-[var(--color-muted)]/30 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-muted)]/50"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm text-[var(--color-muted)] mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full bg-[var(--color-surface)] border border-[var(--color-muted)]/30 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-muted)]/50"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm text-[var(--color-muted)] mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            className="w-full bg-[var(--color-surface)] border border-[var(--color-muted)]/30 rounded-lg px-4 py-3 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] placeholder:text-[var(--color-muted)]/50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg px-4 py-3 font-display text-lg tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : mode === 'signin' ? 'SIGN IN' : 'SIGN UP'}
        </button>
      </form>

      {/* Dev Mode Skip */}
      {process.env.NODE_ENV === 'development' && (
        <button
          type="button"
          onClick={handleDevSkip}
          disabled={loading}
          className="w-full mt-4 border border-[var(--color-muted)]/30 text-[var(--color-muted)] rounded-lg px-4 py-3 text-sm transition-colors hover:bg-[var(--color-muted)]/10 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Skip Auth (Dev Mode)
        </button>
      )}
    </div>
  )
}
