'use client'

import { useState, useTransition } from 'react'
import { Shield, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'
import { submitTenDlcRegistration } from '@/lib/actions/campaigns'

interface TenDlcSetupProps {
  campaignId: string
  campaignName: string
  tenDlcStatus: string | null // null = not registered, 'pending', 'approved', 'failed'
  brandSid?: string | null
  campaignSid?: string | null
  hasTwilioCreds: boolean
}

export default function TenDlcSetup({
  campaignId,
  campaignName,
  tenDlcStatus,
  brandSid,
  campaignSid,
  hasTwilioCreds,
}: TenDlcSetupProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    brandName: campaignName,
    ein: '',
    vertical: 'POLITICAL',
    useCase: 'Political campaign voter outreach via peer-to-peer SMS.',
    sampleMessage: '',
    websiteUrl: '',
    contactEmail: '',
    contactPhone: '',
  })

  const isRegistered = tenDlcStatus === 'approved'
  const isPendingReview = tenDlcStatus === 'pending'

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleSubmit() {
    setError('')
    if (!formData.ein || !formData.contactEmail || !formData.contactPhone) {
      setError('EIN, contact email, and contact phone are required.')
      return
    }
    startTransition(async () => {
      try {
        await submitTenDlcRegistration(campaignId, formData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed')
      }
    })
  }

  if (!hasTwilioCreds) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 text-yellow-500 text-sm">
        <AlertTriangle size={16} />
        Twilio credentials required before 10DLC registration.{' '}
        <a href="/dashboard/settings" className="underline hover:text-yellow-400">Go to Settings</a> to add your Account SID and Auth Token.
      </div>
    )
  }

  if (isRegistered) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-500 text-sm">
          <CheckCircle size={16} />
          10DLC registration approved. Campaign is ready to send.
        </div>
        {brandSid && (
          <p className="text-xs text-[var(--color-muted)]">Brand SID: {brandSid}</p>
        )}
        {campaignSid && (
          <p className="text-xs text-[var(--color-muted)]">Campaign SID: {campaignSid}</p>
        )}
      </div>
    )
  }

  if (isPendingReview) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 text-yellow-500 text-sm">
          <AlertTriangle size={16} />
          10DLC registration is pending review. This typically takes 1-7 business days.
        </div>
        {brandSid && (
          <p className="text-xs text-[var(--color-muted)]">Brand SID: {brandSid}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--color-muted)]">
        10DLC (10-digit long code) registration is required by carriers before sending A2P SMS.
        This registers your brand and campaign use case with The Campaign Registry (TCR) via Twilio.
        <a
          href="https://www.twilio.com/docs/messaging/guides/10dlc"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[var(--color-accent)] ml-1"
        >
          Learn more <ExternalLink size={10} />
        </a>
      </p>

      {tenDlcStatus === 'failed' && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
          <AlertTriangle size={16} />
          Previous registration was rejected. Update your information and resubmit.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-[var(--color-muted)] mb-1 block">Brand / Organization Name</label>
          <input
            value={formData.brandName}
            onChange={(e) => handleChange('brandName', e.target.value)}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-muted)]/20 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--color-muted)] mb-1 block">EIN (Tax ID) *</label>
          <input
            value={formData.ein}
            onChange={(e) => handleChange('ein', e.target.value)}
            placeholder="XX-XXXXXXX"
            className="w-full bg-[var(--color-bg)] border border-[var(--color-muted)]/20 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]/50 focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--color-muted)] mb-1 block">Contact Email *</label>
          <input
            type="email"
            value={formData.contactEmail}
            onChange={(e) => handleChange('contactEmail', e.target.value)}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-muted)]/20 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div>
          <label className="text-xs text-[var(--color-muted)] mb-1 block">Contact Phone *</label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => handleChange('contactPhone', e.target.value)}
            placeholder="+1XXXXXXXXXX"
            className="w-full bg-[var(--color-bg)] border border-[var(--color-muted)]/20 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]/50 focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-[var(--color-muted)] mb-1 block">Website URL</label>
          <input
            type="url"
            value={formData.websiteUrl}
            onChange={(e) => handleChange('websiteUrl', e.target.value)}
            placeholder="https://yourcampaign.com"
            className="w-full bg-[var(--color-bg)] border border-[var(--color-muted)]/20 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]/50 focus:outline-none focus:border-[var(--color-accent)]"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-[var(--color-muted)] mb-1 block">Campaign Use Case</label>
          <textarea
            value={formData.useCase}
            onChange={(e) => handleChange('useCase', e.target.value)}
            rows={2}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-muted)]/20 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-[var(--color-muted)] mb-1 block">Sample Message</label>
          <textarea
            value={formData.sampleMessage}
            onChange={(e) => handleChange('sampleMessage', e.target.value)}
            rows={2}
            placeholder="Hi {first_name}, this is..."
            className="w-full bg-[var(--color-bg)] border border-[var(--color-muted)]/20 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)]/50 focus:outline-none focus:border-[var(--color-accent)] resize-none"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="inline-flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:opacity-50 text-white rounded-lg px-4 py-2.5 text-sm font-display transition-colors"
      >
        <Shield size={14} />
        {isPending ? 'SUBMITTING...' : 'SUBMIT 10DLC REGISTRATION'}
      </button>
    </div>
  )
}
