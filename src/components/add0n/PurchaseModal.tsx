// components/add0n/PurchaseModal.tsx
// Handles the Stripe checkout flow from within the iframe.

'use client'

import { useState } from 'react'

interface PurchaseModalProps {
  listing:    { id: string; title: string; price_cents: number; description: string; icon_emoji: string }
  locationId: string
  onClose:    () => void
  onComplete: () => void
}

export default function PurchaseModal({ listing, locationId, onClose, onComplete }: PurchaseModalProps) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/console/store/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          listingId:  listing.id,
          locationId,
          successUrl: `${window.location.origin}/install/success?location_id=${locationId}`,
          cancelUrl:  `${window.location.origin}/install/error?reason=cancelled`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)

      if (data.purchased) {
        // Free or already purchased
        onComplete()
        return
      }

      if (data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.top ? (window.top.location.href = data.checkoutUrl) : (window.location.href = data.checkoutUrl)
        return
      }

      throw new Error('Unexpected checkout response')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Checkout failed')
    } finally {
      setLoading(false)
    }
  }

  const price = `$${(listing.price_cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">{listing.icon_emoji}</div>
        <h2 className="modal-title">{listing.title}</h2>
        <p className="modal-desc">{listing.description}</p>
        {error && <p className="modal-error">{error}</p>}
        <div className="modal-footer">
          <button className="modal-cancel" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="modal-buy" onClick={handleCheckout} disabled={loading}>
            {loading ? 'Loading...' : `Purchase ${price}`}
          </button>
        </div>
      </div>
      <style>{`
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,.8); z-index:200; display:flex; align-items:center; justify-content:center; padding:24px; }
        .modal { background:#0E1117; border:1px solid #1e2533; border-radius:16px; padding:32px; max-width:460px; width:100%; }
        .modal-icon { font-size:40px; margin-bottom:16px; }
        .modal-title { font-family:'Barlow',sans-serif; font-weight:900; font-size:22px; color:#e2e8f0; margin:0 0 12px; }
        .modal-desc  { font-size:14px; color:#7a8694; font-family:'Space Grotesk',sans-serif; line-height:1.6; margin:0 0 24px; }
        .modal-error { font-size:13px; color:#ff6b6b; font-family:'JetBrains Mono',monospace; margin:0 0 16px; }
        .modal-footer { display:flex; gap:12px; justify-content:flex-end; }
        .modal-cancel { background:none; border:1px solid #1e2533; border-radius:8px; color:#7a8694; cursor:pointer; font-family:'Space Grotesk',sans-serif; padding:10px 20px; }
        .modal-buy    { background:#6EE05A; border:none; border-radius:8px; color:#080B0F; cursor:pointer; font-family:'Barlow',sans-serif; font-weight:900; font-size:15px; padding:10px 24px; }
        .modal-cancel:disabled, .modal-buy:disabled { opacity:.5; cursor:not-allowed; }
      `}</style>
    </div>
  )
}
