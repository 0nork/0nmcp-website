/**
 * Brain Training Factory — Generator
 *
 * Tier configuration + getCurrentTier() for reading from Supabase.
 * NO API calls — just config, types, and DB queries.
 * Actual training batch generation happens OFFLINE in Claude Code.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { TierConfig } from './types'

// ─── Tier System ──────────────────────────────────────────────

export const TIERS: TierConfig[] = [
  {
    tier: 0,
    name: 'Seed',
    batchSize: 4,
    personaCount: 3,
    domains: ['logic', 'systems', 'business'],
    scoreThreshold: 0.70,
    color: 'var(--text-muted)',
  },
  {
    tier: 1,
    name: 'Sprout',
    batchSize: 6,
    personaCount: 5,
    domains: ['logic', 'systems', 'business', 'ethics', 'workflow'],
    scoreThreshold: 0.72,
    color: '#6EE05A',
  },
  {
    tier: 2,
    name: 'Growth',
    batchSize: 8,
    personaCount: 7,
    domains: ['logic', 'systems', 'business', 'ethics', 'workflow', 'cross-domain'],
    scoreThreshold: 0.75,
    color: '#00d4ff',
  },
  {
    tier: 3,
    name: 'Canopy',
    batchSize: 12,
    personaCount: 7,
    domains: ['logic', 'systems', 'business', 'ethics', 'workflow', 'cross-domain', 'optimization'],
    scoreThreshold: 0.78,
    color: '#a78bfa',
  },
  {
    tier: 4,
    name: 'Neural',
    batchSize: 12,
    personaCount: 7,
    domains: ['logic', 'systems', 'business', 'ethics', 'workflow', 'cross-domain', 'optimization', 'self-improvement'],
    scoreThreshold: 0.82,
    color: '#ff6b35',
  },
]

// ─── Domain Labels ────────────────────────────────────────────

export const DOMAIN_LABELS: Record<string, string> = {
  logic: 'Logic & Reasoning',
  systems: 'Systems Design',
  business: 'Business Strategy',
  ethics: 'Ethics & Policy',
  workflow: 'Workflow Validation',
  'cross-domain': 'Cross-Domain Synthesis',
  optimization: 'Optimization',
  'self-improvement': 'Self-Improvement',
}

// ─── Tier Conditions ──────────────────────────────────────────

interface TierCondition {
  tier: number
  name: string
  requirements: string[]
  check: (stats: { count: number; avgScore: number; daysActive: number }) => boolean
}

export const TIER_CONDITIONS: TierCondition[] = [
  {
    tier: 1, name: 'Sprout',
    requirements: ['50+ knowledge entries'],
    check: ({ count }) => count >= 50,
  },
  {
    tier: 2, name: 'Growth',
    requirements: ['200+ entries', 'Average score > 0.80'],
    check: ({ count, avgScore }) => count >= 200 && avgScore > 0.80,
  },
  {
    tier: 3, name: 'Canopy',
    requirements: ['500+ entries', '30+ days active'],
    check: ({ count, daysActive }) => count >= 500 && daysActive >= 30,
  },
  {
    tier: 4, name: 'Neural',
    requirements: ['1000+ entries', 'Average score > 0.85'],
    check: ({ count, avgScore }) => count >= 1000 && avgScore > 0.85,
  },
]

// ─── Get Current Tier ─────────────────────────────────────────

export async function getCurrentTier(supabase: SupabaseClient): Promise<TierConfig> {
  // Get knowledge count + avg score
  const { count } = await supabase
    .from('council_knowledge')
    .select('*', { count: 'exact', head: true })

  const { data: scoreData } = await supabase
    .from('council_knowledge')
    .select('composite_score')

  const totalCount = count || 0
  const avgScore = scoreData && scoreData.length > 0
    ? scoreData.reduce((sum, r) => sum + Number(r.composite_score), 0) / scoreData.length
    : 0

  // Get days active (first training run)
  const { data: firstRun } = await supabase
    .from('training_runs')
    .select('created_at')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  const daysActive = firstRun
    ? Math.floor((Date.now() - new Date(firstRun.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const stats = { count: totalCount, avgScore, daysActive }

  // Check from highest tier down
  for (let i = TIER_CONDITIONS.length - 1; i >= 0; i--) {
    if (TIER_CONDITIONS[i].check(stats)) {
      return TIERS[TIER_CONDITIONS[i].tier]
    }
  }

  return TIERS[0] // Default: Seed
}

// ─── Get Next Tier Progress ───────────────────────────────────

export async function getNextTierProgress(supabase: SupabaseClient): Promise<{
  current: number
  needed: number
  label: string
}> {
  const currentTier = await getCurrentTier(supabase)
  if (currentTier.tier >= 4) {
    return { current: 100, needed: 100, label: 'Max tier reached' }
  }

  const nextCondition = TIER_CONDITIONS[currentTier.tier] // next tier's conditions

  const { count } = await supabase
    .from('council_knowledge')
    .select('*', { count: 'exact', head: true })

  const totalCount = count || 0

  // Use knowledge count as primary progress metric
  const thresholds = [50, 200, 500, 1000]
  const needed = thresholds[currentTier.tier] || 50

  return {
    current: Math.min(totalCount, needed),
    needed,
    label: `${totalCount}/${needed} entries for ${nextCondition.name}`,
  }
}

// ─── Get Training Stats ───────────────────────────────────────

export async function getTrainingStats(supabase: SupabaseClient) {
  const [
    { count: totalKnowledge },
    { data: scoreData },
    { data: firstRun },
    { data: domainData },
  ] = await Promise.all([
    supabase.from('council_knowledge').select('*', { count: 'exact', head: true }),
    supabase.from('council_knowledge').select('composite_score'),
    supabase.from('training_runs').select('created_at').order('created_at', { ascending: true }).limit(1).single(),
    supabase.from('council_knowledge').select('domain, composite_score'),
  ])

  const avgScore = scoreData && scoreData.length > 0
    ? scoreData.reduce((sum, r) => sum + Number(r.composite_score), 0) / scoreData.length
    : 0

  const daysActive = firstRun
    ? Math.floor((Date.now() - new Date(firstRun.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Domain mastery
  const domainMap = new Map<string, { total: number; scoreSum: number }>()
  if (domainData) {
    for (const row of domainData) {
      const existing = domainMap.get(row.domain) || { total: 0, scoreSum: 0 }
      existing.total++
      existing.scoreSum += Number(row.composite_score)
      domainMap.set(row.domain, existing)
    }
  }

  const domainsWithMastery: string[] = []
  for (const [domain, stats] of domainMap) {
    if (stats.total >= 50 && (stats.scoreSum / stats.total) > 0.85) {
      domainsWithMastery.push(domain)
    }
  }

  // User contributions
  const { count: contributionCount } = await supabase
    .from('training_contributions')
    .select('*', { count: 'exact', head: true })
    .eq('accepted', true)

  return {
    totalKnowledge: totalKnowledge || 0,
    avgScore,
    daysActive,
    domainsWithMastery,
    hasUserContributions: (contributionCount || 0) > 0,
  }
}
