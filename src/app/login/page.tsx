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
          <div className="login-dark-form-inner text-center">
            <div className="w-14 h-14 rounded-full bg-[rgba(126,217,87,0.1)] border border-[rgba(126,217,87,0.2)] flex items-center justify-center mx-auto mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h1 className="text-2xl font-bold text-[#f0f4f8] mb-2">Check your email</h1>
            <p className="text-[#94a3b8] text-sm leading-relaxed">
              We sent a sign-in link to{' '}
              <strong className="text-[#7ed957] font-mono">{email}</strong>
            </p>
            <button
              onClick={() => setMagicLinkSent(false)}
              className="mt-6 px-8 py-[0.625rem] rounded-[10px] bg-transparent border border-[#2d3748] text-[#94a3b8] font-semibold cursor-pointer text-sm"
            >
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
          <h1 className="text-2xl font-bold text-[#f0f4f8] mb-1">Welcome back</h1>
          <p className="text-[#64748b] text-sm mb-6">Sign in to your 0nMCP account</p>

          <OAuthButtons mode="signin" redirectTo={redirect} />

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-[#1e293b]" />
            <span className="text-[0.7rem] text-[#4a5568] uppercase tracking-[0.08em] font-semibold">or continue with email</span>
            <div className="flex-1 h-px bg-[#1e293b]" />
          </div>

          {error && (
            <div className="px-4 py-[0.625rem] rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#ef4444] text-[0.8rem] mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[0.8rem] font-semibold text-[#94a3b8] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoFocus
                autoComplete="email"
                className="w-full px-4 py-3 rounded-[10px] bg-[#0d1117] border border-[#1e293b] text-[#f0f4f8] text-sm outline-none font-[inherit]"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[0.8rem] font-semibold text-[#94a3b8]">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#7ed957] no-underline">Forgot password?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-[10px] bg-[#0d1117] border border-[#1e293b] text-[#f0f4f8] text-sm outline-none font-[inherit]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="py-3 rounded-[10px] bg-[#7ed957] border-none text-black font-bold text-[0.9rem] cursor-pointer mt-1"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <button
            onClick={handleMagicLink}
            disabled={loading}
            className="w-full py-[0.625rem] rounded-[10px] bg-transparent border border-[#1e293b] text-[#94a3b8] font-semibold text-[0.85rem] cursor-pointer mt-3"
          >
            Send magic link instead
          </button>

          <p className="text-center text-[0.8rem] text-[#4a5568] mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#7ed957] no-underline font-semibold">Create one free</Link>
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
      <div className="flex items-start gap-3 [animation:flowIn_0.4s_ease]">
        <div className="w-7 h-7 rounded-lg bg-[rgba(126,217,87,0.15)] flex items-center justify-center shrink-0 mt-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2" strokeLinecap="round"><path d="M12 20V10M18 20V4M6 20v-4"/></svg>
        </div>
        <div className="font-mono text-[0.8rem] text-[#7ed957] leading-relaxed px-3 py-2 bg-[rgba(126,217,87,0.06)] rounded-lg border border-[rgba(126,217,87,0.12)]">
          {step.cmd}
        </div>
      </div>
    )
  }

  if ('svc' in step && step.svc) {
    return (
      <div className="flex items-center gap-3 pl-1 [animation:flowIn_0.3s_ease]">
        <div className="w-0.5 h-5 bg-[#1e293b] ml-[13px]" />
        <div className="flex items-center gap-[0.625rem] px-3 py-[0.375rem] rounded-lg bg-[rgba(255,255,255,0.03)] border border-[#1e293b]">
          <Image src={step.logo || ''} alt={step.svc} width={18} height={18} className="rounded-[4px]" />
          <span className="text-xs text-[#94a3b8]">{step.svc}</span>
          <span className="text-[0.7rem] text-[#4a5568]">/</span>
          <span className="text-xs font-mono" style={{ color: step.color }}>{step.action}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2.5" strokeLinecap="round" className="ml-auto"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </div>
    )
  }

  if ('result' in step && step.result) {
    return (
      <div className="flex items-start gap-3 [animation:flowIn_0.4s_ease]">
        <div className="w-7 h-7 rounded-full bg-[rgba(126,217,87,0.15)] border border-[rgba(126,217,87,0.3)] flex items-center justify-center shrink-0 mt-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div className="text-[0.8rem] text-[#f0f4f8] leading-relaxed pt-1">
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
        <div className="mb-8">
          <Image src="/brand/on-white.png" alt="0nMCP" width={80} height={80} className="object-contain" priority />
        </div>

        {/* Tagline */}
        <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold text-[#f0f4f8] leading-tight mb-2">
          You describe it.<br />
          <span className="text-[#7ed957]">We execute it.</span>
        </h2>
        <p className="text-[#64748b] text-sm mb-8 leading-relaxed">
          One command. Multiple services. Real API calls.
        </p>

        {/* Animated execution flow */}
        <div key={flowKey} className="flex flex-col gap-[0.625rem]">
          {FLOW_STEPS.map((step, i) => (
            <FlowStep key={`${flowKey}-${i}`} step={step} delay={step.delay} />
          ))}
        </div>

        {/* Service logos */}
        <div className="flex gap-3 mt-8 opacity-50">
          {['/brand/logos/stripe.svg', '/brand/logos/slack.svg', '/brand/logos/openai.svg', '/brand/logos/github.svg', '/brand/logos/supabase.svg'].map(src => (
            <Image key={src} src={src} alt="" width={20} height={20} className="rounded-[4px] brightness-0 invert opacity-60" />
          ))}
          <span className="text-[0.7rem] text-[#4a5568] self-center">+97 more</span>
        </div>

        {/* Trust */}
        <div className="flex items-center gap-1.5 mt-6">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span className="text-[0.7rem] text-[#4a5568]">AES-256 encrypted &middot; 5 patents pending &middot; MIT licensed</span>
        </div>
      </div>

      <style>{`
        @keyframes flowIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
