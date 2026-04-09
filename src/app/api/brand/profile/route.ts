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
    .from('brand_profiles')
    .select('brand_json, crm_synced_at, generation_mode, updated_at')
    .eq('sub_location_id', subLocationId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 })
  }

  return NextResponse.json(data.brand_json)
}

export async function DELETE(req: NextRequest) {
  const subLocationId = req.nextUrl.searchParams.get('sub_location_id')

  if (!subLocationId) {
    return NextResponse.json({ error: 'sub_location_id required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('brand_profiles')
    .delete()
    .eq('sub_location_id', subLocationId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: true })
}
