'use client'

import { useState } from 'react'
import { X, Check, Loader2, Users, Building2, Rocket, Crown, Sparkles } from 'lucide-react'
import { SOCIAL_ENGINE_TIERS } from './StoreTypes'

interface UpgradeModalProps {
  currentPlan: string
  onClose: () => void
  onSwitched?: () => void
  ref?: string
}

const TIER_ORDER = ['free', 'creator', 'operator', 'agency', 'enterprise']

const TIER_STYLES: Record<string, {
  icon: typeof Sparkles
  color: string
  bg: string
  borderActive: string
  gradientEnd: string
  topLabel?: string
}> = {
  free: {
    icon: Sparkles,
    color: 'var(--text-muted)',
    bg: 'var(--bg-card)',
    borderActive: 'rgba(255,255,255,0.2)',
    gradientEnd: '#666',
  },
  creator: {
    icon: Rocket,
    color: '#6EE05A',
    bg: 'rgba(126,217,87,0.08)',
    borderActive: 'rgba(126,217,87,0.4)',
    gradientEnd: '#4CAF3D',
  },
  operator: {
    icon: Users,
    color: '#00d4ff',
    bg: 'rgba(0,212,255,0.08)',
    borderActive: 'rgba(0,212,255,0.4)',
    gradientEnd: '#0099cc',
  },
  agency: {
    icon: Building2,
    color: '#ff6b35',
    bg: 'rgba(255,107,53,0.08)',
    borderActive: 'rgba(255,107,53,0.4)',
    gradientEnd: '#cc5529',
    topLabel: 'SELL ON MARKETPLACE',
  },
  enterprise: {
    icon: Crown,
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    borderActive: 'rgba(167,139,250,0.4)',
    gradientEnd: '#7c3aed',
  },
}

export function UpgradeModal({ currentPlan, onClose, onSwitched }: UpgradeModalProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [error, setError] = useState<string | null>(null)

  // Owner/VIP — no upgrade needed
  if (currentPlan === 'owner') {
    onClose()
    return null
  }

  const currentIndex = TIER_ORDER.indexOf(currentPlan)

  const handleSelectPlan = async (tierKey: string) => {
    if (tierKey === currentPlan) return
    setLoading(tierKey)
    setError(null)

    try {
      const res = await fetch('/api/console/plan/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetTier: tierKey, billing }),
      })
      const data = await res.json()

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
        return
      }

      if (data.success) {
        onSwitched?.()
        onClose()
        return
      }

      if (data.error) {
        setError(data.error)
      }
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(null)
    }
  }

  const getButtonLabel = (tierKey: string) => {
    const tierIndex = TIER_ORDER.indexOf(tierKey)
    if (tierKey === currentPlan) return 'Current Plan'
    if (currentPlan === 'free') return 'Start Free Trial'
    if (tierKey === 'free') return 'Downgrade to Free'
    if (tierIndex > currentIndex) return 'Upgrade'
    return 'Downgrade'
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(12px)',
          animation: 'console-fade-in 0.15s ease',
        }}
        onClick={onClose}
      />

      {/* Card */}
      <div
        className="relative w-full max-w-[1100px] mx-4 rounded-xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          animation: 'console-scale-in 0.2s ease',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Community upgrade banner */}
        {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('ref') === 'community' && (
          <div
            className="w-full py-3 px-6 text-sm font-medium"
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(126,217,87,0.08) 100%)',
              color: '#00d4ff',
              borderBottom: '1px solid rgba(0,212,255,0.2)',
            }}
          >
            Grid access is included with Creator plan and above. Upgrade to join the community, earn Plugs, and unlock Keys.
          </div>
        )}

        {/* Trial banner */}
        {currentPlan === 'free' && (
          <div
            className="w-full py-2.5 text-center text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg, rgba(126,217,87,0.15) 0%, rgba(0,212,255,0.1) 100%)',
              color: '#6EE05A',
              borderBottom: '1px solid rgba(126,217,87,0.2)',
            }}
          >
            Start your 7-day free trial
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {currentPlan === 'free' ? 'Upgrade your Console' : 'Switch Plan'}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Cancel anytime. No commitment.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Monthly/Yearly toggle */}
            <div
              className="flex rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}
            >
              {(['monthly', 'yearly'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className="px-3 py-1.5 text-xs font-semibold border-none cursor-pointer transition-all"
                  style={{
                    backgroundColor: billing === b ? 'rgba(126,217,87,0.15)' : 'transparent',
                    color: billing === b ? '#6EE05A' : 'var(--text-muted)',
                  }}
                >
                  {b === 'monthly' ? 'Monthly' : 'Yearly (Save 2mo)'}
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg cursor-pointer border-none bg-transparent transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-6 mb-3 px-4 py-2.5 rounded-lg text-sm" style={{
            backgroundColor: 'rgba(255,59,48,0.1)',
            color: '#ff3b30',
            border: '1px solid rgba(255,59,48,0.2)',
          }}>
            {error}
          </div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 px-6 pb-4">
          {SOCIAL_ENGINE_TIERS.map((tier) => {
            const style = TIER_STYLES[tier.key] || TIER_STYLES.free
            const Icon = style.icon
            const isCurrent = currentPlan === tier.key
            const isLoading = loading === tier.key
            const tierIndex = TIER_ORDER.indexOf(tier.key)
            const isDowngrade = tierIndex < currentIndex
            const price = billing === 'yearly' && tier.priceYearly
              ? Math.round(tier.priceYearly / 12)
              : tier.priceMonthly

            return (
              <div
                key={tier.key}
                className="rounded-xl p-4 transition-all relative flex flex-col"
                style={{
                  backgroundColor: style.bg,
                  border: isCurrent
                    ? `2px solid ${style.borderActive}`
                    : tier.highlight
                      ? `1px solid ${style.borderActive}`
                      : '1px solid var(--border)',
                }}
              >
                {/* Top label */}
                {style.topLabel && (
                  <div
                    className="text-center text-[8px] font-bold tracking-widest mb-2 -mt-0.5"
                    style={{ color: style.color, letterSpacing: '0.1em' }}
                  >
                    {style.topLabel}
                  </div>
                )}

                {isCurrent && (
                  <div
                    className="text-center text-[8px] font-bold tracking-widest mb-2 -mt-0.5"
                    style={{ color: style.color, letterSpacing: '0.1em' }}
                  >
                    CURRENT PLAN
                  </div>
                )}

                {/* Plan header */}
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} style={{ color: style.color }} />
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {tier.label}
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-0.5 mb-1">
                  <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    ${price}
                  </span>
                  {tier.priceMonthly > 0 && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/mo</span>
                  )}
                </div>

                {/* Users/Locations summary */}
                <div className="text-[10px] mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {tier.maxUsers} user{tier.maxUsers !== 1 ? 's' : ''}
                  {tier.maxLocations > 0 && ` · ${tier.maxLocations} location${tier.maxLocations !== 1 ? 's' : ''}`}
                </div>

                {/* Features */}
                <ul className="space-y-1.5 mb-4 flex-1">
                  {tier.features.slice(1).map((feature) => (
                    <li key={feature} className="flex items-start gap-1.5">
                      <Check size={12} className="mt-0.5 shrink-0" style={{ color: style.color }} />
                      <span className="text-[11px] leading-tight" style={{ color: 'var(--text-secondary)' }}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Add-on pricing */}
                {tier.addOns && (
                  <div className="text-[9px] mb-3 px-2 py-1.5 rounded" style={{
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                  }}>
                    +${tier.addOns.extraUserMonthly}/user · +${tier.addOns.extraLocationMonthly}/loc
                  </div>
                )}

                {/* CTA */}
                <button
                  onClick={() => handleSelectPlan(tier.key)}
                  disabled={isCurrent || isLoading}
                  className="w-full py-2 rounded-lg text-xs font-semibold cursor-pointer border-none transition-all"
                  style={{
                    background: isCurrent
                      ? 'var(--border)'
                      : isDowngrade
                        ? 'var(--border)'
                        : `linear-gradient(135deg, ${style.color}, ${style.gradientEnd})`,
                    color: isCurrent
                      ? 'var(--text-muted)'
                      : isDowngrade
                        ? 'var(--text-secondary)'
                        : '#0B0F19',
                    opacity: isCurrent ? 0.7 : 1,
                    border: isDowngrade && !isCurrent ? '1px solid var(--border)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isCurrent) e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin mx-auto" />
                  ) : (
                    getButtonLabel(tier.key)
                  )}
                </button>

                {isDowngrade && !isCurrent && tier.key !== 'free' && (
                  <div className="text-[9px] text-center mt-1.5" style={{ color: 'var(--text-muted)' }}>
                    Effective at period end
                  </div>
                )}
              </div>
            )
          })}
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
