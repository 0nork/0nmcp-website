import type { Metadata } from 'next'
import Link from 'next/link'
import { STATS_DISPLAY } from '@/data/stats'

export const metadata: Metadata = {
  title: '0nGPT — Use 0nMCP Inside ChatGPT',
  description: `${STATS_DISPLAY.tools} MCP tools inside ChatGPT. OAuth 2.1 with PKCE, branded widget, full tool execution. The first 0nMCP app integration.`,
  alternates: { canonical: 'https://www.0nmcp.com/downloads/ongpt' },
}

export default function OnGptPage() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '5rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <Link href="/downloads" style={{ fontSize: 12, color: '#6EE05A', textDecoration: 'none' }}>← All Downloads</Link>

        {/* Hero */}
        <div style={{ marginTop: 16, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: 'var(--bg-card)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-primary)', fontSize: 20, fontWeight: 900,
              boxShadow: '0 8px 24px rgba(16,163,127,0.25)',
            }}>GPT</div>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>0nGPT</h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0 }}>ChatGPT App Integration for 0nMCP</p>
            </div>
          </div>
          <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.8 }}>
            Use {STATS_DISPLAY.tools} 0nMCP tools directly inside ChatGPT conversations. Send invoices, manage contacts, create workflows, query databases — all through natural language in ChatGPT.
          </p>
        </div>

        {/* Features */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>What You Get</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { title: 'Full MCP Tool Access', desc: `All ${STATS_DISPLAY.tools} tools available in ChatGPT — CRM, Stripe, Slack, GitHub, LinkedIn, and ${STATS_DISPLAY.services} more services.` },
              { title: 'OAuth 2.1 + PKCE', desc: 'Secure authentication with proof key for code exchange. Your credentials stay protected.' },
              { title: 'Branded Widget', desc: '0nMCP-branded iframe widget inside ChatGPT with tool status, execution history, and connection management.' },
              { title: 'JWT Verification', desc: 'Every MCP tool call verifies the bearer JWT via JWKS. No token, no execution.' },
            ].map(f => (
              <div key={f.title} style={{
                background: 'var(--bg-card)', borderRadius: 14, padding: 20,
                border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>How It Works</h2>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 14, padding: 24,
            color: '#e0e0e0', fontSize: 13, fontFamily: 'monospace', lineHeight: 1.8,
          }}>
            <div style={{ color: '#6EE05A', marginBottom: 12, fontWeight: 700 }}>// Architecture</div>
            <div>ChatGPT → OAuth 2.1 (PKCE) → 0nMCP Auth Server</div>
            <div>                                    ↓</div>
            <div>              JWT issued → Bearer token in every tool call</div>
            <div>                                    ↓</div>
            <div>              0nMCP MCP Server → JWKS verification</div>
            <div>                                    ↓</div>
            <div>              Tool execution → {STATS_DISPLAY.services} services</div>
            <div>                                    ↓</div>
            <div style={{ color: '#6EE05A' }}>              Result → ChatGPT conversation</div>
          </div>
        </section>

        {/* Files included */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>Included Files</h2>
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {[
              { file: 'apps-sdk/server/index.ts', desc: 'MCP server entry — tools + ext-apps UI registration' },
              { file: 'apps-sdk/server/auth.ts', desc: 'Bearer JWT verification via JWKS' },
              { file: 'apps-sdk/web/widget.html', desc: 'Branded iframe widget for ChatGPT' },
              { file: 'app/api/.well-known/*', desc: 'OAuth discovery endpoint' },
              { file: 'app/api/chatgpt/oauth.route.ts', desc: 'OAuth register / authorize / token routes' },
              { file: 'supabase/migrations/*', desc: '4 OAuth tables (clients, codes, tokens, requests)' },
              { file: 'chatgpt-app.0n', desc: 'Vault config file for the integration' },
            ].map((f, i) => (
              <div key={f.file} style={{
                display: 'flex', gap: 12, padding: '12px 20px',
                borderBottom: i < 6 ? '1px solid #f0f0f0' : 'none',
                alignItems: 'center',
              }}>
                <code style={{ fontSize: 12, color: '#6EE05A', fontFamily: 'monospace', minWidth: 240 }}>{f.file}</code>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{f.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div style={{
          borderRadius: 16, padding: '2.5rem 2rem', textAlign: 'center',
          background: 'linear-gradient(135deg, #10a37f, #064e3b)',
          color: 'var(--text-primary)', boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Get 0nGPT</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>
            Request access to deploy 0nGPT in your ChatGPT environment.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
            <Link href="/signup" style={{ padding: '12px 28px', borderRadius: 10, background: 'var(--bg-card)', color: '#10a37f', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>Request Access</Link>
            <Link href="https://0ncore.com" target="_blank" rel="noopener" style={{ padding: '12px 28px', borderRadius: 10, background: 'var(--border-hover)', color: 'var(--text-primary)', fontWeight: 600, fontSize: 14, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)' }}>Try 0nCore</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
