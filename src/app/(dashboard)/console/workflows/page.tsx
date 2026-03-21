'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Blocks, Download, Zap, Tag, Search, ShoppingBag, Play, Sparkles } from 'lucide-react'
import type { PurchaseWithWorkflow } from '@/components/console/StoreTypes'

type FilterMode = 'all' | 'purchased' | 'created'

export default function WorkflowsPage() {
  const router = useRouter()
  const [purchases, setPurchases] = useState<PurchaseWithWorkflow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterMode>('all')
  const [search, setSearch] = useState('')

  const fetchPurchases = useCallback(async () => {
    try {
      const res = await fetch('/api/console/store/purchases')
      if (res.ok) {
        const data = await res.json()
        setPurchases(data.purchases || data || [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPurchases()
  }, [fetchPurchases])

  // Load locally-created workflows from localStorage
  const [localWorkflows, setLocalWorkflows] = useState<Array<{ name: string; data: Record<string, unknown>; createdAt: string }>>([])
  useEffect(() => {
    try {
      const saved = localStorage.getItem('0nmcp-user-workflows')
      if (saved) setLocalWorkflows(JSON.parse(saved))
    } catch {
      // ignore
    }
  }, [])

  const handleOpenInBuilder = (workflowData: Record<string, unknown>) => {
    localStorage.setItem('0nmcp-builder-import', JSON.stringify(workflowData))
    router.push('/builder')
  }

  const handleExport = (workflowData: Record<string, unknown>, name: string) => {
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name.replace(/\s+/g, '-').toLowerCase()}.0n`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRun = async (workflowData: Record<string, unknown>) => {
    try {
      await fetch('/api/console/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow: workflowData }),
      })
    } catch {
      // ignore
    }
  }

  // Filter & search
  const filteredPurchases = purchases.filter(p => {
    if (filter === 'created') return false
    const name = p.listing?.title || p.workflow_name || ''
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const filteredLocal = localWorkflows.filter(w => {
    if (filter === 'purchased') return false
    if (search && !w.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalCount = filteredPurchases.length + filteredLocal.length

  return (
    <div style={{ padding: '24px 32px 64px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Zap size={20} style={{ color: 'var(--accent)' }} />
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            My Workflows
          </h1>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {totalCount}
          </span>
        </div>
        <button
          onClick={() => router.push('/console/marketplace')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 16px',
            borderRadius: 8,
            background: 'var(--accent)',
            color: '#0f1419',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.8125rem',
            fontFamily: 'inherit',
          }}
        >
          <ShoppingBag size={14} />
          Browse Store
        </button>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          borderRadius: 10,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          flex: '1 1 200px',
          maxWidth: 320,
        }}>
          <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search workflows..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.8125rem',
              width: '100%',
              fontFamily: 'inherit',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', 'purchased', 'created'] as FilterMode[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                background: filter === f ? 'var(--accent-glow, rgba(126,217,87,0.1))' : 'var(--bg-card)',
                color: filter === f ? 'var(--accent)' : 'var(--text-secondary)',
                textTransform: 'capitalize',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          Loading workflows...
        </div>
      ) : totalCount === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Zap size={32} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: 8 }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>
            No workflows yet
          </p>
          <button
            onClick={() => router.push('/console/marketplace')}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: 'var(--accent)',
              color: '#0f1419',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8125rem',
              fontFamily: 'inherit',
            }}
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 12,
        }}>
          {/* Purchased Workflows */}
          {filteredPurchases.map(purchase => {
            const listing = purchase.listing
            const workflowData = purchase.workflow_data
            const name = listing?.title || purchase.workflow_name || 'Untitled'
            const category = listing?.category || 'workflow'
            const tags = listing?.tags || []

            return (
              <div
                key={purchase.id}
                style={{
                  padding: 20,
                  borderRadius: 14,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingBag size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}>
                    {name}
                  </h3>
                  <span style={{
                    fontSize: '0.5625rem',
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: 'rgba(126,217,87,0.08)',
                    color: 'var(--accent)',
                    fontWeight: 700,
                  }}>
                    Purchased
                  </span>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: 'rgba(255,255,255,0.03)',
                    fontSize: '0.625rem',
                    color: 'var(--text-muted)',
                  }}>
                    <Tag size={8} />
                    {category}
                  </span>
                  {tags.slice(0, 3).map(t => (
                    <span
                      key={t}
                      style={{
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'rgba(126,217,87,0.04)',
                        fontSize: '0.625rem',
                        color: 'var(--accent)',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Date */}
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                  Purchased {new Date(purchase.created_at).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                  {workflowData && (
                    <>
                      <button
                        onClick={() => handleOpenInBuilder(workflowData)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 12px',
                          borderRadius: 6,
                          background: 'var(--accent)',
                          color: '#0f1419',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 700,
                          fontSize: '0.6875rem',
                          fontFamily: 'inherit',
                        }}
                      >
                        <Blocks size={12} />
                        Builder
                      </button>
                      <button
                        onClick={() => handleRun(workflowData)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 12px',
                          borderRadius: 6,
                          background: 'rgba(126,217,87,0.08)',
                          color: 'var(--accent)',
                          border: '1px solid rgba(126,217,87,0.15)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.6875rem',
                          fontFamily: 'inherit',
                        }}
                      >
                        <Play size={12} />
                        Run
                      </button>
                      <button
                        onClick={() => handleExport(workflowData, name)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '6px 12px',
                          borderRadius: 6,
                          background: 'transparent',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.6875rem',
                          fontFamily: 'inherit',
                        }}
                      >
                        <Download size={12} />
                        Export
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}

          {/* Locally Created Workflows */}
          {filteredLocal.map((w, i) => (
            <div
              key={`local-${i}`}
              style={{
                padding: 20,
                borderRadius: 14,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={14} style={{ color: '#a78bfa', flexShrink: 0 }} />
                <h3 style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {w.name}
                </h3>
                <span style={{
                  fontSize: '0.5625rem',
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: 'rgba(167,139,250,0.08)',
                  color: '#a78bfa',
                  fontWeight: 700,
                }}>
                  Created
                </span>
              </div>

              <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>
                Created {new Date(w.createdAt).toLocaleDateString()}
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                <button
                  onClick={() => handleOpenInBuilder(w.data)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: 'var(--accent)',
                    color: '#0f1419',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                    fontFamily: 'inherit',
                  }}
                >
                  <Blocks size={12} />
                  Builder
                </button>
                <button
                  onClick={() => handleRun(w.data)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: 'rgba(126,217,87,0.08)',
                    color: 'var(--accent)',
                    border: '1px solid rgba(126,217,87,0.15)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.6875rem',
                    fontFamily: 'inherit',
                  }}
                >
                  <Play size={12} />
                  Run
                </button>
                <button
                  onClick={() => handleExport(w.data, w.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '6px 12px',
                    borderRadius: 6,
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.6875rem',
                    fontFamily: 'inherit',
                  }}
                >
                  <Download size={12} />
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
