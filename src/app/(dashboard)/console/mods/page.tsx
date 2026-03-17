'use client'

/**
 * MODs Page — APEX-style product/module listing
 *
 * Featured hero cards for high-ticket items (Site Builder, SXO)
 * 3-column grid for standard modules
 * Category filter pills, status badges, version tags
 */

import { useState } from 'react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Mod {
  id: string
  name: string
  description: string
  category: string
  version: string
  status: 'active' | 'coming_soon' | 'beta'
  featured?: boolean
  iconBg: string       // gradient or solid for the icon square
  iconEmoji?: string   // fallback
  price?: string       // null = included
  href?: string
}

// ─── Product catalog ────────────────────────────────────────────────────────

const MODS: Mod[] = [
  // ── Featured (large cards) ──
  {
    id: 'site-builder',
    name: 'Website Builder',
    description: 'AI-powered website generation with CRM pipeline integration, domain routing, and automated deployment. Full web0n engine — describe your site, get it live.',
    category: 'Build',
    version: 'v2.0',
    status: 'active',
    featured: true,
    iconBg: 'linear-gradient(135deg, #7ed957, #00d4ff)',
    iconEmoji: '',
    price: '$197/site',
    href: '/console/site-builder',
  },
  {
    id: 'sxo-plugin',
    name: 'SXO Plugin',
    description: 'Search Experience Optimization engine. Automated site audits, Core Web Vitals monitoring, AI-generated SEO content, and CRO9 conversion tracking. Full sxowebsite.com integration.',
    category: 'SEO',
    version: 'v1.5',
    status: 'active',
    featured: true,
    iconBg: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    iconEmoji: '',
    price: '$97/mo',
    href: '/products/cro9',
  },
  // ── Standard modules (grid) ──
  {
    id: 'social0n',
    name: 'Social0n',
    description: 'Multi-platform social media management. Schedule, publish, and analyze across LinkedIn, X, Instagram, Reddit.',
    category: 'Social',
    version: 'v1.2',
    status: 'active',
    iconBg: 'linear-gradient(135deg, #a78bfa, #ec4899)',
    iconEmoji: '',
    href: '/console/social',
  },
  {
    id: 'operations',
    name: 'Operations Engine',
    description: 'CRM pipeline automation, lead routing, task assignment, and workflow orchestration via .0n SWITCH files.',
    category: 'Automation',
    version: 'v1.0',
    status: 'active',
    iconBg: 'linear-gradient(135deg, #00d4ff, #3b82f6)',
    iconEmoji: '',
    href: '/console/operations',
  },
  {
    id: 'ai-training',
    name: 'AI Brain Training',
    description: 'Council-based knowledge accumulation. 7 AI personas evaluate and score training batches. Self-improving knowledge base.',
    category: 'AI',
    version: 'v0.9',
    status: 'beta',
    iconBg: 'linear-gradient(135deg, #f472b6, #7c3aed)',
    iconEmoji: '',
    href: '/console/tools/ai-training',
  },
  {
    id: 'linkedin-mod',
    name: 'LinkedIn Outreach',
    description: 'Automated LinkedIn engagement — profile visits, connection requests, and InMail sequences powered by AI.',
    category: 'Social',
    version: 'v1.0',
    status: 'active',
    iconBg: 'linear-gradient(135deg, #0077b5, #00a0dc)',
    iconEmoji: '',
    href: '/console/linkedin',
  },
  {
    id: 'email-signature',
    name: 'Email Signatures',
    description: 'Professional HTML email signatures with brand consistency. Auto-generate from CRM contact data.',
    category: 'Tools',
    version: 'v1.0',
    status: 'active',
    iconBg: 'linear-gradient(135deg, #10b981, #059669)',
    iconEmoji: '',
    href: '/console/tools/email-signature',
  },
  {
    id: 'qr-code',
    name: 'QR Code Generator',
    description: 'Dynamic QR codes with tracking, custom branding, and scan analytics. Link to any URL or workflow.',
    category: 'Tools',
    version: 'v1.0',
    status: 'active',
    iconBg: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    iconEmoji: '',
    href: '/console/tools/qr-code',
  },
  {
    id: 'crew-manager',
    name: '0nCrew',
    description: 'Multi-agent team management. Assign AI personas to different tasks and coordinate execution across services.',
    category: 'AI',
    version: 'v0.5',
    status: 'coming_soon',
    iconBg: 'linear-gradient(135deg, #f97316, #dc2626)',
    iconEmoji: '',
    href: '/console/crew',
  },
  {
    id: 'reporting',
    name: 'Reporting Dashboard',
    description: 'Analytics and reporting across all connected services. Pipeline metrics, social stats, execution history.',
    category: 'Analytics',
    version: 'v1.0',
    status: 'active',
    iconBg: 'linear-gradient(135deg, #14b8a6, #06b6d4)',
    iconEmoji: '',
    href: '/console/reporting',
  },
  {
    id: 'migrate',
    name: 'Migration Tool',
    description: 'Import data from other platforms. CSV, JSON, and API-based migration with field mapping and validation.',
    category: 'Tools',
    version: 'v1.0',
    status: 'active',
    iconBg: 'linear-gradient(135deg, #78716c, #a8a29e)',
    iconEmoji: '',
    href: '/console/migrate',
  },
  {
    id: 'convert',
    name: 'Config Converter',
    description: 'Convert between AI platform configs. Import OpenAI, export Gemini, translate between any MCP format.',
    category: 'Tools',
    version: 'v1.0',
    status: 'active',
    iconBg: 'linear-gradient(135deg, #84cc16, #22c55e)',
    iconEmoji: '',
    href: '/console/convert',
  },
]

const CATEGORIES = ['All', ...Array.from(new Set(MODS.map(m => m.category)))]

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  active:      { bg: 'rgba(126,217,87,0.12)', color: '#7ed957', label: 'Active' },
  beta:        { bg: 'rgba(167,139,250,0.12)', color: '#a78bfa', label: 'Beta' },
  coming_soon: { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', label: 'Soon' },
}

// ─── Components ─────────────────────────────────────────────────────────────

function ModIcon({ mod, size = 40 }: { mod: Mod; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.25,
      background: mod.iconBg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.5, lineHeight: 1,
      boxShadow: `0 4px 12px rgba(0,0,0,0.3)`,
      flexShrink: 0,
    }}>
      {mod.iconEmoji}
    </div>
  )
}

function FeaturedCard({ mod }: { mod: Mod }) {
  const [hovered, setHovered] = useState(false)
  const status = STATUS_STYLES[mod.status]

  return (
    <a
      href={mod.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '24px',
        borderRadius: 16,
        background: hovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hovered ? 'rgba(126,217,87,0.2)' : 'rgba(255,255,255,0.06)'}`,
        textDecoration: 'none',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.3)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Gradient accent line at top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: mod.iconBg, opacity: hovered ? 1 : 0.5,
        transition: 'opacity 0.25s',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <ModIcon mod={mod} size={52} />
        <div style={{ display: 'flex', gap: 6 }}>
          <span style={{
            fontSize: 10, padding: '3px 8px', borderRadius: 5,
            background: status.bg, color: status.color,
            fontWeight: 700, letterSpacing: '.03em',
          }}>
            {status.label}
          </span>
          <span style={{
            fontSize: 10, padding: '3px 8px', borderRadius: 5,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#9aa0a8', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace",
          }}>
            {mod.version}
          </span>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#e8eaed', lineHeight: 1.3 }}>
          {mod.name}
        </div>
        <div style={{
          fontSize: 13, color: '#9aa0a8', marginTop: 6,
          lineHeight: 1.6, maxWidth: 420,
        }}>
          {mod.description}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        {mod.price && (
          <span style={{
            fontSize: 15, fontWeight: 700, color: '#7ed957',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {mod.price}
          </span>
        )}
        <span style={{
          fontSize: 12, fontWeight: 600,
          color: hovered ? '#7ed957' : '#5f6672',
          transition: 'color 0.2s',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          Open
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </div>
    </a>
  )
}

function ModCard({ mod }: { mod: Mod }) {
  const [hovered, setHovered] = useState(false)
  const status = STATUS_STYLES[mod.status]

  return (
    <a
      href={mod.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: '16px',
        borderRadius: 12,
        background: hovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'}`,
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-1px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <ModIcon mod={mod} size={40} />
        <span style={{
          fontSize: 9, padding: '2px 6px', borderRadius: 4,
          background: status.bg, color: status.color,
          fontWeight: 700, letterSpacing: '.03em',
        }}>
          {status.label}
        </span>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e8eaed' }}>
            {mod.name}
          </span>
          <span style={{
            fontSize: 9, color: '#5f6672',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {mod.version}
          </span>
        </div>
        <div style={{
          fontSize: 12, color: '#7a8290', marginTop: 4,
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical' as const,
          overflow: 'hidden',
        }}>
          {mod.description}
        </div>
      </div>

      <div style={{
        fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '.06em', color: '#5f6672',
        marginTop: 'auto',
      }}>
        {mod.category}
      </div>
    </a>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ModsPage() {
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = MODS.filter(m => {
    const matchCat = category === 'All' || m.category === category
    const matchSearch = search === '' || m.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const featured = filtered.filter(m => m.featured)
  const standard = filtered.filter(m => !m.featured)

  return (
    <div style={{ padding: '24px 28px 96px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: 24, fontWeight: 800, color: '#e8eaed',
          letterSpacing: '-0.02em', margin: 0,
        }}>
          MODs
        </h1>
        <p style={{ fontSize: 14, color: '#7a8290', marginTop: 6 }}>
          Modules and plugins that extend your 0nMCP console.
          {' '}<span style={{ color: '#7ed957', fontWeight: 600 }}>{MODS.filter(m => m.status === 'active').length} active</span>
          {' '} · {MODS.length} total
        </p>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 14px', borderRadius: 10,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          flex: '1 1 220px', maxWidth: 320,
        }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#5f6672" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={11} cy={11} r={8} /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search modules..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 13, color: '#e8eaed', fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                fontSize: 12, padding: '6px 14px', borderRadius: 8,
                background: category === cat ? 'rgba(126,217,87,0.12)' : 'transparent',
                border: category === cat
                  ? '1px solid rgba(126,217,87,0.3)'
                  : '1px solid rgba(255,255,255,0.06)',
                color: category === cat ? '#7ed957' : '#7a8290',
                cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: category === cat ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured cards — 2-column */}
      {featured.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}>
          {featured.map(m => <FeaturedCard key={m.id} mod={m} />)}
        </div>
      )}

      {/* Standard grid — 3-column */}
      {standard.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 12,
        }}>
          {standard.map(m => <ModCard key={m.id} mod={m} />)}
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 0',
          color: '#5f6672', fontSize: 14,
        }}>
          No modules match your search.
        </div>
      )}
    </div>
  )
}
