'use client'

import { useState } from 'react'
import Link from 'next/link'

const PLATFORMS = [
  {
    id: 'claude',
    name: 'Claude Desktop',
    icon: 'A',
    color: '#d4a27f',
    desc: 'Anthropic\'s desktop app',
    configPath: '~/Library/Application Support/Claude/claude_desktop_config.json',
    configPathWin: '%APPDATA%\\Claude\\claude_desktop_config.json',
    config: JSON.stringify({
      mcpServers: {
        "0nMCP": {
          command: "npx",
          args: ["-y", "0nmcp"]
        }
      }
    }, null, 2),
    steps: [
      'Open Claude Desktop',
      'Go to Settings (gear icon) → Developer → Edit Config',
      'Paste the config below into your claude_desktop_config.json',
      'Restart Claude Desktop',
      'Type "list my tools" — you now have 1,589 tools',
    ],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    icon: 'C',
    color: '#00d4ff',
    desc: 'AI-first code editor',
    configPath: '.cursor/mcp.json (in your project root)',
    config: JSON.stringify({
      mcpServers: {
        "0nMCP": {
          command: "npx",
          args: ["-y", "0nmcp"]
        }
      }
    }, null, 2),
    steps: [
      'Open Cursor Settings → Features → MCP Servers',
      'Click "Add new MCP server"',
      'Paste the config below',
      'Restart Cursor',
      'Ask Cursor to use any of the 1,589 tools',
    ],
  },
  {
    id: 'vscode',
    name: 'VS Code',
    icon: 'V',
    color: '#007acc',
    desc: 'With Copilot MCP',
    configPath: '.vscode/mcp.json',
    config: JSON.stringify({
      servers: {
        "0nMCP": {
          command: "npx",
          args: ["-y", "0nmcp"]
        }
      }
    }, null, 2),
    steps: [
      'Install the Copilot extension (if not already)',
      'Create .vscode/mcp.json in your project',
      'Paste the config below',
      'Reload VS Code',
      'Use @0nMCP in Copilot chat',
    ],
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    icon: 'W',
    color: '#10b981',
    desc: 'Codeium\'s AI IDE',
    configPath: '~/.codeium/windsurf/mcp_config.json',
    config: JSON.stringify({
      mcpServers: {
        "0nMCP": {
          command: "npx",
          args: ["-y", "0nmcp"]
        }
      }
    }, null, 2),
    steps: [
      'Open Windsurf',
      'Go to Settings → MCP Configuration',
      'Paste the config below',
      'Restart Windsurf',
      '1,589 tools are now available in Cascade',
    ],
  },
  {
    id: 'terminal',
    name: 'Terminal / CLI',
    icon: '>_',
    color: '#7ed957',
    desc: 'Run anywhere with Node.js',
    configPath: 'Any terminal',
    config: 'npx 0nmcp',
    steps: [
      'Make sure you have Node.js 18+ installed',
      'Run the command below in your terminal',
      '0nMCP starts as an MCP server on stdio',
      'Connect any MCP client to it',
    ],
  },
  {
    id: 'http',
    name: 'HTTP Server',
    icon: 'H',
    color: '#a78bfa',
    desc: 'REST API mode',
    configPath: 'Any server',
    config: 'npx 0nmcp serve --port 3100',
    steps: [
      'Run the command below to start the HTTP server',
      'API available at http://localhost:3100',
      'POST /execute to run any tool',
      'GET /health for status',
      'All 1,589 tools available via REST API',
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: 'Sl',
    color: '#4a154b',
    desc: 'AI in your workspace',
    configPath: 'Any Slack workspace',
    config: '/0n run Send an invoice on Stripe and notify the team',
    steps: [
      'Click "Add to Slack" below to install the 0nMCP app',
      'Authorize the app for your workspace',
      'Type /0n in any channel to start',
      '/0n run <task> — AI executes across 102 services',
      '/0n status — Check your connections',
    ],
    externalLink: '/slack',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: 'GP',
    color: '#10a37f',
    desc: 'OpenAI GPT action',
    configPath: 'ChatGPT Actions',
    config: 'https://www.0nmcp.com/api/chatgpt/mcp',
    steps: [
      'Go to ChatGPT → Explore GPTs → Create a GPT',
      'Under "Actions" → Add Action',
      'Set the server URL to the endpoint below',
      'Set Authentication to OAuth (Client ID from your 0nMCP account)',
      'Save and publish your GPT',
    ],
  },
  {
    id: 'wordpress',
    name: 'WordPress',
    icon: 'WP',
    color: '#21759b',
    desc: '0nPress plugin',
    configPath: 'wp-content/plugins/0ncore/',
    config: 'Upload the 0nCore plugin ZIP to your WordPress site',
    steps: [
      'Download the 0nCore WordPress plugin from your dashboard',
      'Go to WordPress Admin → Plugins → Add New → Upload Plugin',
      'Upload the 0ncore.zip file and click Install',
      'Activate the plugin',
      'Go to 0nCore Settings → enter your PIT token from 0nmcp.com/dashboard',
      'AI chat widget + CRM integration now live on your site',
    ],
    externalLink: '/dashboard/downloads',
  },
  {
    id: 'stripe',
    name: 'Stripe',
    icon: 'St',
    color: '#635bff',
    desc: 'Payment sync engine',
    configPath: 'Supabase Stripe Sync',
    config: 'Enabled via Supabase dashboard — 29 tables auto-syncing',
    steps: [
      'Your Stripe account is automatically synced via the Stripe Sync Engine',
      'Customer data, subscriptions, invoices, and charges are all queryable in SQL',
      'Connect your Stripe key in Settings to enable billing features',
      'All payment events sync in real-time — no webhook setup needed',
    ],
  },
]

export default function InstallClient({ embedded }: { embedded?: boolean }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const platform = PLATFORMS.find(p => p.id === selected)

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: embedded ? 'auto' : '100vh', background: embedded ? 'transparent' : 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header — hidden when embedded in dashboard */}
      {!embedded && (
      <header style={{
        padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 6, background: 'linear-gradient(135deg,#7ed957,#5cb83a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#000' }}>0n</div>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>0nMCP</span>
        </Link>
      </header>
      )}

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '3rem 1rem 1rem', maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15, margin: '0 0 1rem' }}>
          Where do you want to<br /><span style={{ color: '#7ed957' }}>install 0nMCP?</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6 }}>
          Pick your platform. Paste one config. Get <strong style={{ color: 'var(--text-primary)' }}>1,589 tools</strong> across <strong style={{ color: 'var(--text-primary)' }}>102 services</strong> instantly.
        </p>
      </section>

      {/* Platform Grid */}
      <section style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              style={{
                background: selected === p.id ? `${p.color}15` : 'var(--bg-card)',
                border: `1px solid ${selected === p.id ? p.color + '60' : 'var(--border)'}`,
                borderRadius: 12, padding: '1.5rem', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 10,
                background: `${p.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: p.id === 'terminal' ? '0.9rem' : '1.25rem',
                fontWeight: 800, color: p.color,
                fontFamily: p.id === 'terminal' ? "'JetBrains Mono',monospace" : 'var(--font-display,system-ui)',
              }}>{p.icon}</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{p.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{p.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Install Instructions */}
      {platform && (
        <section style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem 4rem' }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '2rem', 
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
              Install on {platform.name}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 1.5rem' }}>
              {platform.configPath}
            </p>

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
              {platform.steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: `${platform.color}20`, color: platform.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 700,
                  }}>{i + 1}</div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, paddingTop: 2 }}>{s}</span>
                </div>
              ))}
            </div>

            {/* Config block */}
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 10, overflow: 'hidden',
            }}>
              <div style={{
                padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--bg-card)', borderBottom: '1px solid var(--border)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57' }} />
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#febc2e' }} />
                    <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840' }} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: platform.color, marginLeft: 8, fontWeight: 600 }}>
                    {platform.id === 'terminal' || platform.id === 'http' ? 'Terminal' : platform.configPath.split('/').pop()}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(platform.config)}
                  style={{
                    padding: '3px 10px', borderRadius: 4,
                    background: copied ? 'rgba(126,217,87,0.2)' : 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: copied ? '#7ed957' : '#94a3b8',
                    fontSize: '0.65rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >{copied ? 'Copied!' : 'Copy'}</button>
              </div>
              <pre style={{
                padding: '1rem', margin: 0,
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: '0.8rem', lineHeight: 1.6, color: '#7ed957',
                overflow: 'auto',
              }}>{platform.config}</pre>
            </div>

            {/* What you get */}
            <div style={{
              marginTop: '1.5rem', padding: '1rem 1.25rem',
              background: 'rgba(126,217,87,0.04)', border: '1px solid rgba(126,217,87,0.12)',
              borderRadius: 10,
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#7ed957', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>What you get</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                {[
                  '1,589 AI tools',
                  '102 services',
                  'CRM (245 tools)',
                  'Stripe payments',
                  'Slack, Discord, Twilio',
                  'GitHub, Jira, Linear',
                  'OpenAI, Anthropic',
                  'Google Suite',
                  'Supabase, MongoDB',
                  'Shopify, Square',
                  'Encrypted vault',
                  'Workflow engine',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#7ed957', flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Success CTA */}
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                After installing, restart your app and try: &quot;Send an email with SendGrid&quot;
              </p>
              <Link href="/dashboard" style={{
                display: 'inline-block', padding: '0.625rem 2rem', borderRadius: 8,
                background: '#7ed957', color: '#000', textDecoration: 'none',
                fontWeight: 700, fontSize: '0.875rem',
              }}>Go to Dashboard</Link>
            </div>
          </div>
        </section>
      )}

      {/* Bottom stats */}
      {!platform && (
        <section style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          <p>npm install 0nmcp &nbsp;|&nbsp; MIT Licensed &nbsp;|&nbsp; 5 Patents Pending</p>
        </section>
      )}
    </div>
  )
}
