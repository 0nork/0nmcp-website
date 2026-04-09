/**
 * POST /api/exec/score
 * Trigger score recalculation for a specific client or all clients
 * Body: { clientId?: string, userId?: string, trigger?: string }
 */

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { computeScore, type ClientScoreInputs, type HackFlag } from '@/lib/0nexec/scoring-engine'
import { dispatchAlerts } from '@/lib/0nexec/alert-dispatcher'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { clientId, userId } = body

  if (!clientId && !userId) {
    return NextResponse.json({ error: 'clientId or userId required' }, { status: 400 })
  }

  // Fetch client(s)
  let query = supabase.from('exec_clients').select('*').eq('active', true)
  if (clientId) query = query.eq('id', clientId)
  else if (userId) query = query.eq('onmcp_user_id', userId)

  const { data: clients, error } = await query
  if (error || !clients?.length) {
    return NextResponse.json({ error: 'No clients found' }, { status: 404 })
  }

  const results = []

  for (const client of clients) {
    // Get previous score for delta comparison
    const { data: prevScores } = await supabase
      .from('exec_score_history')
      .select('score_total')
      .eq('client_pipedrive_deal_id', client.pipedrive_deal_id)
      .order('computed_at', { ascending: false })
      .limit(1)

    const prevScore = prevScores?.[0]?.score_total ?? 50

    // Build inputs — use defaults for now, will be replaced with live API data
    // when Pipedrive + LinkedIn integrations are wired
    const baselines = (client.stage_baselines as Record<string, number>) || {}
    const defaultBaseline = Object.values(baselines)[0] || 7

    const inputs: ClientScoreInputs = {
      dealValue: 5000,
      dealTitle: client.client_name,
      daysInCurrentStage: 3,
      stageBaseline: defaultBaseline,
      pipelineConversionRate: 25,
      openActivities: 2,
      overdueActivities: 0,
      lastActivityDays: 1,
      ctr: null,
      ctrBaseline: 0.02,
      cpa: null,
      cpaBaseline: 50,
      creativeDaysInMarket: 0,
      avgResponseLatencyHours: 4,
      lastTouchDays: 1,
      hackAuditFlags: [],
    }

    const score = computeScore(inputs)

    // Write to score history
    await supabase.from('exec_score_history').insert({
      onmcp_user_id: client.onmcp_user_id,
      client_pipedrive_deal_id: client.pipedrive_deal_id,
      client_name: client.client_name,
      score_total: score.total,
      score_dream: score.dreamOutcome,
      score_likelihood: score.likelihood,
      score_speed: score.speed,
      score_friction: score.friction,
      band: score.band,
      flags: score.flags,
    })

    // Dispatch alerts if threshold crossed
    await dispatchAlerts({
      userId: client.onmcp_user_id,
      clientId: client.id,
      clientName: client.client_name,
      dealId: client.pipedrive_deal_id,
      scoreBefore: prevScore,
      scoreAfter: score,
    })

    results.push({
      clientId: client.id,
      clientName: client.client_name,
      score: score.total,
      band: score.band,
      flags: score.flags.length,
    })
  }

  return NextResponse.json({ scored: results.length, results })
}
