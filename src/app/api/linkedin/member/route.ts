import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getMemberByUserId } from '@/lib/linkedin/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * GET /api/linkedin/member
 * Returns the current user's LinkedIn member profile.
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const member = await getMemberByUserId(user.id)
  if (!member) {
    return NextResponse.json({ error: 'Not connected' }, { status: 404 })
  }

  // Strip sensitive fields
  return NextResponse.json({
    member: {
      id: member.id,
      linkedin_name: member.linkedin_name,
      linkedin_headline: member.linkedin_headline,
      linkedin_avatar_url: member.linkedin_avatar_url,
      linkedin_profile_url: member.linkedin_profile_url,
      archetype: member.archetype,
      onboarding_completed: member.onboarding_completed,
      automated_posting_enabled: member.automated_posting_enabled,
      posting_frequency: member.posting_frequency,
      total_posts: member.total_posts,
      total_engagements: member.total_engagements,
    },
  })
}
