'use client'

import { Check } from 'lucide-react'
import type { StoreListing } from './StoreTypes'

interface StoreListingCardProps {
  listing: StoreListing
  owned: boolean
  index: number
  onClick: () => void
}

export function StoreListingCard({ listing, owned, index, onClick }: StoreListingCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl transition-all duration-300 cursor-pointer border-none"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: owned ? '1px solid rgba(126,217,87,0.3)' : '1px solid var(--border)',
        animation: 'console-stagger-in 0.4s ease both',
        animationDelay: `${index * 60}ms`,
        padding: 0,
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = owned ? 'rgba(126,217,87,0.5)' : 'var(--accent)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = owned ? 'rgba(126,217,87,0.3)' : 'var(--border)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Cover gradient */}
      <div
        style={{
          height: '4rem',
          background: listing.cover_image_url
            ? `url(${listing.cover_image_url}) center/cover`
            : `linear-gradient(135deg, ${getCategoryColor(listing.category)}22, ${getCategoryColor(listing.category)}44)`,
          borderBottom: '1px solid var(--border)',
        }}
      />

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        <h3
          className="text-sm font-semibold truncate mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {listing.title}
        </h3>
        <p
          className="text-xs mb-3"
          style={{
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.5',
            minHeight: '2.25rem',
          }}
        >
          {listing.description || 'Premium .0n workflow'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Price */}
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: listing.price === 0 ? 'rgba(126,217,87,0.1)' : 'rgba(255,107,53,0.1)',
              color: listing.price === 0 ? 'var(--accent)' : 'var(--accent)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {listing.price === 0 ? 'Free' : `$${listing.price.toFixed(2)}`}
          </span>

          <div className="flex items-center gap-2">
            {/* Category tag */}
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: `${getCategoryColor(listing.category)}15`,
                color: getCategoryColor(listing.category),
              }}
            >
              {listing.category}
            </span>

            {/* Owned badge */}
            {owned && (
              <span
                className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: 'rgba(126,217,87,0.15)',
                  color: '#7ed957',
                }}
              >
                <Check size={10} />
                Owned
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    marketing: '#ff6b35',
    sales: '#00d4ff',
    support: '#a855f7',
    data: '#22d3ee',
    devops: '#f59e0b',
    custom: '#ec4899',
  }
  return colors[category] || '#ff6b35'
}
