/**
 * Stripe Connect — Marketplace Payment Infrastructure
 *
 * Architecture:
 * - Platform: 0ncore AI Engineering (acct_1T2fHeQjehctdkQR)
 * - Vendors: Express Connected Accounts (Stripe handles KYC)
 * - Payments: Destination charges with application_fee_percent
 * - Payouts: Automatic to vendor bank accounts (Stripe managed)
 *
 * Flow:
 * 1. Vendor applies → vendor_profiles row created
 * 2. Admin approves → Stripe Connect account created
 * 3. Vendor completes Stripe onboarding (Express hosted)
 * 4. Buyer purchases → destination charge → platform fee split
 * 5. Vendor gets automated payout to bank account
 */

import { stripe } from './stripe'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ── Types ──

export interface VendorProfile {
  id: string
  user_id: string
  stripe_account_id: string | null
  stripe_onboarding_complete: boolean
  charges_enabled: boolean
  payouts_enabled: boolean
  details_submitted: boolean
  business_name: string | null
  business_type: string
  country: string
  application_fee_percent: number
  vendor_tier: string
  is_approved: boolean
  is_active: boolean
  total_revenue_cents: number
  total_payouts_cents: number
  total_sales: number
}

export interface MarketplaceCheckoutResult {
  checkout_url: string
  session_id: string
}

export interface ConnectOnboardingResult {
  url: string
  account_id: string
}

// ── Admin Client ──

let _admin: SupabaseClient | null = null
function getAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _admin
}

// ── Connected Account Management ──

/**
 * Create a Stripe Express Connected Account for a vendor.
 * Call this after admin approves the vendor application.
 */
export async function createConnectedAccount(
  userId: string,
  email: string,
  businessName?: string,
  country = 'US'
): Promise<{ accountId: string; vendorId: string }> {
  // Create Stripe Express account
  const account = await stripe.accounts.create({
    type: 'express',
    country,
    email,
    business_type: 'individual',
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      user_id: userId,
      platform: '0nmcp',
    },
    ...(businessName ? { business_profile: { name: businessName } } : {}),
  })

  // Upsert vendor profile
  const { data: vendor, error } = await getAdmin()
    .from('vendor_profiles')
    .upsert({
      user_id: userId,
      stripe_account_id: account.id,
      business_name: businessName || null,
      country,
      is_approved: true,
      approved_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to create vendor profile: ${error.message}`)

  // Update user profile
  await getAdmin().from('profiles').update({
    is_vendor: true,
    vendor_status: 'approved',
  }).eq('id', userId)

  return { accountId: account.id, vendorId: vendor.id }
}

/**
 * Generate a Stripe-hosted onboarding link for a vendor.
 * The vendor completes KYC, banking, and identity verification on Stripe.
 */
export async function createOnboardingLink(
  stripeAccountId: string,
  returnUrl: string,
  refreshUrl: string
): Promise<string> {
  const link = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: 'account_onboarding',
  })
  return link.url
}

/**
 * Generate a login link to the Stripe Express dashboard.
 * Vendors use this to view earnings, manage payouts, update banking.
 */
export async function createDashboardLink(stripeAccountId: string): Promise<string> {
  const link = await stripe.accounts.createLoginLink(stripeAccountId)
  return link.url
}

/**
 * Retrieve the current status of a Connected Account.
 */
export async function getAccountStatus(stripeAccountId: string) {
  const account = await stripe.accounts.retrieve(stripeAccountId)
  return {
    id: account.id,
    charges_enabled: account.charges_enabled,
    payouts_enabled: account.payouts_enabled,
    details_submitted: account.details_submitted,
    requirements: account.requirements,
    business_profile: account.business_profile,
  }
}

/**
 * Sync Stripe account status to our database.
 * Called on account.updated webhook events.
 */
export async function syncAccountStatus(stripeAccountId: string) {
  const account = await stripe.accounts.retrieve(stripeAccountId)

  const onboardingComplete =
    account.charges_enabled === true &&
    account.payouts_enabled === true &&
    account.details_submitted === true

  await getAdmin().from('vendor_profiles').update({
    charges_enabled: account.charges_enabled || false,
    payouts_enabled: account.payouts_enabled || false,
    details_submitted: account.details_submitted || false,
    stripe_onboarding_complete: onboardingComplete,
  }).eq('stripe_account_id', stripeAccountId)

  return { onboardingComplete, account }
}

// ── Marketplace Payments ──

/**
 * Create a marketplace checkout session with payment splitting.
 * Uses destination charges — buyer pays platform, platform transfers to vendor.
 *
 * Flow:
 * 1. Buyer pays $10
 * 2. Platform keeps $1.50 (15% application fee at Standard tier)
 * 3. Vendor receives $8.50 (automatic transfer to connected account)
 */
export async function createMarketplaceCheckout(opts: {
  buyerId: string
  buyerEmail: string
  vendorId: string
  listingId: string
  listingName: string
  amountCents: number
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}): Promise<MarketplaceCheckoutResult> {
  // Get vendor profile
  const { data: vendor, error } = await getAdmin()
    .from('vendor_profiles')
    .select('stripe_account_id, application_fee_percent, charges_enabled')
    .eq('id', opts.vendorId)
    .single()

  if (error || !vendor) throw new Error('Vendor not found')
  if (!vendor.stripe_account_id) throw new Error('Vendor has no Stripe account')
  if (!vendor.charges_enabled) throw new Error('Vendor account is not ready for payments')

  const feePercent = vendor.application_fee_percent || 15
  const feeCents = Math.round(opts.amountCents * (feePercent / 100))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await (stripe.checkout.sessions.create as any)({
    mode: 'payment',
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: opts.listingName,
          metadata: { listing_id: opts.listingId },
        },
        unit_amount: opts.amountCents,
      },
      quantity: 1,
    }],
    payment_intent_data: {
      application_fee_amount: feeCents,
      transfer_data: {
        destination: vendor.stripe_account_id,
      },
      metadata: {
        marketplace: 'true',
        listing_id: opts.listingId,
        buyer_id: opts.buyerId,
        vendor_id: opts.vendorId,
      },
    },
    customer_email: opts.buyerEmail,
    success_url: opts.successUrl,
    cancel_url: opts.cancelUrl,
    metadata: {
      plan_type: 'marketplace',
      listing_id: opts.listingId,
      listing_name: opts.listingName,
      buyer_id: opts.buyerId,
      vendor_id: opts.vendorId,
      amount_cents: String(opts.amountCents),
      fee_cents: String(feeCents),
      ...opts.metadata,
    },
  })

  return {
    checkout_url: session.url || '',
    session_id: session.id,
  }
}

/**
 * Record a completed marketplace transaction in the database.
 * Called from the webhook after checkout.session.completed for marketplace purchases.
 */
export async function recordMarketplaceTransaction(opts: {
  buyerId: string
  vendorId: string
  listingId: string
  listingName: string
  amountCents: number
  platformFeeCents: number
  stripePaymentIntentId?: string
  stripeChargeId?: string
  stripeTransferId?: string
  stripeCheckoutSessionId?: string
}) {
  const vendorPayoutCents = opts.amountCents - opts.platformFeeCents

  // Insert transaction
  await getAdmin().from('marketplace_transactions').insert({
    buyer_id: opts.buyerId,
    vendor_id: opts.vendorId,
    listing_id: opts.listingId,
    listing_name: opts.listingName,
    amount_cents: opts.amountCents,
    platform_fee_cents: opts.platformFeeCents,
    vendor_payout_cents: vendorPayoutCents,
    stripe_payment_intent_id: opts.stripePaymentIntentId,
    stripe_charge_id: opts.stripeChargeId,
    stripe_transfer_id: opts.stripeTransferId,
    stripe_checkout_session_id: opts.stripeCheckoutSessionId,
    status: 'completed',
  })

  // Update vendor stats (read-then-write)
  const { data: vendor } = await getAdmin()
    .from('vendor_profiles')
    .select('total_revenue_cents, total_payouts_cents, total_sales')
    .eq('id', opts.vendorId)
    .single()

  if (vendor) {
    await getAdmin().from('vendor_profiles').update({
      total_revenue_cents: (vendor.total_revenue_cents || 0) + opts.amountCents,
      total_payouts_cents: (vendor.total_payouts_cents || 0) + vendorPayoutCents,
      total_sales: (vendor.total_sales || 0) + 1,
    }).eq('id', opts.vendorId)
  }
}

// ── Buyer Payment Methods ──

/**
 * Create a Stripe SetupIntent for saving a payment method.
 * Returns the client_secret for Stripe.js on the frontend.
 */
export async function createSetupIntent(
  userId: string,
  email: string
): Promise<{ clientSecret: string; customerId: string }> {
  // Get or create Stripe customer
  let customerId: string

  const { data: profile } = await getAdmin()
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single()

  if (profile?.stripe_customer_id) {
    customerId = profile.stripe_customer_id
  } else {
    const customer = await stripe.customers.create({
      email,
      metadata: { user_id: userId, platform: '0nmcp' },
    })
    customerId = customer.id

    await getAdmin().from('profiles').update({
      stripe_customer_id: customerId,
    }).eq('id', userId)
  }

  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card'],
    metadata: { user_id: userId },
  })

  return {
    clientSecret: setupIntent.client_secret!,
    customerId,
  }
}

/**
 * Save a confirmed payment method to the database.
 * Called after SetupIntent succeeds on the frontend.
 */
export async function savePaymentMethod(
  userId: string,
  stripeCustomerId: string,
  stripePaymentMethodId: string
): Promise<void> {
  // Retrieve payment method details from Stripe
  const pm = await stripe.paymentMethods.retrieve(stripePaymentMethodId)

  // Set as default on Stripe customer
  await stripe.customers.update(stripeCustomerId, {
    invoice_settings: { default_payment_method: stripePaymentMethodId },
  })

  // Mark all existing methods as non-default
  await getAdmin().from('payment_methods').update({
    is_default: false,
  }).eq('user_id', userId)

  // Save new method
  await getAdmin().from('payment_methods').upsert({
    user_id: userId,
    stripe_customer_id: stripeCustomerId,
    stripe_payment_method_id: stripePaymentMethodId,
    card_brand: pm.card?.brand || null,
    card_last4: pm.card?.last4 || null,
    card_exp_month: pm.card?.exp_month || null,
    card_exp_year: pm.card?.exp_year || null,
    is_default: true,
    is_active: true,
  }, { onConflict: 'stripe_payment_method_id' })
}

/**
 * Get user's saved payment methods.
 */
export async function getPaymentMethods(userId: string) {
  const { data } = await getAdmin()
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  return data || []
}

/**
 * Remove a saved payment method.
 */
export async function removePaymentMethod(
  userId: string,
  paymentMethodId: string
): Promise<void> {
  // Detach from Stripe
  const { data: pm } = await getAdmin()
    .from('payment_methods')
    .select('stripe_payment_method_id')
    .eq('id', paymentMethodId)
    .eq('user_id', userId)
    .single()

  if (pm?.stripe_payment_method_id) {
    await stripe.paymentMethods.detach(pm.stripe_payment_method_id).catch(() => {})
  }

  await getAdmin().from('payment_methods').delete()
    .eq('id', paymentMethodId)
    .eq('user_id', userId)
}

// ── Vendor Application ──

/**
 * Submit a vendor application.
 * Creates the vendor_profiles row. Admin must approve before Connect account is created.
 */
export async function applyAsVendor(
  userId: string,
  businessName: string,
  businessType = 'individual'
): Promise<{ vendorId: string }> {
  const { data, error } = await getAdmin()
    .from('vendor_profiles')
    .upsert({
      user_id: userId,
      business_name: businessName,
      business_type: businessType,
      is_approved: false,
    }, { onConflict: 'user_id' })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to apply: ${error.message}`)

  await getAdmin().from('profiles').update({
    is_vendor: true,
    vendor_status: 'applied',
  }).eq('id', userId)

  return { vendorId: data.id }
}

/**
 * Get vendor profile for a user.
 */
export async function getVendorProfile(userId: string): Promise<VendorProfile | null> {
  const { data } = await getAdmin()
    .from('vendor_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  return data
}

// ── Vendor Payout Tracking ──

/**
 * Record a payout event from Stripe webhook.
 */
export async function recordPayout(opts: {
  stripeAccountId: string
  stripePayoutId: string
  amountCents: number
  currency: string
  status: string
  arrivalDate?: number
  failureMessage?: string
}) {
  const { data: vendor } = await getAdmin()
    .from('vendor_profiles')
    .select('id')
    .eq('stripe_account_id', opts.stripeAccountId)
    .single()

  if (!vendor) return

  await getAdmin().from('marketplace_payouts').upsert({
    vendor_id: vendor.id,
    stripe_payout_id: opts.stripePayoutId,
    stripe_account_id: opts.stripeAccountId,
    amount_cents: opts.amountCents,
    currency: opts.currency,
    status: opts.status,
    arrival_date: opts.arrivalDate ? new Date(opts.arrivalDate * 1000).toISOString() : null,
    failure_message: opts.failureMessage || null,
  }, { onConflict: 'stripe_payout_id' })
}

// ── Platform Fee Configuration ──

/**
 * Platform fee tiers based on vendor performance.
 */
export const VENDOR_TIERS = {
  standard: { fee: 15, label: 'Contributor', minSales: 0 },
  preferred: { fee: 10, label: 'Top Seller', minSales: 100 },
  partner: { fee: 5, label: 'Partner', minSales: 500 },
} as const

/** Minimum payout threshold in cents — vendors must accumulate at least $50 before payout */
export const MINIMUM_PAYOUT_CENTS = 5000

/**
 * Check if a vendor qualifies for a tier upgrade.
 */
export async function checkTierUpgrade(vendorId: string): Promise<string | null> {
  const { data: vendor } = await getAdmin()
    .from('vendor_profiles')
    .select('total_sales, vendor_tier')
    .eq('id', vendorId)
    .single()

  if (!vendor) return null

  const currentTier = vendor.vendor_tier || 'standard'
  const sales = vendor.total_sales || 0

  if (sales >= VENDOR_TIERS.partner.minSales && currentTier !== 'partner') {
    await getAdmin().from('vendor_profiles').update({
      vendor_tier: 'partner',
      application_fee_percent: VENDOR_TIERS.partner.fee,
    }).eq('id', vendorId)
    return 'partner'
  }

  if (sales >= VENDOR_TIERS.preferred.minSales && currentTier === 'standard') {
    await getAdmin().from('vendor_profiles').update({
      vendor_tier: 'preferred',
      application_fee_percent: VENDOR_TIERS.preferred.fee,
    }).eq('id', vendorId)
    return 'preferred'
  }

  return null
}
