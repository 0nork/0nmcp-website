'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

/* SVG logos for platforms without files in /logos/ */
const LOGO_MAP: Record<string, React.ReactNode> = {
  claude: <Image src="/brand/logos/anthropic.svg" alt="Claude" width={28} height={28} />,
  cursor: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="6" fill="#000"/><path d="M7 21L21 14L7 7v5.5L15 14l-8 1.5V21z" fill="#fff"/></svg>,
  vscode: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M20.5 3L10 12.5 5.5 9 3 10.2v7.6L5.5 19l4.5-3.5L20.5 25 25 23V5l-4.5-2zM5 16.5v-5L7.5 14 5 16.5zM20.5 21l-8-7 8-7v14z" fill="#007ACC"/></svg>,
  windsurf: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 20c2-4 6-12 10-14 0 4 2 8 4 10-3 1-6 3-8 6 0-3-2-5-6-2z" fill="#10b981"/><path d="M14 6c4-2 8 0 10 4-2 0-6 2-8 6 0-4-1-8-2-10z" fill="#059669"/></svg>,
  terminal: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="6" fill="#1a1a1a"/><path d="M8 10l4 4-4 4" stroke="#7ed957" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="14" y1="18" x2="20" y2="18" stroke="#7ed957" strokeWidth="2" strokeLinecap="round"/></svg>,
  http: <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="6" fill="#7c3aed" fillOpacity="0.15"/><circle cx="14" cy="14" r="7" stroke="#a78bfa" strokeWidth="1.5" fill="none"/><ellipse cx="14" cy="14" rx="3.5" ry="7" stroke="#a78bfa" strokeWidth="1.5" fill="none"/><line x1="7" y1="14" x2="21" y2="14" stroke="#a78bfa" strokeWidth="1.5"/></svg>,
  slack: <Image src="/brand/logos/slack.svg" alt="Slack" width={28} height={28} />,
  chatgpt: <Image src="/brand/logos/openai.svg" alt="ChatGPT" width={28} height={28} />,
  wordpress: <Image src="/brand/logos/wordpress.svg" alt="WordPress" width={28} height={28} />,
  stripe: <Image src="/brand/logos/stripe.svg" alt="Stripe" width={28} height={28} />,
}

interface Platform {
  id: string
  name: string
  icon: string
  color: string
  desc: string
  howItConnects: string
  features: string[]
  configPath: string
  configPathWin?: string
  config: string
  steps: string[]
  externalLink?: string
}

const PLATFORMS: Platform[] = [
  {
    id: 'claude',
    name: 'Claude Desktop',
    icon: '',
    color: '#d4a27f',
    desc: 'Anthropic\'s desktop app',
    howItConnects: '0nMCP connects as a native MCP server inside Claude Desktop. Once configured, Claude can call any of the 1,589 tools directly during conversation — no API keys needed on your side.',
    features: ['Native MCP protocol', 'Zero-latency tool calls', 'Works with Claude 4.6 Opus'],
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
    howItConnects: 'Cursor natively supports MCP servers. 0nMCP runs as a background process that Cursor\'s AI agent can invoke — giving it access to CRM, Stripe, Slack, and 99 more services while you code.',
    features: ['Background MCP process', 'Agent-mode tool access', 'Project-level config'],
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
    howItConnects: 'VS Code + GitHub Copilot now supports MCP servers. 0nMCP registers as a tool provider — Copilot can call any tool via @0nMCP mentions in chat.',
    features: ['Copilot MCP integration', '@0nMCP chat mentions', 'Workspace-level config'],
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
    howItConnects: 'Windsurf\'s Cascade agent connects to 0nMCP via the MCP protocol. All 1,589 tools become available in Cascade\'s autonomous coding mode.',
    features: ['Cascade agent integration', 'Autonomous tool calling', 'Global config'],
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
    howItConnects: 'Run 0nMCP directly from any terminal. It starts as a stdio MCP server that any MCP-compatible client can connect to. One command, instant access.',
    features: ['Single npx command', 'Works on any OS', 'Pipe to any MCP client'],
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
    howItConnects: '0nMCP runs as an HTTP server with a REST API. POST to /execute with any tool name and parameters. Perfect for custom integrations, webhooks, and server-to-server communication.',
    features: ['REST API endpoints', 'Webhook receivers', 'Custom integrations'],
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
    howItConnects: 'The 0nMCP Slack app brings AI orchestration into your workspace. Use /0n commands to execute tasks across all 102 services without leaving Slack.',
    features: ['/0n slash commands', 'Multi-service execution', 'Team-wide access'],
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
    howItConnects: '0nMCP exposes a GPT Actions endpoint. Create a custom GPT that can call any of the 1,589 tools via the OpenAI Actions API — bridging ChatGPT to your entire tech stack.',
    features: ['GPT Actions API', 'OAuth authentication', 'Custom GPT builder'],
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
    howItConnects: 'The 0nCore WordPress plugin connects your site directly to 0nMCP. Get an AI chat widget, CRM integration, and automation triggers — all from the WordPress admin.',
    features: ['AI chat widget', 'CRM integration', 'WP admin panel'],
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
    howItConnects: 'The Stripe Sync Engine automatically mirrors your Stripe data into Supabase. 29 tables, real-time sync, zero webhook config. Query payments with SQL.',
    features: ['29 auto-syncing tables', 'Real-time events', 'SQL-queryable data'],
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

/* ─── Modal component ─── */
function InstallModal({ platform, onClose, onContinue }: { platform: Platform; onClose: () => void; onContinue: () => void }) {
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 20, padding: '2rem', maxWidth: 480, width: '100%',
          animation: 'slideUp 0.25s ease',
          boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header with logo + platform */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: `${platform.color}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${platform.color}30`,
          }}>
            {LOGO_MAP[platform.id] || <span style={{ fontSize: '1.25rem', fontWeight: 800, color: platform.color }}>{platform.icon}</span>}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{platform.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{platform.desc}</div>
          </div>
        </div>

        {/* Connection arrow: 0nMCP → Platform */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem',
          padding: '1rem 0', marginBottom: '1rem',
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'linear-gradient(135deg, #7ed957, #5cb83a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 11, color: '#000',
          }}>0n</div>
          <svg width="40" height="16" viewBox="0 0 40 16" fill="none">
            <path d="M0 8h32M28 3l6 5-6 5" stroke={platform.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <animate attributeName="stroke-dashoffset" from="40" to="0" dur="0.6s" fill="freeze" />
            </path>
          </svg>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: `${platform.color}20`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {LOGO_MAP[platform.id] || <span style={{ fontSize: '0.9rem', fontWeight: 800, color: platform.color }}>{platform.icon}</span>}
          </div>
        </div>

        {/* How it connects */}
        <p style={{
          color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7,
          margin: '0 0 1.25rem', textAlign: 'center',
        }}>
          {platform.howItConnects}
        </p>

        {/* Features chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {platform.features.map((f, i) => (
            <span key={i} style={{
              padding: '0.3rem 0.75rem', borderRadius: 20,
              background: `${platform.color}12`, border: `1px solid ${platform.color}25`,
              color: platform.color, fontSize: '0.75rem', fontWeight: 600,
            }}>{f}</span>
          ))}
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '0.75rem', borderRadius: 10,
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >Back</button>
          <button
            onClick={onContinue}
            style={{
              flex: 2, padding: '0.75rem', borderRadius: 10,
              background: platform.color, border: 'none',
              color: '#fff', fontWeight: 700, fontSize: '0.875rem',
              cursor: 'pointer', transition: 'all 0.15s',
              boxShadow: `0 4px 12px ${platform.color}40`,
            }}
          >Install on {platform.name}</button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  )
}

export default function InstallClient({ embedded }: { embedded?: boolean }) {
  const [preview, setPreview] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const previewPlatform = PLATFORMS.find(p => p.id === preview)
  const platform = PLATFORMS.find(p => p.id === selected)

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ minHeight: embedded ? 'auto' : '100vh', background: embedded ? 'transparent' : 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '3rem 1rem 1rem', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <Image src="/brand/0nmcp-logo-dark.svg" alt="0nMCP" width={48} height={48} style={{ borderRadius: 12 }} />
        </div>
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
          {PLATFORMS.map(p => {
            const isHovered = hoveredId === p.id
            const isSelected = selected === p.id
            return (
              <button
                key={p.id}
                onClick={() => setPreview(p.id)}
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: isSelected ? `${p.color}15` : isHovered ? `${p.color}08` : 'var(--bg-card)',
                  border: `1px solid ${isSelected ? p.color + '60' : isHovered ? p.color + '30' : 'var(--border)'}`,
                  borderRadius: 12, padding: '1.5rem', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: isHovered ? `0 8px 24px ${p.color}20` : '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 10,
                  background: `${p.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.25s ease',
                  transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                }}>{LOGO_MAP[p.id] || <span style={{ fontSize: '1.25rem', fontWeight: 800, color: p.color }}>{p.icon}</span>}</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{p.name}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{p.desc}</div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Preview Modal */}
      {previewPlatform && !selected && (
        <InstallModal
          platform={previewPlatform}
          onClose={() => setPreview(null)}
          onContinue={() => { setSelected(previewPlatform.id); setPreview(null) }}
        />
      )}

      {/* Full Install Instructions */}
      {platform && (
        <section style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem 4rem' }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, padding: '2rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: `${platform.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {LOGO_MAP[platform.id] || <span style={{ fontSize: '0.9rem', fontWeight: 800, color: platform.color }}>{platform.icon}</span>}
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Install on {platform.name}
              </h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0 0 1.5rem', paddingLeft: '2.75rem' }}>
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
              background: '#0d1117', border: '1px solid var(--border)',
              borderRadius: 10, overflow: 'hidden',
            }}>
              <div style={{
                padding: '0.625rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#161b22', borderBottom: '1px solid rgba(255,255,255,0.08)',
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
                    background: copied ? 'rgba(126,217,87,0.2)' : 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: copied ? '#7ed957' : '#8b949e',
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

            {/* Actions */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => setSelected(null)}
                style={{
                  padding: '0.625rem 1.5rem', borderRadius: 8,
                  background: 'transparent', border: '1px solid var(--border)',
                  color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                }}
              >Choose Different</button>
              <Link href="/console" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '0.625rem 2rem', borderRadius: 8,
                background: '#7ed957', color: '#000', textDecoration: 'none',
                fontWeight: 700, fontSize: '0.875rem',
              }}>Go to Console</Link>
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
