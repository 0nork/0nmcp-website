import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    const user = (await supabase.auth.getSession()).data.session?.user ?? null
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const assetType = searchParams.get('type')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = getAdmin()
      .from('builder_assets')
      .select('id, title, asset_type, prompt, status, version, listing_id, metadata, created_at, updated_at', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (assetType) query = query.eq('asset_type', assetType)
    if (status) query = query.eq('status', status)

    const { data, count, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ assets: data || [], total: count || 0 })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 })
  }
}
