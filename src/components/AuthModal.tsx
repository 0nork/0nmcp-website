'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { useOAuthPopup } from '@/lib/hooks/useOAuthPopup'
import type { Provider } from '@supabase/supabase-js'

interface AuthModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  defaultMode?: 'signin' | 'signup'
}

// SVG icons for OAuth providers
const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
)

const OAUTH_PROVIDERS: { provider: Provider; label: string; Icon: React.FC; bg: string; color: string }[] = [
  { provider: 'linkedin_oidc' as Provider, label: 'LinkedIn', Icon: LinkedInIcon, bg: '#0A66C2', color: '#fff' },
  { provider: 'google' as Provider, label: 'Google', Icon: GoogleIcon, bg: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)' },
  { provider: 'github' as Provider, label: 'GitHub', Icon: GitHubIcon, bg: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)' },
]

export default function AuthModal({ open, onClose, onSuccess, defaultMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)

  const supabase = createSupabaseBrowser()

  const { signIn: oauthSignIn } = useOAuthPopup({
    onSuccess: () => {
      setOauthLoading(null)
      onClose()
      onSuccess?.()
    },
    onError: (err) => {
      setOauthLoading(null)
      setError(err)
    },
  })

  // ESC to close
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setError('')
      setMagicLinkSent(false)
      setOauthLoading(null)
      setMode(defaultMode)
    }
  }, [open, defaultMode])

  if (!open) return null

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase) { setError('Auth not configured'); return }
    setError('')
    setLoading(true)

    if (mode === 'signin') {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'}/api/auth/callback?redirect=/0nboarding`,
        },
      })
      if (err) { setError(err.message); setLoading(false); return }
      setMagicLinkSent(true)
      setLoading(false)
      return
    }

    setLoading(false)
    onClose()
    onSuccess?.()
  }

  async function handleMagicLink() {
    if (!email) { setError('Enter your email first'); return }
    if (!supabase) { setError('Auth not configured'); return }
    setError('')
    setLoading(true)

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'}/api/auth/callback?redirect=/console`,
      },
    })

    if (err) { setError(err.message); setLoading(false); return }
    setMagicLinkSent(true)
    setLoading(false)
  }

  function handleOAuth(provider: Provider) {
    setError('')
    setOauthLoading(provider as string)
    oauthSignIn(provider)
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(10, 10, 15, 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'console-fade-in 0.15s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          margin: '0 1rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '1rem',
          padding: '2rem',
          animation: 'console-scale-in 0.2s ease',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(126,217,87,0.15), rgba(0,212,255,0.1))',
            border: '1px solid rgba(126,217,87,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '1.25rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            color: '#7ed957',
          }}>
            0n
          </div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
            margin: 0,
          }}>
            {mode === 'signin' ? 'Sign in to 0nMCP' : 'Create your vault'}
          </h2>
          <p style={{
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            marginTop: '0.5rem',
          }}>
            {mode === 'signin' ? 'Access your vault, workflows, and console.' : 'Free forever. No credit card required.'}
          </p>
        </div>

        {magicLinkSent ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Check your email for a {mode === 'signup' ? 'verification' : 'sign-in'} link.
            </p>
            <button
              className="auth-btn secondary"
              onClick={() => setMagicLinkSent(false)}
              style={{ maxWidth: '200px', margin: '0 auto' }}
            >
              Back
            </button>
          </div>
        ) : (
          <>
            {/* OAuth Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.25rem' }}>
              {OAUTH_PROVIDERS.map(({ provider, label, Icon, bg, color }) => (
                <button
                  key={provider}
                  onClick={() => handleOAuth(provider)}
                  disabled={!!oauthLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    height: '48px',
                    borderRadius: '0.5rem',
                    border: bg.startsWith('#') ? 'none' : '1px solid var(--border)',
                    background: bg,
                    color,
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    fontFamily: 'var(--font-display)',
                    cursor: oauthLoading ? 'wait' : 'pointer',
                    opacity: oauthLoading && oauthLoading !== (provider as string) ? 0.5 : 1,
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!bg.startsWith('#')) e.currentTarget.style.borderColor = 'var(--accent)'
                  }}
                  onMouseLeave={(e) => {
                    if (!bg.startsWith('#')) e.currentTarget.style.borderColor = 'var(--border)'
                  }}
                >
                  {oauthLoading === (provider as string) ? (
                    <span className="signup-spinner" />
                  ) : (
                    <Icon />
                  )}
                  Continue with {label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="auth-divider" style={{ margin: '1.25rem 0' }}>
              <span>or continue with email</span>
            </div>

            {error && <div className="auth-error" style={{ marginBottom: '0.75rem' }}>{error}</div>}

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="auth-form" style={{ gap: '0.75rem' }}>
              {mode === 'signup' && (
                <div className="auth-field">
                  <label htmlFor="modal-name">Full name</label>
                  <input
                    id="modal-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Smith"
                    required
                    autoComplete="name"
                  />
                </div>
              )}
              <div className="auth-field">
                <label htmlFor="modal-email">Email</label>
                <input
                  id="modal-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="auth-field">
                <label htmlFor="modal-password">Password</label>
                <input
                  id="modal-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Min 8 characters' : 'Your password'}
                  required
                  minLength={mode === 'signup' ? 8 : undefined}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                />
              </div>
              <button type="submit" className="auth-btn primary" disabled={loading}>
                {loading ? (mode === 'signin' ? 'Signing in...' : 'Creating vault...') : (mode === 'signin' ? 'Sign in' : 'Create account')}
              </button>
            </form>

            {mode === 'signin' && (
              <button
                className="auth-btn secondary"
                onClick={handleMagicLink}
                disabled={loading}
                style={{ marginTop: '0.625rem' }}
              >
                Send magic link
              </button>
            )}

            {/* Toggle mode */}
            <p style={{
              textAlign: 'center',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)',
              marginTop: '1rem',
              marginBottom: 0,
            }}>
              {mode === 'signin' ? (
                <>No account?{' '}<button onClick={() => { setMode('signup'); setError('') }} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}>Create one</button></>
              ) : (
                <>Already have one?{' '}<button onClick={() => { setMode('signin'); setError('') }} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8125rem' }}>Sign in</button></>
              )}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
