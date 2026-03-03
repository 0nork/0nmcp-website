'use client'

import { useState } from 'react'
import { Search, Lock, Shield } from 'lucide-react'
import { StatusDot } from './StatusDot'
import { SVC, SERVICE_COUNT, CATEGORY_LABELS, CATEGORY_ORDER, type ServiceConfig } from '@/lib/console/services'

interface VaultOverlayProps {
  onSelect: (service: string) => void
  connectedServices: string[]
  searchQuery: string
  onSearch: (q: string) => void
}

export function VaultOverlay({
  onSelect,
  connectedServices,
  searchQuery,
  onSearch,
}: VaultOverlayProps) {
  const [filter, setFilter] = useState<'all' | 'connected' | 'setup'>('all')
  const [selectedCat, setSelectedCat] = useState<string>('all')

  const connectedCount = connectedServices.length
  const setupRequired = SERVICE_COUNT - connectedCount
  const connectedPct = Math.round((connectedCount / SERVICE_COUNT) * 100)

  const entries = Object.entries(SVC)
    .filter(([key, svc]) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !q ||
        svc.l.toLowerCase().includes(q) ||
        svc.d.toLowerCase().includes(q) ||
        svc.cap.some(c => c.toLowerCase().includes(q))
      const isConnected = connectedServices.includes(key)
      const matchesFilter =
        filter === 'all' ||
        (filter === 'connected' && isConnected) ||
        (filter === 'setup' && !isConnected)
      const matchesCat = selectedCat === 'all' || svc.cat === selectedCat
      return matchesSearch && matchesFilter && matchesCat
    })
    .sort((a, b) => a[1].pri - b[1].pri)

  // Group entries by category for display
  const grouped: Record<string, Array<[string, ServiceConfig]>> = {}
  for (const [key, svc] of entries) {
    if (!grouped[svc.cat]) grouped[svc.cat] = []
    grouped[svc.cat].push([key, svc])
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-full mx-auto w-full" style={{ animation: 'console-fade-in 0.3s ease' }}>
      {/* Connection Progress Banner */}
      {setupRequired > 0 && (
        <div
          className="rounded-xl p-4 mb-5 flex items-center gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(126,217,87,0.08), rgba(0,212,255,0.08))',
            border: '1px solid rgba(126,217,87,0.2)',
          }}
        >
          <Shield size={20} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {connectedCount} of {SERVICE_COUNT} services connected
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Connect your API keys to unlock {SERVICE_COUNT} services across {CATEGORY_ORDER.length} categories. Credentials are encrypted in your browser.
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${connectedPct}%`,
                  background: connectedPct > 50
                    ? 'linear-gradient(90deg, var(--accent), #00d4ff)'
                    : connectedPct > 20
                      ? 'linear-gradient(90deg, #ff6b35, var(--accent))'
                      : 'linear-gradient(90deg, #ef4444, #ff6b35)',
                }}
              />
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{connectedPct}%</div>
            <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>connected</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2
            className="text-xl lg:text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Service Vault
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {connectedCount}/{SERVICE_COUNT} services connected &middot; {CATEGORY_ORDER.length} categories
          </p>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search services..."
              className="h-9 pl-9 pr-3 rounded-lg text-sm outline-none transition-all w-48"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>
          <div
            className="flex rounded-lg overflow-hidden"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
            }}
          >
            {(['all', 'connected', 'setup'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer capitalize border-none"
                style={{
                  backgroundColor: filter === f ? 'var(--accent-glow)' : 'transparent',
                  color: filter === f ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                {f === 'setup' ? 'Setup Required' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedCat('all')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer border-none transition-colors"
          style={{
            background: selectedCat === 'all' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
            color: selectedCat === 'all' ? '#000' : 'var(--text-secondary)',
          }}
        >
          All ({SERVICE_COUNT})
        </button>
        {CATEGORY_ORDER.map(cat => {
          const count = Object.values(SVC).filter(s => s.cat === cat).length
          if (count === 0) return null
          return (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer border-none transition-colors"
              style={{
                background: selectedCat === cat ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                color: selectedCat === cat ? '#000' : 'var(--text-secondary)',
              }}
            >
              {CATEGORY_LABELS[cat]} ({count})
            </button>
          )
        })}
      </div>

      {/* Grouped Grid */}
      {selectedCat === 'all' ? (
        // Show grouped by category
        CATEGORY_ORDER.map(cat => {
          const catEntries = grouped[cat]
          if (!catEntries || catEntries.length === 0) return null
          return (
            <div key={cat} className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                {CATEGORY_LABELS[cat]}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {catEntries.map(([key, svc], i) => (
                  <ServiceCard
                    key={key}
                    serviceKey={key}
                    svc={svc}
                    isConnected={connectedServices.includes(key)}
                    onSelect={onSelect}
                    index={i}
                  />
                ))}
              </div>
            </div>
          )
        })
      ) : (
        // Show flat grid for single category
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {entries.map(([key, svc], i) => (
            <ServiceCard
              key={key}
              serviceKey={key}
              svc={svc}
              isConnected={connectedServices.includes(key)}
              onSelect={onSelect}
              index={i}
            />
          ))}
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-16">
          <Lock size={24} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            No services match your search
          </p>
        </div>
      )}

      {/* Footer */}
      <div
        className="text-center text-[11px] mt-6 py-3"
        style={{
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border)',
        }}
      >
        Credentials encrypted in your browser &middot; AES-256-GCM &middot; Never sent to our servers
      </div>

      <style>{`
        @keyframes console-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes console-stagger-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

function ServiceCard({
  serviceKey,
  svc,
  isConnected,
  onSelect,
  index,
}: {
  serviceKey: string
  svc: ServiceConfig
  isConnected: boolean
  onSelect: (key: string) => void
  index: number
}) {
  const accentColor = svc.c === '#e2e2e2' || svc.c === '#ffffff' || svc.c === '#000000' ? '#60a5fa' : svc.c
  return (
    <button
      onClick={() => onSelect(serviceKey)}
      className="glow-box rounded-2xl p-4 text-left cursor-pointer transition-all duration-300 group"
      style={{
        animation: 'console-stagger-in 0.4s ease both',
        animationDelay: `${Math.min(index * 30, 300)}ms`,
      }}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-4 right-4 h-0.5 rounded-b-full"
        style={{ backgroundColor: accentColor, opacity: isConnected ? 0.6 : 0.15 }}
      />

      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
          style={{
            backgroundColor: accentColor + '18',
            color: accentColor,
            fontFamily: 'var(--font-mono)',
          }}
        >
          {svc.l.slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div
            className="font-semibold text-sm truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {svc.l}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StatusDot status={isConnected ? 'online' : 'offline'} />
            <span
              className="text-[11px]"
              style={{
                color: isConnected ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              {isConnected ? 'Connected' : 'Setup required'}
            </span>
          </div>
        </div>
      </div>

      <p
        className="text-xs leading-relaxed mb-3 line-clamp-2"
        style={{ color: 'var(--text-secondary)' }}
      >
        {svc.d}
      </p>

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium" style={{ color: accentColor }}>
          {svc.cap.length} capabilities
        </span>
        <span
          className="text-[11px] opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--text-muted)' }}
        >
          Configure &rarr;
        </span>
      </div>
    </button>
  )
}
