import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const DEFAULT_LOCATION_ID = process.env.CRM_LOCATION_ID || 'nphConTwfHcVE1oA0uep'

interface LocationEntry {
  id: string
  name: string
  isActive: boolean
}

/**
 * GET /api/console/crm/locations
 * Returns all locations the user has access to.
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: account } = await admin
    .from('user_crm_accounts')
    .select('location_id, metadata')
    .eq('user_id', user.id)
    .single()

  const meta = (account?.metadata as Record<string, unknown>) || {}
  const activeLocation =
    (meta.active_location as string) || account?.location_id || DEFAULT_LOCATION_ID
  const additionalLocations = (meta.additional_locations as Array<{ id: string; name: string }>) || []

  const locations: LocationEntry[] = []

  // Always include the default 0nMCP location
  locations.push({
    id: DEFAULT_LOCATION_ID,
    name: '0nMCP (Default)',
    isActive: activeLocation === DEFAULT_LOCATION_ID,
  })

  // Include the user's primary location if different from default
  if (account?.location_id && account.location_id !== DEFAULT_LOCATION_ID) {
    locations.push({
      id: account.location_id,
      name: (meta.location_name as string) || 'Primary Location',
      isActive: activeLocation === account.location_id,
    })
  }

  // Include any additional locations from metadata
  for (const loc of additionalLocations) {
    if (!locations.some((l) => l.id === loc.id)) {
      locations.push({
        id: loc.id,
        name: loc.name || loc.id,
        isActive: activeLocation === loc.id,
      })
    }
  }

  return NextResponse.json({
    locations,
    activeLocationId: activeLocation,
  })
}

/**
 * POST /api/console/crm/locations
 * Set the user's active location. Body: { locationId, pitToken? }
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { locationId, pitToken } = body as {
    locationId?: string
    pitToken?: string
  }

  if (!locationId) {
    return NextResponse.json({ error: 'locationId is required' }, { status: 400 })
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Get existing account
  const { data: existing } = await admin
    .from('user_crm_accounts')
    .select('id, metadata')
    .eq('user_id', user.id)
    .single()

  const currentMeta = (existing?.metadata as Record<string, unknown>) || {}
  const updatedMeta: Record<string, unknown> = {
    ...currentMeta,
    active_location: locationId,
    ...(pitToken ? { pit_token: pitToken } : {}),
  }

  if (existing) {
    // Update existing record
    const { error } = await admin
      .from('user_crm_accounts')
      .update({ metadata: updatedMeta })
      .eq('id', existing.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to update location', details: error.message }, { status: 500 })
    }
  } else {
    // Create new record
    const { error } = await admin.from('user_crm_accounts').insert({
      user_id: user.id,
      location_id: locationId,
      metadata: updatedMeta,
    })

    if (error) {
      return NextResponse.json({ error: 'Failed to save location', details: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({
    activeLocationId: locationId,
    success: true,
  })
}
