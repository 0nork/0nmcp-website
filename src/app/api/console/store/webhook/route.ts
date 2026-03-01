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
    const { listingId, buyerId } = session.metadata || {}

    if (!listingId || !buyerId) {
      console.error('Store webhook missing metadata:', session.metadata)
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    // Idempotency check — use store_purchases, keyed on stripe_session_id
    const { data: existingBySession } = await admin
      .from('store_purchases')
      .select('id')
      .eq('stripe_session_id', session.id)
      .maybeSingle()

    if (existingBySession) {
      return NextResponse.json({ received: true, note: 'already fulfilled' })
    }

    // Also check by buyer + listing in case a previous webhook fired without session id
    const { data: existingByBuyer } = await admin
      .from('store_purchases')
      .select('id')
      .eq('buyer_id', buyerId)
      .eq('listing_id', listingId)
      .eq('status', 'completed')
      .maybeSingle()

    if (existingByBuyer) {
      return NextResponse.json({ received: true, note: 'already fulfilled' })
    }

    // Fetch listing to get workflow_data
    const { data: listing, error: listingError } = await admin
      .from('store_listings')
      .select('*')
      .eq('id', listingId)
      .single()

    if (listingError || !listing) {
      console.error('Store webhook: listing not found:', listingId)
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    let workflowFileId: string | null = null
    let vaultFileId: string | null = null

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
      const { data: vf } = await admin
        .from('user_vault_files')
        .insert({
          user_id: buyerId,
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
    const amount = (session.amount_total || 0) / 100
    const { error: insertError } = await admin.from('store_purchases').insert({
      buyer_id: buyerId,
      listing_id: listingId,
      workflow_id: workflowFileId,
      stripe_session_id: session.id,
      amount,
      currency: session.currency || 'usd',
      status: 'completed',
    })

    if (insertError) {
      console.error('Store webhook purchase insert error:', insertError)
      return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 })
    }

    // Increment total_purchases on listing
    await admin
      .from('store_listings')
      .update({ total_purchases: (listing.total_purchases || 0) + 1 })
      .eq('id', listingId)

    console.log(
      `Store purchase fulfilled: buyer=${buyerId} listing=${listingId} amount=${amount} session=${session.id} workflowFile=${workflowFileId} vaultFile=${vaultFileId}`
    )
  }

  return NextResponse.json({ received: true })
}
