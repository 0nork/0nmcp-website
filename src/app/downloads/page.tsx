import type { Metadata } from 'next'
import Link from 'next/link'
import { STATS_DISPLAY } from '@/data/stats'

export const metadata: Metadata = {
  title: 'Downloads & Installs — Get 0nMCP Everywhere',
  description: `Install 0nMCP anywhere. ${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services. CLI, Claude Desktop, ChatGPT, Cursor, VS Code, and more.`,
  openGraph: {
    title: 'Downloads & Installs — 0nMCP',
    description: `${STATS_DISPLAY.tools} tools. ${STATS_DISPLAY.services} services. Install anywhere.`,
    url: 'https://www.0nmcp.com/downloads',
  },
  alternates: { canonical: 'https://www.0nmcp.com/downloads' },
}

const INSTALL_METHODS = [
  { id: 'npm', name: 'npm (Global)', desc: 'Install globally. Run from anywhere.', command: 'npm install -g 0nmcp', color: '#cb3837' },
  { id: 'npx', name: 'npx (Zero Install)', desc: 'Run without installing. Always latest.', command: 'npx 0nmcp@latest', color: '#333' },
  { id: 'pnpm', name: 'pnpm', desc: 'Fast, disk-efficient.', command: 'pnpm add -g 0nmcp', color: '#f69220' },
  { id: 'yarn', name: 'yarn', desc: 'Classic package manager.', command: 'yarn global add 0nmcp', color: '#2c8ebb' },
]

const AI_PLATFORMS = [
  {
    id: 'claude-desktop', name: 'Claude Desktop', desc: 'Full tool access in every Claude conversation',
    config: `{\n  "mcpServers": {\n    "0nMCP": {\n      "command": "npx",\n      "args": ["-y", "0nmcp"]\n    }\n  }\n}`,
    path: '~/Library/Application Support/Claude/claude_desktop_config.json',
    icon: 'C', color: '#d4a574',
  },
  {
    id: 'claude-code', name: 'Claude Code', desc: 'One command — instant MCP tools',
    config: 'claude mcp add 0nMCP -- npx -y 0nmcp',
    path: 'Terminal', icon: 'CC', color: '#d4a574',
  },
  {
    id: 'cursor', name: 'Cursor', desc: 'AI editor with business tools',
    config: `{\n  "mcpServers": {\n    "0nMCP": {\n      "command": "npx",\n      "args": ["-y", "0nmcp"]\n    }\n  }\n}`,
    path: '.cursor/mcp.json', icon: 'Cu', color: '#000',
  },
  {
    id: 'windsurf', name: 'Windsurf', desc: 'AI dev environment + orchestration',
    config: `{\n  "mcpServers": {\n    "0nMCP": {\n      "command": "npx",\n      "args": ["-y", "0nmcp"]\n    }\n  }\n}`,
    path: '~/.windsurf/mcp.json', icon: 'W', color: '#06b6d4',
  },
  {
    id: 'vscode', name: 'VS Code', desc: 'MCP tools in your editor',
    config: `{\n  "mcpServers": {\n    "0nMCP": {\n      "command": "npx",\n      "args": ["-y", "0nmcp"]\n    }\n  }\n}`,
    path: '.vscode/mcp.json', icon: 'VS', color: '#007acc',
  },
]

const APPS = [
  { id: 'ongpt', name: '0nGPT', desc: 'Use 0nMCP tools inside ChatGPT. OAuth 2.1, PKCE, branded widget. The first 0nMCP app integration.', icon: 'GPT', color: '#10a37f', badge: 'FEATURED', href: '/downloads/ongpt' },
  { id: 'oncore', name: '0nCore Dashboard', desc: 'Full CRM dashboard — AI automation, voice AI, courses, domains, pipeline. The business OS.', icon: '0C', color: '#6EE05A', badge: 'PRE-ORDER', href: '/signup' },
  { id: 'defender', name: '0nDefender', desc: 'Patent intelligence & competitive monitoring. Daily scans. 4 threat vectors.', icon: '0D', color: '#ef4444', badge: 'ADMIN', href: '/admin/patent-intel' },
  { id: 'cloudconvert', name: 'CloudConvert', desc: '200+ format file conversion via natural language. PDF, DOCX, MP4, PNG.', icon: 'CC', color: '#e74430', href: '/integrations' },
  { id: 'linkedin', name: 'LinkedIn Suite', desc: '50 endpoints — ads, org pages, social posting, analytics, certifications.', icon: 'LI', color: '#0A66C2', href: '/console/linkedin' },
  { id: 'chrome', name: 'LinkedIn Reply Extension', desc: 'Chrome extension for AI-powered LinkedIn replies. 5 tones, Groq-powered, free.', icon: 'CR', color: '#333', href: 'https://github.com/0nork/0nMCP/tree/main/extensions/linkedin-reply' },
  { id: 'openclaw', name: 'OpenClaw', desc: 'Personal AI assistant for file management and smart home. Note: Cisco flagged critical security vulnerabilities.', icon: 'OC', color: '#888', badge: 'WARNING', href: '/compare/0nmcp-vs-openclaw', disabled: true },
]

const COMING = [
  { name: 'Gemini', color: '#4285f4' },
  { name: 'Grok', color: '#000' },
  { name: 'Slack Bot', color: '#4a154b' },
  { name: 'Discord Bot', color: '#5865f2' },
  { name: 'CRM App', color: '#ff6b35' },
  { name: 'Zapier', color: '#ff4a00' },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 16 }}>{title}</h2>
      {children}
    </section>
  )
}

function Card({ children, hover = true, ...props }: { children: React.ReactNode; hover?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div style={{
      background: '#fff', borderRadius: 14, padding: 24,
      border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      transition: hover ? 'box-shadow 0.25s, transform 0.25s' : undefined,
    }} {...props}>
      {children}
    </div>
  )
}

export default function DownloadsPage() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '5rem' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem 4rem' }}>

        {/* ── Hero ── */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: '#6EE05A', color: '#0f172a', fontSize: 11, fontWeight: 900, letterSpacing: '0.06em', marginBottom: 16 }}>
            DOWNLOADS & INSTALLS
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.03em', marginBottom: 8 }}>
            Install 0nMCP Anywhere
          </h1>
          <p style={{ fontSize: 16, color: '#555', maxWidth: 560, margin: '0 auto' }}>
            {STATS_DISPLAY.tools} tools across {STATS_DISPLAY.services} services. CLI, AI editors, ChatGPT, and custom apps.
          </p>
        </div>

        {/* ── Featured: 0nGPT ── */}
        <section style={{ marginBottom: 48 }}>
          <div style={{
            borderRadius: 20, padding: '2.5rem', overflow: 'hidden',
            background: 'linear-gradient(135deg, #0f172a, #064e3b)',
            color: '#fff', border: '2px solid #6EE05A',
            boxShadow: '0 16px 50px rgba(0,0,0,0.15), 0 0 30px rgba(110,224,90,0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 6, background: '#6EE05A', color: '#0f172a', fontSize: 10, fontWeight: 900 }}>FEATURED INTEGRATION</span>
              <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 6, background: 'rgba(16,163,127,0.2)', color: '#10a37f', fontSize: 10, fontWeight: 900 }}>ChatGPT</span>
            </div>
            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{
                width: 72, height: 72, borderRadius: 18, background: '#10a37f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, fontWeight: 900, flexShrink: 0,
                boxShadow: '0 8px 24px rgba(16,163,127,0.3)',
              }}>GPT</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>0nGPT</h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 16 }}>
                  Use {STATS_DISPLAY.tools} 0nMCP tools directly inside ChatGPT. OAuth 2.1 with PKCE, branded widget, full MCP tool execution. The first 0nMCP app integration.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Link href="/downloads/ongpt" style={{
                    padding: '10px 24px', borderRadius: 10, background: '#6EE05A', color: '#0f172a',
                    fontWeight: 800, fontSize: 14, textDecoration: 'none',
                  }}>Get 0nGPT →</Link>
                  <Link href="https://github.com/0nork/0nMCP" target="_blank" rel="noopener" style={{
                    padding: '10px 24px', borderRadius: 10, background: 'rgba(255,255,255,0.1)',
                    color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}>View Source</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Quick Install ── */}
        <Section title="Quick Install">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {INSTALL_METHODS.map(m => (
              <Card key={m.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9, fontWeight: 900 }}>{m.id}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: '#999' }}>{m.desc}</div>
                  </div>
                </div>
                <code style={{ display: 'block', padding: '10px 12px', borderRadius: 8, background: '#1a1a1a', color: '#6EE05A', fontSize: 12, fontFamily: 'monospace' }}>{m.command}</code>
              </Card>
            ))}
          </div>
        </Section>

        {/* ── AI Platforms ── */}
        <Section title="AI Platform Configs">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {AI_PLATFORMS.map(p => (
              <details key={p.id} style={{
                background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden',
              }}>
                <summary style={{ padding: '14px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, listStyle: 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 900, flexShrink: 0 }}>{p.icon}</div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', flex: 1 }}>{p.name}</span>
                  <span style={{ fontSize: 12, color: '#888' }}>{p.desc}</span>
                </summary>
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f0f0f0' }}>
                  <p style={{ fontSize: 12, color: '#888', margin: '12px 0 8px' }}>
                    Add to <code style={{ background: '#f5f5f7', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>{p.path}</code>:
                  </p>
                  <pre style={{ padding: 16, borderRadius: 10, background: '#1a1a1a', color: '#e0e0e0', fontSize: 12, fontFamily: 'monospace', lineHeight: 1.6, overflow: 'auto', margin: 0 }}>{p.config}</pre>
                </div>
              </details>
            ))}
          </div>
        </Section>

        {/* ── Apps & Integrations ── */}
        <Section title="Apps & Integrations">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {APPS.map(app => {
              const isDisabled = 'disabled' in app && app.disabled
              const isWarning = app.badge === 'WARNING'
              const inner = (
                  <Card>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: app.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 900 }}>{app.icon}</div>
                      <span style={{ fontSize: 15, fontWeight: 700, color: isDisabled ? '#999' : '#1a1a1a', flex: 1 }}>{app.name}</span>
                      {app.badge && (
                        <span style={{
                          padding: '3px 8px', borderRadius: 5, fontSize: 10, fontWeight: 800,
                          background: isWarning ? 'rgba(239,68,68,0.1)' : app.badge === 'FEATURED' ? 'rgba(110,224,90,0.1)' : app.badge === 'PRE-ORDER' ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
                          color: isWarning ? '#ef4444' : app.badge === 'FEATURED' ? '#6EE05A' : app.badge === 'PRE-ORDER' ? '#f59e0b' : '#3b82f6',
                        }}>{app.badge}</span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, margin: 0 }}>{app.desc}</p>
                    {isDisabled && (
                      <div style={{
                        marginTop: 12, padding: '10px 12px', borderRadius: 8,
                        background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)',
                        fontSize: 11, color: '#ef4444', lineHeight: 1.5,
                        display: 'flex', alignItems: 'flex-start', gap: 6,
                      }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                        <span>Download unavailable — we&apos;ll update this link once the code is verified safe for our users. In the meantime, we recommend <Link href="/downloads" style={{ color: '#ef4444', fontWeight: 700 }}>choosing a secure alternative</Link>.</span>
                      </div>
                    )}
                  </Card>
              )
              return isDisabled ? (
                <div key={app.id} style={{ opacity: 0.65 }}>{inner}</div>
              ) : (
                <Link key={app.id} href={app.href} style={{ textDecoration: 'none' }}>{inner}</Link>
              )
            })}
          </div>
        </Section>

        {/* ── Coming Soon ── */}
        <Section title="Coming Soon">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {COMING.map(c => (
              <div key={c.name} style={{
                background: '#fff', borderRadius: 12, padding: '14px 12px', textAlign: 'center',
                border: '1px solid #e5e7eb', opacity: 0.5,
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: c.color, margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 900 }}>{c.name.slice(0, 2)}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{c.name}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── CTA ── */}
        <div style={{ borderRadius: 16, padding: '2.5rem 2rem', textAlign: 'center', background: '#1a1a1a', color: '#fff', boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Build Your Own Integration</h2>
          <p style={{ fontSize: 14, color: '#999', marginBottom: 20 }}>0nMCP is open source, MIT licensed. Build anything.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            <Link href="https://github.com/0nork/0nMCP" target="_blank" rel="noopener" style={{ padding: '10px 24px', borderRadius: 10, background: '#fff', color: '#1a1a1a', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>GitHub</Link>
            <Link href="/signup" style={{ padding: '10px 24px', borderRadius: 10, background: '#6EE05A', color: '#1a1a1a', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>Request Access</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
