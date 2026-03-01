'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Supabase will have exchanged the recovery token in the URL hash for a session
  useEffect(() => {
    if (!supabase) return

    // Listen for auth state — Supabase auto-exchanges the token from the URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })

    // Also check if we already have a session (token was already exchanged)
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setSessionReady(true)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  function checkStrength(pw: string) {
    let s = 0
    if (pw.length >= 8) s++
    if (pw.length >= 12) s++
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
    if (/\d/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    setPasswordStrength(Math.min(s, 4))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    if (!supabase) {
      setError('Authentication service is not configured.')
      return
    }

    setLoading(true)

    const { error: err } = await supabase.auth.updateUser({
      password,
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    // Redirect to account after 2 seconds
    setTimeout(() => {
      router.push('/account')
      router.refresh()
    }, 2000)
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">0n</div>
          <h1 className="auth-title">Password updated</h1>
          <p className="auth-subtitle">
            Your password has been changed successfully. Redirecting to your account...
          </p>
          <Link href="/account" className="auth-btn primary" style={{ textDecoration: 'none', textAlign: 'center', marginTop: '1rem', display: 'block' }}>
            Go to account
          </Link>
        </div>
      </div>
    )
  }

  if (!sessionReady) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">0n</div>
          <h1 className="auth-title">Reset password</h1>
          <p className="auth-subtitle">
            Verifying your reset link...
          </p>
          <p className="auth-subtitle" style={{ fontSize: '0.75rem', marginTop: '1rem' }}>
            If this page doesn&apos;t update, the link may have expired.{' '}
            <Link href="/forgot-password" style={{ color: 'var(--accent)' }}>Request a new one</Link>.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">0n</div>
        <h1 className="auth-title">Set new password</h1>
        <p className="auth-subtitle">
          Choose a strong password for your account.
        </p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="password">New password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); checkStrength(e.target.value) }}
              placeholder="Min 8 characters"
              required
              minLength={8}
              autoFocus
              autoComplete="new-password"
            />
            {password.length > 0 && (
              <div className="password-strength">
                <div className="password-strength-bar">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="password-strength-segment"
                      style={{
                        backgroundColor: i < passwordStrength
                          ? passwordStrength <= 1 ? '#ff5050'
                            : passwordStrength <= 2 ? '#ffc800'
                              : '#7ed957'
                          : 'var(--border)',
                      }}
                    />
                  ))}
                </div>
                <span className="password-strength-label">
                  {passwordStrength <= 1 ? 'Weak' : passwordStrength <= 2 ? 'Fair' : passwordStrength <= 3 ? 'Strong' : 'Excellent'}
                </span>
              </div>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="auth-btn primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>

        <p className="auth-footer">
          <Link href="/login">Back to login</Link>
        </p>
      </div>
    </div>
  )
}
