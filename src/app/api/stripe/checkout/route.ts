import { NextRequest, NextResponse } from 'next/server'
import { stripe, SPONSOR_PRICES, CONSOLE_PLANS, ONCORE_PLANS } from '@/lib/stripe'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { tier, mode, type, customer_id } = await request.json()

    // Get current user for metadata
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase!.auth.getUser()

    // ── Setup card (save payment method via Checkout in setup mode) ──
    if (type === 'setup_card') {
      const setupParams: Record<string, unknown> = {
        mode: 'setup',
        payment_method_types: ['card'],
        success_url: `${request.nextUrl.origin}/0nboarding?payment=saved`,
        cancel_url: `${request.nextUrl.origin}/0nboarding?payment=canceled`,
        metadata: {
          plan_type: 'setup_card',
          user_id: user?.id || '',
        },
      }
      if (customer_id) {
        setupParams.customer = customer_id
      } else if (user?.email) {
        setupParams.customer_email = user.email
      }

      const session = await stripe.checkout.sessions.create(
        setupParams as Parameters<typeof stripe.checkout.sessions.create>[0]
      )
      return NextResponse.json({ url: session.url })
    }

    // ── Console plan checkout ──
    if (type === 'console_plan') {
      const plan = CONSOLE_PLANS[tier]
      if (!plan || !plan.priceId) {
        return NextResponse.json({ error: 'Invalid plan or price not configured' }, { status: 400 })
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: plan.priceId, quantity: 1 }],
        subscription_data: { trial_period_days: plan.trialDays },
        success_url: `${request.nextUrl.origin}/console?billing=active`,
        cancel_url: `${request.nextUrl.origin}/console?billing=canceled`,
        allow_promotion_codes: true,
        ...(user?.email ? { customer_email: user.email } : {}),
        metadata: {
          plan_type: 'console',
          tier: plan.tier,
          user_id: user?.id || '',
          user_email: user?.email || '',
        },
      } as Parameters<typeof stripe.checkout.sessions.create>[0])

      return NextResponse.json({ url: session.url })
    }

    // ── 0nCore plan checkout (from /subscribe page) ──
    if (type === 'oncore_plan') {
      const plan = ONCORE_PLANS[tier]
      if (!plan) {
        return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
      }

      // Free plan — no Stripe needed, just create account
      if (tier === 'free') {
        return NextResponse.json({ url: `${request.nextUrl.origin}/start/success?plan=free` })
      }

      // Founders = one-time payment, Builder = subscription
      const isOneTime = plan.mode === 'payment'

      const sessionParams: Record<string, unknown> = {
        mode: isOneTime ? 'payment' : 'subscription',
        line_items: plan.priceId
          ? [{ price: plan.priceId, quantity: 1 }]
          : [{
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `0nCore ${plan.name}`,
                  description: plan.features.slice(0, 3).join(', '),
                },
                unit_amount: plan.amount * 100,
                ...(isOneTime ? {} : { recurring: { interval: 'month' as const } }),
              },
              quantity: 1,
            }],
        success_url: `${request.nextUrl.origin}/start/success?plan=${tier}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${request.nextUrl.origin}/subscribe?canceled=true`,
        allow_promotion_codes: true,
        metadata: {
          plan_type: 'oncore',
          tier: plan.tier,
          user_id: user?.id || '',
          user_email: user?.email || '',
          provision_crm: 'true', // Flag for webhook to auto-provision CRM sub-location
          max_locations: String(plan.maxLocations),
        },
      }

      if (user?.email) {
        sessionParams.customer_email = user.email
      }

      // Founders gets 30-day trial on the follow-up subscription
      if (tier === 'founders' && !isOneTime) {
        (sessionParams as Record<string, unknown>).subscription_data = {
          trial_period_days: plan.trialDays,
        }
      }

      const session = await stripe.checkout.sessions.create(
        sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0]
      )

      return NextResponse.json({ url: session.url })
    }

    // ── Sponsor / donation checkout ──
    const isOneTime = mode === 'payment'

    let lineItems: { price?: string; price_data?: object; quantity: number }[]

    if (isOneTime) {
      const amount = parseInt(tier)
      if (!amount || amount < 1) {
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
      }
      lineItems = [{
        price_data: {
          currency: 'usd',
          product_data: { name: `0nMCP Donation — $${amount}` },
          unit_amount: amount * 100,
        },
        quantity: 1,
      }]
    } else {
      const price = SPONSOR_PRICES[tier]
      if (!price || !price.priceId) {
        return NextResponse.json({ error: 'Invalid tier or price not configured' }, { status: 400 })
      }
      lineItems = [{ price: price.priceId, quantity: 1 }]
    }

    const sessionParams: Record<string, unknown> = {
      mode: isOneTime ? 'payment' : 'subscription',
      line_items: lineItems,
      success_url: `${request.nextUrl.origin}/sponsor?success=true`,
      cancel_url: `${request.nextUrl.origin}/sponsor?canceled=true`,
      metadata: {
        tier: isOneTime ? 'donation' : tier,
        user_id: user?.id || '',
        user_email: user?.email || '',
      },
    }

    if (user?.email) {
      sessionParams.customer_email = user.email
    }

    if (!isOneTime) {
      sessionParams.allow_promotion_codes = true
    }

    const session = await stripe.checkout.sessions.create(sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0])

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create checkout' },
      { status: 500 }
    )
  }
}
