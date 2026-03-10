import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCurrentTier, getNextTierProgress, TIERS, DOMAIN_LABELS } from '@/lib/training/generator'
import { PERSONAS } from '@/lib/training/evaluator'
import type { LeaderboardData } from '@/lib/training/types'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/training/leaderboard — Public stats for the training dashboard
 */
export async function GET() {
  const admin = getAdmin()

  try {
    const [
      currentTier,
      nextTierProgress,
      { count: totalKnowledge },
      { data: scoreData },
      { data: recentRuns },
      { data: milestones },
      { data: domainData },
      { data: personaData },
    ] = await Promise.all([
      getCurrentTier(admin),
      getNextTierProgress(admin),
      admin.from('council_knowledge').select('*', { count: 'exact', head: true }),
      admin.from('council_knowledge').select('composite_score'),
      admin.from('training_runs').select('*').order('created_at', { ascending: false }).limit(10),
      admin.from('training_milestones').select('milestone_key, reached_at, metadata').order('reached_at', { ascending: true }),
      admin.from('council_knowledge').select('domain, composite_score'),
      admin.from('council_knowledge').select('persona_votes'),
    ])

    // Average score
    const avgScore = scoreData && scoreData.length > 0
      ? scoreData.reduce((sum, r) => sum + Number(r.composite_score), 0) / scoreData.length
      : 0

    // Domain coverage
    const domainMap = new Map<string, { count: number; scoreSum: number }>()
    if (domainData) {
      for (const row of domainData) {
        const existing = domainMap.get(row.domain) || { count: 0, scoreSum: 0 }
        existing.count++
        existing.scoreSum += Number(row.composite_score)
        domainMap.set(row.domain, existing)
      }
    }

    const domainCoverage = Array.from(domainMap.entries()).map(([domain, stats]) => ({
      domain,
      label: DOMAIN_LABELS[domain] || domain,
      count: stats.count,
      avgScore: Math.round((stats.scoreSum / stats.count) * 1000) / 1000,
    })).sort((a, b) => b.count - a.count)

    // Persona scores (aggregate from persona_votes across all knowledge entries)
    const personaScoreMap = new Map<string, { total: number; scoreSum: number }>()
    if (personaData) {
      for (const row of personaData) {
        const votes = row.persona_votes as Record<string, number>
        if (votes) {
          for (const [pid, score] of Object.entries(votes)) {
            const existing = personaScoreMap.get(pid) || { total: 0, scoreSum: 0 }
            existing.total++
            existing.scoreSum += Number(score)
            personaScoreMap.set(pid, existing)
          }
        }
      }
    }

    const personaScores = PERSONAS.map(p => {
      const stats = personaScoreMap.get(p.id)
      return {
        id: p.id,
        name: p.name,
        specialty: p.specialty,
        avatar: p.avatar,
        avgScore: stats ? Math.round((stats.scoreSum / stats.total) * 1000) / 1000 : 0,
        unlocksAtTier: p.unlocksAtTier,
        isActive: p.unlocksAtTier <= currentTier.tier,
      }
    })

    const data: LeaderboardData = {
      currentTier,
      totalKnowledge: totalKnowledge || 0,
      avgScore: Math.round(avgScore * 1000) / 1000,
      nextTierProgress,
      recentRuns: recentRuns || [],
      domainCoverage,
      milestones: milestones || [],
      personaScores,
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
