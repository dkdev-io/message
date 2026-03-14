import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { removeVolunteer } from '@/lib/actions/volunteers'
import InviteLinkGenerator from '@/components/dashboard/InviteLinkGenerator'
import { Users, Trash2 } from 'lucide-react'

export default async function VolunteersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: campaigns } = await supabase
    .from('campaigns')
    .select(`
      id,
      name,
      volunteer_assignments(
        id,
        is_active,
        volunteer_id,
        profiles:volunteer_id(id, full_name)
      ),
      invite_tokens(
        id,
        token,
        is_active,
        max_uses,
        use_count,
        expires_at
      )
    `)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-display text-3xl text-[var(--color-text)] mb-8">VOLUNTEERS</h1>

      {!campaigns || campaigns.length === 0 ? (
        <div className="text-center py-20">
          <Users size={48} className="mx-auto mb-4 text-[var(--color-muted)] opacity-30" />
          <h2 className="font-display text-2xl text-[var(--color-text)] mb-2">NO CAMPAIGNS YET</h2>
          <p className="text-[var(--color-muted)]">Create a campaign first, then invite volunteers.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {campaigns.map((campaign) => {
            const activeAssignments = (campaign.volunteer_assignments || []).filter(
              (a: { is_active: boolean }) => a.is_active !== false
            )
            const activeTokens = (campaign.invite_tokens || []).filter(
              (t: { is_active: boolean }) => t.is_active
            )

            return (
              <div
                key={campaign.id}
                className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-muted)]/20 overflow-hidden"
              >
                <div className="p-6 border-b border-[var(--color-muted)]/20">
                  <h2 className="font-display text-xl text-[var(--color-text)]">{campaign.name}</h2>
                  <p className="text-sm text-[var(--color-muted)] mt-1">
                    {activeAssignments.length} volunteer{activeAssignments.length !== 1 ? 's' : ''}
                  </p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Active volunteers */}
                  {activeAssignments.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-[var(--color-muted)] mb-3 uppercase tracking-wide">
                        Active Volunteers
                      </h3>
                      <div className="space-y-2">
                        {activeAssignments.map((assignment: { id: string; profiles: { id: string; full_name?: string }[] | { id: string; full_name?: string } }) => {
                          const profile = Array.isArray(assignment.profiles) ? assignment.profiles[0] : assignment.profiles
                          return (
                          <div
                            key={assignment.id}
                            className="flex items-center justify-between bg-[var(--color-bg)] rounded-lg px-4 py-3"
                          >
                            <div>
                              <p className="text-[var(--color-text)] text-sm">
                                {profile?.full_name || 'Unnamed Volunteer'}
                              </p>
                            </div>
                            <form action={async () => {
                              'use server'
                              await removeVolunteer(assignment.id)
                            }}>
                              <button
                                type="submit"
                                className="text-red-400 hover:text-red-300 transition-colors p-1"
                                title="Remove volunteer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </form>
                          </div>
                        )})}

                      </div>
                    </div>
                  )}

                  {/* Invite link generator */}
                  <InviteLinkGenerator
                    campaignId={campaign.id}
                    campaignName={campaign.name}
                    existingTokens={activeTokens.map((t: { id: string; token: string; max_uses: number | null; use_count: number; expires_at: string }) => ({
                      id: t.id,
                      token: t.token,
                      maxUses: t.max_uses,
                      useCount: t.use_count,
                      expiresAt: t.expires_at,
                    }))}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
