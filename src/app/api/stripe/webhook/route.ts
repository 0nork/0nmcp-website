import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _adminClient: SupabaseClient | null = null
function getSupabaseAdmin() {
  if (!_adminClient) {
    _adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _adminClient
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const tier = session.metadata?.tier || ''
        const userId = session.metadata?.user_id || ''
        const email = session.metadata?.user_email || session.customer_email || ''

        if (session.mode === 'subscription' && tier !== 'donation') {
          // Upsert sponsor subscription
          await getSupabaseAdmin().from('sponsor_subscriptions').upsert({
            user_id: userId || null,
            email,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            tier,
            status: 'active',
            current_period_end: null, // Updated by subscription.updated event
          }, { onConflict: 'stripe_subscription_id' })

          // Update profile sponsor_tier if user is logged in
          if (userId) {
            await getSupabaseAdmin().from('profiles').update({
              sponsor_tier: tier,
              stripe_customer_id: session.customer as string,
            }).eq('id', userId)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as unknown as Record<string, unknown>
        const periodEnd = sub.current_period_end as number | undefined
        await getSupabaseAdmin().from('sponsor_subscriptions').update({
          status: sub.status as string,
          ...(periodEnd ? { current_period_end: new Date(periodEnd * 1000).toISOString() } : {}),
        }).eq('stripe_subscription_id', sub.id as string)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as unknown as Record<string, unknown>
        const subId = sub.id as string
        await getSupabaseAdmin().from('sponsor_subscriptions').update({
          status: 'canceled',
        }).eq('stripe_subscription_id', subId)

        // Clear sponsor tier from profile
        const { data: sponsorRow } = await getSupabaseAdmin()
          .from('sponsor_subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subId)
          .single()

        if (sponsorRow?.user_id) {
          await getSupabaseAdmin().from('profiles').update({
            sponsor_tier: null,
          }).eq('id', sponsorRow.user_id)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as unknown as Record<string, unknown>
        if (invoice.subscription) {
          await getSupabaseAdmin().from('sponsor_subscriptions').update({
            status: 'past_due',
          }).eq('stripe_subscription_id', invoice.subscription as string)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
