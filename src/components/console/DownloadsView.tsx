'use client'

import { useState } from 'react'
import { Download, Terminal, FileText, Lock, PenLine, Share2, Search, Package, Copy, Check, ExternalLink } from 'lucide-react'

type Category = 'all' | 'tools' | 'apps' | 'templates' | 'brain'
type BadgeType = 'free' | 'pro' | 'purchased'

interface DownloadItem {
  id: string
  name: string
  description: string
  category: Category
  badge: BadgeType
  icon: React.ReactNode
  action: 'install' | 'download' | 'pro'
  installCommand?: string
  link?: string
}

const G = '#7ed957'
const P = '#a78bfa'
const C = '#00d4ff'

const BADGE_COLORS: Record<BadgeType, { bg: string; text: string; border: string }> = {
  free: { bg: 'rgba(126,217,87,0.1)', text: G, border: `${G}25` },
  pro: { bg: 'rgba(0,212,255,0.1)', text: C, border: `${C}25` },
  purchased: { bg: 'rgba(167,139,250,0.1)', text: P, border: `${P}25` },
}

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'tools', label: 'Tools' },
  { key: 'apps', label: 'Apps' },
  { key: 'templates', label: 'Templates' },
  { key: 'brain', label: 'Brain Files' },
]

const DOWNLOADS: DownloadItem[] = [
  {
    id: '0nmcp-cli',
    name: '0nMCP CLI',
    description: 'The core MCP server — universal AI API orchestrator with 1,100+ tools across 54 services. Connect AI to everything.',
    category: 'tools',
    badge: 'free',
    icon: <Terminal size={20} />,
    action: 'install',
    installCommand: 'npm install -g 0nmcp',
    link: 'https://www.npmjs.com/package/0nmcp',
  },
  {
    id: 'seo-engine',
    name: 'Q&A SEO Distribution Engine',
    description: 'Multi-platform content distribution engine. Auto-publish optimized Q&A content to Dev.to, LinkedIn, Reddit, and more.',
    category: 'apps',
    badge: 'pro',
    icon: <Search size={20} />,
    action: 'pro',
  },
  {
    id: '0n-spec',
    name: '.0n Standard Spec',
    description: 'Template files and documentation for the .0n universal config format. Schemas, examples, and the spec reference.',
    category: 'templates',
    badge: 'free',
    icon: <FileText size={20} />,
    action: 'install',
    installCommand: 'npm install -g 0n-spec',
    link: 'https://www.npmjs.com/package/0n-spec',
  },
  {
    id: '0nvault',
    name: '0nVault Container System',
    description: 'Encrypted credential storage with AES-256-GCM, multi-party escrow, and the patent-pending Seal of Truth verification.',
    category: 'tools',
    badge: 'free',
    icon: <Lock size={20} />,
    action: 'download',
    link: 'https://github.com/0nork/0nMCP',
  },
  {
    id: 'blog-generator',
    name: 'Blog Auto-Generator',
    description: 'AI blog engine with SVG hero images. Generate, optimize, and publish SEO-ready blog posts automatically.',
    category: 'apps',
    badge: 'pro',
    icon: <PenLine size={20} />,
    action: 'pro',
  },
  {
    id: 'social-publisher',
    name: 'Social Publisher',
    description: 'Multi-platform social posting tool. Schedule and publish to Twitter/X, LinkedIn, Dev.to, and Reddit from one interface.',
    category: 'apps',
    badge: 'pro',
    icon: <Share2 size={20} />,
    action: 'pro',
  },
]

export function DownloadsView() {
  const [category, setCategory] = useState<Category>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const filtered = DOWNLOADS.filter(d => {
    if (category !== 'all' && d.category !== category) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
    }
    return true
  })

  const handleCopy = async (id: string, command: string) => {
    try {
      await navigator.clipboard.writeText(command)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch { /* ignore */ }
  }

  const handleAction = (item: DownloadItem) => {
    if (item.action === 'pro') {
      // Navigate to store/upgrade
      window.location.href = '/console?view=store'
      return
    }
    if (item.link) {
      window.open(item.link, '_blank')
    }
  }

  return (
    <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', maxWidth: 900, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Download size={20} style={{ color: G }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#e8eaed', margin: 0 }}>Downloads</h2>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#808090', margin: 0 }}>
          Access tools, apps, and products. Install CLI tools, download templates, or unlock Pro features.
        </p>
      </div>

      {/* Search + Filters */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap',
      }}>
        <div style={{
          flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', borderRadius: 8,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Search size={14} style={{ color: '#4a4a5a', flexShrink: 0 }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search downloads..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              color: '#e8eaed', fontSize: '0.8rem', fontFamily: 'inherit',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              style={{
                padding: '6px 14px', borderRadius: 7,
                background: category === c.key ? `${G}12` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${category === c.key ? `${G}30` : 'rgba(255,255,255,0.06)'}`,
                color: category === c.key ? G : '#808090',
                fontSize: '0.7rem', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Downloads Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Package size={32} style={{ color: '#2a2a3a', margin: '0 auto 0.75rem' }} />
          <p style={{ fontSize: '0.8rem', color: '#4a4a5a', margin: 0 }}>
            No downloads match your search.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {filtered.map(item => (
            <div key={item.id} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12,
              padding: '1.25rem',
              display: 'flex', flexDirection: 'column', gap: 12,
              transition: 'border-color 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.12)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)' }}
            >
              {/* Top row: icon + badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${BADGE_COLORS[item.badge].text}10`,
                  border: `1px solid ${BADGE_COLORS[item.badge].border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: BADGE_COLORS[item.badge].text,
                }}>
                  {item.icon}
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: 6,
                  background: BADGE_COLORS[item.badge].bg,
                  color: BADGE_COLORS[item.badge].text,
                  fontSize: '0.6rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  border: `1px solid ${BADGE_COLORS[item.badge].border}`,
                }}>
                  {item.badge}
                </span>
              </div>

              {/* Name + description */}
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e8eaed', margin: '0 0 4px 0' }}>
                  {item.name}
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#808090', margin: 0, lineHeight: 1.5 }}>
                  {item.description}
                </p>
              </div>

              {/* Install command (if applicable) */}
              {item.installCommand && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 10px', borderRadius: 7,
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <code style={{
                    flex: 1, fontSize: '0.7rem', color: G,
                    fontFamily: 'var(--font-mono)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.installCommand}
                  </code>
                  <button
                    onClick={() => handleCopy(item.id, item.installCommand!)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: copiedId === item.id ? G : '#4a4a5a',
                      padding: 2, display: 'flex', alignItems: 'center',
                      transition: 'color 0.15s',
                    }}
                  >
                    {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              )}

              {/* Action button */}
              <button
                onClick={() => handleAction(item)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '9px 16px', borderRadius: 8,
                  background: item.action === 'pro'
                    ? `${C}10`
                    : `${G}10`,
                  border: `1px solid ${item.action === 'pro' ? `${C}30` : `${G}30`}`,
                  color: item.action === 'pro' ? C : G,
                  fontSize: '0.8rem', fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s',
                  marginTop: 'auto',
                }}
                onMouseEnter={e => {
                  const color = item.action === 'pro' ? C : G
                  e.currentTarget.style.background = `${color}18`
                  e.currentTarget.style.borderColor = `${color}50`
                }}
                onMouseLeave={e => {
                  const color = item.action === 'pro' ? C : G
                  e.currentTarget.style.background = `${color}10`
                  e.currentTarget.style.borderColor = `${color}30`
                }}
              >
                {item.action === 'install' && <Terminal size={14} />}
                {item.action === 'download' && <Download size={14} />}
                {item.action === 'pro' && <ExternalLink size={14} />}
                {item.action === 'install' ? 'Install' : item.action === 'download' ? 'Download' : 'Get Pro'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
