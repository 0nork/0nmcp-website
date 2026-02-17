import Stripe from 'stripe'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is required')
  return new Stripe(key, {
    apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
    typescript: true,
  })
}

/** Lazy-initialized Stripe client — only throws at runtime, not build time */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getStripe() as any)[prop]
  },
})

/**
 * Sponsor tier price IDs — set these as env vars on Vercel.
 * Create products/prices in Stripe Dashboard first, then add:
 *   STRIPE_PRICE_SUPPORTER, STRIPE_PRICE_BUILDER, STRIPE_PRICE_ENTERPRISE
 */
export const SPONSOR_PRICES: Record<string, { priceId: string; tier: string; amount: number }> = {
  supporter: {
    priceId: process.env.STRIPE_PRICE_SUPPORTER || '',
    tier: 'supporter',
    amount: 5,
  },
  builder: {
    priceId: process.env.STRIPE_PRICE_BUILDER || '',
    tier: 'builder',
    amount: 25,
  },
  enterprise: {
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || '',
    tier: 'enterprise',
    amount: 100,
  },
}

/** One-time donation amounts */
export const DONATION_AMOUNTS = [10, 25, 50, 100]
