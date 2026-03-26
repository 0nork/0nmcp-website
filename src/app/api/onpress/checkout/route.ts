import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion })

const PRICE_ID = 'price_1TFNH4HThmAuKVQMrvCWJ9R4' // $49/year OnPress

export async function POST() {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'}/onpress/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'}/onpress`,
      metadata: { product: 'onpress' },
      subscription_data: {
        metadata: { product: 'onpress' },
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Checkout failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
