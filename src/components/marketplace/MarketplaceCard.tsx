'use client'

import Link from 'next/link'
import ServiceIcon, { ALL_SERVICES } from '@/components/ServiceLogos'
import { MarketplaceListing, getCategoryColor } from './MarketplaceTypes'

function getServiceName(id: string): string {
  return ALL_SERVICES.find((s) => s.id === id)?.name || id
}

export default function MarketplaceCard({ listing, index = 0 }: { listing: MarketplaceListing; index?: number }) {
  const catColor = getCategoryColor(listing.category)
  const maxIcons = 4
  const visibleServices = listing.services.slice(0, maxIcons)
  const extraCount = listing.services.length - maxIcons

  return (
    <Link
      href={`/marketplace/${listing.slug}`}
      className="block rounded-2xl transition-all duration-300 no-underline group"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        animation: 'console-stagger-in 0.4s ease both',
        animationDelay: `${index * 50}ms`,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--accent)'
        el.style.transform = 'translateY(-4px)'
        el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(126,217,87,0.08)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--border)'
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Cover — 4:3 aspect ratio */}
      <div
        style={{
          aspectRatio: '4/3',
          background: listing.cover_image_url
            ? `url(${listing.cover_image_url}) center/cover`
            : `linear-gradient(135deg, ${catColor}15, ${catColor}40)`,
          borderBottom: '1px solid var(--border)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Category badge — top left */}
        <span
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            fontSize: 10,
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            padding: '3px 8px',
            borderRadius: 6,
            backgroundColor: `${catColor}20`,
            color: catColor,
            border: `1px solid ${catColor}30`,
          }}
        >
          {listing.category}
        </span>

        {/* Service icons — bottom right */}
        {listing.services.length > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              right: 10,
              display: 'flex',
              gap: 4,
              alignItems: 'center',
            }}
          >
            {visibleServices.map((sId) => (
              <span
                key={sId}
                title={getServiceName(sId)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  backgroundColor: 'rgba(10,10,15,0.7)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <ServiceIcon id={sId} size={16} />
              </span>
            ))}
            {extraCount > 0 && (
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  backgroundColor: 'rgba(10,10,15,0.7)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.08)',
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)',
                }}
              >
                +{extraCount}
              </span>
            )}
          </div>
        )}

        {/* Center decoration when no cover image */}
        {!listing.cover_image_url && (
          <div style={{ opacity: 0.15 }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={catColor} strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px 16px' }}>
        <h3
          className="text-sm font-semibold mb-1"
          style={{
            color: 'var(--text-primary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.4',
          }}
        >
          {listing.title}
        </h3>
        <p
          className="text-xs mb-3"
          style={{
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: '1.5',
          }}
        >
          {listing.description}
        </p>

        {/* Bottom row: steps + purchases | price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {listing.step_count} step{listing.step_count !== 1 ? 's' : ''}
            </span>
            {listing.total_purchases > 0 && (
              <span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {listing.total_purchases} install{listing.total_purchases !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: listing.price === 0 ? 'rgba(126,217,87,0.1)' : 'rgba(255,107,53,0.1)',
              color: listing.price === 0 ? 'var(--accent)' : '#ff6b35',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {listing.price === 0 ? 'Free' : `$${listing.price.toFixed(2)}`}
          </span>
        </div>
      </div>
    </Link>
  )
}
