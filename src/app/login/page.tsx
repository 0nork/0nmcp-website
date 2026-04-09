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
      <div className="login-dark-split">
        <BrandPanel />
        <div className="login-dark-form">
          <div className="login-dark-form-inner" style={{ textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(126,217,87,0.1)', border: '1px solid rgba(126,217,87,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f0f4f8', margin: '0 0 0.5rem' }}>Check your email</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
              We sent a sign-in link to <strong style={{ color: '#7ed957', fontFamily: "'JetBrains Mono', monospace" }}>{email}</strong>
            </p>
            <button onClick={() => setMagicLinkSent(false)} style={{ marginTop: '1.5rem', padding: '0.625rem 2rem', borderRadius: 10, background: 'transparent', border: '1px solid #2d3748', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
              Back to login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-dark-split">
      <BrandPanel />
      <div className="login-dark-form">
        <div className="login-dark-form-inner">
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f0f4f8', margin: '0 0 0.25rem' }}>Welcome back</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 1.5rem' }}>Sign in to your 0nMCP account</p>

          <OAuthButtons mode="signin" redirectTo={redirect} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.25rem 0' }}>
            <div style={{ flex: 1, height: 1, background: '#1e293b' }} />
            <span style={{ fontSize: '0.7rem', color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: '#1e293b' }} />
          </div>

          {error && <div style={{ padding: '0.625rem 1rem', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</div>}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required autoFocus autoComplete="email" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, background: '#0d1117', border: '1px solid #1e293b', color: '#f0f4f8', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>Password</label>
                <Link href="/forgot-password" style={{ fontSize: '0.75rem', color: '#7ed957', textDecoration: 'none' }}>Forgot password?</Link>
              </div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required autoComplete="current-password" style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, background: '#0d1117', border: '1px solid #1e293b', color: '#f0f4f8', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }} />
            </div>
            <button type="submit" disabled={loading} style={{ padding: '0.75rem', borderRadius: 10, background: '#7ed957', border: 'none', color: '#000', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', marginTop: 4 }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <button onClick={handleMagicLink} disabled={loading} style={{ width: '100%', padding: '0.625rem', borderRadius: 10, background: 'transparent', border: '1px solid #1e293b', color: '#94a3b8', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', marginTop: '0.75rem' }}>
            Send magic link instead
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#4a5568', marginTop: '1.25rem' }}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" style={{ color: '#7ed957', textDecoration: 'none', fontWeight: 600 }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Brand Panel (left side) — animated execution flow ──────────────── */

const FLOW_STEPS = [
  { cmd: '"Invoice john@acme.com for $500 and notify sales"', delay: 0 },
  { svc: 'stripe', action: 'create_invoice', logo: '/brand/logos/stripe.svg', color: '#635bff', delay: 1200 },
  { svc: 'crm', action: 'update_contact', logo: '/logos/crm.svg', color: '#7ed957', delay: 2200 },
  { svc: 'slack', action: 'send_message', logo: '/brand/logos/slack.svg', color: '#4a154b', delay: 3200 },
  { result: 'Invoice sent. Contact updated. #sales notified.', delay: 4200 },
]

function FlowStep({ step, delay }: { step: typeof FLOW_STEPS[number]; delay: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])

  if (!visible) return null

  if ('cmd' in step && step.cmd) {
    return (
      <div style={{ animation: 'flowIn 0.4s ease', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(126,217,87,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2" strokeLinecap="round"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', color: '#7ed957', lineHeight: 1.6, padding: '0.5rem 0.75rem', background: 'rgba(126,217,87,0.06)', borderRadius: 8, border: '1px solid rgba(126,217,87,0.12)' }}>
          {step.cmd}
        </div>
      </div>
    )
  }

  if ('svc' in step && step.svc) {
    return (
      <div style={{ animation: 'flowIn 0.3s ease', display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: 4 }}>
        <div style={{ width: 2, height: 20, background: '#1e293b', marginLeft: 13 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.375rem 0.75rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid #1e293b' }}>
          <Image src={step.logo || ''} alt={step.svc} width={18} height={18} style={{ borderRadius: 4 }} />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{step.svc}</span>
          <span style={{ fontSize: '0.7rem', color: '#4a5568' }}>/</span>
          <span style={{ fontSize: '0.75rem', color: step.color, fontFamily: "'JetBrains Mono', monospace" }}>{step.action}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2.5" strokeLinecap="round" style={{ marginLeft: 'auto' }}><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </div>
    )
  }

  if ('result' in step && step.result) {
    return (
      <div style={{ animation: 'flowIn 0.4s ease', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(126,217,87,0.15)', border: '1px solid rgba(126,217,87,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#f0f4f8', lineHeight: 1.6, paddingTop: 4 }}>
          {step.result}
        </div>
      </div>
    )
  }

  return null
}

function BrandPanel() {
  const [flowKey, setFlowKey] = useState(0)

  // Restart animation every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => setFlowKey(k => k + 1), 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="login-dark-brand">
      <div className="login-dark-brand-inner">
        {/* Logo */}
        <div style={{ marginBottom: '2rem' }}>
          <Image src="/brand/on-white.png" alt="0nMCP" width={80} height={80} style={{ objectFit: 'contain' }} priority />
        </div>

        {/* Tagline */}
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#f0f4f8', lineHeight: 1.2, margin: '0 0 0.5rem' }}>
          You describe it.<br />
          <span style={{ color: '#7ed957' }}>We execute it.</span>
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 2rem', lineHeight: 1.6 }}>
          One command. Multiple services. Real API calls.
        </p>

        {/* Animated execution flow */}
        <div key={flowKey} style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {FLOW_STEPS.map((step, i) => (
            <FlowStep key={`${flowKey}-${i}`} step={step} delay={step.delay} />
          ))}
        </div>

        {/* Service logos */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', opacity: 0.5 }}>
          {['/brand/logos/stripe.svg', '/brand/logos/slack.svg', '/brand/logos/openai.svg', '/brand/logos/github.svg', '/brand/logos/supabase.svg'].map(src => (
            <Image key={src} src={src} alt="" width={20} height={20} style={{ borderRadius: 4, filter: 'brightness(0) invert(1)', opacity: 0.6 }} />
          ))}
          <span style={{ fontSize: '0.7rem', color: '#4a5568', alignSelf: 'center' }}>+97 more</span>
        </div>

        {/* Trust */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: '1.5rem' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span style={{ fontSize: '0.7rem', color: '#4a5568' }}>AES-256 encrypted &middot; 5 patents pending &middot; MIT licensed</span>
        </div>
      </div>

      <style>{`
        @keyframes flowIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
