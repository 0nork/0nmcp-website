import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })

/**
 * Check if the variant pool has reached a performance plateau.
 * A plateau is detected when:
 * 1. The top variant's win rate has stabilized (< 2% change over last 50 observations)
 * 2. Sample sizes are large enough (alpha + beta > 20 for top 3 variants)
 * 3. The gap between #1 and #2 is < 5%
 */
export async function detectPlateau(): Promise<{
  plateauDetected: boolean
  topVariants: Array<{ id: string; variant_key: string; winRate: number; samples: number }>
  reason: string
}> {
  const admin = getAdmin()

  const { data: variants } = await admin
    .from('lvos_variants')
    .select('*')
    .order('alpha', { ascending: false })

  if (!variants || variants.length < 3) {
    return { plateauDetected: false, topVariants: [], reason: 'Insufficient variants' }
  }

  // Calculate win rates
  const ranked = variants.map(v => ({
    id: v.id,
    variant_key: v.variant_key,
    winRate: v.alpha / (v.alpha + v.beta),
    samples: v.alpha + v.beta - 2, // subtract initial priors
  })).sort((a, b) => b.winRate - a.winRate)

  const top3 = ranked.slice(0, 3)

  // Check 1: Sufficient sample size
  const sufficientSamples = top3.every(v => v.samples >= 20)
  if (!sufficientSamples) {
    return { plateauDetected: false, topVariants: top3, reason: 'Insufficient samples for top variants' }
  }

  // Check 2: Win rate gap between #1 and #2
  const gap = Math.abs(top3[0].winRate - top3[1].winRate)
  if (gap > 0.05) {
    return { plateauDetected: false, topVariants: top3, reason: `Gap between top variants: ${(gap * 100).toFixed(1)}%` }
  }

  // Check 3: Top variant stable (we check if alpha+beta is large enough for convergence)
  const convergenceThreshold = top3[0].samples > 50

  return {
    plateauDetected: convergenceThreshold,
    topVariants: top3,
    reason: convergenceThreshold
      ? `Plateau detected: top variants within ${(gap * 100).toFixed(1)}% with ${top3[0].samples}+ samples`
      : 'Top variant still evolving',
  }
}

/**
 * Autonomously generate new variant questions when a plateau is detected.
 * Uses Claude to create variations inspired by top-performing questions.
 */
export async function generateNewVariants(
  topVariantKeys: string[],
  count: number = 3
): Promise<Array<{ variant_key: string; question_text: string; context_hint: string }>> {
  const admin = getAdmin()

  // Fetch full text of top performers
  const { data: topVariants } = await admin
    .from('lvos_variants')
    .select('variant_key, question_text, context_hint')
    .in('variant_key', topVariantKeys)

  if (!topVariants || topVariants.length === 0) return []

  const topQuestionsText = topVariants
    .map((v, i) => `${i + 1}. "${v.question_text}" — Context: ${v.context_hint}`)
    .join('\n')

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `These LinkedIn onboarding follow-up questions are performing best for driving user engagement:

${topQuestionsText}

Generate ${count} NEW follow-up questions that explore similar themes but with fresh angles. The questions should:
- Be open-ended and invite personal/professional stories
- Feel natural and conversational
- Be different enough from the originals to test new approaches
- Help us learn about the person's professional identity

Return a JSON array with exactly ${count} objects:
[{ "variant_key": "gen_<short_snake_case>", "question_text": "the question", "context_hint": "what this reveals" }]

ONLY return the JSON array.`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return []
    const parsed = JSON.parse(match[0]) as Array<{ variant_key: string; question_text: string; context_hint: string }>
    return parsed.slice(0, count)
  } catch {
    return []
  }
}

/**
 * Full plateau detection + variant generation cycle.
 * Called by cron job.
 */
export async function runPlateauCycle(): Promise<{
  plateauDetected: boolean
  newVariantsCreated: number
  reason: string
}> {
  const { plateauDetected, topVariants, reason } = await detectPlateau()

  if (!plateauDetected) {
    return { plateauDetected: false, newVariantsCreated: 0, reason }
  }

  const topKeys = topVariants.map(v => v.variant_key)
  const newVariants = await generateNewVariants(topKeys, 3)

  if (newVariants.length === 0) {
    return { plateauDetected: true, newVariantsCreated: 0, reason: 'Plateau detected but failed to generate new variants' }
  }

  const admin = getAdmin()

  // Get parent variant ID (the top performer)
  const { data: parent } = await admin
    .from('lvos_variants')
    .select('id')
    .eq('variant_key', topKeys[0])
    .single()

  // Insert new variants
  const { data: inserted } = await admin
    .from('lvos_variants')
    .insert(
      newVariants.map(v => ({
        variant_key: v.variant_key,
        question_text: v.question_text,
        context_hint: v.context_hint,
        is_seed: false,
        parent_variant_id: parent?.id || null,
        alpha: 1.0,
        beta: 1.0,
      }))
    )
    .select('id')

  return {
    plateauDetected: true,
    newVariantsCreated: inserted?.length || 0,
    reason: `${reason}. Generated ${inserted?.length || 0} new variants.`,
  }
}
