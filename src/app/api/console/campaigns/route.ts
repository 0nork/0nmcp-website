/**
 * GET  /api/console/campaigns — List user's campaigns
 * POST /api/console/campaigns — Create/update a campaign
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ campaigns: [] })
  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdmin()

  // Get user's location
  const { data: account } = await admin
    .from('user_crm_accounts')
    .select('location_id')
    .eq('user_id', user.id)
    .maybeSingle()

  let query = admin.from('campaign_sequences').select('*').order('created_at', { ascending: false })

  if (account?.location_id) {
    query = query.eq('location_id', account.location_id)
  } else {
    query = query.eq('user_id', user.id)
  }

  const { data } = await query
  return NextResponse.json({ campaigns: data || [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })
  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const admin = getAdmin()

  // Get user's location
  const { data: account } = await admin
    .from('user_crm_accounts')
    .select('location_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const locationId = body.location_id || account?.location_id
  if (!locationId) return NextResponse.json({ error: 'No CRM location found' }, { status: 400 })

  const slug = body.slug || body.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) || `campaign-${Date.now()}`

  const { data, error } = await admin
    .from('campaign_sequences')
    .upsert({
      user_id: user.id,
      location_id: locationId,
      name: body.name || 'Untitled Campaign',
      slug,
      description: body.description || '',
      status: 'draft',
      segment_filter: body.segment_filter || { has_email: true },
      steps: body.steps || [],
      brand_colors: body.brand_colors || {},
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,slug' })
    .select('id, slug')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, campaign: data })
}
