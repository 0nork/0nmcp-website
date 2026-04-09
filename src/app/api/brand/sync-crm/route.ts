import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { syncBrandToCRM } from '@/lib/brand/crm/syncBrand'
import type { OnBrandFile } from '@/types/brand'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { sub_location_id } = body

  if (!sub_location_id) {
    return NextResponse.json({ error: 'sub_location_id required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('brand_profiles')
    .select('brand_json')
    .eq('sub_location_id', sub_location_id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Brand profile not found' }, { status: 404 })
  }

  const result = await syncBrandToCRM(sub_location_id, data.brand_json as OnBrandFile)

  if (result.success) {
    await supabase
      .from('brand_profiles')
      .update({ crm_synced_at: new Date().toISOString() })
      .eq('sub_location_id', sub_location_id)
  }

  return NextResponse.json(result)
}
