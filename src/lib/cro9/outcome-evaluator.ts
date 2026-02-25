import { ActionRecord, OutcomeData, PageData, ActionBucket } from './types'

/**
 * Evaluation window configuration (ported from CRO9).
 * Actions must be between 14 and 60 days old to be evaluated.
 */
const EVALUATION_WINDOW = {
  minDays: 14,
  maxDays: 60,
}

/**
 * Success thresholds per bucket type.
 *
 * CTR_FIX success: CTR improved by >10%
 * STRIKING_DISTANCE success: Position improved by >2 spots
 * RELEVANCE_REBUILD success: Impressions increased >20%
 * LOCAL_BOOST success: Position improved by >3 or impressions up >15%
 */
const SUCCESS_THRESHOLDS: Record<
  ActionBucket,
  (original: ActionRecord['originalMetrics'], current: PageData) => boolean
> = {
  CTR_FIX: (original, current) => {
    if (original.ctr === 0) return current.ctr > 0
    const ctrDelta = (current.ctr - original.ctr) / original.ctr
    return ctrDelta > 0.10 // CTR improved by more than 10%
  },

  STRIKING_DISTANCE: (original, current) => {
    const positionDelta = original.position - current.position
    return positionDelta > 2 // Position improved by more than 2 spots
  },

  RELEVANCE_REBUILD: (original, current) => {
    if (original.impressions === 0) return current.impressions > 50
    const impressionsDelta =
      (current.impressions - original.impressions) / original.impressions
    return impressionsDelta > 0.20 // Impressions increased by more than 20%
  },

  LOCAL_BOOST: (original, current) => {
    const positionDelta = original.position - current.position
    const impressionsDelta =
      original.impressions > 0
        ? (current.impressions - original.impressions) / original.impressions
        : 0
    return positionDelta > 3 || impressionsDelta > 0.15
  },
}

/**
 * Check if an action falls within the evaluation window.
 */
function isInEvaluationWindow(createdAt: string): boolean {
  const age = Date.now() - new Date(createdAt).getTime()
  const minAge = EVALUATION_WINDOW.minDays * 24 * 60 * 60 * 1000
  const maxAge = EVALUATION_WINDOW.maxDays * 24 * 60 * 60 * 1000
  return age >= minAge && age <= maxAge
}

/**
 * Evaluate a single action against current data.
 */
function evaluateAction(
  action: ActionRecord,
  currentData: PageData | undefined
): OutcomeData | null {
  // Skip if no current data for this URL
  if (!currentData) return null

  // Skip if outside evaluation window
  if (!isInEvaluationWindow(action.createdAt)) return null

  // Get the success check function for this bucket
  const successCheck = SUCCESS_THRESHOLDS[action.bucket]
  const success = successCheck(action.originalMetrics, currentData)

  return {
    pageUrl: action.pageUrl,
    bucket: action.bucket,
    success,
    metricDelta: {
      clicks: currentData.clicks - action.originalMetrics.clicks,
      impressions:
        currentData.impressions - action.originalMetrics.impressions,
      position: action.originalMetrics.position - currentData.position, // Positive = improved
      ctr: currentData.ctr - action.originalMetrics.ctr,
    },
    evaluatedAt: new Date().toISOString(),
  }
}

/**
 * Evaluate all past actions against current Search Console data.
 *
 * For each action in the 14-60 day evaluation window:
 * 1. Find the current data for that URL
 * 2. Compare metrics to the original snapshot
 * 3. Apply bucket-specific success criteria
 * 4. Return outcome data for the weight adjuster
 *
 * @param actions - Past SEO actions to evaluate
 * @param currentData - Current Search Console page data
 * @returns Array of outcome evaluations
 */
export function evaluateOutcomes(
  actions: ActionRecord[],
  currentData: PageData[]
): OutcomeData[] {
  // Build lookup map for current data by URL
  const dataMap = new Map<string, PageData>()
  for (const page of currentData) {
    dataMap.set(page.url, page)
  }

  const outcomes: OutcomeData[] = []

  for (const action of actions) {
    const current = dataMap.get(action.pageUrl)
    const outcome = evaluateAction(action, current)
    if (outcome) {
      outcomes.push(outcome)
    }
  }

  return outcomes
}

/**
 * Calculate summary statistics for a set of outcomes.
 */
export function summarizeOutcomes(outcomes: OutcomeData[]): {
  total: number
  successes: number
  failures: number
  successRate: number
  byBucket: Record<
    ActionBucket,
    { total: number; successes: number; rate: number }
  >
  avgDeltas: {
    clicks: number
    impressions: number
    position: number
    ctr: number
  }
} {
  const buckets: ActionBucket[] = [
    'CTR_FIX',
    'STRIKING_DISTANCE',
    'RELEVANCE_REBUILD',
    'LOCAL_BOOST',
  ]

  const byBucket = {} as Record<
    ActionBucket,
    { total: number; successes: number; rate: number }
  >

  for (const bucket of buckets) {
    const bucketOutcomes = outcomes.filter((o) => o.bucket === bucket)
    const successes = bucketOutcomes.filter((o) => o.success).length
    byBucket[bucket] = {
      total: bucketOutcomes.length,
      successes,
      rate:
        bucketOutcomes.length > 0 ? successes / bucketOutcomes.length : 0,
    }
  }

  const successes = outcomes.filter((o) => o.success).length

  // Average metric deltas
  const avgDeltas =
    outcomes.length > 0
      ? {
          clicks:
            outcomes.reduce((sum, o) => sum + o.metricDelta.clicks, 0) /
            outcomes.length,
          impressions:
            outcomes.reduce(
              (sum, o) => sum + o.metricDelta.impressions,
              0
            ) / outcomes.length,
          position:
            outcomes.reduce((sum, o) => sum + o.metricDelta.position, 0) /
            outcomes.length,
          ctr:
            outcomes.reduce((sum, o) => sum + o.metricDelta.ctr, 0) /
            outcomes.length,
        }
      : { clicks: 0, impressions: 0, position: 0, ctr: 0 }

  return {
    total: outcomes.length,
    successes,
    failures: outcomes.length - successes,
    successRate: outcomes.length > 0 ? successes / outcomes.length : 0,
    byBucket,
    avgDeltas,
  }
}
