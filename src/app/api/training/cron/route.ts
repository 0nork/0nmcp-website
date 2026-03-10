import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentTier } from '@/lib/training/generator'
import { prune, checkTierUpgrade, checkMilestones, sendMilestoneEmails, writeTrainingRun } from '@/lib/training/accumulator'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/training/cron — Vercel Cron handler (every 12 hours)
 *
 * ZERO API calls. Housekeeping only:
 * 1. Prune expired/low-score knowledge entries
 * 2. Check tier upgrade conditions
 * 3. Check milestone conditions
 * 4. Send milestone notification emails
 * 5. Log housekeeping run
 *
 * All actual training happens OFFLINE in Claude Code via /training skill.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  const admin = getAdmin()
  const milestonesTriggered: string[] = []

  try {
    // 1. Get current tier
    const currentTier = await getCurrentTier(admin)

    // 2. Prune expired + low-score entries
    const pruned = await prune()

    // 3. Check tier upgrade
    const tierUpgrade = await checkTierUpgrade()
    if (tierUpgrade) milestonesTriggered.push(tierUpgrade)

    // 4. Get current stats for milestone checks
    const { count: totalKnowledge } = await admin
      .from('council_knowledge')
      .select('*', { count: 'exact', head: true })

    const { data: scoreData } = await admin
      .from('council_knowledge')
      .select('composite_score')

    const avgScore = scoreData && scoreData.length > 0
      ? scoreData.reduce((sum, r) => sum + Number(r.composite_score), 0) / scoreData.length
      : 0

    // 5. Check milestones
    const newMilestones = await checkMilestones({
      totalKnowledge: totalKnowledge || 0,
      avgScore,
    })
    milestonesTriggered.push(...newMilestones)

    // 6. Send milestone notification emails
    const emailsSent = await sendMilestoneEmails()

    // 7. Log housekeeping run
    const durationMs = Date.now() - startTime
    await writeTrainingRun({
      batchSize: 0,
      avgCompositeScore: avgScore,
      entriesAdded: 0,
      entriesPruned: pruned,
      durationMs,
      runType: 'housekeeping',
      tierLevel: currentTier.tier,
      milestonesTriggered,
    })

    return NextResponse.json({
      ok: true,
      tier: { level: currentTier.tier, name: currentTier.name },
      pruned,
      totalKnowledge: totalKnowledge || 0,
      avgScore: Math.round(avgScore * 1000) / 1000,
      milestonesTriggered,
      emailsSent,
      durationMs,
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: (error as Error).message },
      { status: 500 }
    )
  }
}
