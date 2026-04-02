import type { Metadata } from 'next'
import Link from 'next/link'
import { STATS_DISPLAY } from '@/data/stats'

export const metadata: Metadata = {
  title: '0nClaude — The Premium Claude Experience',
  description: `Connect your Vault to Claude Desktop or Claude Code. ${STATS_DISPLAY.tools} tools, Knowledge Layer, and business context — loaded automatically.`,
  alternates: { canonical: 'https://www.0nmcp.com/downloads/onclaude' },
}

const CLAUDE_DESKTOP_CONFIG = `{
  "mcpServers": {
    "0nMCP": {
      "command": "npx",
      "args": ["-y", "0nmcp"]
    }
  }
}`

const FEATURES = [
  { title: 'Vault Connection', desc: 'Your entire business context loads automatically. Credentials, preferences, history — all securely decrypted at runtime.' },
  { title: 'Knowledge Layer', desc: 'Brand voice, terminology, business structure. Claude speaks your language from the first message.' },
  { title: `${STATS_DISPLAY.tools} Tools`, desc: `CRM, Stripe, Slack, GitHub, LinkedIn, and ${STATS_DISPLAY.services} more services. Every tool available in every conversation.` },
  { title: 'Progressive Collection', desc: 'Claude asks about missing Vault data to expand capabilities. Your context grows richer over time.' },
]

export default function OnClaudePage() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: '5rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <Link href="/downloads" style={{ fontSize: 12, color: '#6EE05A', textDecoration: 'none' }}>&larr; All Downloads</Link>

        {/* Hero */}
        <div style={{ marginTop: 16, marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: '#6EE05A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0f172a', fontSize: 24, fontWeight: 900,
              boxShadow: '0 8px 24px rgba(110,224,90,0.3)',
            }}>C</div>
            <div>
              <h1 style={{ fontSize: 32, fontWeight: 900, color: '#1a1a1a', margin: 0 }}>0nClaude</h1>
              <p style={{ fontSize: 14, color: '#888', margin: 0 }}>The Premium Claude Experience</p>
            </div>
          </div>
          <p style={{ fontSize: 17, color: '#555', lineHeight: 1.8 }}>
            Connect your Vault to Claude Desktop or Claude Code. Your business context, Knowledge Layer, and {STATS_DISPLAY.tools} tools — loaded automatically on every conversation.
          </p>
        </div>

        {/* Install Methods */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 16 }}>Install</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>

            {/* Card 1: Claude Desktop */}
            <div style={{
              background: '#fff', borderRadius: 14, padding: 24,
              border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: '#d4a574',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 13, fontWeight: 900,
                }}>C</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>Claude Desktop</div>
                  <div style={{ fontSize: 12, color: '#888' }}>JSON config file</div>
                </div>
              </div>

              <pre style={{
                padding: 16, borderRadius: 10, background: '#1a1a1a', color: '#e0e0e0',
                fontSize: 12, fontFamily: 'monospace', lineHeight: 1.6, overflow: 'auto', margin: '0 0 12px',
              }}>{CLAUDE_DESKTOP_CONFIG}</pre>

              <p style={{ fontSize: 12, color: '#888', margin: '0 0 16px' }}>
                Add to <code style={{ background: '#f5f5f7', padding: '2px 6px', borderRadius: 4, fontSize: 11 }}>~/Library/Application Support/Claude/claude_desktop_config.json</code>
              </p>

              <div style={{ fontSize: 13, color: '#555', lineHeight: 1.8 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: '#6EE05A', fontWeight: 700, flexShrink: 0 }}>1.</span>
                  <span>Copy the config above</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: '#6EE05A', fontWeight: 700, flexShrink: 0 }}>2.</span>
                  <span>Paste into your config file</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: '#6EE05A', fontWeight: 700, flexShrink: 0 }}>3.</span>
                  <span>Restart Claude Desktop</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ color: '#6EE05A', fontWeight: 700, flexShrink: 0 }}>4.</span>
                  <span>&ldquo;0nMCP&rdquo; appears in your MCP servers</span>
                </div>
              </div>
            </div>

            {/* Card 2: Claude Code */}
            <div style={{
              background: '#fff', borderRadius: 14, padding: 24,
              border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'flex', flexDirection: 'column',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, background: '#d4a574',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 11, fontWeight: 900,
                }}>CC</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>Claude Code</div>
                  <div style={{ fontSize: 12, color: '#888' }}>One command</div>
                </div>
              </div>

              <code style={{
                display: 'block', padding: 16, borderRadius: 10, background: '#1a1a1a',
                color: '#6EE05A', fontSize: 13, fontFamily: 'monospace', lineHeight: 1.6,
                marginBottom: 16,
              }}>claude mcp add 0nMCP -- npx -y 0nmcp</code>

              <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px' }}>
                That&apos;s it. One command.
              </p>
              <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, margin: 0, flex: 1 }}>
                Run this in your terminal and {STATS_DISPLAY.tools} tools are instantly available in every Claude Code session.
              </p>
            </div>
          </div>
        </section>

        {/* What You Get */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 16 }}>What You Get</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={{
                background: '#fff', borderRadius: 14, padding: 20,
                border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture */}
        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 16 }}>How It Works</h2>
          <div style={{
            background: '#1a1a1a', borderRadius: 14, padding: 24,
            color: '#e0e0e0', fontSize: 13, fontFamily: 'monospace', lineHeight: 1.8,
          }}>
            <div style={{ color: '#6EE05A', marginBottom: 12, fontWeight: 700 }}>// Architecture</div>
            <div>You type in Claude    &rarr;  0nMCP receives</div>
            <div>                           &darr;</div>
            <div>                      Vault loads context</div>
            <div>                           &darr;</div>
            <div>                      Knowledge Layer applies</div>
            <div>                           &darr;</div>
            <div>                      Tool executes &rarr; {STATS_DISPLAY.services} services</div>
            <div>                           &darr;</div>
            <div style={{ color: '#6EE05A' }}>                      Result returns to Claude</div>
          </div>
        </section>

        {/* CTA */}
        <div style={{
          borderRadius: 16, padding: '2.5rem 2rem', textAlign: 'center',
          background: 'linear-gradient(135deg, #0f172a, #1a3a1a)',
          color: '#fff', boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Get Started</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>
            Subscribe to unlock your Vault, Knowledge Layer, and {STATS_DISPLAY.tools} tools.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Link href="/subscribe" style={{
              padding: '12px 28px', borderRadius: 10, background: '#6EE05A', color: '#0f172a',
              fontWeight: 800, fontSize: 14, textDecoration: 'none',
            }}>Get Started</Link>
            <Link href="#install" onClick={undefined} style={{
              padding: '12px 28px', borderRadius: 10, background: 'rgba(255,255,255,0.1)',
              color: '#fff', fontWeight: 600, fontSize: 14, textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.2)',
            }}>Already subscribed? Install now</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
