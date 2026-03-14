import { callAI } from '@/lib/ai-provider'
import { createClient } from '@supabase/supabase-js'
import { buildInstructions } from '@/lib/linkedin/pacg/instructions'
import { selectVariant, recordSelection } from '@/lib/linkedin/lvos/selector'
import { PRODUCT_KNOWLEDGE } from './product-knowledge'
import type { Archetype } from '@/lib/linkedin/types'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const FALLBACK_ARCHETYPE: Archetype = {
  tier: 'individual', domain: 'tech', style: 'casual',
  postingBehavior: 'occasional', vocabularyLevel: 'professional',
}

const INTENT_PROMPTS: Record<string, string> = {
  challenge: `This person is challenging the post. Reply with peer-level confidence: acknowledge any valid point, name specific technical details that address their concern, point to roadmap if the feature doesn't exist yet. Max 3 sentences. Never defensive.`,
  question: `This person is asking a genuine question. Answer it directly and specifically. Max 2 sentences.`,
  praise: `Positive comment. Brief, genuine, human acknowledgment. Max 1 sentence.`,
  neutral: `Brief, friendly acknowledgment that adds something useful. Max 2 sentences.`,
}

export async function generateCommentReply(params: {
  commentText: string
  commenterName: string
  commenterHeadline?: string
  intent: string
  memberId: string
  archetype: Archetype
  sessionId: string
}): Promise<{ draftText: string; variantId: string | null; selectionId: string | null; confidenceScore: number }> {
  let variantId: string | null = null
  let selectionId: string | null = null

  try {
    const variant = await selectVariant(params.memberId)
    variantId = variant.id
    selectionId = await recordSelection(params.memberId, variant.id, params.sessionId)
  } catch { /* LVOS non-fatal */ }

  const intentPrompt = INTENT_PROMPTS[params.intent] || INTENT_PROMPTS.neutral
  const archetypeInstructions = buildInstructions(params.archetype)

  const result = await callAI({
    system: `${archetypeInstructions}\n\n${PRODUCT_KNOWLEDGE}`,
    user: `${params.commenterName}${params.commenterHeadline ? ` (${params.commenterHeadline})` : ''} commented:

"${params.commentText}"

${intentPrompt}

Write ONLY the reply text — no quotation marks, no label, no preamble.`,
    maxTokens: 350,
  })

  const draftText = result?.text?.trim() || ''
  const confidenceScore = params.intent === 'praise' ? 0.9 : params.intent === 'challenge' || params.intent === 'question' ? 0.7 : 0.6

  return { draftText, variantId, selectionId, confidenceScore }
}

export async function generatePendingDrafts(memberId: string): Promise<{ generated: number; errors: string[] }> {
  const admin = getAdmin()
  const results = { generated: 0, errors: [] as string[] }

  const { data: member } = await admin
    .from('linkedin_members').select('archetype').eq('id', memberId).single()

  const archetype = (member?.archetype as Archetype) || FALLBACK_ARCHETYPE

  const { data: drafts } = await admin
    .from('comment_reply_drafts')
    .select('id, comment_id')
    .eq('member_id', memberId)
    .eq('status', 'pending')
    .eq('draft_text', '[generating...]')
    .limit(20)

  if (!drafts?.length) return results

  const commentIds = drafts.map(d => d.comment_id)
  const { data: comments } = await admin
    .from('post_comments')
    .select('id, comment_text, commenter_name, commenter_headline, intent')
    .in('id', commentIds)

  const commentMap = Object.fromEntries((comments || []).map(c => [c.id, c]))

  for (const draft of drafts) {
    const comment = commentMap[draft.comment_id]
    if (!comment) continue

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    try {
      const { draftText, variantId, selectionId, confidenceScore } = await generateCommentReply({
        commentText: comment.comment_text,
        commenterName: comment.commenter_name,
        commenterHeadline: comment.commenter_headline || undefined,
        intent: comment.intent || 'neutral',
        memberId, archetype, sessionId,
      })

      if (!draftText) { results.errors.push(`Draft ${draft.id}: empty`); continue }

      const { data: settings } = await admin
        .from('member_comment_settings')
        .select('auto_reply_enabled, auto_reply_threshold')
        .eq('member_id', memberId).single()

      const autoPostEligible =
        settings?.auto_reply_enabled === true &&
        confidenceScore >= (settings?.auto_reply_threshold || 0.85)

      await admin.from('comment_reply_drafts').update({
        draft_text: draftText,
        lvos_variant_id: variantId,
        lvos_selection_id: selectionId,
        confidence_score: confidenceScore,
        auto_post_eligible: autoPostEligible,
        updated_at: new Date().toISOString(),
      }).eq('id', draft.id)

      results.generated++
    } catch (err) {
      results.errors.push(`${draft.id}: ${err instanceof Error ? err.message : 'unknown'}`)
    }
  }
  return results
}
