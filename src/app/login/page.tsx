'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import OAuthButtons from '@/components/OAuthButtons'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || searchParams.get('next') || '/console'
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(errorParam === 'auth_failed' ? 'Authentication failed. Try again.' : '')
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const supabase = createSupabaseBrowser()

  useEffect(() => {
    if (typeof document === 'undefined') return
    const cookies = document.cookie.split(';').map(c => c.trim())
    const clearFlag = cookies.find(c => c.startsWith('0n_clear_storage='))
    if (clearFlag) {
      Object.keys(localStorage).filter(k => k.startsWith('0n_')).forEach(k => localStorage.removeItem(k))
      document.cookie = '0n_clear_storage=; path=/; max-age=0'
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!supabase) { setError('Auth not configured.'); return }
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.push(redirect)
    router.refresh()
  }

  async function handleMagicLink() {
    if (!email) { setError('Enter your email first'); return }
    if (!supabase) { setError('Auth not configured.'); return }
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.0nmcp.com'}/api/auth/callback?redirect=${encodeURIComponent(redirect)}` },
    })
    if (err) { setError(err.message); setLoading(false); return }
    setMagicLinkSent(true)
    setLoading(false)
  }

  if (magicLinkSent) {
    return (
      <div className="signup-page">
        <div className="signup-brand"><div className="signup-brand-inner"><RadialBurstAnimation /></div></div>
        <div className="signup-form-side">
          <div className="auth-card signup-card" style={{ textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h1 className="auth-title">Check your email</h1>
            <p className="auth-subtitle">We sent a sign-in link to <strong>{email}</strong></p>
            <button className="auth-btn secondary" onClick={() => setMagicLinkSent(false)} style={{ marginTop: '1.5rem' }}>Back to login</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="signup-page">
      {/* Left: Radial Burst Animation */}
      <div className="signup-brand">
        <div className="signup-brand-inner">
          <RadialBurstAnimation />
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="signup-form-side">
        <div className="auth-card signup-card">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your 0nMCP account</p>

          <OAuthButtons mode="signin" redirectTo={redirect} />

          <div className="auth-divider" style={{ margin: '1rem 0' }}>
            <span>or continue with email</span>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required autoFocus autoComplete="email" />
            </div>
            <div className="auth-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label htmlFor="password">Password</label>
                <Link href="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none' }}>Forgot?</Link>
              </div>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
            </div>
            <button type="submit" className="auth-btn primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <button onClick={handleMagicLink} className="auth-btn secondary" disabled={loading} style={{ marginTop: '0.5rem' }}>
            Send magic link instead
          </button>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Radial Burst Animation ──────────────────────────────────────────────── */

function RadialBurstAnimation() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase(p => (p + 1) % 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const phases = [
    { label: 'PIPELINE', desc: 'Sequential execution', color: '#7ed957' },
    { label: 'ASSEMBLY LINE', desc: 'Parallel processing', color: '#00d4ff' },
    { label: 'RADIAL BURST', desc: 'Simultaneous deployment', color: '#a78bfa' },
  ]

  const current = phases[phase]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '2rem' }}>
      {/* Brand */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.02em' }}>0nMCP</div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>The Agentic Engine</div>
      </div>

      {/* Animated visualization */}
      <div style={{ position: 'relative', width: '280px', height: '280px' }}>
        <svg viewBox="0 0 280 280" width="280" height="280" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <filter id="glow-login">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Center node */}
          <circle cx="140" cy="140" r="16" fill={current.color} opacity="0.9" filter="url(#glow-login)">
            <animate attributeName="r" values="14;18;14" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="140" cy="140" r="28" fill="none" stroke={current.color} strokeWidth="1" opacity="0.2">
            <animate attributeName="r" values="26;32;26" dur="3s" repeatCount="indefinite" />
          </circle>

          {/* Phase 0: Pipeline — sequential line */}
          {phase === 0 && (
            <>
              {[0, 1, 2, 3, 4].map(i => (
                <g key={i}>
                  <line x1={60 + i * 40} y1="140" x2={100 + i * 40} y2="140" stroke="#7ed957" strokeWidth="2" opacity="0.3">
                    <animate attributeName="opacity" values="0.1;0.6;0.1" dur="1.5s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
                  </line>
                  <circle cx={80 + i * 40} cy="140" r="6" fill="#7ed957" opacity="0.6">
                    <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.5s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
                  </circle>
                </g>
              ))}
            </>
          )}

          {/* Phase 1: Assembly Line — parallel tracks */}
          {phase === 1 && (
            <>
              {[-40, 0, 40].map((yOff, row) => (
                <g key={row}>
                  {[0, 1, 2].map(i => (
                    <g key={i}>
                      <circle cx={80 + i * 60} cy={140 + yOff} r="8" fill="#00d4ff" opacity="0.5">
                        <animate attributeName="opacity" values="0.2;0.7;0.2" dur="1.2s" begin={`${i * 0.2 + row * 0.15}s`} repeatCount="indefinite" />
                        <animate attributeName="r" values="6;10;6" dur="1.2s" begin={`${i * 0.2 + row * 0.15}s`} repeatCount="indefinite" />
                      </circle>
                      {i < 2 && <line x1={88 + i * 60} y1={140 + yOff} x2={132 + i * 60} y2={140 + yOff} stroke="#00d4ff" strokeWidth="1.5" opacity="0.2" />}
                    </g>
                  ))}
                </g>
              ))}
            </>
          )}

          {/* Phase 2: Radial Burst — exploding outward */}
          {phase === 2 && (
            <>
              {Array.from({ length: 12 }, (_, i) => {
                const angle = (i / 12) * Math.PI * 2
                const x = 140 + Math.cos(angle) * 90
                const y = 140 + Math.sin(angle) * 90
                return (
                  <g key={i}>
                    <line x1="140" y1="140" x2={x} y2={y} stroke="#a78bfa" strokeWidth="1.5" opacity="0.15">
                      <animate attributeName="opacity" values="0;0.4;0" dur="2s" begin={`${i * 0.08}s`} repeatCount="indefinite" />
                    </line>
                    <circle cx={x} cy={y} r="5" fill="#a78bfa" opacity="0">
                      <animate attributeName="opacity" values="0;0.8;0" dur="2s" begin={`${i * 0.08}s`} repeatCount="indefinite" />
                      <animate attributeName="r" values="3;8;3" dur="2s" begin={`${i * 0.08}s`} repeatCount="indefinite" />
                    </circle>
                  </g>
                )
              })}
              {/* Expanding ring */}
              <circle cx="140" cy="140" r="40" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0">
                <animate attributeName="r" values="20;120" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0" dur="2s" repeatCount="indefinite" />
              </circle>
            </>
          )}
        </svg>
      </div>

      {/* Phase label */}
      <div style={{ textAlign: 'center', transition: 'all 0.5s ease' }}>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700,
          letterSpacing: '0.15em', color: current.color, marginBottom: '0.25rem',
          textTransform: 'uppercase',
        }}>
          {current.label}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
          {current.desc}
        </div>
        {/* Phase dots */}
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '1rem' }}>
          {phases.map((p, i) => (
            <div key={i} style={{
              width: i === phase ? '20px' : '6px', height: '6px', borderRadius: '3px',
              background: i === phase ? p.color : 'rgba(255,255,255,0.15)',
              transition: 'all 0.4s ease',
            }} />
          ))}
        </div>
      </div>

      {/* Selling points */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '260px' }}>
        {[
          { text: '1,229 tools across 54 services', color: '#7ed957' },
          { text: 'Your own AI agent in seconds', color: '#00d4ff' },
          { text: 'Zero-knowledge encryption', color: '#a78bfa' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.color, flexShrink: 0, boxShadow: `0 0 8px ${item.color}44` }} />
            {item.text}
          </div>
        ))}
      </div>
    </div>
  )
}
