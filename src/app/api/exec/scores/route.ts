/**
 * GET /api/exec/scores
 * Returns latest score for each client belonging to the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  // Get user from auth cookie or header
  const authHeader = req.headers.get('authorization')
  let userId: string | null = null

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const { data } = await supabase.auth.getUser(token)
    userId = data.user?.id ?? null
  }

  if (!userId) {
    // Try cookie-based auth
    const { data } = await supabase.auth.getUser()
    userId = data.user?.id ?? null
  }

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get all active clients
  const { data: clients } = await supabase
    .from('exec_clients')
    .select('id, pipedrive_deal_id, client_name, client_industry, pm_name, slack_channel_id, linkedin_account_id, stage_baselines')
    .eq('onmcp_user_id', userId)
    .eq('active', true)

  if (!clients?.length) {
    return NextResponse.json({ clients: [], scores: [] })
  }

  // Get latest score for each client
  const dealIds = clients.map(c => c.pipedrive_deal_id)

  const { data: scores } = await supabase
    .from('exec_score_history')
    .select('*')
    .eq('onmcp_user_id', userId)
    .in('client_pipedrive_deal_id', dealIds)
    .order('computed_at', { ascending: false })

  // Deduplicate — keep only latest per client
  const latestScores = new Map<string, Record<string, unknown>>()
  for (const score of (scores || []) as Array<Record<string, unknown>>) {
    const dealId = score.client_pipedrive_deal_id as string
    if (!latestScores.has(dealId)) {
      latestScores.set(dealId, score)
    }
  }

  // Merge clients with their latest scores
  const merged = clients.map(client => ({
    ...client,
    score: latestScores.get(client.pipedrive_deal_id) || null,
  }))

  // Sort by score — lowest (worst) first
  merged.sort((a, b) => (Number(a.score?.score_total) || 0) - (Number(b.score?.score_total) || 0))

  return NextResponse.json({
    clients: merged,
    count: merged.length,
    criticalCount: merged.filter(c => c.score?.band === 'CRITICAL').length,
    monitorCount: merged.filter(c => c.score?.band === 'MONITOR').length,
  })
}
