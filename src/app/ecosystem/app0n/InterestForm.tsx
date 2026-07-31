'use client'

import { useState } from 'react'
import { ArrowRight, Check, Loader2 } from 'lucide-react'

/**
 * Waitlist / investor enquiry form for the app0n coming-soon page.
 *
 * The two intents are one form with a toggle rather than two forms, because
 * someone arriving to ask about investing should not have to hunt for a second
 * box — but they are tagged separately in the CRM, since answering an investor
 * with a waitlist email is worse than not replying.
 */
export default function InterestForm() {
  const [intent, setIntent] = useState<'waitlist' | 'invest'>('waitlist')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState('')
  const [err, setErr] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true); setErr('')
    try {
      const r = await fetch('/api/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, intent, product: 'app0n' }),
      })
      const j = await r.json()
      if (!r.ok) { setErr(j.error || 'Something went wrong.'); return }
      setDone(j.message || 'Thanks.')
    } catch {
      setErr('Could not reach us. Please email mike@rocketopp.com.')
    } finally {
      setBusy(false)
    }
  }

  const field =
    'w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-white/25 focus:outline-none'

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/5 p-6 text-center">
        <Check className="mx-auto h-6 w-6 text-emerald-400" />
        <p className="mt-3 font-semibold text-white">{done}</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex gap-2">
        {(['waitlist', 'invest'] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setIntent(k)}
            className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition ${
              intent === k
                ? 'border-white/40 bg-white/10 text-white'
                : 'border-white/10 text-white/50 hover:text-white/80'
            }`}
          >
            {k === 'waitlist' ? 'Tell me when it launches' : 'I want to invest'}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" className={field} />
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Email" autoComplete="email" className={field} />
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder={intent === 'invest' ? 'A line about you and what you are looking for.' : 'Anything you want it to do? (optional)'}
        className={`${field} mt-3 resize-none`}
      />

      {err && <p className="mt-3 rounded-lg border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-sm text-red-200">{err}</p>}

      <button
        type="submit"
        disabled={busy}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-neutral-950 transition hover:opacity-90 disabled:opacity-60"
      >
        {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <>{intent === 'invest' ? 'Start the conversation' : 'Join the list'} <ArrowRight className="h-4 w-4" /></>}
      </button>

      {intent === 'invest' && (
        <p className="mt-3 text-[11px] leading-relaxed text-white/40">
          This form records interest only. It is not an offer to sell securities and no
          money is taken here.
        </p>
      )}
    </form>
  )
}
