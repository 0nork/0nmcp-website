import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

const SITE_URL = 'https://www.0nmcp.com'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

/** Preflight for browser extension access */
export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function corsJson(data: any, init?: { status?: number }) {
  const res = NextResponse.json(data, init)
  Object.entries(CORS_HEADERS).forEach(([k, v]) => res.headers.set(k, v))
  return res
}

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

interface CartItem {
  listingId: string
  name: string
  price: number  // in cents
  quantity: number
  vendorId: string | null
}

/**
 * POST /api/console/store/cart-checkout — Multi-item cart checkout
 * Body: { items: CartItem[] }
 *
 * Free items: purchased instantly
 * Paid items: creates a single Stripe Checkout session
 * Returns: { checkoutUrl?, freeItems?: string[], alreadyOwned?: string[] }
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return corsJson({ error: 'Not configured' }, { status: 500 })
  }

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return corsJson({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()
  const items: CartItem[] = body.items || []

  if (!items.length) {
    return corsJson({ error: 'Cart is empty' }, { status: 400 })
  }

  // Fetch all listing IDs
  const listingIds = items.map(i => i.listingId)
  const admin = getAdmin()

  const { data: listings, error: listingsError } = await admin
    .from('store_listings')
    .select('*')
    .in('id', listingIds)
    .eq('status', 'active')

  if (listingsError) {
    return corsJson({ error: listingsError.message }, { status: 500 })
  }

  if (!listings || listings.length === 0) {
    return corsJson({ error: 'No valid listings found' }, { status: 404 })
  }

  // Check already purchased
  const { data: existingPurchases } = await admin
    .from('store_purchases')
    .select('listing_id')
    .eq('buyer_id', user.id)
    .in('listing_id', listingIds)
    .eq('status', 'completed')

  const alreadyOwned = new Set((existingPurchases || []).map(p => p.listing_id))

  // Separate free vs paid listings (excluding already owned)
  const freeListings = listings.filter(l => (!l.price || l.price === 0) && !alreadyOwned.has(l.id))
  const paidListings = listings.filter(l => l.price > 0 && !alreadyOwned.has(l.id))

  // Process free items immediately
  const freeItemIds: string[] = []
  for (const listing of freeListings) {
    await fulfillPurchase(admin, user.id, listing, 0)
    freeItemIds.push(listing.id)
  }

  // If no paid items, we're done
  if (paidListings.length === 0) {
    return corsJson({
      success: true,
      freeItems: freeItemIds,
      alreadyOwned: Array.from(alreadyOwned),
    })
  }

  // Get or create Stripe customer
  const { data: profile } = await admin
    .from('profiles')
    .select('stripe_customer_id, full_name')
    .eq('id', user.id)
    .maybeSingle()

  let stripeCustomerId = profile?.stripe_customer_id

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      name: profile?.full_name || undefined,
      metadata: { supabase_user_id: user.id },
    })
    stripeCustomerId = customer.id
    await admin
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', user.id)
  }

  // Build line items for Stripe Checkout
  const lineItems = paidListings.map(listing => {
    if (listing.stripe_price_id) {
      return { price: listing.stripe_price_id, quantity: 1 }
    }
    return {
      price_data: {
        currency: 'usd',
        product_data: {
          name: listing.title,
          ...(listing.description ? { description: listing.description.slice(0, 500) } : {}),
        },
        unit_amount: listing.price, // already in cents in DB
      },
      quantity: 1,
    }
  })

  // Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer: stripeCustomerId,
    line_items: lineItems,
    allow_promotion_codes: true,
    success_url: `${SITE_URL}/console/marketplace?checkout=success`,
    cancel_url: `${SITE_URL}/console/marketplace?checkout=cancelled`,
    metadata: {
      buyerId: user.id,
      listingIds: paidListings.map(l => l.id).join(','),
      source: 'cart-checkout',
    },
    payment_intent_data: {
      metadata: {
        buyerId: user.id,
        listingIds: paidListings.map(l => l.id).join(','),
        source: 'cart-checkout',
      },
    },
  })

  return corsJson({
    checkoutUrl: session.url,
    freeItems: freeItemIds,
    alreadyOwned: Array.from(alreadyOwned),
  })
}

/**
 * Fulfill a single purchase — copies workflow data and records the purchase
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fulfillPurchase(admin: any, buyerId: string, listing: any, amount: number, stripeSessionId?: string) {
  let workflowFileId: string | null = null

  if (listing.workflow_data) {
    const wfData = listing.workflow_data as Record<string, unknown>
    const header = wfData.$0n as Record<string, string> | undefined
    const workflowName = header?.name || listing.title
    const fileType = header?.type || 'workflow'

    // Copy to workflow_files
    const { data: wf } = await admin
      .from('workflow_files')
      .insert({
        owner_id: buyerId,
        file_key: `store_${listing.slug}_${Date.now()}`,
        name: workflowName,
        description: listing.description,
        version: header?.version || '1.0.0',
        step_count: listing.step_count || 0,
        services_used: listing.services || [],
        tags: listing.tags || [],
        status: 'active',
        workflow_data: listing.workflow_data,
      })
      .select('id')
      .single()

    if (wf) workflowFileId = wf.id

    // Copy to user_vault_files
    await admin
      .from('user_vault_files')
      .insert({
        user_id: buyerId,
        name: workflowName,
        file_type: fileType,
        category: fileType,
        description: listing.description,
        file_data: listing.workflow_data,
        source: 'store',
        source_id: listing.id,
        version: header?.version || '1.0.0',
        tags: listing.tags || [],
      })
  }

  // Record purchase
  await admin.from('store_purchases').insert({
    buyer_id: buyerId,
    listing_id: listing.id,
    workflow_id: workflowFileId,
    stripe_session_id: stripeSessionId || null,
    amount,
    currency: 'usd',
    status: 'completed',
  })

  // Increment total_purchases
  await admin
    .from('store_listings')
    .update({ total_purchases: (listing.total_purchases || 0) + 1 })
    .eq('id', listing.id)
}
