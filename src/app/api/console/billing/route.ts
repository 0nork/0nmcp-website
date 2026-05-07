import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import {
  ensureStripeCustomer,
  getActiveSubscription,
  createBillingCheckout,
  createBillingPortal,
} from '@/lib/console/billing'
import { stripe as stripeClient, CONSOLE_PLANS } from '@/lib/stripe'
import { SOCIAL_ENGINE_TIERS } from '@/components/console/StoreTypes'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Owner emails — permanent VIP, skip all billing */
const OWNER_EMAILS = ['mike@rocketopp.com']

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/console/billing
 * Returns the user's billing status (subscribed or not, customer ID).
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const {
    data: { user },
  } = /* TODO_GETUSER_MANUAL: review this call — getSession() preferred per Rule 10a */ await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getSupabaseAdmin()

  // Owner bypass — always subscribed, no billing
  if (user.email && OWNER_EMAILS.includes(user.email)) {
    return NextResponse.json({ subscribed: true, hasCustomer: true, isOwner: true, plan: 'owner' })
  }

  // Check profile for stripe_customer_id, plan, vendor status
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, plan, is_vendor, vendor_status')
    .eq('id', user.id)
    .single()

  const plan = profile?.plan || 'free'

  // Resolve tier data from SOCIAL_ENGINE_TIERS
  const tierData = SOCIAL_ENGINE_TIERS.find(t => t.key === plan) || SOCIAL_ENGINE_TIERS[0]

  // Fetch seat and location counts
  const [seatCount, locationCount, vendorProfile] = await Promise.all([
    admin.from('team_seats').select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id).eq('status', 'active').then(r => r.count ?? 0),
    admin.from('user_locations').select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id).eq('is_active', true).then(r => r.count ?? 0),
    profile?.is_vendor
      ? admin.from('vendor_profiles').select('business_name, total_revenue_cents, total_sales, charges_enabled')
          .eq('user_id', user.id).maybeSingle().then(r => r.data)
      : Promise.resolve(null),
  ])

  const tierMeta = {
    maxUsers: tierData.maxUsers,
    maxLocations: tierData.maxLocations,
    whiteLabel: tierData.whiteLabel,
    addOns: tierData.addOns || null,
  }

  const vendorEligible = ['agency', 'enterprise', 'owner'].includes(plan)

  if (!profile?.stripe_customer_id) {
    // Still fetch runs balance even without customer
    const { data: runs } = await admin
      .from('run_balances')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle()

    return NextResponse.json({
      subscribed: false,
      hasCustomer: false,
      plan,
      runsBalance: runs?.balance ?? 0,
      executionsThisMonth: 0,
      vendorStatus: profile?.vendor_status || null,
      tierData: tierMeta,
      activeSeats: seatCount,
      activeLocations: locationCount,
      vendorEligible,
      vendorProfile,
    })
  }

  // Fetch extended billing data in parallel
  try {
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [sub, runs, execCount, paymentMethod, invoices] = await Promise.all([
      getActiveSubscription(profile.stripe_customer_id).catch(() => null),

      admin.from('run_balances').select('balance').eq('user_id', user.id).maybeSingle(),

      admin.from('console_executions').select('id', { count: 'exact', head: true })
        .eq('user_id', user.id).gte('created_at', periodStart),

      admin.from('payment_methods').select('card_brand, card_last4, card_exp_month, card_exp_year')
        .eq('user_id', user.id).eq('is_default', true).eq('is_active', true).maybeSingle(),

      profile.stripe_customer_id
        ? stripeClient.invoices.list({ customer: profile.stripe_customer_id, limit: 5 }).catch(() => ({ data: [] }))
        : Promise.resolve({ data: [] }),
    ])

    return NextResponse.json({
      subscribed: !!sub,
      hasCustomer: true,
      subscriptionId: sub?.subscriptionId || null,
      plan,
      runsBalance: runs?.data?.balance ?? 0,
      executionsThisMonth: execCount.count ?? 0,
      paymentMethod: paymentMethod?.data || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      invoices: invoices.data.map((inv: any) => ({
        id: inv.id,
        amount_paid: inv.amount_paid,
        currency: inv.currency,
        status: inv.status,
        created: inv.created,
        invoice_pdf: inv.invoice_pdf,
      })),
      vendorStatus: profile?.vendor_status || null,
      tierData: tierMeta,
      activeSeats: seatCount,
      activeLocations: locationCount,
      vendorEligible,
      vendorProfile,
    })
  } catch {
    return NextResponse.json({
      subscribed: false,
      hasCustomer: true,
      plan,
      tierData: tierMeta,
      activeSeats: seatCount,
      activeLocations: locationCount,
      vendorEligible,
    })
  }
}

/**
 * POST /api/console/billing
 * Actions: "subscribe" (start metered plan) or "portal" (manage billing).
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const {
    data: { user },
  } = /* TODO_GETUSER_MANUAL: review this call — getSession() preferred per Rule 10a */ await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { action?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { action } = body
  const returnUrl = 'https://www.0nmcp.com/dashboard/billing'

  // Ensure Stripe customer exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, full_name')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    customerId = await ensureStripeCustomer(
      user.id,
      user.email || '',
      profile?.full_name || undefined
    )

    // Save customer ID to profile
    const admin = getSupabaseAdmin()
    await admin
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  if (action === 'subscribe') {
    // Check if already subscribed
    const existing = await getActiveSubscription(customerId)
    if (existing) {
      return NextResponse.json({ error: 'Already subscribed', subscribed: true }, { status: 409 })
    }

    // Create checkout session for metered subscription
    const url = await createBillingCheckout(customerId, returnUrl)
    return NextResponse.json({ url })
  }

  if (action === 'portal') {
    const url = await createBillingPortal(customerId, returnUrl)
    return NextResponse.json({ url })
  }

  return NextResponse.json({ error: 'Invalid action. Use "subscribe" or "portal".' }, { status: 400 })
}
