'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const supabase = createSupabaseBrowser()

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Enter your email address')
      return
    }

    if (!supabase) {
      setError('Authentication service is not configured.')
      return
    }

    setLoading(true)

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'}/reset-password`,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">0n</div>
          <h1 className="auth-title">Check your email</h1>
          <p className="auth-subtitle">
            We sent a password reset link to <strong>{email}</strong>.
            Click the link in the email to set a new password.
          </p>
          <p className="auth-subtitle" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
            Didn&apos;t receive it? Check your spam folder or try again.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button className="auth-btn secondary" onClick={() => setSent(false)}>
              Try again
            </button>
            <Link href="/login" className="auth-btn secondary" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">0n</div>
        <h1 className="auth-title">Reset password</h1>
        <p className="auth-subtitle">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleReset} className="auth-form">
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

          <button type="submit" className="auth-btn primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p className="auth-footer">
          Remember your password?{' '}
          <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
