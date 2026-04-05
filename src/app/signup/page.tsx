'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import OAuthButtons from '@/components/OAuthButtons'

const TOTAL_SPOTS = 100
const FEATURES = [
  '1,589 AI tools across 102 services',
  '7-layer encrypted credential vault',
  'Cross-platform brain — works on Claude, GPT, Gemini',
  'Pipeline, Assembly Line & Radial Burst workflows',
  'Free .env to .0n converter',
  'Community forum + support',
]

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}

function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [spotsTaken, setSpotsTaken] = useState(0)

  const supabase = createSupabaseBrowser()

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/0nboarding')
    })

    async function getSpots() {
      try {
        const res = await fetch('/api/spots')
        if (res.ok) {
          const data = await res.json()
          setSpotsTaken(data.count || 0)
        }
      } catch {
        setSpotsTaken(37)
      }
    }
    getSpots()
  }, [router, supabase])

  const spotsLeft = Math.max(0, TOTAL_SPOTS - spotsTaken)
  const progressPct = Math.min(100, (spotsTaken / TOTAL_SPOTS) * 100)

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!supabase) { setError('Auth not configured.'); return }
    setLoading(true)

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/api/auth/callback?redirect=/0nboarding`,
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      router.push('/0nboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-split">
      {/* Left: Brand Panel */}
      <SignupBrandPanel spotsLeft={spotsLeft} totalSpots={TOTAL_SPOTS} progressPct={progressPct} />

      {/* Right: Form Panel */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <h1 className="login-heading">Create your account</h1>
          <p className="login-subheading">Free during early access. No credit card required.</p>

          <OAuthButtons mode="signup" />

          <div className="login-divider">
            <span>or continue with email</span>
          </div>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleEmailSignup} className="login-form">
            <div className="login-field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jane Smith"
                required
                autoFocus
                autoComplete="name"
              />
            </div>

            <div className="login-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="login-btn login-btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Claim Your Spot'}
            </button>
          </form>

          <p className="login-signup-link">
            Already have an account?{' '}
            <Link href="/login">Sign in</Link>
          </p>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.7rem',
            textAlign: 'center',
            marginTop: '0.5rem',
            lineHeight: 1.5,
          }}>
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Brand Panel (left side) ──────────────────────────────────────────── */

function SignupBrandPanel({ spotsLeft, totalSpots, progressPct }: { spotsLeft: number; totalSpots: number; progressPct: number }) {
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
          Get early access to<br />
          <span>the .0n Standard</span>
        </h2>

        {/* Early Access Spots */}
        <div className="signup-spots-card">
          <div className="signup-spots-header">
            <span className="signup-spots-label">Early Access</span>
            <span className="signup-spots-count">{spotsLeft} of {totalSpots} spots left</span>
          </div>
          <div className="signup-spots-bar">
            <div
              className="signup-spots-fill"
              data-urgency={progressPct > 80 ? 'critical' : progressPct > 50 ? 'warning' : 'normal'}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Feature List */}
        <div className="signup-features">
          {FEATURES.map((f, i) => (
            <div key={i} className="signup-feature-item">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="signup-feature-icon">
                <circle cx="9" cy="9" r="9" fill="var(--accent-dim, rgba(126, 217, 87, 0.15))" />
                <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{f}</span>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="login-brand-trust">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>5 patents pending &middot; MIT licensed &middot; Built by RocketOpp LLC</span>
        </div>
      </div>
    </div>
  )
}
