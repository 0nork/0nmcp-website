import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { getMember } from '@/lib/linkedin/auth'
import { validatePost } from '@/lib/linkedin/pacg/validator'
import { logToolCall } from '@/lib/linkedin/taicd/receipt-constructor'
import { recordConversion } from '@/lib/linkedin/lvos/observer'
import { updateSegmentModel } from '@/lib/linkedin/cucia/aggregator'
import type { Archetype } from '@/lib/linkedin/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { member_id: string; content: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.member_id || !body.content) {
    return NextResponse.json({ error: 'member_id and content are required' }, { status: 400 })
  }

  const startTime = Date.now()

  const member = await getMember(body.member_id)
  if (!member || member.user_id !== user.id) {
    return NextResponse.json({ error: 'Member not found' }, { status: 404 })
  }

  // Validate post
  const validation = validatePost(body.content)
  if (!validation.valid) {
    return NextResponse.json({
      error: 'Post failed validation',
      banned_phrases: validation.banned_phrases_found,
      warnings: validation.warnings,
    }, { status: 422 })
  }

  // Publish to LinkedIn
  const API_BASE = 'https://api.linkedin.com/v2'
  try {
    const res = await fetch(`${API_BASE}/ugcPosts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${member.linkedin_access_token}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: `urn:li:person:${member.linkedin_id}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: { text: body.content },
            shareMediaCategory: 'NONE',
          },
        },
        visibility: {
          'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
        },
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`LinkedIn API: ${res.status} — ${err}`)
    }

    const data = await res.json()
    const postId = data.id || ''
    const postUrl = `https://www.linkedin.com/feed/update/${postId}`

    // Record as conversion in LVOS
    await recordConversion(body.member_id, 'published_post').catch(() => {})

    // Update CUCIA segment model
    const archetype = member.archetype as Archetype
    if (archetype) {
      await updateSegmentModel(archetype, '', true).catch(() => {})
    }

    // Increment post count
    const admin = getAdmin()
    await admin.rpc('increment_member_posts', { mid: body.member_id })

    // Log tool call
    const receipt = await logToolCall({
      toolName: 'publish_linkedin_post',
      memberId: body.member_id,
      inputParams: { content_length: body.content.length },
      outputResult: { post_id: postId, post_url: postUrl },
      executionTimeMs: Date.now() - startTime,
      success: true,
    })

    return NextResponse.json({ post_url: postUrl, post_id: postId, receipt })
  } catch (err) {
    const receipt = await logToolCall({
      toolName: 'publish_linkedin_post',
      memberId: body.member_id,
      inputParams: { content_length: body.content.length },
      outputResult: {},
      executionTimeMs: Date.now() - startTime,
      success: false,
      errorMessage: err instanceof Error ? err.message : 'Unknown error',
    })

    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Failed to publish',
      receipt,
    }, { status: 500 })
  }
}
