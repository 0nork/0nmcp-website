'use client'

import { useState } from 'react'

interface Download {
  id: string
  name: string
  description: string
  version: string
  category: 'extension' | 'cli' | 'desktop' | 'plugin'
  platform: string
  size: string
  icon: string
  color: string
  downloadUrl: string | null
  repoUrl: string | null
  status: 'available' | 'coming_soon' | 'beta'
  features: string[]
}

const DOWNLOADS: Download[] = [
  {
    id: 'social0n-linkedin',
    name: 'social0n — LinkedIn',
    description: 'AI-powered LinkedIn companion. Compose messages, scrape profiles, manage leads, create content, and sync to CRM — all from a side panel.',
    version: '1.0.0',
    category: 'extension',
    platform: 'Chrome / Chromium',
    size: '~150 KB',
    icon: 'in',
    color: '#0077b5',
    downloadUrl: null,
    repoUrl: 'https://github.com/0nork/0n-linkedin',
    status: 'beta',
    features: [
      '8 AI message types (Auto, Gap, Elevate, Data Drop, Contrarian, Tool Response)',
      'One-click profile scraper',
      'Lead management with CSV export',
      '7 content post styles with AI drafting',
      'Voice profile learning (adapts to your tone)',
      'CRM sync via 0nMCP (245 tools)',
      'Dual mode: cloud (0nmcp.com) or local (0nmcp serve)',
    ],
  },
  {
    id: '0nmcp-cli',
    name: '0nMCP CLI',
    description: 'Universal AI API Orchestrator. 1,171 tools across 54 services. Run workflows, manage credentials, execute tasks from your terminal.',
    version: '2.6.0',
    category: 'cli',
    platform: 'macOS / Linux / Windows',
    size: '~2 MB',
    icon: '0n',
    color: '#7ed957',
    downloadUrl: null,
    repoUrl: 'https://github.com/0nork/0nMCP',
    status: 'available',
    features: [
      '1,171 tools across 54 services',
      'MCP protocol (works with Claude, Cursor, Windsurf)',
      'Encrypted vault (AES-256-GCM)',
      '.0n workflow runtime',
      'HTTP server mode for integrations',
      'Plugin builder + registry',
    ],
  },
  {
    id: '0ncommand',
    name: '0n Command Center',
    description: 'Full admin dashboard — 15 engines for CRM, GitHub, Reddit, LinkedIn, blog, marketplace, workflows, and more.',
    version: '4.3.0',
    category: 'desktop',
    platform: 'macOS (web also available)',
    size: '~5 MB',
    icon: 'cmd',
    color: '#00d4ff',
    downloadUrl: null,
    repoUrl: null,
    status: 'coming_soon',
    features: [
      '15 operational engines',
      '80+ API routes',
      'Reddit scanning + engagement',
      'LinkedIn campaign management',
      'Blog content generation',
      'OAuth for 7 providers',
    ],
  },
  {
    id: 'social0n-reddit',
    name: 'social0n — Reddit',
    description: 'AI Reddit engagement engine. Monitor subreddits, detect opportunities, compose replies, track karma.',
    version: '0.1.0',
    category: 'extension',
    platform: 'Chrome / Chromium',
    size: 'TBD',
    icon: 'r/',
    color: '#ff4500',
    downloadUrl: null,
    repoUrl: null,
    status: 'coming_soon',
    features: [
      'Subreddit monitoring',
      'Opportunity detection via AI',
      'Reply composition with voice profile',
      'Karma tracking + analytics',
    ],
  },
  {
    id: 'social0n-x',
    name: 'social0n — X / Twitter',
    description: 'AI-powered X companion. Draft tweets, manage threads, track engagement, schedule posts.',
    version: '0.1.0',
    category: 'extension',
    platform: 'Chrome / Chromium',
    size: 'TBD',
    icon: '𝕏',
    color: '#000000',
    downloadUrl: null,
    repoUrl: null,
    status: 'coming_soon',
    features: [
      'Tweet composer with AI',
      'Thread builder',
      'Engagement tracking',
      'Scheduled posting',
    ],
  },
]

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'extension', label: 'Extensions' },
  { key: 'cli', label: 'CLI Tools' },
  { key: 'desktop', label: 'Desktop' },
  { key: 'plugin', label: 'Plugins' },
]

export default function DownloadsPage() {
  const [filter, setFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filtered = filter === 'all'
    ? DOWNLOADS
    : DOWNLOADS.filter(d => d.category === filter)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f0f0f0', fontFamily: 'var(--font-display, inherit)' }}>
          Downloads
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '0.5rem' }}>
          Extensions, CLI tools, and desktop apps from the 0n ecosystem.
        </p>
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1.5rem', padding: '0.25rem', background: '#111', borderRadius: '0.625rem' }}>
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
              background: filter === c.key ? '#1a1a1a' : 'transparent',
              color: filter === c.key ? '#7ed957' : '#666',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Download cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.map(d => {
          const expanded = expandedId === d.id
          return (
            <div
              key={d.id}
              style={{
                background: '#111',
                border: '1px solid #1a1a1a',
                borderRadius: '1rem',
                overflow: 'hidden',
                transition: 'border-color 0.2s',
              }}
            >
              {/* Header */}
              <div
                onClick={() => setExpandedId(expanded ? null : d.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.25rem',
                  cursor: 'pointer',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '0.75rem',
                  background: `${d.color}15`,
                  border: `1px solid ${d.color}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: d.icon.length > 2 ? '0.7rem' : '1rem',
                  color: d.color,
                  flexShrink: 0,
                  fontFamily: 'var(--font-mono, monospace)',
                }}>
                  {d.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f0f0f0' }}>{d.name}</span>
                    <span style={{
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: 3,
                      fontFamily: 'var(--font-mono, monospace)',
                      letterSpacing: '0.03em',
                      background: d.status === 'available' ? 'rgba(126,217,87,0.1)' : d.status === 'beta' ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.05)',
                      color: d.status === 'available' ? '#7ed957' : d.status === 'beta' ? '#00d4ff' : '#555',
                      border: `1px solid ${d.status === 'available' ? 'rgba(126,217,87,0.2)' : d.status === 'beta' ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                      {d.status === 'available' ? 'AVAILABLE' : d.status === 'beta' ? 'BETA' : 'COMING SOON'}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'var(--font-mono, monospace)' }}>v{d.version}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: '#777', marginTop: '0.25rem', lineHeight: 1.4 }}>
                    {d.description}
                  </p>
                </div>

                {/* Expand arrow */}
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"
                  style={{ flexShrink: 0, transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>

              {/* Expanded content */}
              {expanded && (
                <div style={{ padding: '0 1.25rem 1.25rem', borderTop: '1px solid #1a1a1a', paddingTop: '1rem' }}>
                  {/* Meta row */}
                  <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {[
                      { label: 'Platform', value: d.platform },
                      { label: 'Size', value: d.size },
                      { label: 'Category', value: d.category },
                    ].map(m => (
                      <div key={m.label}>
                        <div style={{ fontSize: '0.6rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{m.label}</div>
                        <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: 2 }}>{m.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Features */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: '0.5rem' }}>Features</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {d.features.map((f, i) => (
                        <li key={i} style={{ fontSize: '0.8rem', color: '#999', padding: '0.2rem 0', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                          <span style={{ color: d.color, fontSize: '0.5rem' }}>●</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {d.status === 'available' && d.category === 'cli' && (
                      <button
                        onClick={() => navigator.clipboard.writeText('npm install -g 0nmcp')}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          background: '#7ed957',
                          color: '#0a0a0a',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: 'var(--font-mono, monospace)',
                        }}
                      >
                        npm install -g 0nmcp
                      </button>
                    )}
                    {d.status === 'beta' && d.repoUrl && (
                      <a
                        href={d.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          border: `1px solid ${d.color}40`,
                          background: `${d.color}10`,
                          color: d.color,
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          textDecoration: 'none',
                        }}
                      >
                        Download from GitHub
                      </a>
                    )}
                    {d.repoUrl && (
                      <a
                        href={d.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '0.5rem',
                          border: '1px solid #262626',
                          background: 'transparent',
                          color: '#888',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          textDecoration: 'none',
                        }}
                      >
                        View Source
                      </a>
                    )}
                    {d.status === 'coming_soon' && (
                      <span style={{ fontSize: '0.8rem', color: '#444', padding: '0.5rem 0' }}>
                        Coming soon — join the waitlist in the forum
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.75rem', color: '#333' }}>
        All downloads are open source under MIT license — built by RocketOpp LLC
      </div>
    </div>
  )
}
