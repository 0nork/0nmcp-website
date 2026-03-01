import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/console/store/download — Download .0n workflow file
 * Body: { listingId } or { workflowId }
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
  const { listingId, workflowId } = body

  // Download by workflowId — user must own it
  if (workflowId) {
    const { data: wf } = await supabase
      .from('workflow_files')
      .select('name, workflow_data')
      .eq('id', workflowId)
      .eq('owner_id', user.id)
      .single()

    if (!wf) {
      return NextResponse.json({ error: 'Workflow not found or not owned' }, { status: 404 })
    }

    const slug = (wf.name || 'workflow').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    return NextResponse.json({
      workflow: wf.workflow_data,
      filename: `${slug}.0n.json`,
    })
  }

  // Download by listingId — must be free or purchased
  if (listingId) {
    const { data: listing } = await supabase
      .from('store_listings')
      .select('slug, workflow_data, price')
      .eq('id', listingId)
      .single()

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.price > 0) {
      const { data: purchase } = await supabase
        .from('store_purchases')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('listing_id', listingId)
        .eq('status', 'completed')
        .maybeSingle()

      if (!purchase) {
        return NextResponse.json({ error: 'Not purchased' }, { status: 403 })
      }
    }

    return NextResponse.json({
      workflow: listing.workflow_data,
      filename: `${listing.slug}.0n.json`,
    })
  }

  return NextResponse.json({ error: 'listingId or workflowId required' }, { status: 400 })
}
