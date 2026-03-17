'use client'

import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'

interface Conversation {
  id: string
  contactId: string
  contactName: string
  lastMessageBody: string
  lastMessageDate: string
  lastMessageType: 'incoming' | 'outgoing'
  unreadCount: number
  type: string
}

interface Message {
  id: string
  body: string
  direction: 'inbound' | 'outbound'
  dateAdded: string
  type: string
  status?: string
  contactId?: string
}

interface ConversationsResponse {
  conversations: Conversation[]
  total: number
}

interface MessagesResponse {
  messages: Message[]
  nextCursor?: string
}

function Spinner({ size = 20 }: { size?: number }): ReactNode {
  return (
    <div style={{
      width: size, height: size, border: '2px solid rgba(255,255,255,0.1)',
      borderTopColor: '#7ed957', borderRadius: '50%',
      animation: 'conv-spin 0.6s linear infinite',
    }} />
  )
}

function formatTime(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (days === 1) return 'Yesterday'
  if (days < 7) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function ConversationsView() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const fetchConversations = useCallback(async () => {
    try {
      setLoadingList(true)
      setError(null)
      const res = await fetch('/api/console/crm/conversations')
      if (!res.ok) throw new Error(`Failed to fetch conversations (${res.status})`)
      const data: ConversationsResponse = await res.json()
      setConversations(data.conversations || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations')
    } finally {
      setLoadingList(false)
    }
  }, [])

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      setLoadingMessages(true)
      const res = await fetch(`/api/console/crm/conversations/messages?conversationId=${conversationId}`)
      if (!res.ok) throw new Error(`Failed to fetch messages (${res.status})`)
      const data: MessagesResponse = await res.json()
      setMessages(data.messages || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId)
      // Poll every 10 seconds
      pollRef.current = setInterval(() => fetchMessages(selectedId), 10000)
      return () => { if (pollRef.current) clearInterval(pollRef.current) }
    } else {
      setMessages([])
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [selectedId, fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!messageText.trim() || !selectedId) return
    const body = messageText.trim()
    setMessageText('')
    setSending(true)

    // Optimistic add
    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      body,
      direction: 'outbound',
      dateAdded: new Date().toISOString(),
      type: 'SMS',
    }
    setMessages(prev => [...prev, tempMsg])

    try {
      const res = await fetch('/api/console/crm/conversations/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: selectedId, body }),
      })
      if (!res.ok) throw new Error('Failed to send')
      // Refresh messages
      fetchMessages(selectedId)
    } catch {
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id))
      setError('Failed to send message')
    } finally {
      setSending(false)
    }
  }, [messageText, selectedId, fetchMessages])

  const selectedConv = conversations.find(c => c.id === selectedId)

  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      {/* Left panel: Conversation list */}
      <div style={{
        width: 320, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{
          padding: '1.25rem 1rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <h2 style={{
            fontSize: '0.875rem', fontWeight: 700, color: '#e8eaed', margin: '0 0 0.125rem',
            fontFamily: 'var(--font-display)',
          }}>
            Inbox
          </h2>
          <p style={{ fontSize: '0.7rem', color: '#5f6672', margin: 0 }}>
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {loadingList && (
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
              <Spinner />
            </div>
          )}

          {!loadingList && conversations.length === 0 && !error && (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#5f6672', fontSize: '0.8rem' }}>
              No conversations yet.
            </div>
          )}

          {error && !loadingList && (
            <div style={{ padding: '1rem' }}>
              <div style={{
                padding: '0.75rem', borderRadius: 8, background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.75rem', color: '#ef4444',
                marginBottom: '0.5rem',
              }}>
                {error}
              </div>
              <button
                onClick={fetchConversations}
                style={{
                  padding: '0.375rem 0.75rem', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)',
                  background: 'transparent', color: '#ef4444', fontSize: '0.7rem',
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Retry
              </button>
            </div>
          )}

          {conversations.map(conv => {
            const active = conv.id === selectedId
            return (
              <button
                key={conv.id}
                onClick={() => { setSelectedId(conv.id); setError(null) }}
                style={{
                  width: '100%', padding: '0.875rem 1rem', textAlign: 'left',
                  background: active ? 'rgba(126,217,87,0.06)' : 'transparent',
                  border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  cursor: 'pointer', fontFamily: 'inherit',
                  borderLeft: active ? '2px solid #7ed957' : '2px solid transparent',
                  transition: 'all 0.1s ease',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{
                    fontSize: '0.8rem', fontWeight: conv.unreadCount > 0 ? 700 : 500,
                    color: conv.unreadCount > 0 ? '#e8eaed' : '#9aa0a8',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
                  }}>
                    {conv.contactName || 'Unknown'}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: '#5f6672', flexShrink: 0, marginLeft: 8 }}>
                    {formatTime(conv.lastMessageDate)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    flex: 1, fontSize: '0.7rem', color: '#5f6672',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {conv.lastMessageType === 'outgoing' ? 'You: ' : ''}{conv.lastMessageBody || 'No messages'}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span style={{
                      fontSize: '0.6rem', fontWeight: 700, padding: '0.1rem 0.4rem',
                      borderRadius: 8, background: '#7ed957', color: '#0a0a0f', flexShrink: 0,
                    }}>
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right panel: Messages */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!selectedId ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '0.5rem',
          }}>
            <div style={{ fontSize: '1.25rem', color: '#3a3a4a' }}>Select a conversation</div>
            <p style={{ fontSize: '0.8rem', color: '#5f6672', margin: 0 }}>
              Choose a thread from the inbox to view messages.
            </p>
          </div>
        ) : (
          <>
            {/* Message header */}
            <div style={{
              padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: 'rgba(126,217,87,0.12)',
                border: '1px solid rgba(126,217,87,0.2)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem',
                fontWeight: 700, color: '#7ed957', flexShrink: 0,
              }}>
                {(selectedConv?.contactName || '?')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e8eaed' }}>
                  {selectedConv?.contactName || 'Unknown'}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#5f6672' }}>
                  {selectedConv?.type || 'SMS'}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflow: 'auto', padding: '1rem 1.25rem' }}>
              {loadingMessages && messages.length === 0 && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                  <Spinner />
                </div>
              )}

              {!loadingMessages && messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#5f6672', fontSize: '0.8rem' }}>
                  No messages in this conversation yet.
                </div>
              )}

              {messages.map(msg => {
                const outbound = msg.direction === 'outbound'
                return (
                  <div key={msg.id} style={{
                    display: 'flex', justifyContent: outbound ? 'flex-end' : 'flex-start',
                    marginBottom: '0.625rem',
                  }}>
                    <div style={{
                      maxWidth: '70%', padding: '0.625rem 0.875rem', borderRadius: 12,
                      background: outbound ? 'rgba(126,217,87,0.12)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${outbound ? 'rgba(126,217,87,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      borderBottomRightRadius: outbound ? 4 : 12,
                      borderBottomLeftRadius: outbound ? 12 : 4,
                    }}>
                      <div style={{
                        fontSize: '0.8rem', color: outbound ? '#c8f0b0' : '#9aa0a8',
                        lineHeight: 1.5, wordBreak: 'break-word',
                      }}>
                        {msg.body}
                      </div>
                      <div style={{
                        fontSize: '0.6rem', color: outbound ? 'rgba(126,217,87,0.5)' : '#3a3a4a',
                        marginTop: 4, textAlign: outbound ? 'right' : 'left',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {msg.dateAdded ? new Date(msg.dateAdded).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        {msg.status ? ` · ${msg.status}` : ''}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Send input */}
            <div style={{
              padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', gap: '0.5rem',
            }}>
              <input
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="Type a message..."
                style={{
                  flex: 1, padding: '0.625rem 1rem', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
                  color: '#e8eaed', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(126,217,87,0.3)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
              <button
                onClick={handleSend}
                disabled={!messageText.trim() || sending}
                style={{
                  padding: '0.625rem 1.25rem', borderRadius: 8, border: 'none',
                  background: messageText.trim() ? '#7ed957' : 'rgba(255,255,255,0.05)',
                  color: messageText.trim() ? '#0a0a0f' : '#5f6672',
                  fontSize: '0.8rem', fontWeight: 700, cursor: messageText.trim() ? 'pointer' : 'default',
                  fontFamily: 'inherit', transition: 'all 0.15s ease',
                  opacity: sending ? 0.6 : 1,
                }}
              >
                {sending ? 'Sending' : 'Send'}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes conv-spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
