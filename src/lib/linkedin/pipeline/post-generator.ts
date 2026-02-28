import Anthropic from '@anthropic-ai/sdk'
import type { Archetype, PostGenerationResult } from '@/lib/linkedin/types'
import { buildInstructions } from '../pacg/instructions'
import { validatePost } from '../pacg/validator'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })

/**
 * Generate a LinkedIn post customized to the user's archetype.
 */
export async function generatePost(params: {
  archetype: Archetype
  topic?: string
  context?: string
  followUpResponse?: string
}): Promise<PostGenerationResult> {
  const systemInstructions = buildInstructions(params.archetype)

  let userPrompt = 'Write a LinkedIn post'

  if (params.topic) {
    userPrompt += ` about: ${params.topic}`
  }

  if (params.followUpResponse) {
    userPrompt += `\n\nThe user shared this insight: "${params.followUpResponse}"`
    userPrompt += '\n\nUse their own words and perspective as the foundation for the post.'
  }

  if (params.context) {
    userPrompt += `\n\nAdditional context: ${params.context}`
  }

  userPrompt += '\n\nWrite ONLY the post content. No explanations, no meta-commentary.'

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: systemInstructions,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const content = message.content[0].type === 'text' ? message.content[0].text : ''

  // Validate against quality rules
  const validation = validatePost(content)

  // If invalid, try once more with explicit corrections
  if (!validation.valid && validation.banned_phrases_found.length > 0) {
    const retryMessage = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemInstructions,
      messages: [
        { role: 'user', content: userPrompt },
        { role: 'assistant', content },
        {
          role: 'user',
          content: `This post contains banned phrases: ${validation.banned_phrases_found.join(', ')}. Rewrite it without these phrases. Return ONLY the rewritten post.`,
        },
      ],
    })

    const retryContent = retryMessage.content[0].type === 'text' ? retryMessage.content[0].text : content
    const retryValidation = validatePost(retryContent)

    return {
      content: retryContent,
      archetype: params.archetype,
      tone_match_score: 0.85,
      banned_phrases_found: retryValidation.banned_phrases_found,
      valid: retryValidation.valid,
    }
  }

  return {
    content,
    archetype: params.archetype,
    tone_match_score: 0.9,
    banned_phrases_found: validation.banned_phrases_found,
    valid: validation.valid,
  }
}
