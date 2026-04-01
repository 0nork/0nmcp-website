'use client'

import { useState } from 'react'
import Link from 'next/link'
import { STATS_DISPLAY } from '@/data/stats'

/* ─── Platform definitions ─── */
type PlatformStatus = 'ready' | 'coming-soon'

interface PlatformCard {
  id: string
  name: string
  description: string
  category: string
  status: PlatformStatus
  color: string
  icon: string
  method?: 'config' | 'command' | 'link' | 'plugin'
  config?: string
  command?: string
  link?: string
  linkLabel?: string
}

const PLATFORMS: PlatformCard[] = [
  // ── AI Platforms ──
  {
    id: 'claude-desktop',
    name: 'Claude Desktop',
    description: 'Add 0nMCP as an MCP server in Claude Desktop settings',
    category: 'AI Platforms',
    status: 'ready',
    color: '#a78bfa',
    icon: 'C',
    method: 'config',
    config: JSON.stringify({
      mcpServers: {
        '0nMCP': {
          command: 'npx',
          args: ['-y', '0nmcp@latest'],
        },
      },
    }, null, 2),
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    description: 'Install the 0nMCP skill in your terminal',
    category: 'AI Platforms',
    status: 'ready',
    color: '#ff6b35',
    icon: '>_',
    method: 'command',
    command: 'claude mcp add 0nmcp -- npx -y 0nmcp@latest',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT / 0nGPT',
    description: 'Use 0nMCP inside ChatGPT with our custom GPT',
    category: 'AI Platforms',
    status: 'ready',
    color: '#10a37f',
    icon: 'G',
    method: 'link',
    link: '/downloads/ongpt',
    linkLabel: 'Open 0nGPT',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    description: 'Google Gemini MCP integration',
    category: 'AI Platforms',
    status: 'coming-soon',
    color: '#4285F4',
    icon: 'Ge',
  },
  {
    id: 'grok',
    name: 'Grok',
    description: 'xAI Grok MCP integration',
    category: 'AI Platforms',
    status: 'coming-soon',
    color: '#1DA1F2',
    icon: 'Gk',
  },

  // ── Developer Tools ──
  {
    id: 'cursor',
    name: 'Cursor',
    description: 'Add to your Cursor MCP configuration',
    category: 'Developer Tools',
    status: 'ready',
    color: '#00d4ff',
    icon: 'Cu',
    method: 'config',
    config: JSON.stringify({
      mcpServers: {
        '0nMCP': {
          command: 'npx',
          args: ['-y', '0nmcp@latest'],
        },
      },
    }, null, 2),
  },
  {
    id: 'vscode',
    name: 'VS Code',
    description: 'Add to VS Code MCP settings (Copilot agent mode)',
    category: 'Developer Tools',
    status: 'ready',
    color: '#007ACC',
    icon: 'VS',
    method: 'config',
    config: JSON.stringify({
      'mcp.servers': {
        '0nMCP': {
          command: 'npx',
          args: ['-y', '0nmcp@latest'],
        },
      },
    }, null, 2),
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    description: 'Add to your Windsurf MCP configuration',
    category: 'Developer Tools',
    status: 'ready',
    color: '#06b6d4',
    icon: 'Ws',
    method: 'config',
    config: JSON.stringify({
      mcpServers: {
        '0nMCP': {
          command: 'npx',
          args: ['-y', '0nmcp@latest'],
        },
      },
    }, null, 2),
  },
  {
    id: 'npm',
    name: 'npm CLI',
    description: 'Install globally and run from any terminal',
    category: 'Developer Tools',
    status: 'ready',
    color: '#CB3837',
    icon: 'npm',
    method: 'command',
    command: 'npm install -g 0nmcp',
  },

  // ── Platforms ──
  {
    id: 'wordpress',
    name: 'WordPress / OnPress',
    description: 'Install the OnPress plugin for WordPress integration',
    category: 'Platforms',
    status: 'ready',
    color: '#21759b',
    icon: 'WP',
    method: 'link',
    link: 'https://wpsxo.com/onpress',
    linkLabel: 'Get OnPress Plugin',
  },
  {
    id: 'wpengine',
    name: 'WP Engine',
    description: 'Auto-deploy via GitHub Actions to WP Engine',
    category: 'Platforms',
    status: 'ready',
    color: '#0ecad4',
    icon: 'WE',
    method: 'link',
    link: 'https://github.com/0nork/wpengine-deploy',
    linkLabel: 'View GitHub Action',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Slack bot integration with 0nMCP',
    category: 'Platforms',
    status: 'coming-soon',
    color: '#4A154B',
    icon: 'Sl',
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Discord bot integration with 0nMCP',
    category: 'Platforms',
    status: 'coming-soon',
    color: '#5865F2',
    icon: 'Dc',
  },
  {
    id: 'crm-marketplace',
    name: 'CRM Marketplace',
    description: 'Install directly from the CRM marketplace',
    category: 'Platforms',
    status: 'coming-soon',
    color: '#6EE05A',
    icon: '0n',
  },

  // ── Browser ──
  {
    id: 'chrome',
    name: 'Chrome Extension',
    description: 'Run 0nMCP tools from any browser tab',
    category: 'Browser',
    status: 'ready',
    color: '#4285F4',
    icon: 'Ch',
    method: 'link',
    link: 'https://github.com/0nork/0nmcp-chrome',
    linkLabel: 'View on GitHub',
  },

  // ── Design ──
  {
    id: 'figma',
    name: 'Figma',
    description: 'Design-to-code with OnPress (coming soon)',
    category: 'Design',
    status: 'coming-soon',
    color: '#F24E1E',
    icon: 'Fi',
  },
]

const CATEGORIES = ['AI Platforms', 'Developer Tools', 'Platforms', 'Browser', 'Design']

/* ─── Styles ─── */
const s = {
  page: {
    minHeight: '100vh',
    background: '#f5f5f7',
    color: '#1a1a1a',
    fontFamily: "'Instrument Sans', system-ui, sans-serif",
  } as React.CSSProperties,

  hero: {
    textAlign: 'center' as const,
    padding: '5rem 1.5rem 3rem',
    maxWidth: '800px',
    margin: '0 auto',
  } as React.CSSProperties,

  badge: {
    display: 'inline-block',
    padding: '0.375rem 1rem',
    borderRadius: '999px',
    background: 'rgba(110, 224, 90, 0.1)',
    border: '1px solid rgba(110, 224, 90, 0.3)',
    color: '#3d8a2e',
    fontSize: '0.8125rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    marginBottom: '1.25rem',
  } as React.CSSProperties,

  h1: {
    fontSize: 'clamp(2rem, 5vw, 3.25rem)',
    fontWeight: 800,
    lineHeight: 1.15,
    margin: '0 0 1rem',
    color: '#1a1a1a',
    letterSpacing: '-0.02em',
  } as React.CSSProperties,

  subtitle: {
    fontSize: '1.125rem',
    color: '#6b7280',
    lineHeight: 1.6,
    margin: '0 0 2rem',
    maxWidth: '560px',
    marginLeft: 'auto',
    marginRight: 'auto',
  } as React.CSSProperties,

  statsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2.5rem',
    marginBottom: '2rem',
    flexWrap: 'wrap' as const,
  } as React.CSSProperties,

  stat: {
    textAlign: 'center' as const,
  } as React.CSSProperties,

  statValue: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#1a1a1a',
    fontFamily: "'JetBrains Mono', monospace",
  } as React.CSSProperties,

  statLabel: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    fontWeight: 600,
    marginTop: '0.125rem',
  } as React.CSSProperties,

  ctaButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.875rem 2rem',
    borderRadius: '12px',
    background: '#6EE05A',
    color: '#000',
    fontSize: '1rem',
    fontWeight: 700,
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(110, 224, 90, 0.3), 0 1px 3px rgba(0,0,0,0.1)',
    transition: 'all 0.2s',
  } as React.CSSProperties,

  section: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1.5rem 4rem',
  } as React.CSSProperties,

  categoryLabel: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: '#9ca3af',
    marginBottom: '1rem',
    marginTop: '2.5rem',
  } as React.CSSProperties,

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem',
  } as React.CSSProperties,

  card: (color: string, isComingSoon: boolean): React.CSSProperties => ({
    background: '#fff',
    borderRadius: '14px',
    padding: '1.25rem',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
    opacity: isComingSoon ? 0.5 : 1,
    transition: 'all 0.2s',
    cursor: isComingSoon ? 'default' : 'pointer',
    position: 'relative' as const,
  }),

  iconCircle: (color: string): React.CSSProperties => ({
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: `${color}18`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: color,
    fontSize: '0.8125rem',
    fontWeight: 800,
    fontFamily: "'JetBrains Mono', monospace",
    flexShrink: 0,
  }),

  cardName: {
    fontSize: '0.9375rem',
    fontWeight: 700,
    color: '#1a1a1a',
    margin: 0,
  } as React.CSSProperties,

  cardDesc: {
    fontSize: '0.8125rem',
    color: '#6b7280',
    margin: '0.25rem 0 0',
    lineHeight: 1.5,
  } as React.CSSProperties,

  comingSoonBadge: {
    fontSize: '0.625rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    color: '#9ca3af',
    background: '#f3f4f6',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
  } as React.CSSProperties,

  expandedContent: {
    marginTop: '1rem',
    padding: '0.875rem',
    borderRadius: '10px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    position: 'relative' as const,
  } as React.CSSProperties,

  codeBlock: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.75rem',
    lineHeight: 1.7,
    color: '#374151',
    whiteSpace: 'pre' as const,
    overflowX: 'auto' as const,
    margin: 0,
  } as React.CSSProperties,

  commandBlock: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.8125rem',
    color: '#1a1a1a',
    background: '#f3f4f6',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
  } as React.CSSProperties,

  copyBtn: {
    padding: '0.375rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#374151',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.15s',
  } as React.CSSProperties,

  linkBtn: (color: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    background: `${color}14`,
    color: color,
    fontSize: '0.8125rem',
    fontWeight: 600,
    textDecoration: 'none',
    border: `1px solid ${color}30`,
    transition: 'all 0.15s',
  }),

  bottomCta: {
    textAlign: 'center' as const,
    padding: '4rem 1.5rem 5rem',
    background: 'linear-gradient(180deg, transparent, rgba(110, 224, 90, 0.04))',
  } as React.CSSProperties,
}

/* ─── Component ─── */
export function StartClient() {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function toggleCard(id: string, status: PlatformStatus) {
    if (status === 'coming-soon') return
    setExpanded(prev => prev === id ? null : id)
  }

  return (
    <div style={s.page}>
      {/* ── Hero ── */}
      <div style={s.hero}>
        <div style={s.badge}>TURN IT 0N</div>
        <h1 style={s.h1}>
          Install 0n.<br />Use it everywhere.
        </h1>
        <p style={s.subtitle}>
          {STATS_DISPLAY.tools} tools, {STATS_DISPLAY.services} services, encrypted vault,
          AI brain. One install. Every platform.
        </p>

        <div style={s.statsRow}>
          <div style={s.stat}>
            <div style={s.statValue}>{STATS_DISPLAY.tools}</div>
            <div style={s.statLabel}>Tools</div>
          </div>
          <div style={s.stat}>
            <div style={s.statValue}>{STATS_DISPLAY.services}</div>
            <div style={s.statLabel}>Services</div>
          </div>
          <div style={s.stat}>
            <div style={s.statValue}>{STATS_DISPLAY.capabilities}</div>
            <div style={s.statLabel}>Capabilities</div>
          </div>
          <div style={s.stat}>
            <div style={s.statValue}>16</div>
            <div style={s.statLabel}>Platforms</div>
          </div>
        </div>

        <Link href="/subscribe" style={s.ctaButton}>
          $50 Founders Access
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      {/* ── Platform Cards ── */}
      <div style={s.section}>
        {CATEGORIES.map(category => {
          const items = PLATFORMS.filter(p => p.category === category)
          if (items.length === 0) return null
          return (
            <div key={category}>
              <div style={s.categoryLabel}>{category}</div>
              <div style={s.grid}>
                {items.map(platform => {
                  const isExpanded = expanded === platform.id
                  const isComingSoon = platform.status === 'coming-soon'
                  return (
                    <div
                      key={platform.id}
                      style={{
                        ...s.card(platform.color, isComingSoon),
                        ...(isExpanded ? { boxShadow: `0 4px 20px rgba(0,0,0,0.08), 0 0 0 2px ${platform.color}40` } : {}),
                      }}
                      onClick={() => toggleCard(platform.id, platform.status)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={s.iconCircle(platform.color)}>
                          {platform.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <p style={s.cardName}>{platform.name}</p>
                            {isComingSoon && (
                              <span style={s.comingSoonBadge}>Coming Soon</span>
                            )}
                          </div>
                          <p style={s.cardDesc}>{platform.description}</p>
                        </div>
                        {!isComingSoon && (
                          <svg
                            width="16" height="16" viewBox="0 0 16 16" fill="none"
                            style={{
                              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s',
                              flexShrink: 0,
                              color: '#9ca3af',
                            }}
                          >
                            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>

                      {/* Expanded content */}
                      {isExpanded && !isComingSoon && (
                        <div
                          style={s.expandedContent}
                          onClick={e => e.stopPropagation()}
                        >
                          {platform.method === 'config' && platform.config && (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  Configuration JSON
                                </span>
                                <button
                                  style={s.copyBtn}
                                  onClick={() => handleCopy(platform.config!, platform.id)}
                                >
                                  {copiedId === platform.id ? 'Copied!' : 'Copy'}
                                </button>
                              </div>
                              <pre style={s.codeBlock}>{platform.config}</pre>
                            </>
                          )}

                          {platform.method === 'command' && platform.command && (
                            <div style={s.commandBlock}>
                              <code style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                $ {platform.command}
                              </code>
                              <button
                                style={s.copyBtn}
                                onClick={() => handleCopy(platform.command!, platform.id)}
                              >
                                {copiedId === platform.id ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                          )}

                          {platform.method === 'link' && platform.link && (
                            <a
                              href={platform.link}
                              target={platform.link.startsWith('http') ? '_blank' : undefined}
                              rel={platform.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                              style={s.linkBtn(platform.color)}
                            >
                              {platform.linkLabel || 'Open'}
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M5 3h8v8M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </a>
                          )}

                          {platform.method === 'plugin' && platform.link && (
                            <a
                              href={platform.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={s.linkBtn(platform.color)}
                            >
                              {platform.linkLabel || 'Install Plugin'}
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M8 2v8M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Bottom CTA ── */}
      <div style={s.bottomCta}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#1a1a1a', margin: '0 0 0.75rem' }}>
          Ready to turn it 0n?
        </h2>
        <p style={{ fontSize: '1rem', color: '#6b7280', margin: '0 0 2rem', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>
          Subscribe for {STATS_DISPLAY.tools} tools, {STATS_DISPLAY.services} services,
          encrypted vault, and AI-powered automation across every platform.
        </p>
        <Link href="/subscribe" style={s.ctaButton}>
          Subscribe & Get Started
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
