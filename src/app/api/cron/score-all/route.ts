// CRON: Score all active 0nExec clients
// Schedule: every 2 hours
// Recalculates scores for all active clients across all users

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { computeScore, type ClientScoreInputs } from '@/lib/0nexec/scoring-engine'
import { dispatchAlerts } from '@/lib/0nexec/alert-dispatcher'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(req: Request) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: clients } = await supabase
    .from('exec_clients')
    .select('*')
    .eq('active', true)

  if (!clients?.length) {
    return NextResponse.json({ message: 'No active clients', scored: 0 })
  }

  let scored = 0
  let alerts = 0

  for (const client of clients) {
    // Get previous score
    const { data: prevScores } = await supabase
      .from('exec_score_history')
      .select('score_total')
      .eq('client_pipedrive_deal_id', client.pipedrive_deal_id)
      .order('computed_at', { ascending: false })
      .limit(1)

    const prevScore = prevScores?.[0]?.score_total ?? 50
    const baselines = (client.stage_baselines as Record<string, number>) || {}
    const defaultBaseline = Object.values(baselines)[0] || 7

    // Build inputs — defaults for now, live data when Pipedrive/LinkedIn wired
    const inputs: ClientScoreInputs = {
      dealValue: 5000,
      dealTitle: client.client_name,
      daysInCurrentStage: Math.floor(Math.random() * 14) + 1,
      stageBaseline: defaultBaseline,
      pipelineConversionRate: 20 + Math.floor(Math.random() * 30),
      openActivities: Math.floor(Math.random() * 5),
      overdueActivities: Math.floor(Math.random() * 3),
      lastActivityDays: Math.floor(Math.random() * 7),
      ctr: null,
      ctrBaseline: 0.02,
      cpa: null,
      cpaBaseline: 50,
      creativeDaysInMarket: Math.floor(Math.random() * 30),
      avgResponseLatencyHours: Math.floor(Math.random() * 24) + 1,
      lastTouchDays: Math.floor(Math.random() * 7),
      hackAuditFlags: [],
    }

    const score = computeScore(inputs)

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

    scored++
    if (score.band === 'CRITICAL' && prevScore >= 40) alerts++
  }

  return NextResponse.json({ scored, alerts, timestamp: new Date().toISOString() })
}
