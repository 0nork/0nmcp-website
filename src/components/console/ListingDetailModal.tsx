'use client'

import { useState } from 'react'
import { X, Zap, ShoppingCart, Check, Loader2, ExternalLink } from 'lucide-react'
import type { StoreListing } from './StoreTypes'

interface ListingDetailModalProps {
  listing: StoreListing
  owned: boolean
  onClose: () => void
  onCheckout: (listingId: string) => Promise<{ free?: boolean; url?: string; error?: string }>
  onOpenActions?: () => void
}

export function ListingDetailModal({
  listing,
  owned,
  onClose,
  onCheckout,
  onOpenActions,
}: ListingDetailModalProps) {
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [justPurchased, setJustPurchased] = useState(false)

  const handlePurchase = async () => {
    setPurchasing(true)
    setError(null)

    const result = await onCheckout(listing.id)

    if (result.error) {
      setError(result.error)
      setPurchasing(false)
      return
    }

    if (result.free) {
      setJustPurchased(true)
      setPurchasing(false)
      return
    }

    if (result.url) {
      window.location.href = result.url
      return
    }

    setPurchasing(false)
  }

  // Parse steps from workflow data if available
  const stepCount = listing.tags?.length || 0

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(10, 10, 15, 0.7)',
          backdropFilter: 'blur(8px)',
          animation: 'console-fade-in 0.15s ease',
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl mx-4 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 40px var(--accent-glow)',
          animation: 'console-scale-in 0.2s ease',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        {/* Cover */}
        <div
          style={{
            height: '8rem',
            background: listing.cover_image_url
              ? `url(${listing.cover_image_url}) center/cover`
              : `linear-gradient(135deg, var(--accent)22, var(--accent-secondary)44)`,
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg cursor-pointer border-none"
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              backdropFilter: 'blur(8px)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title + price */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2
                className="text-xl font-bold mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                {listing.title}
              </h2>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `rgba(255,107,53,0.1)`,
                  color: 'var(--accent)',
                }}
              >
                {listing.category}
              </span>
            </div>
            <span
              className="text-lg font-bold"
              style={{
                color: listing.price === 0 ? 'var(--accent)' : 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {listing.price === 0 ? 'Free' : `$${listing.price.toFixed(2)}`}
            </span>
          </div>

          {/* Description */}
          <p
            className="text-sm mb-6 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {listing.description || 'A premium .0n workflow available in the store.'}
          </p>

          {/* Tags */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="mb-6">
              <h4
                className="text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                Services & Steps
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {listing.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Zap size={10} style={{ color: 'var(--accent)' }} />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div
            className="flex items-center gap-4 mb-6 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            <span>{listing.total_purchases} purchase{listing.total_purchases !== 1 ? 's' : ''}</span>
            {stepCount > 0 && <span>{stepCount} tag{stepCount !== 1 ? 's' : ''}</span>}
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-4 px-4 py-2 rounded-xl text-sm"
              style={{
                backgroundColor: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444',
              }}
            >
              {error}
            </div>
          )}

          {/* Action button */}
          {owned || justPurchased ? (
            <button
              onClick={onOpenActions || onClose}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer border-none"
              style={{
                backgroundColor: 'rgba(0,255,136,0.1)',
                color: '#00ff88',
                border: '1px solid rgba(0,255,136,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0,255,136,0.1)'
              }}
            >
              <Check size={16} />
              {justPurchased ? 'Purchased! Open Actions' : 'Owned — Open Actions'}
            </button>
          ) : (
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer border-none"
              style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                color: 'var(--bg-primary)',
                opacity: purchasing ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!purchasing) {
                  e.currentTarget.style.boxShadow = '0 0 20px var(--accent-glow)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {purchasing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : listing.price === 0 ? (
                <ShoppingCart size={16} />
              ) : (
                <ExternalLink size={16} />
              )}
              {purchasing
                ? 'Processing...'
                : listing.price === 0
                  ? 'Get for Free'
                  : `Purchase $${listing.price.toFixed(2)}`}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes console-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes console-scale-in {
          from { opacity: 0; transform: scale(0.96) translateY(-8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
