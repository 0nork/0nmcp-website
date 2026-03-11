import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/admin/onboarding — List experiments with funnel stats
 */
export async function GET(request: NextRequest) {
  const admin = getAdmin()

  // Verify admin
  const authCheck = await admin.from('profiles').select('role').eq('role', 'admin').limit(1)
  if (!authCheck.data?.length) {
    // Fallback: check cookie auth
    const cookie = request.cookies.get('sb-access-token')?.value
    if (!cookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const experimentId = request.nextUrl.searchParams.get('id')

  if (experimentId) {
    // Get single experiment with detailed stats
    const [experiment, variants, events] = await Promise.all([
      admin.from('onboarding_experiments').select('*').eq('id', experimentId).single(),
      admin.from('onboarding_variants').select('*').eq('experiment_id', experimentId).order('is_control', { ascending: false }),
      admin.from('onboarding_events').select('*').eq('experiment_id', experimentId).order('created_at', { ascending: false }).limit(5000),
    ])

    if (!experiment.data) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Calculate funnel per variant
    const variantStats = (variants.data || []).map(v => {
      const variantEvents = (events.data || []).filter(e => e.variant_id === v.id)
      const steps = JSON.parse(typeof v.step_order === 'string' ? v.step_order : JSON.stringify(v.step_order)) as string[]
      const uniqueUsers = new Set(variantEvents.map(e => e.user_id)).size

      const funnel = steps.map(step => {
        const views = new Set(variantEvents.filter(e => e.step === step && e.event_type === 'view').map(e => e.user_id)).size
        const completes = new Set(variantEvents.filter(e => e.step === step && e.event_type === 'complete').map(e => e.user_id)).size
        const skips = new Set(variantEvents.filter(e => e.step === step && e.event_type === 'skip').map(e => e.user_id)).size
        const dropOffs = new Set(variantEvents.filter(e => e.step === step && e.event_type === 'drop_off').map(e => e.user_id)).size
        const avgDuration = variantEvents
          .filter(e => e.step === step && e.event_type === 'complete' && e.duration_ms)
          .reduce((acc, e, _, arr) => acc + (e.duration_ms || 0) / arr.length, 0)

        return { step, views, completes, skips, dropOffs, avgDuration: Math.round(avgDuration) }
      })

      const completionRate = uniqueUsers > 0
        ? (new Set(variantEvents.filter(e => e.step === 'launch' && e.event_type === 'complete').map(e => e.user_id)).size / uniqueUsers * 100)
        : 0

      return {
        ...v,
        totalUsers: uniqueUsers,
        completionRate: Math.round(completionRate * 10) / 10,
        funnel,
      }
    })

    return NextResponse.json({ experiment: experiment.data, variants: variantStats })
  }

  // List all experiments with summary stats
  const { data: experiments } = await admin
    .from('onboarding_experiments')
    .select('*')
    .order('created_at', { ascending: false })

  // Get assignment counts per experiment
  const stats = await Promise.all(
    (experiments || []).map(async exp => {
      const [assignments, completions] = await Promise.all([
        admin.from('onboarding_assignments').select('id', { count: 'exact', head: true }).eq('experiment_id', exp.id),
        admin.from('onboarding_events').select('user_id').eq('experiment_id', exp.id).eq('step', 'launch').eq('event_type', 'complete'),
      ])
      const totalUsers = assignments.count || 0
      const completedUsers = new Set((completions.data || []).map(e => e.user_id)).size
      return {
        ...exp,
        totalUsers,
        completedUsers,
        completionRate: totalUsers > 0 ? Math.round(completedUsers / totalUsers * 1000) / 10 : 0,
      }
    })
  )

  return NextResponse.json({ experiments: stats })
}

/**
 * POST /api/admin/onboarding — Create or update experiment
 */
export async function POST(request: NextRequest) {
  const admin = getAdmin()
  const body = await request.json()
  const { action } = body

  if (action === 'create') {
    const { name, description, variants } = body

    // Create experiment
    const { data: exp, error: expError } = await admin
      .from('onboarding_experiments')
      .insert({ name, description, status: 'draft' })
      .select()
      .single()

    if (expError || !exp) return NextResponse.json({ error: expError?.message || 'Failed' }, { status: 500 })

    // Create variants
    if (variants?.length) {
      const variantRows = variants.map((v: { name: string; is_control?: boolean; weight?: number; step_order?: string[]; step_config?: Record<string, unknown> }) => ({
        experiment_id: exp.id,
        name: v.name,
        is_control: v.is_control || false,
        weight: v.weight || Math.floor(100 / variants.length),
        step_order: JSON.stringify(v.step_order || ['welcome', 'profile', 'tools', 'payment', 'community', 'launch']),
        step_config: JSON.stringify(v.step_config || {}),
      }))

      await admin.from('onboarding_variants').insert(variantRows)
    }

    return NextResponse.json({ ok: true, experiment: exp })
  }

  if (action === 'update_status') {
    const { id, status } = body
    const { error } = await admin
      .from('onboarding_experiments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  if (action === 'add_variant') {
    const { experiment_id, name, step_order, step_config, weight, is_control } = body
    const { data, error } = await admin
      .from('onboarding_variants')
      .insert({
        experiment_id,
        name,
        step_order: JSON.stringify(step_order),
        step_config: JSON.stringify(step_config || {}),
        weight: weight || 50,
        is_control: is_control || false,
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, variant: data })
  }

  if (action === 'delete_variant') {
    const { id } = body
    const { error } = await admin.from('onboarding_variants').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
