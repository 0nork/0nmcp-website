import type { Metadata } from 'next'
import OrchestratorForge from '@/components/OrchestratorForge'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'MCP Server Integration with 0nMCP — Zero Config, 945+ Tools',
  description: 'Integrate 945+ tools across 54 services into any AI model with zero configuration. The most comprehensive MCP server for business automation.',
  alternates: { canonical: 'https://www.0nmcp.com/mcp-integration' },
}

export default function McpIntegrationPage() {
  return (
    <div style={{ background: '#f5f5f7', minHeight: '100vh', paddingTop: '5rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem' }}>
        <nav style={{ fontSize: 12, color: '#888', marginBottom: 16 }}>
          <Link href="/home" style={{ color: '#888' }}>Home</Link> / <span style={{ color: '#1a1a1a' }}>MCP Server Integration</span>
        </nav>

        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: 12 }}>
          MCP Server Integration with 0nMCP — Zero Config, 945+ Tools
        </h1>
        <p style={{ fontSize: 17, color: '#555', lineHeight: 1.8, marginBottom: 32 }}>
          Connect any AI model to <strong>54 services</strong> through the Model Context Protocol. Stripe, CRM, Slack, GitHub, Supabase — all accessible with <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: 4 }}>npx 0nmcp@latest</code>. Powered by 4 patented technologies. MIT licensed. Open source.
        </p>
      </div>

      <OrchestratorForge />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <div style={{ padding: 24, borderRadius: 14, background: '#fff', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>How 0nMCP Integration Works</h2>
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8 }}>
            0nMCP acts as a universal translator between AI models and business services. Your AI describes what it needs in natural language. 0nMCP selects the right tool, authenticates securely via 0nVault, executes the operation, and returns structured results. No manual API wiring. No YAML configs. No vendor lock-in.
          </p>
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, marginTop: 12 }}>
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
