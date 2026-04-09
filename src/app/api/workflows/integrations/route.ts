import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const subLocationId = req.nextUrl.searchParams.get('sub_location_id')
  if (!subLocationId) return NextResponse.json({ error: 'sub_location_id required' }, { status: 400 })

  const { data, error } = await supabase
    .from('sub_location_integrations')
    .select('integration_key, status, connected_at')
    .eq('sub_location_id', subLocationId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ integrations: data, count: data?.length || 0 })
}

export async function POST(req: NextRequest) {
  const { sub_location_id, integration_key } = await req.json()
  if (!sub_location_id || !integration_key) return NextResponse.json({ error: 'sub_location_id and integration_key required' }, { status: 400 })

  const { error } = await supabase.from('sub_location_integrations').upsert({
    sub_location_id, integration_key, status: 'connected',
  }, { onConflict: 'sub_location_id,integration_key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ connected: true, integration_key })
}
