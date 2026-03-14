'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ShoppingBag, Sparkles, Tag } from 'lucide-react'
import type { StoreListing, StoreCategory } from '@/components/console/StoreTypes'
import { STORE_CATEGORIES } from '@/components/console/StoreTypes'

export default function MarketplacePage() {
  const router = useRouter()
  const [listings, setListings] = useState<StoreListing[]>([])
  const [purchasedIds, setPurchasedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<StoreCategory>('all')
  const [search, setSearch] = useState('')

  const fetchListings = useCallback(async (cat?: StoreCategory, q?: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (cat && cat !== 'all') params.set('category', cat)
    if (q) params.set('search', q)
    try {
      const res = await fetch(`/api/console/store?${params}`)
      const data = await res.json()
      setListings(data.listings || [])
      setPurchasedIds(data.purchasedListingIds || data.purchasedIds || [])
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  const handleFilter = (cat: StoreCategory) => {
    setCategory(cat)
    fetchListings(cat, search)
  }

  const handleSearch = (q: string) => {
    setSearch(q)
    fetchListings(category, q)
  }

  return (
    <div style={{ padding: '24px 32px 64px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <ShoppingBag size={20} style={{ color: 'var(--accent)' }} />
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          Marketplace
        </h1>
      </div>

      {/* Search + Categories */}
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
            onChange={e => handleSearch(e.target.value)}
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
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {STORE_CATEGORIES.map(c => (
            <button
              key={c.key}
              onClick={() => handleFilter(c.key)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                background: category === c.key ? 'var(--accent-glow, rgba(126,217,87,0.1))' : 'var(--bg-card)',
                color: category === c.key ? 'var(--accent)' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          Loading marketplace...
        </div>
      ) : listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <ShoppingBag size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
          <p style={{ fontSize: '0.875rem' }}>No listings found</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 12,
        }}>
          {listings.map(listing => {
            const owned = purchasedIds.includes(listing.id)
            return (
              <button
                key={listing.id}
                onClick={() => router.push(`/console/marketplace/${listing.slug}`)}
                style={{
                  textAlign: 'left',
                  padding: 20,
                  borderRadius: 14,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.transform = 'none'
                }}
              >
                {/* Cover */}
                {listing.cover_image_url ? (
                  <img
                    src={listing.cover_image_url}
                    alt={listing.title}
                    style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10 }}
                  />
                ) : (
                  <div style={{
                    width: '100%',
                    height: 120,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, rgba(126,217,87,0.1), rgba(0,212,255,0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Sparkles size={24} style={{ color: 'var(--accent)', opacity: 0.4 }} />
                  </div>
                )}

                {/* Title */}
                <h3 style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {listing.title}
                </h3>

                {/* Description */}
                {listing.description && (
                  <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    margin: 0,
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {listing.description}
                  </p>
                )}

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Tag size={12} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {listing.category}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {owned && (
                      <span style={{
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 6,
                        background: 'rgba(126,217,87,0.1)',
                        color: 'var(--accent)',
                      }}>
                        Owned
                      </span>
                    )}
                    <span style={{
                      fontSize: '0.8125rem',
                      fontWeight: 800,
                      color: listing.price === 0 ? 'var(--accent)' : 'var(--text-primary)',
                    }}>
                      {listing.price === 0 ? 'Free' : `$${listing.price.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
