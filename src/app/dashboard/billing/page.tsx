'use client'

import { useState, useEffect } from 'react'

interface SubData {
  tier: string
  status: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  trialEnd?: string
}

interface BalanceData {
  balance: number
  lifetime_earned: number
  lifetime_spent: number
}

export default function BillingPage() {
  const [sub, setSub] = useState<SubData | null>(null)
  const [balance, setBalance] = useState<BalanceData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/console/store/subscribe?productId=console').then(r => r.json()).catch(() => null),
      fetch('/api/sparks/balance').then(r => r.json()).catch(() => null),
    ]).then(([subData, balData]) => {
      if (subData) setSub(subData)
      if (balData) setBalance(balData)
      setLoading(false)
    })
  }, [])

  const handleManage = async () => {
    // For active subscriptions, the subscribe endpoint returns a portalUrl
    const res = await fetch('/api/console/store/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 'console', tierKey: sub?.tier || 'free', billing: 'monthly' }),
    })
    const data = await res.json()
    if (data.portalUrl) {
      window.location.href = data.portalUrl
    } else if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '24px 32px', color: 'var(--jp-text-muted)', fontSize: '0.875rem' }}>
        Loading billing information...
      </div>
    )
  }

  const tierLabel = sub?.tier
    ? sub.tier.charAt(0).toUpperCase() + sub.tier.slice(1)
    : 'Free'

  const statusLabel = sub?.status === 'active' ? 'Active'
    : sub?.status === 'trialing' ? 'Trial'
    : sub?.status === 'past_due' ? 'Past Due'
    : sub?.status === 'cancelled' ? 'Cancelled'
    : 'Inactive'

  const statusColor = sub?.status === 'active' || sub?.status === 'trialing'
    ? 'var(--jp-green)'
    : sub?.status === 'past_due'
      ? '#f59e0b'
      : 'var(--jp-text-muted)'

  return (
    <div style={{ padding: '24px 32px', maxWidth: 700 }}>
      <h1 style={{
        fontSize: '1.25rem',
        fontWeight: 800,
        color: 'var(--jp-text)',
        marginBottom: 24,
      }}>
        Billing
      </h1>

      {/* Subscription Card */}
      <div style={{
        background: 'var(--jp-bg-card)',
        border: '1px solid var(--jp-border)',
        borderRadius: 14,
        padding: 24,
        marginBottom: 16,
      }}>
        <div style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'var(--jp-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 12,
        }}>
          Current Plan
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--jp-text)' }}>
            {tierLabel}
          </span>
          <span style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: 20,
            background: `${statusColor}18`,
            color: statusColor,
          }}>
            {statusLabel}
          </span>
        </div>

        {sub?.currentPeriodEnd && (
          <div style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)', marginBottom: 8 }}>
            {sub.cancelAtPeriodEnd ? 'Cancels' : 'Renews'} on{' '}
            {new Date(sub.currentPeriodEnd).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })}
          </div>
        )}

        {sub?.trialEnd && sub.status === 'trialing' && (
          <div style={{ fontSize: '0.8125rem', color: '#f59e0b', marginBottom: 8 }}>
            Trial ends{' '}
            {new Date(sub.trialEnd).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {sub?.status === 'active' || sub?.status === 'trialing' ? (
            <button
              onClick={handleManage}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'none',
                border: '1px solid var(--jp-border)',
                color: 'var(--jp-text-secondary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Manage Subscription
            </button>
          ) : (
            <a
              href="/console/pricing"
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                background: 'linear-gradient(135deg, var(--jp-green-dim), var(--jp-green))',
                color: '#000',
                fontSize: '0.8125rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Upgrade Plan
            </a>
          )}
        </div>
      </div>

      {/* Sparks Balance Card */}
      <div style={{
        background: 'var(--jp-bg-card)',
        border: '1px solid var(--jp-border)',
        borderRadius: 14,
        padding: 24,
      }}>
        <div style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'var(--jp-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: 12,
        }}>
          Sparks Balance
        </div>

        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--jp-green)' }}>
              {balance?.balance ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)' }}>Available</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--jp-text)' }}>
              {balance?.lifetime_earned ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)' }}>Lifetime Earned</div>
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--jp-text)' }}>
              {balance?.lifetime_spent ?? 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--jp-text-muted)' }}>Lifetime Spent</div>
          </div>
        </div>
      </div>
    </div>
  )
}
