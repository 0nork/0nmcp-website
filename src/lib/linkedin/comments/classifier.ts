import { callAI } from '@/lib/ai-provider'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type CommentIntent = 'challenge' | 'question' | 'praise' | 'spam' | 'neutral' | 'troll'
export type CommentPriority = 'high' | 'normal' | 'low' | 'skip'

export interface CommentClassification {
  intent: CommentIntent
  intent_confidence: number
  sentiment_score: number
  priority: CommentPriority
  reasoning: string
}

export async function classifyComment(
  commentText: string,
  commenterHeadline?: string
): Promise<CommentClassification> {
  const result = await callAI({
    system: 'You classify LinkedIn comments for a professional content intelligence system. Return ONLY valid JSON.',
    user: `Classify this LinkedIn comment.
${commenterHeadline ? `Commenter role: ${commenterHeadline}` : ''}
Comment: "${commentText}"

Return ONLY JSON:
{
  "intent": "challenge"|"question"|"praise"|"spam"|"neutral"|"troll",
  "intent_confidence": 0.0-1.0,
  "sentiment_score": -1.0 to 1.0,
  "priority": "high"|"normal"|"low"|"skip",
  "reasoning": "one sentence"
}

Intent: challenge=substantive objection/counter-argument, question=genuine question,
praise=positive support, spam=promotional/irrelevant, neutral=passing remark, troll=bad faith
Priority: high=challenge/question from someone whose headline is relevant to the post topic,
normal=other challenge/question, low=praise/neutral, skip=spam/troll`,
    maxTokens: 250,
  })

  try {
    const match = (result?.text || '').match(/\{[\s\S]*\}/)
    if (!match) throw new Error('no JSON')
    const p = JSON.parse(match[0])
    const intents: CommentIntent[] = ['challenge', 'question', 'praise', 'spam', 'neutral', 'troll']
    const priorities: CommentPriority[] = ['high', 'normal', 'low', 'skip']
    return {
      intent: intents.includes(p.intent) ? p.intent : 'neutral',
      intent_confidence: Math.min(1, Math.max(0, p.intent_confidence || 0.5)),
      sentiment_score: Math.min(1, Math.max(-1, p.sentiment_score || 0)),
      priority: priorities.includes(p.priority) ? p.priority : 'normal',
      reasoning: p.reasoning || '',
    }
  } catch {
    return { intent: 'neutral', intent_confidence: 0.5, sentiment_score: 0, priority: 'low', reasoning: 'classification failed' }
  }
}

export async function processUnclassifiedComments(memberId: string): Promise<{
  processed: number
  queued: number
  skipped: number
}> {
  const admin = getAdmin()
  const results = { processed: 0, queued: 0, skipped: 0 }

  const { data: settings } = await admin
    .from('member_comment_settings')
    .select('reply_to_challenges,reply_to_questions,reply_to_praise,skip_spam,skip_trolls')
    .eq('member_id', memberId)
    .single()

  const { data: comments } = await admin
    .from('post_comments')
    .select('*')
    .eq('member_id', memberId)
    .is('processed_at', null)
    .order('comment_posted_at', { ascending: true })
    .limit(50)

  if (!comments?.length) return results

  for (const comment of comments) {
    const c = await classifyComment(comment.comment_text, comment.commenter_headline || undefined)

    await admin.from('post_comments').update({
      intent: c.intent,
      intent_confidence: c.intent_confidence,
      sentiment_score: c.sentiment_score,
      priority: c.priority,
      processed_at: new Date().toISOString(),
    }).eq('id', comment.id)

    results.processed++

    const shouldQueue = (() => {
      if (c.priority === 'skip') return false
      if (c.intent === 'spam' && settings?.skip_spam !== false) return false
      if (c.intent === 'troll' && settings?.skip_trolls !== false) return false
      if (c.intent === 'challenge' && settings?.reply_to_challenges === false) return false
      if (c.intent === 'question' && settings?.reply_to_questions === false) return false
      if (c.intent === 'praise' && settings?.reply_to_praise !== true) return false
      return true
    })()

    if (!shouldQueue) { results.skipped++; continue }

    const { data: existing } = await admin
      .from('comment_reply_drafts')
      .select('id')
      .eq('comment_id', comment.id)
      .in('status', ['pending', 'approved'])
      .maybeSingle()

    if (!existing) {
      await admin.from('comment_reply_drafts').insert({
        comment_id: comment.id,
        member_id: memberId,
        draft_text: '[generating...]',
        status: 'pending',
      })
      results.queued++
    }
  }
  return results
}
