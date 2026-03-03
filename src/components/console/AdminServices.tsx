'use client'

import { useState, useEffect, useCallback } from 'react'
import { SVC } from '@/lib/console/services'

interface AdminService {
  id: string
  name: string
  category: string
  is_enabled: boolean
  affiliate_url: string | null
  custom_help_url: string | null
  notes: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

const CATEGORY_LABELS: Record<string, string> = {
  ai: 'AI / LLM',
  crm: 'CRM / Sales',
  database: 'Database',
  finance: 'Finance',
  messaging: 'Messaging',
  email: 'Email',
  dev: 'Developer',
  cloud: 'Cloud',
  social: 'Social',
  ads: 'Advertising',
  productivity: 'Productivity',
  ecommerce: 'E-Commerce',
  automation: 'Automation',
  video: 'Video',
}

const CATEGORY_COLORS: Record<string, string> = {
  ai: '#a78bfa',
  crm: '#f59e0b',
  database: '#06b6d4',
  finance: '#10b981',
  messaging: '#3b82f6',
  email: '#ef4444',
  dev: '#8b5cf6',
  cloud: '#64748b',
  social: '#ec4899',
  ads: '#f97316',
  productivity: '#14b8a6',
  ecommerce: '#84cc16',
  automation: '#7ed957',
  video: '#e879f9',
}

export function AdminServices() {
  const [services, setServices] = useState<AdminService[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/services')
      if (!res.ok) throw new Error('Failed to fetch services')
      const data = await res.json()
      setServices(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchServices() }, [fetchServices])

  const updateService = useCallback(async (id: string, updates: Partial<AdminService>) => {
    setSaving(id)
    try {
      const res = await fetch('/api/admin/services', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      if (!res.ok) throw new Error('Failed to update')
      const updated = await res.json()
      setServices(prev => prev.map(s => s.id === id ? updated : s))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSaving(null)
    }
  }, [])

  const categories = ['all', ...Array.from(new Set(services.map(s => s.category))).sort()]

  const filtered = services.filter(s => {
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || s.category === categoryFilter
    return matchSearch && matchCat
  })

  const enabledCount = services.filter(s => s.is_enabled).length
  const affiliateCount = services.filter(s => s.affiliate_url).length

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100%', color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
      }}>
        Loading services...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header Stats */}
      <div style={{
        padding: '1rem 1.25rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0,
      }}>
        <div>
          <div style={{
            fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600,
            letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem',
          }}>
            Total Services
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {services.length}
          </div>
        </div>
        <div style={{ width: '1px', height: '2.5rem', background: 'var(--border)' }} />
        <div>
          <div style={{
            fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600,
            letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem',
          }}>
            Enabled
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#7ed957', fontFamily: 'var(--font-mono)' }}>
            {enabledCount}
          </div>
        </div>
        <div style={{ width: '1px', height: '2.5rem', background: 'var(--border)' }} />
        <div>
          <div style={{
            fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600,
            letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem',
          }}>
            Affiliate Links
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00d4ff', fontFamily: 'var(--font-mono)' }}>
            {affiliateCount}
          </div>
        </div>
        <div style={{ width: '1px', height: '2.5rem', background: 'var(--border)' }} />
        <div>
          <div style={{
            fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600,
            letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem',
          }}>
            Disabled
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>
            {services.length - enabledCount}
          </div>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <div style={{
        padding: '0.75rem 1.25rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0,
      }}>
        <input
          type="text"
          placeholder="Search services..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: '0.5rem 0.75rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-display)',
            outline: 'none',
          }}
        />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border)',
            borderRadius: '0.5rem',
            color: 'var(--text-primary)',
            fontSize: '0.8rem',
            fontFamily: 'var(--font-display)',
            outline: 'none',
            cursor: 'pointer',
            minWidth: '140px',
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
              {cat === 'all' ? 'All Categories' : (CATEGORY_LABELS[cat] || cat)}
            </option>
          ))}
        </select>
        <div style={{
          fontSize: '0.75rem', color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
        }}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{
          padding: '0.5rem 1.25rem',
          background: 'rgba(239,68,68,0.1)',
          borderBottom: '1px solid rgba(239,68,68,0.2)',
          color: '#ef4444',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none', border: 'none', color: '#ef4444',
              cursor: 'pointer', fontSize: '0.8rem', padding: '0 0.25rem',
            }}
          >
            x
          </button>
        </div>
      )}

      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2.5rem 1fr 7rem 3.5rem minmax(200px, 1fr) 10rem',
        gap: '0.5rem',
        padding: '0.5rem 1.25rem',
        borderBottom: '1px solid var(--border)',
        fontSize: '0.65rem',
        fontWeight: 600,
        color: 'var(--text-muted)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        flexShrink: 0,
      }}>
        <div />
        <div>Service</div>
        <div>Category</div>
        <div style={{ textAlign: 'center' }}>On</div>
        <div>Affiliate URL</div>
        <div>Help URL</div>
      </div>

      {/* Scrollable Service List */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {filtered.map(svc => (
          <ServiceRow
            key={svc.id}
            service={svc}
            saving={saving === svc.id}
            onToggle={() => updateService(svc.id, { is_enabled: !svc.is_enabled })}
            onAffiliateChange={(url) => updateService(svc.id, { affiliate_url: url || null })}
          />
        ))}

        {filtered.length === 0 && (
          <div style={{
            padding: '3rem', textAlign: 'center',
            color: 'var(--text-muted)', fontSize: '0.85rem',
          }}>
            No services match your search.
          </div>
        )}
      </div>
    </div>
  )
}

function ServiceRow({
  service,
  saving,
  onToggle,
  onAffiliateChange,
}: {
  service: AdminService
  saving: boolean
  onToggle: () => void
  onAffiliateChange: (url: string) => void
}) {
  const [hovered, setHovered] = useState(false)
  const [affiliateValue, setAffiliateValue] = useState(service.affiliate_url || '')
  const [affiliateDirty, setAffiliateDirty] = useState(false)

  // Sync if external update
  useEffect(() => {
    setAffiliateValue(service.affiliate_url || '')
    setAffiliateDirty(false)
  }, [service.affiliate_url])

  const svcMeta = SVC[service.id]
  const dotColor = svcMeta?.c || CATEGORY_COLORS[service.category] || '#666'

  const helpUrl = svcMeta?.f?.[0]?.lk || null

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '2.5rem 1fr 7rem 3.5rem minmax(200px, 1fr) 10rem',
        gap: '0.5rem',
        padding: '0.5rem 1.25rem',
        alignItems: 'center',
        borderBottom: '1px solid rgba(42,42,58,0.5)',
        background: hovered ? 'rgba(255,255,255,0.02)' : 'transparent',
        transition: 'background 0.15s ease',
        opacity: service.is_enabled ? 1 : 0.5,
      }}
    >
      {/* Colored Dot */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '0.625rem', height: '0.625rem',
          borderRadius: '50%',
          background: dotColor,
          boxShadow: service.is_enabled ? `0 0 6px ${dotColor}40` : 'none',
          flexShrink: 0,
        }} />
      </div>

      {/* Name + ID */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: '0.8rem', fontWeight: 600,
          color: 'var(--text-primary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {service.name}
        </div>
        <div style={{
          fontSize: '0.65rem', color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
        }}>
          {service.id}
        </div>
      </div>

      {/* Category Tag */}
      <div>
        <span style={{
          display: 'inline-block',
          padding: '0.15rem 0.5rem',
          borderRadius: '9999px',
          fontSize: '0.6rem',
          fontWeight: 600,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          background: `${CATEGORY_COLORS[service.category] || '#666'}18`,
          color: CATEGORY_COLORS[service.category] || '#888',
          border: `1px solid ${CATEGORY_COLORS[service.category] || '#666'}30`,
          whiteSpace: 'nowrap',
        }}>
          {CATEGORY_LABELS[service.category] || service.category}
        </span>
      </div>

      {/* Toggle Switch */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <button
          onClick={onToggle}
          disabled={saving}
          style={{
            width: '2.25rem', height: '1.25rem',
            borderRadius: '9999px',
            border: 'none',
            cursor: saving ? 'wait' : 'pointer',
            background: service.is_enabled ? '#7ed957' : 'rgba(255,255,255,0.1)',
            position: 'relative',
            transition: 'background 0.2s ease',
            flexShrink: 0,
          }}
        >
          <div style={{
            width: '0.9rem', height: '0.9rem',
            borderRadius: '50%',
            background: '#fff',
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            left: service.is_enabled ? 'calc(100% - 1.075rem)' : '0.175rem',
            transition: 'left 0.2s ease',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }} />
        </button>
      </div>

      {/* Affiliate URL Input */}
      <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <input
          type="text"
          placeholder="https://affiliate-link.com/..."
          value={affiliateValue}
          onChange={e => { setAffiliateValue(e.target.value); setAffiliateDirty(true) }}
          onBlur={() => {
            if (affiliateDirty) {
              onAffiliateChange(affiliateValue)
              setAffiliateDirty(false)
            }
          }}
          onKeyDown={e => {
            if (e.key === 'Enter' && affiliateDirty) {
              onAffiliateChange(affiliateValue);
              setAffiliateDirty(false);
              (e.target as HTMLInputElement).blur()
            }
          }}
          style={{
            flex: 1,
            padding: '0.35rem 0.5rem',
            background: 'rgba(255,255,255,0.03)',
            border: affiliateDirty
              ? '1px solid rgba(126,217,87,0.4)'
              : '1px solid rgba(42,42,58,0.6)',
            borderRadius: '0.375rem',
            color: affiliateValue ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            outline: 'none',
            minWidth: 0,
          }}
        />
        {affiliateValue && (
          <a
            href={affiliateValue}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.7rem', color: '#00d4ff',
              textDecoration: 'none', flexShrink: 0,
            }}
            title="Open affiliate link"
          >
            &rarr;
          </a>
        )}
      </div>

      {/* Help URL (from SVC config, read-only) */}
      <div style={{ minWidth: 0 }}>
        {helpUrl ? (
          <a
            href={helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.65rem',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'block',
            }}
            title={helpUrl}
          >
            {helpUrl.replace(/^https?:\/\//, '').substring(0, 30)}...
          </a>
        ) : (
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', opacity: 0.4 }}>
            --
          </span>
        )}
      </div>
    </div>
  )
}
