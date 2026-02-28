import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import {
  ensureStripeCustomer,
  getActiveSubscription,
  createBillingCheckout,
  createBillingPortal,
} from '@/lib/console/billing'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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

  // Check profile for stripe_customer_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({
      subscribed: false,
      hasCustomer: false,
    })
  }

  // Check for active metered subscription
  try {
    const sub = await getActiveSubscription(profile.stripe_customer_id)
    return NextResponse.json({
      subscribed: !!sub,
      hasCustomer: true,
      subscriptionId: sub?.subscriptionId || null,
    })
  } catch {
    return NextResponse.json({
      subscribed: false,
      hasCustomer: true,
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
  const returnUrl = 'https://0nmcp.com/console'

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
