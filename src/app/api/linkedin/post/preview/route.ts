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

  let body: { member_id: string; topic?: string; style_override?: string }
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
    return NextResponse.json({ error: 'Member not onboarded. Archetype missing.' }, { status: 400 })
  }

  const result = await generatePost({
    archetype,
    topic: body.topic,
  })

  const receipt = await logToolCall({
    toolName: 'get_post_preview',
    memberId: body.member_id,
    inputParams: { topic: body.topic },
    outputResult: { content_length: result.content.length, valid: result.valid },
    executionTimeMs: Date.now() - startTime,
    success: true,
  })

  return NextResponse.json({ ...result, receipt })
}
