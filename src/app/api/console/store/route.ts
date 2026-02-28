import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
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

  const url = new URL(request.url)
  const category = url.searchParams.get('category')
  const search = url.searchParams.get('search')
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)

  // Fetch active listings
  let query = supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .order('total_purchases', { ascending: false })
    .limit(limit)

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  const { data: listings, error: listingsError } = await query

  if (listingsError) {
    console.error('Store listings error:', listingsError)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }

  // Fetch user's purchased listing IDs
  const { data: purchases } = await supabase
    .from('purchases')
    .select('listing_id')
    .eq('buyer_id', user.id)
    .eq('status', 'completed')

  const purchasedListingIds = (purchases || []).map((p: { listing_id: string }) => p.listing_id)

  return NextResponse.json({ listings: listings || [], purchasedListingIds })
}
