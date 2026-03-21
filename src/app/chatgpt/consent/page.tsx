'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type ConsentState = 'loading' | 'login' | 'consent' | 'error' | 'done'

export default function ConsentPage() {
  const params = useSearchParams()
  const authReqId = params.get('auth_req_id')
  const scope = params.get('scope') ?? ''
  const clientName = params.get('client_name') ?? 'ChatGPT'

  const [state, setState] = useState<ConsentState>('loading')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authReqId) { setState('error'); setError('Missing auth_req_id'); return }
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(s => setState(s.userId ? 'consent' : 'login'))
      .catch(() => setState('login'))
  }, [authReqId])

  const handleApprove = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/chatgpt/oauth/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auth_req_id: authReqId }),
      })
      const { redirect_to } = await res.json()
      if (redirect_to) window.location.href = redirect_to
      else throw new Error('No redirect URL returned')
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const scopeLabels: Record<string, string> = {
    'openid': 'Verify your identity',
    'profile': 'Read your profile name',
    'email': 'Read your email address',
    '0nmcp:tools:read': 'Browse your available tools',
    '0nmcp:tools:execute': 'Execute tools on your behalf',
    '0nmcp:account:read': 'Read your account details',
    '0nmcp:runs:read': 'Read your Runs balance',
    '0nmcp:runs:purchase': 'Purchase Runs',
  }

  const scopeList = scope.split(' ').filter(Boolean)

  const s = {
    page: { alignItems: 'center' as const, background: '#080B0F', display: 'flex', justifyContent: 'center', minHeight: '100vh', padding: 24 },
    card: { background: '#0E1117', border: '1px solid #1e2533', borderRadius: 16, maxWidth: 440, padding: 32, width: '100%' },
    logo: { fontFamily: "'Barlow',sans-serif", fontWeight: 900, fontSize: 28, color: '#6EE05A', marginBottom: 4 },
    h2: { fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 },
    p: { color: '#7a8694', fontSize: 14, lineHeight: 1.6, marginBottom: 20 },
    scopeBox: { background: '#080B0F', border: '1px solid #1e2533', borderRadius: 8, marginBottom: 20, padding: '12px 16px' },
    scopeItem: { color: '#e2e8f0', fontSize: 13, padding: '5px 0', display: 'flex', gap: 8, alignItems: 'center' as const },
    btn: { background: '#6EE05A', border: 'none', borderRadius: 8, color: '#080B0F', cursor: 'pointer', fontFamily: "'Barlow',sans-serif", fontWeight: 900, fontSize: 15, padding: '12px 24px', width: '100%', marginTop: 8 },
    input: { background: '#080B0F', border: '1px solid #1e2533', borderRadius: 8, color: '#e2e8f0', fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, padding: '10px 14px', width: '100%', marginBottom: 12, boxSizing: 'border-box' as const },
    err: { background: 'rgba(255,80,80,.08)', border: '1px solid rgba(255,80,80,.2)', borderRadius: 8, color: '#ff6b6b', fontSize: 13, marginTop: 12, padding: '10px 14px' },
  }

  if (state === 'loading') return (
    <div style={s.page}><div style={s.card}>
      <div style={s.logo}>0n</div>
      <p style={s.p}>Verifying your session...</p>
    </div></div>
  )

  if (state === 'error') return (
    <div style={s.page}><div style={s.card}>
      <div style={s.logo}>0n</div>
      <p style={{ ...s.p, color: '#ff6b6b' }}>{error ?? 'Authorization error'}</p>
    </div></div>
  )

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>0n</div>
        <h2 style={s.h2}>{clientName} wants to connect to 0nMCP</h2>
        <p style={s.p}>
          This will allow {clientName} to use your 0nMCP tools and Runs balance
          directly inside your conversations.
        </p>

        <div style={s.scopeBox}>
          <p style={{ ...s.p, marginBottom: 8, fontSize: 12, textTransform: 'uppercase' as const, letterSpacing: '.06em' }}>Permissions requested</p>
          {scopeList.map(sc => (
            <div key={sc} style={s.scopeItem}>
              <span style={{ color: '#6EE05A' }}>&#10003;</span>
              {scopeLabels[sc] ?? sc}
            </div>
          ))}
        </div>

        {state === 'login' && (
          <>
            <p style={s.p}>Log in to your 0nMCP account to continue.</p>
            <input
              style={s.input}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <button
              style={{ ...s.btn, opacity: loading ? .6 : 1 }}
              disabled={loading}
              onClick={() => {
                setLoading(true)
                fetch('/api/auth/magic-link', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, redirectTo: window.location.href }),
                })
                  .then(() => setError('Check your email for a login link'))
                  .catch(() => setError('Failed to send login link'))
                  .finally(() => setLoading(false))
              }}
            >
              {loading ? 'Sending...' : 'Send login link'}
            </button>
          </>
        )}

        {state === 'consent' && (
          <button
            style={{ ...s.btn, opacity: loading ? .6 : 1 }}
            disabled={loading}
            onClick={handleApprove}
          >
            {loading ? 'Connecting...' : `Connect 0nMCP to ${clientName}`}
          </button>
        )}

        {error && <div style={s.err}>{error}</div>}
      </div>
    </div>
  )
}
