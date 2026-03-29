import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * GET /api/affiliate/services
 * Returns all service affiliate links for integration pages.
 * Optional ?service_id=stripe for single service lookup.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const serviceId = searchParams.get('service_id')

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  let query = admin
    .from('service_affiliate_links')
    .select('*')
    .eq('is_active', true)
    .order('service_name')

  if (serviceId) {
    query = query.eq('service_id', serviceId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ services: data || [] })
}
