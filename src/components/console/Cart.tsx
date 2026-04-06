'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getCart, removeFromCart, getCartCount, getCartTotal, clearCart, type CartItem } from '@/lib/cart'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) setItems(getCart())
  }, [isOpen])

  useEffect(() => {
    const handler = () => setItems(getCart())
    window.addEventListener('cart-updated', handler)
    return () => window.removeEventListener('cart-updated', handler)
  }, [])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    setTimeout(() => document.addEventListener('mousedown', handler), 10)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen, onClose])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const handleRemove = (listingId: string) => {
    removeFromCart(listingId)
    setItems(getCart())
  }

  const handleCheckout = () => {
    onClose()
    router.push('/console/checkout')
  }

  const handleClear = () => {
    clearCart()
    setItems([])
  }

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 1090,
          opacity: isOpen ? 1 : 0,
          visibility: isOpen ? 'visible' : 'hidden',
          transition: 'all 0.25s ease',
        }}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 380,
          maxWidth: '100vw',
          background: 'var(--jp-bg-elevated)',
          borderLeft: '1px solid var(--jp-border)',
          zIndex: 1100,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isOpen ? '-8px 0 32px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--jp-border)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="20" height="20" fill="none" stroke="var(--jp-green)" viewBox="0 0 24 24" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--jp-text)' }}>
              Cart ({items.length})
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--jp-text-secondary)',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 6,
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 12,
            }}>
              <svg width="48" height="48" fill="none" stroke="var(--jp-text-muted)" viewBox="0 0 24 24" strokeWidth={1} style={{ opacity: 0.4 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span style={{ fontSize: '0.875rem', color: 'var(--jp-text-muted)' }}>
                Your cart is empty
              </span>
              <button
                onClick={() => { onClose(); router.push('/console/marketplace') }}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'var(--jp-green-glow)',
                  color: 'var(--jp-green)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  marginTop: 4,
                }}
              >
                Browse Store
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map(item => (
                <div
                  key={item.listingId}
                  style={{
                    display: 'flex',
                    gap: 12,
                    padding: 14,
                    borderRadius: 10,
                    background: 'var(--jp-bg-card)',
                    border: '1px solid var(--jp-border)',
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
                    <div style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--jp-text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--jp-text-muted)', marginTop: 2 }}>
                      {item.category}
                      {item.vendorName ? ` · ${item.vendorName}` : ''}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                      <span style={{
                        fontSize: '0.8125rem',
                        fontWeight: 800,
                        color: item.price === 0 ? 'var(--jp-green)' : 'var(--jp-text)',
                      }}>
                        {item.price === 0 ? 'Free' : `$${(item.price / 100).toFixed(2)}`}
                      </span>
                      <button
                        onClick={() => handleRemove(item.listingId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--jp-red)',
                          cursor: 'pointer',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: '16px 24px 20px',
            borderTop: '1px solid var(--jp-border)',
            flexShrink: 0,
          }}>
            {/* Subtotal */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--jp-text-secondary)' }}>
                Subtotal
              </span>
              <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--jp-text)' }}>
                ${(total / 100).toFixed(2)}
              </span>
            </div>

            {/* Checkout button */}
            <button
              onClick={handleCheckout}
              style={{
                width: '100%',
                padding: '12px 24px',
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--jp-green-dim), var(--jp-green))',
                color: '#000',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.9375rem',
                fontFamily: 'inherit',
                marginBottom: 8,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Checkout
            </button>

            {/* Clear cart */}
            <button
              onClick={handleClear}
              style={{
                width: '100%',
                padding: '8px 16px',
                borderRadius: 8,
                background: 'none',
                color: 'var(--jp-text-muted)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--jp-red)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--jp-text-muted)')}
            >
              Clear Cart
            </button>
          </div>
        )}
      </div>
    </>
  )
}

/** Cart icon button for the header — shows item count badge */
export function CartButton() {
  const [count, setCount] = useState(0)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setCount(getCartCount())
    const handler = () => setCount(getCartCount())
    window.addEventListener('cart-updated', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('cart-updated', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  return (
    <>
      <button
        onClick={() => setDrawerOpen(true)}
        title="Shopping Cart"
        style={{
          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 8, background: 'none', border: 'none', color: 'var(--text-secondary)',
          cursor: 'pointer', position: 'relative',
        }}
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        {count > 0 && (
          <span style={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: 'var(--jp-green)',
            color: '#000',
            fontSize: '0.625rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--jp-bg-elevated)',
            lineHeight: 1,
          }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
      <CartDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}

export default CartDrawer
