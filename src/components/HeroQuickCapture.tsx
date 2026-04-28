'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'

/**
 * Hero email-only quick capture. One field, one button. Posts to the
 * same /api/request-access endpoint the longer form uses, so leads land
 * in CRM (tagged) + Supabase waitlist regardless of which entry point
 * a visitor used.
 *
 * Designed to be a low-friction first touch — name and company can be
 * collected on the welcome email click-through.
 */
export default function HeroQuickCapture() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'loading' || !email) return
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: email.split('@')[0],
          email,
          source: '0nmcp.com hero',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? 'Something went wrong. Try again.')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch {
      setError('Network error. Try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#6EE05A]/30 bg-[#6EE05A]/8 px-5 py-3.5">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-[#6EE05A]" />
        <p className="text-sm font-semibold text-white">
          You&rsquo;re on the list. Watch <span className="font-mono text-[#6EE05A]">noreply@0nmcp.com</span> for next steps.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="mt-6 flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-border/60 bg-card/60 p-2 backdrop-blur sm:flex-row sm:items-stretch"
    >
      <input
        type="email"
        required
        autoComplete="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 rounded-xl bg-transparent px-4 py-3 text-base text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#6EE05A]/40"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6EE05A] px-6 py-3 text-base font-bold text-black shadow-[0_0_24px_rgba(110,224,90,0.35)] transition-transform hover:scale-[1.02] disabled:opacity-60"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Reserving…
          </>
        ) : (
          <>
            Get Early Access
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
      {error && (
        <p className="absolute -bottom-6 left-2 text-xs text-red-300" role="alert">{error}</p>
      )}
    </form>
  )
}
