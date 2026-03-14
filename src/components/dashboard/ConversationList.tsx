'use client'

import { MessageCircle } from 'lucide-react'

interface Message {
  id: string
  campaign_id: string
  voter_id: string
  direction: string
  body: string
  status: string
  created_at: string
  read_at?: string | null
}

interface Voter {
  id: string
  first_name: string
  last_name: string
  phone: string
}

interface ConversationListProps {
  voters: Voter[]
  messages: Message[]
  selectedVoterId: string | null
  onSelect: (voterId: string) => void
}

export default function ConversationList({ voters, messages, selectedVoterId, onSelect }: ConversationListProps) {
  // Group messages by voter and get latest + unread count
  const voterSummaries = voters.map((voter) => {
    const voterMessages = messages.filter((m) => m.voter_id === voter.id)
    const lastMessage = voterMessages[voterMessages.length - 1] || null
    const unreadCount = voterMessages.filter(
      (m) => m.direction === 'inbound' && !m.read_at
    ).length

    return {
      voter,
      lastMessage,
      unreadCount,
      lastMessageTime: lastMessage ? new Date(lastMessage.created_at).getTime() : 0,
    }
  })

  // Sort by most recent message first, then alphabetically for those with no messages
  voterSummaries.sort((a, b) => {
    if (a.lastMessageTime && b.lastMessageTime) return b.lastMessageTime - a.lastMessageTime
    if (a.lastMessageTime) return -1
    if (b.lastMessageTime) return 1
    return a.voter.last_name.localeCompare(b.voter.last_name)
  })

  return (
    <div className="h-full overflow-y-auto">
      {voterSummaries.length === 0 ? (
        <div className="text-center py-10 px-4">
          <MessageCircle size={32} className="mx-auto mb-2 text-[var(--color-muted)] opacity-30" />
          <p className="text-sm text-[var(--color-muted)]">No voters in this campaign yet.</p>
        </div>
      ) : (
        voterSummaries.map(({ voter, lastMessage, unreadCount }) => (
          <button
            key={voter.id}
            onClick={() => onSelect(voter.id)}
            className={`w-full text-left px-4 py-3 border-b border-[var(--color-muted)]/10 transition-colors hover:bg-[var(--color-muted)]/5 ${
              selectedVoterId === voter.id ? 'bg-[var(--color-accent)]/10' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[var(--color-text)] truncate">
                {voter.first_name} {voter.last_name}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                {lastMessage && (
                  <span className="text-xs text-[var(--color-muted)]">
                    {formatTime(lastMessage.created_at)}
                  </span>
                )}
                {unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[var(--color-accent)] text-white text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
            {lastMessage ? (
              <p className="text-xs text-[var(--color-muted)] mt-1 truncate">
                {lastMessage.direction === 'outbound' ? 'You: ' : ''}
                {lastMessage.body}
              </p>
            ) : (
              <p className="text-xs text-[var(--color-muted)] mt-1 italic">No messages yet</p>
            )}
          </button>
        ))
      )}
    </div>
  )
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const oneDay = 86400000

  if (diff < oneDay && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (diff < oneDay * 7) {
    return date.toLocaleDateString([], { weekday: 'short' })
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
