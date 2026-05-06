/**
 * AEO outcome evaluator — the second loop of the SXO/AEO marriage.
 *
 * SXO loop (existing): Search Console → action → reasses position/CTR → reinforce
 *   `seo_weights`. Closes weekly.
 *
 * AEO loop (this file): blog post published → cro9_events accumulate → compare
 *   engagement vs site baseline → success/fail per dimension → reinforce or
 *   demote that dimension in `aeo_weights`. Closes daily.
 *
 * The dimension-reinforcement pattern is:
 *   - For each evaluated post we have its `factors` (10 dims, 0-1) and a binary
 *     success flag.
 *   - For each dimension D where factors[D] >= 0.7 (the post leaned hard on D):
 *       success → bump aeo_weights[D] by LR
 *       failure → drop  aeo_weights[D] by LR/2
 *   - Renormalize so all weights sum to 1.0, clamp to [MIN_W, MAX_W].
 *
 * This is the Phase 2 sprint promised in docs/AEO-Implementation.md. Phase 3
 * (citation_results from a real LLM probe) plugs into the same `aeo_outcomes`
 * row — `success` becomes a multi-input function then.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { AEOFactors, AEOWeights, AEOOutcome } from './types'
import { DEFAULT_AEO_WEIGHTS } from './types'

const LEARNING_RATE = 0.015
const MIN_WEIGHT = 0.03
const MAX_WEIGHT = 0.40

const EVALUATION_WINDOW = {
  minDays: 14,
  maxDays: 60,
}

const DIMENSION_LEAN_THRESHOLD = 0.7

const DIM_KEYS: (keyof AEOFactors)[] = [
  'bluf', 'definition', 'procedure', 'comparison', 'faq',
  'authorEEAT', 'freshness', 'schema', 'informationGain', 'specificity',
]

const DIM_TO_DB: Record<keyof AEOFactors, keyof AEOWeightsRow> = {
  bluf: 'bluf',
  definition: 'definition',
  procedure: 'procedure',
  comparison: 'comparison',
  faq: 'faq',
  authorEEAT: 'author_eeat',
  freshness: 'freshness',
  schema: 'schema_score',
  informationGain: 'information_gain',
  specificity: 'specificity',
}

interface AEOWeightsRow {
  id: string
  bluf: number
  definition: number
  procedure: number
  comparison: number
  faq: number
  author_eeat: number
  freshness: number
  schema_score: number
  information_gain: number
  specificity: number
  active: boolean
  generation: number
  parent_id: string | null
  reason: string | null
  created_at: string
}

function rowToWeights(row: AEOWeightsRow): AEOWeights {
  return {
    bluf: row.bluf,
    definition: row.definition,
    procedure: row.procedure,
    comparison: row.comparison,
    faq: row.faq,
    authorEEAT: row.author_eeat,
    freshness: row.freshness,
    schema: row.schema_score,
    informationGain: row.information_gain,
    specificity: row.specificity,
  }
}

function weightsToRow(w: AEOWeights): Omit<AEOWeightsRow, 'id' | 'created_at' | 'active' | 'generation' | 'parent_id' | 'reason'> {
  return {
    bluf: w.bluf,
    definition: w.definition,
    procedure: w.procedure,
    comparison: w.comparison,
    faq: w.faq,
    author_eeat: w.authorEEAT,
    freshness: w.freshness,
    schema_score: w.schema,
    information_gain: w.informationGain,
    specificity: w.specificity,
  }
}

function clamp(v: number) {
  return Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, v))
}

/** Renormalize so the 10 dims sum to exactly 1.0, preserving proportions. */
export function normalizeAEOWeights(w: AEOWeights): AEOWeights {
  const total = DIM_KEYS.reduce((s, k) => s + w[k], 0)
  if (total === 0) return { ...DEFAULT_AEO_WEIGHTS }
  const out = { ...w }
  for (const k of DIM_KEYS) {
    out[k] = Math.round((w[k] / total) * 10000) / 10000
  }
  return out
}

/**
 * Pull engagement deltas for a single post from cro9_events.
 * Returns avg scroll, avg time, bounce rate, conversion rate.
 *
 * Bounce = sessions where the only event for this URL was pageview (no scroll,
 * no time_on_page > 5s, no conversion). Conversion = `conversion` event_type.
 */
async function pullEngagement(
  supabase: SupabaseClient,
  pageUrl: string,
  publishedAt: string,
): Promise<AEOOutcome['metricDelta'] & { sessions: number }> {
  const { data: events } = await supabase
    .from('cro9_events')
    .select('event_type, session_id, scroll_pct, duration_ms')
    .eq('url', pageUrl)
    .gte('created_at', publishedAt)
    .limit(5000)

  if (!events || events.length === 0) {
    return { avgScrollPct: 0, avgTimeOnPage: 0, bounceRate: 1, conversionRate: 0, sessions: 0 }
  }

  const sessions = new Map<string, { scroll: number; time: number; converted: boolean; nonPageviews: number }>()
  for (const e of events) {
    const sid = e.session_id || 'unknown'
    const cur = sessions.get(sid) || { scroll: 0, time: 0, converted: false, nonPageviews: 0 }
    if (e.event_type === 'scroll' && typeof e.scroll_pct === 'number') {
      cur.scroll = Math.max(cur.scroll, e.scroll_pct)
      cur.nonPageviews++
    } else if (e.event_type === 'time_on_page' && typeof e.duration_ms === 'number') {
      cur.time = Math.max(cur.time, e.duration_ms)
      cur.nonPageviews++
    } else if (e.event_type === 'conversion') {
      cur.converted = true
      cur.nonPageviews++
    } else if (e.event_type !== 'pageview') {
      cur.nonPageviews++
    }
    sessions.set(sid, cur)
  }

  const sessionList = Array.from(sessions.values())
  const sessionCount = sessionList.length

  const avgScrollPct = sessionCount > 0
    ? sessionList.reduce((s, x) => s + x.scroll, 0) / sessionCount
    : 0
  const avgTimeOnPage = sessionCount > 0
    ? sessionList.reduce((s, x) => s + x.time, 0) / sessionCount
    : 0
  const bounces = sessionList.filter((x) => x.nonPageviews === 0).length
  const bounceRate = sessionCount > 0 ? bounces / sessionCount : 1
  const conversions = sessionList.filter((x) => x.converted).length
  const conversionRate = sessionCount > 0 ? conversions / sessionCount : 0

  return { avgScrollPct, avgTimeOnPage, bounceRate, conversionRate, sessions: sessionCount }
}

/**
 * Decide if a post's engagement is "successful" against site baselines.
 * Conservative threshold — we want signal, not noise:
 *   - avgScrollPct >= 50%        (visitor read past the fold)
 *   - avgTimeOnPage >= 30s       (long enough to actually read)
 *   - bounceRate < 0.7
 *   - sessions >= 5              (otherwise too noisy)
 * 3-of-4 → success.
 */
function judgeSuccess(d: AEOOutcome['metricDelta'] & { sessions: number }): boolean {
  if (d.sessions < 5) return false
  let score = 0
  if (d.avgScrollPct >= 50) score++
  if (d.avgTimeOnPage >= 30_000) score++
  if (d.bounceRate < 0.7) score++
  if (d.conversionRate > 0) score++
  return score >= 3
}

interface EvaluatePostInput {
  postId: string
  pageUrl: string
  publishedAt: string
  factors: AEOFactors
}

/**
 * Evaluate a single published post: pull events, judge success, write outcome.
 * Returns the row written to aeo_outcomes (or null if outside window / no data).
 */
export async function evaluatePost(
  supabase: SupabaseClient,
  weightsId: string | null,
  input: EvaluatePostInput,
): Promise<AEOOutcome | null> {
  const ageMs = Date.now() - new Date(input.publishedAt).getTime()
  const minAgeMs = EVALUATION_WINDOW.minDays * 86_400_000
  const maxAgeMs = EVALUATION_WINDOW.maxDays * 86_400_000
  if (ageMs < minAgeMs || ageMs > maxAgeMs) return null

  const engagement = await pullEngagement(supabase, input.pageUrl, input.publishedAt)
  if (engagement.sessions === 0) return null

  const success = judgeSuccess(engagement)

  const outcome: AEOOutcome = {
    pageUrl: input.pageUrl,
    metricDelta: {
      avgScrollPct: engagement.avgScrollPct,
      avgTimeOnPage: engagement.avgTimeOnPage,
      bounceRate: engagement.bounceRate,
      conversionRate: engagement.conversionRate,
    },
    success,
    evaluatedAt: new Date().toISOString(),
  }

  await supabase.from('aeo_outcomes').upsert(
    {
      post_id: input.postId,
      page_url: input.pageUrl,
      factors_before: input.factors,
      factors_after: input.factors,
      engagement_delta: outcome.metricDelta,
      citation_results: null,
      success,
      evaluated_at: outcome.evaluatedAt,
      weights_id: weightsId,
    },
    { onConflict: 'post_id' },
  )

  return outcome
}

/**
 * Adjust active aeo_weights based on a batch of outcomes + per-post factors.
 * For each outcome, find the dims the post leaned on (>= LEAN_THRESHOLD) and
 * reinforce/demote those weights. Writes a NEW weights row (active=true) and
 * marks the previous active row inactive — full audit trail via generation +
 * parent_id.
 *
 * Returns the new weights row id, or null if no outcomes qualified.
 */
export async function adjustAEOWeights(
  supabase: SupabaseClient,
  outcomes: { factors: AEOFactors; success: boolean }[],
): Promise<{ newWeightsId: string; weights: AEOWeights } | null> {
  if (outcomes.length === 0) return null

  const { data: activeRow } = await supabase
    .from('aeo_weights')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<AEOWeightsRow>()

  const current: AEOWeights = activeRow ? rowToWeights(activeRow) : { ...DEFAULT_AEO_WEIGHTS }
  const adjusted: AEOWeights = { ...current }

  let leanCount = 0
  for (const o of outcomes) {
    for (const k of DIM_KEYS) {
      if (o.factors[k] >= DIMENSION_LEAN_THRESHOLD) {
        leanCount++
        const delta = o.success ? LEARNING_RATE : -LEARNING_RATE / 2
        adjusted[k] = clamp(adjusted[k] + delta)
      }
    }
  }

  if (leanCount === 0) return null

  const normalized = normalizeAEOWeights(adjusted)
  const successes = outcomes.filter((o) => o.success).length

  const { data: inserted, error } = await supabase
    .from('aeo_weights')
    .insert({
      ...weightsToRow(normalized),
      active: true,
      generation: (activeRow?.generation || 0) + 1,
      parent_id: activeRow?.id || null,
      reason: `auto-evaluator: ${outcomes.length} outcomes, ${successes} successes, ${leanCount} dim leans`,
    })
    .select('id')
    .single()

  if (error) {
    console.error('[aeo-evaluator.adjust] insert failed:', error.message)
    return null
  }

  if (activeRow?.id) {
    await supabase.from('aeo_weights').update({ active: false }).eq('id', activeRow.id)
  }

  return { newWeightsId: inserted.id, weights: normalized }
}

/**
 * Top-level evaluation pass: pull eligible published posts, evaluate each,
 * collect outcomes, adjust weights. Designed to be called from a daily cron.
 */
export async function runAEOEvaluation(supabase: SupabaseClient): Promise<{
  evaluated: number
  successes: number
  weightsAdjusted: boolean
  newWeightsId: string | null
}> {
  const minAge = new Date(Date.now() - EVALUATION_WINDOW.maxDays * 86_400_000).toISOString()
  const maxAge = new Date(Date.now() - EVALUATION_WINDOW.minDays * 86_400_000).toISOString()

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('id, slug, published_at')
    .eq('status', 'published')
    .gte('published_at', minAge)
    .lte('published_at', maxAge)
    .limit(200)

  if (!posts || posts.length === 0) {
    return { evaluated: 0, successes: 0, weightsAdjusted: false, newWeightsId: null }
  }

  const { data: scoresRows } = await supabase
    .from('blog_aeo_scores')
    .select('post_id, factors, weights_id')
    .in('post_id', posts.map((p) => p.id))

  const scoresMap = new Map<string, { factors: AEOFactors; weightsId: string | null }>()
  for (const r of scoresRows || []) {
    scoresMap.set(r.post_id, { factors: r.factors as AEOFactors, weightsId: r.weights_id })
  }

  const outcomeInputs: { factors: AEOFactors; success: boolean }[] = []
  let evaluated = 0
  let successes = 0

  for (const p of posts) {
    const score = scoresMap.get(p.id)
    if (!score || !p.published_at) continue
    const pageUrl = `https://www.0nmcp.com/blog/${p.slug}`
    const outcome = await evaluatePost(supabase, score.weightsId, {
      postId: p.id,
      pageUrl,
      publishedAt: p.published_at,
      factors: score.factors,
    })
    if (!outcome) continue
    evaluated++
    if (outcome.success) successes++
    outcomeInputs.push({ factors: score.factors, success: outcome.success })
  }

  const adjustment = await adjustAEOWeights(supabase, outcomeInputs)

  return {
    evaluated,
    successes,
    weightsAdjusted: adjustment !== null,
    newWeightsId: adjustment?.newWeightsId || null,
  }
}
