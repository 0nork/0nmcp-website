'use client'

import Link from 'next/link'
import ServiceIcon, { ALL_SERVICES } from '@/components/ServiceLogos'
import { MarketplaceListing, getCategoryColor } from './MarketplaceTypes'

function getServiceName(id: string): string {
  return ALL_SERVICES.find((s) => s.id === id)?.name || id
}

export default function MarketplaceListItem({ listing, index = 0 }: { listing: MarketplaceListing; index?: number }) {
  const catColor = getCategoryColor(listing.category)
  const desc = listing.long_description || listing.description || ''
  const truncDesc = desc.length > 280 ? desc.slice(0, 280) + '...' : desc

  return (
    <Link
      href={`/marketplace/${listing.slug}`}
      className="flex gap-4 rounded-xl p-4 transition-all duration-300 no-underline group"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        animation: 'console-stagger-in 0.4s ease both',
        animationDelay: `${index * 40}ms`,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--accent)'
        el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2), 0 0 12px rgba(126,217,87,0.06)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--border)'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Thumbnail — 4:3, 120px wide */}
      <div
        className="shrink-0 hidden sm:block"
        style={{
          width: 120,
          aspectRatio: '4/3',
          borderRadius: 8,
          background: listing.cover_image_url
            ? `url(${listing.cover_image_url}) center/cover`
            : `linear-gradient(135deg, ${catColor}15, ${catColor}40)`,
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!listing.cover_image_url && (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.2 }}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={catColor} strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {listing.title}
          </h3>
          <span
            className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: listing.price === 0 ? 'rgba(126,217,87,0.1)' : 'rgba(255,107,53,0.1)',
              color: listing.price === 0 ? 'var(--accent)' : '#ff6b35',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {listing.price === 0 ? 'Free' : `$${listing.price.toFixed(2)}`}
          </span>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '2px 6px',
              borderRadius: 4,
              backgroundColor: `${catColor}20`,
              color: catColor,
            }}
          >
            {listing.category}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {listing.step_count} step{listing.step_count !== 1 ? 's' : ''}
          </span>
          {listing.total_purchases > 0 && (
            <span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {listing.total_purchases} install{listing.total_purchases !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {truncDesc}
        </p>

        {/* Services + tags */}
        <div className="flex items-center gap-2 flex-wrap">
          {listing.services.slice(0, 6).map((sId) => (
            <span
              key={sId}
              className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              <ServiceIcon id={sId} size={12} />
              {getServiceName(sId)}
            </span>
          ))}
          {listing.services.length > 6 && (
            <span className="text-[10px]" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              +{listing.services.length - 6} more
            </span>
          )}
          {listing.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{
                backgroundColor: 'rgba(126,217,87,0.06)',
                color: 'var(--text-muted)',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
