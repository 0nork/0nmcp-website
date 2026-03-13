import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import {
  ensureStripeCustomer,
  getActiveSubscription,
  createBillingCheckout,
  createBillingPortal,
} from '@/lib/console/billing'
import { stripe as stripeClient } from '@/lib/stripe'

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
  } = await supabase.auth.getUser()

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

  if (!profile?.stripe_customer_id) {
    // Still fetch sparks balance even without customer
    const { data: sparks } = await admin
      .from('spark_balances')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle()

    return NextResponse.json({
      subscribed: false,
      hasCustomer: false,
      plan,
      sparksBalance: sparks?.balance ?? 0,
      executionsThisMonth: 0,
      vendorStatus: profile?.vendor_status || null,
    })
  }

  // Fetch extended billing data in parallel
  try {
    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [sub, sparks, execCount, paymentMethod, invoices] = await Promise.all([
      getActiveSubscription(profile.stripe_customer_id).catch(() => null),

      admin.from('spark_balances').select('balance').eq('user_id', user.id).maybeSingle(),

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
      sparksBalance: sparks?.data?.balance ?? 0,
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
    })
  } catch {
    return NextResponse.json({
      subscribed: false,
      hasCustomer: true,
      plan,
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
  } = await supabase.auth.getUser()

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
  const returnUrl = 'https://www.0nmcp.com/console'

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
