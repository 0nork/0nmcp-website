'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import type { Provider } from '@supabase/supabase-js'

type Mode = 'signup' | 'signin'
type Step = 'email' | 'password' | 'confirming'

/* ── OAuth icon components ─────────────────────────────────────── */

const LinkedInIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
  </svg>
)

/* ── Component ────────────────────────────────────────────────── */

export default function TurnItOnSignup() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('signup')
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in')
  const [magicSent, setMagicSent] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (step !== 'confirming') {
      const t = setTimeout(() => inputRef.current?.focus(), 350)
      return () => clearTimeout(t)
    }
  }, [step])

  function transitionTo(next: Step) {
    setFadeState('out')
    setTimeout(() => {
      setStep(next)
      setError('')
      setFadeState('in')
    }, 300)
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address')
      return
    }
    setError('')
    transitionTo('password')
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setError('')
    setLoading(true)
    try {
      const supabase = createSupabaseBrowser()
      if (!supabase) throw new Error('Connection failed')

      if (mode === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.0nmcp.com'}/api/auth/callback?redirect=/console`,
          },
        })
        if (signUpError) {
          if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: email.trim(), password,
            })
            if (signInError) { setError(signInError.message); setLoading(false); return }
          } else {
            setError(signUpError.message); setLoading(false); return
          }
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(), password,
        })
        if (signInError) { setError(signInError.message); setLoading(false); return }
      }
      router.push('/console')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  async function handleMagicLink() {
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter your email first')
      return
    }
    setLoading(true)
    setError('')
    try {
      const supabase = createSupabaseBrowser()
      if (!supabase) throw new Error('Connection failed')
      const { error: magicError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.0nmcp.com'}/api/auth/callback?redirect=/console`,
        },
      })
      if (magicError) { setError(magicError.message); setLoading(false); return }
      setMagicSent(true)
      setLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  async function handleOAuth(provider: Provider) {
    const supabase = createSupabaseBrowser()
    if (!supabase) return
    setLoading(true)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.0nmcp.com'
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${siteUrl}/api/auth/callback?redirect=${encodeURIComponent('/console')}`,
        scopes: provider === ('linkedin_oidc' as Provider) ? 'openid profile email w_member_social' : undefined,
      },
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(110, 224, 90, 0.04)',
    border: '1px solid rgba(110, 224, 90, 0.25)',
    borderRadius: '14px',
    padding: '0.875rem 1.125rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-display)',
    outline: 'none',
    caretColor: '#6EE05A',
    boxSizing: 'border-box',
  }

  const btnStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(135deg, #6EE05A, #4CAF3D)',
    color: '#000000',
    fontSize: '0.9375rem',
    fontWeight: 800,
    cursor: 'pointer',
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.02em',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    boxShadow: '0 4px 20px rgba(110, 224, 90, 0.3)',
  }

  const oauthBtnStyle = (bg: string): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44, height: 44,
    borderRadius: '12px',
    border: bg === 'transparent' ? '1px solid rgba(110, 224, 90, 0.2)' : 'none',
    background: bg,
    cursor: 'pointer',
    transition: 'transform 0.15s, opacity 0.15s',
    color: 'var(--text-primary)',
  })

  return (
    <div
      style={{
        maxWidth: '520px',
        margin: '0 auto 2.5rem',
        background: 'var(--bg-primary)',
        border: '2px solid #6EE05A',
        borderRadius: '27px',
        padding: '2rem 2rem 1.75rem',
        boxShadow: '0 0 40px rgba(110, 224, 90, 0.15), 0 0 80px rgba(110, 224, 90, 0.06), inset 0 0 30px rgba(110, 224, 90, 0.03)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow line */}
      <div style={{
        position: 'absolute', top: 0, left: '20%', right: '20%',
        height: '1px', background: 'linear-gradient(90deg, transparent, #6EE05A, transparent)', opacity: 0.6,
      }} />

      {/* Magic link sent state */}
      {magicSent ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>&#9993;</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
            Check your email
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            We sent a magic link to <strong style={{ color: '#6EE05A' }}>{email}</strong>. Click it to sign in instantly.
          </div>
          <button
            onClick={() => { setMagicSent(false); setStep('email'); setEmail('') }}
            style={{
              marginTop: '1rem', padding: '0.5rem 1.5rem', borderRadius: '10px',
              border: '1px solid rgba(110, 224, 90, 0.3)', background: 'transparent',
              color: '#6EE05A', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--font-display)',
            }}
          >
            Try different email
          </button>
        </div>
      ) : (
        <>
          {/* Step content with fade */}
          <div style={{
            opacity: fadeState === 'in' ? 1 : 0,
            transform: fadeState === 'in' ? 'translateY(0)' : 'translateY(8px)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}>
            {step === 'email' && (
              <form onSubmit={handleEmailSubmit}>
                <label style={{
                  display: 'block', fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)',
                  marginBottom: '1rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em',
                }}>
                  {mode === 'signup' ? "What\u2019s your email?" : 'Welcome back.'}
                </label>
                <input
                  ref={inputRef}
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  placeholder="you@company.com"
                  autoComplete="email"
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#6EE05A'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(110, 224, 90, 0.25)'}
                />
                {error && <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem', fontWeight: 600 }}>{error}</div>}
                <button
                  type="submit"
                  style={{ ...btnStyle, marginTop: '1rem' }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(110, 224, 90, 0.4)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(110, 224, 90, 0.3)' }}
                >
                  Continue
                </button>

                {/* Magic link */}
                <button
                  type="button"
                  onClick={handleMagicLink}
                  disabled={loading}
                  style={{
                    width: '100%', marginTop: '0.625rem', padding: '0.625rem',
                    borderRadius: '12px', border: '1px solid rgba(110, 224, 90, 0.2)',
                    background: 'transparent', color: 'var(--text-secondary)',
                    fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                    transition: 'color 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#6EE05A'; e.currentTarget.style.borderColor = 'rgba(110, 224, 90, 0.4)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'rgba(110, 224, 90, 0.2)' }}
                >
                  {loading ? 'Sending...' : 'Send magic link instead'}
                </button>
              </form>
            )}

            {step === 'password' && (
              <form onSubmit={handlePasswordSubmit}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                  {email}
                </div>
                <label style={{
                  display: 'block', fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)',
                  marginBottom: '1rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.01em',
                }}>
                  {mode === 'signup' ? 'Create a password.' : 'Enter your password.'}
                </label>
                <input
                  ref={inputRef}
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="6+ characters"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  style={inputStyle}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#6EE05A'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(110, 224, 90, 0.25)'}
                />
                {error && <div style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.5rem', fontWeight: 600 }}>{error}</div>}
                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...btnStyle, marginTop: '1rem', opacity: loading ? 0.7 : 1 }}
                  onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(110, 224, 90, 0.4)' } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(110, 224, 90, 0.3)' }}
                >
                  {loading ? 'One moment...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => { transitionTo('email'); setPassword('') }}
                  style={{
                    width: '100%', marginTop: '0.5rem', padding: '0.5rem',
                    background: 'transparent', border: 'none',
                    color: 'var(--text-muted)', fontSize: '0.8125rem', cursor: 'pointer',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  &larr; Back
                </button>
              </form>
            )}

            {step === 'confirming' && (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>&#9993;</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>
                  Confirm your email
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  We sent a confirmation link to <strong style={{ color: '#6EE05A' }}>{email}</strong>.
                </div>
              </div>
            )}
          </div>

          {/* Divider + OAuth */}
          {step === 'email' && (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                margin: '1.25rem 0',
              }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(110, 224, 90, 0.12)' }} />
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  or continue with
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(110, 224, 90, 0.12)' }} />
              </div>

              {/* OAuth buttons row */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
                <button
                  onClick={() => handleOAuth('linkedin_oidc' as Provider)}
                  style={oauthBtnStyle('#0A66C2')}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
                  title="Continue with LinkedIn"
                >
                  <LinkedInIcon />
                </button>
                <button
                  onClick={() => handleOAuth('google')}
                  style={oauthBtnStyle('transparent')}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
                  title="Continue with Google"
                >
                  <GoogleIcon />
                </button>
                <button
                  onClick={() => handleOAuth('github')}
                  style={oauthBtnStyle('transparent')}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)' }}
                  title="Continue with GitHub"
                >
                  <GitHubIcon />
                </button>
              </div>
            </>
          )}

          {/* Step indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
            {(['email', 'password'] as Step[]).map((s, i) => (
              <div
                key={s}
                style={{
                  width: step === s ? '24px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i <= ['email', 'password'].indexOf(step) ? '#6EE05A' : 'rgba(110, 224, 90, 0.15)',
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Mode toggle */}
          <div style={{
            textAlign: 'center', marginTop: '1rem',
            fontSize: '0.8125rem', color: 'var(--text-muted)',
            fontFamily: 'var(--font-display)',
          }}>
            {mode === 'signup' ? 'Already have an account?' : "Don\u2019t have an account?"}{' '}
            <button
              onClick={() => {
                setMode(mode === 'signup' ? 'signin' : 'signup')
                setStep('email')
                setPassword('')
                setError('')
              }}
              style={{
                background: 'none', border: 'none',
                color: '#6EE05A', fontWeight: 700, cursor: 'pointer',
                fontSize: 'inherit', fontFamily: 'inherit',
              }}
            >
              {mode === 'signup' ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
