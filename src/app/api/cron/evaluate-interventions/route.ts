/**
 * CRON: Evaluate interventions — LVOS learning loop
 * Schedule: daily at 6am (0 6 * * *)
 * Measures score_after_7d for interventions that are 7+ days old
 * Updates LVOS variant pool weights via Thompson Sampling
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Find interventions that are 7+ days old and haven't been evaluated yet
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: interventions } = await supabase
    .from('exec_intervention_events')
    .select('*')
    .is('score_after_7d', null)
    .lt('intervened_at', sevenDaysAgo)
    .limit(100)

  if (!interventions?.length) {
    return NextResponse.json({ message: 'No interventions to evaluate', evaluated: 0 })
  }

  let evaluated = 0

  for (const intervention of interventions) {
    // Get the most recent score for this client
    const { data: scores } = await supabase
      .from('exec_score_history')
      .select('score_total')
      .eq('client_pipedrive_deal_id', intervention.client_pipedrive_deal_id)
      .order('computed_at', { ascending: false })
      .limit(1)

    const currentScore = scores?.[0]?.score_total ?? intervention.score_before ?? 50
    const delta = currentScore - (intervention.score_before ?? 50)

    // Calculate recovery days
    let recoveryDays: number | null = null
    if (delta > 0) {
      const { data: recoveryScores } = await supabase
        .from('exec_score_history')
        .select('score_total, computed_at')
        .eq('client_pipedrive_deal_id', intervention.client_pipedrive_deal_id)
        .gt('computed_at', intervention.intervened_at)
        .gte('score_total', intervention.score_before ?? 50)
        .order('computed_at')
        .limit(1)

      if (recoveryScores?.[0]) {
        const recoveredAt = new Date(recoveryScores[0].computed_at).getTime()
        const intervenedAt = new Date(intervention.intervened_at).getTime()
        recoveryDays = Math.ceil((recoveredAt - intervenedAt) / (24 * 60 * 60 * 1000))
      }
    }

    // Update intervention with measured results
    await supabase.from('exec_intervention_events').update({
      score_after_7d: currentScore,
      score_delta: delta,
      recovery_days: recoveryDays,
      evaluated_at: new Date().toISOString(),
    }).eq('id', intervention.id)

    // Update LVOS variant pool — upsert performance data
    if (intervention.flag_layer && intervention.intervention_type) {
      const { data: existing } = await supabase
        .from('exec_lvos_variant_pool')
        .select('id, observation_count, avg_score_delta, avg_recovery_days')
        .eq('flag_layer', intervention.flag_layer)
        .eq('intervention_type', intervention.intervention_type)
        .eq('segment_industry', 'all')
        .eq('segment_stage', 'all')
        .single()

      if (existing) {
        const newCount = existing.observation_count + 1
        const newAvgDelta = ((existing.avg_score_delta * existing.observation_count) + delta) / newCount
        const newAvgRecovery = recoveryDays != null && existing.avg_recovery_days != null
          ? ((existing.avg_recovery_days * existing.observation_count) + recoveryDays) / newCount
          : recoveryDays ?? existing.avg_recovery_days

        // Thompson Sampling weight: higher = better performing intervention
        const weight = Math.min(Math.max((newAvgDelta + 25) / 50, 0.01), 0.99)

        await supabase.from('exec_lvos_variant_pool').update({
          observation_count: newCount,
          avg_score_delta: newAvgDelta,
          avg_recovery_days: newAvgRecovery,
          performance_weight: weight,
          last_updated: new Date().toISOString(),
        }).eq('id', existing.id)
      } else {
        const weight = Math.min(Math.max((delta + 25) / 50, 0.01), 0.99)
        await supabase.from('exec_lvos_variant_pool').insert({
          segment_industry: 'all',
          segment_stage: 'all',
          flag_hack_number: intervention.flag_hack_number,
          flag_layer: intervention.flag_layer,
          intervention_type: intervention.intervention_type,
          observation_count: 1,
          avg_score_delta: delta,
          avg_recovery_days: recoveryDays,
          performance_weight: weight,
        })
      }
    }

    evaluated++
  }

  return NextResponse.json({ evaluated, timestamp: new Date().toISOString() })
}
