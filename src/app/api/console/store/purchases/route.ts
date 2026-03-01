import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/console/store/purchases — User's purchase history with listing details
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Fetch purchases with joined listing data
  const { data: purchases, error } = await supabase
    .from('store_purchases')
    .select(`
      id,
      listing_id,
      workflow_id,
      amount,
      currency,
      status,
      created_at,
      store_listings (
        id,
        title,
        slug,
        description,
        category,
        tags,
        price,
        currency,
        cover_image_url,
        services,
        step_count,
        status,
        total_purchases
      )
    `)
    .eq('buyer_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Enrich with workflow data
  const enriched = await Promise.all(
    (purchases || []).map(async (p) => {
      let workflow_data = null
      let workflow_name = null

      if (p.workflow_id) {
        const { data: wf } = await supabase
          .from('workflow_files')
          .select('name, workflow_data')
          .eq('id', p.workflow_id)
          .single()

        if (wf) {
          workflow_data = wf.workflow_data
          workflow_name = wf.name
        }
      }

      const listing = p.store_listings as unknown as Record<string, unknown>
      return {
        id: p.id,
        buyer_id: user.id,
        listing_id: p.listing_id,
        workflow_id: p.workflow_id,
        stripe_session_id: null,
        amount: (p.amount || 0) / 100,
        currency: p.currency,
        status: p.status,
        created_at: p.created_at,
        listing: listing ? { ...listing, price: ((listing.price as number) || 0) / 100 } : null,
        workflow_data,
        workflow_name,
      }
    })
  )

  return NextResponse.json({ purchases: enriched })
}
