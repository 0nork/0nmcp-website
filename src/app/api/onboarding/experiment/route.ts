import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/onboarding/experiment — Get assigned variant for current user
 *
 * Returns the active experiment variant (step order + config).
 * If no assignment exists, randomly assigns one based on weights.
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const admin = getAdmin()

  // Find active experiment
  const { data: experiments } = await admin
    .from('onboarding_experiments')
    .select('id')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)

  if (!experiments?.length) {
    // No active experiment — return default flow
    return NextResponse.json({
      experiment_id: null,
      variant_id: null,
      step_order: ['welcome', 'profile', 'tools', 'payment', 'community', 'launch'],
      step_config: {},
    })
  }

  const experimentId = experiments[0].id

  // Check existing assignment
  const { data: existing } = await admin
    .from('onboarding_assignments')
    .select('variant_id')
    .eq('user_id', user.id)
    .eq('experiment_id', experimentId)
    .single()

  let variantId = existing?.variant_id

  if (!variantId) {
    // Assign variant based on weights
    const { data: variants } = await admin
      .from('onboarding_variants')
      .select('id, weight')
      .eq('experiment_id', experimentId)

    if (!variants?.length) {
      return NextResponse.json({
        experiment_id: null,
        variant_id: null,
        step_order: ['welcome', 'profile', 'tools', 'payment', 'community', 'launch'],
        step_config: {},
      })
    }

    // Weighted random selection
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0)
    let rand = Math.random() * totalWeight
    let selected = variants[0]
    for (const v of variants) {
      rand -= v.weight
      if (rand <= 0) { selected = v; break }
    }

    variantId = selected.id

    // Save assignment
    await admin.from('onboarding_assignments').insert({
      user_id: user.id,
      experiment_id: experimentId,
      variant_id: variantId,
    })
  }

  // Fetch variant details
  const { data: variant } = await admin
    .from('onboarding_variants')
    .select('id, name, step_order, step_config')
    .eq('id', variantId)
    .single()

  if (!variant) {
    return NextResponse.json({
      experiment_id: experimentId,
      variant_id: variantId,
      step_order: ['welcome', 'profile', 'tools', 'payment', 'community', 'launch'],
      step_config: {},
    })
  }

  return NextResponse.json({
    experiment_id: experimentId,
    variant_id: variant.id,
    variant_name: variant.name,
    step_order: typeof variant.step_order === 'string' ? JSON.parse(variant.step_order) : variant.step_order,
    step_config: typeof variant.step_config === 'string' ? JSON.parse(variant.step_config) : variant.step_config,
  })
}

/**
 * POST /api/onboarding/experiment — Track onboarding event
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { step, event_type, experiment_id, variant_id, metadata, duration_ms } = await request.json()

  if (!step || !event_type) {
    return NextResponse.json({ error: 'step and event_type required' }, { status: 400 })
  }

  const admin = getAdmin()

  const { error } = await admin.from('onboarding_events').insert({
    user_id: user.id,
    experiment_id: experiment_id || null,
    variant_id: variant_id || null,
    step,
    event_type,
    metadata: metadata || {},
    duration_ms: duration_ms || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
