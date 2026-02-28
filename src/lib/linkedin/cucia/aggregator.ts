import { createClient } from '@supabase/supabase-js'
import type { Archetype } from '@/lib/linkedin/types'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Build a segment key from an archetype.
 * Format: "industry:seniority:behavior"
 * e.g., "tech:executive:daily"
 */
export function buildSegmentKey(archetype: Archetype): string {
  return `${archetype.domain}:${archetype.tier}:${archetype.postingBehavior}`
}

/**
 * Get segment boosts for LVOS variant selection.
 * Returns a map of variant_id -> boost multiplier based on what works for this segment.
 */
export async function getSegmentBoosts(
  archetype: Archetype
): Promise<Record<string, number>> {
  const admin = getAdmin()
  const segmentKey = buildSegmentKey(archetype)

  const { data: segment } = await admin
    .from('cucia_segment_model')
    .select('top_performing_variants')
    .eq('segment_key', segmentKey)
    .maybeSingle()

  if (!segment?.top_performing_variants) return {}

  // Top performing variants get a boost
  const boosts: Record<string, number> = {}
  const topVariants = segment.top_performing_variants as string[]

  topVariants.forEach((variantId, index) => {
    // First variant gets 20% boost, second 10%, etc.
    boosts[variantId] = 0.2 - (index * 0.05)
  })

  return boosts
}

/**
 * Update segment model after a conversion event.
 * Aggregates anonymized data across users in the same segment.
 */
export async function updateSegmentModel(
  archetype: Archetype,
  variantId: string,
  converted: boolean
): Promise<void> {
  const admin = getAdmin()
  const segmentKey = buildSegmentKey(archetype)

  // Fetch or create segment
  const { data: existing } = await admin
    .from('cucia_segment_model')
    .select('*')
    .eq('segment_key', segmentKey)
    .maybeSingle()

  if (!existing) {
    // Create new segment
    await admin.from('cucia_segment_model').insert({
      segment_key: segmentKey,
      sample_size: 1,
      avg_conversion_rate: converted ? 1.0 : 0.0,
      top_performing_variants: converted ? [variantId] : [],
      archetype_distribution: { [archetype.style]: 1 },
    })
    return
  }

  // Update existing segment
  const newSampleSize = existing.sample_size + 1
  const newConversionRate =
    (existing.avg_conversion_rate * existing.sample_size + (converted ? 1 : 0)) / newSampleSize

  // Update top performing variants
  let topVariants = (existing.top_performing_variants as string[]) || []
  if (converted) {
    if (!topVariants.includes(variantId)) {
      topVariants = [variantId, ...topVariants].slice(0, 5) // keep top 5
    }
  }

  // Update archetype distribution
  const distribution = (existing.archetype_distribution as Record<string, number>) || {}
  distribution[archetype.style] = (distribution[archetype.style] || 0) + 1

  await admin
    .from('cucia_segment_model')
    .update({
      sample_size: newSampleSize,
      avg_conversion_rate: newConversionRate,
      top_performing_variants: topVariants,
      archetype_distribution: distribution,
      updated_at: new Date().toISOString(),
    })
    .eq('segment_key', segmentKey)
}

/**
 * Get segment stats for analytics/dashboard.
 */
export async function getSegmentStats() {
  const admin = getAdmin()

  const { data } = await admin
    .from('cucia_segment_model')
    .select('*')
    .order('sample_size', { ascending: false })
    .limit(20)

  return data || []
}
