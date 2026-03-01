'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import MarketplaceCard from './MarketplaceCard'
import MarketplaceListItem from './MarketplaceListItem'
import {
  MarketplaceListing,
  MARKETPLACE_CATEGORIES,
  SORT_OPTIONS,
  SortOption,
  getCategoryColor,
} from './MarketplaceTypes'

interface ServiceInfo {
  id: string
  name: string
  slug: string
  category?: string
}

interface CapCategory {
  id: string
  label: string
  serviceIds: string[]
}

export default function MarketplaceBrowser({
  listings,
  services,
  capabilityCategories,
}: {
  listings: MarketplaceListing[]
  services: ServiceInfo[]
  capabilityCategories: CapCategory[]
}) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('popular')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [selectedCapCategory, setSelectedCapCategory] = useState('')
  const [showServiceDropdown, setShowServiceDropdown] = useState(false)
  const [showCapDropdown, setShowCapDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const serviceRef = useRef<HTMLDivElement>(null)
  const capRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (serviceRef.current && !serviceRef.current.contains(e.target as Node)) setShowServiceDropdown(false)
      if (capRef.current && !capRef.current.contains(e.target as Node)) setShowCapDropdown(false)
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortDropdown(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Filter + sort
  const filtered = useMemo(() => {
    let result = [...listings]

    // Category
    if (activeCategory !== 'all') {
      result = result.filter((l) => l.category === activeCategory)
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          (l.description || '').toLowerCase().includes(q) ||
          (l.long_description || '').toLowerCase().includes(q) ||
          l.tags.some((t) => t.toLowerCase().includes(q)) ||
          l.services.some((s) => s.toLowerCase().includes(q))
      )
    }

    // Service filter
    if (selectedServices.length > 0) {
      result = result.filter((l) => l.services.some((s) => selectedServices.includes(s)))
    }

    // Capability category filter
    if (selectedCapCategory) {
      const capCat = capabilityCategories.find((c) => c.id === selectedCapCategory)
      if (capCat) {
        result = result.filter((l) => l.services.some((s) => capCat.serviceIds.includes(s)))
      }
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        result.sort((a, b) => b.total_purchases - a.total_purchases)
        break
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'price_asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        result.sort((a, b) => b.price - a.price)
        break
    }

    return result
  }, [listings, activeCategory, search, selectedServices, selectedCapCategory, sortBy, capabilityCategories])

  const toggleService = (id: string) => {
    setSelectedServices((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  // Group services by category for dropdown
  const servicesByCategory = useMemo(() => {
    const groups: Record<string, ServiceInfo[]> = {}
    for (const s of services) {
      const cat = s.category || 'Other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(s)
    }
    return groups
  }, [services])

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 4,
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: 8,
    zIndex: 50,
    maxHeight: 320,
    overflowY: 'auto',
    minWidth: 240,
    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  }

  return (
    <div>
      {/* Search + view toggle + sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
        <div className="relative flex-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search workflows, services, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm rounded-lg"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              padding: '10px 12px 10px 36px',
              outline: 'none',
              fontFamily: 'var(--font-display)',
            }}
          />
        </div>

        {/* View toggle */}
        <div className="flex rounded-lg overflow-hidden shrink-0" style={{ border: '1px solid var(--border)' }}>
          {(['grid', 'list'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '8px 14px',
                backgroundColor: viewMode === mode ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: viewMode === mode ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
              }}
            >
              {mode === 'grid' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="4" width="18" height="3" rx="1" />
                  <rect x="3" y="10.5" width="18" height="3" rx="1" />
                  <rect x="3" y="17" width="18" height="3" rx="1" />
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div ref={sortRef} style={{ position: 'relative' }} className="shrink-0">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="text-xs flex items-center gap-2 rounded-lg"
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'nowrap',
            }}
          >
            {SORT_OPTIONS.find((s) => s.key === sortBy)?.label}
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          {showSortDropdown && (
            <div style={{ ...dropdownStyle, minWidth: 180 }}>
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    setSortBy(opt.key)
                    setShowSortDropdown(false)
                  }}
                  className="w-full text-left text-xs rounded-md"
                  style={{
                    padding: '8px 10px',
                    backgroundColor: sortBy === opt.key ? 'var(--accent-glow)' : 'transparent',
                    color: sortBy === opt.key ? 'var(--accent)' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                    display: 'block',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category pills */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
        {MARKETPLACE_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key
          return (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className="text-[11px] font-semibold rounded-full shrink-0 transition-colors"
              style={{
                padding: '6px 14px',
                fontFamily: 'var(--font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.03em',
                backgroundColor: isActive ? `${cat.color}20` : 'var(--bg-tertiary)',
                color: isActive ? cat.color : 'var(--text-muted)',
                border: `1px solid ${isActive ? `${cat.color}40` : 'var(--border)'}`,
                cursor: 'pointer',
              }}
            >
              {cat.label}
            </button>
          )
        })}
      </div>

      {/* Service + Capability filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Service multi-select */}
        <div ref={serviceRef} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowServiceDropdown(!showServiceDropdown)
              setShowCapDropdown(false)
            }}
            className="text-xs flex items-center gap-2 rounded-lg"
            style={{
              padding: '8px 12px',
              backgroundColor: selectedServices.length > 0 ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
              border: `1px solid ${selectedServices.length > 0 ? 'var(--accent)' : 'var(--border)'}`,
              color: selectedServices.length > 0 ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'nowrap',
            }}
          >
            Services{selectedServices.length > 0 ? ` (${selectedServices.length})` : ''}
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          {showServiceDropdown && (
            <div style={dropdownStyle}>
              {selectedServices.length > 0 && (
                <button
                  onClick={() => setSelectedServices([])}
                  className="text-[10px] w-full text-left mb-2 rounded"
                  style={{
                    padding: '4px 8px',
                    backgroundColor: 'rgba(255,107,53,0.1)',
                    color: '#ff6b35',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  Clear all
                </button>
              )}
              {Object.entries(servicesByCategory).map(([cat, svcs]) => (
                <div key={cat} className="mb-2">
                  <div
                    className="text-[9px] uppercase tracking-wider mb-1 px-1"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    {cat}
                  </div>
                  {svcs.map((s) => {
                    const checked = selectedServices.includes(s.id)
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleService(s.id)}
                        className="flex items-center gap-2 w-full text-left text-[11px] rounded-md"
                        style={{
                          padding: '5px 8px',
                          backgroundColor: checked ? 'var(--accent-glow)' : 'transparent',
                          color: checked ? 'var(--accent)' : 'var(--text-secondary)',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 3,
                            border: `1px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
                            backgroundColor: checked ? 'var(--accent)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            color: 'var(--bg-primary)',
                            flexShrink: 0,
                          }}
                        >
                          {checked ? '\u2713' : ''}
                        </span>
                        {s.name}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Capability category filter */}
        <div ref={capRef} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowCapDropdown(!showCapDropdown)
              setShowServiceDropdown(false)
            }}
            className="text-xs flex items-center gap-2 rounded-lg"
            style={{
              padding: '8px 12px',
              backgroundColor: selectedCapCategory ? 'rgba(0,212,255,0.1)' : 'var(--bg-tertiary)',
              border: `1px solid ${selectedCapCategory ? '#00d4ff' : 'var(--border)'}`,
              color: selectedCapCategory ? '#00d4ff' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'nowrap',
            }}
          >
            Capabilities{selectedCapCategory ? ' \u2713' : ''}
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
              <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          {showCapDropdown && (
            <div style={dropdownStyle}>
              {selectedCapCategory && (
                <button
                  onClick={() => setSelectedCapCategory('')}
                  className="text-[10px] w-full text-left mb-2 rounded"
                  style={{
                    padding: '4px 8px',
                    backgroundColor: 'rgba(255,107,53,0.1)',
                    color: '#ff6b35',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-mono)',
                  }}
                >
                  Clear
                </button>
              )}
              {capabilityCategories.map((cc) => (
                <button
                  key={cc.id}
                  onClick={() => {
                    setSelectedCapCategory(cc.id === selectedCapCategory ? '' : cc.id)
                    setShowCapDropdown(false)
                  }}
                  className="w-full text-left text-[11px] rounded-md"
                  style={{
                    padding: '6px 10px',
                    backgroundColor: selectedCapCategory === cc.id ? 'rgba(0,212,255,0.1)' : 'transparent',
                    color: selectedCapCategory === cc.id ? '#00d4ff' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'block',
                  }}
                >
                  {cc.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Active filter tags */}
        {(selectedServices.length > 0 || selectedCapCategory || activeCategory !== 'all' || search) && (
          <button
            onClick={() => {
              setSelectedServices([])
              setSelectedCapCategory('')
              setActiveCategory('all')
              setSearch('')
            }}
            className="text-[10px] rounded-full"
            style={{
              padding: '4px 10px',
              backgroundColor: 'rgba(255,107,53,0.08)',
              color: '#ff6b35',
              border: '1px solid rgba(255,107,53,0.2)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="mb-4">
        <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {filtered.length} workflow{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div
          className="text-center py-20 rounded-xl"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ margin: '0 auto' }}>
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            No workflows found
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>
            Try adjusting your filters or search terms. Browse all 1,078 capabilities on the Turn it 0n page.
          </p>
          <a
            href="/turn-it-on"
            className="inline-block text-xs font-semibold px-4 py-2 rounded-lg no-underline"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--bg-primary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Browse Capabilities
          </a>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((listing, i) => (
            <MarketplaceCard key={listing.id} listing={listing} index={i} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((listing, i) => (
            <MarketplaceListItem key={listing.id} listing={listing} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
