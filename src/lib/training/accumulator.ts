/**
 * Brain Training Factory — Accumulator
 *
 * Writes knowledge to DB, checks tier upgrades, triggers milestone notifications.
 * Used by both the /training skill (offline) and the Vercel cron (housekeeping).
 */

import { createClient } from '@supabase/supabase-js'
import type { EvaluationResult, TrainingRunStats, MilestoneCheckContext } from './types'
import { TIERS, getCurrentTier, getTrainingStats } from './generator'

// ─── Admin Supabase Client ───────────────────────────────────

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ─── Write Knowledge Entries ──────────────────────────────────

export async function writeKnowledge(
  results: EvaluationResult[],
  tierLevel: number
): Promise<{ added: number; rejected: number }> {
  const admin = getAdmin()
  const tier = TIERS[tierLevel] || TIERS[0]
  let added = 0
  let rejected = 0

  for (const result of results) {
    if (result.accepted && result.compositeScore >= tier.scoreThreshold) {
      const { error } = await admin.from('council_knowledge').insert({
        domain: result.domain,
        question: result.question,
        synthesis: result.synthesis,
        composite_score: result.compositeScore,
        persona_votes: Object.fromEntries(
          result.personaResponses.map(pr => [pr.personaId, pr.score])
        ),
        source: 'self_training',
        tier_generated: tierLevel,
      })

      if (!error) added++
      else rejected++
    } else {
      rejected++
    }
  }

  return { added, rejected }
}

// ─── Write Training Run Log ──────────────────────────────────

export async function writeTrainingRun(stats: TrainingRunStats): Promise<void> {
  const admin = getAdmin()
  await admin.from('training_runs').insert({
    batch_size: stats.batchSize,
    avg_composite_score: stats.avgCompositeScore,
    entries_added: stats.entriesAdded,
    entries_pruned: stats.entriesPruned,
    duration_ms: stats.durationMs,
    run_type: stats.runType,
    tier_level: stats.tierLevel,
    milestones_triggered: stats.milestonesTriggered,
  })
}

// ─── Prune Expired/Low-Score Entries ──────────────────────────

export async function prune(): Promise<number> {
  const admin = getAdmin()

  // Delete expired entries
  const { count: expiredCount } = await admin
    .from('council_knowledge')
    .delete({ count: 'exact' })
    .lt('expires_at', new Date().toISOString())

  // Delete very low-scoring entries (noise)
  const { count: lowScoreCount } = await admin
    .from('council_knowledge')
    .delete({ count: 'exact' })
    .lt('composite_score', 0.60)

  return (expiredCount || 0) + (lowScoreCount || 0)
}

// ─── Check Tier Upgrade ──────────────────────────────────────

export async function checkTierUpgrade(): Promise<string | null> {
  const admin = getAdmin()
  const currentTier = await getCurrentTier(admin)

  // Already max tier
  if (currentTier.tier >= 4) return null

  // Check if next tier conditions are met
  const { count } = await admin
    .from('council_knowledge')
    .select('*', { count: 'exact', head: true })

  const { data: scoreData } = await admin
    .from('council_knowledge')
    .select('composite_score')

  const totalCount = count || 0
  const avgScore = scoreData && scoreData.length > 0
    ? scoreData.reduce((sum, r) => sum + Number(r.composite_score), 0) / scoreData.length
    : 0

  const { data: firstRun } = await admin
    .from('training_runs')
    .select('created_at')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  const daysActive = firstRun
    ? Math.floor((Date.now() - new Date(firstRun.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Check next tier
  const nextTier = currentTier.tier + 1
  const conditions: Record<number, boolean> = {
    1: totalCount >= 50,
    2: totalCount >= 200 && avgScore > 0.80,
    3: totalCount >= 500 && daysActive >= 30,
    4: totalCount >= 1000 && avgScore > 0.85,
  }

  if (conditions[nextTier]) {
    const milestoneKey = `tier_${nextTier}_reached`
    await recordMilestone(milestoneKey, {
      previousTier: currentTier.tier,
      newTier: nextTier,
      totalKnowledge: totalCount,
      avgScore,
      daysActive,
    })
    return milestoneKey
  }

  return null
}

// ─── Check All Milestones ────────────────────────────────────

export async function checkMilestones(stats: {
  totalKnowledge: number
  avgScore: number
  lastRunScore?: number
  entriesAdded?: number
}): Promise<string[]> {
  const admin = getAdmin()
  const triggered: string[] = []

  // Get existing milestones
  const { data: existing } = await admin
    .from('training_milestones')
    .select('milestone_key')

  const achieved = new Set((existing || []).map(m => m.milestone_key))

  // Knowledge count milestones
  const knowledgeMilestones = [
    { key: 'knowledge_50', threshold: 50 },
    { key: 'knowledge_100', threshold: 100 },
    { key: 'knowledge_500', threshold: 500 },
    { key: 'knowledge_1000', threshold: 1000 },
  ]

  for (const m of knowledgeMilestones) {
    if (!achieved.has(m.key) && stats.totalKnowledge >= m.threshold) {
      await recordMilestone(m.key, { count: stats.totalKnowledge })
      triggered.push(m.key)
    }
  }

  // First training run
  if (!achieved.has('first_training_run')) {
    const { count } = await admin
      .from('training_runs')
      .select('*', { count: 'exact', head: true })
      .neq('run_type', 'housekeeping')

    if ((count || 0) > 0) {
      await recordMilestone('first_training_run', { totalRuns: count })
      triggered.push('first_training_run')
    }
  }

  // High score run
  if (!achieved.has('high_score_run') && stats.lastRunScore && stats.lastRunScore > 0.90) {
    await recordMilestone('high_score_run', { score: stats.lastRunScore })
    triggered.push('high_score_run')
  }

  // First user contribution
  if (!achieved.has('first_user_contribution')) {
    const { count } = await admin
      .from('training_contributions')
      .select('*', { count: 'exact', head: true })
      .eq('accepted', true)

    if ((count || 0) > 0) {
      await recordMilestone('first_user_contribution', {})
      triggered.push('first_user_contribution')
    }
  }

  // Domain mastery
  const { data: domainData } = await admin
    .from('council_knowledge')
    .select('domain, composite_score')

  if (domainData) {
    const domainMap = new Map<string, { count: number; scoreSum: number }>()
    for (const row of domainData) {
      const existing = domainMap.get(row.domain) || { count: 0, scoreSum: 0 }
      existing.count++
      existing.scoreSum += Number(row.composite_score)
      domainMap.set(row.domain, existing)
    }

    for (const [domain, dStats] of domainMap) {
      const key = `domain_mastery_${domain}`
      if (!achieved.has(key) && dStats.count >= 50 && (dStats.scoreSum / dStats.count) > 0.85) {
        await recordMilestone(key, { domain, count: dStats.count, avgScore: dStats.scoreSum / dStats.count })
        triggered.push(key)
      }
    }
  }

  return triggered
}

// ─── Record Milestone ────────────────────────────────────────

async function recordMilestone(key: string, metadata: Record<string, unknown>): Promise<void> {
  const admin = getAdmin()

  const { error } = await admin.from('training_milestones').insert({
    milestone_key: key,
    metadata,
    notified: false,
  })

  // Ignore unique constraint violations (already recorded)
  if (error && !error.message.includes('unique') && !error.message.includes('duplicate')) {
    console.error('Failed to record milestone:', key, error)
  }
}

// ─── Milestone Labels ────────────────────────────────────────

export const MILESTONE_LABELS: Record<string, { label: string; description: string }> = {
  first_training_run: { label: 'First Training Run', description: 'The brain completed its first self-training session' },
  knowledge_50: { label: '50 Knowledge Entries', description: 'Brain accumulated 50 high-confidence knowledge entries' },
  knowledge_100: { label: '100 Knowledge Entries', description: 'Brain accumulated 100 knowledge entries' },
  knowledge_500: { label: '500 Knowledge Entries', description: 'Brain reached 500 knowledge entries' },
  knowledge_1000: { label: '1,000 Knowledge Entries', description: 'Brain reached 1,000 knowledge entries — massive knowledge base' },
  tier_1_reached: { label: 'Tier 1: Sprout', description: 'Brain upgraded to Sprout tier — unlocked Ethicist + Engineer personas' },
  tier_2_reached: { label: 'Tier 2: Growth', description: 'Brain upgraded to Growth tier — unlocked Synthesizer + Contrarian personas' },
  tier_3_reached: { label: 'Tier 3: Canopy', description: 'Brain upgraded to Canopy tier — user contributions enabled' },
  tier_4_reached: { label: 'Tier 4: Neural', description: 'Brain reached Neural tier — maximum capability unlocked' },
  first_user_contribution: { label: 'First User Contribution', description: 'A user contributed training data to the brain' },
  high_score_run: { label: 'High Score Run', description: 'Training run achieved >0.90 average composite score' },
}

// ─── Send Milestone Email ────────────────────────────────────

export async function sendMilestoneEmails(): Promise<number> {
  const admin = getAdmin()

  // Get un-notified milestones
  const { data: pending } = await admin
    .from('training_milestones')
    .select('*')
    .eq('notified', false)

  if (!pending || pending.length === 0) return 0

  const sendgridKey = process.env.SENDGRID_API_KEY
  const notifyEmail = process.env.NOTIFY_EMAIL || 'mike@rocketopp.com'

  let sent = 0

  for (const milestone of pending) {
    const info = MILESTONE_LABELS[milestone.milestone_key] ||
      (milestone.milestone_key.startsWith('domain_mastery_')
        ? { label: `Domain Mastery: ${milestone.milestone_key.replace('domain_mastery_', '')}`, description: 'A knowledge domain reached mastery level' }
        : { label: milestone.milestone_key, description: 'New milestone achieved' })

    const body = `0n Brain Milestone Achieved!

${info.label}
${info.description}

${milestone.metadata ? JSON.stringify(milestone.metadata, null, 2) : ''}

Reached at: ${new Date(milestone.reached_at).toLocaleString()}

View the training dashboard at https://www.0nmcp.com/console`

    if (sendgridKey) {
      try {
        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sendgridKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: notifyEmail }] }],
            from: { email: 'noreply@0nmcp.com', name: '0n Brain' },
            subject: `0n Brain: ${info.label}`,
            content: [{ type: 'text/plain', value: body }],
          }),
        })
        sent++
      } catch {
        // Email send failed — continue with others
      }
    }

    // Mark as notified regardless (avoid spam retries)
    await admin
      .from('training_milestones')
      .update({ notified: true })
      .eq('id', milestone.id)
  }

  return sent
}
