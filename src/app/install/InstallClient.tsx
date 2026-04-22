'use client'

import { useState, useEffect, useCallback } from 'react'
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
    id: 'claude', name: 'Claude Desktop', icon: '', color: '#d4a27f',
    desc: 'Anthropic\'s desktop app',
    howItConnects: '0nMCP connects as a native MCP server inside Claude Desktop. Just paste the config — no API keys needed. Claude handles AI, 0nMCP handles the tools.',
    features: ['No API key required', 'Native MCP protocol', 'Works with Claude 4.6 Opus'],
    configPath: '~/Library/Application Support/Claude/claude_desktop_config.json',
    configPathWin: '%APPDATA%\\Claude\\claude_desktop_config.json',
    config: JSON.stringify({ mcpServers: { "0nMCP": { command: "npx", args: ["-y", "0nmcp"] } } }, null, 2),
    steps: ['Open Claude Desktop', 'Go to Settings → Developer → Edit Config', 'Paste the config below (no API key needed)', 'Restart Claude Desktop', 'Type "list my tools" — you now have 1,589 tools'],
  },
  {
    id: 'cursor', name: 'Cursor', icon: 'C', color: '#00d4ff',
    desc: 'AI-first code editor',
    howItConnects: 'Cursor natively supports MCP servers. 0nMCP runs as a background process that Cursor\'s AI agent can invoke — giving it access to CRM, Stripe, Slack, and 99 more services while you code.',
    features: ['Background MCP process', 'Agent-mode tool access', 'Project-level config'],
    configPath: '.cursor/mcp.json',
    config: JSON.stringify({ mcpServers: { "0nMCP": { command: "npx", args: ["-y", "0nmcp"] } } }, null, 2),
    steps: ['Open Cursor Settings → Features → MCP Servers', 'Click "Add new MCP server"', 'Paste the config below', 'Restart Cursor', 'Ask Cursor to use any of the 1,589 tools'],
  },
  {
    id: 'vscode', name: 'VS Code', icon: 'V', color: '#007acc',
    desc: 'With Copilot MCP',
    howItConnects: 'VS Code + GitHub Copilot now supports MCP servers. 0nMCP registers as a tool provider — Copilot can call any tool via @0nMCP mentions in chat.',
    features: ['Copilot MCP integration', '@0nMCP chat mentions', 'Workspace-level config'],
    configPath: '.vscode/mcp.json',
    config: JSON.stringify({ servers: { "0nMCP": { command: "npx", args: ["-y", "0nmcp"] } } }, null, 2),
    steps: ['Install the Copilot extension', 'Create .vscode/mcp.json in your project', 'Paste the config below', 'Reload VS Code', 'Use @0nMCP in Copilot chat'],
  },
  {
    id: 'windsurf', name: 'Windsurf', icon: 'W', color: '#10b981',
    desc: 'Codeium\'s AI IDE',
    howItConnects: 'Windsurf\'s Cascade agent connects to 0nMCP via the MCP protocol. All 1,589 tools become available in Cascade\'s autonomous coding mode.',
    features: ['Cascade agent integration', 'Autonomous tool calling', 'Global config'],
    configPath: '~/.codeium/windsurf/mcp_config.json',
    config: JSON.stringify({ mcpServers: { "0nMCP": { command: "npx", args: ["-y", "0nmcp"] } } }, null, 2),
    steps: ['Open Windsurf', 'Go to Settings → MCP Configuration', 'Paste the config below', 'Restart Windsurf', '1,589 tools are now available in Cascade'],
  },
  {
    id: 'terminal', name: 'Terminal / CLI', icon: '>_', color: '#7ed957',
    desc: 'Run anywhere with Node.js',
    howItConnects: 'Run 0nMCP directly from any terminal. It starts as a stdio MCP server that any MCP-compatible client can connect to. One command, instant access.',
    features: ['Single npx command', 'Works on any OS', 'Pipe to any MCP client'],
    configPath: 'Any terminal',
    config: 'npx 0nmcp',
    steps: ['Make sure you have Node.js 18+ installed', 'Run the command below in your terminal', '0nMCP starts as an MCP server on stdio', 'Connect any MCP client to it'],
  },
  {
    id: 'http', name: 'HTTP Server', icon: 'H', color: '#a78bfa',
    desc: 'REST API mode',
    howItConnects: '0nMCP runs as an HTTP server with a REST API. POST to /execute with any tool name and parameters. Perfect for custom integrations, webhooks, and server-to-server.',
    features: ['REST API endpoints', 'Webhook receivers', 'Custom integrations'],
    configPath: 'Any server',
    config: 'npx 0nmcp serve --port 3100',
    steps: ['Run the command below to start the HTTP server', 'API at http://localhost:3100', 'POST /execute to run any tool', 'GET /health for status'],
  },
  {
    id: 'slack', name: 'Slack', icon: 'Sl', color: '#4a154b',
    desc: 'AI in your workspace',
    howItConnects: 'The 0nMCP Slack app brings AI orchestration into your workspace. Use /0n commands to execute tasks across all 102 services without leaving Slack.',
    features: ['/0n slash commands', 'Multi-service execution', 'Team-wide access'],
    configPath: 'Any Slack workspace',
    config: '/0n run Send an invoice on Stripe and notify the team',
    steps: ['Click "Add to Slack" to install the 0nMCP app', 'Authorize the app for your workspace', 'Type /0n in any channel to start', '/0n run <task> — AI executes across 102 services'],
    externalLink: '/slack',
  },
  {
    id: 'chatgpt', name: 'ChatGPT', icon: 'GP', color: '#10a37f',
    desc: 'OpenAI GPT action',
    howItConnects: '0nMCP exposes a GPT Actions endpoint. Create a custom GPT that can call any of the 1,589 tools via the OpenAI Actions API — bridging ChatGPT to your entire tech stack.',
    features: ['GPT Actions API', 'OAuth authentication', 'Custom GPT builder'],
    configPath: 'ChatGPT Actions',
    config: 'https://www.0nmcp.com/api/chatgpt/mcp',
    steps: ['Go to ChatGPT → Explore GPTs → Create a GPT', 'Under "Actions" → Add Action', 'Set the server URL below', 'Set Authentication to OAuth', 'Save and publish your GPT'],
  },
  {
    id: 'wordpress', name: 'WordPress', icon: 'WP', color: '#21759b',
    desc: '0nPress plugin',
    howItConnects: 'The 0nCore WordPress plugin connects your site directly to 0nMCP. Get an AI chat widget, CRM integration, and automation triggers — all from WordPress admin.',
    features: ['AI chat widget', 'CRM integration', 'WP admin panel'],
    configPath: 'wp-content/plugins/0ncore/',
    config: 'Upload the 0nCore plugin ZIP to your WordPress site',
    steps: ['Download the 0nCore plugin from your dashboard', 'WordPress Admin → Plugins → Add New → Upload Plugin', 'Upload the 0ncore.zip file and click Install', 'Activate and enter your PIT token'],
    externalLink: '/dashboard/downloads',
  },
  {
    id: 'stripe', name: 'Stripe', icon: 'St', color: '#635bff',
    desc: 'Payment sync engine',
    howItConnects: 'The Stripe Sync Engine mirrors your Stripe data into Supabase. 29 tables, real-time sync, zero webhook config. Query payments with SQL.',
    features: ['29 auto-syncing tables', 'Real-time events', 'SQL-queryable data'],
    configPath: 'Supabase Stripe Sync',
    config: 'Enabled via Supabase dashboard — 29 tables auto-syncing',
    steps: ['Stripe data automatically syncs via the Stripe Sync Engine', 'Customers, subscriptions, invoices queryable in SQL', 'Connect your Stripe key in Settings', 'All payment events sync in real-time'],
  },
]

type ModalPhase = 'preview' | 'install' | 'complete'

/* ─── Full Install Modal ─── */
function InstallModal({ platform, onClose, onInstallAnother }: {
  platform: Platform
  onClose: () => void
  onInstallAnother: () => void
}) {
  const [phase, setPhase] = useState<ModalPhase>('preview')
  const [copied, setCopied] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const allStepsDone = completedSteps.size >= platform.steps.length

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Auto-advance to complete when all steps are checked
  useEffect(() => {
    if (allStepsDone && phase === 'install') {
      const t = setTimeout(() => setPhase('complete'), 600)
      return () => clearTimeout(t)
    }
  }, [allStepsDone, phase])

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    // Mark the "paste" step as done (usually step 3)
    const pasteIdx = platform.steps.findIndex(s => s.toLowerCase().includes('paste') || s.toLowerCase().includes('config below'))
    if (pasteIdx >= 0) {
      setCompletedSteps(prev => new Set(prev).add(pasteIdx))
    }
  }, [platform.steps])

  const toggleStep = useCallback((idx: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx); else next.add(idx)
      return next
    })
  }, [])

  const phases = ['preview', 'install', 'complete'] as const

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9000] bg-black/60 backdrop-blur-[6px] flex items-center justify-center p-4"
      style={{ animation: 'fadeIn 0.2s ease' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[20px] max-w-[520px] w-full max-h-[90vh] overflow-y-auto"
        style={{ animation: 'slideUp 0.25s ease', boxShadow: '0 24px 48px rgba(0,0,0,0.3)' }}
      >
        {/* ─── Header (always visible) ─── */}
        <div className="px-8 pt-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center"
            style={{ background: `${platform.color}18`, border: `1px solid ${platform.color}30` }}>
            {LOGO_MAP[platform.id] || <span className="text-[1.1rem] font-extrabold" style={{ color: platform.color }}>{platform.icon}</span>}
          </div>
          <div className="flex-1">
            <div className="font-bold text-[1.05rem] text-[var(--text-primary)]">{platform.name}</div>
            <div className="text-xs text-[var(--text-muted)]">{platform.desc}</div>
          </div>
          <button onClick={onClose} className="bg-transparent border-none text-[var(--text-muted)] cursor-pointer p-1 rounded-md flex">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* ─── Phase indicator ─── */}
        <div className="px-8 pt-4 flex gap-2 items-center">
          {phases.map((p, i) => (
            <div key={p} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[0.65rem] font-bold transition-all duration-300"
                style={{
                  background: phase === p ? platform.color : (phases.indexOf(phase) > i ? '#7ed957' : 'var(--border)'),
                  color: phase === p || phases.indexOf(phase) > i ? '#fff' : 'var(--text-muted)',
                }}
              >
                {phases.indexOf(phase) > i ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : i + 1}
              </div>
              {i < 2 && (
                <div
                  className="w-8 h-0.5 rounded-sm transition-all duration-300"
                  style={{ background: phases.indexOf(phase) > i ? '#7ed957' : 'var(--border)' }}
                />
              )}
            </div>
          ))}
          <span className="text-[0.7rem] text-[var(--text-muted)] ml-auto">
            {phase === 'preview' ? 'Overview' : phase === 'install' ? 'Installing' : 'Done'}
          </span>
        </div>

        <div className="px-8 pt-5 pb-8">

          {/* ═══ PHASE 1: Preview ═══ */}
          {phase === 'preview' && (
            <>
              {/* Connection diagram */}
              <div className="flex items-center justify-center gap-4 py-5">
                <div className="w-11 h-11 rounded-[10px] flex items-center justify-center font-black text-[11px] text-black"
                  style={{ background: 'linear-gradient(135deg, #7ed957, #5cb83a)' }}>0n</div>
                <svg width="48" height="16" viewBox="0 0 48 16" fill="none">
                  <path d="M0 8h40M36 3l6 5-6 5" stroke={platform.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="44" strokeDashoffset="44">
                    <animate attributeName="stroke-dashoffset" from="44" to="0" dur="0.8s" fill="freeze" />
                  </path>
                </svg>
                <div className="w-11 h-11 rounded-[10px] flex items-center justify-center" style={{ background: `${platform.color}20` }}>
                  {LOGO_MAP[platform.id] || <span className="text-[0.9rem] font-extrabold" style={{ color: platform.color }}>{platform.icon}</span>}
                </div>
              </div>

              <p className="text-[var(--text-secondary)] text-sm leading-[1.7] mb-5 text-center">
                {platform.howItConnects}
              </p>

              {/* Feature chips */}
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {platform.features.map((f, i) => (
                  <span key={i} className="px-3 py-1 rounded-[20px] text-xs font-semibold"
                    style={{ background: `${platform.color}12`, border: `1px solid ${platform.color}25`, color: platform.color }}>{f}</span>
                ))}
              </div>

              <button
                onClick={() => setPhase('install')}
                className="w-full py-3.5 rounded-xl border-none text-white font-bold text-[0.95rem] cursor-pointer transition-all duration-150"
                style={{ background: platform.color, boxShadow: `0 4px 16px ${platform.color}40` }}
              >Install on {platform.name}</button>
            </>
          )}

          {/* ═══ PHASE 2: Install Steps ═══ */}
          {phase === 'install' && (
            <>
              <div className="text-[0.8rem] text-[var(--text-muted)] mb-4">
                Follow each step. Click to mark complete.
              </div>

              {/* Steps as checkable items */}
              <div className="flex flex-col gap-2.5 mb-5">
                {platform.steps.map((step, i) => {
                  const done = completedSteps.has(i)
                  return (
                    <button
                      key={i}
                      onClick={() => toggleStep(i)}
                      className="flex gap-3 items-start p-3 rounded-[10px] cursor-pointer transition-all duration-200 text-left"
                      style={{
                        background: done ? `${platform.color}08` : 'transparent',
                        border: `1px solid ${done ? platform.color + '30' : 'var(--border)'}`,
                      }}
                    >
                      <div
                        className="w-[22px] h-[22px] rounded-md shrink-0 flex items-center justify-center transition-all duration-200"
                        style={{
                          background: done ? platform.color : 'transparent',
                          border: `2px solid ${done ? platform.color : 'var(--border)'}`,
                        }}
                      >
                        {done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <span
                        className="text-[0.85rem] leading-[1.5] transition-all duration-200"
                        style={{
                          color: done ? 'var(--text-muted)' : 'var(--text-secondary)',
                          textDecoration: done ? 'line-through' : 'none',
                        }}
                      >{step}</span>
                    </button>
                  )
                })}
              </div>

              {/* Config code block */}
              <div className="bg-[#0d1117] border border-[rgba(255,255,255,0.08)] rounded-[10px] overflow-hidden mb-5">
                <div className="px-3 py-2 flex items-center justify-between bg-[#161b22] border-b border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
                      <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
                      <div className="w-2 h-2 rounded-full bg-[#28c840]" />
                    </div>
                    <span className="text-[0.65rem] text-[#8b949e] ml-1.5">
                      {platform.id === 'terminal' || platform.id === 'http' ? 'Terminal' : platform.configPath.split('/').pop()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(platform.config)}
                    className="px-3 py-1 rounded-md text-[0.7rem] font-semibold cursor-pointer transition-all duration-150"
                    style={{
                      background: copied ? 'rgba(126,217,87,0.25)' : 'rgba(255,255,255,0.08)',
                      border: `1px solid ${copied ? '#7ed95740' : 'rgba(255,255,255,0.1)'}`,
                      color: copied ? '#7ed957' : '#c9d1d9',
                    }}
                  >
                    {copied ? (
                      <span className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        Copied!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                        Click to Copy
                      </span>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 m-0 font-mono text-[0.75rem] leading-[1.6] text-[#7ed957] overflow-auto max-h-[140px]"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}>{platform.config}</pre>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="h-1 rounded-sm bg-[var(--border)] overflow-hidden">
                  <div
                    className="h-full rounded-sm transition-[width] duration-300 ease-out"
                    style={{ background: platform.color, width: `${(completedSteps.size / platform.steps.length) * 100}%` }}
                  />
                </div>
                <div className="text-[0.7rem] text-[var(--text-muted)] mt-1.5 text-right">
                  {completedSteps.size}/{platform.steps.length} steps complete
                </div>
              </div>

              {/* Mark all done button */}
              {!allStepsDone && (
                <button
                  onClick={() => {
                    const all = new Set<number>()
                    platform.steps.forEach((_, i) => all.add(i))
                    setCompletedSteps(all)
                  }}
                  className="w-full py-3 rounded-[10px] bg-transparent font-semibold text-[0.85rem] cursor-pointer transition-all duration-150"
                  style={{ border: `1px solid ${platform.color}40`, color: platform.color }}
                >I&apos;ve completed all steps</button>
              )}
            </>
          )}

          {/* ═══ PHASE 3: Complete ═══ */}
          {phase === 'complete' && (
            <>
              {/* Success animation */}
              <div className="text-center py-4 pb-6">
                <div
                  className="w-[72px] h-[72px] rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{
                    background: `${platform.color}15`,
                    border: `2px solid ${platform.color}`,
                    animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={platform.color} strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="text-[1.2rem] font-bold text-[var(--text-primary)] mb-2">
                  {platform.name} is ready!
                </h3>
                <p className="text-[var(--text-muted)] text-[0.85rem] m-0 leading-[1.6]">
                  0nMCP is now connected. Try: &quot;Send an email with SendGrid&quot;
                </p>
              </div>

              {/* What you get grid */}
              <div className="p-4 mb-5 rounded-[10px] bg-[rgba(126,217,87,0.04)] border border-[rgba(126,217,87,0.12)]">
                <div className="text-[0.7rem] font-bold text-[#7ed957] mb-2 uppercase tracking-[0.05em]">
                  What you now have access to
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {['1,589 AI tools', '102 services', 'CRM (245 tools)', 'Stripe payments', 'Slack & Discord', 'GitHub & Jira', 'OpenAI & Anthropic', 'Encrypted vault'].map((item, i) => (
                    <div key={i} className="flex items-center gap-1 text-[0.72rem] text-[var(--text-muted)]">
                      <div className="w-1 h-1 rounded-full bg-[#7ed957] shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onInstallAnother}
                  className="flex-1 py-3 rounded-[10px] bg-transparent border border-[var(--border)] text-[var(--text-secondary)] font-semibold text-[0.85rem] cursor-pointer"
                >Install Another</button>
                <Link href="/console" className="flex-[2] py-3 rounded-[10px] bg-[#7ed957] border-none text-black font-bold text-[0.85rem] no-underline text-center flex items-center justify-center gap-1.5">
                  Continue to Console
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
      `}</style>
    </div>
  )
}

/* ─── Main Page ─── */
export default function InstallClient({ embedded }: { embedded?: boolean }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const activePlatform = PLATFORMS.find(p => p.id === activeId)

  return (
    <div className={[embedded ? '' : 'min-h-screen bg-[var(--bg-primary)]', 'text-[var(--text-primary)]'].join(' ')}
      style={{ background: embedded ? 'transparent' : undefined }}>

      {/* Hero */}
      <section className="text-center pt-12 px-4 pb-4 max-w-[700px] mx-auto">
        <div className="flex justify-center mb-5">
          <Image src="/brand/0nmcp-logo-dark.svg" alt="0nMCP" width={48} height={48} className="rounded-xl" />
        </div>
        <h1 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold text-[var(--text-primary)] leading-[1.15] mb-4">
          Where do you want to<br /><span className="text-[#7ed957]">install 0nMCP?</span>
        </h1>
        <p className="text-[var(--text-muted)] text-base leading-[1.6]">
          Pick your platform. Paste one config. Get <strong className="text-[var(--text-primary)]">1,589 tools</strong> across <strong className="text-[var(--text-primary)]">102 services</strong> instantly.
        </p>
      </section>

      {/* Platform Grid */}
      <section className="max-w-[800px] mx-auto mt-8 px-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {PLATFORMS.map(p => {
            const isHovered = hoveredId === p.id
            return (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="rounded-xl p-6 cursor-pointer flex flex-col items-center gap-3 transition-all duration-[250ms] cubic-bezier-[0.4,0,0.2,1]"
                style={{
                  background: isHovered ? `${p.color}08` : 'var(--bg-card)',
                  border: `1px solid ${isHovered ? p.color + '30' : 'var(--border)'}`,
                  transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: isHovered ? `0 8px 24px ${p.color}20` : '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-[10px] flex items-center justify-center transition-transform duration-[250ms]"
                  style={{
                    background: `${p.color}20`,
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                  }}
                >{LOGO_MAP[p.id] || <span className="text-[1.25rem] font-extrabold" style={{ color: p.color }}>{p.icon}</span>}</div>
                <div className="font-bold text-[var(--text-primary)] text-[0.95rem]">{p.name}</div>
                <div className="text-[var(--text-muted)] text-xs">{p.desc}</div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Install Modal — entire flow happens here */}
      {activePlatform && (
        <InstallModal
          platform={activePlatform}
          onClose={() => setActiveId(null)}
          onInstallAnother={() => setActiveId(null)}
        />
      )}

      {/* Bottom stats */}
      <section className="text-center py-12 px-4 text-[var(--text-muted)] text-[0.8rem]">
        <p>npm install 0nmcp &nbsp;|&nbsp; MIT Licensed &nbsp;|&nbsp; 5 Patents Pending</p>
      </section>
    </div>
  )
}
