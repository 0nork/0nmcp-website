import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { fetchProfile, upsertMember } from '@/lib/linkedin/auth'
import { runOnboarding } from '@/lib/linkedin/pipeline/onboarding'
import { processFollowUpResponse } from '@/lib/linkedin/pipeline/onboarding'
import { logAiInteraction } from '@/lib/linkedin/network/ai-interaction-logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { linkedin_access_token?: string; follow_up_response?: string; session_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Log AI interaction if caller identifies itself
  const aiSystem = request.headers.get('X-AI-System')
  if (aiSystem) {
    await logAiInteraction({
      aiSystemIdentifier: aiSystem,
      manifestVersion: '1.0',
      toolCalled: 'onboard_with_linkedin',
      inputParams: { has_token: !!body.linkedin_access_token, has_follow_up: !!body.follow_up_response },
    }).catch(() => {})
  }

  // Handle follow-up response (continuing onboarding)
  if (body.follow_up_response && body.session_id) {
    const { data: member } = await supabase
      .from('linkedin_members')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!member) {
      return NextResponse.json({ error: 'Member not found. Connect LinkedIn first.' }, { status: 404 })
    }

    const result = await processFollowUpResponse(member.id, body.session_id, body.follow_up_response)
    return NextResponse.json(result)
  }

  // New onboarding with access token
  if (!body.linkedin_access_token) {
    return NextResponse.json({ error: 'linkedin_access_token is required' }, { status: 400 })
  }

  try {
    const profile = await fetchProfile(body.linkedin_access_token)
    const memberId = await upsertMember(user.id, profile, {
      access_token: body.linkedin_access_token,
      expires_in: 5184000, // 60 days default
    })
    const result = await runOnboarding(memberId, profile)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Onboarding error:', err)
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Onboarding failed',
    }, { status: 500 })
  }
}
