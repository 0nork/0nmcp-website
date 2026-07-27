'use client'

// 0nVault — the vault door. A standalone, fully-gated entry to the 0n ecosystem.
// Locked without a login. Signed in → "Welcome, {First}" + a power button to enter.
// Unrecognized device → one logical IKY question only the real owner would know.
// Tailwind only, Lucide only (repo rules).
import { useEffect, useState } from 'react'
import {
  Power, ShieldCheck, Lock, ArrowRight, Loader2, KeyRound, Copy, Check,
  CheckSquare, Globe, Gauge, Share2, Boxes, LayoutGrid, Puzzle, Plug,
} from 'lucide-react'

type Phase = 'loading' | 'locked' | 'welcome' | 'challenge' | 'booting' | 'inside'

const PRODUCTS = [
  { name: '0nTask', tag: 'app.0ntask.com', desc: 'One screen for tasks — humans, AI & automations.', url: 'https://app.0ntask.com', icon: CheckSquare, tile: 'bg-[#16a34a]/15 text-[#16a34a]', status: 'live' as const },
  { name: 'web0n', tag: 'web0n.com', desc: 'Self-serve AI website builder.', url: 'https://web0n.com', icon: Globe, tile: 'bg-[#0891b2]/15 text-[#0891b2]', status: 'sso' as const },
  { name: 'CRO9', tag: 'cro9.com', desc: 'Conversion analytics that acts on itself.', url: 'https://www.cro9.com', icon: Gauge, tile: 'bg-[#22d3ee]/15 text-[#22d3ee]', status: 'live' as const },
  { name: 'social0n', tag: 'social0n.com', desc: 'AI social content on autopilot.', url: 'https://social0n.com', icon: Share2, tile: 'bg-[#7c3aed]/15 text-[#7c3aed]', status: 'soon' as const },
  { name: '0nMCP', tag: '0nmcp.com', desc: 'The orchestrator — 1,640 tools, 109 services.', url: 'https://www.0nmcp.com', icon: Boxes, tile: 'bg-[#6EE05A]/15 text-[#6EE05A]', status: 'live' as const },
  { name: '0nCore', tag: '0ncore.com', desc: 'Your customer portal & command deck.', url: 'https://0ncore.com', icon: LayoutGrid, tile: 'bg-[#f59e0b]/15 text-[#f59e0b]', status: 'live' as const },
]

export default function VaultDoor() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [firstName, setFirstName] = useState('there')
  const [deviceKnown, setDeviceKnown] = useState(false)
  const [challenge, setChallenge] = useState<{ id: string; question: string } | null>(null)
  const [answer, setAnswer] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  // inside data
  const [token, setToken] = useState<string | null>(null)
  const [connected, setConnected] = useState(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/hub/session', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((d) => {
        if (!d.authed) { setPhase('locked'); return }
        setFirstName(d.firstName || 'there')
        setDeviceKnown(!!d.deviceKnown)
        setChallenge(d.challenge || null)
        setPhase('welcome')
      })
      .catch(() => setPhase('locked'))
  }, [])

  const loadInside = () => {
    fetch('/api/token?full=1', { credentials: 'same-origin' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) { setToken(d.token || null); setConnected((d.connectedServices || []).length) } })
      .catch(() => {})
  }

  const powerOn = () => {
    if (deviceKnown || !challenge) { setPhase('booting'); loadInside(); setTimeout(() => setPhase('inside'), 900) }
    else setPhase('challenge')
  }

  const verify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answer.trim() || busy || !challenge) return
    setBusy(true); setErr('')
    try {
      const r = await fetch('/api/hub/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ challengeId: challenge.id, answer: answer.trim() }) })
      const d = await r.json()
      if (d.ok) { setPhase('booting'); loadInside(); setTimeout(() => setPhase('inside'), 900) }
      else setErr(d.message || "That doesn't match. Try again.")
    } catch { setErr('Something went wrong — try again.') }
    finally { setBusy(false) }
  }

  const copy = () => { if (token) { navigator.clipboard?.writeText(token); setCopied(true); setTimeout(() => setCopied(false), 1500) } }

  const SHELL = 'fixed inset-0 z-[100] overflow-y-auto bg-[#080b10] bg-[radial-gradient(120%_90%_at_50%_-10%,rgba(110,224,90,0.10),transparent_55%)] text-[#f0f4f8]'

  // ── Loading ───────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return <div className={`${SHELL} grid place-items-center`}><Loader2 className="h-7 w-7 animate-spin text-[#6EE05A]" /></div>
  }

  // ── Locked (not signed in) — complete lockdown ─────────────────────────────
  if (phase === 'locked') {
    return (
      <div className={`${SHELL} grid place-items-center px-6`}>
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/onvault-light.png" alt="0nVault" width={200} height={52} className="mx-auto h-12 w-auto object-contain opacity-90" />
          <div className="mx-auto mt-10 grid h-20 w-20 place-items-center rounded-full border border-white/10 bg-white/[0.03]"><Lock className="h-8 w-8 text-[#6b7c9c]" /></div>
          <h1 className="mt-6 text-2xl font-black">Access restricted</h1>
          <p className="mx-auto mt-2 max-w-xs text-[#9fb0cc]">This is your secure 0n vault. Sign in to your 0n account to unlock it.</p>
          <a href="/login?next=/hub" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#6EE05A] px-7 py-3 text-sm font-bold text-[#0d1117] transition-opacity hover:opacity-90">Sign in <ArrowRight className="h-4 w-4" /></a>
          <p className="mt-3 text-xs text-[#6b7c9c]">No account? <a href="/signup?next=/hub" className="font-semibold text-[#6EE05A] hover:underline">Create one free</a></p>
        </div>
      </div>
    )
  }

  // ── Welcome + power button ─────────────────────────────────────────────────
  if (phase === 'welcome' || phase === 'booting') {
    const booting = phase === 'booting'
    return (
      <div className={`${SHELL} grid place-items-center px-6`}>
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/onvault-light.png" alt="0nVault" width={180} height={46} className="mx-auto h-9 w-auto object-contain opacity-80" />
          <p className="mt-10 text-sm font-bold uppercase tracking-[0.3em] text-[#6EE05A]">Welcome</p>
          <h1 className="mt-2 text-balance text-5xl font-black tracking-tight sm:text-7xl">{firstName}.</h1>
          <p className="mx-auto mt-4 max-w-sm text-[#9fb0cc]">{booting ? 'Unlocking your vault…' : 'Everything you build lives here, secured. Power on to enter.'}</p>
          <button
            onClick={powerOn}
            disabled={booting}
            aria-label="Power on to enter"
            className={`group mx-auto mt-10 grid h-36 w-36 place-items-center rounded-full border-2 border-[#6EE05A]/40 bg-[#6EE05A]/[0.06] shadow-[0_0_60px_-10px_rgba(110,224,90,0.5)] transition-all hover:scale-105 hover:border-[#6EE05A] hover:bg-[#6EE05A]/[0.12] disabled:opacity-80 ${booting ? 'animate-pulse' : ''}`}
          >
            {booting ? <Loader2 className="h-14 w-14 animate-spin text-[#6EE05A]" /> : <Power className="h-14 w-14 text-[#6EE05A] transition-transform group-hover:scale-110" />}
          </button>
          {!booting && <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-[#6b7c9c]">Press to enter</p>}
        </div>
      </div>
    )
  }

  // ── IKY challenge (unrecognized device) ────────────────────────────────────
  if (phase === 'challenge') {
    return (
      <div className={`${SHELL} grid place-items-center px-6`}>
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#6EE05A]/30 bg-[#6EE05A]/[0.06]"><ShieldCheck className="h-7 w-7 text-[#6EE05A]" /></div>
          <h1 className="mt-6 text-2xl font-black">Quick check, {firstName}</h1>
          <p className="mt-2 text-[#9fb0cc]">We don&apos;t recognize this device. Just confirm it&apos;s you.</p>
          <form onSubmit={verify} className="mt-6 text-left">
            <label className="text-sm font-semibold text-[#f0f4f8]">{challenge?.question}</label>
            <input
              autoFocus value={answer} onChange={(e) => setAnswer(e.target.value)}
              placeholder="Your answer"
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#0d1117] px-4 py-3 text-sm text-[#f0f4f8] placeholder:text-[#6b7c9c] focus:border-[#6EE05A]/50 focus:outline-none"
            />
            {err && <p className="mt-2 text-sm font-semibold text-[#ff6b6b]">{err}</p>}
            <button type="submit" disabled={busy || !answer.trim()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6EE05A] py-3 text-sm font-bold text-[#0d1117] disabled:opacity-40">
              {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</> : <>Unlock <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>
          <p className="mt-4 text-xs text-[#6b7c9c]">Not you?{' '}
            <button
              type="button"
              onClick={async () => { await fetch('/api/auth/signout', { method: 'POST', credentials: 'same-origin' }).catch(() => {}); window.location.href = '/login?next=/hub' }}
              className="font-semibold text-[#9fb0cc] hover:text-[#6EE05A]"
            >Sign out</button>
          </p>
        </div>
      </div>
    )
  }

  // ── Inside the vault ───────────────────────────────────────────────────────
  return (
    <div className={SHELL}>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/onvault-light.png" alt="0nVault" width={190} height={50} className="h-11 w-auto object-contain" />
            <p className="mt-3 max-w-xl text-[#9fb0cc]">Welcome in, {firstName}. One login, every product, all your connections — secured in one vault.</p>
          </div>
          <a href="/vault" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#161b22] px-4 py-2.5 text-sm font-semibold text-[#f0f4f8] hover:border-[#6EE05A]/40">
            <Plug className="h-4 w-4 text-[#6EE05A]" /> Manage apps · <span className="text-[#6EE05A]">{connected}</span>
          </a>
        </div>

        <div className="mt-8 rounded-2xl border border-[#6EE05A]/30 bg-gradient-to-br from-[#6EE05A]/[0.07] to-transparent p-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6EE05A]"><KeyRound className="h-3.5 w-3.5" /> Your 0n token · one key for every 0n product</div>
          <div className="flex flex-wrap items-center gap-3">
            <code className="min-w-0 flex-1 truncate rounded-xl border border-white/10 bg-[#0d1117] px-4 py-3 font-mono text-sm text-[#f0f4f8]">{token || 'No token yet'}</code>
            <button onClick={copy} disabled={!token} className="flex items-center gap-2 rounded-xl bg-[#6EE05A] px-4 py-3 text-sm font-bold text-[#0d1117] disabled:opacity-40">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="mt-10 mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9fb0cc]"><LayoutGrid className="h-3.5 w-3.5 text-[#6EE05A]" /> Your 0n products</div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => {
            const Icon = p.icon
            const soon = p.status === 'soon'
            const Card = (
              <div className={`group flex h-full flex-col rounded-2xl border border-white/10 bg-[#161b22] p-5 transition-all ${soon ? 'opacity-60' : 'hover:-translate-y-0.5 hover:border-[#6EE05A]/40'}`}>
                <div className="flex items-start justify-between">
                  <span className={`grid h-11 w-11 place-items-center rounded-xl ${p.tile}`}><Icon className="h-5 w-5" /></span>
                  {p.status === 'sso'
                    ? <span className="flex items-center gap-1 rounded-full bg-[#6EE05A]/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6EE05A]"><ShieldCheck className="h-2.5 w-2.5" /> Login with 0n</span>
                    : soon ? <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6b7c9c]">Soon</span>
                    : <span className="rounded-full bg-[#6EE05A]/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6EE05A]">Live</span>}
                </div>
                <div className="mt-3 text-[17px] font-black text-[#f0f4f8]">{p.name}</div>
                <div className="text-[12px] font-mono text-[#6b7c9c]">{p.tag}</div>
                <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[#9fb0cc]">{p.desc}</p>
                <div className={`mt-4 inline-flex items-center gap-1.5 text-sm font-bold ${soon ? 'text-[#6b7c9c]' : 'text-[#6EE05A]'}`}>
                  {soon ? 'Coming soon' : <>Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></>}
                </div>
              </div>
            )
            return soon ? <div key={p.name}>{Card}</div> : <a key={p.name} href={p.url} target="_blank" rel="noreferrer">{Card}</a>
          })}
        </div>

        <a href="/vault" className="mt-6 flex items-center justify-between rounded-2xl border border-dashed border-white/15 bg-[#0d1117] p-5 hover:border-[#6EE05A]/40">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#6EE05A]/12 text-[#6EE05A]"><Puzzle className="h-5 w-5" /></span>
            <div>
              <div className="text-[15px] font-bold text-[#f0f4f8]">Connect your apps</div>
              <div className="text-[13px] text-[#9fb0cc]">113 integrations — connect once, use across every 0n product.</div>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-[#6EE05A]" />
        </a>
      </div>
    </div>
  )
}
