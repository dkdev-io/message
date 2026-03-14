'use client'

import { Trash2 } from 'lucide-react'
import { deleteCampaign } from '@/lib/actions/campaigns'

export default function DeleteCampaignButton({ campaignId }: { campaignId: string }) {
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this campaign? This cannot be undone.')) {
      return
    }
    await deleteCampaign(campaignId)
  }

  return (
    <button
      onClick={handleDelete}
      className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 border border-red-500/30 hover:border-red-500/50 rounded-lg px-3 py-2 text-sm transition-colors"
    >
      <Trash2 size={14} />
      Delete
    </button>
  )
}
