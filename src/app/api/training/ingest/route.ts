import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getCurrentTier } from '@/lib/training/generator'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * POST /api/training/ingest — Accept user-contributed training data
 *
 * Requirements:
 * - Authenticated user
 * - Current tier >= 3 (Canopy)
 * - opted_in: true in body
 * - Rate limit: 50 contributions per user per day
 * - 0 Runs cost (contributions are free)
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const admin = getAdmin()

  // Check tier requirement
  const currentTier = await getCurrentTier(admin)
  if (currentTier.tier < 3) {
    return NextResponse.json({
      error: 'tier_requirement',
      message: 'User contributions are available at Tier 3 (Canopy) and above.',
      currentTier: currentTier.tier,
      requiredTier: 3,
    }, { status: 403 })
  }

  const body = await request.json()

  // Validate opt-in
  if (!body.opted_in) {
    return NextResponse.json({ error: 'Training data ingestion requires opted_in: true' }, { status: 400 })
  }

  if (!body.domain || !body.question || !body.synthesis) {
    return NextResponse.json({ error: 'domain, question, and synthesis are required' }, { status: 400 })
  }

  // Hash user ID for anonymization
  const userHash = crypto.createHash('sha256').update(user.id).digest('hex')

  // Rate limit: 50 per user per day
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const { count: todayCount } = await admin
    .from('training_contributions')
    .select('*', { count: 'exact', head: true })
    .eq('user_hash', userHash)
    .gte('created_at', todayStart.toISOString())

  if ((todayCount || 0) >= 50) {
    return NextResponse.json({
      error: 'rate_limit',
      message: 'Maximum 50 contributions per day. Thank you for your input!',
    }, { status: 429 })
  }

  // Score the contribution (basic heuristic — real scoring happens offline)
  const synthesisLength = body.synthesis.length
  const hasSubstance = synthesisLength > 100
  const compositeScore = hasSubstance ? 0.75 : 0.50
  const accepted = compositeScore >= currentTier.scoreThreshold

  // Record contribution
  const { error } = await admin.from('training_contributions').insert({
    user_hash: userHash,
    domain: body.domain,
    question: body.question,
    synthesis: body.synthesis,
    composite_score: compositeScore,
    accepted,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If accepted, write to council_knowledge
  if (accepted) {
    await admin.from('council_knowledge').insert({
      domain: body.domain,
      question: body.question,
      synthesis: body.synthesis,
      composite_score: compositeScore,
      persona_votes: {},
      source: 'user_contribution',
      tier_generated: currentTier.tier,
    })
  }

  return NextResponse.json({
    accepted,
    compositeScore,
    message: accepted
      ? 'Contribution accepted and added to the brain. Thank you!'
      : 'Contribution recorded but did not meet the quality threshold.',
  })
}
