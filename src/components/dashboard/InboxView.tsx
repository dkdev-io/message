'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import ConversationList from './ConversationList'
import ChatThread from './ChatThread'
import ComposeBox from './ComposeBox'
import { MessageSquare, GitBranch } from 'lucide-react'
import { matchBranch, type Branch, type BranchMatch } from '@/lib/services/branch-matcher'

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
  read_at?: string | null
  error_message?: string | null
}

interface Voter {
  id: string
  first_name: string
  last_name: string
  phone: string
}

interface InboxViewProps {
  campaignId: string
  initialMessages: Message[]
  voters: Voter[]
  branches?: Branch[]
}

export default function InboxView({ campaignId, initialMessages, voters, branches = [] }: InboxViewProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [selectedVoterId, setSelectedVoterId] = useState<string | null>(null)
  const [suggestedResponse, setSuggestedResponse] = useState<BranchMatch | null>(null)
  const [prefillBody, setPrefillBody] = useState<string | null>(null)

  const selectedVoter = voters.find((v) => v.id === selectedVoterId)
  const selectedMessages = messages.filter((m) => m.voter_id === selectedVoterId)

  // Match the latest inbound message from the selected voter against branches
  const latestInbound = useMemo(() => {
    if (!selectedVoterId) return null
    const inboundMsgs = selectedMessages.filter((m) => m.direction === 'inbound')
    return inboundMsgs.length > 0 ? inboundMsgs[inboundMsgs.length - 1] : null
  }, [selectedVoterId, selectedMessages])

  useEffect(() => {
    if (latestInbound && branches.length > 0) {
      const match = matchBranch(latestInbound.body, branches)
      setSuggestedResponse(match)
    } else {
      setSuggestedResponse(null)
    }
  }, [latestInbound, branches])

  function handleUseSuggestion() {
    if (suggestedResponse) {
      setPrefillBody(suggestedResponse.response_body)
      setSuggestedResponse(null)
    }
  }

  function handlePrefillConsumed() {
    setPrefillBody(null)
  }

  // Subscribe to real-time messages
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`messages:campaign:${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          const updated = payload.new as Message
          setMessages((prev) =>
            prev.map((m) => (m.id === updated.id ? updated : m))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [campaignId])

  const handleSent = useCallback(() => {
    // Real-time subscription will handle adding the message
  }, [])

  return (
    <div className="flex h-full">
      {/* Left panel: conversation list */}
      <div className="w-80 border-r border-[var(--color-muted)]/20 bg-[var(--color-bg)] shrink-0">
        <ConversationList
          voters={voters}
          messages={messages}
          selectedVoterId={selectedVoterId}
          onSelect={setSelectedVoterId}
        />
      </div>

      {/* Right panel: chat thread + compose */}
      <div className="flex-1 flex flex-col bg-[var(--color-bg)]">
        {selectedVoter ? (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-[var(--color-muted)]/20 bg-[var(--color-surface)]">
              <p className="text-sm font-medium text-[var(--color-text)]">
                {selectedVoter.first_name} {selectedVoter.last_name}
              </p>
              <p className="text-xs text-[var(--color-muted)]">{selectedVoter.phone}</p>
            </div>

            {/* Messages */}
            <ChatThread
              messages={selectedMessages}
              voterName={`${selectedVoter.first_name} ${selectedVoter.last_name}`}
            />

            {/* Branch suggestion banner */}
            {suggestedResponse && (
              <div className="px-4 py-2 bg-[var(--color-accent)]/10 border-t border-[var(--color-accent)]/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitBranch size={14} className="text-[var(--color-accent)]" />
                  <span className="text-xs text-[var(--color-text)]">
                    Suggested: <span className="font-display">{suggestedResponse.label}</span>
                  </span>
                </div>
                <button
                  onClick={handleUseSuggestion}
                  className="text-xs font-display bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg px-3 py-1 transition-colors"
                >
                  USE RESPONSE
                </button>
              </div>
            )}

            {/* Compose */}
            <ComposeBox
              campaignId={campaignId}
              voterId={selectedVoterId!}
              onSent={handleSent}
              prefillBody={prefillBody}
              onPrefillConsumed={handlePrefillConsumed}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare size={48} className="mx-auto mb-3 text-[var(--color-muted)] opacity-30" />
              <p className="text-[var(--color-muted)]">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
