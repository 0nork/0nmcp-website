'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'

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
        emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
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
    <div className="auth-container">
      <div className="auth-card">
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
            <label htmlFor="password">Password</label>
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
    </div>
  )
}
