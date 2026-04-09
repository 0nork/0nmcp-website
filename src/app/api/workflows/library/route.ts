import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: NextRequest) {
  const subLocationId = req.nextUrl.searchParams.get('sub_location_id')
  const search = req.nextUrl.searchParams.get('search') || ''

  if (!subLocationId) return NextResponse.json({ error: 'sub_location_id required' }, { status: 400 })

  let query = supabase
    .from('workflow_library')
    .select('id, name, description, tags, use_count, last_used_at, crm_workflow_id, created_at')
    .eq('sub_location_id', subLocationId)
    .order('last_used_at', { ascending: false, nullsFirst: false })

  if (search) query = query.ilike('name', `%${search}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ workflows: data, count: data.length })
}
