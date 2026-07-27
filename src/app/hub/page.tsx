'use client'

// 0nVault Hub — the home of your 0n account. One identity, your token, and every
// 0n product in one place. Tailwind only, Lucide only (repo rules).
import { useEffect, useState } from 'react'
import {
  KeyRound, Copy, Check, ArrowRight, Loader2, ShieldCheck, Plug,
  CheckSquare, Globe, Gauge, Share2, Boxes, LayoutGrid, Puzzle,
} from 'lucide-react'

type Product = {
  name: string
  tag: string
  desc: string
  url: string
  icon: React.ComponentType<{ className?: string }>
  tile: string  // static Tailwind classes (JIT-safe, no inline styles per repo rules)
  status: 'live' | 'sso' | 'soon'
}

const PRODUCTS: Product[] = [
  { name: '0nTask', tag: 'app.0ntask.com', desc: 'One screen for tasks — humans, AI & automations.', url: 'https://app.0ntask.com', icon: CheckSquare, tile: 'bg-[#16a34a]/15 text-[#16a34a]', status: 'live' },
  { name: 'web0n', tag: 'web0n.com', desc: 'Self-serve AI website builder.', url: 'https://web0n.com', icon: Globe, tile: 'bg-[#0891b2]/15 text-[#0891b2]', status: 'sso' },
  { name: 'CRO9', tag: 'cro9.com', desc: 'Conversion analytics that acts on itself.', url: 'https://www.cro9.com', icon: Gauge, tile: 'bg-[#22d3ee]/15 text-[#22d3ee]', status: 'live' },
  { name: 'social0n', tag: 'social0n.com', desc: 'AI social content on autopilot.', url: 'https://social0n.com', icon: Share2, tile: 'bg-[#7c3aed]/15 text-[#7c3aed]', status: 'soon' },
  { name: '0nMCP', tag: '0nmcp.com', desc: 'The orchestrator — 1,640 tools, 109 services.', url: 'https://www.0nmcp.com', icon: Boxes, tile: 'bg-[#6EE05A]/15 text-[#6EE05A]', status: 'live' },
  { name: '0nCore', tag: '0ncore.com', desc: 'Your customer portal & command deck.', url: 'https://0ncore.com', icon: LayoutGrid, tile: 'bg-[#f59e0b]/15 text-[#f59e0b]', status: 'live' },
]

function Wordmark() {
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/onvault-light.png" alt="0nVault" width={200} height={52} className="h-11 w-auto object-contain" />
    </div>
  )
}

function StatusPill({ s }: { s: Product['status'] }) {
  if (s === 'soon') return <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6b7c9c]">Soon</span>
  if (s === 'sso') return <span className="flex items-center gap-1 rounded-full bg-[#6EE05A]/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6EE05A]"><ShieldCheck className="h-2.5 w-2.5" /> Login with 0n</span>
  return <span className="rounded-full bg-[#6EE05A]/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6EE05A]">Live</span>
}

export default function HubPage() {
  const [token, setToken] = useState<string | null>(null)
  const [connected, setConnected] = useState<number>(0)
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/token?full=1', { credentials: 'same-origin' })
      .then(async (r) => { if (r.status === 401) { setAuthed(false); return null } setAuthed(true); return r.json() })
      .then((d) => { if (d) { setToken(d.token || null); setConnected((d.connectedServices || []).length) } })
      .catch(() => setAuthed(false))
  }, [])

  const copy = () => { if (token) { navigator.clipboard?.writeText(token); setCopied(true); setTimeout(() => setCopied(false), 1600) } }

  if (authed === false) {
    return (
      <div className="mx-auto grid min-h-[78vh] max-w-md place-items-center px-5 text-center">
        <div>
          <div className="flex justify-center"><Wordmark /></div>
          <h1 className="mt-6 text-2xl font-black text-[#f0f4f8]">Your 0n account, one place</h1>
          <p className="mx-auto mt-2 max-w-xs text-[#9fb0cc]">Sign in to see every 0n product, your connected apps, and your single 0n token.</p>
          <a href="/login?next=/hub" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#6EE05A] px-6 py-3 text-sm font-bold text-[#0d1117] transition-opacity hover:opacity-90">Sign in <ArrowRight className="h-4 w-4" /></a>
          <p className="mt-3 text-xs text-[#6b7c9c]">No account? <a href="/signup?next=/hub" className="font-semibold text-[#6EE05A] hover:underline">Create one free</a></p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-xl text-[#9fb0cc]">The home of your 0n account. One login, every product, all your connections — secured in one vault.</p>
        </div>
        <a href="/vault" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#161b22] px-4 py-2.5 text-sm font-semibold text-[#f0f4f8] hover:border-[#6EE05A]/40">
          <Plug className="h-4 w-4 text-[#6EE05A]" /> Manage apps · <span className="text-[#6EE05A]">{authed === null ? '…' : connected}</span>
        </a>
      </div>

      {/* Token card */}
      <div className="mt-8 rounded-2xl border border-[#6EE05A]/30 bg-gradient-to-br from-[#6EE05A]/[0.07] to-transparent p-5">
        <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6EE05A]"><KeyRound className="h-3.5 w-3.5" /> Your 0n token · one key for every 0n product</div>
        <div className="flex flex-wrap items-center gap-3">
          <code className="min-w-0 flex-1 truncate rounded-xl border border-white/10 bg-[#0d1117] px-4 py-3 font-mono text-sm text-[#f0f4f8]">{authed === null ? 'Loading…' : token || 'No token yet'}</code>
          <button onClick={copy} disabled={!token} className="flex items-center gap-2 rounded-xl bg-[#6EE05A] px-4 py-3 text-sm font-bold text-[#0d1117] disabled:opacity-40">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="mt-2.5 text-[13px] text-[#9fb0cc]">Use <b className="text-[#f0f4f8]">Login with 0n</b> wherever you see it — or paste this token into 0nTask, the Chrome extension, and more.</p>
      </div>

      {/* Products */}
      <div className="mt-10 mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9fb0cc]"><LayoutGrid className="h-3.5 w-3.5 text-[#6EE05A]" /> Your 0n products</div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((p) => {
          const Icon = p.icon
          const soon = p.status === 'soon'
          const Card = (
            <div className={`group flex h-full flex-col rounded-2xl border border-white/10 bg-[#161b22] p-5 transition-all ${soon ? 'opacity-60' : 'hover:-translate-y-0.5 hover:border-[#6EE05A]/40'}`}>
              <div className="flex items-start justify-between">
                <span className={`grid h-11 w-11 place-items-center rounded-xl ${p.tile}`}><Icon className="h-5 w-5" /></span>
                <StatusPill s={p.status} />
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

      {/* Connect more */}
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
  )
}
