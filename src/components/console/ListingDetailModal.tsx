'use client'

import { useState, useEffect } from 'react'
import { X, Zap, ShoppingCart, Check, Loader2, ExternalLink, Crown } from 'lucide-react'
import type { StoreListing, SubscriptionStatus } from './StoreTypes'
import { SOCIAL_ENGINE_TIERS } from './StoreTypes'

interface ListingDetailModalProps {
  listing: StoreListing
  owned: boolean
  onClose: () => void
  onCheckout: (listingId: string) => Promise<{ free?: boolean; url?: string; error?: string }>
  onSubscribe?: (productId: string, tierKey: string, billing: 'monthly' | 'yearly') => Promise<{
    free?: boolean; checkoutUrl?: string; portalUrl?: string; error?: string
  }>
  onGetSubscription?: (productId: string) => Promise<SubscriptionStatus>
  onOpenActions?: () => void
}

export function ListingDetailModal({
  listing,
  owned,
  onClose,
  onCheckout,
  onSubscribe,
  onGetSubscription,
  onOpenActions,
}: ListingDetailModalProps) {
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [justPurchased, setJustPurchased] = useState(false)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [loadingSub, setLoadingSub] = useState(false)

  const isExtension = listing.category === 'extensions'
  const productId = listing.slug === 'social-intelligence-engine' ? 'social-engine' : listing.slug

  // Load subscription status for extension listings
  useEffect(() => {
    if (isExtension && onGetSubscription) {
      setLoadingSub(true)
      onGetSubscription(productId).then(sub => {
        setSubscription(sub)
        setLoadingSub(false)
      })
    }
  }, [isExtension, onGetSubscription, productId])

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

  const handleSubscribe = async (tierKey: string) => {
    if (!onSubscribe) return
    setPurchasing(true)
    setError(null)

    const result = await onSubscribe(productId, tierKey, billing)

    if (result.error) {
      setError(result.error)
      setPurchasing(false)
      return
    }

    if (result.free) {
      setSubscription({ tier: tierKey, status: 'active' })
      setJustPurchased(true)
      setPurchasing(false)
      return
    }

    if (result.portalUrl) {
      window.location.href = result.portalUrl
      return
    }

    if (result.checkoutUrl) {
      window.location.href = result.checkoutUrl
      return
    }

    setPurchasing(false)
  }

  // Extension listing — tier-based UI
  if (isExtension && onSubscribe) {
    const currentTier = subscription?.tier || 'free'
    const isActive = subscription?.status === 'active' || subscription?.status === 'trialing'

    return (
      <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[5vh]">
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
          className="relative w-full max-w-5xl mx-4 rounded-2xl overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 40px var(--accent-glow)',
            animation: 'console-scale-in 0.2s ease',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.5rem 1.5rem 1rem',
              background: 'linear-gradient(135deg, rgba(66,133,244,0.08), rgba(126,217,87,0.08))',
              borderBottom: '1px solid var(--border)',
              position: 'relative',
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg cursor-pointer border-none"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: 'var(--text-secondary)',
              }}
            >
              <X size={16} />
            </button>

            <h2
              className="text-xl font-bold mb-1"
              style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
            >
              {listing.title}
            </h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
              {listing.description}
            </p>

            {/* Billing toggle */}
            <div
              className="inline-flex items-center gap-1 mt-3 p-0.5 rounded-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}
            >
              <button
                onClick={() => setBilling('monthly')}
                className="px-3 py-1 text-xs font-semibold rounded-md cursor-pointer border-none transition-all"
                style={{
                  backgroundColor: billing === 'monthly' ? 'var(--accent)' : 'transparent',
                  color: billing === 'monthly' ? 'var(--bg-primary)' : 'var(--text-muted)',
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling('yearly')}
                className="px-3 py-1 text-xs font-semibold rounded-md cursor-pointer border-none transition-all"
                style={{
                  backgroundColor: billing === 'yearly' ? 'var(--accent)' : 'transparent',
                  color: billing === 'yearly' ? 'var(--bg-primary)' : 'var(--text-muted)',
                }}
              >
                Yearly
                <span
                  className="ml-1"
                  style={{ color: billing === 'yearly' ? 'var(--bg-primary)' : '#7ed957', fontSize: 10 }}
                >
                  Save 2mo
                </span>
              </button>
            </div>

            {/* Current subscription badge */}
            {isActive && currentTier !== 'free' && (
              <div
                className="inline-flex items-center gap-1.5 ml-3 px-2.5 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: 'rgba(126,217,87,0.1)',
                  border: '1px solid rgba(126,217,87,0.25)',
                  color: '#7ed957',
                  verticalAlign: 'middle',
                }}
              >
                <Crown size={11} />
                {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Plan
                {subscription?.status === 'trialing' && ' (Trial)'}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div
              className="mx-6 mt-4 px-4 py-2 rounded-xl text-sm"
              style={{
                backgroundColor: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444',
              }}
            >
              {error}
            </div>
          )}

          {/* Tier Grid */}
          <div className="p-6">
            {loadingSub ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
              </div>
            ) : (
              <div
                className="grid gap-3"
                style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
              >
                {SOCIAL_ENGINE_TIERS.map(tier => {
                  const isCurrent = currentTier === tier.key && isActive
                  const isDowngrade = isActive && getTierRank(tier.key) < getTierRank(currentTier)
                  const price = billing === 'yearly' && tier.priceYearly !== null
                    ? Math.round(tier.priceYearly / 12)
                    : tier.priceMonthly
                  const totalYearly = tier.priceYearly

                  return (
                    <div
                      key={tier.key}
                      style={{
                        borderRadius: '0.875rem',
                        border: tier.highlight
                          ? '1.5px solid rgba(126,217,87,0.4)'
                          : isCurrent
                            ? '1.5px solid rgba(126,217,87,0.3)'
                            : '1px solid var(--border)',
                        background: tier.highlight
                          ? 'linear-gradient(180deg, rgba(126,217,87,0.06), transparent)'
                          : 'var(--bg-card)',
                        padding: '1.25rem 1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Highlight badge */}
                      {tier.highlight && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            backgroundColor: 'var(--accent)',
                            color: 'var(--bg-primary)',
                            fontSize: 9,
                            fontWeight: 800,
                            padding: '2px 10px 2px 12px',
                            borderRadius: '0 0.875rem 0 8px',
                            letterSpacing: '0.06em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Popular
                        </div>
                      )}

                      {/* Tier name */}
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: tier.highlight ? '#7ed957' : 'var(--text-muted)',
                          marginBottom: 2,
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {tier.label}
                      </div>

                      {/* Tagline */}
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          marginBottom: 8,
                        }}
                      >
                        {tier.tagline}
                      </div>

                      {/* Price */}
                      <div style={{ marginBottom: 12 }}>
                        <span
                          style={{
                            fontSize: 28,
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-mono)',
                            lineHeight: 1,
                          }}
                        >
                          {price === 0 ? '$0' : `$${price}`}
                        </span>
                        {price > 0 && (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 2 }}>
                            /mo
                          </span>
                        )}
                        {billing === 'yearly' && totalYearly !== null && price > 0 && (
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                            ${totalYearly}/yr billed annually
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <div style={{ flex: 1, marginBottom: 14 }}>
                        {tier.features.map(f => (
                          <div
                            key={f}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 6,
                              fontSize: 11,
                              color: 'var(--text-secondary)',
                              marginBottom: 5,
                              lineHeight: '1.4',
                            }}
                          >
                            <Check
                              size={12}
                              style={{
                                color: tier.highlight ? '#7ed957' : 'var(--text-muted)',
                                flexShrink: 0,
                                marginTop: 1,
                              }}
                            />
                            {f}
                          </div>
                        ))}
                      </div>

                      {/* CTA button */}
                      {isCurrent ? (
                        <button
                          disabled
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border-none"
                          style={{
                            backgroundColor: 'rgba(126,217,87,0.1)',
                            color: '#7ed957',
                            cursor: 'default',
                          }}
                        >
                          <Check size={13} />
                          Current Plan
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscribe(tier.key)}
                          disabled={purchasing}
                          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all"
                          style={{
                            background: tier.key === 'free'
                              ? 'rgba(255,255,255,0.06)'
                              : tier.highlight
                                ? 'linear-gradient(135deg, var(--accent), #5cb83a)'
                                : 'rgba(126,217,87,0.12)',
                            color: tier.highlight ? 'var(--bg-primary)' : tier.key === 'free' ? 'var(--text-secondary)' : '#7ed957',
                            opacity: purchasing ? 0.6 : 1,
                          }}
                          onMouseEnter={e => {
                            if (!purchasing && !tier.highlight) {
                              e.currentTarget.style.backgroundColor = 'rgba(126,217,87,0.2)'
                            }
                          }}
                          onMouseLeave={e => {
                            if (!purchasing && !tier.highlight) {
                              e.currentTarget.style.backgroundColor = tier.key === 'free'
                                ? 'rgba(255,255,255,0.06)'
                                : 'rgba(126,217,87,0.12)'
                            }
                          }}
                        >
                          {purchasing ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : tier.key === 'free' ? (
                            'Get Started'
                          ) : isDowngrade ? (
                            'Downgrade'
                          ) : (
                            <>
                              {isActive ? 'Upgrade' : 'Start Free Trial'}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Trial note */}
            <p
              className="text-center mt-4"
              style={{ fontSize: 11, color: 'var(--text-muted)' }}
            >
              All paid plans include a 14-day free trial. Cancel anytime.
            </p>
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

  // ─── Standard one-time purchase modal (non-extension) ───────
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
                backgroundColor: 'rgba(126,217,87,0.1)',
                color: '#7ed957',
                border: '1px solid rgba(126,217,87,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(126,217,87,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(126,217,87,0.1)'
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

function getTierRank(tier: string): number {
  const ranks: Record<string, number> = {
    free: 0, creator: 1, operator: 2, agency: 3, enterprise: 4, owner: 5,
  }
  return ranks[tier] ?? 0
}
