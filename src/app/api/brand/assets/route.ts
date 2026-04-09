import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const subLocationId = req.nextUrl.searchParams.get('sub_location_id')

  if (!subLocationId) {
    return NextResponse.json({ error: 'sub_location_id required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('brand_assets')
    .select('*')
    .eq('sub_location_id', subLocationId)
    .order('created_at')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ assets: data, count: data.length })
}
