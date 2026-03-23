'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCart, removeFromCart, clearCart, getCartTotal, type CartItem } from '@/lib/cart'

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    setItems(getCart())
    // Fetch user info
    fetch('/api/console/account')
      .then(r => r.json())
      .then(data => {
        setUserEmail(data.email || '')
        setUserName(data.full_name || '')
      })
      .catch(() => {})
  }, [])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const freeItems = items.filter(i => i.price === 0)
  const paidItems = items.filter(i => i.price > 0)

  const handleRemove = (listingId: string) => {
    removeFromCart(listingId)
    setItems(getCart())
  }

  const handleCheckout = async () => {
    if (items.length === 0) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/console/store/cart-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            listingId: i.listingId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            vendorId: i.vendorId,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Checkout failed')
        setLoading(false)
        return
      }

      // Clear cart on success
      clearCart()

      if (data.checkoutUrl) {
        // Redirect to Stripe for paid items
        window.location.href = data.checkoutUrl
      } else {
        // All free items — go back to marketplace
        router.push('/console/marketplace?checkout=success')
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div style={{ padding: '24px 32px 64px', maxWidth: 800, margin: '0 auto' }}>
        <div style={{
          textAlign: 'center',
          padding: 60,
        }}>
          <svg width="48" height="48" fill="none" stroke="var(--jp-text-muted)" viewBox="0 0 24 24" strokeWidth={1} style={{ opacity: 0.4, margin: '0 auto 16px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <p style={{ color: 'var(--jp-text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>
            Your cart is empty
          </p>
          <button
            onClick={() => router.push('/console/marketplace')}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, var(--jp-green-dim), var(--jp-green))',
              color: '#000',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.875rem',
              fontFamily: 'inherit',
            }}
          >
            Browse Marketplace
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px 32px 64px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--jp-text-muted)',
            padding: 4,
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--jp-text)' }}>
          Checkout
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Left — Items */}
        <div>
          {/* Account info */}
          <div style={{
            padding: 20,
            borderRadius: 14,
            background: 'var(--jp-bg-card)',
            border: '1px solid var(--jp-border)',
            marginBottom: 16,
          }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--jp-text-muted)', marginBottom: 10 }}>
              Account
            </div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--jp-text)' }}>
              {userName || 'User'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--jp-text-secondary)', marginTop: 2 }}>
              {userEmail}
            </div>
          </div>

          {/* Cart items */}
          <div style={{
            borderRadius: 14,
            background: 'var(--jp-bg-card)',
            border: '1px solid var(--jp-border)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid var(--jp-border)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--jp-text-muted)',
            }}>
              Items ({items.length})
            </div>

            {items.map((item, idx) => (
              <div
                key={item.listingId}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '16px 20px',
                  borderBottom: idx < items.length - 1 ? '1px solid var(--jp-border)' : 'none',
                  alignItems: 'center',
                }}
              >
                {/* Thumbnail */}
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, rgba(126,217,87,0.1), rgba(0,212,255,0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="18" height="18" fill="none" stroke="var(--jp-green)" viewBox="0 0 24 24" strokeWidth={1.5} style={{ opacity: 0.5 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--jp-text)' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--jp-text-muted)', marginTop: 2 }}>
                    {item.category}{item.vendorName ? ` · by ${item.vendorName}` : ''}
                  </div>
                </div>

                {/* Price */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 800,
                    color: item.price === 0 ? 'var(--jp-green)' : 'var(--jp-text)',
                  }}>
                    {item.price === 0 ? 'Free' : `$${(item.price / 100).toFixed(2)}`}
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => handleRemove(item.listingId)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--jp-text-muted)',
                    padding: 4,
                    borderRadius: 4,
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--jp-red)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--jp-text-muted)')}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Order Summary */}
        <div style={{
          position: 'sticky',
          top: 88,
          borderRadius: 14,
          background: 'var(--jp-bg-card)',
          border: '1px solid var(--jp-border)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--jp-border)',
            fontSize: '0.6875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--jp-text-muted)',
          }}>
            Order Summary
          </div>

          <div style={{ padding: 20 }}>
            {/* Line items summary */}
            {paidItems.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)' }}>
                  Paid items ({paidItems.length})
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--jp-text)' }}>
                  ${(paidItems.reduce((s, i) => s + i.price, 0) / 100).toFixed(2)}
                </span>
              </div>
            )}
            {freeItems.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--jp-text-secondary)' }}>
                  Free items ({freeItems.length})
                </span>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--jp-green)' }}>
                  $0.00
                </span>
              </div>
            )}

            {/* Divider */}
            <div style={{ borderTop: '1px solid var(--jp-border)', margin: '12px 0' }} />

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--jp-text)' }}>
                Total
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--jp-text)' }}>
                ${(total / 100).toFixed(2)}
              </span>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 8,
                background: 'rgba(248,113,113,0.08)',
                color: 'var(--jp-red)',
                fontSize: '0.75rem',
                fontWeight: 600,
                marginBottom: 12,
              }}>
                {error}
              </div>
            )}

            {/* Pay button */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: 10,
                background: loading
                  ? 'var(--jp-text-muted)'
                  : 'linear-gradient(135deg, var(--jp-green-dim), var(--jp-green))',
                color: '#000',
                border: 'none',
                cursor: loading ? 'wait' : 'pointer',
                fontWeight: 800,
                fontSize: '0.9375rem',
                fontFamily: 'inherit',
                transition: 'opacity 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {loading ? (
                'Processing...'
              ) : total > 0 ? (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Pay with Stripe
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Get Items (Free)
                </>
              )}
            </button>

            {/* Security note */}
            {total > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                marginTop: 12,
                color: 'var(--jp-text-muted)',
                fontSize: '0.6875rem',
              }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Secure checkout powered by Stripe
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
