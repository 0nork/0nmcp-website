'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import OrchestratorForge from '@/components/OrchestratorForge'
import BlogSlider from '@/components/BlogSlider'

/**
 * SXO Living DOM Homepage — Styled Edition
 * Beautiful tables, trending bar, social grid, chat preview
 */

const TABLE_CATEGORIES = [
  { key: 'overview', label: 'Overview' },
  { key: 'crm', label: 'CRM' },
  { key: 'security', label: 'Security' },
  { key: 'ai', label: 'AI & Models' },
]

const TABLE_DATA: Record<string, { metric: string; typical: string; onmcp: string; highlight?: boolean }[]> = {
  overview: [
    { metric: 'Total Tools', typical: '10-50', onmcp: '1,183', highlight: true },
    { metric: 'Connected Services', typical: '1-5', onmcp: '99 services' },
    { metric: 'Configuration', typical: 'Manual YAML/JSON', onmcp: 'Zero config' },
    { metric: 'License', typical: 'Varies', onmcp: 'MIT — free forever' },
    { metric: 'Patents Filed', typical: 'None', onmcp: '5 US provisionals', highlight: true },
  ],
  crm: [
    { metric: 'CRM Tools', typical: '0', onmcp: '245 tools', highlight: true },
    { metric: 'Contacts', typical: 'None', onmcp: 'Full CRUD + tags + segments' },
    { metric: 'Calendars', typical: 'None', onmcp: '27 tools — booking, availability, reminders' },
    { metric: 'Invoices & Payments', typical: 'None', onmcp: '36 tools — Stripe + CRM billing' },
    { metric: 'Social Media', typical: 'None', onmcp: '35 tools — FB, IG, LinkedIn, Google' },
    { metric: 'Pipeline', typical: 'None', onmcp: '14 tools — opportunities, stages, forecasting' },
  ],
  security: [
    { metric: 'Credential Storage', typical: 'Plain text .env', onmcp: 'AES-256-GCM vault', highlight: true },
    { metric: 'Key Derivation', typical: 'None', onmcp: 'PBKDF2-SHA512 (100K iterations)' },
    { metric: 'Hardware Binding', typical: 'None', onmcp: 'Machine fingerprint lock' },
    { metric: 'Integrity Verification', typical: 'None', onmcp: 'Seal of Truth (SHA3-256)' },
    { metric: 'Escrow System', typical: 'None', onmcp: 'Multi-party X25519 ECDH', highlight: true },
  ],
  ai: [
    { metric: 'AI Platforms', typical: '1 model', onmcp: '7+ platforms', highlight: true },
    { metric: 'Multi-AI Debate', typical: 'None', onmcp: '0nPlex — 5 models debate + synthesize' },
    { metric: 'Voice Adaptation', typical: 'None', onmcp: '0nCore brand voice generation' },
    { metric: 'Config Generation', typical: 'Manual', onmcp: 'Auto for Claude, Gemini, Grok, Cursor...' },
    { metric: 'Local AI', typical: 'None', onmcp: 'Ollama + Groq fallback (free)' },
  ],
}

const TRENDING = [
  '0nMCP v2.9 published on npm — 1,183 tools across 99 services',
  'Cisco calls OpenClaw a "security nightmare" — 0nMCP is the alternative',
  'New: Multi-AI Council (0nPlex) — 5 models debate for best answers',
  'May 1st public launch — pre-register for 30 days free',
]

export default function SxoHomepage() {
  const [mutationNotice, setMutationNotice] = useState('')
  const [bluf, setBluf] = useState(
    '0nMCP is the most comprehensive open-source MCP Server: <strong>1,183 tools</strong>, <strong>99 services</strong>, <strong>22 categories</strong>, zero configuration. Powered by 4 patented technologies (Seal of Truth, 0nVault, 0nPlex, 0nCore). Automate MCP server integration and build powerful agentic workflows — launching May 1, 2026.'
  )
  const [tableCategory, setTableCategory] = useState('overview')
  const [trendingIdx, setTrendingIdx] = useState(0)
  const dateRef = useRef<HTMLTimeElement>(null)

  useEffect(() => {
    if (dateRef.current) {
      const now = new Date()
      dateRef.current.innerText = `Last Updated: ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
      dateRef.current.setAttribute('datetime', now.toISOString())
    }
  }, [])

  // Mutation engine
  useEffect(() => {
    async function check() {
      try {
        const res = await fetch('/api/sxo-mutation-stream')
        if (!res.ok) return
        const patch = await res.json()
        if (patch.requiresUpdate) {
          if (patch.newBluf) setBluf(patch.newBluf)
          if (patch.changeLog) setMutationNotice(patch.changeLog)
          if (dateRef.current) {
            const now = new Date()
            dateRef.current.innerText = `Last Updated: ${now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
            dateRef.current.setAttribute('datetime', now.toISOString())
          }
        }
      } catch {}
    }
    check()
    const i = setInterval(check, 60000)
    return () => clearInterval(i)
  }, [])

  // Trending ticker
  useEffect(() => {
    const i = setInterval(() => setTrendingIdx(p => (p + 1) % TRENDING.length), 5000)
    return () => clearInterval(i)
  }, [])

  const rows = TABLE_DATA[tableCategory] || TABLE_DATA.overview

  return (
    <>
      {/* ── LATEST NEWS BAR ── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', borderRadius: 50, overflow: 'hidden',
          background: 'var(--bg-card)', height: 46,
        }}>
          {/* Left pill — white bg */}
          <div style={{
            padding: '0 20px', height: '100%',
            background: 'var(--bg-card)', borderRadius: 50,
            display: 'flex', alignItems: 'center', gap: 8,
            border: '2px solid #1a1a1a', marginRight: -2,
            zIndex: 1,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>Latest News</span>
          </div>

          {/* Right — black bg with text + arrows */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 8px 0 20px', minWidth: 0 }}>
            <div style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', fontWeight: 500 }}>
              {TRENDING[trendingIdx]}
            </div>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 12 }}>
              <button onClick={() => setTrendingIdx(p => (p - 1 + TRENDING.length) % TRENDING.length)} style={{
                width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border-hover)',
                background: 'transparent', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', transition: 'background 0.15s',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button onClick={() => setTrendingIdx(p => (p + 1) % TRENDING.length)} style={{
                width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border-hover)',
                background: 'var(--border)', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', transition: 'background 0.15s',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── BLUF ── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          <time ref={dateRef} dateTime="">Last Updated: March 30, 2026</time>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--bg-card)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Living DOM Active
          </span>
        </div>
        {mutationNotice && (
          <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16, background: 'var(--bg-secondary)', borderLeft: '4px solid #16a34a', fontSize: 13, color: '#15803d', fontWeight: 500 }}>
            {mutationNotice}
          </div>
        )}
        <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 12 }}>Executive Summary</h2>
        <p style={{ fontSize: 17, color: 'var(--text-secondary, #9ca3af)', lineHeight: 1.8, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: bluf }} />
      </section>

      {/* ── ORCHESTRATOR FORGE ── */}
      <OrchestratorForge />

      {/* ── BLOG SLIDER — Featured Articles ── */}
      <BlogSlider />

      {/* ── BEAUTIFUL TABLE with Category Switcher ── */}
      <section id="mcp-servers" style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
          0nMCP vs Every Other MCP Server
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Switch categories to see the full picture.</p>

        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {TABLE_CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => setTableCategory(cat.key)} style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: tableCategory === cat.key ? '#1a1a1a' : '#fff',
              color: tableCategory === cat.key ? '#fff' : '#555',
              border: `1px solid ${tableCategory === cat.key ? '#1a1a1a' : '#ddd'}`,
              cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={{
          borderRadius: 16, overflow: 'hidden',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}>
          {rows.map((row, i) => (
            <div key={row.metric} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              background: 'var(--bg-card)',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-tertiary)'}
            >
              <div style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                {row.metric}
              </div>
              <div style={{ padding: '14px 20px', fontSize: 14, color: 'var(--text-muted)' }}>
                {row.typical}
              </div>
              <div style={{
                padding: '14px 20px', fontSize: 14, fontWeight: 700,
                color: row.highlight ? '#16a34a' : '#1a1a1a',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                {row.highlight && (
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#6EE05A',
                    flexShrink: 0,
                  }} />
                )}
                {row.onmcp}
              </div>
            </div>
          ))}
        </div>

        {/* Table footer labels */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          padding: '8px 20px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          <span>Metric</span>
          <span>Typical MCP Server</span>
          <span style={{ color: '#6EE05A' }}>0nMCP</span>
        </div>
      </section>

      {/* ── WORKFLOW MODELS ── */}
      <section id="automate" style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>
          Three Execution Models
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { name: 'Pipeline', desc: 'Sequential — A → B → C. Data transforms, approval chains, ETL.', icon: '→', color: '#6EE05A' },
            { name: 'Assembly Line', desc: 'Parallel with deps — independent steps run simultaneously.', icon: '⇉', color: '#00b4ff' },
            { name: 'Radial Burst', desc: 'Fan-out — one trigger spawns N parallel operations.', icon: '✦', color: '#a78bfa' },
          ].map(m => (
            <div key={m.name} style={{
              padding: 24, borderRadius: 16, background: 'var(--bg-card)', border: '1px solid var(--border)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.25s, transform 0.25s',
              borderTop: `3px solid ${m.color}`,
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: 32, marginBottom: 8, color: m.color }}>{m.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>{m.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PATENT TECH ── */}
      <section id="patents" style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>4 Patented Technologies</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { name: 'Seal of Truth', desc: 'SHA3-256 integrity verification', patent: '#63/968,814', color: '#6EE05A' },
            { name: '0nVault', desc: 'AES-256-GCM + hardware fingerprint', patent: '#63/990,046', color: '#00b4ff' },
            { name: '0nPlex', desc: '5-model AI debate council', patent: 'Pending', color: '#a78bfa' },
            { name: '0nCore', desc: 'Voice-adaptive generation', patent: 'Pending', color: '#fbbf24' },
          ].map(p => (
            <div key={p.name} style={{
              padding: 20, borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.25s, transform 0.25s',
              borderLeft: `4px solid ${p.color}`,
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: p.color, fontWeight: 700, marginBottom: 6 }}>US Provisional {p.patent}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── .0n MARKETPLACE + UCP — NEW — Tailwind only, no inline styles ── */}
      <section id="marketplace" className="mx-auto max-w-[900px] px-6 pb-12">
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
          <div className="text-xs font-bold uppercase tracking-widest text-primary">New — May 1, 2026</div>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            The <span className="text-primary">.0n Marketplace</span> — buy ready-made AI apps. Or ship yours and take 70%.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Built on the <strong className="text-foreground">Universal Commerce Protocol (UCP)</strong> — an open standard so any AI agent can discover, buy, and run AI software without prior integration. Works for buyers (find apps you need). Works for builders (sell apps you've built without a landing page, payment system, or onboarding flow).
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {/* Buyer column */}
            <div className="rounded-xl border border-border bg-background/50 p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-primary">For buyers</div>
              <h3 className="mt-2 text-lg font-bold text-foreground">Pay for outcomes, not subscriptions</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2"><span className="text-primary">→</span><span>HIPAA Compliance Scan — $147 (15-min report, 63 checks)</span></li>
                <li className="flex gap-2"><span className="text-primary">→</span><span>CRO9 SEO Audit — $297 (full SXO audit)</span></li>
                <li className="flex gap-2"><span className="text-primary">→</span><span>AI Blog Post — $97 (1,500+ words, SEO-optimized)</span></li>
                <li className="flex gap-2"><span className="text-primary">→</span><span>CRM Account Setup — $497 (pipelines, fields, automations)</span></li>
                <li className="flex gap-2"><span className="text-primary">→</span><span>WordPress AI Management — $297/mo (recurring)</span></li>
                <li className="flex gap-2"><span className="text-primary">→</span><span>Custom AI Automation — from $997 (describe it, we build)</span></li>
              </ul>
              <a href="https://0ncore.com/dashboard/marketplace" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
                Browse marketplace <span aria-hidden>→</span>
              </a>
            </div>

            {/* Vendor column */}
            <div className="rounded-xl border border-primary/40 bg-primary/[0.03] p-6">
              <div className="text-xs font-bold uppercase tracking-widest text-primary">For builders</div>
              <h3 className="mt-2 text-lg font-bold text-foreground">Stop marketing. Start shipping.</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Build once. Export as a <code className="rounded bg-foreground/[0.06] px-1 py-0.5 text-xs text-primary">.0n</code> file. Upload. Customers install. Stripe handles payment. Vendor takes <strong className="text-foreground">70% revenue share</strong>. Payouts via Stripe Connect.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-background/60 px-3 py-2 text-muted-foreground">No landing page</div>
                <div className="rounded-lg bg-background/60 px-3 py-2 text-muted-foreground">No checkout integration</div>
                <div className="rounded-lg bg-background/60 px-3 py-2 text-muted-foreground">No onboarding to build</div>
                <div className="rounded-lg bg-background/60 px-3 py-2 text-muted-foreground">No support tickets</div>
              </div>
              <a href="https://0ncore.com/dashboard/marketplace/publish" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
                Become a vendor <span aria-hidden>→</span>
              </a>
            </div>
          </div>

          {/* UCP technical credibility band */}
          <div className="mt-6 rounded-xl border border-border bg-background/40 p-5">
            <div className="flex flex-wrap items-start gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">UCP — Universal Commerce Protocol</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Open standard for AI agent commerce. Discovery endpoint at <code className="rounded bg-foreground/[0.06] px-1 py-0.5 text-xs text-primary">/.well-known/ucp</code> returns merchant metadata, capabilities, and payment handlers. Any AI agent can find, buy, and run products without prior integration.
                </p>
              </div>
              <a href="/blog/introducing-ucp-universal-commerce-protocol-for-ai-agents" className="rounded-md border border-border bg-background/80 px-3 py-2 text-xs font-bold text-foreground hover:border-primary/40">
                Read the spec
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL GRID + CHAT PREVIEW (side by side) ── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
          {/* Social Grid */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>Follow Us</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { name: 'GitHub', icon: 'GH', bg: '#1a1a1a', href: 'https://github.com/0nork/0nMCP' },
                { name: 'Discord', icon: 'DC', bg: '#5865f2', href: 'https://discord.gg/0nork' },
                { name: 'LinkedIn', icon: 'LI', bg: '#555', href: 'https://linkedin.com/company/0nork' },
                { name: 'npm', icon: 'npm', bg: '#333', href: 'https://npmjs.com/package/0nmcp' },
              ].map(s => (
                <Link key={s.name} href={s.href} target="_blank" rel="noopener" style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '20px 12px', borderRadius: 12, background: s.bg, color: 'var(--text-primary)',
                  textDecoration: 'none', fontSize: 12, fontWeight: 700, gap: 6,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)' }}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <span style={{ fontSize: 18, fontWeight: 900 }}>{s.icon}</span>
                  {s.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Chat Preview */}
          <div style={{
            background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6EE05A, #00b4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: 'var(--text-primary)' }}>0n</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>0nMCP Assistant</div>
                <div style={{ fontSize: 11, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--bg-card)' }} />
                  Online
                </div>
              </div>
            </div>
            <div style={{ padding: 20 }}>
              {[
                { from: 'user', text: 'Can 0nMCP connect to my CRM?' },
                { from: 'bot', text: '245 CRM tools ready. Contacts, calendars, invoices, pipelines, social — all connected. What would you like to automate?' },
                { from: 'user', text: 'Auto-tag new leads and notify Slack' },
                { from: 'bot', text: 'Done. I created a .0n SWITCH file: crm.contact.created → tag "new-lead" → slack.message.send to #leads. Want me to activate it?' },
              ].map((msg, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 10,
                }}>
                  <div style={{
                    maxWidth: '80%', padding: '10px 14px', borderRadius: 14,
                    background: msg.from === 'user' ? '#1a1a1a' : '#f5f5f7',
                    color: msg.from === 'user' ? '#fff' : '#333',
                    fontSize: 13, lineHeight: 1.5,
                    borderBottomRightRadius: msg.from === 'user' ? 4 : 14,
                    borderBottomLeftRadius: msg.from === 'bot' ? 4 : 14,
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20 }}>Frequently Asked Questions</h2>
        {[
          { q: 'What is 0nMCP?', a: '0nMCP is the Universal AI API Orchestrator — the most comprehensive MCP Server connecting 1,183 tools and 99 services with zero configuration. Open source, MIT licensed, and powered by 4 patented technologies.' },
          { q: 'How do I install 0nMCP?', a: 'Run npx 0nmcp@latest in your terminal. That\'s it. Zero config. Works with npm, pnpm, yarn, and bun.' },
          { q: 'Is 0nMCP free?', a: 'The core server is MIT licensed and free forever. Marketplace executions cost $0.01 each. 0nCore dashboard starts at $80/mo.' },
          { q: 'How is 0nMCP different from Zapier?', a: '0nMCP runs locally with zero cloud dependency. Your AI talks directly to 99 services through natural language — no drag-and-drop, no monthly limits, no vendor lock-in.' },
          { q: 'Is 0nMCP secure?', a: '0nVault uses AES-256-GCM with hardware fingerprint binding. 4 US patents filed. Cisco called the competition a "security nightmare."' },
          { q: 'What is the .0n Marketplace?', a: 'A two-sided marketplace built on UCP. Buyers find ready-made AI workflows (HIPAA scans, SEO audits, AI blog posts, CRM setups, custom automations). Builders ship .0n files and take 70% of every sale. Stripe Connect handles payouts.' },
          { q: 'How do I sell my AI app on the marketplace?', a: 'Build your workflow as a .0n file (JSON describing triggers, steps, AI calls, integrations). Upload through /dashboard/marketplace/publish. Set price + revenue share. Once approved, your app appears in the catalog and any subscriber can install it. You keep 70% of every sale.' },
          { q: 'What is UCP — the Universal Commerce Protocol?', a: 'An open discovery + checkout + fulfillment standard for AI agents. The /.well-known/ucp endpoint returns JSON describing what 0nCore sells, payment handlers, and API capabilities. Any AI agent (ChatGPT, Claude, Perplexity, custom) can find, buy, and run products without prior integration. The spec is open — competitors can adopt it.' },
        ].map(faq => (
          <div key={faq.q} style={{
            padding: 20, borderRadius: 14, marginBottom: 10,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{faq.q}</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
          </div>
        ))}
      </section>

      {/* ── CTAs ── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <div style={{ borderRadius: 16, padding: '3rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg, #16a34a, #1a1a1a)', color: 'var(--text-primary)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Get Your Own MCP Server Living DOM Page for $8</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>Professional SXO-optimized rewrite. Living DOM included.</p>
          <Link href="/get-mcp-rewrite" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 12, background: 'var(--bg-card)', color: '#16a34a', fontWeight: 800, fontSize: 16, textDecoration: 'none' }}>
            Claim My $8 Rewrite
          </Link>
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <div style={{ borderRadius: 16, padding: '3rem 2rem', textAlign: 'center', background: 'var(--bg-card)', color: 'var(--text-primary)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Ready to Try 0nMCP?</h2>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginBottom: 24 }}>1,183 tools. 99 services. One command.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ padding: '12px 28px', borderRadius: 10, background: '#6EE05A', color: 'var(--text-primary)', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Request Access</Link>
            <Link href="https://github.com/0nork/0nMCP" target="_blank" rel="noopener" style={{ padding: '12px 28px', borderRadius: 10, background: 'var(--border)', color: 'var(--text-primary)', fontWeight: 600, fontSize: 14, textDecoration: 'none', border: '1px solid var(--border-hover)' }}>View on GitHub</Link>
          </div>
          <div style={{ marginTop: 16 }}>
            <code style={{ fontSize: 13, color: '#6EE05A', background: 'rgba(110,224,90,0.1)', padding: '6px 14px', borderRadius: 6 }}>npx 0nmcp@latest</code>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </>
  )
}

const navBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 6,
  border: '1px solid #ddd', background: 'var(--bg-card)',
  cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
  color: 'var(--text-muted)', transition: 'all 0.15s',
}
