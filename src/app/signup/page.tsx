'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}

const FEATURES = [
  {
    icon: '0n',
    title: 'Encrypted Vault',
    desc: 'AES-256-GCM client-side encryption. Your API keys never leave your browser unencrypted.',
  },
  {
    icon: '\u29BF',
    title: 'Signed .0n Files',
    desc: 'Every workflow is HMAC-signed. Tampered or unauthorized files are rejected on import.',
  },
  {
    icon: '\u2737',
    title: 'AI Workflow Builder',
    desc: 'Describe what you need in plain English. Get a production-ready .0n workflow in seconds.',
  },
  {
    icon: '\u229A',
    title: 'Execution Tracking',
    desc: 'Every run is logged — domain, platform, license key, step results. Full audit trail.',
  },
]

const STATS = [
  { value: '545', label: 'Tools' },
  { value: '26', label: 'Services' },
  { value: 'AES-256', label: 'Encryption' },
  { value: 'HMAC', label: 'File Signing' },
]

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/0nboarding'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [confirmSent, setConfirmSent] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const supabase = createSupabaseBrowser()

  function checkStrength(pw: string) {
    let s = 0
    if (pw.length >= 8) s++
    if (pw.length >= 12) s++
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
    if (/\d/.test(pw)) s++
    if (/[^A-Za-z0-9]/.test(pw)) s++
    setPasswordStrength(Math.min(s, 4))
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (!supabase) {
      setError('Authentication service is not configured. Please contact support.')
      return
    }

    setLoading(true)

    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, company },
        emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setConfirmSent(true)
    setLoading(false)
  }

  if (confirmSent) {
    return (
      <div className="signup-page">
        <div className="signup-confirm">
          <div className="signup-confirm-icon">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="23" stroke="var(--accent)" strokeWidth="2" />
              <path d="M14 24l7 7 13-13" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="auth-title" style={{ textAlign: 'center' }}>Check your email</h1>
          <p className="auth-subtitle" style={{ textAlign: 'center', maxWidth: '320px', margin: '0 auto' }}>
            We sent a verification link to <strong>{email}</strong>. Click it to activate your vault.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.5rem' }}>
            <button className="auth-btn secondary" style={{ maxWidth: '160px' }} onClick={() => { setConfirmSent(false); router.push('/login') }}>
              Sign in
            </button>
            <button className="auth-btn secondary" style={{ maxWidth: '160px' }} onClick={() => setConfirmSent(false)}>
              Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="signup-page">
      {/* Left: Brand + Features */}
      <div className="signup-brand">
        <div className="signup-brand-inner">
          <div className="signup-brand-logo">0nMCP</div>
          <h2 className="signup-brand-headline">
            Your AI command center.<br />
            <span>Encrypted. Signed. Yours.</span>
          </h2>
          <p className="signup-brand-sub">
            One account secures your API keys, workflow files, and AI builder access.
            Zero plaintext. Zero compromise.
          </p>

          <div className="signup-stats">
            {STATS.map((s) => (
              <div key={s.label} className="signup-stat">
                <span className="signup-stat-value">{s.value}</span>
                <span className="signup-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="signup-features">
            {FEATURES.map((f) => (
              <div key={f.title} className="signup-feature">
                <div className="signup-feature-icon">{f.icon}</div>
                <div>
                  <div className="signup-feature-title">{f.title}</div>
                  <div className="signup-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="signup-trust">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
            </svg>
            <span>Client-side encryption — we never see your keys</span>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="signup-form-side">
        <div className="auth-card signup-card">
          <h1 className="auth-title">Create your vault</h1>
          <p className="auth-subtitle">Free forever. No credit card required.</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSignup} className="auth-form">
            <div className="signup-name-row">
              <div className="auth-field">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Smith"
                  required
                  autoFocus
                  autoComplete="name"
                />
              </div>
              <div className="auth-field">
                <label htmlFor="company">Company <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Acme Inc"
                  autoComplete="organization"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); checkStrength(e.target.value) }}
                placeholder="Min 8 characters"
                required
                minLength={8}
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
                                : '#00ff88'
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

            <button type="submit" className="auth-btn primary" disabled={loading}>
              {loading ? (
                <span className="signup-loading">
                  <span className="signup-spinner" />
                  Creating vault...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link href={`/login${redirect !== '/account' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}>
              Sign in
            </Link>
          </p>

          <p className="signup-legal">
            By creating an account you agree to our{' '}
            <Link href="/legal">Terms of Service</Link> and{' '}
            <Link href="/legal">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
