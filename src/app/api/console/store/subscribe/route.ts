import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

const SITE_URL = 'https://0nmcp.com'
const OWNER_EMAIL = 'mike@rocketopp.com'

/**
 * Product tier pricing — Stripe price IDs set via env vars.
 * Create products/prices in Stripe Dashboard first, then add env vars.
 * Fallback: if no price ID is set, we create a checkout with price_data.
 */
const PRODUCT_TIERS: Record<string, Record<string, {
  amount: number // dollars
  interval: 'month' | 'year'
  priceId: string
  label: string
}>> = {
  'social-engine': {
    'creator-monthly': {
      amount: 19,
      interval: 'month',
      priceId: process.env.STRIPE_PRICE_SOCIAL_CREATOR_MONTHLY || '',
      label: 'Creator — Monthly',
    },
    'creator-yearly': {
      amount: 190,
      interval: 'year',
      priceId: process.env.STRIPE_PRICE_SOCIAL_CREATOR_YEARLY || '',
      label: 'Creator — Yearly (Save 2 months)',
    },
    'operator-monthly': {
      amount: 49,
      interval: 'month',
      priceId: process.env.STRIPE_PRICE_SOCIAL_OPERATOR_MONTHLY || '',
      label: 'Operator — Monthly',
    },
    'operator-yearly': {
      amount: 490,
      interval: 'year',
      priceId: process.env.STRIPE_PRICE_SOCIAL_OPERATOR_YEARLY || '',
      label: 'Operator — Yearly (Save 2 months)',
    },
    'agency-monthly': {
      amount: 149,
      interval: 'month',
      priceId: process.env.STRIPE_PRICE_SOCIAL_AGENCY_MONTHLY || '',
      label: 'Agency — Monthly',
    },
    'agency-yearly': {
      amount: 1490,
      interval: 'year',
      priceId: process.env.STRIPE_PRICE_SOCIAL_AGENCY_YEARLY || '',
      label: 'Agency — Yearly (Save 2 months)',
    },
    'enterprise-monthly': {
      amount: 499,
      interval: 'month',
      priceId: process.env.STRIPE_PRICE_SOCIAL_ENTERPRISE_MONTHLY || '',
      label: 'Enterprise — Monthly',
    },
  },
}

/**
 * POST /api/console/store/subscribe — Subscribe to a product tier
 * Body: { productId, tierKey, billing: 'monthly' | 'yearly' }
 *
 * Free tier: instant activation (no Stripe)
 * Paid tiers: create Stripe Checkout session in subscription mode
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()
  const { productId, tierKey, billing = 'monthly' } = body as {
    productId: string
    tierKey: string
    billing: 'monthly' | 'yearly'
  }

  if (!productId || !tierKey) {
    return NextResponse.json({ error: 'productId and tierKey required' }, { status: 400 })
  }

  // Owner bypass — always gets full access
  if (user.email === OWNER_EMAIL) {
    await supabase.from('product_subscriptions').upsert({
      user_id: user.id,
      product_id: productId,
      tier: 'owner',
      status: 'active',
      metadata: { bypass: true, reason: 'owner_account' },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,product_id' })

    return NextResponse.json({ success: true, tier: 'owner', free: true })
  }

  // Free tier — instant activation
  if (tierKey === 'free') {
    await supabase.from('product_subscriptions').upsert({
      user_id: user.id,
      product_id: productId,
      tier: 'free',
      status: 'active',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,product_id' })

    return NextResponse.json({ success: true, tier: 'free', free: true })
  }

  // Look up tier pricing
  const productTiers = PRODUCT_TIERS[productId]
  if (!productTiers) {
    return NextResponse.json({ error: `Unknown product: ${productId}` }, { status: 400 })
  }

  const lookupKey = `${tierKey}-${billing}`
  const tier = productTiers[lookupKey]
  if (!tier) {
    return NextResponse.json({ error: `Unknown tier: ${lookupKey}` }, { status: 400 })
  }

  // Check existing subscription
  const { data: existing } = await supabase
    .from('product_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle()

  // If already on a paid tier with active Stripe subscription, redirect to portal
  if (existing?.stripe_subscription_id && existing?.status === 'active') {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: existing.stripe_customer_id!,
      return_url: `${SITE_URL}/console?view=store`,
    })
    return NextResponse.json({ portalUrl: portalSession.url })
  }

  // Get or create Stripe customer
  let stripeCustomerId = existing?.stripe_customer_id
  if (!stripeCustomerId) {
    // Check profile for existing stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .maybeSingle()

    stripeCustomerId = profile?.stripe_customer_id
  }

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      metadata: { user_id: user.id },
    })
    stripeCustomerId = customer.id

    // Save to profile
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', user.id)
  }

  // Build checkout session
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lineItem: any = tier.priceId
    ? { price: tier.priceId, quantity: 1 }
    : {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `0nMCP Social Engine — ${tier.label}`,
            description: `${tierKey.charAt(0).toUpperCase() + tierKey.slice(1)} tier subscription`,
          },
          unit_amount: tier.amount * 100, // cents
          recurring: { interval: tier.interval },
        },
        quantity: 1,
      }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [lineItem],
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 14,
      metadata: {
        user_id: user.id,
        product_id: productId,
        tier: tierKey,
        billing,
      },
    },
    success_url: `${SITE_URL}/console?view=store&subscribed=true&tier=${tierKey}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/console?view=store`,
    metadata: {
      user_id: user.id,
      product_id: productId,
      tier: tierKey,
    },
  })

  return NextResponse.json({ checkoutUrl: session.url })
}

/**
 * GET /api/console/store/subscribe — Get user's subscription status
 * Query: ?productId=social-engine
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const productId = request.nextUrl.searchParams.get('productId') || 'social-engine'

  // Owner bypass
  if (user.email === OWNER_EMAIL) {
    return NextResponse.json({
      tier: 'owner',
      status: 'active',
      features: 'unlimited',
    })
  }

  const { data: sub } = await supabase
    .from('product_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle()

  if (!sub) {
    return NextResponse.json({ tier: 'free', status: 'none' })
  }

  return NextResponse.json({
    tier: sub.tier,
    status: sub.status,
    currentPeriodEnd: sub.current_period_end,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    trialEnd: sub.trial_end,
  })
}
