'use client'

import { useState } from 'react'

export default function BlogSubscribe() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    try {
      const res = await fetch('/api/blog/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage('Subscribed! You\'ll get notified about new posts.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong')
      }
    } catch {
      setStatus('error')
      setMessage('Network error — try again')
    }
  }

  return (
    <div
      style={{
        marginTop: '3rem',
        padding: '2rem',
        borderRadius: '0.875rem',
        border: '1px solid var(--border)',
        background: 'var(--bg-card)',
        textAlign: 'center',
      }}
    >
      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-display)',
          margin: '0 0 0.5rem',
        }}
      >
        Stay in the loop
      </h3>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          margin: '0 0 1.25rem',
          lineHeight: 1.6,
        }}
      >
        Get notified when we publish new articles about AI orchestration, workflows, and 0nMCP updates.
      </p>

      {status === 'success' ? (
        <div
          style={{
            fontSize: '0.875rem',
            color: 'var(--accent)',
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {message}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            gap: '0.5rem',
            maxWidth: '420px',
            margin: '0 auto',
          }}
        >
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{
              flex: 1,
              padding: '0.625rem 0.875rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'var(--accent)',
              color: '#0a0a0f',
              fontSize: '0.8125rem',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              cursor: status === 'loading' ? 'wait' : 'pointer',
              opacity: status === 'loading' ? 0.7 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <div
          style={{
            marginTop: '0.75rem',
            fontSize: '0.8125rem',
            color: '#ef4444',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {message}
        </div>
      )}
    </div>
  )
}
