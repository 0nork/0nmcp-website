import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/console/store/checkout — Purchase a store listing
 * Body: { listingId }
 *
 * Free listings: instant purchase + copy workflow to user's workflow_files
 * Paid listings: create Stripe checkout session (future)
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
    return NextResponse.json({ free: true })
  }

  // Free listing — instant purchase
  if (listing.price === 0) {
    // Copy workflow to user's workflow_files
    let workflowFileId: string | null = null

    if (listing.workflow_data) {
      const wfData = listing.workflow_data as Record<string, unknown>
      const header = wfData.$0n as Record<string, string> | undefined
      const workflowName = header?.name || listing.title

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
    }

    // Record purchase
    await supabase.from('store_purchases').insert({
      buyer_id: user.id,
      listing_id: listingId,
      workflow_id: workflowFileId,
      amount: 0,
      currency: 'usd',
      status: 'completed',
    })

    // Increment total_purchases
    await supabase
      .from('store_listings')
      .update({ total_purchases: (listing.total_purchases || 0) + 1 })
      .eq('id', listingId)

    // Also save to user's vault files (universal .0n file storage)
    let vaultFileId: string | null = null
    if (listing.workflow_data) {
      const wfData = listing.workflow_data as Record<string, unknown>
      const header = wfData.$0n as Record<string, string> | undefined
      const fileType = header?.type || 'workflow'

      const { data: vf } = await supabase
        .from('user_vault_files')
        .insert({
          user_id: user.id,
          name: header?.name || listing.title,
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

    return NextResponse.json({ free: true, workflowId: workflowFileId, vaultFileId })
  }

  // Paid listing — Stripe checkout (future)
  return NextResponse.json({ error: 'Paid checkout not yet implemented' }, { status: 501 })
}
