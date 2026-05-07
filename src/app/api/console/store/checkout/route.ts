import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'
import { createMarketplaceCheckout } from '@/lib/stripe-connect'

export const dynamic = 'force-dynamic'

const SITE_URL = 'https://www.0nmcp.com'
const MARKETPLACE_URL = process.env.NEXT_PUBLIC_MARKETPLACE_URL || 'https://marketplace.rocketclients.com'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

/**
 * POST /api/console/store/checkout — Purchase a store listing
 * Body: { listingId }                        — standard console purchase
 * Body: { listingId, locationId, successUrl, cancelUrl } — Add0n iframe purchase
 *
 * Free listings: instant purchase + copy workflow to user's workflow_files + user_vault_files
 * Paid listings: create Stripe Checkout session, return { checkoutUrl }
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { listingId, locationId, successUrl, cancelUrl } = body

  if (!listingId) {
    return NextResponse.json({ error: 'listingId required' }, { status: 400 })
  }

  // ── Add0n iframe purchase (locationId present = CRM storefront) ──────────
  if (locationId) {
    return handleAdd0nCheckout({ listingId, locationId, successUrl, cancelUrl })
  }

  // ── Standard console purchase flow ───────────────────────────────────────
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
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

  // Vendor listing — route through Stripe Connect with fee splitting
  if (listing.vendor_id) {
    try {
      const result = await createMarketplaceCheckout({
        buyerId: user.id,
        buyerEmail: user.email || '',
        vendorId: listing.vendor_id,
        listingId: listing.id,
        listingName: listing.title,
        amountCents: listing.price,
        successUrl: `${SITE_URL}/console?view=store&purchased=true&session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${SITE_URL}/console?view=store`,
        metadata: {
          listingId: listing.id,
          buyerId: user.id,
          assetType: listing.asset_type || 'workflow',
        },
      })
      return NextResponse.json({ checkoutUrl: result.checkout_url })
    } catch (err) {
      return NextResponse.json(
        { error: (err as Error).message || 'Marketplace checkout failed' },
        { status: 500 }
      )
    }
  }

  // Create Stripe Checkout session (platform-owned listing)
  // Use stripe_price_id if available, otherwise create dynamic price from listing.price
  const lineItems = listing.stripe_price_id
    ? [{ price: listing.stripe_price_id, quantity: 1 }]
    : [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: listing.title,
            ...(listing.description ? { description: listing.description.slice(0, 500) } : {}),
          },
          unit_amount: listing.price, // already in cents
        },
        quantity: 1,
      }]

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
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

  // For builder asset purchases, copy HTML to buyer's builder_assets
  const assetTypes = ['landing_page', 'email', 'form', 'product_page']
  if (listing.asset_type && assetTypes.includes(listing.asset_type) && listing.workflow_data) {
    const wfData = listing.workflow_data as Record<string, unknown>
    await supabase.from('builder_assets').insert({
      user_id: user.id,
      asset_type: listing.asset_type,
      title: listing.title,
      prompt: (wfData.prompt as string) || `Purchased: ${listing.title}`,
      config: wfData.config || {},
      html: (wfData.html as string) || '',
      metadata: wfData.metadata || {},
      status: 'draft',
      listing_id: listingId,
    }).then(() => {}) // fire and forget
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

/**
 * Add0n iframe storefront checkout — per-location purchases from add0n_listings.
 * Free listings record purchase immediately; paid listings create Stripe Checkout.
 */
async function handleAdd0nCheckout({ listingId, locationId, successUrl, cancelUrl }: {
  listingId: string; locationId: string; successUrl?: string; cancelUrl?: string
}) {
  const admin = getAdmin()

  // Fetch from add0n_listings
  const { data: listing, error: listingError } = await admin
    .from('add0n_listings')
    .select('*')
    .eq('id', listingId)
    .eq('is_active', true)
    .single()

  if (listingError || !listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  }

  // Check if already purchased
  const { data: existing } = await admin
    .from('add0n_purchases')
    .select('id')
    .eq('location_id', locationId)
    .eq('listing_id', listingId)
    .eq('status', 'complete')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ purchased: true, alreadyOwned: true })
  }

  // Free listings — record purchase immediately
  if (!listing.price_cents || listing.price_cents === 0) {
    await admin.from('add0n_purchases').upsert({
      location_id: locationId,
      listing_id:  listingId,
      amount_cents: 0,
      status:      'complete',
    }, { onConflict: 'location_id,listing_id' })
    return NextResponse.json({ purchased: true })
  }

  // Paid listing — create Stripe Checkout Session
  const defaultSuccess = `${MARKETPLACE_URL}/install/success?session_id={CHECKOUT_SESSION_ID}&location_id=${locationId}`
  const defaultCancel  = `${MARKETPLACE_URL}/install/error?reason=cancelled`

  const lineItems = listing.stripe_price_id
    ? [{ price: listing.stripe_price_id, quantity: 1 }]
    : [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: listing.title,
            ...(listing.tagline ? { description: listing.tagline } : {}),
          },
          unit_amount: listing.price_cents,
        },
        quantity: 1,
      }]

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: successUrl || defaultSuccess,
    cancel_url:  cancelUrl  || defaultCancel,
    metadata: {
      location_id: locationId,
      listing_id:  listingId,
      source:      'add0n_storefront',
    },
  })

  return NextResponse.json({ checkoutUrl: session.url })
}
