import type { Metadata } from 'next'
import OrchestratorForge from '@/components/OrchestratorForge'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Automate MCP Server Workflows — Agentic Power with 0nMCP',
  description: 'Build autonomous AI workflows with Pipeline, Assembly Line, and Radial Burst execution models. 1,598+ tools, 4 patents, zero config.',
  alternates: { canonical: 'https://www.0nmcp.com/automate-mcp' },
}

export default function AutomateMcpPage() {
  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh', paddingTop: '5rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem' }}>
        <nav style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          <Link href="/home" style={{ color: 'var(--text-muted)' }}>Home</Link> / <span style={{ color: 'var(--text-primary)' }}>Automate MCP Server</span>
        </nav>

        <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 12 }}>
          Automate MCP Server Workflows — Agentic Power with 0nMCP
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 32 }}>
          Describe outcomes in natural language. 0nMCP orchestrates complex agentic workflows across <strong>106 services</strong> using three patented execution models: Pipeline, Assembly Line, and Radial Burst. No code required.
        </p>
      </div>

      <OrchestratorForge />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 32 }}>
          {[
            { name: 'Pipeline', desc: 'Sequential — step A completes before step B. Data transformation, approval flows, ETL.', icon: '→' },
            { name: 'Assembly Line', desc: 'Parallel with dependencies — independent steps run simultaneously. Multi-service orchestration.', icon: '⇉' },
            { name: 'Radial Burst', desc: 'Fan-out — one trigger spawns N parallel ops. Broadcast, bulk updates, multi-channel campaigns.', icon: '✦' },
          ].map(m => (
            <div key={m.name} style={{
              padding: 24, borderRadius: 14, background: 'var(--bg-card)',
              border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
              onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>{m.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{m.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: 24, borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>How .0n SWITCH Files Work</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8 }}>
            SWITCH files are portable JSON workflows that describe WHAT should happen, not HOW. Your config says "tag this contact, notify Slack, send an invoice" — 0nMCP resolves the user's connected services and executes through the optimal path. Works on any machine, any AI platform, any service configuration.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link href="/mcp-integration" style={{ color: '#16a34a', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>← MCP Integration</Link>
          <span style={{ margin: '0 16px', color: '#ddd' }}>|</span>
          <Link href="/home" style={{ color: '#16a34a', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Homepage →</Link>
        </div>
      </div>
    </div>
  )
}
