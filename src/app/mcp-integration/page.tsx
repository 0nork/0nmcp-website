import type { Metadata } from 'next'
import OrchestratorForge from '@/components/OrchestratorForge'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'MCP Server Integration with 0nMCP — Zero Config, 1,598+ Tools',
  description: 'Integrate 1,598+ tools across 106 services into any AI model with zero configuration. The most comprehensive MCP server for business automation.',
  alternates: { canonical: 'https://www.0nmcp.com/mcp-integration' },
}

export default function McpIntegrationPage() {
  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh', paddingTop: '5rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem' }}>
        <nav style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
          <Link href="/home" style={{ color: 'var(--text-muted)' }}>Home</Link> / <span style={{ color: 'var(--text-primary)' }}>MCP Server Integration</span>
        </nav>

        <h1 style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: 12 }}>
          MCP Server Integration with 0nMCP — Zero Config, 1,598+ Tools
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 32 }}>
          Connect any AI model to <strong>106 services</strong> through the Model Context Protocol. Stripe, CRM, Slack, GitHub, Supabase — all accessible with <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }}>npx 0nmcp@latest</code>. Powered by 4 patent-pending technologies. Source-available. Open source.
        </p>
      </div>

      <OrchestratorForge />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <div style={{ padding: 24, borderRadius: 14, background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>How 0nMCP Integration Works</h2>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8 }}>
            0nMCP acts as a universal translator between AI models and business services. Your AI describes what it needs in natural language. 0nMCP selects the right tool, authenticates securely via 0nVault, executes the operation, and returns structured results. No manual API wiring. No YAML configs. No vendor lock-in.
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8, marginTop: 12 }}>
            The 245-tool CRM module alone covers contacts, calendars, invoices, pipelines, social media, payments, and 6 more categories. Combined with Stripe for billing, Slack for notifications, and GitHub for deployment — your AI becomes a complete business operator.
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link href="/home" style={{ color: '#16a34a', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>← Back to Homepage</Link>
          <span style={{ margin: '0 16px', color: '#ddd' }}>|</span>
          <Link href="/automate-mcp" style={{ color: '#16a34a', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Automate MCP Workflows →</Link>
        </div>
      </div>
    </div>
  )
}
