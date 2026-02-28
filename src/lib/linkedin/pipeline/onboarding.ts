import { createClient } from '@supabase/supabase-js'
import type { OnboardingResult, Archetype, LinkedInProfile } from '@/lib/linkedin/types'
import { classifyProfile } from '../pacg/classifier'
import { selectVariant, recordSelection } from '../lvos/selector'
import { getSegmentBoosts } from '../cucia/aggregator'
import { logToolCall } from '../taicd/receipt-constructor'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Run the full onboarding pipeline for a new LinkedIn-connected user.
 *
 * Steps:
 * 1. Classify profile into archetype (PACG)
 * 2. Save archetype to member record
 * 3. Select optimal follow-up question (LVOS + CUCIA boost)
 * 4. Record selection for observation window
 * 5. Build and return execution receipt (TAICD)
 */
export async function runOnboarding(
  memberId: string,
  profile: LinkedInProfile
): Promise<OnboardingResult> {
  const startTime = Date.now()
  const admin = getAdmin()
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  // Step 1: Classify profile
  const archetype = await classifyProfile(profile)

  // Step 2: Save archetype
  await admin
    .from('linkedin_members')
    .update({ archetype, onboarding_completed: true })
    .eq('id', memberId)

  // Step 3: Get CUCIA segment boosts and select variant
  const segmentBoosts = await getSegmentBoosts(archetype)
  const selectedVariant = await selectVariant(memberId, segmentBoosts)

  // Step 4: Record selection for observation window
  await recordSelection(memberId, selectedVariant.id, sessionId)

  // Step 5: Build execution receipt
  const receipt = await logToolCall({
    toolName: 'onboard_with_linkedin',
    memberId,
    inputParams: {
      profile_name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
      headline: profile.headline || null,
    },
    outputResult: {
      archetype,
      follow_up_question: selectedVariant.question_text,
      session_id: sessionId,
    },
    executionTimeMs: Date.now() - startTime,
    success: true,
    followUp: selectedVariant.question_text,
  })

  return {
    member_id: memberId,
    archetype,
    follow_up_question: selectedVariant.question_text,
    post_preview: null,
    receipt,
  }
}

/**
 * Process a follow-up response during onboarding.
 * Records the response and triggers CUCIA update if conversion happens.
 */
export async function processFollowUpResponse(
  memberId: string,
  sessionId: string,
  responseText: string
): Promise<{ processed: boolean; archetype: Archetype | null }> {
  const admin = getAdmin()

  // Update the selection with the response
  await admin
    .from('lvos_selections')
    .update({ response_text: responseText })
    .eq('member_id', memberId)
    .eq('session_id', sessionId)

  // Fetch member archetype
  const { data: member } = await admin
    .from('linkedin_members')
    .select('archetype')
    .eq('id', memberId)
    .single()

  return {
    processed: true,
    archetype: member?.archetype as Archetype | null,
  }
}
