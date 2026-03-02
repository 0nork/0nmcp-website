'use client'

import { useState, useEffect } from 'react'

interface SitemapEntry {
  url: string
  path: string
  category: string
  type: 'static' | 'ssg' | 'dynamic' | 'programmatic'
  priority: number
}

const STATIC_PAGES: Omit<SitemapEntry, 'url'>[] = [
  // Core
  { path: '/', category: 'Core', type: 'static', priority: 1.0 },
  { path: '/0n-standard', category: 'Core', type: 'static', priority: 0.7 },
  { path: '/console', category: 'Core', type: 'dynamic', priority: 0.9 },
  { path: '/go', category: 'Core', type: 'static', priority: 0.8 },

  // Auth
  { path: '/login', category: 'Auth', type: 'static', priority: 0.5 },
  { path: '/signup', category: 'Auth', type: 'static', priority: 0.6 },
  { path: '/forgot-password', category: 'Auth', type: 'static', priority: 0.3 },
  { path: '/reset-password', category: 'Auth', type: 'static', priority: 0.3 },
  { path: '/0nboarding', category: 'Auth', type: 'dynamic', priority: 0.4 },
  { path: '/account', category: 'Auth', type: 'dynamic', priority: 0.4 },

  // Products
  { path: '/products/social0n', category: 'Products', type: 'static', priority: 0.7 },
  { path: '/products/app0n', category: 'Products', type: 'static', priority: 0.7 },
  { path: '/products/web0n', category: 'Products', type: 'static', priority: 0.7 },
  { path: '/store/onork-mini', category: 'Products', type: 'static', priority: 0.7 },

  // Community
  { path: '/community', category: 'Community', type: 'static', priority: 0.7 },
  { path: '/forum', category: 'Community', type: 'dynamic', priority: 0.8 },
  { path: '/sponsor', category: 'Community', type: 'static', priority: 0.5 },
  { path: '/report', category: 'Community', type: 'static', priority: 0.4 },

  // Security
  { path: '/security', category: 'Security', type: 'static', priority: 0.7 },
  { path: '/security/vault', category: 'Security', type: 'static', priority: 0.7 },
  { path: '/security/layers', category: 'Security', type: 'static', priority: 0.6 },
  { path: '/security/escrow', category: 'Security', type: 'static', priority: 0.6 },
  { path: '/security/seal-of-truth', category: 'Security', type: 'static', priority: 0.6 },
  { path: '/security/transfer', category: 'Security', type: 'static', priority: 0.6 },
  { path: '/security/patent', category: 'Security', type: 'static', priority: 0.6 },

  // Tools
  { path: '/builder', category: 'Tools', type: 'static', priority: 0.7 },
  { path: '/convert', category: 'Tools', type: 'static', priority: 0.8 },
  { path: '/convert/openai', category: 'Tools', type: 'static', priority: 0.7 },
  { path: '/convert/gemini', category: 'Tools', type: 'static', priority: 0.7 },
  { path: '/convert/openclaw', category: 'Tools', type: 'static', priority: 0.7 },
  { path: '/examples', category: 'Tools', type: 'static', priority: 0.6 },
  { path: '/downloads', category: 'Tools', type: 'static', priority: 0.5 },

  // SEO / Marketing
  { path: '/turn-it-on', category: 'SEO Hub', type: 'static', priority: 0.95 },
  { path: '/integrations', category: 'SEO Hub', type: 'static', priority: 0.8 },
  { path: '/glossary', category: 'SEO Hub', type: 'static', priority: 0.7 },
  { path: '/compare', category: 'SEO Hub', type: 'static', priority: 0.7 },
  { path: '/learn', category: 'SEO Hub', type: 'static', priority: 0.7 },

  // Marketplace
  { path: '/marketplace', category: 'Marketplace', type: 'dynamic', priority: 0.8 },
  { path: '/connect', category: 'Marketplace', type: 'static', priority: 0.6 },
  { path: '/partners', category: 'Marketplace', type: 'static', priority: 0.5 },

  // Legal / Meta
  { path: '/legal', category: 'Meta', type: 'static', priority: 0.3 },
  { path: '/app', category: 'Meta', type: 'static', priority: 0.4 },
  { path: '/services', category: 'Meta', type: 'static', priority: 0.5 },
]

const CATEGORIES = [
  'Core', 'Auth', 'Products', 'Community', 'Security',
  'Tools', 'SEO Hub', 'Marketplace', 'Meta',
  'Programmatic: Services', 'Programmatic: Capabilities',
  'Programmatic: Integrations', 'Programmatic: Glossary',
  'Programmatic: Comparisons', 'Dynamic: Forum', 'Dynamic: Profiles',
  'Dynamic: Marketplace', 'Dynamic: Learn',
]

const CATEGORY_COLORS: Record<string, string> = {
  'Core': '#7ed957',
  'Auth': '#8888a0',
  'Products': '#00d4ff',
  'Community': '#a78bfa',
  'Security': '#ef4444',
  'Tools': '#fbbf24',
  'SEO Hub': '#7ed957',
  'Marketplace': '#f97316',
  'Meta': '#55556a',
  'Programmatic: Services': '#7ed957',
  'Programmatic: Capabilities': '#7ed957',
  'Programmatic: Integrations': '#00d4ff',
  'Programmatic: Glossary': '#a78bfa',
  'Programmatic: Comparisons': '#fbbf24',
  'Dynamic: Forum': '#a78bfa',
  'Dynamic: Profiles': '#00d4ff',
  'Dynamic: Marketplace': '#f97316',
  'Dynamic: Learn': '#7ed957',
}

interface DynamicCounts {
  services: number
  capabilities: number
  integrations: number
  glossary: number
  comparisons: number
  threads: number
  profiles: number
  groups: number
  listings: number
  lessons: number
}

export function AdminSitemap() {
  const [filter, setFilter] = useState('')
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(CATEGORIES))
  const [dynamicCounts, setDynamicCounts] = useState<DynamicCounts | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/sitemap-stats')
      .then(r => r.json())
      .then(data => {
        setDynamicCounts(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const base = 'https://0nmcp.com'

  // Build full entries list
  const allEntries: SitemapEntry[] = [
    ...STATIC_PAGES.map(p => ({ ...p, url: `${base}${p.path}` })),
  ]

  // Add programmatic page summaries
  if (dynamicCounts) {
    for (let i = 0; i < (dynamicCounts.services || 0); i++) {
      allEntries.push({ path: `/turn-it-on/[service-${i + 1}]`, url: '', category: 'Programmatic: Services', type: 'programmatic', priority: 0.85 })
    }
    for (let i = 0; i < (dynamicCounts.capabilities || 0); i++) {
      allEntries.push({ path: `/turn-it-on/[capability-${i + 1}]`, url: '', category: 'Programmatic: Capabilities', type: 'programmatic', priority: 0.8 })
    }
    for (let i = 0; i < (dynamicCounts.integrations || 0); i++) {
      allEntries.push({ path: `/integrations/[service-${i + 1}]`, url: '', category: 'Programmatic: Integrations', type: 'programmatic', priority: 0.75 })
    }
    for (let i = 0; i < (dynamicCounts.glossary || 0); i++) {
      allEntries.push({ path: `/glossary/[term-${i + 1}]`, url: '', category: 'Programmatic: Glossary', type: 'programmatic', priority: 0.6 })
    }
    for (let i = 0; i < (dynamicCounts.comparisons || 0); i++) {
      allEntries.push({ path: `/compare/[competitor-${i + 1}]`, url: '', category: 'Programmatic: Comparisons', type: 'programmatic', priority: 0.75 })
    }
    for (let i = 0; i < (dynamicCounts.threads || 0); i++) {
      allEntries.push({ path: `/forum/[thread-${i + 1}]`, url: '', category: 'Dynamic: Forum', type: 'dynamic', priority: 0.6 })
    }
    for (let i = 0; i < (dynamicCounts.profiles || 0); i++) {
      allEntries.push({ path: `/u/[user-${i + 1}]`, url: '', category: 'Dynamic: Profiles', type: 'dynamic', priority: 0.5 })
    }
    for (let i = 0; i < (dynamicCounts.listings || 0); i++) {
      allEntries.push({ path: `/marketplace/[listing-${i + 1}]`, url: '', category: 'Dynamic: Marketplace', type: 'dynamic', priority: 0.8 })
    }
  }

  // Filter
  const filtered = filter
    ? allEntries.filter(e => e.path.toLowerCase().includes(filter.toLowerCase()) || e.category.toLowerCase().includes(filter.toLowerCase()))
    : allEntries

  // Group by category
  const grouped: Record<string, SitemapEntry[]> = {}
  for (const entry of filtered) {
    if (!grouped[entry.category]) grouped[entry.category] = []
    grouped[entry.category].push(entry)
  }

  const totalPages = allEntries.length
  const staticCount = allEntries.filter(e => e.type === 'static').length
  const ssgCount = allEntries.filter(e => e.type === 'programmatic').length
  const dynamicCount = allEntries.filter(e => e.type === 'dynamic').length

  const toggleCat = (cat: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const collapseAll = () => setExpandedCats(new Set())
  const expandAll = () => setExpandedCats(new Set(CATEGORIES))

  return (
    <div style={{ padding: '0', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '0.75rem',
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {[
          { label: 'Total Pages', value: totalPages, color: '#7ed957' },
          { label: 'Static', value: staticCount, color: '#00d4ff' },
          { label: 'Programmatic', value: ssgCount, color: '#a78bfa' },
          { label: 'Dynamic', value: dynamicCount, color: '#fbbf24' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            border: '1px solid var(--border)',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '1.5rem', fontWeight: 700, color: s.color,
              fontFamily: 'var(--font-mono)',
            }}>
              {loading ? '...' : s.value}
            </div>
            <div style={{
              fontSize: '0.65rem', color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600,
            }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.75rem 1.25rem',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <input
          type="text"
          placeholder="Filter by path or category..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            flex: 1,
            padding: '0.5rem 0.75rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.03)',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-mono)',
            outline: 'none',
          }}
        />
        <button
          onClick={expandAll}
          style={{
            padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', cursor: 'pointer',
            fontSize: '0.7rem', fontWeight: 600, fontFamily: 'inherit',
          }}
        >
          Expand All
        </button>
        <button
          onClick={collapseAll}
          style={{
            padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)', cursor: 'pointer',
            fontSize: '0.7rem', fontWeight: 600, fontFamily: 'inherit',
          }}
        >
          Collapse
        </button>
      </div>

      {/* Page list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1.25rem 1.25rem' }}>
        {CATEGORIES.filter(cat => grouped[cat]?.length).map(cat => {
          const entries = grouped[cat]
          const expanded = expandedCats.has(cat)
          const color = CATEGORY_COLORS[cat] || 'var(--text-muted)'
          const isProgrammatic = cat.startsWith('Programmatic:') || cat.startsWith('Dynamic:')

          return (
            <div key={cat} style={{ marginBottom: '0.5rem' }}>
              <button
                onClick={() => toggleCat(cat)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%',
                  padding: '0.5rem 0.5rem', borderRadius: '0.5rem', border: 'none',
                  background: expanded ? 'rgba(255,255,255,0.03)' : 'transparent',
                  cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
                }}
              >
                <span style={{
                  transform: expanded ? 'rotate(90deg)' : 'rotate(0)',
                  transition: 'transform 0.15s',
                  color: 'var(--text-muted)', fontSize: '0.7rem',
                }}>
                  &#9654;
                </span>
                <span style={{
                  width: '8px', height: '8px', borderRadius: '2px', background: color, flexShrink: 0,
                }} />
                <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                  {cat}
                </span>
                <span style={{
                  fontSize: '0.65rem', color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)', marginLeft: 'auto',
                }}>
                  {entries.length} page{entries.length !== 1 ? 's' : ''}
                </span>
              </button>

              {expanded && (
                <div style={{ paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
                  {isProgrammatic ? (
                    // Programmatic: show summary row instead of individual pages
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.4rem 0.5rem',
                      fontSize: '0.75rem',
                    }}>
                      <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', minWidth: '200px' }}>
                        {entries[0]?.path.replace(/\[.*\]/, '[slug]') || ''}
                      </span>
                      <span style={{
                        padding: '1px 6px', borderRadius: '4px',
                        background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)',
                        color: '#a78bfa', fontSize: '0.6rem', fontWeight: 600,
                      }}>
                        {entries.length} pages generated
                      </span>
                      <span style={{
                        color: 'var(--text-muted)', fontSize: '0.65rem', fontFamily: 'var(--font-mono)',
                      }}>
                        p:{entries[0]?.priority}
                      </span>
                    </div>
                  ) : (
                    entries.map((entry, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.35rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                        }}
                      >
                        <a
                          href={`https://0nmcp.com${entry.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-mono)',
                            textDecoration: 'none',
                            minWidth: '200px',
                          }}
                        >
                          {entry.path}
                        </a>
                        <span style={{
                          padding: '1px 6px', borderRadius: '4px',
                          background: entry.type === 'static'
                            ? 'rgba(0,212,255,0.08)' : entry.type === 'dynamic'
                              ? 'rgba(251,191,36,0.08)' : 'rgba(167,139,250,0.08)',
                          border: `1px solid ${entry.type === 'static'
                            ? 'rgba(0,212,255,0.2)' : entry.type === 'dynamic'
                              ? 'rgba(251,191,36,0.2)' : 'rgba(167,139,250,0.2)'}`,
                          color: entry.type === 'static'
                            ? '#00d4ff' : entry.type === 'dynamic'
                              ? '#fbbf24' : '#a78bfa',
                          fontSize: '0.6rem', fontWeight: 600, textTransform: 'uppercase',
                        }}>
                          {entry.type}
                        </span>
                        <span style={{
                          color: 'var(--text-muted)', fontSize: '0.65rem', fontFamily: 'var(--font-mono)',
                        }}>
                          p:{entry.priority}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
