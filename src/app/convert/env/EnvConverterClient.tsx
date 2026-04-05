'use client'

import { useState } from 'react'
import Link from 'next/link'

interface DetectedVar { key: string; value: string; service: string; masked: string }
interface ServiceGroup { service: string; label: string; color: string; vars: DetectedVar[] }

const SERVICE_PATTERNS: [RegExp, string, string, string][] = [
  [/^STRIPE/i, 'stripe', 'Stripe', '#635bff'],
  [/^OPENAI|^sk-(?!ant)/i, 'openai', 'OpenAI', '#10a37f'],
  [/^ANTHROPIC|^sk-ant/i, 'anthropic', 'Anthropic', '#d4a27f'],
  [/^SUPABASE|^NEXT_PUBLIC_SUPABASE/i, 'supabase', 'Supabase', '#3ecf8e'],
  [/^SLACK/i, 'slack', 'Slack', '#4a154b'],
  [/^GITHUB|^GH_/i, 'github', 'GitHub', '#f0f6fc'],
  [/^SENDGRID/i, 'sendgrid', 'SendGrid', '#1a82e2'],
  [/^TWILIO/i, 'twilio', 'Twilio', '#f22f46'],
  [/^DISCORD/i, 'discord', 'Discord', '#5865f2'],
  [/^MONGO|^DATABASE_URL|^DB_|^POSTGRES/i, 'database', 'Database', '#47a248'],
  [/^REDIS/i, 'redis', 'Redis', '#dc382d'],
  [/^AWS/i, 'aws', 'AWS', '#ff9900'],
  [/^GOOGLE|^GCLOUD|^GCP/i, 'google', 'Google', '#4285f4'],
  [/^VERCEL/i, 'vercel', 'Vercel', '#fff'],
  [/^CLOUDFLARE|^CF_/i, 'cloudflare', 'Cloudflare', '#f38020'],
  [/^RESEND/i, 'resend', 'Resend', '#fff'],
  [/^NOTION/i, 'notion', 'Notion', '#fff'],
  [/^AIRTABLE/i, 'airtable', 'Airtable', '#18bfff'],
  [/^SHOPIFY/i, 'shopify', 'Shopify', '#96bf48'],
  [/^NEXT_PUBLIC_/i, 'public', 'Public Config', '#64748b'],
]

function detectService(key: string): [string, string, string] {
  for (const [pattern, id, label, color] of SERVICE_PATTERNS) {
    if (pattern.test(key)) return [id, label, color]
  }
  return ['custom', 'Custom', '#94a3b8']
}

function maskValue(val: string): string {
  if (val.length <= 8) return '****'
  return val.slice(0, 4) + '****' + val.slice(-4)
}

function parseEnv(text: string): DetectedVar[] {
  return text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#') && l.includes('=')).map(l => {
    const eqIdx = l.indexOf('=')
    const key = l.slice(0, eqIdx).trim()
    let value = l.slice(eqIdx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1)
    const [service] = detectService(key)
    return { key, value, service, masked: maskValue(value) }
  })
}

function groupByService(vars: DetectedVar[]): ServiceGroup[] {
  const map = new Map<string, ServiceGroup>()
  for (const v of vars) {
    const [, label, color] = detectService(v.key)
    if (!map.has(v.service)) map.set(v.service, { service: v.service, label, color, vars: [] })
    map.get(v.service)!.vars.push(v)
  }
  return Array.from(map.values())
}

function genConnection(g: ServiceGroup): string {
  const creds: Record<string, string> = {}
  for (const v of g.vars) creds[v.key] = '{{env.' + v.key + '}}'
  return JSON.stringify({ $0n: { type: 'connection', version: '2.0.0', schema: '0n-connection/v1', name: g.label + ' Connection', created: new Date().toISOString() }, service: g.service, environment: 'production', auth: { type: 'api_key', credentials: creds }, options: { timeout_ms: 30000, retry_count: 3 }, security: { encryption: 'aes-256-gcm', kdf: 'argon2id', hardware_bound: true, seal_of_truth: true } }, null, 2)
}

function genSwitch(groups: ServiceGroup[]): string {
  const c: Record<string, { $ref: string }> = {}
  for (const g of groups) c[g.service] = { $ref: '~/.0n/connections/' + g.service + '.0n' }
  return JSON.stringify({ $0n: { type: 'switch', version: '2.0.0', schema: '0n-switch/v1', name: 'Converted Environment', created: new Date().toISOString() }, connections: c, security: { encryption_enabled: true, algorithm: 'aes-256-gcm', kdf: 'argon2id', hardware_binding: true } }, null, 2)
}

const EXAMPLE = [
  '# Database',
  'DATABASE_URL=postgresql://user:pass@localhost:5432/myapp',
  '',
  '# Stripe',
  'STRIPE_SECRET_KEY=your_stripe_secret_key_here',
  'STRIPE_WEBHOOK_SECRET=your_webhook_secret_here',
  '',
  '# OpenAI',
  'OPENAI_API_KEY=your_openai_api_key_here',
  '',
  '# Supabase',
  'NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co',
  'SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key',
  '',
  '# Slack',
  'SLACK_BOT_TOKEN=your_slack_bot_token_here',
  '',
  '# GitHub',
  'GITHUB_TOKEN=your_github_token_here',
].join('\n')

export default function EnvConverterClient() {
  const [input, setInput] = useState('')
  const [converted, setConverted] = useState(false)
  const [groups, setGroups] = useState<ServiceGroup[]>([])
  const [activeTab, setActiveTab] = useState('switch')
  const [copied, setCopied] = useState(false)
  const [converting, setConverting] = useState(false)

  function handleConvert() {
    if (!input.trim()) return
    setConverting(true)
    setTimeout(() => { const g = groupByService(parseEnv(input)); setGroups(g); setActiveTab('switch'); setConverted(true); setConverting(false) }, 800)
  }

  function handleCopy() {
    const content = activeTab === 'switch' ? genSwitch(groups) : genConnection(groups.find(g => g.service === activeTab)!)
    navigator.clipboard.writeText(content); setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const totalVars = groups.reduce((s, g) => s + g.vars.length, 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <header style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: 'linear-gradient(135deg,#7ed957,#5cb83a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#000' }}>0n</div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>0nMCP</span>
        </Link>
        <Link href="/signup" style={{ padding: '0.5rem 1.25rem', borderRadius: 6, background: '#7ed957', color: '#000', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none' }}>Get Early Access</Link>
      </header>

      <section style={{ textAlign: 'center', padding: '3rem 1rem 2rem', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, background: 'rgba(126,217,87,0.1)', border: '1px solid rgba(126,217,87,0.2)', fontSize: '0.75rem', fontWeight: 600, color: '#7ed957', marginBottom: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Free Tool</div>
        <h1 style={{ fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, margin: '0 0 1rem' }}>Convert <span style={{ color: '#ef4444' }}>.env</span> to <span style={{ color: '#7ed957' }}>.0n</span></h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>Your API keys are sitting in plain text. Paste your .env below and get encrypted .0n files with 7-layer security. <strong style={{ color: 'var(--text-secondary)' }}>Your keys never leave your browser.</strong></p>
      </section>

      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1rem 3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: converted ? '1fr 1fr' : '1fr', gap: '1.5rem', transition: 'all 0.3s ease' }}>
          <div>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} /><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} /><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} /></div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8 }}>.env</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => { setInput(EXAMPLE.replace(/\\n/g, '\n')); setConverted(false) }} style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.7rem', cursor: 'pointer' }}>Load Example</button>
                  <button onClick={() => { setInput(''); setConverted(false); setGroups([]) }} style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.7rem', cursor: 'pointer' }}>Clear</button>
                </div>
              </div>
              <textarea value={input} onChange={e => { setInput(e.target.value); setConverted(false) }} placeholder={'# Paste your .env file here\nSTRIPE_SECRET_KEY=sk_live_...\nOPENAI_API_KEY=sk-proj-...\nDATABASE_URL=postgresql://...'} spellCheck={false} style={{ width: '100%', minHeight: 360, padding: '1rem', background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontFamily: "'JetBrains Mono',monospace", fontSize: '0.8rem', lineHeight: 1.7, resize: 'vertical' }} />
            </div>
            <button onClick={handleConvert} disabled={!input.trim() || converting} style={{ width: '100%', marginTop: '1rem', height: 48, borderRadius: 8, background: !input.trim() ? '#1e293b' : converting ? '#4a8a2e' : '#7ed957', color: !input.trim() ? '#475569' : '#000', border: 'none', fontSize: '0.95rem', fontWeight: 700, cursor: !input.trim() ? 'not-allowed' : 'pointer' }}>{converting ? 'Detecting services...' : 'Convert to .0n'}</button>
          </div>

          {converted && (
            <div>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(126,217,87,0.1)', border: '1px solid rgba(126,217,87,0.2)', fontSize: '0.75rem', fontWeight: 600, color: '#7ed957' }}>{groups.length} services detected</div>
                <div style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', fontSize: '0.75rem', fontWeight: 600, color: '#00d4ff' }}>{totalVars} credentials secured</div>
                <div style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', fontSize: '0.75rem', fontWeight: 600, color: '#a78bfa' }}>{groups.length + 1} files generated</div>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => setActiveTab('switch')} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: activeTab === 'switch' ? 'rgba(126,217,87,0.2)' : 'var(--bg-card)', color: activeTab === 'switch' ? '#7ed957' : '#64748b', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>master.0n</button>
                {groups.map(g => (<button key={g.service} onClick={() => setActiveTab(g.service)} style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: activeTab === g.service ? g.color + '22' : 'var(--bg-card)', color: activeTab === g.service ? g.color : '#64748b', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>{g.service}.0n</button>))}
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} /><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} /><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} /></div>
                    <span style={{ fontSize: '0.75rem', color: '#7ed957', marginLeft: 8 }}>{activeTab === 'switch' ? 'master.0n' : activeTab + '.0n'}</span>
                  </div>
                  <button onClick={handleCopy} style={{ padding: '4px 12px', borderRadius: 4, background: copied ? 'rgba(126,217,87,0.2)' : 'var(--bg-card)', border: '1px solid var(--border)', color: copied ? '#7ed957' : '#94a3b8', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}>{copied ? 'Copied' : 'Copy'}</button>
                </div>
                <pre style={{ padding: '1rem', margin: 0, overflow: 'auto', maxHeight: 340, fontFamily: "'JetBrains Mono',monospace", fontSize: '0.75rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>{activeTab === 'switch' ? genSwitch(groups) : genConnection(groups.find(g => g.service === activeTab)!)}</pre>
              </div>
              <div style={{ marginTop: '1.25rem', padding: '1.25rem', borderRadius: 12, background: 'rgba(126,217,87,0.06)', border: '1px solid rgba(126,217,87,0.15)', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 0.75rem', fontWeight: 600 }}>Save to your encrypted vault</p>
                <Link href="/signup" style={{ display: 'inline-block', padding: '0.625rem 2rem', borderRadius: 8, background: '#7ed957', color: '#000', textDecoration: 'none', fontWeight: 700, fontSize: '0.875rem' }}>Create Free Account</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem 4rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', textAlign: 'center', marginBottom: '2rem' }}><span style={{ color: '#ef4444' }}>.env</span> vs <span style={{ color: '#7ed957' }}>.0n</span></h2>
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--border)' }}><th style={{ padding: '0.875rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>Feature</th><th style={{ padding: '0.875rem 1rem', textAlign: 'center', color: '#ef4444', fontWeight: 600 }}>.env</th><th style={{ padding: '0.875rem 1rem', textAlign: 'center', color: '#7ed957', fontWeight: 600 }}>.0n</th></tr></thead>
            <tbody>
              {[['Encryption','None','AES-256-GCM'],['Key derivation','None','Argon2id'],['Service detection','No','20+ services'],['Cross-platform','No','7 AI platforms'],['Access control','No','Per-layer'],['Tamper detection','No','Seal of Truth'],['Version control safe','No','Yes'],['Digital signatures','No','Ed25519'],['Multi-party sharing','No','X25519 escrow'],['Patent protection','No','5 patents pending']].map(([f,e,o],i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--bg-card)' }}><td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{f}</td><td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>{e}</td><td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#7ed957', fontWeight: 600 }}>{o}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1L2 4v4c0 3.5 2.5 6.4 6 7 3.5-.6 6-3.5 6-7V4L8 1z" fill="rgba(126,217,87,0.2)" stroke="#7ed957" strokeWidth="1" /><path d="M5.5 8l2 2 3.5-3.5" stroke="#7ed957" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Your keys never leave your browser. All conversion happens client-side.
        </div>
      </section>
    </div>
  )
}
