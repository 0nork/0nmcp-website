import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_STORE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_STORE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Store webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { listingId, workflowId, buyerId } = session.metadata || {}

    if (!listingId || !buyerId) {
      console.error('Store webhook missing metadata:', session.metadata)
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    // Check for existing purchase (idempotency)
    const { data: existing } = await admin
      .from('purchases')
      .select('id')
      .eq('buyer_id', buyerId)
      .eq('listing_id', listingId)
      .eq('status', 'completed')
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ received: true, note: 'already fulfilled' })
    }

    // Insert purchase record
    const { error: insertError } = await admin.from('purchases').insert({
      buyer_id: buyerId,
      listing_id: listingId,
      workflow_id: workflowId || null,
      stripe_session_id: session.id,
      amount: (session.amount_total || 0) / 100,
      currency: session.currency || 'usd',
      status: 'completed',
    })

    if (insertError) {
      console.error('Store webhook purchase insert error:', insertError)
      return NextResponse.json({ error: 'Failed to insert purchase' }, { status: 500 })
    }

    // Increment total_purchases on listing
    const { data: listing } = await admin
      .from('listings')
      .select('total_purchases')
      .eq('id', listingId)
      .single()

    if (listing) {
      await admin
        .from('listings')
        .update({ total_purchases: (listing.total_purchases || 0) + 1 })
        .eq('id', listingId)
    }

    console.log(`Store purchase fulfilled: buyer=${buyerId} listing=${listingId}`)
  }

  return NextResponse.json({ received: true })
}
