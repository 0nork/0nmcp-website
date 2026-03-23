'use client'

import { useState, useEffect } from 'react'

interface PlanTier {
  key: string
  name: string
  tagline: string
  price: number
  priceId: string
  features: string[]
  highlight?: boolean
}

const TIERS: PlanTier[] = [
  {
    key: 'free',
    name: 'Free',
    tagline: 'Turn It On',
    price: 0,
    priceId: '',
    features: [
      '5 workflow runs/month',
      'Community access',
      'Basic vault storage',
      'Forum support',
    ],
  },
  {
    key: 'supporter',
    name: 'Supporter',
    tagline: 'Power Up',
    price: 9,
    priceId: 'price_1T1rY5HThmAuKVQMEvWdsvcy',
    features: [
      '100 workflow runs/month',
      'Priority support',
      'Extended vault (1GB)',
      'Store discounts',
      'Badge on profile',
    ],
  },
  {
    key: 'builder',
    name: 'Builder',
    tagline: 'Build & Ship',
    price: 29,
    priceId: 'price_1T1rYYHThmAuKVQMZIOi4kdq',
    highlight: true,
    features: [
      'Unlimited workflow runs',
      'API access',
      'Vault (10GB)',
      'Sell on marketplace',
      'Custom domains',
      'Advanced analytics',
    ],
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    tagline: 'Full Control',
    price: 99,
    priceId: 'price_1T1rYiHThmAuKVQMsUKlhrSq',
    features: [
      'Everything in Builder',
      'White-label branding',
      'Unlimited vault',
      'Dedicated support',
      'SLA guarantee',
      'Custom integrations',
      'Team management',
    ],
  },
]

export default function PricingPage() {
  const [currentTier, setCurrentTier] = useState<string>('free')
  const [currentStatus, setCurrentStatus] = useState<string>('none')
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/console/store/subscribe?productId=console')
      .then(r => r.json())
      .then(data => {
        if (data.tier) setCurrentTier(data.tier)
        if (data.status) setCurrentStatus(data.status)
      })
      .catch(() => {})
  }, [])

  const handleSubscribe = async (tier: PlanTier) => {
    if (tier.key === 'free') {
      setLoading(tier.key)
      try {
        const res = await fetch('/api/console/store/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: 'console', tierKey: 'free', billing: 'monthly' }),
        })
        const data = await res.json()
        if (data.success || data.free) {
          setCurrentTier('free')
          setCurrentStatus('active')
        }
      } catch {
        // ignore
      } finally {
        setLoading(null)
      }
      return
    }

    setLoading(tier.key)
    try {
      const res = await fetch('/api/console/store/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'console',
          tierKey: tier.key,
          billing: 'monthly',
        }),
      })
      const data = await res.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else if (data.portalUrl) {
        window.location.href = data.portalUrl
      }
    } catch {
      // ignore
    } finally {
      setLoading(null)
    }
  }

  const isCurrentPlan = (key: string) => {
    if (key === 'free' && (currentTier === 'free' || currentStatus === 'none')) return true
    return currentTier === key && (currentStatus === 'active' || currentStatus === 'trialing')
  }

  return (
    <div style={{ padding: '24px 32px 64px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 900,
          letterSpacing: '-0.02em',
          color: 'var(--jp-text)',
          marginBottom: 8,
        }}>
          Choose Your Plan
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--jp-text-secondary)', maxWidth: 440, margin: '0 auto' }}>
          Scale your AI orchestration with the right plan for your needs. All plans include a 14-day free trial.
        </p>
      </div>

      {/* Pricing Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: 16,
        alignItems: 'start',
      }}>
        {TIERS.map(tier => {
          const isCurrent = isCurrentPlan(tier.key)
          const isHighlight = tier.highlight

          return (
            <div
              key={tier.key}
              style={{
                borderRadius: 16,
                background: 'var(--jp-bg-card)',
                border: isHighlight
                  ? '2px solid var(--jp-green)'
                  : '1px solid var(--jp-border)',
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.2s',
              }}
            >
              {/* Recommended badge */}
              {isHighlight && (
                <div style={{
                  background: 'linear-gradient(135deg, var(--jp-green-dim), var(--jp-green))',
                  color: '#000',
                  fontSize: '0.625rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  textAlign: 'center',
                  padding: '5px 0',
                }}>
                  Recommended
                </div>
              )}

              <div style={{ padding: '24px 20px' }}>
                {/* Name + tagline */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: isHighlight ? 'var(--jp-green)' : 'var(--jp-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    marginBottom: 4,
                  }}>
                    {tier.tagline}
                  </div>
                  <div style={{
                    fontSize: '1.125rem',
                    fontWeight: 800,
                    color: 'var(--jp-text)',
                  }}>
                    {tier.name}
                  </div>
                </div>

                {/* Price */}
                <div style={{ marginBottom: 20 }}>
                  <span style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    color: 'var(--jp-text)',
                    letterSpacing: '-0.03em',
                  }}>
                    ${tier.price}
                  </span>
                  {tier.price > 0 && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--jp-text-muted)' }}>
                      /mo
                    </span>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSubscribe(tier)}
                  disabled={isCurrent || loading === tier.key}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: 8,
                    background: isCurrent
                      ? 'rgba(126,217,87,0.08)'
                      : isHighlight
                        ? 'linear-gradient(135deg, var(--jp-green-dim), var(--jp-green))'
                        : 'none',
                    color: isCurrent
                      ? 'var(--jp-green)'
                      : isHighlight
                        ? '#000'
                        : 'var(--jp-text-secondary)',
                    border: isCurrent || isHighlight
                      ? 'none'
                      : '1px solid var(--jp-border)',
                    cursor: isCurrent ? 'default' : 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    fontFamily: 'inherit',
                    marginBottom: 20,
                    transition: 'all 0.15s',
                  }}
                >
                  {loading === tier.key
                    ? 'Processing...'
                    : isCurrent
                      ? 'Current Plan'
                      : tier.price === 0
                        ? 'Get Started'
                        : 'Subscribe'}
                </button>

                {/* Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {tier.features.map((feature, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="14" height="14" fill="none" stroke="var(--jp-green)" viewBox="0 0 24 24" strokeWidth={2.5} style={{ flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)' }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* FAQ / Note */}
      <div style={{
        marginTop: 40,
        padding: 24,
        borderRadius: 14,
        background: 'var(--jp-bg-card)',
        border: '1px solid var(--jp-border)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', margin: 0 }}>
          All paid plans include a 14-day free trial. Cancel anytime.
          Need something custom?{' '}
          <a
            href="mailto:mike@rocketopp.com"
            style={{ color: 'var(--jp-green)', textDecoration: 'none', fontWeight: 600 }}
          >
            Contact us
          </a>
        </p>
      </div>
    </div>
  )
}
