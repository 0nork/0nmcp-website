import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
})

/**
 * POST /api/checkout/embedded — Create embedded checkout session
 *
 * Body: { priceId, mode?, successUrl?, customerId? }
 * Returns: { clientSecret }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { priceId, mode = 'subscription', successUrl } = body

    if (!priceId) {
      return NextResponse.json({ error: 'priceId required' }, { status: 400 })
    }

    // Get authenticated user
    const supabase = await createSupabaseServer()
    let userId: string | null = null
    let userEmail: string | null = null
    let stripeCustomerId: string | null = null

    if (supabase) {
      const user = (await supabase.auth.getSession()).data.session?.user ?? null
      if (user) {
        userId = user.id
        userEmail = user.email || null

        // Get existing Stripe customer ID
        const { data: profile } = await supabase
          .from('profiles')
          .select('stripe_customer_id, full_name')
          .eq('id', user.id)
          .single()

        stripeCustomerId = profile?.stripe_customer_id || null

        // Create Stripe customer if needed
        if (!stripeCustomerId && userEmail) {
          const customer = await stripe.customers.create({
            email: userEmail,
            name: profile?.full_name || undefined,
            metadata: { supabase_user_id: userId },
          })
          stripeCustomerId = customer.id

          // Save to profile
          await supabase
            .from('profiles')
            .update({ stripe_customer_id: customer.id })
            .eq('id', userId)
        }
      }
    }

    const origin = request.headers.get('origin') || 'https://www.0nmcp.com'

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      ui_mode: 'embedded',
      mode: mode as 'subscription' | 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      return_url: successUrl || `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        user_id: userId || '',
        source: '0nmcp-embedded',
      },
    }

    // Attach customer if we have one
    if (stripeCustomerId) {
      sessionParams.customer = stripeCustomerId
    } else if (userEmail) {
      sessionParams.customer_email = userEmail
    }

    // Add trial for subscriptions
    if (mode === 'subscription') {
      sessionParams.subscription_data = {
        trial_period_days: 7,
        metadata: { user_id: userId || '' },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (err) {
    console.error('[checkout/embedded] Error:', err)
    const message = err instanceof Error ? err.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
