'use client'

import { Check } from 'lucide-react'
import type { StoreListing } from './StoreTypes'

interface StoreListingCardProps {
  listing: StoreListing
  owned: boolean
  index: number
  onClick: () => void
}

const isExtension = (listing: StoreListing) => listing.category === 'extensions'

export function StoreListingCard({ listing, owned, index, onClick }: StoreListingCardProps) {
  const ext = isExtension(listing)
  const catColor = getCategoryColor(listing.category)

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl transition-all duration-300 cursor-pointer border-none"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: owned ? '1px solid rgba(126,217,87,0.3)' : '1px solid var(--border)',
        animation: 'console-stagger-in 0.4s ease both',
        animationDelay: `${index * 60}ms`,
        padding: 0,
        overflow: 'hidden',
        maxWidth: 320,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = owned ? 'rgba(126,217,87,0.5)' : catColor
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = `0 8px 28px rgba(0,0,0,0.35), 0 0 16px ${catColor}15`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = owned ? 'rgba(126,217,87,0.3)' : 'var(--border)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Banner — category gradient with icon */}
      <div
        style={{
          aspectRatio: '4/3',
          background: listing.cover_image_url
            ? `url(${listing.cover_image_url}) center/cover`
            : `linear-gradient(145deg, ${catColor}12 0%, ${catColor}30 50%, rgba(10,10,15,0.9) 100%)`,
          borderBottom: '1px solid var(--border)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(${catColor}18 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            opacity: 0.5,
          }}
        />

        {/* Center icon */}
        {!listing.cover_image_url && (
          <div style={{ opacity: 0.2, position: 'relative' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={catColor} strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {/* Category badge */}
        <span
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            fontSize: 9,
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '3px 7px',
            borderRadius: 5,
            backgroundColor: `${catColor}25`,
            color: catColor,
            border: `1px solid ${catColor}35`,
          }}
        >
          {ext ? 'extension' : listing.category}
        </span>

        {/* Extension badge */}
        {ext && (
          <span
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: '#4285f4',
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 6,
              backdropFilter: 'blur(4px)',
            }}
          >
            <ChromeIcon />
            Module
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px 14px' }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: 4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.35',
            letterSpacing: '-0.01em',
          }}
        >
          {listing.title}
        </h3>
        <p
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.7)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.5',
            marginBottom: 10,
          }}
        >
          {listing.description || (ext ? 'Chrome extension module' : 'Premium .0n workflow')}
        </p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: 20,
              backgroundColor: listing.price === 0 ? 'rgba(126,217,87,0.12)' : 'rgba(255,107,53,0.12)',
              color: listing.price === 0 ? 'var(--accent)' : '#ff6b35',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {listing.price === 0
              ? 'Free'
              : `$${listing.price.toFixed(2)}${ext ? '/mo' : ''}`}
          </span>

          {owned && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 10,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 20,
                backgroundColor: 'rgba(126,217,87,0.15)',
                color: '#7ed957',
              }}
            >
              <Check size={10} />
              {ext ? 'Enabled' : 'Owned'}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

function ChromeIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#4285f4" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="4" fill="#4285f4" />
    </svg>
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
    extensions: '#4285f4',
    automation: '#7ed957',
  }
  return colors[category] || '#ff6b35'
}
