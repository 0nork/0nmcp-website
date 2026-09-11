'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import OAuthButtons from '@/components/OAuthButtons'

const FEATURES = [
  '1,598+ AI tools across 106 services',
  '7-layer encrypted credential vault',
  'Works on Claude, GPT & Gemini',
  'Pipeline, Assembly Line & Radial Burst',
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

  const supabase = createSupabaseBrowser()

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/0nboarding')
    })
  }, [router, supabase])

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
      if (signUpError) { setError(signUpError.message); setLoading(false); return }
      router.push('/0nboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-on-split">
      <BrandPanel />
      <div className="login-on-form">
        <div className="login-on-form-inner">
          <h1 className="text-2xl font-bold text-[#1a2c27] mb-1">Create your account</h1>
          <p className="text-[#5b6b62] text-sm mb-6">Free tier. No credit card required.</p>

          <OAuthButtons mode="signup" />

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

          <form onSubmit={handleEmailSignup} className="flex flex-col gap-4">
            <div>
              <label className="block text-[0.8rem] font-semibold text-[#1a2c27] mb-1.5">Full name</label>
              <input
                type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Jane Smith" required autoFocus autoComplete="name"
                className="w-full px-4 py-3 rounded-[10px] bg-white border border-[#e4dccf] text-[#1a2c27] text-sm outline-none font-[inherit] transition-colors focus:border-[#16a34a] focus:ring-2 focus:ring-[rgba(22,163,74,0.15)] placeholder:text-[#8a978d]"
              />
            </div>
            <div>
              <label className="block text-[0.8rem] font-semibold text-[#1a2c27] mb-1.5">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" required autoComplete="email"
                className="w-full px-4 py-3 rounded-[10px] bg-white border border-[#e4dccf] text-[#1a2c27] text-sm outline-none font-[inherit] transition-colors focus:border-[#16a34a] focus:ring-2 focus:ring-[rgba(22,163,74,0.15)] placeholder:text-[#8a978d]"
              />
            </div>
            <div>
              <label className="block text-[0.8rem] font-semibold text-[#1a2c27] mb-1.5">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min 8 characters" required minLength={8} autoComplete="new-password"
                className="w-full px-4 py-3 rounded-[10px] bg-white border border-[#e4dccf] text-[#1a2c27] text-sm outline-none font-[inherit] transition-colors focus:border-[#16a34a] focus:ring-2 focus:ring-[rgba(22,163,74,0.15)] placeholder:text-[#8a978d]"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="py-3 rounded-[10px] bg-[#16a34a] border-none text-white font-bold text-[0.9rem] cursor-pointer mt-1 transition-all hover:bg-[#15803d] disabled:opacity-50 shadow-[0_6px_18px_-6px_rgba(22,163,74,0.5)]"
            >
              {loading ? 'Creating account...' : 'Claim Your Spot'}
            </button>
          </form>

          <p className="text-center text-[0.8rem] text-[#8a978d] mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-[#16a34a] no-underline font-semibold hover:underline">Sign in</Link>
          </p>
          <p className="text-center text-[0.7rem] text-[#8a978d] mt-2 leading-relaxed">
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ─── Brand Panel (left side) — static, 0nTask style ──────────────── */

function BrandPanel() {
  return (
    <div className="login-on-brand">
      <div className="login-on-brand-inner">
        <div className="mb-9 inline-flex rounded-2xl bg-white px-5 py-3.5 shadow-lg">
          <Image src="/brand/0nmcp-logo.png" alt="0nMCP" width={170} height={41} className="object-contain h-9 w-auto" priority />
        </div>

        <h2 className="text-[clamp(1.6rem,3vw,2.2rem)] font-extrabold text-white leading-tight mb-3">
          Welcome to<br />the .0n Standard.
        </h2>
        <p className="text-white/85 text-base mb-9 leading-relaxed">
          Start free — no credit card. One command runs across every service you connect.
        </p>

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

        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" className="opacity-80"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <span className="text-[0.72rem] text-white/70">Patents pending &middot; Source-available &middot; Built by RocketOpp LLC</span>
        </div>
      </div>
    </div>
  )
}
