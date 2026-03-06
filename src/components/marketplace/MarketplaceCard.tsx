'use client'

import Link from 'next/link'
import ServiceIcon, { ALL_SERVICES } from '@/components/ServiceLogos'
import { MarketplaceListing, getCategoryColor } from './MarketplaceTypes'

function getServiceName(id: string): string {
  return ALL_SERVICES.find((s) => s.id === id)?.name || id
}

export default function MarketplaceCard({ listing, index = 0 }: { listing: MarketplaceListing; index?: number }) {
  const catColor = getCategoryColor(listing.category)
  const maxIcons = 6
  const visibleServices = listing.services.slice(0, maxIcons)
  const extraCount = listing.services.length - maxIcons

  return (
    <Link
      href={`/marketplace/${listing.slug}`}
      className="block rounded-xl transition-all duration-300 no-underline group"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        animation: 'console-stagger-in 0.4s ease both',
        animationDelay: `${index * 50}ms`,
        maxWidth: 320,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = catColor
        el.style.transform = 'translateY(-3px)'
        el.style.boxShadow = `0 8px 28px rgba(0,0,0,0.35), 0 0 16px ${catColor}15`
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement
        el.style.borderColor = 'var(--border)'
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Banner — service icons displayed prominently */}
      <div
        style={{
          aspectRatio: '4/3',
          background: `linear-gradient(145deg, ${catColor}12 0%, ${catColor}30 50%, rgba(10,10,15,0.9) 100%)`,
          borderBottom: '1px solid var(--border)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Background grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(${catColor}18 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            opacity: 0.5,
          }}
        />

        {/* Service icons — centered in banner */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 20px',
            maxWidth: '85%',
          }}
        >
          {visibleServices.map((sId) => (
            <span
              key={sId}
              title={getServiceName(sId)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: 'rgba(10,10,15,0.65)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
            >
              <ServiceIcon id={sId} size={22} />
            </span>
          ))}
          {extraCount > 0 && (
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: 'rgba(10,10,15,0.65)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: 12,
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
              }}
            >
              +{extraCount}
            </span>
          )}

          {/* Fallback if no services */}
          {listing.services.length === 0 && (
            <div style={{ opacity: 0.2 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={catColor} strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>

        {/* Category badge — top left */}
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
          {listing.category}
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px 14px' }}>
        {/* Title — bold and bright */}
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

        {/* Description — white, short */}
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
          {listing.description}
        </p>

        {/* Bottom row: steps + purchases | price */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {listing.step_count} step{listing.step_count !== 1 ? 's' : ''}
            </span>
            {listing.total_purchases > 0 && (
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {listing.total_purchases} install{listing.total_purchases !== 1 ? 's' : ''}
              </span>
            )}
          </div>
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
            {listing.price === 0 ? 'Free' : `$${listing.price.toFixed(2)}`}
          </span>
        </div>
      </div>
    </Link>
  )
}
