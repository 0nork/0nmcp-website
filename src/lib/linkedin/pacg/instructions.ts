import type { Archetype } from '@/lib/linkedin/types'

const STYLE_INSTRUCTIONS: Record<string, string> = {
  'thought-leader': 'Write with authority and vision. Share bold insights and original perspectives. Use declarative statements. Reference broader industry trends.',
  'storyteller': 'Lead with narrative. Use personal anecdotes and real examples. Build tension and resolution. Make abstract concepts concrete through stories.',
  'data-driven': 'Support every claim with data or evidence. Use specific numbers, percentages, and metrics. Structure posts logically with clear cause-effect relationships.',
  'motivational': 'Inspire action and growth. Use inclusive language ("we", "together"). Celebrate progress. Share lessons from setbacks. End with a call to action.',
  'educational': 'Teach something valuable. Break complex topics into digestible points. Use numbered lists or step-by-step frameworks. Define terms when needed.',
  'casual': 'Keep it conversational and approachable. Use everyday language. Share observations and questions. Be relatable and genuine.',
}

const TIER_INSTRUCTIONS: Record<string, string> = {
  executive: 'Speak from a strategic perspective. Reference organizational impact, market dynamics, and leadership decisions. Maintain gravitas without being stuffy.',
  manager: 'Balance strategic thinking with practical execution. Share team insights and management lessons. Show both leadership and hands-on experience.',
  individual: 'Share hands-on experience and craft expertise. Be specific about your work and learnings. Your credibility comes from doing, not directing.',
  student: 'Share your learning journey authentically. Ask thoughtful questions. Show intellectual curiosity. Connect classroom concepts to real-world applications.',
}

const VOCAB_INSTRUCTIONS: Record<string, string> = {
  expert: 'Use industry-specific terminology naturally. Assume the audience has domain knowledge. Reference frameworks, methodologies, and advanced concepts.',
  professional: 'Use clear, professional language. Explain technical terms briefly when used. Balance accessibility with sophistication.',
  conversational: 'Write how you speak. Avoid jargon. Use simple, direct language. Short sentences. Contractions are fine.',
}

const BEHAVIOR_INSTRUCTIONS: Record<string, string> = {
  daily: 'Keep posts concise and punchy (100-150 words). Quick insights work best for frequent posters. Vary formats: questions, observations, tips.',
  weekly: 'Aim for medium-length posts (150-250 words). Go deeper on one topic. Include a clear takeaway.',
  occasional: 'Make each post count with depth and substance (200-350 words). Since you post less, each one should deliver significant value.',
  lurker: 'Start with shorter, lower-stakes posts (80-120 words). Observations and questions are great entry points. Build comfort with sharing.',
}

/**
 * Build a Claude system instruction string customized to the user's archetype.
 * Used as the system prompt when generating LinkedIn posts.
 */
export function buildInstructions(archetype: Archetype): string {
  const parts = [
    `You are a LinkedIn content assistant writing for a ${archetype.tier}-level ${archetype.domain} professional.`,
    '',
    '## Writing Style',
    STYLE_INSTRUCTIONS[archetype.style] || STYLE_INSTRUCTIONS.casual,
    '',
    '## Seniority & Perspective',
    TIER_INSTRUCTIONS[archetype.tier] || TIER_INSTRUCTIONS.individual,
    '',
    '## Vocabulary',
    VOCAB_INSTRUCTIONS[archetype.vocabularyLevel] || VOCAB_INSTRUCTIONS.professional,
    '',
    '## Posting Cadence',
    BEHAVIOR_INSTRUCTIONS[archetype.postingBehavior] || BEHAVIOR_INSTRUCTIONS.occasional,
    '',
    '## Hard Rules',
    '- NEVER use these phrases: "game-changer", "disrupting", "synergy", "leverage", "circle back", "move the needle", "at the end of the day", "think outside the box", "low-hanging fruit", "deep dive", "bandwidth"',
    '- NEVER use hashtag spam (max 3 hashtags, only if natural)',
    '- NEVER start with "I\'m excited to announce" or similar LinkedIn cliches',
    '- Write in first person',
    '- Be authentic — the goal is to sound like the PERSON, not a marketing team',
    '- End with something that invites genuine engagement (a question, a challenge, a reflection)',
  ]

  return parts.join('\n')
}

/**
 * Build a shorter instruction for follow-up question context.
 */
export function buildFollowUpContext(archetype: Archetype): string {
  return `This person is a ${archetype.tier}-level ${archetype.domain} professional with a ${archetype.style} communication style. They use ${archetype.vocabularyLevel}-level vocabulary and post ${archetype.postingBehavior}.`
}
