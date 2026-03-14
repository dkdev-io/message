'use client'

import { useEffect, useRef } from 'react'
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react'

interface Message {
  id: string
  campaign_id: string
  voter_id: string
  volunteer_id?: string
  direction: string
  body: string
  status: string
  created_at: string
  sent_at?: string | null
  error_message?: string | null
}

interface ChatThreadProps {
  messages: Message[]
  voterName: string
}

export default function ChatThread({ messages, voterName }: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[var(--color-muted)] text-sm">
          No messages with {voterName} yet. Send the first message below.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {messages.map((msg) => {
        const isOutbound = msg.direction === 'outbound'

        return (
          <div
            key={msg.id}
            className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                isOutbound
                  ? 'bg-[var(--color-accent)] text-white rounded-br-md'
                  : 'bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-muted)]/20 rounded-bl-md'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
              <div className={`flex items-center gap-1 mt-1 ${
                isOutbound ? 'justify-end' : 'justify-start'
              }`}>
                <span className={`text-xs ${isOutbound ? 'text-white/60' : 'text-[var(--color-muted)]'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isOutbound && (
                  <span className="text-white/60">
                    {msg.status === 'queued' && <Clock size={12} />}
                    {msg.status === 'sent' && <Check size={12} />}
                    {msg.status === 'delivered' && <CheckCheck size={12} />}
                    {msg.status === 'failed' && <AlertCircle size={12} className="text-red-300" />}
                  </span>
                )}
              </div>
              {msg.status === 'failed' && msg.error_message && (
                <p className={`text-xs mt-1 ${isOutbound ? 'text-red-200' : 'text-red-400'}`}>
                  {msg.error_message}
                </p>
              )}
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
