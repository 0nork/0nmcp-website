import { NextRequest, NextResponse } from 'next/server'
import { verifySkillToken, getSkillAdmin } from '@/lib/skill-auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/skill/store — List available store listings + user's purchases
 *
 * ?view=purchased — only show purchased workflows
 * ?view=available — show all available listings
 * ?slug=<slug> — get a specific listing with workflow data
 */
export async function GET(request: NextRequest) {
  const user = await verifySkillToken(request.headers.get('authorization'))
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = getSkillAdmin()
  const { searchParams } = new URL(request.url)
  const view = searchParams.get('view') || 'available'
  const slug = searchParams.get('slug')

  // Specific listing
  if (slug) {
    const { data: listing } = await admin
      .from('store_listings')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Check if user has purchased it
    const { count } = await admin
      .from('store_purchases')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('listing_id', listing.id)

    return NextResponse.json({
      listing,
      purchased: (count || 0) > 0,
    })
  }

  // User's purchases
  if (view === 'purchased') {
    const { data: purchases } = await admin
      .from('store_purchases')
      .select('*, store_listings(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ purchases: purchases || [] })
  }

  // All available listings
  const { data: listings } = await admin
    .from('store_listings')
    .select('id, slug, name, description, category, tier, price_runs, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(50)

  return NextResponse.json({ listings: listings || [] })
}
