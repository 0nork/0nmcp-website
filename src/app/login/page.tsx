'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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
  const redirect = searchParams.get('redirect') || searchParams.get('next') || '/dashboard'
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

  /* ─── Magic Link Sent State ─────────────────────────────────────────── */
  if (magicLinkSent) {
    return (
      <div className="login-split">
        <BrandPanel />
        <div className="login-form-panel">
          <div className="login-form-container" style={{ textAlign: 'center' }}>
            <div className="login-magic-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h1 className="login-heading">Check your email</h1>
            <p className="login-subheading">
              We sent a sign-in link to <strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{email}</strong>
            </p>
            <button
              className="login-btn login-btn-secondary"
              onClick={() => setMagicLinkSent(false)}
              style={{ marginTop: '1.5rem' }}
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ─── Main Login Form ───────────────────────────────────────────────── */
  return (
    <div className="login-split">
      {/* Left: Brand Panel */}
      <BrandPanel />

      {/* Right: Form Panel */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <h1 className="login-heading">Welcome back</h1>
          <p className="login-subheading">Sign in to your 0nMCP account</p>

          <OAuthButtons mode="signin" redirectTo={redirect} />

          <div className="login-divider">
            <span>or continue with email</span>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="login-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <div className="login-field-header">
                <label htmlFor="password">Password</label>
                <Link href="/forgot-password" className="login-forgot-link">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="login-btn login-btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <button
            onClick={handleMagicLink}
            className="login-btn login-btn-secondary"
            disabled={loading}
          >
            Send magic link instead
          </button>

          <p className="login-signup-link">
            Don&apos;t have an account?{' '}
            <Link href="/signup">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Brand Panel (left side) ──────────────────────────────────────────── */

function BrandPanel() {
  return (
    <div className="login-brand-panel">
      <div className="login-brand-content">
        {/* Logo */}
        <div className="login-brand-logo">
          <Image
            src="/brand/0n-logo-white.svg"
            alt="0nMCP"
            width={140}
            height={40}
            priority
          />
        </div>

        {/* Tagline */}
        <h2 className="login-brand-tagline">
          One Brain.<br />
          Every Service.<br />
          <span>Zero Limits.</span>
        </h2>

        {/* Stats bar */}
        <div className="login-brand-stats">
          <div className="login-brand-stat">
            <span className="login-brand-stat-value">1,589</span>
            <span className="login-brand-stat-label">Tools</span>
          </div>
          <div className="login-brand-stat-divider" />
          <div className="login-brand-stat">
            <span className="login-brand-stat-value">102</span>
            <span className="login-brand-stat-label">Services</span>
          </div>
          <div className="login-brand-stat-divider" />
          <div className="login-brand-stat">
            <span className="login-brand-stat-value">22</span>
            <span className="login-brand-stat-label">Categories</span>
          </div>
        </div>

        {/* Testimonial */}
        <div className="login-brand-testimonial">
          <p className="login-brand-quote">
            &ldquo;0nMCP replaced 4 different tools and 3 custom integrations.
            We went from days of setup to minutes.&rdquo;
          </p>
          <div className="login-brand-author">
            <div className="login-brand-avatar">M</div>
            <div>
              <div className="login-brand-author-name">Mike Mento</div>
              <div className="login-brand-author-role">Founder, RocketOpp LLC</div>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="login-brand-trust">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>AES-256 encrypted &middot; SOC 2 ready &middot; Patent pending</span>
        </div>
      </div>
    </div>
  )
}
