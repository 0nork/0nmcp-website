import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { stripe, CONSOLE_PLANS } from '@/lib/stripe'
import { SOCIAL_ENGINE_TIERS } from '@/components/console/StoreTypes'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SITE_URL = 'https://www.0nmcp.com'
const OWNER_EMAIL = 'mike@rocketopp.com'

const TIER_ORDER = ['free', 'creator', 'operator', 'agency', 'enterprise']

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * POST /api/console/plan/switch
 * Switch between subscription tiers (upgrade/downgrade/cancel).
 * Body: { targetTier: string, billing?: 'monthly' | 'yearly' }
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Owner bypass
  if (user.email === OWNER_EMAIL) {
    return NextResponse.json({ success: true, message: 'Owner account — unlimited access' })
  }

  const body = await request.json()
  const { targetTier, billing = 'monthly' } = body as {
    targetTier: string
    billing?: 'monthly' | 'yearly'
  }

  if (!targetTier || !TIER_ORDER.includes(targetTier)) {
    return NextResponse.json({ error: 'Invalid target tier' }, { status: 400 })
  }

  const admin = getSupabaseAdmin()

  // Get current profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, plan')
    .eq('id', user.id)
    .single()

  const currentPlan = profile?.plan || 'free'
  const currentIndex = TIER_ORDER.indexOf(currentPlan)
  const targetIndex = TIER_ORDER.indexOf(targetTier)

  if (currentPlan === targetTier) {
    return NextResponse.json({ error: 'Already on this tier' }, { status: 400 })
  }

  // ── Free → Paid: Create Stripe Checkout ──
  if (currentPlan === 'free') {
    const plan = CONSOLE_PLANS[targetTier]
    if (!plan) {
      return NextResponse.json({ error: 'Unknown plan' }, { status: 400 })
    }

    // Ensure Stripe customer
    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { user_id: user.id },
      })
      customerId = customer.id
      await admin.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    // Get yearly price if applicable
    const yearlyEnvKey = `STRIPE_PRICE_CONSOLE_${targetTier.toUpperCase()}_YEARLY`
    const yearlyTier = SOCIAL_ENGINE_TIERS.find(t => t.key === targetTier)
    const priceId = billing === 'yearly'
      ? (process.env[yearlyEnvKey] || '')
      : plan.priceId

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const lineItem: any = priceId
      ? { price: priceId, quantity: 1 }
      : {
          price_data: {
            currency: 'usd',
            product_data: { name: `0nMCP Console — ${plan.name}` },
            unit_amount: (billing === 'yearly' && yearlyTier?.priceYearly ? yearlyTier.priceYearly : plan.amount) * 100,
            recurring: { interval: billing === 'yearly' ? 'year' as const : 'month' as const },
          },
          quantity: 1,
        }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [lineItem],
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: plan.trialDays,
        metadata: { user_id: user.id, tier: targetTier, billing },
      },
      success_url: `${SITE_URL}/console?view=account&switched=${targetTier}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/console?view=account`,
      metadata: { user_id: user.id, tier: targetTier },
    })

    return NextResponse.json({ checkoutUrl: session.url })
  }

  // ── Paid → Free: Cancel at period end ──
  if (targetTier === 'free') {
    const { data: sub } = await admin
      .from('product_subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (sub?.stripe_subscription_id) {
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        cancel_at_period_end: true,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription will cancel at end of current billing period',
      effectiveAt: 'period_end',
    })
  }

  // ── Paid → Paid: Upgrade or Downgrade ──
  const { data: sub } = await admin
    .from('product_subscriptions')
    .select('stripe_subscription_id, stripe_customer_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()

  if (!sub?.stripe_subscription_id) {
    // No active subscription — treat as new checkout
    return NextResponse.json({ error: 'No active subscription found. Use checkout flow.' }, { status: 400 })
  }

  const subscription = await stripe.subscriptions.retrieve(sub.stripe_subscription_id)
  const itemId = subscription.items.data[0]?.id
  if (!itemId) {
    return NextResponse.json({ error: 'Subscription has no items' }, { status: 500 })
  }

  const plan = CONSOLE_PLANS[targetTier]
  if (!plan) {
    return NextResponse.json({ error: 'Unknown target plan' }, { status: 400 })
  }

  const isUpgrade = targetIndex > currentIndex

  // Get the target price
  const yearlyEnvKey = `STRIPE_PRICE_CONSOLE_${targetTier.toUpperCase()}_YEARLY`
  const targetPriceId = billing === 'yearly'
    ? (process.env[yearlyEnvKey] || plan.priceId)
    : plan.priceId

  if (targetPriceId) {
    // Update subscription with proper proration behavior
    await stripe.subscriptions.update(sub.stripe_subscription_id, {
      items: [{
        id: itemId,
        price: targetPriceId,
      }],
      proration_behavior: isUpgrade ? 'create_prorations' : 'none',
      metadata: { tier: targetTier, billing },
    })
  }

  // Update profile plan
  await admin.from('profiles').update({ plan: targetTier }).eq('id', user.id)

  // Update product_subscriptions tier
  await admin
    .from('product_subscriptions')
    .update({ tier: targetTier, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('status', 'active')

  return NextResponse.json({
    success: true,
    previousTier: currentPlan,
    newTier: targetTier,
    action: isUpgrade ? 'upgraded' : 'downgraded',
    effectiveAt: isUpgrade ? 'immediate' : 'period_end',
  })
}
