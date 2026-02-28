import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getMember } from '@/lib/linkedin/auth'
import { generatePost } from '@/lib/linkedin/pipeline/post-generator'
import { logToolCall } from '@/lib/linkedin/taicd/receipt-constructor'
import type { Archetype } from '@/lib/linkedin/types'

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

  let body: { member_id: string; topic?: string; context?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.member_id) {
    return NextResponse.json({ error: 'member_id is required' }, { status: 400 })
  }

  const startTime = Date.now()

  const member = await getMember(body.member_id)
  if (!member || member.user_id !== user.id) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  const archetype = member.archetype as Archetype
  if (!archetype) {
    return NextResponse.json({ error: 'Member not onboarded' }, { status: 400 })
  }

  const result = await generatePost({
    archetype,
    topic: body.topic,
    context: body.context,
  })

  const receipt = await logToolCall({
    toolName: 'generate_linkedin_post',
    memberId: body.member_id,
    inputParams: { topic: body.topic, context: body.context },
    outputResult: { valid: result.valid, tone_match_score: result.tone_match_score },
    executionTimeMs: Date.now() - startTime,
    success: true,
  })

  return NextResponse.json({ ...result, receipt })
}
