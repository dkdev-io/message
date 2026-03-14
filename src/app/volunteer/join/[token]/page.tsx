import { createClient } from '@/lib/supabase/server'
import { joinCampaignWithToken } from '@/lib/actions/volunteers'
import Link from 'next/link'
import { UserPlus, AlertCircle } from 'lucide-react'

interface JoinPageProps {
  params: Promise<{ token: string }>
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { token } = await params
  const supabase = await createClient()

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser()

  // Look up the token
  const { data: invite, error } = await supabase
    .from('invite_tokens')
    .select('*, campaigns(name)')
    .eq('token', token)
    .eq('is_active', true)
    .single()

  const isExpired = invite && new Date(invite.expires_at) < new Date()
  const isMaxedOut = invite && invite.max_uses && invite.use_count >= invite.max_uses

  if (error || !invite || isExpired || isMaxedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center px-6 max-w-md">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h1 className="font-display text-3xl text-[var(--color-text)] mb-3">INVALID INVITE</h1>
          <p className="text-[var(--color-muted)] mb-6">
            This invite link is invalid, expired, or has reached its maximum number of uses.
          </p>
          <Link
            href="/"
            className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
          >
            Go to homepage
          </Link>
        </div>
      </div>
    )
  }

  const campaignName = invite.campaigns?.name || 'Unknown Campaign'

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center px-6 max-w-md">
          <UserPlus size={48} className="mx-auto mb-4 text-[var(--color-accent)]" />
          <h1 className="font-display text-3xl text-[var(--color-text)] mb-3">JOIN {campaignName.toUpperCase()}</h1>
          <p className="text-[var(--color-muted)] mb-8">
            You&apos;ve been invited to volunteer for this campaign. Sign in or create an account to get started.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href={`/login?redirect=/volunteer/join/${token}`}
              className="block bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg px-6 py-3 font-display text-lg transition-colors"
            >
              SIGN IN
            </Link>
            <Link
              href={`/signup?redirect=/volunteer/join/${token}`}
              className="block border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 rounded-lg px-6 py-3 font-display text-lg transition-colors"
            >
              CREATE ACCOUNT
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="text-center px-6 max-w-md">
        <UserPlus size={48} className="mx-auto mb-4 text-[var(--color-accent)]" />
        <h1 className="font-display text-3xl text-[var(--color-text)] mb-3">JOIN {campaignName.toUpperCase()}</h1>
        <p className="text-[var(--color-muted)] mb-8">
          You&apos;ve been invited to volunteer for <span className="text-[var(--color-text)]">{campaignName}</span>. Click below to accept.
        </p>
        <form action={async () => {
          'use server'
          await joinCampaignWithToken(token)
        }}>
          <button
            type="submit"
            className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg px-8 py-3 font-display text-lg transition-colors"
          >
            JOIN AS VOLUNTEER
          </button>
        </form>
      </div>
    </div>
  )
}
