'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
  executions?: ExecutionResult[]
  timestamp: number
}

interface ExecutionResult {
  tool: string
  status: 'success' | 'error'
  data?: Record<string, unknown>
  error?: string
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auth check — only mike@rocketopp.com
  useEffect(() => {
    fetch('/api/console/account')
      .then(r => r.ok ? r.json() : Promise.reject('unauthorized'))
      .then(data => {
        if (data.email === 'mike@rocketopp.com') {
          setAuthorized(true)
          setMessages([{
            role: 'assistant',
            content: `Ready. Full execution engine online — CRM, Stripe, Slack, Supabase FDW all connected.\n\nTry: "Show me my Stripe revenue this month" or "Create a CRM contact for test@example.com"`,
            timestamp: Date.now(),
          }])
        } else {
          setAuthorized(false)
        }
      })
      .catch(() => setAuthorized(false))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    setLoading(true)

    const userMsg: Message = { role: 'user', content: text, timestamp: Date.now() }
    setMessages(prev => [...prev, userMsg])

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      history.push({ role: 'user', content: text })

      const res = await fetch('/api/console/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          source: '0nmcp',
          enableExecution: true,
        }),
      })

      if (!res.ok) throw new Error(`${res.status}`)

      // Handle SSE stream
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No reader')

      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''
      const executions: ExecutionResult[] = []

      // Add placeholder assistant message
      const assistantIdx = messages.length + 1
      setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: Date.now() }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const parsed = JSON.parse(data) as { type?: string; content?: string; text?: string; tool?: string; status?: string; data?: Record<string, unknown>; error?: string }
            if (parsed.type === 'execution') {
              executions.push({
                tool: parsed.tool || 'unknown',
                status: (parsed.status as 'success' | 'error') || 'success',
                data: parsed.data,
                error: parsed.error,
              })
            } else if (parsed.type === 'text' || parsed.content || parsed.text) {
              fullContent += parsed.content || parsed.text || ''
            }
          } catch {
            // Plain text chunk
            fullContent += data
          }

          setMessages(prev => {
            const updated = [...prev]
            updated[assistantIdx] = {
              role: 'assistant',
              content: fullContent,
              executions: executions.length > 0 ? [...executions] : undefined,
              timestamp: Date.now(),
            }
            return updated
          })
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Failed to connect'}`,
        timestamp: Date.now(),
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [input, loading, messages])

  if (authorized === null) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '2px solid #1e293b', borderTopColor: '#7ed957', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (authorized === false) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>Access Denied</div>
          <p>This interface is restricted to mike@rocketopp.com</p>
          <a href="/login" style={{ color: '#7ed957', textDecoration: 'none', fontWeight: 600 }}>Login</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0d1117', color: '#e8eaed',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        height: 52, padding: '0 1.5rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        borderBottom: '1px solid #1e293b', flexShrink: 0,
      }}>
        <Image src="/brand/0nmcp-logo-dark.svg" alt="0nMCP" width={28} height={28} style={{ borderRadius: 6 }} />
        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#7ed957' }}>0nAI</span>
        <span style={{ fontSize: '0.75rem', color: '#4a5568' }}>Full Execution Mode</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#7ed957', boxShadow: '0 0 6px #7ed957' }} />
          <span style={{ fontSize: '0.7rem', color: '#4a5568' }}>mike@rocketopp.com</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: '1.25rem',
            display: 'flex', flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '80%', padding: '0.875rem 1.125rem',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? '#1e3a2f' : '#161b22',
              border: `1px solid ${msg.role === 'user' ? '#2d5a3f' : '#1e293b'}`,
              fontSize: '0.875rem', lineHeight: 1.7,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {msg.content || (loading && i === messages.length - 1 ? (
                <span style={{ display: 'flex', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7ed957', animation: 'pulse 1s infinite' }} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7ed957', animation: 'pulse 1s infinite 0.2s' }} />
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7ed957', animation: 'pulse 1s infinite 0.4s' }} />
                </span>
              ) : '')}
            </div>

            {/* Execution badges */}
            {msg.executions && msg.executions.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem', maxWidth: '80%' }}>
                {msg.executions.map((ex, j) => (
                  <div key={j} style={{
                    padding: '0.25rem 0.625rem', borderRadius: 6,
                    background: ex.status === 'success' ? 'rgba(126,217,87,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${ex.status === 'success' ? 'rgba(126,217,87,0.25)' : 'rgba(239,68,68,0.25)'}`,
                    fontSize: '0.7rem', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
                    color: ex.status === 'success' ? '#7ed957' : '#ef4444',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    {ex.status === 'success' ? (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    )}
                    {ex.tool}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '1rem 1.5rem 1.25rem', borderTop: '1px solid #1e293b',
        background: '#0d1117',
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: '0.75rem',
          background: '#161b22', border: '1px solid #2d3748',
          borderRadius: 14, padding: '0.625rem 0.875rem',
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Ask anything — executes real API calls..."
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#e8eaed', fontSize: '0.875rem', lineHeight: 1.5,
              resize: 'none', fontFamily: 'inherit', maxHeight: 120,
            }}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            style={{
              width: 36, height: 36, borderRadius: 10, border: 'none',
              background: input.trim() ? '#7ed957' : '#1e293b',
              color: input.trim() ? '#000' : '#4a5568',
              cursor: input.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s', flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#2d3748', marginTop: 6 }}>
          0nAI executes real API calls. CRM + Stripe + Slack + Supabase FDW connected.
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        textarea::placeholder { color: #4a5568; }
      `}</style>
    </div>
  )
}
