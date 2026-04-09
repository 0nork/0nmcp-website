// @ts-nocheck
// ============================================================================
// 0nMCP STORE - STRIPE SUBSCRIPTION ARCHITECTURE
// server/stripe.ts
// 
// Handles all Stripe operations: customers, subscriptions, payments, webhooks
// ============================================================================

import Stripe from 'stripe'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// INITIALIZATION
// ============================================================================

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-01-28.clover'
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================================================================
// TYPES
// ============================================================================

export interface BusinessInfo {
  businessName: string
  email: string
  address?: string
  city?: string
  state?: string
  zip?: string
  phone?: string
}

export interface PurchaseRequest {
  userId: string
  productId: string
  productType: 'package' | 'product'
  billing: 'monthly' | 'annual'
  paymentMethodId: string
  businessInfo: BusinessInfo
}

export interface PurchaseResult {
  success: boolean
  subscriptionId?: string
  stripeSubscriptionId?: string
  status?: string
  error?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  price_monthly: number
  price_annual: number | null
  category: string
  provisioning_type: string
  provisioning_config: Record<string, any>
}

// ============================================================================
// CUSTOMER MANAGEMENT
// ============================================================================

/**
 * Get or create a Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  businessInfo: BusinessInfo
): Promise<string> {
  // Check if customer already exists in our DB
  const { data: existing } = await supabase
    .from('store_customers')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (existing?.stripe_customer_id) {
    // Update customer info in Stripe
    await stripe.customers.update(existing.stripe_customer_id, {
      name: businessInfo.businessName,
      email: businessInfo.email,
      address: businessInfo.address ? {
        line1: businessInfo.address,
        city: businessInfo.city,
        state: businessInfo.state,
        postal_code: businessInfo.zip,
        country: 'US'
      } : undefined,
      phone: businessInfo.phone,
      metadata: {
        user_id: userId,
        business_name: businessInfo.businessName
      }
    })
    return existing.stripe_customer_id
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    name: businessInfo.businessName,
    email: businessInfo.email,
    address: businessInfo.address ? {
      line1: businessInfo.address,
      city: businessInfo.city,
      state: businessInfo.state,
      postal_code: businessInfo.zip,
      country: 'US'
    } : undefined,
    phone: businessInfo.phone,
    metadata: {
      user_id: userId,
      business_name: businessInfo.businessName,
      source: '0nmcp_store'
    }
  })

  // Store in our DB using the helper function
  await supabase.rpc('store_get_or_create_customer', {
    p_user_id: userId,
    p_stripe_customer_id: customer.id,
    p_business_info: businessInfo
  })

  return customer.id
}

// ============================================================================
// PRICE MANAGEMENT
// ============================================================================

/**
 * Get or create a Stripe price for a product
 */
export async function getOrCreateStripePrice(
  product: Product,
  billing: 'monthly' | 'annual'
): Promise<string> {
  // Check cache first
  const { data: cached } = await supabase
    .from('store_stripe_prices')
    .select('stripe_price_id')
    .eq('product_id', product.id)
    .eq('billing_cycle', billing)
    .eq('is_active', true)
    .single()

  if (cached?.stripe_price_id) {
    return cached.stripe_price_id
  }

  // Get or create Stripe product
  const stripeProductId = await getOrCreateStripeProduct(product)

  // Calculate price
  const amount = billing === 'annual'
    ? (product.price_annual || product.price_monthly * 10)
    : product.price_monthly

  // Create price in Stripe
  const price = await stripe.prices.create({
    product: stripeProductId,
    unit_amount: Math.round(amount * 100), // Convert to cents
    currency: 'usd',
    recurring: {
      interval: billing === 'annual' ? 'year' : 'month',
      interval_count: 1
    },
    metadata: {
      product_id: product.id,
      product_slug: product.slug,
      billing_cycle: billing
    }
  })

  // Cache the price
  await supabase.from('store_stripe_prices').insert({
    product_id: product.id,
    stripe_price_id: price.id,
    stripe_product_id: stripeProductId,
    billing_cycle: billing,
    amount: amount
  })

  return price.id
}

/**
 * Get or create a Stripe product
 */
async function getOrCreateStripeProduct(product: Product): Promise<string> {
  // Check if we already have a Stripe product
  const { data: existingPrice } = await supabase
    .from('store_stripe_prices')
    .select('stripe_product_id')
    .eq('product_id', product.id)
    .limit(1)
    .single()

  if (existingPrice?.stripe_product_id) {
    return existingPrice.stripe_product_id
  }

  // Create in Stripe
  const stripeProduct = await stripe.products.create({
    name: product.name,
    description: `0nMCP Store - ${product.name}`,
    metadata: {
      product_id: product.id,
      product_slug: product.slug,
      category: product.category
    }
  })

  return stripeProduct.id
}

// ============================================================================
// SUBSCRIPTION MANAGEMENT
// ============================================================================

/**
 * Process a product purchase
 */
export async function processPurchase(request: PurchaseRequest): Promise<PurchaseResult> {
  try {
    // 1. Get product details
    const { data: product, error: productError } = await supabase
      .from('store_products')
      .select('*')
      .eq('id', request.productId)
      .single()

    if (productError || !product) {
      return { success: false, error: 'Product not found' }
    }

    // 2. Get or create Stripe customer
    const stripeCustomerId = await getOrCreateStripeCustomer(
      request.userId,
      request.businessInfo
    )

    // 3. Attach payment method to customer
    await stripe.paymentMethods.attach(request.paymentMethodId, {
      customer: stripeCustomerId
    })

    // Set as default payment method
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: request.paymentMethodId
      }
    })

    // 4. Get or create price
    const priceId = await getOrCreateStripePrice(product, request.billing)

    // 5. Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      default_payment_method: request.paymentMethodId,
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription'
      },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        user_id: request.userId,
        product_id: product.id,
        product_slug: product.slug,
        source: '0nmcp_store'
      }
    })

    // 6. Calculate price for our DB
    const price = request.billing === 'annual'
      ? (product.price_annual || product.price_monthly * 10)
      : product.price_monthly

    // 7. Get customer ID from our DB
    const { data: customer } = await supabase
      .from('store_customers')
      .select('id')
      .eq('user_id', request.userId)
      .single()

    if (!customer) {
      return { success: false, error: 'Customer record not found' }
    }

    // 8. Create subscription in our DB and queue provisioning
    const { data: internalSub, error: subError } = await supabase
      .rpc('store_create_subscription', {
        p_customer_id: customer.id,
        p_product_id: product.id,
        p_stripe_subscription_id: subscription.id,
        p_billing_cycle: request.billing,
        p_price: price,
        p_status: subscription.status === 'active' ? 'active' : 'pending'
      })

    if (subError) {
      console.error('Failed to create internal subscription:', subError)
      // Don't fail the purchase - Stripe sub is created
    }

    // 9. Handle payment intent if needed
    const invoice = subscription.latest_invoice as Stripe.Invoice
    const paymentIntent = (invoice as unknown as Record<string, unknown>)?.payment_intent as Stripe.PaymentIntent

    if (paymentIntent?.status === 'requires_action') {
      return {
        success: true,
        subscriptionId: internalSub,
        stripeSubscriptionId: subscription.id,
        status: 'requires_action',
        // @ts-ignore - client_secret exists
        clientSecret: paymentIntent.client_secret
      }
    }

    return {
      success: true,
      subscriptionId: internalSub,
      stripeSubscriptionId: subscription.id,
      status: subscription.status
    }

  } catch (error: any) {
    console.error('Purchase failed:', error)
    return {
      success: false,
      error: error.message || 'Purchase failed'
    }
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get subscription from our DB
    const { data: sub } = await supabase
      .from('store_subscriptions')
      .select('stripe_subscription_id')
      .eq('id', subscriptionId)
      .single()

    if (!sub?.stripe_subscription_id) {
      return { success: false, error: 'Subscription not found' }
    }

    if (immediately) {
      // Cancel immediately
      await stripe.subscriptions.cancel(sub.stripe_subscription_id)
      
      // Update our DB
      await supabase
        .from('store_subscriptions')
        .update({
          status: 'ended',
          cancelled_at: new Date().toISOString(),
          ended_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)

      // Queue deprovisioning
      await supabase.from('store_provisioning_queue').insert({
        subscription_id: subscriptionId,
        task_type: 'deprovision',
        status: 'pending',
        priority: 50,
        config: {}
      })

    } else {
      // Cancel at period end
      await stripe.subscriptions.update(sub.stripe_subscription_id, {
        cancel_at_period_end: true
      })

      await supabase
        .from('store_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', subscriptionId)
    }

    return { success: true }

  } catch (error: any) {
    console.error('Cancel subscription failed:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get user's subscriptions
 */
export async function getUserSubscriptions(userId: string) {
  const { data, error } = await supabase
    .from('store_active_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to get subscriptions:', error)
    return []
  }

  return data.map(sub => ({
    id: sub.id,
    name: sub.product_name,
    icon: sub.product_icon,
    status: sub.status,
    billing: sub.billing_cycle,
    price: sub.price,
    renewsAt: sub.current_period_end,
    provisioningStatus: sub.provisioning_status
  }))
}

// ============================================================================
// WEBHOOK HANDLING
// ============================================================================

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(
  payload: string,
  signature: string
): Promise<{ received: boolean; error?: string }> {
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return { received: false, error: 'Invalid signature' }
  }

  // Log the event
  await supabase.from('store_webhook_events').insert({
    source: 'stripe',
    event_type: event.type,
    event_id: event.id,
    payload: event.data.object,
    status: 'pending'
  })

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.trial_will_end':
        await handleTrialEnding(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Mark event as processed
    await supabase
      .from('store_webhook_events')
      .update({ status: 'completed', processed_at: new Date().toISOString() })
      .eq('event_id', event.id)
      .eq('source', 'stripe')

    return { received: true }

  } catch (error: any) {
    console.error('Webhook processing failed:', error)
    
    await supabase
      .from('store_webhook_events')
      .update({ status: 'failed', error: error.message })
      .eq('event_id', event.id)
      .eq('source', 'stripe')

    return { received: true } // Still return true to prevent retries for processing errors
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const stripeSubId = subscription.id
  
  // Map Stripe status to our status
  const statusMap: Record<string, string> = {
    'active': 'active',
    'trialing': 'trialing',
    'past_due': 'past_due',
    'canceled': 'cancelled',
    'unpaid': 'past_due',
    'incomplete': 'pending',
    'incomplete_expired': 'ended',
    'paused': 'paused'
  }

  await supabase
    .from('store_subscriptions')
    .update({
      status: statusMap[subscription.status] || subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelled_at: subscription.canceled_at 
        ? new Date(subscription.canceled_at * 1000).toISOString() 
        : null
    })
    .eq('stripe_subscription_id', stripeSubId)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripeSubId = subscription.id

  // Update subscription status
  const { data: sub } = await supabase
    .from('store_subscriptions')
    .update({
      status: 'ended',
      ended_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', stripeSubId)
    .select('id')
    .single()

  if (sub) {
    // Queue deprovisioning
    await supabase.from('store_provisioning_queue').insert({
      subscription_id: sub.id,
      task_type: 'deprovision',
      status: 'pending',
      priority: 50,
      config: {}
    })
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return

  // Create invoice record
  const { data: sub } = await supabase
    .from('store_subscriptions')
    .select('id, customer_id')
    .eq('stripe_subscription_id', invoice.subscription)
    .single()

  if (sub) {
    await supabase.from('store_invoices').insert({
      customer_id: sub.customer_id,
      subscription_id: sub.id,
      stripe_invoice_id: invoice.id,
      stripe_payment_intent_id: invoice.payment_intent as string,
      subtotal: (invoice.subtotal || 0) / 100,
      tax: (invoice.tax || 0) / 100,
      total: (invoice.total || 0) / 100,
      amount_paid: (invoice.amount_paid || 0) / 100,
      amount_due: (invoice.amount_due || 0) / 100,
      status: 'paid',
      paid_at: new Date().toISOString(),
      invoice_number: invoice.number,
      invoice_pdf_url: invoice.invoice_pdf
    })

    // Update subscription status to active if it was pending
    await supabase
      .from('store_subscriptions')
      .update({ status: 'active' })
      .eq('id', sub.id)
      .eq('status', 'pending')
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return

  await supabase
    .from('store_subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', invoice.subscription)

  // TODO: Send notification to customer
  // TODO: Queue email via CRM webhook
}

async function handleTrialEnding(subscription: Stripe.Subscription) {
  // TODO: Send notification to customer that trial is ending
  console.log(`Trial ending for subscription: ${subscription.id}`)
}

// ============================================================================
// USAGE BILLING
// ============================================================================

/**
 * Record usage for metered billing
 */
export async function recordUsage(
  subscriptionId: string,
  service: 'sms' | 'email' | 'voice' | 'ai' | 'workflows' | 'storage',
  quantity: number,
  unitCost: number
): Promise<void> {
  const { data: sub } = await supabase
    .from('store_subscriptions')
    .select('customer_id, current_period_start, current_period_end')
    .eq('id', subscriptionId)
    .single()

  if (!sub) return

  await supabase.from('store_usage').insert({
    subscription_id: subscriptionId,
    customer_id: sub.customer_id,
    service,
    quantity,
    unit_cost: unitCost,
    total_cost: quantity * unitCost,
    period_start: sub.current_period_start,
    period_end: sub.current_period_end
  })
}

/**
 * Get usage summary for a subscription
 */
export async function getUsageSummary(
  subscriptionId: string,
  period: 'current' | 'last' | 'all' = 'current'
) {
  const { data: sub } = await supabase
    .from('store_subscriptions')
    .select('current_period_start, current_period_end')
    .eq('id', subscriptionId)
    .single()

  if (!sub) return null

  let query = supabase
    .from('store_usage')
    .select('service, quantity, total_cost')
    .eq('subscription_id', subscriptionId)

  if (period === 'current') {
    query = query
      .gte('period_start', sub.current_period_start)
      .lte('period_end', sub.current_period_end)
  }

  const { data } = await query

  // Aggregate by service
  const summary: Record<string, { quantity: number; cost: number }> = {}
  
  data?.forEach(row => {
    if (!summary[row.service]) {
      summary[row.service] = { quantity: 0, cost: 0 }
    }
    summary[row.service].quantity += row.quantity
    summary[row.service].cost += parseFloat(row.total_cost)
  })

  return summary
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  stripe,
  supabase
}
