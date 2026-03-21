'use client'

import { useState, useRef, useEffect } from 'react'
import { executeTask, type Message } from '@/lib/pwa-api'
import { STATS_DISPLAY } from '@/data/stats'

const PROMPTS = [
  'Send an invoice via Stripe and notify on Slack',
  'Create a new CRM contact and add to a workflow',
  'Post the same message to all social channels',
  'Schedule a meeting and send confirmation email',
  'Generate a weekly report from Google Sheets',
  'Set up a webhook to track new orders',
]

export default function Terminal() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isOffline, setIsOffline] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    setIsOffline(!navigator.onLine)
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)
    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isStreaming) return

    const userMessage: Message = { role: 'user', content: trimmed }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsStreaming(true)

    const assistantMessage: Message = { role: 'assistant', content: '' }
    setMessages([...newMessages, assistantMessage])

    abortRef.current = new AbortController()

    try {
      await executeTask(
        newMessages,
        (chunk) => {
          assistantMessage.content += chunk
          setMessages((prev) => [...prev.slice(0, -1), { ...assistantMessage }])
        },
        abortRef.current.signal
      )
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        assistantMessage.content = `Error: ${err.message}`
        setMessages((prev) => [...prev.slice(0, -1), { ...assistantMessage }])
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSubmit(input)
  }

  return (
    <div className="terminal-container">
      <div className="terminal-messages">
        {messages.length === 0 && (
          <div className="terminal-empty">
            <div className="logo">0n</div>
            <p>Describe a task to execute</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{STATS_DISPLAY.tools} tools across {STATS_DISPLAY.services} services</p>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              justifyContent: 'center',
              marginTop: 16,
              padding: '0 8px',
            }}>
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => handleSubmit(p)}
                  disabled={isStreaming}
                  style={{
                    background: 'rgba(126,217,87,0.06)',
                    border: '1px solid rgba(126,217,87,0.15)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    color: 'var(--text-secondary)',
                    fontSize: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`terminal-message ${msg.role}`}>
            {msg.content || (isStreaming && i === messages.length - 1 ? '...' : '')}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="terminal-input-bar" onSubmit={handleFormSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isOffline ? 'Offline — connect to send tasks' : 'Describe a task...'}
          disabled={isStreaming || isOffline}
          autoFocus
        />
        <button type="submit" disabled={isStreaming || isOffline || !input.trim()}>
          {isOffline ? 'Offline' : isStreaming ? 'Stop' : 'Send'}
        </button>
      </form>
    </div>
  )
}
