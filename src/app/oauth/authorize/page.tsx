'use client'

/**
 * app/oauth/authorize/page.tsx
 *
 * The OAuth consent screen.
 * Shown after user is authenticated — asks them to approve scopes for the connecting app.
 * Dark theme, 0nORK brand (#6EE05A accent).
 */

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, Suspense } from 'react'

// ── Scope metadata ───────────────────────────────────────────────────────────
const SCOPE_META: Record<string, { label: string; description: string; icon: string }> = {
  'vault:read':          { label: 'Read Vault',          description: 'Load your encrypted API keys for active sessions', icon: '🔑' },
  'vault:write':         { label: 'Write Vault',         description: 'Save and remove credentials in your vault',        icon: '🔐' },
  'runs:read':         { label: 'Check Runs',        description: 'View your Runs balance and transaction history',  icon: '⚡' },
  'runs:spend':        { label: 'Spend Runs',        description: 'Deduct Runs when running automations',           icon: '💸' },
  'workflows:execute':   { label: 'Run Workflows',       description: 'Execute your purchased SWITCH file workflows',     icon: '⚙️' },
  'brain:read':          { label: 'Read Brain',          description: 'View Council Brain status and leaderboard',        icon: '🧠' },
  'brain:contribute':    { label: 'Contribute to Brain', description: 'Submit knowledge entries to the Council Brain',    icon: '📡' },
}

// ── Scope pill ───────────────────────────────────────────────────────────────
function ScopePill({ scope }: { scope: string }) {
  const meta = SCOPE_META[scope] ?? { label: scope, description: 'Custom permission', icon: '🔧' }
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '14px 16px',
      background: 'rgba(110, 224, 90, 0.06)',
      border: '1px solid rgba(110, 224, 90, 0.15)',
      borderRadius: '10px',
      marginBottom: '8px',
    }}>
      <span style={{ fontSize: '18px', lineHeight: 1, marginTop: '1px' }}>{meta.icon}</span>
      <div>
        <div style={{ color: '#e8e8ef', fontWeight: 600, fontSize: '14px', marginBottom: '2px' }}>
          {meta.label}
        </div>
        <div style={{ color: '#8888a0', fontSize: '12px', lineHeight: 1.4 }}>
          {meta.description}
        </div>
      </div>
    </div>
  )
}

// ── Main consent form ─────────────────────────────────────────────────────────
function ConsentForm() {
  const params      = useSearchParams()
  const router      = useRouter()
  const [loading, setLoading] = useState<'allow' | 'deny' | null>(null)
  const [error, setError]     = useState<string | null>(null)

  const clientId   = params.get('client_id')   ?? ''
  const clientName = params.get('client_name') ?? 'Unknown App'
  const redirectUri = params.get('redirect_uri') ?? ''
  const scope      = params.get('scope')       ?? ''
  const state      = params.get('state')       ?? ''
  const scopes     = scope.split(' ').filter(Boolean)

  async function handleDecision(approved: boolean) {
    setLoading(approved ? 'allow' : 'deny')
    setError(null)

    try {
      const res = await fetch('/api/oauth/authorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, redirect_uri: redirectUri, scope, state, approved }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error_description ?? 'Something went wrong. Please try again.')
        setLoading(null)
        return
      }

      // Redirect to client callback
      window.location.href = data.redirect
    } catch {
      setError('Network error. Please try again.')
      setLoading(null)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0B0F19',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Instrument Sans', system-ui, sans-serif",
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed',
        top: '-200px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: 'radial-gradient(ellipse, rgba(126,217,87,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '36px 32px',
        position: 'relative',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#6EE05A',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 800,
              color: '#0B0F19',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              0n
            </div>
            <span style={{ color: '#e8e8ef', fontWeight: 700, fontSize: '18px' }}>
              0nMCP
            </span>
          </div>

          {/* Connection indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '20px',
          }}>
            <div style={{
              padding: '6px 12px',
              background: 'rgba(0,212,255,0.1)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#00d4ff',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              {clientName}
            </div>
            <div style={{ color: '#444', fontSize: '14px' }}>→</div>
            <div style={{
              padding: '6px 12px',
              background: 'rgba(126,217,87,0.1)',
              border: '1px solid rgba(126,217,87,0.2)',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#6EE05A',
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              0nMCP
            </div>
          </div>

          <h1 style={{
            color: '#e8e8ef',
            fontSize: '20px',
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.3,
          }}>
            Authorize Access
          </h1>
          <p style={{ color: '#8888a0', fontSize: '14px', marginTop: '8px', marginBottom: 0 }}>
            <strong style={{ color: '#00d4ff' }}>{clientName}</strong> wants to connect to your 0nMCP account
          </p>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginBottom: '20px' }} />

        {/* Scopes */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{
            color: '#8888a0',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontWeight: 600,
            marginBottom: '12px',
            marginTop: 0,
          }}>
            This app will be able to:
          </p>
          {scopes.length > 0
            ? scopes.map(s => <ScopePill key={s} scope={s} />)
            : <ScopePill scope="vault:read" />
          }
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(255,80,80,0.1)',
            border: '1px solid rgba(255,80,80,0.25)',
            borderRadius: '8px',
            padding: '12px 14px',
            color: '#ff8080',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleDecision(false)}
            disabled={loading !== null}
            style={{
              flex: 1,
              padding: '13px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              color: '#8888a0',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading === 'deny' ? 0.7 : 1,
              transition: 'all 0.15s',
              fontFamily: "'Instrument Sans', system-ui, sans-serif",
            }}
          >
            {loading === 'deny' ? 'Denying…' : 'Deny'}
          </button>
          <button
            onClick={() => handleDecision(true)}
            disabled={loading !== null}
            style={{
              flex: 2,
              padding: '13px',
              background: loading === 'allow' ? '#4CAF3D' : '#6EE05A',
              border: 'none',
              borderRadius: '10px',
              color: '#0B0F19',
              fontSize: '14px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading !== null && loading !== 'allow' ? 0.5 : 1,
              transition: 'all 0.15s',
              fontFamily: "'Instrument Sans', system-ui, sans-serif",
              boxShadow: loading ? 'none' : '0 4px 20px rgba(126,217,87,0.3)',
            }}
          >
            {loading === 'allow' ? 'Connecting…' : 'Allow Access'}
          </button>
        </div>

        {/* Footer note */}
        <p style={{
          color: '#555570',
          fontSize: '11px',
          textAlign: 'center',
          marginTop: '16px',
          marginBottom: 0,
          lineHeight: 1.5,
        }}>
          You can revoke access anytime at{' '}
          <a
            href="https://www.0nmcp.com/console"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#6EE05A', textDecoration: 'none' }}
          >
            0nmcp.com/console
          </a>
        </p>
      </div>
    </div>
  )
}

// ── Page export ───────────────────────────────────────────────────────────────
export default function OAuthAuthorizePage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: '#0B0F19',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: '#6EE05A', fontFamily: 'JetBrains Mono, monospace' }}>
          Loading…
        </div>
      </div>
    }>
      <ConsentForm />
    </Suspense>
  )
}
