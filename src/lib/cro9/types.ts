/**
 * CRO9 + SXO/AEO core types.
 *
 * Two scoring axes, one self-learning engine:
 *
 *   SXO axis  — page-level Search-Console-driven scoring (impressions,
 *               position, CTR gap, conversions, freshness). Adapts weights
 *               weekly from `seo_weights` based on click/position deltas.
 *
 *   AEO axis  — content-level "is this cite-able by an AI engine?" scoring
 *               (BLUF, definition block, comparison table, numbered procedure,
 *               FAQ block, E-E-A-T author + freshness, schema completeness,
 *               information gain). Adapts weights from `aeo_weights` based on
 *               cro9_events outcomes (engagement, conversions, AI-bot
 *               citations once detection ships).
 *
 * Both axes feed the same content brief and blog generator. A page can score
 * 92/100 SXO but 41/100 AEO — that's a "ranks but doesn't get cited" page,
 * and the brief generator emphasizes the missing AEO dimensions on the
 * rewrite. Same in reverse: a 90 AEO / 32 SXO page is "AI-quotable but
 * never surfaces" — brief emphasizes SXO fixes.
 *
 * The marriage is the brief: every brief carries weighted requirements
 * from both axes. The blog generator obeys both. Outcomes from both axes
 * feed back into both weight tables. Self-learning across both.
 */

export interface PageData {
  url: string
  query: string
  impressions: number
  clicks: number
  ctr: number
  position: number
  conversions?: number
  lastUpdated?: string
}

export type ActionBucket = 'CTR_FIX' | 'STRIKING_DISTANCE' | 'RELEVANCE_REBUILD' | 'LOCAL_BOOST'

export interface ScoredPage extends PageData {
  score: number
  bucket: ActionBucket
  factors: {
    impressions: number
    position: number
    ctrGap: number
    conversions: number
    freshness: number
  }
  /** AEO score 0-100. Populated when AEO scoring is run alongside SXO. */
  aeoScore?: number
  aeoFactors?: AEOFactors
}

export interface WeightConfig {
  impressions: number
  position: number
  ctrGap: number
  conversions: number
  freshness: number
}

// ─────────────────────────────────────────────────────────────────────────
//  AEO — Answer Engine Optimization
// ─────────────────────────────────────────────────────────────────────────

/**
 * The 8 AEO dimensions. Score 0-1 per dimension. Final AEO score is
 * weighted sum × 100. Weights live in `aeo_weights` and adapt via the
 * outcome evaluator.
 *
 * Why these 8: every dimension corresponds to a structural pattern AI
 * search engines preferentially extract from. The signal-strength
 * ordering reflects observed citation behavior in ChatGPT, Claude,
 * Perplexity, and Google AI Overview citations through Q1 2026.
 */
export interface AEOFactors {
  /** First paragraph is a 2-3 sentence direct answer (BLUF). 0 = none, 1 = present. */
  bluf: number
  /** Within first 200 words: a definition block (`**X is Y that does Z.**`). */
  definition: number
  /** A numbered list with imperative-verb-first steps (HowTo signal). */
  procedure: number
  /** A markdown comparison table with ≥3 rows × 3 cols (extracted into "X vs Y" answers). */
  comparison: number
  /** FAQ block with 5-7 voice-search-natural Q/A pairs. */
  faq: number
  /** E-E-A-T: author byline + credentials + Person schema. */
  authorEEAT: number
  /** Freshness: explicit "Updated <date>" markers + recent updated_at. */
  freshness: number
  /** Schema completeness: FAQPage / HowTo / Article JSON-LD present and valid. */
  schema: number
  /** Information Gain: post says something the top-10 SERP results don't. */
  informationGain: number
  /** Specificity: density of numbers, dates, named entities per 100 words. */
  specificity: number
}

export interface AEOWeights {
  bluf: number
  definition: number
  procedure: number
  comparison: number
  faq: number
  authorEEAT: number
  freshness: number
  schema: number
  informationGain: number
  specificity: number
}

export const DEFAULT_AEO_WEIGHTS: AEOWeights = {
  bluf: 0.18,           // Highest — first cite-able sentence
  definition: 0.14,     // "What is X" extraction target
  procedure: 0.12,      // HowTo cite signal
  comparison: 0.10,     // X vs Y answer extraction
  faq: 0.10,            // Q/A direct match
  authorEEAT: 0.08,     // Trust signal
  freshness: 0.08,      // Recency penalty for stale
  schema: 0.08,         // Machine-readable confirmation
  informationGain: 0.06, // Anti-cargo-cult signal
  specificity: 0.06,    // Numbers / entities / dates
}

export interface AEOOutcome {
  pageUrl: string
  // Engagement deltas from cro9_events
  metricDelta: {
    avgScrollPct: number      // Higher = visitor read deeper
    avgTimeOnPage: number     // Higher = post answered the query
    bounceRate: number        // Lower = better
    conversionRate: number    // Higher = better
  }
  // AI citation tracking (Phase 3 — citation simulator)
  citations?: {
    chatgpt: boolean
    claude: boolean
    perplexity: boolean
    googleAIO: boolean
  }
  success: boolean
  evaluatedAt: string
}

export interface ContentBrief {
  url: string
  query: string
  bucket: ActionBucket
  wordCount: { min: number; max: number }
  structure: {
    paragraphWords: { min: number; max: number }
    h2Frequency: { min: number; max: number }
  }
  keywords: {
    density: { min: number; max: number }
    placements: string[]
  }
  requiredSections: string[]
  /** AEO requirements that MUST be present in the generated post. The blog
   *  generator's prompt is built from these flags directly. */
  aeoRequirements?: {
    needsBLUF: boolean
    needsDefinition: boolean
    needsProcedure: boolean
    needsComparison: boolean
    needsFAQ: boolean
    needsAuthorEEAT: boolean
    needsFreshness: boolean
  }
  priority: number
}

export interface SEORun {
  id: string
  runAt: string
  pagesAnalyzed: number
  actionsGenerated: number
  weights: WeightConfig
  status: 'running' | 'completed' | 'failed'
}

export interface BlogPost {
  id?: string
  title: string
  slug: string
  content: string
  body?: string // Rendered markdown — what blog/[slug] actually displays
  excerpt?: string
  image?: string // Hero image path or OG-generator URL
  metaDescription: string
  targetQuery: string
  bucket: ActionBucket
  wordCount: number
  status: 'draft' | 'published' | 'scheduled'
  publishedAt?: string
  createdAt?: string
  /** Set after AEO scoring runs on the generated post. */
  aeoScore?: number
  aeoFactors?: AEOFactors
}

// CTR expectation curves (position -> expected CTR)
export const CTR_EXPECTATIONS: Record<number, number> = {
  1: 0.32, 2: 0.24, 3: 0.18, 4: 0.13, 5: 0.10,
  6: 0.07, 7: 0.05, 8: 0.04, 9: 0.03, 10: 0.02,
}

export const DEFAULT_WEIGHTS: WeightConfig = {
  impressions: 0.25,
  position: 0.25,
  ctrGap: 0.25,
  conversions: 0.15,
  freshness: 0.10,
}

export interface OutcomeData {
  pageUrl: string
  bucket: ActionBucket
  success: boolean
  metricDelta: {
    clicks: number
    impressions: number
    position: number
    ctr: number
  }
  evaluatedAt: string
}

export interface ActionRecord {
  id: string
  pageUrl: string
  bucket: ActionBucket
  originalMetrics: {
    clicks: number
    impressions: number
    position: number
    ctr: number
  }
  createdAt: string
  status: 'pending' | 'completed' | 'evaluated'
}
