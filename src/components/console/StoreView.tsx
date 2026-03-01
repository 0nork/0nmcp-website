'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, ShoppingBag, Loader2 } from 'lucide-react'
import { StoreListingCard } from './StoreListingCard'
import { ListingDetailModal } from './ListingDetailModal'
import { STORE_CATEGORIES, type StoreListing, type StoreCategory } from './StoreTypes'

interface StoreViewProps {
  listings: StoreListing[]
  purchasedIds: string[]
  loading: boolean
  onFetch: (category?: StoreCategory, search?: string) => void
  onCheckout: (listingId: string) => Promise<{ free?: boolean; url?: string; error?: string }>
}

export function StoreView({ listings, purchasedIds, loading, onFetch, onCheckout }: StoreViewProps) {
  const [category, setCategory] = useState<StoreCategory>('all')
  const [search, setSearch] = useState('')
  const [selectedListing, setSelectedListing] = useState<StoreListing | null>(null)
  const [searchDebounce, setSearchDebounce] = useState<ReturnType<typeof setTimeout> | null>(null)

  // Initial fetch
  useEffect(() => {
    onFetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCategoryChange = useCallback(
    (cat: StoreCategory) => {
      setCategory(cat)
      onFetch(cat, search || undefined)
    },
    [onFetch, search]
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value)
      if (searchDebounce) clearTimeout(searchDebounce)
      const timer = setTimeout(() => {
        onFetch(category === 'all' ? undefined : category, value || undefined)
      }, 300)
      setSearchDebounce(timer)
    },
    [onFetch, category, searchDebounce]
  )

  return (
    <div
      className="p-4 md:p-6 lg:p-8 max-w-full mx-auto w-full"
      style={{ animation: 'console-fade-in 0.3s ease' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-xl lg:text-2xl font-bold flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <ShoppingBag size={22} style={{ color: 'var(--accent)' }} />
            Store
          </h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {listings.length} {category === 'extensions' ? 'module' : 'workflow'}{listings.length !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-3 px-4 h-10 rounded-xl mb-4"
        style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border)',
        }}
      >
        <Search size={14} style={{ color: 'var(--text-muted)' }} />
        <input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={category === 'extensions' ? 'Search modules...' : 'Search workflows...'}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            border: 'none',
          }}
        />
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STORE_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => handleCategoryChange(cat.key)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer border-none"
            style={{
              backgroundColor:
                category === cat.key ? 'var(--accent-glow)' : 'rgba(255,255,255,0.04)',
              color: category === cat.key ? 'var(--accent)' : 'var(--text-secondary)',
              border:
                category === cat.key
                  ? '1px solid rgba(126,217,87,0.3)'
                  : '1px solid var(--border)',
            }}
            onMouseEnter={(e) => {
              if (category !== cat.key) {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }
            }}
            onMouseLeave={(e) => {
              if (category !== cat.key) {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
        </div>
      )}

      {/* Empty state */}
      {!loading && listings.length === 0 && (
        <div className="text-center py-16">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: 'var(--accent-glow)' }}
          >
            <ShoppingBag size={28} style={{ color: 'var(--accent)' }} />
          </div>
          <h3
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            No {category === 'extensions' ? 'modules' : 'workflows'} found
          </h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {search
              ? 'Try adjusting your search or category filter.'
              : category === 'extensions'
                ? 'Extension modules will appear here once published.'
                : 'Premium workflows will appear here once published.'}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && listings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {listings.map((listing, i) => (
            <StoreListingCard
              key={listing.id}
              listing={listing}
              owned={purchasedIds.includes(listing.id)}
              index={i}
              onClick={() => setSelectedListing(listing)}
            />
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          owned={purchasedIds.includes(selectedListing.id)}
          onClose={() => setSelectedListing(null)}
          onCheckout={onCheckout}
        />
      )}

      <style>{`
        @keyframes console-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes console-stagger-in {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
