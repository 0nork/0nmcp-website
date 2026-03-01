import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function GET(req: NextRequest) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ listings: [], total: 0 })
  }

  const db = createClient(supabaseUrl, serviceRoleKey)
  const { searchParams } = req.nextUrl

  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const servicesParam = searchParams.get('services')
  const sort = searchParams.get('sort') || 'popular'
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
  const offset = parseInt(searchParams.get('offset') || '0')

  let query = db
    .from('store_listings')
    .select(
      'id, title, slug, description, long_description, category, tags, price, currency, cover_image_url, services, step_count, status, total_purchases, created_at',
      { count: 'exact' }
    )
    .eq('status', 'active')

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
  }

  if (servicesParam) {
    const serviceIds = servicesParam.split(',').filter(Boolean)
    if (serviceIds.length > 0) {
      query = query.overlaps('services', serviceIds)
    }
  }

  switch (sort) {
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    default:
      query = query.order('total_purchases', { ascending: false })
  }

  query = query.range(offset, offset + limit - 1)

  const { data, count } = await query

  const listings = (data || []).map((l) => ({
    ...l,
    price: (l.price || 0) / 100,
  }))

  return NextResponse.json(
    { listings, total: count || 0 },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  )
}
