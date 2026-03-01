'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Bot, Send, User, Download, Blocks, Sparkles } from 'lucide-react'

/* ──────────────────────────────────────────── */
/*  Types                                      */
/* ──────────────────────────────────────────── */

interface Message {
  role: 'user' | 'assistant'
  text: string
  timestamp: string
  workflow?: Record<string, unknown> | null
  savedWorkflowId?: string | null
}

interface CreateViewProps {
  onAddToBuilder?: (workflow: Record<string, unknown>) => void
}

/* ──────────────────────────────────────────── */
/*  CreateView                                 */
/* ──────────────────────────────────────────── */

export function CreateView({ onAddToBuilder }: CreateViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const greetedRef = useRef(false)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Initial greeting
  useEffect(() => {
    if (greetedRef.current) return
    greetedRef.current = true
    setMessages([
      {
        role: 'assistant',
        text: "Hey! I'm the 0n Create Agent. I'll help you build the perfect SWITCH file (.0n workflow) step by step.\n\nWhat would you like to automate?\n\n1. Lead capture & CRM pipeline\n2. Scheduled social media posting\n3. Customer onboarding sequence\n4. Data sync between services\n5. Something else — just describe it!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }, [])

  // Build conversation history for API
  const getHistory = useCallback(() => {
    return messages.slice(-20).map((m) => ({
      role: m.role,
      content: m.text,
    }))
  }, [messages])

  // Send message
  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return

      const userMsg: Message = {
        role: 'user',
        text: trimmed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setLoading(true)

      try {
        const res = await fetch('/api/console/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            history: getHistory(),
          }),
        })

        const data = await res.json()

        const assistantMsg: Message = {
          role: 'assistant',
          text: data.text || 'Something went wrong. Try again!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          workflow: data.workflow || null,
          savedWorkflowId: data.savedWorkflowId || null,
        }
        setMessages((prev) => [...prev, assistantMsg])
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: 'Connection error. Check your network and try again.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
      } finally {
        setLoading(false)
        inputRef.current?.focus()
      }
    },
    [getHistory]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!loading && input.trim()) sendMessage(input)
  }

  const handleDownload = (workflow: Record<string, unknown>) => {
    const header = (workflow.$0n || workflow['0n']) as Record<string, string> | undefined
    const name = header?.name || 'workflow'
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${slug}.0n`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <Sparkles size={20} style={{ color: 'var(--accent)' }} />
        <span
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent)',
            letterSpacing: '0.02em',
          }}
        >
          0n Create
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Build your perfect SWITCH file
        </span>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          minHeight: 0,
        }}
      >
        {messages.map((msg, i) => (
          <div key={i}>
            <MessageBubble message={msg} />
            {/* Workflow action buttons */}
            {msg.workflow && (
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  paddingLeft: 36,
                  marginTop: 10,
                  flexWrap: 'wrap',
                }}
              >
                <button
                  onClick={() => onAddToBuilder?.(msg.workflow!)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--accent)',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    color: 'var(--accent)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 255, 136, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 255, 136, 0.1)'
                  }}
                >
                  <Blocks size={14} />
                  Open in Builder
                </button>
                <button
                  onClick={() => handleDownload(msg.workflow!)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    color: 'var(--text-primary)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)'
                  }}
                >
                  <Download size={14} />
                  Download .0n
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Loading dots */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bot size={14} style={{ color: 'var(--accent)' }} />
            </span>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '14px 14px 14px 4px',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <span className="create-dot" style={{ animationDelay: '0s' }} />
              <span className="create-dot" style={{ animationDelay: '0.2s' }} />
              <span className="create-dot" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe what you want to automate..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid var(--border)',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontSize: '0.8125rem',
            outline: 'none',
            fontFamily: 'inherit',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)' }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            border: 'none',
            backgroundColor: loading || !input.trim() ? 'rgba(255, 255, 255, 0.04)' : 'var(--accent)',
            color: loading || !input.trim() ? 'var(--text-muted)' : 'var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          <Send size={16} />
        </button>
      </form>

      <style>{`
        .create-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--text-muted);
          animation: createDotPulse 1s ease-in-out infinite;
        }
        @keyframes createDotPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes createMsgIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

/* ──────────────────────────────────────────── */
/*  Message Bubble                             */
/* ──────────────────────────────────────────── */

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        flexDirection: 'column',
        gap: 4,
        animation: 'createMsgIn 0.25s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          maxWidth: '85%',
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}
      >
        {/* Avatar */}
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: isUser ? 'rgba(255, 107, 53, 0.15)' : 'rgba(0, 255, 136, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isUser ? (
            <User size={14} style={{ color: '#ff6b35' }} />
          ) : (
            <Bot size={14} style={{ color: 'var(--accent)' }} />
          )}
        </span>

        {/* Bubble */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
            backgroundColor: isUser ? 'rgba(255, 107, 53, 0.15)' : 'var(--bg-card)',
            border: isUser ? '1px solid rgba(255, 107, 53, 0.25)' : '1px solid var(--border)',
            borderLeft: isUser ? undefined : '3px solid var(--accent)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.8125rem',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {message.text}
          </p>
          <span
            style={{
              display: 'block',
              fontSize: '0.625rem',
              color: 'var(--text-muted)',
              marginTop: 4,
              textAlign: isUser ? 'right' : 'left',
            }}
          >
            {message.timestamp}
          </span>
        </div>
      </div>
    </div>
  )
}
