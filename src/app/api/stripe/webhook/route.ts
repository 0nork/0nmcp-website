import { NextRequest, NextResponse } from 'next/server'
import { stripe, CONSOLE_PLANS } from '@/lib/stripe'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { creditSparks } from '@/lib/sparks'
import { syncAccountStatus, recordMarketplaceTransaction, recordPayout, checkTierUpgrade, savePaymentMethod } from '@/lib/stripe-connect'

const CONSOLE_PRICE_IDS = new Set(
  Object.values(CONSOLE_PLANS).map(p => p.priceId).filter(Boolean)
)

/** Owner emails — NEVER downgrade these accounts */
const OWNER_EMAILS = ['mike@rocketopp.com']

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
        const planType = session.metadata?.plan_type

        // ── Marketplace purchase (Stripe Connect) ──
        if (planType === 'marketplace' && userId) {
          const vendorId = session.metadata?.vendor_id || ''
          const listingId = session.metadata?.listing_id || ''
          const listingName = session.metadata?.listing_name || ''
          const amountCents = parseInt(session.metadata?.amount_cents || '0')
          const feeCents = parseInt(session.metadata?.fee_cents || '0')

          if (vendorId && amountCents > 0) {
            await recordMarketplaceTransaction({
              buyerId: userId,
              vendorId,
              listingId,
              listingName,
              amountCents,
              platformFeeCents: feeCents,
              stripePaymentIntentId: session.payment_intent as string,
              stripeCheckoutSessionId: session.id,
            })

            // Check if vendor qualifies for tier upgrade
            await checkTierUpgrade(vendorId).catch(() => {})
          }
          break
        }

        // ── Setup card (save payment method from Checkout setup mode) ──
        if (planType === 'setup_card' && userId) {
          const setupIntentId = session.setup_intent as string
          if (setupIntentId) {
            const setupIntent = await stripe.setupIntents.retrieve(setupIntentId)
            const pmId = setupIntent.payment_method as string
            const customerId = (session.customer || setupIntent.customer) as string
            if (pmId && customerId) {
              await savePaymentMethod(userId, customerId, pmId).catch(err => {
                console.error('Failed to save payment method from setup checkout:', err)
              })
            }
          }
          break
        }

        // ── Sparks purchase ──
        if (planType === 'sparks' && userId) {
          const sparksAmount = parseInt(session.metadata?.sparks_amount || '0')
          const packId = session.metadata?.pack_id || 'starter'
          if (sparksAmount > 0) {
            await creditSparks(userId, sparksAmount, 'purchase', `Purchased ${sparksAmount} Sparks — ${packId} pack`, {
              stripeCheckoutSessionId: session.id,
              stripeCustomerId: session.customer as string,
              metadata: { pack_id: packId },
            })
          }
          break
        }

        if (planType === 'console' && userId) {
          // Console membership subscription
          const consoleTier = session.metadata?.tier || 'pro'
          await getSupabaseAdmin().from('profiles').update({
            plan: consoleTier,
            stripe_customer_id: session.customer as string,
          }).eq('id', userId)
        } else if (session.mode === 'subscription' && tier !== 'donation') {
          // Sponsor subscription
          await getSupabaseAdmin().from('sponsor_subscriptions').upsert({
            user_id: userId || null,
            email,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            tier,
            status: 'active',
            current_period_end: null,
          }, { onConflict: 'stripe_subscription_id' })

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

        // Check if this is a console plan subscription
        const items = sub.items as { data?: { price?: { id?: string } }[] } | undefined
        const priceId = items?.data?.[0]?.price?.id || ''
        const isConsolePlan = CONSOLE_PRICE_IDS.has(priceId)

        if (isConsolePlan) {
          // Reset console plan to free (but NEVER downgrade owners)
          const customerId = sub.customer as string
          if (customerId) {
            const { data: profile } = await getSupabaseAdmin()
              .from('profiles')
              .select('plan')
              .eq('stripe_customer_id', customerId)
              .maybeSingle()

            if (profile?.plan !== 'owner') {
              await getSupabaseAdmin().from('profiles').update({
                plan: 'free',
              }).eq('stripe_customer_id', customerId)
            }
          }
        } else {
          // Sponsor subscription canceled
          await getSupabaseAdmin().from('sponsor_subscriptions').update({
            status: 'canceled',
          }).eq('stripe_subscription_id', subId)

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

      // ── Stripe Connect Events ──

      case 'account.updated': {
        // Connected account status changed (onboarding completed, etc.)
        const account = event.data.object as unknown as { id: string }
        if (account.id) {
          await syncAccountStatus(account.id).catch(err => {
            console.error('Failed to sync account status:', err)
          })
        }
        break
      }

      case 'payout.created':
      case 'payout.updated':
      case 'payout.paid':
      case 'payout.failed': {
        const payout = event.data.object as unknown as Record<string, unknown>
        const connectedAccountId = (event.account as string) || ''
        if (connectedAccountId && payout.id) {
          await recordPayout({
            stripeAccountId: connectedAccountId,
            stripePayoutId: payout.id as string,
            amountCents: payout.amount as number,
            currency: (payout.currency as string) || 'usd',
            status: payout.status as string,
            arrivalDate: payout.arrival_date as number | undefined,
            failureMessage: (payout.failure_message as string) || undefined,
          }).catch(err => {
            console.error('Failed to record payout:', err)
          })
        }
        break
      }

      case 'transfer.created': {
        // Transfer from platform to connected account
        const transfer = event.data.object as unknown as Record<string, unknown>
        console.log('Transfer created:', transfer.id, 'Amount:', transfer.amount, 'Destination:', transfer.destination)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
