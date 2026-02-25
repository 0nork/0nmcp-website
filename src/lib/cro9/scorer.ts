import {
  PageData,
  ScoredPage,
  WeightConfig,
  CTR_EXPECTATIONS,
  DEFAULT_WEIGHTS,
} from './types'
import { assignBucket } from './bucketer'

/**
 * Get expected CTR for a given position.
 * Uses the CTR_EXPECTATIONS table for positions 1-10,
 * then a decay curve for positions 11-50.
 */
function getExpectedCTR(position: number): number {
  const pos = Math.round(Math.min(50, Math.max(1, position)))
  if (CTR_EXPECTATIONS[pos]) return CTR_EXPECTATIONS[pos]
  // Decay curve for positions beyond 10
  return Math.max(0.005, 0.02 * Math.pow(0.85, pos - 10))
}

/**
 * Clamp a value between min and max.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Calculate freshness score based on last updated date.
 * Content updated within 30 days = 1.0
 * Content 30-90 days old = linear decay
 * Content older than 90 days = 0.1 minimum
 */
function calculateFreshnessScore(lastUpdated?: string): number {
  if (!lastUpdated) return 0.5 // Default mid-range when unknown

  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceUpdate <= 30) return 1.0
  if (daysSinceUpdate >= 90) return 0.1
  // Linear decay between 30 and 90 days
  return 1.0 - ((daysSinceUpdate - 30) / 60) * 0.9
}

/**
 * Score a single page using the 5-factor opportunity scoring model.
 *
 * Factor 1: Impressions (log scale, normalized to 1M = 1.0)
 * Factor 2: Position (inverse, closer to 1 = higher score)
 * Factor 3: CTR Gap (actual CTR vs expected for position)
 * Factor 4: Conversions (bonus for converting pages)
 * Factor 5: Freshness (penalty for stale content)
 *
 * Final score = weighted sum of all 5 factors.
 */
export function scorePage(
  page: PageData,
  weights: WeightConfig = DEFAULT_WEIGHTS
): ScoredPage {
  // Factor 1: Impressions (log scale, 1M impressions = 1.0)
  const impressionsFactor = clamp(
    Math.log10(page.impressions + 1) / 6,
    0,
    1
  )

  // Factor 2: Position score (position 1 = 1.0, position 50 = 0.0)
  const positionFactor = clamp((50 - page.position) / 50, 0, 1)

  // Factor 3: CTR gap score (how far below expected CTR)
  const expectedCtr = getExpectedCTR(page.position)
  const ctrGapFactor =
    expectedCtr > 0
      ? clamp((expectedCtr - page.ctr) / expectedCtr, 0, 1)
      : 0

  // Factor 4: Conversion score (bonus for pages that convert)
  const conversionsFactor =
    page.conversions !== undefined && page.conversions > 0
      ? clamp(Math.log10(page.conversions + 1) / 3, 0, 1)
      : 0.3 // Default mid-range when no conversion data

  // Factor 5: Freshness score
  const freshnessFactor = calculateFreshnessScore(page.lastUpdated)

  // Calculate weighted opportunity score
  const score =
    weights.impressions * impressionsFactor +
    weights.position * positionFactor +
    weights.ctrGap * ctrGapFactor +
    weights.conversions * conversionsFactor +
    weights.freshness * freshnessFactor

  const roundedScore = Math.round(score * 10000) / 10000

  const factors = {
    impressions: Math.round(impressionsFactor * 10000) / 10000,
    position: Math.round(positionFactor * 10000) / 10000,
    ctrGap: Math.round(ctrGapFactor * 10000) / 10000,
    conversions: Math.round(conversionsFactor * 10000) / 10000,
    freshness: Math.round(freshnessFactor * 10000) / 10000,
  }

  // Build scored page, then assign bucket
  const scored: ScoredPage = {
    ...page,
    score: roundedScore,
    bucket: 'STRIKING_DISTANCE', // Temporary, will be overwritten
    factors,
  }

  scored.bucket = assignBucket(scored)

  return scored
}

/**
 * Score all pages and return sorted by opportunity score (highest first).
 */
export function scorePages(
  pages: PageData[],
  weights: WeightConfig = DEFAULT_WEIGHTS
): ScoredPage[] {
  return pages
    .map((page) => scorePage(page, weights))
    .sort((a, b) => b.score - a.score)
}
