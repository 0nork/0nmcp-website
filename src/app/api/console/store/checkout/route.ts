import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

const SITE_URL = 'https://0nmcp.com'

/**
 * POST /api/console/store/checkout — Purchase a store listing
 * Body: { listingId }
 *
 * Free listings: instant purchase + copy workflow to user's workflow_files + user_vault_files
 * Paid listings: create Stripe Checkout session, return { checkoutUrl }
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()
  const { listingId } = body

  if (!listingId) {
    return NextResponse.json({ error: 'listingId required' }, { status: 400 })
  }

  // Fetch listing
  const { data: listing, error: listingError } = await supabase
    .from('store_listings')
    .select('*')
    .eq('id', listingId)
    .eq('status', 'active')
    .single()

  if (listingError || !listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  // Check if already purchased
  const { data: existing } = await supabase
    .from('store_purchases')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('listing_id', listingId)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ free: true, alreadyOwned: true })
  }

  // Free listing — instant purchase
  if (!listing.price || listing.price === 0) {
    return await completePurchase({ supabase, user, listing, listingId, amount: 0 })
  }

  // Paid listing — require stripe_price_id
  if (!listing.stripe_price_id) {
    return NextResponse.json(
      { error: 'Listing is paid but has no Stripe price configured' },
      { status: 500 }
    )
  }

  // Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price: listing.stripe_price_id,
        quantity: 1,
      },
    ],
    allow_promotion_codes: true,
    success_url: `${SITE_URL}/console?view=store&purchased=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/console?view=store`,
    metadata: {
      listingId: listing.id,
      buyerId: user.id,
    },
    payment_intent_data: {
      metadata: {
        listingId: listing.id,
        buyerId: user.id,
      },
    },
  })

  return NextResponse.json({ checkoutUrl: session.url })
}

/**
 * Shared purchase completion logic — copies workflow to workflow_files + user_vault_files,
 * records the purchase, and increments total_purchases on the listing.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function completePurchase({ supabase, user, listing, listingId, amount, stripeSessionId }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  listing: any
  listingId: string
  amount: number
  stripeSessionId?: string
}) {
  let workflowFileId: string | null = null
  let vaultFileId: string | null = null

  if (listing.workflow_data) {
    const wfData = listing.workflow_data as Record<string, unknown>
    const header = wfData.$0n as Record<string, string> | undefined
    const workflowName = header?.name || listing.title
    const fileType = header?.type || 'workflow'

    // Copy to workflow_files
    const { data: wf } = await supabase
      .from('workflow_files')
      .insert({
        owner_id: user.id,
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
    const { data: vf } = await supabase
      .from('user_vault_files')
      .insert({
        user_id: user.id,
        name: workflowName,
        file_type: fileType,
        category: fileType,
        description: listing.description,
        file_data: listing.workflow_data,
        source: 'store',
        source_id: listingId,
        version: header?.version || '1.0.0',
        tags: listing.tags || [],
      })
      .select('id')
      .single()

    if (vf) vaultFileId = vf.id
  }

  // Record purchase
  await supabase.from('store_purchases').insert({
    buyer_id: user.id,
    listing_id: listingId,
    workflow_id: workflowFileId,
    stripe_session_id: stripeSessionId || null,
    amount,
    currency: 'usd',
    status: 'completed',
  })

  // Increment total_purchases
  await supabase
    .from('store_listings')
    .update({ total_purchases: (listing.total_purchases || 0) + 1 })
    .eq('id', listingId)

  return NextResponse.json({ free: amount === 0, workflowId: workflowFileId, vaultFileId })
}
