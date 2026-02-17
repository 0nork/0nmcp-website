import { NextRequest, NextResponse } from 'next/server'
import { stripe, SPONSOR_PRICES } from '@/lib/stripe'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { tier, mode } = await request.json()

    // Determine if this is a subscription or one-time payment
    const isOneTime = mode === 'payment'

    let lineItems: { price?: string; price_data?: object; quantity: number }[]

    if (isOneTime) {
      // One-time donation — use price_data
      const amount = parseInt(tier) // tier is the dollar amount for one-time
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
      // Subscription
      const price = SPONSOR_PRICES[tier]
      if (!price || !price.priceId) {
        return NextResponse.json({ error: 'Invalid tier or price not configured' }, { status: 400 })
      }
      lineItems = [{ price: price.priceId, quantity: 1 }]
    }

    // Get current user for metadata
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase!.auth.getUser()

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

    // Attach customer email if logged in
    if (user?.email) {
      sessionParams.customer_email = user.email
    }

    // For subscriptions, allow promo codes
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
