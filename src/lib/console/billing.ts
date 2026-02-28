/**
 * 0n Console — Metered Billing
 *
 * Reports workflow execution usage to Stripe via Billing Meter Events.
 * Users subscribe to a metered plan; each execution = $0.10 credit.
 *
 * Stripe Resources:
 *   Meter:   mtr_61UF1J8ifXgOPYhdl41HThmAuKVQMPmS (workflow_execution)
 *   Price:   price_1T5dLxHThmAuKVQMhjAe15Q3 ($0.10/execution, metered)
 *   Product: prod_Twzi39wJb0F3Xu (0n Marketplace - Workflow Execution)
 */

import Stripe from 'stripe'

const METERED_PRICE_ID = 'price_1T5dLxHThmAuKVQMhjAe15Q3'
const METER_EVENT_NAME = 'workflow_execution'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is required')
  return new Stripe(key, {
    apiVersion: '2025-01-27.acacia' as Stripe.LatestApiVersion,
    typescript: true,
  })
}

/**
 * Report a workflow execution to Stripe's Billing Meter.
 * This increments the user's usage count for the billing period.
 */
export async function reportExecution(stripeCustomerId: string, quantity: number = 1) {
  const stripe = getStripe()

  // Stripe Billing Meter Events API (v2)
  await stripe.billing.meterEvents.create({
    event_name: METER_EVENT_NAME,
    payload: {
      stripe_customer_id: stripeCustomerId,
      value: String(quantity),
    },
  })
}

/**
 * Ensure a user has an active metered subscription.
 * If they don't have one, returns null (they need to subscribe first).
 */
export async function getActiveSubscription(stripeCustomerId: string) {
  const stripe = getStripe()

  const subs = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: 'active',
    limit: 10,
  })

  // Find a subscription that includes our metered price
  for (const sub of subs.data) {
    const item = sub.items.data.find((i) => i.price.id === METERED_PRICE_ID)
    if (item) {
      return { subscriptionId: sub.id, subscriptionItemId: item.id }
    }
  }

  return null
}

/**
 * Create a metered subscription for a customer.
 * The subscription starts immediately with $0 upfront — they only pay for usage.
 */
export async function createMeteredSubscription(stripeCustomerId: string) {
  const stripe = getStripe()

  const subscription = await stripe.subscriptions.create({
    customer: stripeCustomerId,
    items: [{ price: METERED_PRICE_ID }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  })

  return {
    subscriptionId: subscription.id,
    subscriptionItemId: subscription.items.data[0].id,
    status: subscription.status,
  }
}

/**
 * Create or retrieve a Stripe customer for a user.
 */
export async function ensureStripeCustomer(userId: string, email: string, name?: string) {
  const stripe = getStripe()

  // Search for existing customer by metadata
  const existing = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existing.data.length > 0) {
    return existing.data[0].id
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: { supabase_user_id: userId },
  })

  return customer.id
}

/**
 * Create a Stripe Checkout session for subscribing to the metered plan.
 * This handles payment method collection — user only pays at end of billing period.
 */
export async function createBillingCheckout(stripeCustomerId: string, returnUrl: string) {
  const stripe = getStripe()

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: stripeCustomerId,
    line_items: [{ price: METERED_PRICE_ID }],
    success_url: `${returnUrl}?billing=active`,
    cancel_url: `${returnUrl}?billing=canceled`,
  })

  return session.url
}

/**
 * Create a Stripe Billing Portal session for managing subscription.
 */
export async function createBillingPortal(stripeCustomerId: string, returnUrl: string) {
  const stripe = getStripe()

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  })

  return session.url
}

export { METERED_PRICE_ID, METER_EVENT_NAME }
