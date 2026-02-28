import { createClient } from '@supabase/supabase-js'
import { updateVariantWeights } from './selector'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Record a conversion event within an observation window.
 * Called when a user takes a conversion action (generates post, enables automation, etc).
 */
export async function recordConversion(
  memberId: string,
  conversionEvent: string
): Promise<void> {
  const admin = getAdmin()

  // Find open observation windows for this member
  const { data: openSelections } = await admin
    .from('lvos_selections')
    .select('id, variant_id')
    .eq('member_id', memberId)
    .is('conversion_event', null)
    .gte('observation_window_end', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(5)

  if (!openSelections || openSelections.length === 0) return

  // Update the most recent open selection with conversion
  const selection = openSelections[0]
  await admin
    .from('lvos_selections')
    .update({
      conversion_event: conversionEvent,
      response_text: conversionEvent,
    })
    .eq('id', selection.id)

  // Update variant weights — this was a success
  await updateVariantWeights(selection.variant_id, true, 1.0)

  // Record performance
  await admin.from('lvos_variant_performance').insert({
    variant_id: selection.variant_id,
    member_id: memberId,
    was_selected: true,
    led_to_conversion: true,
    response_quality: 1.0,
  })
}

/**
 * Process expired observation windows.
 * Called periodically (cron) to close windows that expired without conversion.
 */
export async function processExpiredWindows(): Promise<number> {
  const admin = getAdmin()

  // Find expired windows with no conversion
  const { data: expired } = await admin
    .from('lvos_selections')
    .select('id, variant_id, member_id')
    .is('conversion_event', null)
    .lt('observation_window_end', new Date().toISOString())
    .limit(100)

  if (!expired || expired.length === 0) return 0

  let processed = 0

  for (const selection of expired) {
    // Mark as expired (non-conversion)
    await admin
      .from('lvos_selections')
      .update({ conversion_event: 'expired' })
      .eq('id', selection.id)

    // Update variant weights — this was a failure
    await updateVariantWeights(selection.variant_id, false, 0.5)

    // Record performance
    await admin.from('lvos_variant_performance').insert({
      variant_id: selection.variant_id,
      member_id: selection.member_id,
      was_selected: true,
      led_to_conversion: false,
      response_quality: 0.0,
    })

    processed++
  }

  return processed
}

/**
 * Get observation window status for a member.
 * Returns open/active windows.
 */
export async function getOpenWindows(memberId: string) {
  const admin = getAdmin()

  const { data } = await admin
    .from('lvos_selections')
    .select('id, variant_id, session_id, observation_window_start, observation_window_end')
    .eq('member_id', memberId)
    .is('conversion_event', null)
    .gte('observation_window_end', new Date().toISOString())
    .order('created_at', { ascending: false })

  return data || []
}
