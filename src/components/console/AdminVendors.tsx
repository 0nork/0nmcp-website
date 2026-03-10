'use client'

import { useState, useEffect, useCallback } from 'react'

interface VendorApplication {
  id: string
  user_id: string
  business_name: string
  business_type: string
  is_approved: boolean
  stripe_account_id: string | null
  charges_enabled: boolean
  payouts_enabled: boolean
  vendor_tier: string
  total_revenue: number
  total_sales: number
  created_at: string
  email?: string
  full_name?: string
}

interface PlatformStats {
  totalGMV: number
  totalFees: number
  activeVendors: number
  pendingApplications: number
}

export function AdminVendors() {
  const [vendors, setVendors] = useState<VendorApplication[]>([])
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchVendors = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter)
      const res = await fetch(`/api/admin/vendors?${params}`)
      if (!res.ok) return
      const data = await res.json()
      setVendors(data.vendors || [])
      setStats(data.stats || null)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchVendors() }, [fetchVendors])

  const handleAction = async (vendorId: string, action: 'approve' | 'reject') => {
    setActionLoading(vendorId)
    try {
      const res = await fetch('/api/admin/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: vendorId, action }),
      })
      if (res.ok) {
        await fetchVendors()
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(null)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Platform Stats */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.75rem',
        }}>
          {[
            { label: 'Total GMV', value: formatCurrency(stats.totalGMV), color: '#7ed957' },
            { label: 'Platform Fees', value: formatCurrency(stats.totalFees), color: '#00d4ff' },
            { label: 'Active Vendors', value: stats.activeVendors, color: '#a78bfa' },
            { label: 'Pending', value: stats.pendingApplications, color: '#f59e0b' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '0.625rem',
              padding: '1rem',
              border: '1px solid var(--border)',
            }}>
              <div style={{
                fontSize: '0.65rem', color: 'var(--text-muted)',
                fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                marginBottom: '0.375rem',
              }}>{s.label}</div>
              <div style={{
                fontSize: '1.5rem', fontWeight: 700, color: s.color,
                fontFamily: 'var(--font-mono)',
              }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {(['all', 'pending', 'approved'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.375rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid',
              borderColor: filter === f ? '#7ed957' : 'var(--border)',
              background: filter === f ? 'rgba(126,217,87,0.1)' : 'transparent',
              color: filter === f ? '#7ed957' : 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 500,
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontFamily: 'inherit',
            }}
          >{f}</button>
        ))}
      </div>

      {/* Vendor List */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>
          Loading vendors...
        </div>
      ) : vendors.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center', fontSize: '0.85rem' }}>
          No vendor applications found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {vendors.map(v => (
            <div key={v.id} style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '0.875rem 1rem',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '0.625rem',
              border: '1px solid var(--border)',
            }}>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {v.business_name}
                  </span>
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 600,
                    padding: '0.125rem 0.375rem',
                    borderRadius: '9999px',
                    background: v.is_approved
                      ? v.charges_enabled ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)'
                      : 'rgba(239,68,68,0.15)',
                    color: v.is_approved
                      ? v.charges_enabled ? '#10b981' : '#f59e0b'
                      : '#ef4444',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    {v.is_approved ? (v.charges_enabled ? 'Active' : 'Onboarding') : 'Pending'}
                  </span>
                  {v.vendor_tier !== 'standard' && (
                    <span style={{
                      fontSize: '0.6rem', fontWeight: 600,
                      padding: '0.125rem 0.375rem',
                      borderRadius: '9999px',
                      background: 'rgba(167,139,250,0.15)',
                      color: '#a78bfa',
                      textTransform: 'uppercase',
                    }}>{v.vendor_tier}</span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {v.full_name || v.email || v.user_id.slice(0, 8)} &middot; {v.business_type} &middot; {new Date(v.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Stats */}
              {v.is_approved && (
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem', textTransform: 'uppercase' }}>Revenue</div>
                    <div style={{ color: '#7ed957', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      {formatCurrency(v.total_revenue)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.6rem', textTransform: 'uppercase' }}>Sales</div>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                      {v.total_sales}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {!v.is_approved && (
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                  <button
                    onClick={() => handleAction(v.id, 'approve')}
                    disabled={actionLoading === v.id}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '1px solid rgba(126,217,87,0.3)',
                      background: 'rgba(126,217,87,0.1)',
                      color: '#7ed957',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: actionLoading === v.id ? 'not-allowed' : 'pointer',
                      opacity: actionLoading === v.id ? 0.5 : 1,
                      fontFamily: 'inherit',
                    }}
                  >
                    {actionLoading === v.id ? '...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleAction(v.id, 'reject')}
                    disabled={actionLoading === v.id}
                    style={{
                      padding: '0.375rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '1px solid rgba(239,68,68,0.3)',
                      background: 'rgba(239,68,68,0.1)',
                      color: '#ef4444',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      cursor: actionLoading === v.id ? 'not-allowed' : 'pointer',
                      opacity: actionLoading === v.id ? 0.5 : 1,
                      fontFamily: 'inherit',
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
