import { NextRequest, NextResponse } from 'next/server'
import { stripe, SPONSOR_PRICES, CONSOLE_PLANS } from '@/lib/stripe'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { tier, mode, type } = await request.json()

    // Get current user for metadata
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase!.auth.getUser()

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
