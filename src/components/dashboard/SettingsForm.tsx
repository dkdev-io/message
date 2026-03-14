'use client'

import { useState, useTransition } from 'react'
import { saveTwilioSettings } from '@/lib/actions/settings'
import { Loader2, CheckCircle, AlertCircle, FlaskConical } from 'lucide-react'

interface SettingsFormProps {
  initialSettings: {
    twilio_account_sid: string
    twilio_auth_token: string
    twilio_phone_number: string
  }
}

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [sid, setSid] = useState(initialSettings.twilio_account_sid)
  const [token, setToken] = useState(initialSettings.twilio_auth_token)
  const [phone, setPhone] = useState(initialSettings.twilio_phone_number)
  const [isPending, startTransition] = useTransition()
  const [isTesting, setIsTesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    const formData = new FormData()
    formData.set('twilio_account_sid', sid)
    formData.set('twilio_auth_token', token)
    formData.set('twilio_phone_number', phone)

    startTransition(async () => {
      try {
        await saveTwilioSettings(formData)
        setMessage({ type: 'success', text: 'Twilio settings saved successfully.' })
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save settings.' })
      }
    })
  }

  async function handleTest() {
    setMessage(null)
    setIsTesting(true)

    try {
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}.json`,
        {
          headers: {
            Authorization: 'Basic ' + btoa(`${sid}:${token}`),
          },
        }
      )

      if (res.ok) {
        setMessage({ type: 'success', text: 'Twilio credentials are valid!' })
      } else {
        setMessage({ type: 'error', text: 'Invalid Twilio credentials. Please check your Account SID and Auth Token.' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Could not reach Twilio. Check your network connection.' })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
      <div className="bg-[var(--color-surface)] rounded-xl p-6 border border-[var(--color-muted)]/20 space-y-5">
        <h2 className="font-display text-xl text-[var(--color-text)]">TWILIO CONFIGURATION</h2>

        <div>
          <label htmlFor="twilio_account_sid" className="block text-sm text-[var(--color-muted)] mb-1.5">
            Account SID
          </label>
          <input
            id="twilio_account_sid"
            type="text"
            value={sid}
            onChange={(e) => setSid(e.target.value)}
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full rounded-lg bg-[var(--color-bg)] border border-[var(--color-muted)]/30 px-4 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] transition"
          />
        </div>

        <div>
          <label htmlFor="twilio_auth_token" className="block text-sm text-[var(--color-muted)] mb-1.5">
            Auth Token
          </label>
          <input
            id="twilio_auth_token"
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Your auth token"
            className="w-full rounded-lg bg-[var(--color-bg)] border border-[var(--color-muted)]/30 px-4 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] transition"
          />
        </div>

        <div>
          <label htmlFor="twilio_phone_number" className="block text-sm text-[var(--color-muted)] mb-1.5">
            Phone Number
          </label>
          <input
            id="twilio_phone_number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1234567890"
            className="w-full rounded-lg bg-[var(--color-bg)] border border-[var(--color-muted)]/30 px-4 py-2.5 text-[var(--color-text)] outline-none focus:border-[var(--color-accent)] transition"
          />
        </div>
      </div>

      {message && (
        <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-500/10 text-green-500'
            : 'bg-red-500/10 text-red-500'
        }`}>
          {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg px-6 py-2.5 font-display text-lg transition-colors disabled:opacity-50"
        >
          {isPending && <Loader2 size={18} className="animate-spin" />}
          SAVE SETTINGS
        </button>

        <button
          type="button"
          onClick={handleTest}
          disabled={isTesting || !sid || !token}
          className="flex items-center gap-2 border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 rounded-lg px-6 py-2.5 font-display text-lg transition-colors disabled:opacity-50"
        >
          {isTesting ? <Loader2 size={18} className="animate-spin" /> : <FlaskConical size={18} />}
          TEST CREDENTIALS
        </button>
      </div>
    </form>
  )
}
