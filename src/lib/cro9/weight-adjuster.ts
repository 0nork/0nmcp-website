import { WeightConfig, OutcomeData, DEFAULT_WEIGHTS, ActionBucket } from './types'

/**
 * Learning rate: how much to adjust weights per outcome.
 * Ported from CRO9 Google Apps Script CONFIG.LEARNING_RATE = 0.015 (1.5%).
 */
const LEARNING_RATE = 0.015

/**
 * Maximum any single weight can reach.
 */
const MAX_WEIGHT = 0.50

/**
 * Minimum any single weight can be.
 */
const MIN_WEIGHT = 0.05

/**
 * Normalize weights so they always sum to 1.0.
 * Preserves relative proportions while ensuring the invariant.
 */
export function normalizeWeights(weights: WeightConfig): WeightConfig {
  const total =
    weights.impressions +
    weights.position +
    weights.ctrGap +
    weights.conversions +
    weights.freshness

  if (total === 0) return { ...DEFAULT_WEIGHTS }

  return {
    impressions: Math.round((weights.impressions / total) * 10000) / 10000,
    position: Math.round((weights.position / total) * 10000) / 10000,
    ctrGap: Math.round((weights.ctrGap / total) * 10000) / 10000,
    conversions: Math.round((weights.conversions / total) * 10000) / 10000,
    freshness: Math.round((weights.freshness / total) * 10000) / 10000,
  }
}

/**
 * Clamp a weight value within bounds.
 */
function clampWeight(value: number): number {
  return Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, value))
}

/**
 * Determine which weight factor to reinforce based on bucket type.
 *
 * The logic: if a CTR_FIX action succeeded, it means CTR gap scoring was
 * a good predictor, so we reinforce the ctrGap weight. Similarly for
 * position-based actions (STRIKING_DISTANCE) and impression-based
 * actions (RELEVANCE_REBUILD).
 */
function getReinforcementTarget(bucket: ActionBucket): keyof WeightConfig {
  switch (bucket) {
    case 'CTR_FIX':
      return 'ctrGap'
    case 'STRIKING_DISTANCE':
      return 'position'
    case 'RELEVANCE_REBUILD':
      return 'impressions'
    case 'LOCAL_BOOST':
      return 'conversions'
  }
}

/**
 * Adjust weights based on observed outcomes.
 *
 * Learning algorithm (ported from CRO9):
 * 1. For each successful outcome, increase the weight that predicted it
 * 2. For each failed outcome, decrease that weight slightly (half rate)
 * 3. Clamp all weights to [MIN_WEIGHT, MAX_WEIGHT]
 * 4. Normalize so sum = 1.0
 *
 * The evaluation window is 14-60 days:
 * - Actions younger than 14 days are too early to evaluate
 * - Actions older than 60 days are stale data
 *
 * @param currentWeights - The current weight configuration
 * @param outcomes - Array of outcome evaluations from recent actions
 * @returns New adjusted weight configuration (normalized to sum = 1.0)
 */
export function adjustWeights(
  currentWeights: WeightConfig,
  outcomes: OutcomeData[]
): WeightConfig {
  if (outcomes.length === 0) return { ...currentWeights }

  const adjusted = { ...currentWeights }

  // Filter outcomes to evaluation window (14-60 days)
  const now = Date.now()
  const minAge = 14 * 24 * 60 * 60 * 1000 // 14 days
  const maxAge = 60 * 24 * 60 * 60 * 1000 // 60 days

  const validOutcomes = outcomes.filter((outcome) => {
    const age = now - new Date(outcome.evaluatedAt).getTime()
    return age >= minAge && age <= maxAge
  })

  if (validOutcomes.length === 0) return { ...currentWeights }

  let improvements = 0
  let regressions = 0

  for (const outcome of validOutcomes) {
    const target = getReinforcementTarget(outcome.bucket)

    if (outcome.success) {
      // Reinforce: increase the weight that predicted this success
      adjusted[target] = clampWeight(adjusted[target] + LEARNING_RATE)
      improvements++
    } else {
      // Penalize: decrease the weight, but at half the learning rate
      adjusted[target] = clampWeight(adjusted[target] - LEARNING_RATE / 2)
      regressions++
    }
  }

  // Normalize so all weights sum to 1.0
  const normalized = normalizeWeights(adjusted)

  return normalized
}

/**
 * Calculate the confidence score of the current weights.
 * Higher values mean more learning iterations have occurred.
 * Range: 0 (no data) to 1 (highly trained).
 */
export function calculateConfidence(
  totalOutcomes: number,
  successRate: number
): number {
  // Need at least 10 outcomes for any confidence
  if (totalOutcomes < 10) return 0

  // Confidence grows logarithmically with data volume
  const volumeScore = Math.min(1, Math.log10(totalOutcomes) / 2.5) // 300 = max

  // Success rate above 60% is good
  const successScore = Math.max(0, (successRate - 0.4) / 0.4)

  return Math.round(volumeScore * 0.6 + successScore * 0.4 * 1000) / 1000
}
