'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, ShoppingBag, Sparkles, Tag, ShoppingCart, Check } from 'lucide-react'
import type { StoreListing, StoreCategory } from '@/components/console/StoreTypes'
import { STORE_CATEGORIES } from '@/components/console/StoreTypes'
import { addToCart, isInCart } from '@/lib/cart'

async function safeJson(res: Response) {
  try {
    const text = await res.text()
    if (!text) return {}
    return JSON.parse(text)
  } catch {
    return {}
  }
}

export default function MarketplacePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [listings, setListings] = useState<StoreListing[]>([])
  const [purchasedIds, setPurchasedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<StoreCategory>('all')
  const [search, setSearch] = useState('')
  const [cartItems, setCartItems] = useState<Set<string>>(new Set())
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null)

  // Check for checkout success/cancel
  const checkoutStatus = searchParams.get('checkout')

  const fetchListings = useCallback(async (cat?: StoreCategory, q?: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (cat && cat !== 'all') params.set('category', cat)
    if (q) params.set('search', q)
    try {
      const res = await fetch(`/api/console/store?${params}`)
      const data = await safeJson(res)
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

  // Sync cart state
  useEffect(() => {
    const syncCart = () => {
      const set = new Set<string>()
      listings.forEach(l => { if (isInCart(l.id)) set.add(l.id) })
      setCartItems(set)
    }
    syncCart()
    window.addEventListener('cart-updated', syncCart)
    return () => window.removeEventListener('cart-updated', syncCart)
  }, [listings])

  const handleFilter = (cat: StoreCategory) => {
    setCategory(cat)
    fetchListings(cat, search)
  }

  const handleSearch = (q: string) => {
    setSearch(q)
    fetchListings(category, q)
  }

  const handleAddToCart = (e: React.MouseEvent, listing: StoreListing) => {
    e.stopPropagation()
    addToCart({
      listingId: listing.id,
      name: listing.title,
      price: Math.round(listing.price * 100),
      vendorId: listing.vendor_id,
      vendorName: listing.vendor_name,
      image: listing.cover_image_url,
      slug: listing.slug,
      category: listing.category,
    })
    setAddedFeedback(listing.id)
    setTimeout(() => setAddedFeedback(null), 1500)
  }

  return (
    <div style={{ padding: '24px 20px 64px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Checkout success/cancel banner */}
      {checkoutStatus === 'success' && (
        <div style={{
          padding: '12px 20px',
          borderRadius: 10,
          background: 'rgba(126,217,87,0.08)',
          border: '1px solid rgba(126,217,87,0.2)',
          color: 'var(--accent)',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <Check size={16} />
          Purchase complete! Your items have been added to your account.
        </div>
      )}
      {checkoutStatus === 'cancelled' && (
        <div style={{
          padding: '12px 20px',
          borderRadius: 10,
          background: 'rgba(251,191,36,0.08)',
          border: '1px solid rgba(251,191,36,0.2)',
          color: '#d97706',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: 20,
        }}>
          Checkout was cancelled. Your cart items are still saved.
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <ShoppingBag size={20} style={{ color: 'var(--accent)' }} />
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
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
                border: category === c.key ? '1px solid rgba(126,217,87,0.3)' : '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                fontFamily: 'inherit',
                background: category === c.key ? 'var(--accent-glow)' : 'var(--bg-card)',
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
            const inCart = cartItems.has(listing.id)
            const justAdded = addedFeedback === listing.id

            return (
              <div
                key={listing.id}
                style={{
                  textAlign: 'left',
                  borderRadius: 14,
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  transition: 'all 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-hover)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.transform = 'none'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Cover -- clickable to detail page */}
                <button
                  onClick={() => router.push(`/console/marketplace/${listing.slug}`)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'block',
                    width: '100%',
                  }}
                >
                  {listing.cover_image_url ? (
                    <img
                      src={listing.cover_image_url}
                      alt={listing.title}
                      style={{ width: '100%', height: 140, objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: 140,
                      background: 'linear-gradient(135deg, rgba(126,217,87,0.08), rgba(0,212,255,0.08))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Sparkles size={28} style={{ color: 'var(--accent)', opacity: 0.3 }} />
                    </div>
                  )}
                </button>

                {/* Content */}
                <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                  {/* Title -- clickable */}
                  <button
                    onClick={() => router.push(`/console/marketplace/${listing.slug}`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      textAlign: 'left',
                    }}
                  >
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
                  </button>

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

                  {/* Price + Category */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Tag size={12} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {listing.category}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.9375rem',
                      fontWeight: 800,
                      color: listing.price === 0 ? 'var(--accent)' : 'var(--accent)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {listing.price === 0 ? 'Free' : `$${listing.price.toFixed(2)}`}
                    </span>
                  </div>

                  {/* Action button */}
                  <div style={{ marginTop: 8 }}>
                    {owned ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        padding: '8px 12px',
                        borderRadius: 8,
                        background: 'rgba(126,217,87,0.08)',
                        color: 'var(--accent)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}>
                        <Check size={14} />
                        Owned
                      </div>
                    ) : inCart ? (
                      <button
                        onClick={() => router.push('/console/checkout')}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: 'rgba(126,217,87,0.08)',
                          color: 'var(--accent)',
                          border: '1px solid rgba(126,217,87,0.2)',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          fontFamily: 'inherit',
                          transition: 'all 0.15s',
                        }}
                      >
                        <Check size={14} />
                        In Cart — Checkout
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleAddToCart(e, listing)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: justAdded
                            ? 'rgba(126,217,87,0.12)'
                            : 'var(--cta-bg)',
                          color: justAdded ? 'var(--accent)' : 'var(--cta-text)',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          fontFamily: 'inherit',
                          transition: 'all 0.15s',
                        }}
                      >
                        {justAdded ? (
                          <>
                            <Check size={14} />
                            Added!
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={14} />
                            {listing.price === 0 ? 'Get Free' : `Purchase $${listing.price.toFixed(2)}`}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
