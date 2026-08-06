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
      <div className="login-on-split">
        <BrandPanel />
        <div className="login-on-form">
          <div className="login-on-form-inner text-center">
            <div className="w-14 h-14 rounded-full bg-[rgba(22,163,74,0.1)] border border-[rgba(22,163,74,0.25)] flex items-center justify-center mx-auto mb-5">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h1 className="text-2xl font-bold text-[#1a2c27] mb-2">Check your email</h1>
            <p className="text-[#5b6b62] text-sm leading-relaxed">
              We sent a sign-in link to{' '}
              <strong className="text-[#16a34a] font-mono">{email}</strong>
            </p>
            <button
              onClick={() => setMagicLinkSent(false)}
              className="mt-6 px-8 py-[0.625rem] rounded-[10px] bg-transparent border border-[#e4dccf] text-[#5b6b62] font-semibold cursor-pointer text-sm hover:border-[#16a34a] hover:text-[#16a34a] transition-colors"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-on-split">
      <BrandPanel />
      <div className="login-on-form">
        <div className="login-on-form-inner">
          <h1 className="text-2xl font-bold text-[#1a2c27] mb-1">Welcome back</h1>
          <p className="text-[#5b6b62] text-sm mb-6">Sign in to your 0nMCP account</p>

          <OAuthButtons mode="signin" redirectTo={redirect} />

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-[#e4dccf]" />
            <span className="text-[0.7rem] text-[#8a978d] uppercase tracking-[0.08em] font-semibold">or continue with email</span>
            <div className="flex-1 h-px bg-[#e4dccf]" />
          </div>

          {error && (
            <div className="px-4 py-[0.625rem] rounded-lg bg-[rgba(220,38,38,0.08)] border border-[rgba(220,38,38,0.2)] text-[#dc2626] text-[0.8rem] mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[0.8rem] font-semibold text-[#1a2c27] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoFocus
                autoComplete="email"
                className="w-full px-4 py-3 rounded-[10px] bg-white border border-[#e4dccf] text-[#1a2c27] text-sm outline-none font-[inherit] transition-colors focus:border-[#16a34a] focus:ring-2 focus:ring-[rgba(22,163,74,0.15)] placeholder:text-[#8a978d]"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-[0.8rem] font-semibold text-[#1a2c27]">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#16a34a] no-underline hover:underline">Forgot password?</Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-[10px] bg-white border border-[#e4dccf] text-[#1a2c27] text-sm outline-none font-[inherit] transition-colors focus:border-[#16a34a] focus:ring-2 focus:ring-[rgba(22,163,74,0.15)] placeholder:text-[#8a978d]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="py-3 rounded-[10px] bg-[#16a34a] border-none text-white font-bold text-[0.9rem] cursor-pointer mt-1 transition-all hover:bg-[#15803d] disabled:opacity-50 shadow-[0_6px_18px_-6px_rgba(22,163,74,0.5)]"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <button
            onClick={handleMagicLink}
            disabled={loading}
            className="w-full py-[0.625rem] rounded-[10px] bg-transparent border border-[#e4dccf] text-[#5b6b62] font-semibold text-[0.85rem] cursor-pointer mt-3 transition-colors hover:border-[#16a34a] hover:text-[#16a34a]"
          >
            Send magic link instead
          </button>

          <p className="text-center text-[0.8rem] text-[#8a978d] mt-5">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#16a34a] no-underline font-semibold hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Brand Panel (left side) — static, 0nTask style ──────────────── */

const FEATURES = [
  'One command → multiple services, real API calls',
  '1,600+ tools across 109 services',
  'AES-256 encrypted · patent-pending vault',
]

function BrandPanel() {
  return (
    <div className="login-on-brand">
      <div className="login-on-brand-inner">
        {/* Logo — on a white chip so the color wordmark reads on the green panel */}
        <div className="mb-9 inline-flex rounded-2xl bg-white px-5 py-3.5 shadow-lg">
          <Image src="/brand/0nmcp-logo.png" alt="0nMCP" width={170} height={41} className="object-contain h-9 w-auto" priority />
        </div>

        {/* Tagline */}
        <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold text-white leading-tight mb-3">
          You describe it.<br />We execute it.
        </h2>
        <p className="text-white/85 text-base mb-9 leading-relaxed">
          One command. Multiple services. Real API calls — no glue code.
        </p>

        {/* Static feature points */}
        <ul className="flex flex-col gap-3.5 mb-10">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span className="text-white/95 text-[0.95rem] leading-snug">{f}</span>
            </li>
          ))}
        </ul>

        {/* Service logos (static) */}
        <div className="flex items-center gap-3 mb-6">
          {['/brand/logos/stripe.svg', '/brand/logos/slack.svg', '/brand/logos/openai.svg', '/brand/logos/github.svg', '/brand/logos/supabase.svg'].map(src => (
            <Image key={src} src={src} alt="" width={22} height={22} className="rounded-[4px] brightness-0 invert opacity-80" />
          ))}
          <span className="text-xs text-white/75 self-center">+104 more</span>
        </div>

        {/* Trust */}
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" className="opacity-80"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span className="text-[0.72rem] text-white/70">AES-256 encrypted &middot; patents pending &middot; Source-available</span>
        </div>
      </div>
    </div>
  )
}
