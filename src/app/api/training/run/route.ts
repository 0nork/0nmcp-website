import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getCurrentTier } from '@/lib/training/generator'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * POST /api/training/run — Admin manual trigger
 *
 * This doesn't run training (that happens offline in Claude Code).
 * It triggers a housekeeping run: prune + milestone checks + tier upgrades.
 * Admin only (mike@rocketopp.com).
 */
export async function POST(request: NextRequest) {
  // Auth: admin check
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Allow cron secret OR admin user
  let isAuthorized = false

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    isAuthorized = true
  } else {
    const supabase = await createSupabaseServer()
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email === 'mike@rocketopp.com') {
        isAuthorized = true
      }
    }
  }

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const admin = getAdmin()

  try {
    const currentTier = await getCurrentTier(admin)

    // Import accumulator functions dynamically to avoid circular deps
    const { prune, checkTierUpgrade, checkMilestones, sendMilestoneEmails, writeTrainingRun } =
      await import('@/lib/training/accumulator')

    const startTime = Date.now()
    const milestonesTriggered: string[] = []

    // Run full housekeeping
    const pruned = await prune()
    const tierUpgrade = await checkTierUpgrade()
    if (tierUpgrade) milestonesTriggered.push(tierUpgrade)

    const { count: totalKnowledge } = await admin
      .from('council_knowledge')
      .select('*', { count: 'exact', head: true })

    const { data: scoreData } = await admin
      .from('council_knowledge')
      .select('composite_score')

    const avgScore = scoreData && scoreData.length > 0
      ? scoreData.reduce((sum, r) => sum + Number(r.composite_score), 0) / scoreData.length
      : 0

    const newMilestones = await checkMilestones({
      totalKnowledge: totalKnowledge || 0,
      avgScore,
    })
    milestonesTriggered.push(...newMilestones)

    const emailsSent = await sendMilestoneEmails()
    const durationMs = Date.now() - startTime

    await writeTrainingRun({
      batchSize: 0,
      avgCompositeScore: avgScore,
      entriesAdded: 0,
      entriesPruned: pruned,
      durationMs,
      runType: 'manual',
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
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 })
  }
}
