import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { deploySnapshot, calculateCompletion, getNextPromptField } from '@/lib/vault-snapshot'

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

/**
 * GET /api/vault?locationId=xxx — Get vault data + completion for a location
 * GET /api/vault?locationId=xxx&prompt=true — Get the next missing field prompt
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const locationId = searchParams.get('locationId')
  const wantPrompt = searchParams.get('prompt') === 'true'

  if (!locationId) {
    return NextResponse.json({ error: 'locationId required' }, { status: 400 })
  }

  if (wantPrompt) {
    const prompt = await getNextPromptField(locationId)
    return NextResponse.json({ prompt })
  }

  const supabase = db()

  const [biz, tracking, ai, services, completion] = await Promise.all([
    supabase.from('vault_business_info').select('*').eq('location_id', locationId).single(),
    supabase.from('vault_tracking').select('*').eq('location_id', locationId).single(),
    supabase.from('vault_ai_preferences').select('*').eq('location_id', locationId).single(),
    supabase.from('vault_services').select('*').eq('location_id', locationId).order('sort_order'),
    supabase.from('vault_completion').select('*').eq('location_id', locationId).single(),
  ])

  return NextResponse.json({
    business: biz.data,
    tracking: tracking.data,
    ai: ai.data,
    services: services.data || [],
    completion: completion.data,
  })
}

/**
 * POST /api/vault — Deploy snapshot or update vault data
 *
 * Body:
 *   action: 'deploy_snapshot' | 'update_field' | 'add_service' | 'recalculate'
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, locationId } = body

  if (!locationId) {
    return NextResponse.json({ error: 'locationId required' }, { status: 400 })
  }

  const supabase = db()

  switch (action) {
    case 'deploy_snapshot': {
      const { crmPit, crmLocationId } = body
      if (!crmPit || !crmLocationId) {
        return NextResponse.json({ error: 'crmPit and crmLocationId required' }, { status: 400 })
      }
      const result = await deploySnapshot(locationId, crmPit, crmLocationId)
      return NextResponse.json({ success: true, result })
    }

    case 'update_field': {
      const { table, field, value } = body
      if (!table || !field) {
        return NextResponse.json({ error: 'table and field required' }, { status: 400 })
      }

      const allowedTables = ['vault_business_info', 'vault_tracking', 'vault_ai_preferences']
      if (!allowedTables.includes(table)) {
        return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
      }

      const { error } = await supabase
        .from(table)
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('location_id', locationId)

      if (error) {
        // Row might not exist yet — upsert
        await supabase.from(table).upsert({
          location_id: locationId,
          [field]: value,
          updated_at: new Date().toISOString(),
        })
      }

      // Recalculate completion
      const completion = await calculateCompletion(supabase, locationId)
      return NextResponse.json({ success: true, completion })
    }

    case 'add_service': {
      const { name, description, category, price, duration, booking_url, is_featured } = body
      const { data, error } = await supabase.from('vault_services').insert({
        location_id: locationId,
        name, description, category, price, duration, booking_url,
        is_featured: is_featured || false,
      }).select().single()

      const completion = await calculateCompletion(supabase, locationId)
      return NextResponse.json({ success: !error, service: data, completion })
    }

    case 'recalculate': {
      const completion = await calculateCompletion(supabase, locationId)
      return NextResponse.json({ success: true, completion })
    }

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }
}
