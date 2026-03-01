import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/console/store — List active store listings + user's purchase status
 * Query params: ?category=sales&search=linkedin
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const search = searchParams.get('search')

  // Build listings query
  let query = supabase
    .from('store_listings')
    .select('id, title, slug, description, category, tags, price, currency, cover_image_url, stripe_product_id, stripe_price_id, workflow_id, services, step_count, status, total_purchases, created_at, updated_at')
    .eq('status', 'active')
    .order('total_purchases', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data: listings, error: listingsError } = await query

  if (listingsError) {
    return NextResponse.json({ error: listingsError.message }, { status: 500 })
  }

  // Get user's purchased listing IDs
  let purchasedListingIds: string[] = []
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const { data: purchases } = await supabase
      .from('store_purchases')
      .select('listing_id')
      .eq('buyer_id', user.id)
      .eq('status', 'completed')

    if (purchases) {
      purchasedListingIds = purchases.map((p) => p.listing_id)
    }
  }

  return NextResponse.json({
    listings: (listings || []).map((l) => ({
      ...l,
      price: (l.price || 0) / 100,
    })),
    purchasedListingIds,
  })
}
