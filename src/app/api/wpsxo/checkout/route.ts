import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const PRICES: Record<string, string> = {
  free: 'price_1TEtP7HThmAuKVQM4jQpPKaG',
  pro: 'price_1TEtP7HThmAuKVQM9yrUXxxl',
  max: 'price_1TEtP7HThmAuKVQMfSj9vz4K',
}

export async function POST(req: NextRequest) {
  try {
    const { tier, email } = await req.json()
    const priceId = PRICES[tier || 'pro']
    if (!priceId) return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })

    // Free tier — skip checkout, create license directly
    if (tier === 'free') {
      const key = generateKey()
      // Will be handled by the license creation endpoint
      return NextResponse.json({
        free: true,
        key,
        download: 'https://github.com/Crypto-Goatz/wp-sxo/releases/latest',
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      success_url: `https://wpsxo.com/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: 'https://wpsxo.com/#pricing',
      metadata: {
        product: 'wpsxo',
        tier: tier || 'pro',
      },
      subscription_data: {
        metadata: {
          product: 'wpsxo',
          tier: tier || 'pro',
        },
      },
    })

    return NextResponse.json({ url: session.url, session_id: session.id })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

function generateKey(): string {
  const seg = () => Math.random().toString(36).substring(2, 6).toUpperCase()
  return `WPSXO-${seg()}-${seg()}-${seg()}-${seg()}`
}
