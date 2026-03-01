'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import SwitchShowcase from '@/components/SwitchShowcase'

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
  const redirect = searchParams.get('redirect') || '/account'
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(errorParam === 'auth_failed' ? 'Authentication failed. Try again.' : '')
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const supabase = createSupabaseBrowser()

  // Clear previous user's localStorage data after signout
  useEffect(() => {
    if (typeof document === 'undefined') return
    const cookies = document.cookie.split(';').map(c => c.trim())
    const clearFlag = cookies.find(c => c.startsWith('0n_clear_storage='))
    if (clearFlag) {
      // Remove all 0n_ prefixed keys (user-scoped data)
      Object.keys(localStorage)
        .filter(k => k.startsWith('0n_'))
        .forEach(k => localStorage.removeItem(k))
      // Remove the flag cookie
      document.cookie = '0n_clear_storage=; path=/; max-age=0'
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!supabase) {
      setError('Authentication service is not configured. Please contact support.')
      return
    }

    setLoading(true)

    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  async function handleMagicLink() {
    if (!email) {
      setError('Enter your email first')
      return
    }

    if (!supabase) {
      setError('Authentication service is not configured. Please contact support.')
      return
    }

    setError('')
    setLoading(true)

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setMagicLinkSent(true)
    setLoading(false)
  }

  if (magicLinkSent) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">0n</div>
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-subtitle">
            We sent a sign-in link to <strong>{email}</strong>
          </p>
          <button
            className="auth-btn secondary"
            onClick={() => setMagicLinkSent(false)}
          >
            Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container" style={{ flexDirection: 'column', gap: '2rem', paddingTop: '3rem', paddingBottom: '3rem' }}>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap', width: '100%', maxWidth: '880px' }}>
        {/* Login form */}
        <div className="auth-card" style={{ flex: '1 1 340px', maxWidth: '420px' }}>
          <div className="auth-logo">0n</div>
          <h1 className="auth-title">Sign in</h1>
          <p className="auth-subtitle">
            Access your .0n files, credentials, and workflow builder.
          </p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label htmlFor="password">Password</label>
                <Link href="/forgot-password" style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="auth-btn primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            className="auth-btn secondary"
            onClick={handleMagicLink}
            disabled={loading}
          >
            Send magic link
          </button>

          <p className="auth-footer">
            No account?{' '}
            <Link href={`/signup${redirect !== '/account' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}>
              Create one
            </Link>
          </p>
        </div>

        {/* SWITCH file showcase */}
        <div style={{ flex: '1 1 340px', maxWidth: '440px' }}>
          <SwitchShowcase />
        </div>
      </div>
    </div>
  )
}
