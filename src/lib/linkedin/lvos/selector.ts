import { createClient } from '@supabase/supabase-js'
import type { LvosVariant } from '@/lib/linkedin/types'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Sample from a Beta distribution using the Jitter method.
 * Beta(alpha, beta) approximation using Gamma distributions.
 */
function sampleBeta(alpha: number, beta: number): number {
  // Use the inverse CDF method for small alpha/beta
  // For larger values, use the relationship between Beta and Gamma distributions
  const gammaA = sampleGamma(alpha)
  const gammaB = sampleGamma(beta)
  return gammaA / (gammaA + gammaB)
}

/**
 * Sample from Gamma distribution using Marsaglia and Tsang's method.
 */
function sampleGamma(shape: number): number {
  if (shape < 1) {
    return sampleGamma(shape + 1) * Math.pow(Math.random(), 1 / shape)
  }

  const d = shape - 1 / 3
  const c = 1 / Math.sqrt(9 * d)

  while (true) {
    let x: number
    let v: number

    do {
      x = randn()
      v = 1 + c * x
    } while (v <= 0)

    v = v * v * v
    const u = Math.random()

    if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v
  }
}

/** Standard normal random using Box-Muller transform */
function randn(): number {
  const u1 = Math.random()
  const u2 = Math.random()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

/**
 * Select the best variant using Thompson Sampling.
 * Samples from Beta(alpha, beta) for each variant and picks the highest.
 *
 * @param memberId - Optional member ID for CUCIA segment boosting
 * @param segmentBoosts - Optional variant-level boosts from CUCIA
 */
export async function selectVariant(
  memberId?: string,
  segmentBoosts?: Record<string, number>
): Promise<LvosVariant> {
  const admin = getAdmin()

  // Fetch all active variants
  const { data: variants, error } = await admin
    .from('lvos_variants')
    .select('*')
    .order('created_at', { ascending: true })

  if (error || !variants || variants.length === 0) {
    throw new Error('No LVOS variants available')
  }

  // Thompson Sampling: sample from Beta(alpha, beta) for each variant
  let bestVariant = variants[0]
  let bestSample = -1

  for (const variant of variants) {
    let sample = sampleBeta(variant.alpha, variant.beta)

    // Apply CUCIA segment boost if available
    if (segmentBoosts && segmentBoosts[variant.id]) {
      sample *= (1 + segmentBoosts[variant.id])
    }

    if (sample > bestSample) {
      bestSample = sample
      bestVariant = variant
    }
  }

  return bestVariant as LvosVariant
}

/**
 * Record a selection event (called when a variant is shown to a user).
 */
export async function recordSelection(
  memberId: string,
  variantId: string,
  sessionId: string
): Promise<string> {
  const admin = getAdmin()

  const { data, error } = await admin
    .from('lvos_selections')
    .insert({
      member_id: memberId,
      variant_id: variantId,
      session_id: sessionId,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to record selection: ${error.message}`)
  return data.id
}

/**
 * Update variant weights after observation window closes.
 * Called by the observer when a conversion (or non-conversion) is detected.
 */
export async function updateVariantWeights(
  variantId: string,
  converted: boolean,
  responseQuality: number
): Promise<void> {
  const admin = getAdmin()

  // Fetch current variant
  const { data: variant, error } = await admin
    .from('lvos_variants')
    .select('alpha, beta')
    .eq('id', variantId)
    .single()

  if (error || !variant) return

  // Thompson Sampling update:
  // Conversion → increment alpha (successes)
  // No conversion → increment beta (failures)
  // Scale by response quality (0-1)
  const weight = Math.max(0.1, responseQuality)

  const newAlpha = converted ? variant.alpha + weight : variant.alpha
  const newBeta = converted ? variant.beta : variant.beta + weight

  await admin
    .from('lvos_variants')
    .update({ alpha: newAlpha, beta: newBeta })
    .eq('id', variantId)
}
