import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

async function postToLinkedIn(commentUrn: string, postUrn: string, text: string, token: string, memberId: string): Promise<string> {
  const res = await fetch(`https://api.linkedin.com/v2/socialActions/${encodeURIComponent(postUrn)}/comments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': '202308',
    },
    body: JSON.stringify({
      actor: `urn:li:person:${memberId}`,
      message: { text },
      parentComment: commentUrn,
    }),
  })
  if (!res.ok) throw new Error(`LinkedIn reply ${res.status}: ${await res.text()}`)
  return (await res.json()).id || ''
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth unavailable' }, { status: 503 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json() as {
    action: 'approve' | 'reject' | 'edit_and_post' | 'regenerate'
    draft_id: string
    edited_text?: string
    rejection_reason?: string
  }

  const admin = getAdmin()

  const { data: draft } = await admin
    .from('comment_reply_drafts')
    .select('*, post_comments(linkedin_comment_id, linkedin_post_urn, intent)')
    .eq('id', body.draft_id).single()

  if (!draft) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: member } = await admin
    .from('linkedin_members')
    .select('id, linkedin_id, linkedin_access_token')
    .eq('id', draft.member_id).eq('user_id', user.id).single()

  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const comment = draft.post_comments as { linkedin_comment_id: string; linkedin_post_urn: string; intent: string }

  if (body.action === 'reject') {
    await admin.from('comment_reply_drafts').update({
      status: 'rejected',
      rejection_reason: body.rejection_reason || null,
      updated_at: new Date().toISOString(),
    }).eq('id', body.draft_id)
    return NextResponse.json({ success: true, status: 'rejected' })
  }

  if (body.action === 'regenerate') {
    await admin.from('comment_reply_drafts').update({
      draft_text: '[generating...]',
      draft_version: (draft.draft_version || 1) + 1,
      updated_at: new Date().toISOString(),
    }).eq('id', body.draft_id)
    return NextResponse.json({ success: true, status: 'regenerating' })
  }

  const replyText = body.action === 'edit_and_post' && body.edited_text ? body.edited_text : draft.draft_text

  try {
    const linkedInReplyId = await postToLinkedIn(
      comment.linkedin_comment_id, comment.linkedin_post_urn,
      replyText, member.linkedin_access_token, member.linkedin_id
    )

    await admin.from('comment_reply_drafts').update({
      status: 'posted',
      posted_at: new Date().toISOString(),
      linkedin_reply_id: linkedInReplyId,
      edited_text: body.action === 'edit_and_post' ? body.edited_text : null,
      updated_at: new Date().toISOString(),
    }).eq('id', body.draft_id)

    await admin.from('comment_reply_outcomes').insert({
      draft_id: body.draft_id,
      member_id: member.id,
      lvos_variant_id: draft.lvos_variant_id || null,
      original_comment_intent: comment.intent,
      was_edited: body.action === 'edit_and_post',
      was_auto_posted: false,
      observation_window_end: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    })

    return NextResponse.json({ success: true, status: 'posted', linkedin_reply_id: linkedInReplyId })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
