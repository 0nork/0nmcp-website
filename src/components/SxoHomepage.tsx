'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import OrchestratorForge from '@/components/OrchestratorForge'

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
    { metric: 'Total Tools', typical: '10-50', onmcp: '945+', highlight: true },
    { metric: 'Connected Services', typical: '1-5', onmcp: '54 services' },
    { metric: 'Configuration', typical: 'Manual YAML/JSON', onmcp: 'Zero config' },
    { metric: 'License', typical: 'Varies', onmcp: 'MIT — free forever' },
    { metric: 'Patents Filed', typical: 'None', onmcp: '4 US provisionals', highlight: true },
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
  '0nMCP v2.9 published on npm — 945 tools across 54 services',
  'Cisco calls OpenClaw a "security nightmare" — 0nMCP is the alternative',
  'New: Multi-AI Council (0nPlex) — 5 models debate for best answers',
  'May 1st public launch — pre-register for 30 days free',
]

export default function SxoHomepage() {
  const [mutationNotice, setMutationNotice] = useState('')
  const [bluf, setBluf] = useState(
    '0nMCP is the most comprehensive open-source MCP Server: <strong>945 tools</strong>, <strong>54 services</strong>, <strong>13 categories</strong>, zero configuration. Powered by 4 patented technologies (Seal of Truth, 0nVault, 0nPlex, 0nCore). Automate MCP server integration and build powerful agentic workflows — launching May 1, 2026.'
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
      {/* ── TRENDING BAR ── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', borderRadius: 10, overflow: 'hidden',
          border: '1px solid #e5e7eb', background: '#fff',
        }}>
          <div style={{
            padding: '10px 16px', background: '#1a1a1a', color: '#fff',
            fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: 6,
            letterSpacing: '0.02em',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
            Trending
          </div>
          <div style={{ flex: 1, padding: '10px 16px', fontSize: 13, color: '#555', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            {TRENDING[trendingIdx]}
          </div>
          <div style={{ display: 'flex', gap: 2, padding: '0 8px' }}>
            <button onClick={() => setTrendingIdx(p => (p - 1 + TRENDING.length) % TRENDING.length)} style={{ ...navBtn }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button onClick={() => setTrendingIdx(p => (p + 1) % TRENDING.length)} style={{ ...navBtn, background: '#1a1a1a', color: '#fff', borderColor: '#1a1a1a' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
      </section>

      {/* ── BLUF ── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, fontSize: 13, color: '#888' }}>
          <time ref={dateRef} dateTime="">Last Updated: March 30, 2026</time>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Living DOM Active
          </span>
        </div>
        {mutationNotice && (
          <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16, background: '#f0fdf4', borderLeft: '4px solid #16a34a', fontSize: 13, color: '#15803d', fontWeight: 500 }}>
            {mutationNotice}
          </div>
        )}
        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: 12 }}>Executive Summary</h2>
        <p style={{ fontSize: 17, color: '#444', lineHeight: 1.8, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: bluf }} />
      </section>

      {/* ── ORCHESTRATOR FORGE ── */}
      <OrchestratorForge />

      {/* ── BEAUTIFUL TABLE with Category Switcher ── */}
      <section id="mcp-servers" style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 }}>
          0nMCP vs Every Other MCP Server
        </h2>
        <p style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>Switch categories to see the full picture.</p>

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
          background: '#fff', border: '1px solid #e5e7eb',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        }}>
          {rows.map((row, i) => (
            <div key={row.metric} style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              borderBottom: i < rows.length - 1 ? '1px solid #f0f0f0' : 'none',
              background: i === 0 ? '#fafafa' : '#fff',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = i === 0 ? '#fafafa' : '#fff'}
            >
              <div style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#1a1a1a' }}>
                {row.metric}
              </div>
              <div style={{ padding: '14px 20px', fontSize: 14, color: '#999' }}>
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
          padding: '8px 20px', fontSize: 11, color: '#aaa', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          <span>Metric</span>
          <span>Typical MCP Server</span>
          <span style={{ color: '#6EE05A' }}>0nMCP</span>
        </div>
      </section>

      {/* ── WORKFLOW MODELS ── */}
      <section id="automate" style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', marginBottom: 20 }}>
          Three Execution Models
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { name: 'Pipeline', desc: 'Sequential — A → B → C. Data transforms, approval chains, ETL.', icon: '→', color: '#6EE05A' },
            { name: 'Assembly Line', desc: 'Parallel with deps — independent steps run simultaneously.', icon: '⇉', color: '#00b4ff' },
            { name: 'Radial Burst', desc: 'Fan-out — one trigger spawns N parallel operations.', icon: '✦', color: '#a78bfa' },
          ].map(m => (
            <div key={m.name} style={{
              padding: 24, borderRadius: 16, background: '#fff', border: '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.25s, transform 0.25s',
              borderTop: `3px solid ${m.color}`,
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: 32, marginBottom: 8, color: m.color }}>{m.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 }}>{m.name}</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PATENT TECH ── */}
      <section id="patents" style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', marginBottom: 20 }}>4 Patented Technologies</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { name: 'Seal of Truth', desc: 'SHA3-256 integrity verification', patent: '#63/968,814', color: '#6EE05A' },
            { name: '0nVault', desc: 'AES-256-GCM + hardware fingerprint', patent: '#63/990,046', color: '#00b4ff' },
            { name: '0nPlex', desc: '5-model AI debate council', patent: 'Pending', color: '#a78bfa' },
            { name: '0nCore', desc: 'Voice-adaptive generation', patent: 'Pending', color: '#fbbf24' },
          ].map(p => (
            <div key={p.name} style={{
              padding: 20, borderRadius: 14, background: '#fff', border: '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.25s, transform 0.25s',
              borderLeft: `4px solid ${p.color}`,
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: p.color, fontWeight: 700, marginBottom: 6 }}>US Provisional {p.patent}</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.5 }}>{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOCIAL GRID + CHAT PREVIEW (side by side) ── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
          {/* Social Grid */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>Follow Us</span>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
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
                  padding: '20px 12px', borderRadius: 12, background: s.bg, color: '#fff',
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
            background: '#fff', borderRadius: 16, border: '1px solid #e5e7eb',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden',
          }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6EE05A, #00b4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff' }}>0n</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>0nMCP Assistant</div>
                <div style={{ fontSize: 11, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
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
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', marginBottom: 20 }}>Frequently Asked Questions</h2>
        {[
          { q: 'What is 0nMCP?', a: '0nMCP is the Universal AI API Orchestrator — the most comprehensive MCP Server connecting 945 tools and 54 services with zero configuration. Open source, MIT licensed, and powered by 4 patented technologies.' },
          { q: 'How do I install 0nMCP?', a: 'Run npx 0nmcp@latest in your terminal. That\'s it. Zero config. Works with npm, pnpm, yarn, and bun.' },
          { q: 'Is 0nMCP free?', a: 'The core server is MIT licensed and free forever. Marketplace executions cost $0.01 each. 0nCore dashboard starts at $80/mo.' },
          { q: 'How is 0nMCP different from Zapier?', a: '0nMCP runs locally with zero cloud dependency. Your AI talks directly to 54 services through natural language — no drag-and-drop, no monthly limits, no vendor lock-in.' },
          { q: 'Is 0nMCP secure?', a: '0nVault uses AES-256-GCM with hardware fingerprint binding. 4 US patents filed. Cisco called the competition a "security nightmare."' },
        ].map(faq => (
          <div key={faq.q} style={{
            padding: 20, borderRadius: 14, marginBottom: 10,
            background: '#fff', border: '1px solid #e5e7eb',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>{faq.q}</h3>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, margin: 0 }}>{faq.a}</p>
          </div>
        ))}
      </section>

      {/* ── CTAs ── */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 3rem' }}>
        <div style={{ borderRadius: 16, padding: '3rem 2rem', textAlign: 'center', background: 'linear-gradient(135deg, #16a34a, #1a1a1a)', color: '#fff', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Get Your Own MCP Server Living DOM Page for $8</h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>Professional SXO-optimized rewrite. Living DOM included.</p>
          <Link href="/get-mcp-rewrite" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 12, background: '#fff', color: '#16a34a', fontWeight: 800, fontSize: 16, textDecoration: 'none' }}>
            Claim My $8 Rewrite
          </Link>
        </div>
      </section>

      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <div style={{ borderRadius: 16, padding: '3rem 2rem', textAlign: 'center', background: '#1a1a1a', color: '#fff', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Ready to Try 0nMCP?</h2>
          <p style={{ fontSize: 15, color: '#aaa', marginBottom: 24 }}>945 tools. 54 services. One command.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ padding: '12px 28px', borderRadius: 10, background: '#6EE05A', color: '#1a1a1a', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Request Access</Link>
            <Link href="https://github.com/0nork/0nMCP" target="_blank" rel="noopener" style={{ padding: '12px 28px', borderRadius: 10, background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)' }}>View on GitHub</Link>
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
  border: '1px solid #ddd', background: '#fff',
  cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
  color: '#999', transition: 'all 0.15s',
}
