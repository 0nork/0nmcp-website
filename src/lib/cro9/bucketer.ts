import { ActionBucket, ScoredPage, CTR_EXPECTATIONS } from './types'

/**
 * Get expected CTR for a given position (shared logic with scorer).
 */
function getExpectedCTR(position: number): number {
  const pos = Math.round(Math.min(50, Math.max(1, position)))
  if (CTR_EXPECTATIONS[pos]) return CTR_EXPECTATIONS[pos]
  return Math.max(0.005, 0.02 * Math.pow(0.85, pos - 10))
}

/**
 * Detect local intent from URL and query signals.
 * Looks for geographic terms, "near me", city names, etc.
 */
function hasLocalIntent(page: ScoredPage): boolean {
  const combined = `${page.url} ${page.query}`.toLowerCase()
  const localSignals = [
    'near me',
    'nearby',
    'local',
    'pittsburgh',
    'city',
    'neighborhood',
    'area',
    'in my',
    'closest',
    'directions',
    'hours',
    'open now',
  ]
  return localSignals.some((signal) => combined.includes(signal))
}

/**
 * Assign a single page to an action bucket based on its metrics.
 *
 * Bucket rules (ported from CRO9 Google Apps Script):
 *
 * - CTR_FIX: Position 1-3 with CTR below 70% of expected.
 *   These pages rank well but don't get clicks. Needs title/meta optimization.
 *
 * - STRIKING_DISTANCE: Position 4-15 with decent impressions (100+).
 *   Close enough to push into top 3 with content improvements.
 *
 * - RELEVANCE_REBUILD: Position 11-50 with high impressions (300+).
 *   Google shows the page but it doesn't match intent. Needs major content overhaul.
 *
 * - LOCAL_BOOST: Pages with local intent signals and position > 5.
 *   Needs local SEO optimization (GMB, local schema, geo terms).
 */
export function assignBucket(page: ScoredPage): ActionBucket {
  const expectedCtr = getExpectedCTR(page.position)

  // Check local intent first — local pages with poor position get LOCAL_BOOST
  if (hasLocalIntent(page) && page.position > 5) {
    return 'LOCAL_BOOST'
  }

  // High impressions but CTR way below expected = title/meta problem
  if (page.impressions >= 200 && page.ctr < expectedCtr * 0.7) {
    return 'CTR_FIX'
  }

  // Position 4-15 with meaningful traffic = striking distance
  if (page.position >= 4 && page.position <= 15 && page.impressions >= 100) {
    return 'STRIKING_DISTANCE'
  }

  // Position > 15 but still getting impressions = relevance mismatch
  if (page.position > 15 && page.impressions >= 300) {
    return 'RELEVANCE_REBUILD'
  }

  // Default: if position is within striking distance, classify there
  if (page.position >= 4 && page.position <= 20) {
    return 'STRIKING_DISTANCE'
  }

  // Everything else is a relevance rebuild candidate
  return 'RELEVANCE_REBUILD'
}

/**
 * Bucket all scored pages into a Map grouped by ActionBucket.
 * Returns pages sorted by score within each bucket.
 */
export function bucketPages(
  pages: ScoredPage[]
): Map<ActionBucket, ScoredPage[]> {
  const buckets = new Map<ActionBucket, ScoredPage[]>([
    ['CTR_FIX', []],
    ['STRIKING_DISTANCE', []],
    ['RELEVANCE_REBUILD', []],
    ['LOCAL_BOOST', []],
  ])

  for (const page of pages) {
    const bucket = page.bucket
    const list = buckets.get(bucket)
    if (list) {
      list.push(page)
    }
  }

  // Sort each bucket by score descending
  for (const [, pages] of buckets) {
    pages.sort((a, b) => b.score - a.score)
  }

  return buckets
}

/**
 * Get a human-readable description for each bucket.
 */
export function getBucketDescription(bucket: ActionBucket): string {
  switch (bucket) {
    case 'CTR_FIX':
      return 'Ranks well but low CTR. Rewrite title tags, meta descriptions, and intro paragraphs.'
    case 'STRIKING_DISTANCE':
      return 'Position 4-15, close to top 3. Expand content depth, add authority signals.'
    case 'RELEVANCE_REBUILD':
      return 'Good impressions but poor ranking. Major content overhaul needed for intent match.'
    case 'LOCAL_BOOST':
      return 'Local intent detected. Add local schema, geo terms, and location-specific content.'
  }
}

/**
 * Get the color associated with each bucket for UI display.
 */
export function getBucketColor(bucket: ActionBucket): string {
  switch (bucket) {
    case 'CTR_FIX':
      return '#ff3d3d'
    case 'STRIKING_DISTANCE':
      return '#ff6b35'
    case 'RELEVANCE_REBUILD':
      return '#ff69b4'
    case 'LOCAL_BOOST':
      return '#00ff88'
  }
}
