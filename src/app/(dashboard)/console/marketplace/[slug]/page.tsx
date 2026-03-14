'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ShoppingBag, Sparkles, Tag, Download, Blocks, Zap, CheckCircle } from 'lucide-react'
import type { StoreListing } from '@/components/console/StoreTypes'

interface ListingDetail extends StoreListing {
  workflow_data?: Record<string, unknown> | null
}

export default function MarketplaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [listing, setListing] = useState<ListingDetail | null>(null)
  const [owned, setOwned] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  const fetchListing = useCallback(async () => {
    try {
      const res = await fetch(`/api/console/store?search=${encodeURIComponent(slug)}`)
      const data = await res.json()
      const found = (data.listings || []).find((l: StoreListing) => l.slug === slug)
      if (found) {
        setListing(found)
        setOwned((data.purchasedIds || []).includes(found.id))
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchListing()
  }, [fetchListing])

  const handleCheckout = async () => {
    if (!listing) return
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/console/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id }),
      })
      const data = await res.json()
      if (data.free) {
        setOwned(true)
        router.push('/console/workflows')
      } else if (data.url || data.checkoutUrl) {
        window.location.href = data.url || data.checkoutUrl
      }
    } catch {
      // ignore
    } finally {
      setCheckoutLoading(false)
    }
  }

  const handleOpenInBuilder = async () => {
    if (!listing) return
    try {
      const res = await fetch('/api/console/store/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id }),
      })
      const data = await res.json()
      if (data.workflow) {
        localStorage.setItem('0nmcp-builder-import', JSON.stringify(data.workflow))
        router.push('/builder')
      }
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading...
      </div>
    )
  }

  if (!listing) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Listing not found</p>
        <button
          onClick={() => router.push('/console/marketplace')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            background: 'var(--accent)',
            color: '#0a0a0f',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '0.8125rem',
            fontFamily: 'inherit',
          }}
        >
          Back to Marketplace
        </button>
      </div>
    )
  }

  const steps = listing.workflow_data
    ? (listing.workflow_data as { steps?: unknown[] }).steps?.length || 0
    : 0
  const services = listing.tags || []

  return (
    <div style={{ padding: '24px 32px 64px', maxWidth: 800, margin: '0 auto' }}>
      {/* Back */}
      <button
        onClick={() => router.push('/console/marketplace')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem',
          fontFamily: 'inherit',
          marginBottom: 24,
          padding: 0,
        }}
      >
        <ArrowLeft size={14} />
        Back to Marketplace
      </button>

      {/* Cover */}
      {listing.cover_image_url ? (
        <img
          src={listing.cover_image_url}
          alt={listing.title}
          style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 16, marginBottom: 24 }}
        />
      ) : (
        <div style={{
          width: '100%',
          height: 200,
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(126,217,87,0.08), rgba(0,212,255,0.08))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}>
          <Sparkles size={40} style={{ color: 'var(--accent)', opacity: 0.3 }} />
        </div>
      )}

      {/* Title + Price */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.02em', margin: 0 }}>
            {listing.title}
          </h1>
          {listing.vendor_name && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              by {listing.vendor_name}
            </p>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 900,
            color: listing.price === 0 ? 'var(--accent)' : 'var(--text-primary)',
          }}>
            {listing.price === 0 ? 'Free' : `$${(listing.price / 100).toFixed(2)}`}
          </div>
          {listing.total_purchases > 0 && (
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              {listing.total_purchases} purchases
            </div>
          )}
        </div>
      </div>

      {/* Meta chips */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '4px 10px',
          borderRadius: 6,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          fontSize: '0.6875rem',
          color: 'var(--text-secondary)',
        }}>
          <Tag size={10} />
          {listing.category}
        </span>
        {steps > 0 && (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 10px',
            borderRadius: 6,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            fontSize: '0.6875rem',
            color: 'var(--text-secondary)',
          }}>
            <Zap size={10} />
            {steps} steps
          </span>
        )}
        {services.map(s => (
          <span
            key={s}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              background: 'rgba(126,217,87,0.06)',
              fontSize: '0.6875rem',
              color: 'var(--accent)',
              fontWeight: 600,
            }}
          >
            {s}
          </span>
        ))}
      </div>

      {/* Description */}
      {listing.description && (
        <div style={{
          padding: 20,
          borderRadius: 14,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          marginBottom: 24,
        }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
            {listing.description}
          </p>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {owned ? (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 20px',
              borderRadius: 10,
              background: 'rgba(126,217,87,0.08)',
              color: 'var(--accent)',
              fontSize: '0.875rem',
              fontWeight: 700,
            }}>
              <CheckCircle size={16} />
              Owned
            </div>
            <button
              onClick={handleOpenInBuilder}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 20px',
                borderRadius: 10,
                background: 'var(--accent)',
                color: '#0a0a0f',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.875rem',
                fontFamily: 'inherit',
              }}
            >
              <Blocks size={16} />
              Open in Builder
            </button>
            <button
              onClick={() => router.push('/console/workflows')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 20px',
                borderRadius: 10,
                background: 'var(--bg-card)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                fontFamily: 'inherit',
              }}
            >
              <Download size={16} />
              View in Workflows
            </button>
          </>
        ) : (
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 28px',
              borderRadius: 10,
              background: checkoutLoading ? 'var(--text-muted)' : 'var(--accent)',
              color: '#0a0a0f',
              border: 'none',
              cursor: checkoutLoading ? 'wait' : 'pointer',
              fontWeight: 800,
              fontSize: '0.9375rem',
              fontFamily: 'inherit',
            }}
          >
            <ShoppingBag size={16} />
            {checkoutLoading
              ? 'Processing...'
              : listing.price === 0
                ? 'Get Workflow (Free)'
                : `Get Workflow — $${(listing.price / 100).toFixed(2)}`}
          </button>
        )}
      </div>
    </div>
  )
}
