'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { PurchaseWithWorkflow } from '@/components/console/StoreTypes'

export default function OrdersPage() {
  const router = useRouter()
  const [purchases, setPurchases] = useState<PurchaseWithWorkflow[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/console/store/purchases')
      .then(r => r.json())
      .then(data => {
        setPurchases(data.purchases || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { background: 'rgba(126,217,87,0.08)', color: 'var(--jp-green)' }
      case 'pending':
        return { background: 'rgba(251,191,36,0.08)', color: 'var(--jp-amber)' }
      case 'refunded':
        return { background: 'rgba(248,113,113,0.08)', color: 'var(--jp-red)' }
      default:
        return { background: 'rgba(96,96,96,0.08)', color: 'var(--jp-text-muted)' }
    }
  }

  return (
    <div style={{ padding: '24px 32px 64px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <svg width="20" height="20" fill="none" stroke="var(--jp-green)" viewBox="0 0 24 24" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--jp-text)' }}>
          Order History
        </h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--jp-text-muted)' }}>
          Loading orders...
        </div>
      ) : purchases.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: 60,
          borderRadius: 14,
          background: 'var(--jp-bg-card)',
          border: '1px solid var(--jp-border)',
        }}>
          <svg width="48" height="48" fill="none" stroke="var(--jp-text-muted)" viewBox="0 0 24 24" strokeWidth={1} style={{ opacity: 0.3, margin: '0 auto 16px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p style={{ fontSize: '0.875rem', color: 'var(--jp-text-muted)', marginBottom: 16 }}>
            No purchases yet
          </p>
          <button
            onClick={() => router.push('/console/marketplace')}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, var(--jp-green-dim), var(--jp-green))',
              color: '#000',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.875rem',
              fontFamily: 'inherit',
            }}
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <div style={{
          borderRadius: 14,
          background: 'var(--jp-bg-card)',
          border: '1px solid var(--jp-border)',
          overflow: 'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 100px 80px 120px',
            gap: 8,
            padding: '12px 20px',
            borderBottom: '1px solid var(--jp-border)',
            fontSize: '0.6875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--jp-text-muted)',
          }}>
            <div>Item</div>
            <div style={{ textAlign: 'right' }}>Amount</div>
            <div style={{ textAlign: 'center' }}>Status</div>
            <div style={{ textAlign: 'right' }}>Date</div>
          </div>

          {/* Rows */}
          {purchases.map((purchase) => {
            const listing = purchase.listing as unknown as Record<string, unknown> | null
            const title = (listing?.title as string) || purchase.workflow_name || 'Unknown Item'
            const statusStyle = getStatusStyle(purchase.status)
            const isExpanded = expandedId === purchase.id

            return (
              <div key={purchase.id}>
                <button
                  onClick={() => setExpandedId(isExpanded ? null : purchase.id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 100px 80px 120px',
                    gap: 8,
                    padding: '14px 20px',
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid var(--jp-border)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    transition: 'background 0.15s',
                    alignItems: 'center',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  {/* Item */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <svg width="16" height="16" fill="none" stroke="var(--jp-green)" viewBox="0 0 24 24" strokeWidth={1.5} style={{ flexShrink: 0, opacity: 0.6 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    <span style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--jp-text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {title}
                    </span>
                  </div>

                  {/* Amount */}
                  <div style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: purchase.amount === 0 ? 'var(--jp-green)' : 'var(--jp-text)',
                    textAlign: 'right',
                  }}>
                    {purchase.amount === 0 ? 'Free' : `$${purchase.amount.toFixed(2)}`}
                  </div>

                  {/* Status */}
                  <div style={{ textAlign: 'center' }}>
                    <span style={{
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 6,
                      textTransform: 'uppercase',
                      ...statusStyle,
                    }}>
                      {purchase.status}
                    </span>
                  </div>

                  {/* Date */}
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--jp-text-muted)',
                    textAlign: 'right',
                  }}>
                    {formatDate(purchase.created_at)}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div style={{
                    padding: '16px 20px 16px 46px',
                    borderBottom: '1px solid var(--jp-border)',
                    background: 'rgba(255,255,255,0.01)',
                  }}>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      {listing && (
                        <div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--jp-text-muted)', marginBottom: 4 }}>Category</div>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', textTransform: 'capitalize' }}>
                            {(listing.category as string) || 'N/A'}
                          </div>
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--jp-text-muted)', marginBottom: 4 }}>Order ID</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--jp-text-secondary)', fontFamily: 'monospace' }}>
                          {purchase.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      {purchase.workflow_id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push('/console/workflows')
                          }}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 6,
                            background: 'var(--jp-green-glow)',
                            color: 'var(--jp-green)',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            fontFamily: 'inherit',
                          }}
                        >
                          Open in Builder
                        </button>
                      )}
                      {(listing?.slug as string) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/console/marketplace/${listing!.slug as string}`)
                          }}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 6,
                            background: 'none',
                            color: 'var(--jp-text-secondary)',
                            border: '1px solid var(--jp-border)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            fontFamily: 'inherit',
                          }}
                        >
                          View Listing
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
