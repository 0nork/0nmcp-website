'use client'

import { useState, useMemo, useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import servicesData from '@/data/services.json'
import { SERVICE_LOGOS } from '@/components/builder/ServicePalette'
import { STATS_DISPLAY } from '@/data/stats'

/**
 * /integrations — Connections page
 * Light/dark mode matching the /start flagship style.
 * Uses --0n-* design tokens. Real service logos.
 */

const CATEGORY_COLORS: Record<string, string> = {
  ai: '#a855f7', crm_sales: '#ff6b35', communication: '#3b82f6', developer: '#00d4ff',
  storage: '#10b981', payments: '#eab308', social_media: '#3b82f6', productivity: '#14b8a6',
  payments_commerce: '#10b981', email_marketing: '#ec4899', cloud: '#6366f1', project_mgmt: '#14b8a6',
  support: '#3b82f6', everyday: '#6EE05A', messaging: '#3b82f6', advertising: '#ec4899',
  accounting: '#eab308', finance: '#eab308', cold_email: '#f97316', automation: '#a855f7',
  integration: '#6366f1', websites: '#00d4ff',
}

const LOGIC_IDS = ['delay', 'schedule', 'condition', 'loop', 'transform', 'trigger', 'error_handling']
const allServices = servicesData.services.filter((s) => !LOGIC_IDS.includes(s.id))
const allCategories = servicesData.categories.filter((c) => c.id !== 'logic')

function StructuredData(): ReactNode {
  const breadcrumb = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
    { '@type': 'ListItem', position: 2, name: 'Connections', item: 'https://www.0nmcp.com/integrations' },
  ]}
  const collection = { '@context': 'https://schema.org', '@type': 'CollectionPage', name: '0nMCP Connections',
    description: `${allServices.length} service integrations for AI-powered orchestration.`,
    url: 'https://www.0nmcp.com/integrations', numberOfItems: allServices.length,
  }
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collection) }} />
  </>
}

export default function IntegrationsPage(): ReactNode {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('0n-theme') as 'light' | 'dark' | null
    if (saved) setTheme(saved)
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark')
  }, [])

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('0n-theme', next)
  }

  const filtered = useMemo(() => {
    let list = allServices
    if (activeCategory) list = list.filter((s) => s.category_id === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.description_short.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
    }
    return list
  }, [search, activeCategory])

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const s of allServices) map[s.category_id] = (map[s.category_id] || 0) + 1
    return map
  }, [])

  const d = theme === 'dark'
  if (!mounted) return null

  return (
    <div className={`on-page ${theme}`}>
      <style>{`
        .on-page { --0n-accent: #6EE05A; --0n-font: 'Instrument Sans', system-ui, sans-serif; --0n-mono: 'JetBrains Mono', monospace; min-height: 100vh; font-family: var(--0n-font); transition: background 0.2s, color 0.2s; }
        .on-page.light { --0n-bg: #f8f9fa; --0n-card: #ffffff; --0n-text: #111827; --0n-text2: #4b5563; --0n-muted: #9ca3af; --0n-border: #e5e7eb; --0n-shadow: 0 2px 8px rgba(0,0,0,0.06); background: var(--0n-bg); color: var(--0n-text); }
        .on-page.dark { --0n-bg: #0B0F19; --0n-card: #111827; --0n-text: #E8EAED; --0n-text2: #9CA3AF; --0n-muted: #4A5568; --0n-border: #1E293B; --0n-shadow: 0 2px 8px rgba(0,0,0,0.3); background: var(--0n-bg); color: var(--0n-text); }
        .int-card { background: var(--0n-card); border: 1px solid var(--0n-border); border-radius: 14px; padding: 1.25rem; transition: all 0.2s; text-decoration: none; display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .int-card:hover { transform: translateY(-3px); box-shadow: var(--0n-shadow); }
      `}</style>

      <StructuredData />

      {/* Theme Toggle */}
      <button onClick={toggleTheme} style={{ position: 'fixed', top: '5rem', right: '1.25rem', zIndex: 100, width: 44, height: 44, borderRadius: '50%', border: `1px solid var(--0n-border)`, background: 'var(--0n-card)', color: 'var(--0n-text2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1.125rem', boxShadow: 'var(--0n-shadow)', transition: 'all 0.2s' }} aria-label="Toggle theme">
        {d ? '\u2600' : '\u263D'}
      </button>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '6rem 1.5rem 2.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(110,224,90,0.08), transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 999, background: d ? 'rgba(110,224,90,0.08)' : 'rgba(110,224,90,0.08)', border: '1px solid rgba(110,224,90,0.2)', color: d ? '#6EE05A' : '#2d6a22', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '1.25rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6EE05A' }} />
            {allServices.length} SERVICES CONNECTED
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'var(--0n-text)', lineHeight: 1.1, margin: '0 0 1rem', letterSpacing: '-0.03em' }}>
            Connect <span style={{ color: '#6EE05A' }}>anything</span> to anything.
          </h1>
          <p style={{ fontSize: '1.0625rem', color: 'var(--0n-text2)', lineHeight: 1.6, margin: '0 0 2rem' }}>
            <strong>{STATS_DISPLAY.tools} tools</strong> across <strong>{allServices.length} services</strong>.
            AI-native orchestration. {STATS_DISPLAY.patents} patents pending.
          </p>
          {/* Search */}
          <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex', gap: 8, padding: 6, borderRadius: 14, background: 'var(--0n-card)', border: '1px solid var(--0n-border)', boxShadow: 'var(--0n-shadow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 12, color: 'var(--0n-muted)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input type="text" placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, padding: '12px 8px', border: 'none', background: 'transparent', color: 'var(--0n-text)', fontSize: '0.9375rem', outline: 'none', fontFamily: 'var(--0n-font)' }} />
          </div>
        </div>
      </section>

      {/* Category pills */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <button onClick={() => setActiveCategory(null)} style={{
            padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--0n-font)', transition: 'all 0.15s',
            background: !activeCategory ? 'rgba(110,224,90,0.12)' : 'var(--0n-card)',
            color: !activeCategory ? '#6EE05A' : 'var(--0n-text2)',
            boxShadow: !activeCategory ? 'none' : 'var(--0n-shadow)',
          }}>
            All ({allServices.length})
          </button>
          {allCategories.map((cat) => {
            const count = categoryCounts[cat.id] || 0
            if (count === 0) return null
            const isActive = activeCategory === cat.id
            const color = CATEGORY_COLORS[cat.id] || '#6EE05A'
            return (
              <button key={cat.id} onClick={() => setActiveCategory(isActive ? null : cat.id)} style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--0n-font)', transition: 'all 0.15s',
                background: isActive ? `${color}15` : 'var(--0n-card)',
                color: isActive ? color : 'var(--0n-text2)',
                boxShadow: isActive ? 'none' : 'var(--0n-shadow)',
              }}>
                {cat.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Service grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--0n-muted)' }}>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>No services found</p>
            <p style={{ fontSize: '0.875rem' }}>Try a different search term or clear filters.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            {filtered.map((service) => {
              const color = CATEGORY_COLORS[service.category_id] || '#6EE05A'
              const logoUrl = SERVICE_LOGOS[service.id]
              return (
                <Link key={service.id} href={`/integrations/${service.slug}`} className="int-card" style={{ borderColor: `${color}20` }}>
                  {/* Logo */}
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}10`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {logoUrl ? (
                      <Image src={logoUrl} alt={service.name} width={28} height={28} style={{ objectFit: 'contain' }} unoptimized />
                    ) : (
                      <span style={{ fontSize: 20, color }}>{service.icon}</span>
                    )}
                  </div>
                  {/* Name */}
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--0n-text)', textAlign: 'center', lineHeight: 1.3 }}>
                    {service.name}
                  </span>
                  {/* Description */}
                  <span style={{ fontSize: '0.75rem', color: 'var(--0n-text2)', textAlign: 'center', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden', minHeight: 36 }}>
                    {service.description_short}
                  </span>
                  {/* Tool count */}
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, padding: '2px 10px', borderRadius: 6, background: `${color}10`, color, fontFamily: 'var(--0n-mono)' }}>
                    {service.tool_count} tools
                  </span>
                </Link>
              )
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ marginTop: '3rem', padding: '2rem', borderRadius: 16, background: d ? 'linear-gradient(135deg, #111827, #162032)' : 'linear-gradient(135deg, #f0fdf0, #ffffff)', border: '1px solid rgba(110,224,90,0.15)', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--0n-text)', margin: '0 0 0.5rem' }}>
            Ready to connect <span style={{ color: '#6EE05A' }}>everything</span>?
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--0n-text2)', margin: '0 0 1.5rem', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
            {STATS_DISPLAY.tools} tools. {allServices.length} services. One install. Source-available.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/start" style={{ padding: '10px 24px', borderRadius: 10, background: '#6EE05A', color: '#000', fontSize: '0.875rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 2px 12px rgba(110,224,90,0.25)' }}>
              Get Started Free
            </Link>
            <Link href="/audit" style={{ padding: '10px 24px', borderRadius: 10, background: 'var(--0n-card)', color: 'var(--0n-text)', border: '1px solid var(--0n-border)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
              Run Free Audit
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
