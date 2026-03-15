import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { provisionUser } from '@/lib/crm-provisioning'

/**
 * POST /api/onboarding/complete
 * Atomically marks onboarding as complete for the current user.
 * Triggered from the final step of the onboarding wizard.
 * Also auto-provisions CRM sub-account for Agent Studio.
 */
export async function POST() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({
      onboarding_completed: true,
      onboarding_step: 6,
    })
    .eq('id', user.id)

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 })
  }

  // Auto-provision CRM sub-account for Agent Studio (fire and forget)
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name, company')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.email) {
    provisionUser({
      userId: user.id,
      email: profile.email,
      fullName: profile.full_name || '',
      company: profile.company || '',
    }).catch(() => {}) // Don't block onboarding if provisioning fails
  }

  return NextResponse.json({ success: true })
}
