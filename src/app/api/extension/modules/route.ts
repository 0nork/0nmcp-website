import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyToken } from '../auth/route'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/** Free modules — always enabled after auth */
const FREE_MODULES = ['page-scraper', 'workflow-runner', 'seo-analyzer']

/**
 * GET /api/extension/modules — Return user's enabled extension modules
 * Header: Authorization: Bearer <token>
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
  }

  const userId = verifyToken(token)
  if (!userId) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const admin = getAdmin()

  // Get all extension listings
  const { data: extensionListings } = await admin
    .from('store_listings')
    .select('id, title, slug, description, price, category, workflow_data')
    .eq('status', 'active')
    .eq('category', 'extensions')

  if (!extensionListings || extensionListings.length === 0) {
    return NextResponse.json({
      modules: [],
      user_id: userId,
    })
  }

  // Get user's purchases of extension listings
  const extensionIds = extensionListings.map((l) => l.id)
  const { data: purchases } = await admin
    .from('store_purchases')
    .select('listing_id')
    .eq('buyer_id', userId)
    .eq('status', 'completed')
    .in('listing_id', extensionIds)

  const purchasedIds = new Set((purchases || []).map((p) => p.listing_id))

  // Build module list
  const modules = extensionListings.map((listing) => {
    const moduleData = (listing.workflow_data as Record<string, unknown>)?.$0n as Record<string, unknown> | undefined
    const moduleId = (moduleData?.module_id as string) || listing.slug
    const isFree = listing.price === 0 || FREE_MODULES.includes(moduleId)
    const isPurchased = purchasedIds.has(listing.id)
    const enabled = isFree || isPurchased

    return {
      id: moduleId,
      listing_id: listing.id,
      name: listing.title,
      slug: listing.slug,
      description: listing.description,
      enabled,
      price: (listing.price || 0) / 100,
      free: isFree,
      version: (moduleData?.version as string) || '1.0.0',
      permissions: (moduleData?.permissions as string[]) || [],
    }
  })

  return NextResponse.json({
    modules,
    user_id: userId,
  })
}
