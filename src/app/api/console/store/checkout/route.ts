import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

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

  let body: { listingId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { listingId } = body
  if (!listingId) {
    return NextResponse.json({ error: 'listingId is required' }, { status: 400 })
  }

  // Fetch listing
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('*')
    .eq('id', listingId)
    .eq('status', 'active')
    .single()

  if (listingError || !listing) {
    return NextResponse.json({ error: 'Listing not found or inactive' }, { status: 404 })
  }

  // Check for existing purchase (prevent double-buy)
  const { data: existing } = await supabase
    .from('purchases')
    .select('id')
    .eq('buyer_id', user.id)
    .eq('listing_id', listingId)
    .eq('status', 'completed')
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Already purchased' }, { status: 409 })
  }

  const admin = getSupabaseAdmin()

  // FREE: instant grant
  if (!listing.price || listing.price === 0) {
    const { error: insertError } = await admin.from('purchases').insert({
      buyer_id: user.id,
      listing_id: listingId,
      workflow_id: listing.workflow_id,
      amount: 0,
      currency: listing.currency || 'usd',
      status: 'completed',
    })

    if (insertError) {
      console.error('Free purchase insert error:', insertError)
      return NextResponse.json({ error: 'Failed to grant access' }, { status: 500 })
    }

    // Increment total_purchases
    const { error: rpcError } = await admin.rpc('increment_listing_purchases', { lid: listingId })
    if (rpcError) {
      // Fallback: manual increment if RPC doesn't exist
      await admin
        .from('listings')
        .update({ total_purchases: (listing.total_purchases || 0) + 1 })
        .eq('id', listingId)
    }

    return NextResponse.json({ free: true })
  }

  // PAID: create Stripe Checkout session
  if (!listing.stripe_price_id) {
    return NextResponse.json({ error: 'Listing has no Stripe price configured' }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: listing.stripe_price_id, quantity: 1 }],
      metadata: {
        listingId,
        workflowId: listing.workflow_id || '',
        buyerId: user.id,
      },
      success_url: 'https://0nmcp.com/console?view=store&purchased=true',
      cancel_url: 'https://0nmcp.com/console?view=store',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
