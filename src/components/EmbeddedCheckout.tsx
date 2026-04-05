'use client'

import { useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_live_51T2fHeQjehctdkQRDgwLDfoCUrnRERREKzp5cN8FD6IC4FWUSe2ybddzpfTnTTOue044a5jzHhNdXNafOYTSCRR800GJoRGSF4'
)

interface EmbeddedCheckoutProps {
  priceId: string
  mode?: 'subscription' | 'payment'
  successUrl?: string
}

export default function EmbeddedCheckoutForm({ priceId, mode = 'subscription', successUrl }: EmbeddedCheckoutProps) {
  const fetchClientSecret = useCallback(async () => {
    const res = await fetch('/api/checkout/embedded', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, mode, successUrl }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || 'Failed to create checkout session')
    }

    const { clientSecret } = await res.json()
    return clientSecret
  }, [priceId, mode, successUrl])

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '1.5rem',
      background: 'var(--bg-primary)',
      borderRadius: '12px',
      border: '1px solid var(--border)',
    }}>
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
