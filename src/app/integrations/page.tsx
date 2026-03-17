'use client'

import { useState, useMemo, type ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import servicesData from '@/data/services.json'
import { SERVICE_LOGOS } from '@/components/builder/ServicePalette'

// ─── Category color map ────────────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  ai:             '#a855f7',
  crm_sales:      '#ff6b35',
  communication:  '#3b82f6',
  developer:      '#00d4ff',
  storage:        '#10b981',
  payments:       '#eab308',
  social_media:   '#3b82f6',
  productivity:   '#14b8a6',
  payments_commerce: '#10b981',
  email_marketing:'#ec4899',
  cloud:          '#6366f1',
  project_mgmt:   '#14b8a6',
  support:        '#3b82f6',
  everyday:       '#7ed957',
  logic:          '#f59e0b',
  messaging:      '#3b82f6',
  advertising:    '#ec4899',
  accounting:     '#eab308',
  finance:        '#eab308',
  cold_email:     '#f97316',
  automation:     '#a855f7',
  integration:    '#6366f1',
  websites:       '#00d4ff',
}

// ─── Filter out logic/control-flow services ────────────────────────────────────
const LOGIC_IDS = ['delay', 'schedule', 'condition', 'loop', 'transform', 'trigger', 'error_handling']

const allServices = servicesData.services.filter((s) => !LOGIC_IDS.includes(s.id))
const allCategories = servicesData.categories.filter((c) => c.id !== 'logic')

// ─── JSON-LD (static, rendered once) ───────────────────────────────────────────
function StructuredData(): ReactNode {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.0nmcp.com' },
      { '@type': 'ListItem', position: 2, name: 'Connections', item: 'https://www.0nmcp.com/integrations' },
    ],
  }
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '0nMCP Connections',
    description: `${allServices.length} service integrations with 1,400+ automations for AI-powered orchestration.`,
    url: 'https://www.0nmcp.com/integrations',
    numberOfItems: allServices.length,
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collection) }} />
    </>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function IntegrationsPage(): ReactNode {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let list = allServices
    if (activeCategory) {
      list = list.filter((s) => s.category_id === activeCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description_short.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)
      )
    }
    return list
  }, [search, activeCategory])

  // Count per category for pills
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const s of allServices) {
      map[s.category_id] = (map[s.category_id] || 0) + 1
    }
    return map
  }, [])

  return (
    <div style={{ background: '#000000', minHeight: '100vh' }}>
      <StructuredData />

      <div className="pt-28 pb-24 px-4 md:px-8">
        <div className="max-w-[1400px] mx-auto">

          {/* Breadcrumb */}
          <nav
            className="text-xs mb-6 flex items-center gap-1.5"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-white transition-colors no-underline" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Home
            </Link>
            <span>/</span>
            <span style={{ color: '#7ed957' }}>Connections</span>
          </nav>

          {/* Header */}
          <div className="mb-10">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <h1
                  className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-3"
                  style={{ color: '#ffffff' }}
                >
                  Connections
                </h1>
                <p className="text-base md:text-lg max-w-2xl" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span style={{ color: '#7ed957', fontWeight: 700 }}>{allServices.length}</span> services.{' '}
                  <span style={{ color: '#7ed957', fontWeight: 700 }}>1,400+</span> automations.{' '}
                  Connect anything to anything with AI-native orchestration.
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full lg:w-80 shrink-0">
                <div
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: 'rgba(255,255,255,0.3)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search services..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#ffffff',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(126,217,87,0.4)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Category filter pills */}
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
              style={{
                background: !activeCategory ? 'rgba(126,217,87,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${!activeCategory ? 'rgba(126,217,87,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: !activeCategory ? '#7ed957' : 'rgba(255,255,255,0.5)',
              }}
            >
              All ({allServices.length})
            </button>
            {allCategories.map((cat) => {
              const count = categoryCounts[cat.id] || 0
              if (count === 0) return null
              const color = CATEGORY_COLORS[cat.id] || '#7ed957'
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(isActive ? null : cat.id)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
                  style={{
                    background: isActive ? `${color}15` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isActive ? `${color}66` : 'rgba(255,255,255,0.08)'}`,
                    color: isActive ? color : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {cat.label} ({count})
                </button>
              )
            })}
          </div>

          {/* Service grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                No services found
              </p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Try a different search term or clear filters.
              </p>
            </div>
          ) : (
            <div
              className="grid gap-3"
              style={{
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              }}
            >
              {filtered.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}

          {/* CTA */}
          <div
            className="mt-16 rounded-2xl p-8 md:p-10 text-center"
            style={{
              background: 'rgba(126,217,87,0.03)',
              border: '1px solid rgba(126,217,87,0.1)',
            }}
          >
            <p className="text-xl md:text-2xl font-black mb-2" style={{ color: '#ffffff' }}>
              Don&apos;t see your service?
            </p>
            <p className="text-sm mb-6 max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              0nMCP is extensible — connect any REST API with custom tools. More services unlock as the community grows.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/turn-it-on"
                className="inline-flex items-center px-6 py-2.5 rounded-xl font-bold text-sm no-underline transition-all"
                style={{ background: '#7ed957', color: '#000000' }}
              >
                Get Started
              </Link>
              <Link
                href="/community"
                className="inline-flex items-center px-6 py-2.5 rounded-xl font-bold text-sm no-underline transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff',
                }}
              >
                Request Integration
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Service Card ──────────────────────────────────────────────────────────────
interface ServiceCardProps {
  service: {
    id: string
    name: string
    slug: string
    icon: string
    category_id: string
    description_short: string
    tool_count: number
  }
}

function ServiceCard({ service }: ServiceCardProps): ReactNode {
  const [hovered, setHovered] = useState(false)
  const color = CATEGORY_COLORS[service.category_id] || '#7ed957'
  const logoUrl = SERVICE_LOGOS[service.id]

  return (
    <Link
      href={`/integrations/${service.slug}`}
      className="no-underline block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)`,
        border: `1px solid ${hovered ? `${color}40` : `${color}26`}`,
        borderRadius: 12,
        padding: '24px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered ? `0 8px 32px ${color}12` : 'none',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={service.name}
            width={24}
            height={24}
            style={{ objectFit: 'contain' }}
            unoptimized
          />
        ) : (
          <span style={{ fontSize: 20 }}>{service.icon}</span>
        )}
      </div>

      {/* Name */}
      <span
        className="text-sm font-bold text-center leading-tight"
        style={{ color: '#ffffff' }}
      >
        {service.name}
      </span>

      {/* Description */}
      <span
        className="text-xs text-center leading-relaxed"
        style={{
          color: 'rgba(255,255,255,0.45)',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: 32,
        }}
      >
        {service.description_short}
      </span>

      {/* Tool count badge */}
      <span
        className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
        style={{
          background: `${color}12`,
          color: color,
          marginTop: -4,
        }}
      >
        {service.tool_count} tool{service.tool_count !== 1 ? 's' : ''}
      </span>

      {/* Connect button */}
      <div
        className="w-full text-center text-xs font-semibold py-2 rounded-lg mt-auto transition-all"
        style={{
          background: hovered ? `${color}15` : 'rgba(255,255,255,0.03)',
          border: `1px solid ${hovered ? `${color}40` : 'rgba(255,255,255,0.08)'}`,
          color: hovered ? color : 'rgba(255,255,255,0.6)',
        }}
      >
        Connect
      </div>
    </Link>
  )
}
