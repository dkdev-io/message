import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { updateCampaign } from '@/lib/actions/campaigns'

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (!campaign) notFound()

  const updateWithId = updateCampaign.bind(null, id)

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href={`/dashboard/campaigns/${id}`}
        className="inline-flex items-center gap-2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        <span className="text-sm">Back to Campaign</span>
      </Link>

      <div className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-muted)]/20 p-8">
        <h1 className="font-display text-3xl text-[var(--color-text)] mb-6">EDIT CAMPAIGN</h1>

        <form action={updateWithId} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Campaign Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              defaultValue={campaign.name}
              className="w-full bg-[var(--color-bg)] border border-[var(--color-muted)]/30 rounded-lg px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] transition-colors"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={campaign.description ?? ''}
              className="w-full bg-[var(--color-bg)] border border-[var(--color-muted)]/30 rounded-lg px-4 py-3 text-[var(--color-text)] placeholder:text-[var(--color-muted)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-[var(--color-accent)] transition-colors resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg px-6 py-3 font-display text-lg transition-colors"
            >
              SAVE CHANGES
            </button>
            <Link
              href={`/dashboard/campaigns/${id}`}
              className="text-[var(--color-muted)] hover:text-[var(--color-text)] rounded-lg px-6 py-3 text-sm transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
