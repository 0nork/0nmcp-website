'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [spotsTaken, setSpotsTaken] = useState(0)

  useEffect(() => {
    // Check if already logged in
    const supabase = createSupabaseBrowser()
    if (!supabase) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/0nboarding')
    })

    // Get spots taken count
    async function getSpots() {
      try {
        const res = await fetch('/api/spots')
        if (res.ok) {
          const data = await res.json()
          setSpotsTaken(data.count || 0)
        }
      } catch {
        setSpotsTaken(37) // fallback display number
      }
    }
    getSpots()
  }, [router])

  const spotsLeft = Math.max(0, TOTAL_SPOTS - spotsTaken)
  const progressPct = Math.min(100, (spotsTaken / TOTAL_SPOTS) * 100)

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createSupabaseBrowser()
      if (!supabase) throw new Error('Auth not available')

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
    <div style={{
      minHeight: '100vh',
      background: '#f8faf9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 480px) minmax(0, 400px)',
        gap: '4rem',
        maxWidth: '960px',
        width: '100%',
        alignItems: 'center',
      }}>
        {/* Left — Value Prop */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: 'linear-gradient(135deg, #7ed957 0%, #5cb83a 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 14, color: '#000', fontFamily: 'var(--font-display, system-ui)',
              }}>0n</div>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a1a2e', fontFamily: 'var(--font-display, system-ui)' }}>0nMCP</span>
            </div>
          </Link>

          <div>
            <h1 style={{
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              fontWeight: 800,
              color: '#1a1a2e',
              lineHeight: 1.15,
              margin: 0,
              fontFamily: 'var(--font-display, system-ui)',
            }}>
              Get early access to<br />
              <span style={{ color: '#2d8a1e' }}>the .0n Standard</span>
            </h1>
            <p style={{ color: '#5a6577', fontSize: '1.05rem', lineHeight: 1.6, marginTop: '1rem' }}>
              The universal AI orchestration format. 9 file types, 7-layer encryption,
              3 patented execution patterns. Replace your .env files forever.
            </p>
          </div>

          {/* Spots remaining */}
          <div style={{
            background: '#edf7e8',
            border: '1px solid #c5e8b5',
            borderRadius: 12,
            padding: '1.25rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ color: '#2d8a1e', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Early Access
              </span>
              <span style={{ color: '#1a1a2e', fontWeight: 700, fontSize: '1.125rem' }}>
                {spotsLeft} of {TOTAL_SPOTS} spots left
              </span>
            </div>
            <div style={{
              height: 6, borderRadius: 3,
              background: '#d4e8cc',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 3,
                background: progressPct > 80 ? '#ef4444' : progressPct > 50 ? '#f59e0b' : '#3da826',
                width: `${progressPct}%`,
                transition: 'width 1s ease',
              }} />
            </div>
          </div>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ marginTop: 2, flexShrink: 0 }}>
                  <circle cx="9" cy="9" r="9" fill="#edf7e8" />
                  <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="#3da826" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ color: '#3d4a5c', fontSize: '0.9rem', lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>

          <p style={{ color: '#8896a6', fontSize: '0.8rem' }}>
            5 patents pending. MIT licensed. Built by RocketOpp LLC.
          </p>
        </div>

        {/* Right — Auth Form */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid #e2e8f0',
          borderRadius: 16,
          padding: '2rem',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          <h2 style={{
            fontSize: '1.375rem',
            fontWeight: 700,
            color: '#1a1a2e',
            margin: '0 0 0.5rem',
            fontFamily: 'var(--font-display, system-ui)',
          }}>Create your account</h2>
          <p style={{ color: '#6b7a8d', fontSize: '0.875rem', margin: '0 0 1.5rem' }}>
            Free during early access. No credit card required.
          </p>

          <OAuthButtons mode="signup" />

          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            margin: '1.25rem 0', color: 'var(--text-muted)', fontSize: '0.8rem',
          }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span>or</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8, padding: '0.75rem',
              color: '#dc2626', fontSize: '0.85rem',
              marginBottom: '1rem',
            }}>{error}</div>
          )}

          <form onSubmit={handleEmailSignup} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div>
              <label htmlFor="name" style={{ display: 'block', color: '#4a5568', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Smith"
                required
                autoComplete="name"
                style={{
                  width: '100%', height: 44, borderRadius: 8,
                  background: '#f8faf9',
                  border: '1px solid #d1d9e0',
                  color: '#1a1a2e', padding: '0 0.875rem',
                  fontSize: '0.9rem', outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label htmlFor="email" style={{ display: 'block', color: '#4a5568', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
                style={{
                  width: '100%', height: 44, borderRadius: 8,
                  background: '#f8faf9',
                  border: '1px solid #d1d9e0',
                  color: '#1a1a2e', padding: '0 0.875rem',
                  fontSize: '0.9rem', outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div>
              <label htmlFor="password" style={{ display: 'block', color: '#4a5568', fontSize: '0.8rem', fontWeight: 600, marginBottom: 6 }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
                style={{
                  width: '100%', height: 44, borderRadius: 8,
                  background: '#f8faf9',
                  border: '1px solid #d1d9e0',
                  color: '#1a1a2e', padding: '0 0.875rem',
                  fontSize: '0.9rem', outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', height: 48, borderRadius: 8,
                background: loading ? '#4a8a2e' : '#3da826',
                color: 'var(--text-primary)', border: 'none',
                fontSize: '0.95rem', fontWeight: 700,
                cursor: loading ? 'wait' : 'pointer',
                fontFamily: 'var(--font-display, system-ui)',
                transition: 'all 0.15s ease',
                marginTop: '0.25rem',
              }}
            >
              {loading ? 'Creating account...' : 'Claim Your Spot'}
            </button>
          </form>

          <p style={{ color: '#6b7a8d', fontSize: '0.8rem', textAlign: 'center', marginTop: '1.25rem' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#2d8a1e', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>

          <p style={{
            color: 'var(--text-muted)', fontSize: '0.7rem', textAlign: 'center', marginTop: '1rem', lineHeight: 1.5,
          }}>
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
            max-width: 480px !important;
          }
        }
      `}</style>
    </div>
  )
}
