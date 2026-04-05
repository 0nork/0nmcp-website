'use client'

import { useState } from 'react'
import Link from 'next/link'
import { STATS_DISPLAY } from '@/data/stats'

/* ─── Plan definitions ─── */
interface Plan {
  id: string
  name: string
  featured: boolean
  price: string
  priceSub: string
  description: string
  features: string[]
  buttonLabel: string
  buttonHref: string
  color: string
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    featured: false,
    price: '$0',
    priceSub: '/mo',
    description: 'Get started with the essentials.',
    features: [
      '10 executions per day',
      '1 location',
      'Community support',
      `${STATS_DISPLAY.tools} tools access`,
      'Vault encryption',
      'AI chat (limited)',
    ],
    buttonLabel: 'Get Started Free',
    buttonHref: '/api/stripe/checkout?plan=free',
    color: '#6b7280',
  },
  {
    id: 'founders',
    name: 'Founders',
    featured: true,
    price: '$50',
    priceSub: 'one-time',
    description: 'Lifetime badge. Early access. Locked pricing.',
    features: [
      'Lifetime Founders Badge',
      '30 days free, then $80/mo',
      'Unlimited executions',
      '3 locations',
      'Early access to new features',
      'Locked pricing forever',
      'Priority support',
      'AI chat (unlimited)',
    ],
    buttonLabel: 'Claim Founders Access',
    buttonHref: '/api/stripe/checkout?plan=founders',
    color: '#6EE05A',
  },
  {
    id: 'builder',
    name: 'Builder',
    featured: false,
    price: '$180',
    priceSub: '/mo',
    description: 'For teams and agencies. Full power.',
    features: [
      'Unlimited executions',
      '5 locations',
      'Priority support',
      'White-label option',
      'Custom integrations',
      'Dedicated onboarding',
      'AI chat (unlimited)',
      'API access',
    ],
    buttonLabel: 'Go Builder',
    buttonHref: '/api/stripe/checkout?plan=builder',
    color: '#a78bfa',
  },
]

const INCLUDED = [
  `${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services`,
  'AES-256 encrypted Vault',
  'AI-powered chat assistant',
  '.0n workflow engine',
  'Multi-platform install (Claude, Cursor, VS Code, npm)',
  `${STATS_DISPLAY.capabilities} automation capabilities`,
  'Community forum access',
  'Automatic updates',
]

/* ─── Component ─── */
export function SubscribeClient() {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      fontFamily: "'Instrument Sans', system-ui, sans-serif",
    }}>
      {/* ── Header ── */}
      <div style={{
        textAlign: 'center',
        padding: '5rem 1.5rem 3rem',
        maxWidth: '700px',
        margin: '0 auto',
      }}>
        <Link
          href="/start"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.8125rem',
            color: '#6b7280',
            textDecoration: 'none',
            marginBottom: '1.5rem',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Install
        </Link>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          margin: '0 0 0.75rem',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}>
          Choose Your Plan
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: '#6b7280',
          lineHeight: 1.6,
          margin: 0,
        }}>
          Every plan includes {STATS_DISPLAY.tools} tools and {STATS_DISPLAY.services} services.
          Scale when you need to.
        </p>
      </div>

      {/* ── Pricing Cards ── */}
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 1.5rem 3rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.25rem',
        alignItems: 'start',
      }}>
        {PLANS.map(plan => {
          const isHovered = hoveredPlan === plan.id
          const isFeatured = plan.featured
          return (
            <div
              key={plan.id}
              onMouseEnter={() => setHoveredPlan(plan.id)}
              onMouseLeave={() => setHoveredPlan(null)}
              style={{
                background: 'var(--bg-card)',
                borderRadius: '16px',
                padding: isFeatured ? '2rem' : '1.75rem',
                border: isFeatured
                  ? '2px solid #6EE05A'
                  : '1px solid #e5e7eb',
                boxShadow: isFeatured
                  ? '0 8px 40px rgba(110, 224, 90, 0.15), 0 2px 8px rgba(0,0,0,0.06)'
                  : isHovered
                    ? '0 8px 30px rgba(0,0,0,0.08)'
                    : '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'all 0.25s',
                transform: isFeatured ? 'scale(1.02)' : isHovered ? 'translateY(-2px)' : 'none',
                position: 'relative',
              }}
            >
              {/* Featured ribbon */}
              {isFeatured && (
                <div style={{
                  position: 'absolute',
                  top: '-1px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#6EE05A',
                  color: '#000',
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  padding: '0.25rem 1rem',
                  borderRadius: '0 0 8px 8px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>
                  Most Popular
                </div>
              )}

              {/* Plan name */}
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: plan.color,
                marginBottom: '0.5rem',
                marginTop: isFeatured ? '0.5rem' : 0,
              }}>
                {plan.name}
              </div>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.5rem' }}>
                <span style={{
                  fontSize: '2.75rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {plan.priceSub}
                </span>
              </div>

              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
                {plan.description}
              </p>

              {/* Features */}
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: '0 0 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.625rem',
              }}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    <svg
                      width="16" height="16" viewBox="0 0 16 16" fill="none"
                      style={{ flexShrink: 0, marginTop: '2px' }}
                    >
                      <path d="M3.5 8.5l3 3 6-6" stroke={plan.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <a
                href={plan.buttonHref}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '0.875rem',
                  borderRadius: '12px',
                  background: isFeatured ? '#6EE05A' : '#f3f4f6',
                  color: isFeatured ? '#000' : '#374151',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  border: isFeatured ? 'none' : '1px solid #e5e7eb',
                  transition: 'all 0.2s',
                  boxShadow: isFeatured ? '0 4px 20px rgba(110, 224, 90, 0.3)' : 'none',
                }}
              >
                {plan.buttonLabel}
              </a>
            </div>
          )
        })}
      </div>

      {/* ── All Plans Include ── */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '3rem 1.5rem 5rem',
      }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid var(--border)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 1.25rem',
            textAlign: 'center',
          }}>
            All plans include
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '0.75rem',
          }}>
            {INCLUDED.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M3.5 8.5l3 3 6-6" stroke="#6EE05A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Fine print */}
        <p style={{
          textAlign: 'center',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          marginTop: '2rem',
          lineHeight: 1.6,
        }}>
          Founders pricing locks at $80/mo after 30-day trial. Cancel anytime.
          <br />
          All payments processed securely via Stripe.
        </p>
      </div>
    </div>
  )
}
