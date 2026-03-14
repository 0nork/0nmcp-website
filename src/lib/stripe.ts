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

/** Console membership plans — unified with SOCIAL_ENGINE_TIERS */
export const CONSOLE_PLANS: Record<string, {
  priceId: string; name: string; tier: string; amount: number; trialDays: number;
  features: string[]; maxUsers: number; maxLocations: number
}> = {
  creator: {
    priceId: process.env.STRIPE_PRICE_CONSOLE_CREATOR_MONTHLY || process.env.STRIPE_PRICE_CONSOLE_PRO || '',
    name: 'Creator', tier: 'creator', amount: 19, trialDays: 7,
    maxUsers: 2, maxLocations: 1,
    features: ['2 users, 1 location', 'Unlimited AI posts', 'Voice learning engine', 'Schedule & queue', 'White-label branding'],
  },
  operator: {
    priceId: process.env.STRIPE_PRICE_CONSOLE_OPERATOR_MONTHLY || process.env.STRIPE_PRICE_CONSOLE_TEAM || '',
    name: 'Operator', tier: 'operator', amount: 49, trialDays: 7,
    maxUsers: 5, maxLocations: 1,
    features: ['5 users, 1 location', 'Everything in Creator', 'Multi-channel distribution', 'CRM integration', 'Analytics dashboard'],
  },
  agency: {
    priceId: process.env.STRIPE_PRICE_CONSOLE_AGENCY_MONTHLY || process.env.STRIPE_PRICE_CONSOLE_CONTRIBUTOR || '',
    name: 'Agency', tier: 'agency', amount: 149, trialDays: 7,
    maxUsers: 10, maxLocations: 3,
    features: ['10 users, 3 locations', 'Everything in Operator', 'Sell on marketplace', 'White-label reports', 'Priority support', 'API access'],
  },
  enterprise: {
    priceId: process.env.STRIPE_PRICE_CONSOLE_ENTERPRISE_MONTHLY || '',
    name: 'Enterprise', tier: 'enterprise', amount: 499, trialDays: 7,
    maxUsers: 20, maxLocations: 10,
    features: ['20 users, 10 locations', 'Everything in Agency', 'Dedicated infrastructure', 'Custom integrations', 'SLA guarantee'],
  },
}

/** Legacy plan key mapping for backwards compatibility */
export const LEGACY_PLAN_MAP: Record<string, string> = {
  pro: 'creator',
  team: 'operator',
  contributor: 'agency',
}

/** One-time donation amounts */
export const DONATION_AMOUNTS = [10, 25, 50, 100]
