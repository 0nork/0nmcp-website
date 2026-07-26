'use client'

// 0nVault — the keystone. Connect any of the 113 apps here (stored encrypted),
// then copy your one-time 0nVault token to light everything up in 0nTask + the
// Chrome extension. Tailwind only, Lucide only (repo rules).
import { useEffect, useMemo, useState } from 'react'
import { Search, Check, Plus, Copy, ShieldCheck, Loader2, KeyRound, X, ExternalLink } from 'lucide-react'
import APPS from '@/data/apps.json'

type App = { slug: string; name: string; domain: string; category: string; desc: string }
const SRC = [(d: string) => `https://unavatar.io/${d}?fallback=false`, (d: string) => `https://icons.duckduckgo.com/ip3/${d}.ico`]

function Logo({ app }: { app: App }) {
  const [i, setI] = useState(0)
  if (i >= SRC.length || !app.domain) {
    return <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#6EE05A]/20 text-sm font-extrabold text-[#6EE05A]">{app.name.charAt(0).toUpperCase()}</div>
  }
  return <img src={SRC[i](app.domain)} alt="" width={40} height={40} loading="lazy" onError={() => setI(i + 1)} className="h-10 w-10 rounded-[10px] border border-white/10 bg-white object-contain" />
}

function VaultWordmark({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/icon-green.png" alt="0nVault" width={40} height={40} className="h-10 w-10 object-contain" />
      <span className="text-[26px] font-black leading-none tracking-tight">
        <span className="text-[#9aa3ad]">0n</span><span className="text-[#6EE05A]">VAULT</span>
      </span>
    </div>
  )
}

export default function VaultPage() {
  const apps = APPS as App[]
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const [token, setToken] = useState<string | null>(null)
  const [connected, setConnected] = useState<Set<string>>(new Set())
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [copied, setCopied] = useState(false)
  const [modal, setModal] = useState<App | null>(null)
  const [keyval, setKeyval] = useState('')
  const [saving, setSaving] = useState(false)
  const [mErr, setMErr] = useState('')

  const [flash, setFlash] = useState('')
  useEffect(() => {
    fetch('/api/token?full=1', { credentials: 'same-origin' })
      .then(async (r) => { if (r.status === 401) { setAuthed(false); return null } setAuthed(true); return r.json() })
      .then((d) => { if (d) { setToken(d.token || null); setConnected(new Set((d.connectedServices || []).map((s: string) => String(s).toLowerCase()))) } })
      .catch(() => setAuthed(false))
    // OAuth return (?slack=connected|denied|error)
    const s = new URLSearchParams(window.location.search).get('slack')
    if (s === 'connected') { setConnected((c) => new Set(c).add('slack')); setFlash('✅ Slack connected — your workspace is in your vault.') }
    else if (s === 'denied') setFlash('Slack connection was cancelled.')
    else if (s === 'error') setFlash('Slack connection failed — try again.')
    if (s) window.history.replaceState({}, '', '/vault')
  }, [])

  // OAuth-connect apps go straight to the provider; the rest use the paste-key modal.
  const OAUTH: Record<string, string> = {
    slack: '/api/connect/slack/start',
    gmail: '/api/auth/google-connect', google_calendar: '/api/auth/google-connect',
    google_sheets: '/api/auth/google-connect', google_drive: '/api/auth/google-connect',
  }
  // "Apps" = natively wired integrations (OAuth flow or configured). "Integrations" = the full catalog.
  const NATIVE = new Set(['slack', 'gmail', 'google_calendar', 'google_sheets', 'google_drive', 'stripe', 'figma', 'linkedin', 'openai', 'groq', 'crm'])
  const [view, setView] = useState<'apps' | 'integrations'>('apps')
  const onConnect = (a: App) => { if (OAUTH[a.slug]) { window.location.href = OAUTH[a.slug]; return } setModal(a); setKeyval(''); setMErr('') }

  const pool = useMemo(() => apps.filter((a) => view === 'integrations' || NATIVE.has(a.slug)), [apps, view])
  const cats = useMemo(() => ['All', ...Array.from(new Set(pool.map((a) => a.category))).sort()], [pool])
  const shown = useMemo(() => pool.filter((a) => (cat === 'All' || a.category === cat) && (!q || a.name.toLowerCase().includes(q.toLowerCase()))), [pool, q, cat])

  const copy = () => { if (token) { navigator.clipboard?.writeText(token); setCopied(true); setTimeout(() => setCopied(false), 1600) } }

  const connect = async () => {
    if (!modal || !keyval.trim()) return
    setSaving(true); setMErr('')
    const r = await fetch('/api/vault/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ service: modal.slug, credentials: { apiKey: keyval.trim() } }) })
    const d = await r.json().catch(() => ({}))
    setSaving(false)
    if (r.ok && d.ok) { setConnected((s) => new Set(s).add(modal.slug)); setModal(null); setKeyval('') }
    else setMErr(d.error || 'Could not save')
  }

  if (authed === false) {
    return (
      <div className="mx-auto grid min-h-[78vh] max-w-md place-items-center px-5 text-center">
        <div>
          <VaultWordmark className="justify-center" />
          <h1 className="mt-6 text-2xl font-black text-[#f0f4f8]">Sign in to your 0n account</h1>
          <p className="mx-auto mt-2 max-w-xs text-[#9fb0cc]">0nVault is your single sign-on for the whole 0n ecosystem. Log in once to get the token that connects every 0n product.</p>
          <a href="/login?next=/vault" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6EE05A] px-6 py-3 text-sm font-bold text-[#0d1117] transition-opacity hover:opacity-90">Sign in</a>
          <p className="mt-3 text-xs text-[#6b7c9c]">No account? <a href="/signup?next=/vault" className="font-semibold text-[#6EE05A] hover:underline">Create one free</a></p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-1.5"><VaultWordmark /></div>
      <p className="mb-6 text-[#9fb0cc]">Your single sign-on for the 0n ecosystem. Connect an app once — it&apos;s stored encrypted here and works across every 0n product with one token.</p>

      {flash && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#6EE05A]/30 bg-[#6EE05A]/[0.08] px-4 py-3 text-sm text-[#6EE05A]">
          <Check className="h-4 w-4 shrink-0" /><span className="flex-1">{flash}</span>
          <button onClick={() => setFlash('')}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* token card */}
      <div className="mb-8 rounded-2xl border border-[#6EE05A]/30 bg-gradient-to-br from-[#6EE05A]/[0.07] to-transparent p-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6EE05A]"><KeyRound className="h-3.5 w-3.5" /> Your 0n token · one key for every 0n product</div>
        <div className="flex flex-wrap items-center gap-3">
          <code className="min-w-0 flex-1 truncate rounded-xl border border-white/10 bg-[#0d1117] px-4 py-3 font-mono text-sm text-[#f0f4f8]">{authed === null ? 'Loading…' : token || 'No token yet'}</code>
          <button onClick={copy} disabled={!token} className="flex items-center gap-2 rounded-xl bg-[#6EE05A] px-4 py-3 text-sm font-bold text-[#0d1117] disabled:opacity-40">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="mt-2.5 text-[13px] text-[#9fb0cc]">Paste this into any 0n product — <b className="text-[#f0f4f8]">0nTask → Apps → Sync</b>, the <b className="text-[#f0f4f8]">Chrome extension</b>, and more — to sign in and light up everything you&apos;ve connected here. One account, one token, everywhere.</p>
      </div>

      {/* Apps (native) vs Integrations (all) */}
      <div className="mb-4 inline-flex rounded-xl border border-white/10 bg-[#161b22] p-1">
        <button onClick={() => { setView('apps'); setCat('All') }} className={`rounded-lg px-4 py-1.5 text-[13px] font-bold ${view === 'apps' ? 'bg-[#6EE05A] text-[#0d1117]' : 'text-[#9fb0cc] hover:text-[#f0f4f8]'}`}>Apps <span className="opacity-70">· {NATIVE.size}</span></button>
        <button onClick={() => { setView('integrations'); setCat('All') }} className={`rounded-lg px-4 py-1.5 text-[13px] font-bold ${view === 'integrations' ? 'bg-[#6EE05A] text-[#0d1117]' : 'text-[#9fb0cc] hover:text-[#f0f4f8]'}`}>Integrations <span className="opacity-70">· {apps.length}</span></button>
      </div>
      <p className="mb-4 text-[13px] text-[#6b7c9c]">{view === 'apps' ? 'Fully-wired apps — connect with one click (OAuth) or a key.' : 'The full 0nMCP catalog. Connect any with an API key; native OAuth is rolling out.'}</p>

      {/* controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b7c9c]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full rounded-xl border border-white/10 bg-[#161b22] py-2.5 pl-9 pr-3 text-sm text-[#f0f4f8] placeholder:text-[#6b7c9c] focus:outline-none focus:ring-1 focus:ring-[#6EE05A]" />
        </div>
      </div>
      <div className="mb-5 flex flex-wrap gap-1.5">
        {cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`rounded-full px-3 py-1 text-xs font-semibold ${cat === c ? 'bg-[#6EE05A] text-[#0d1117]' : 'border border-white/10 bg-[#161b22] text-[#9fb0cc] hover:bg-[#1c2430]'}`}>{c}</button>)}
      </div>

      {/* grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((a) => {
          const on = connected.has(a.slug)
          return (
            <div key={a.slug} className={`flex items-center gap-3 rounded-2xl border bg-[#161b22] p-3.5 ${on ? 'border-[#6EE05A]/40' : 'border-white/10 hover:border-white/20'}`}>
              <Logo app={a} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5"><span className="truncate text-[14px] font-bold text-[#f0f4f8]">{a.name}</span>{on && <Check className="h-3.5 w-3.5 shrink-0 text-[#6EE05A]" />}</div>
                <div className="flex items-center gap-1.5 truncate text-[11.5px] text-[#6b7c9c]">{a.category}{OAUTH[a.slug] && <span className="rounded bg-[#6EE05A]/15 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-[#6EE05A]">1-click</span>}</div>
              </div>
              <button onClick={() => onConnect(a)} className={`shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-bold ${on ? 'bg-[#6EE05A]/15 text-[#6EE05A]' : 'bg-[#6EE05A] text-[#0d1117]'}`}>
                {on ? 'Connected' : <span className="flex items-center gap-1"><Plus className="h-3 w-3" />Connect</span>}
              </button>
            </div>
          )
        })}
      </div>

      {/* connect modal */}
      {modal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setModal(null)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#161b22] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center gap-3">
              <Logo app={modal} />
              <div className="flex-1"><div className="text-lg font-black text-[#f0f4f8]">Connect {modal.name}</div><div className="text-xs text-[#6b7c9c]">{modal.category}</div></div>
              <button onClick={() => setModal(null)}><X className="h-4 w-4 text-[#6b7c9c]" /></button>
            </div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#9fb0cc]">API key / token</label>
            <input value={keyval} onChange={(e) => { setKeyval(e.target.value); setMErr('') }} placeholder="Paste your key…" className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0d1117] px-3.5 py-3 font-mono text-[13px] text-[#f0f4f8] focus:outline-none focus:ring-1 focus:ring-[#6EE05A]" />
            {mErr && <p className="mt-2 text-[12.5px] text-[#fb7185]">{mErr}</p>}
            <p className="mt-2 flex items-center gap-1 text-[11.5px] text-[#6b7c9c]"><ShieldCheck className="h-3 w-3" /> Encrypted in your vault. <a href={`https://${modal.domain}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 text-[#6EE05A]">Get a key <ExternalLink className="h-3 w-3" /></a></p>
            <button onClick={connect} disabled={saving || !keyval.trim()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6EE05A] py-2.5 text-sm font-bold text-[#0d1117] disabled:opacity-40">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Connect &amp; store
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
