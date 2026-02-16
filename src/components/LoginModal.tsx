'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'

interface LoginModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  message?: string
  redirectAfter?: string
}

export default function LoginModal({ open, onClose, onSuccess, message, redirectAfter }: LoginModalProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const supabase = createSupabaseBrowser()

  useEffect(() => {
    if (open) {
      setError('')
      setMagicLinkSent(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setLoading(false)
    if (onSuccess) {
      onSuccess()
    } else if (redirectAfter) {
      router.push(redirectAfter)
      router.refresh()
    }
    onClose()
  }

  async function handleMagicLink() {
    if (!email) { setError('Enter your email first'); return }
    setError('')
    setLoading(true)

    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirectAfter || '/account')}`,
      },
    })

    if (err) { setError(err.message); setLoading(false); return }
    setMagicLinkSent(true)
    setLoading(false)
  }

  if (!open) return null

  return (
    <div className="login-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="login-modal">
        <div className="auth-card">
          <button className="login-modal-close" onClick={onClose}>&times;</button>

          <div className="auth-logo">0n</div>

          {magicLinkSent ? (
            <>
              <h1 className="auth-title">Check your email</h1>
              <p className="auth-subtitle">
                We sent a sign-in link to <strong>{email}</strong>
              </p>
              <button className="auth-btn secondary" onClick={() => setMagicLinkSent(false)}>
                Back
              </button>
            </>
          ) : (
            <>
              <h1 className="auth-title">Sign in</h1>
              {message ? (
                <p className="auth-subtitle">{message}</p>
              ) : (
                <p className="auth-subtitle">
                  Sign in to access this feature.
                </p>
              )}

              {error && <div className="auth-error">{error}</div>}

              <form onSubmit={handleLogin} className="auth-form">
                <div className="auth-field">
                  <label htmlFor="modal-email">Email</label>
                  <input
                    id="modal-email"
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
                  <label htmlFor="modal-password">Password</label>
                  <input
                    id="modal-password"
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

              <div className="auth-divider"><span>or</span></div>

              <button className="auth-btn secondary" onClick={handleMagicLink} disabled={loading}>
                Send magic link
              </button>

              <p className="auth-footer">
                No account?{' '}
                <Link href="/signup" onClick={onClose}>
                  Create one
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
