'use client'

import Link from 'next/link'

const tools = [
  {
    name: 'QR Code Generator',
    description: 'Generate QR codes for URLs, text, WiFi networks, or contact cards. Download as PNG or copy SVG.',
    href: '/console/tools/qr-code',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="8" height="8" rx="1" />
        <rect x="14" y="2" width="8" height="8" rx="1" />
        <rect x="2" y="14" width="8" height="8" rx="1" />
        <rect x="14" y="14" width="4" height="4" />
        <rect x="20" y="14" width="2" height="2" />
        <rect x="14" y="20" width="2" height="2" />
        <rect x="20" y="20" width="2" height="2" />
        <rect x="5" y="5" width="2" height="2" />
        <rect x="17" y="5" width="2" height="2" />
        <rect x="5" y="17" width="2" height="2" />
      </svg>
    ),
  },
  {
    name: 'AI Training',
    description: 'Council Arena — 7 AI personas reason independently on any question, then synthesize into a unified verdict.',
    href: '/console/tools/ai-training',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.57-3.25 3.92L12 10v2" />
        <circle cx="12" cy="16" r="4" />
        <path d="M8.5 16H4" />
        <path d="M20 16h-4.5" />
        <path d="M12 20v2" />
        <path d="M9 13.5 6 11" />
        <path d="M15 13.5l3-2.5" />
      </svg>
    ),
  },
]

export default function ToolsPage() {
  return (
    <div style={{ padding: '24px 32px', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
        Tools
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32 }}>
        Utilities and instruments for the 0nMCP console.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              padding: 20,
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent, #7ed957)'
              e.currentTarget.style.background = 'rgba(126,217,87,0.04)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.background = 'var(--bg-card)'
            }}
          >
            <div style={{ color: 'var(--accent, #7ed957)' }}>{tool.icon}</div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                {tool.name}
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                {tool.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
