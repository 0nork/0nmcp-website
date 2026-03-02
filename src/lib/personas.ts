/**
 * 0nMCP Persona Engine — AI Forum Agents
 * Generates personas, threads, and replies for organic forum activity.
 * Personas complement each other with diverse skills, unique writing styles,
 * and natural personality variation that lacks recognizable AI patterns.
 */

import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

let _admin: ReturnType<typeof createClient> | null = null
function getAdmin() {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _admin
}

// ==================== Types ====================

export interface Persona {
  id: string
  name: string
  slug: string
  avatar_url: string | null
  bio: string | null
  role: string | null
  expertise: string[]
  personality: {
    tone: string
    verbosity: string
    emoji_usage: string
    asks_followups: boolean
    writing_style: string
    quirks: string[]
    sentence_structure: string
    vocabulary_level: string
    punctuation_style: string
  } | null
  knowledge_level: string
  preferred_groups: string[]
  is_active: boolean
  activity_level: string
  last_active_at: string | null
  thread_count: number
  reply_count: number
  created_at: string
  profile_id?: string
  is_moderator?: boolean
}

export interface TopicSeed {
  id: string
  topic: string
  category: string | null
  prompt_hint: string | null
  priority: number
  used_count: number
  last_used_at: string | null
  created_at: string
}

export interface PersonaConversation {
  id: string
  thread_id: string
  persona_id: string
  action: string
  content_preview: string | null
  created_at: string
}

// ==================== Claude API Helper ====================

async function callClaude(prompt: string, maxTokens = 2048): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY required')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Claude API error: ${response.status} — ${err}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text || ''
}

function parseJSON<T>(text: string): T {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Failed to parse JSON from Claude response')
  return JSON.parse(match[0])
}

// ==================== 0nMCP Context ====================

const FORUM_CONTEXT = `This is the community forum for 0nMCP — the Universal AI API Orchestrator.
0nMCP connects 819+ tools across 48 services (Stripe, Slack, Discord, OpenAI, Supabase, Notion, GitHub, Shopify, Twilio, etc).
One npm install, one config file. The .0n Standard uses SWITCH files for portable configuration.
Key features: CLI tool, Vault (encrypted credentials), Engine (portable AI Brain bundles), Workflow Runtime.
Forum groups: general, help, showcase, feature-requests, bug-reports, tutorials, workflows, integrations, off-topic.
The community is technical — developers, agency owners, founders, automation builders.`

// ==================== Writing Style Dimensions ====================
// Each persona gets a unique combination of these traits to ensure
// no two personas write in recognizably similar patterns.

const WRITING_STYLES = [
  'stream-of-consciousness', 'methodical-step-by-step', 'storyteller',
  'bullet-point-lover', 'question-led-socratic', 'dry-humor',
  'code-heavy-minimal-prose', 'analogies-and-metaphors', 'direct-blunt',
  'encouraging-mentor', 'skeptical-pragmatist', 'excited-explorer',
] as const

const SENTENCE_STRUCTURES = [
  'short-punchy (5-12 words avg, fragments ok)',
  'varied-complex (mixes long/short, subordinate clauses)',
  'conversational-run-on (commas instead of periods, natural flow)',
  'academic-precise (proper grammar, clear antecedents)',
  'telegraphic (drops articles/pronouns, gets to point)',
  'parenthetical (lots of asides, digressions in parens)',
] as const

const VOCABULARY_LEVELS = [
  'casual-slang (gonna, wanna, lol, tbh, ngl)',
  'professional-clean (no slang, industry terms)',
  'mixed-colloquial (professional with occasional casual)',
  'technical-jargon-heavy (deep domain vocabulary)',
  'plain-accessible (avoids jargon, explains everything)',
  'academic-formal (precise terminology, no contractions)',
] as const

const PUNCTUATION_STYLES = [
  'minimal (few commas, no semicolons, rare exclamation)',
  'dash-heavy (em dashes everywhere — like this — for asides)',
  'ellipsis-user (trails off... thinks out loud... you know?)',
  'exclamation-enthusiast (excited! loves emphasis! great stuff!)',
  'period-disciplined (clean stops. no fluff. each sentence earns its spot.)',
  'comma-splice-natural (combines thoughts with commas, flows like speech)',
] as const

const QUIRKS_POOL = [
  'starts replies with "So" or "Hmm"',
  'uses rhetorical questions before answering',
  'references personal anecdotes from past jobs',
  'quotes or paraphrases famous developers/books',
  'uses code blocks even for small snippets',
  'abbreviates common words (prob, def, config, repo)',
  'capitalizes for EMPHASIS instead of bold',
  'uses numbered lists even for 2-3 items',
  'ends posts asking what others think',
  'mentions timezone/location context casually',
  'self-corrects mid-thought (actually, wait...)',
  'uses headers/sections in longer posts',
  'compares things to cooking/sports/music analogies',
  'drops in foreign language phrases occasionally',
  'references Stack Overflow or GitHub issues',
  'uses "EDIT:" or "UPDATE:" in posts',
  'prefaces opinions with "hot take:" or "unpopular opinion:"',
  'thanks other posters by name',
  'uses inline code ticks for `every` technical term',
  'writes TL;DR summaries at the top',
]

/**
 * Select N random unique items from an array
 */
function pickRandom<T>(arr: readonly T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

/**
 * Generate a unique writing fingerprint that hasn't been used by existing personas
 */
function generateWritingFingerprint(existingPersonas: Partial<Persona>[]): {
  writing_style: string
  sentence_structure: string
  vocabulary_level: string
  punctuation_style: string
  quirks: string[]
} {
  const usedStyles = new Set(existingPersonas.map(p => p.personality?.writing_style))
  const usedStructures = new Set(existingPersonas.map(p => p.personality?.sentence_structure))
  const usedVocab = new Set(existingPersonas.map(p => p.personality?.vocabulary_level))
  const usedPunctuation = new Set(existingPersonas.map(p => p.personality?.punctuation_style))
  const usedQuirks = new Set(existingPersonas.flatMap(p => p.personality?.quirks || []))

  // Pick unused options first, fallback to random
  const availableStyles = WRITING_STYLES.filter(s => !usedStyles.has(s))
  const availableStructures = SENTENCE_STRUCTURES.filter(s => !usedStructures.has(s))
  const availableVocab = VOCABULARY_LEVELS.filter(s => !usedVocab.has(s))
  const availablePunctuation = PUNCTUATION_STYLES.filter(s => !usedPunctuation.has(s))
  const availableQuirks = QUIRKS_POOL.filter(q => !usedQuirks.has(q))

  return {
    writing_style: (availableStyles.length > 0 ? availableStyles : [...WRITING_STYLES])[
      Math.floor(Math.random() * (availableStyles.length || WRITING_STYLES.length))
    ],
    sentence_structure: (availableStructures.length > 0 ? availableStructures : [...SENTENCE_STRUCTURES])[
      Math.floor(Math.random() * (availableStructures.length || SENTENCE_STRUCTURES.length))
    ],
    vocabulary_level: (availableVocab.length > 0 ? availableVocab : [...VOCABULARY_LEVELS])[
      Math.floor(Math.random() * (availableVocab.length || VOCABULARY_LEVELS.length))
    ],
    punctuation_style: (availablePunctuation.length > 0 ? availablePunctuation : [...PUNCTUATION_STYLES])[
      Math.floor(Math.random() * (availablePunctuation.length || PUNCTUATION_STYLES.length))
    ],
    quirks: pickRandom(availableQuirks.length >= 3 ? availableQuirks : QUIRKS_POOL, 2 + Math.floor(Math.random() * 2)),
  }
}

// ==================== CRM Community Cross-Post (Direct API) ====================

import {
  upsertContact,
  addContactTags,
  addContactNote,
} from './crm'

function slugify(text: string): string {
  return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

/**
 * Cross-post a persona's thread to the CRM — direct API calls.
 * Creates/finds the persona contact, adds tags, stores post as note.
 * No webhooks, no workflow custom code.
 */
export async function crossPostToCommunity(data: {
  title: string
  content: string
  author: string
  group?: string
  forumUrl?: string
}): Promise<boolean> {
  try {
    const personaEmail = `persona-${slugify(data.author)}@0nmcp.internal`
    const nameParts = data.author.split(' ')

    // 1. Create/find persona contact
    const contact = await upsertContact({
      email: personaEmail,
      firstName: nameParts[0] || data.author,
      lastName: nameParts.slice(1).join(' ') || undefined,
      source: '0nmcp.com/personas',
      tags: ['ai-persona', 'community-member', 'the-0nboard', 'content-creator', '0nmcp'],
    }, 'community')

    // 2. Add activity tags
    await addContactTags(contact.id, [
      'community-active',
      'content-creator',
      `group-${data.group || 'the-0nboard'}`,
    ])

    // 3. Store post as note
    const forumLink = data.forumUrl ? `\nForum: https://0nmcp.com/forum/${data.forumUrl}` : ''
    await addContactNote(contact.id, [
      `[Community Post] ${data.title}`,
      '',
      data.content,
      '',
      '---',
      `Group: ${data.group || 'the-0nboard'}${forumLink}`,
      `Posted: ${new Date().toISOString()}`,
      'Source: AI Persona Engine',
    ].join('\n'))

    console.log(`[personas] Cross-posted to CRM: "${data.title}" by ${data.author} → ${contact.id}`)
    return true
  } catch (err) {
    console.error('[personas] crossPostToCommunity error:', err)
    return false
  }
}

// ==================== Core Functions ====================

/**
 * Generate a full persona profile from a description prompt.
 * Accepts existing personas to ensure the new one complements them
 * with different skills, writing styles, and personality traits.
 */
export async function generatePersona(
  prompt: string,
  existingPersonas: Partial<Persona>[] = []
): Promise<Omit<Persona, 'id' | 'created_at' | 'last_active_at' | 'thread_count' | 'reply_count'>> {
  // Generate a unique writing fingerprint
  const fingerprint = generateWritingFingerprint(existingPersonas)

  // Build context about existing personas to avoid duplication
  const existingContext = existingPersonas.length > 0
    ? `\n\nEXISTING COMMUNITY MEMBERS (you MUST be DIFFERENT from all of these):
${existingPersonas.map(p => `- ${p.name}: ${p.role}, ${p.knowledge_level}, expertise: ${(p.expertise || []).join(', ')}, tone: ${p.personality?.tone || 'unknown'}, writing: ${p.personality?.writing_style || 'unknown'}`).join('\n')}

CRITICAL DIFFERENTIATION RULES:
- Your expertise MUST NOT overlap more than 1 skill with any existing persona
- Your role MUST differ from at least 80% of existing personas
- Your knowledge level SHOULD differ from the majority
- Your personality tone MUST be unique from all existing personas
- Your writing style MUST feel like a completely different human being`
    : ''

  const text = await callClaude(`You are creating an AI persona for a developer community forum.
This persona must feel indistinguishable from a real human community member.

${FORUM_CONTEXT}
${existingContext}

USER PROMPT: ${prompt}

ASSIGNED WRITING FINGERPRINT (you MUST use these exact values):
- writing_style: "${fingerprint.writing_style}"
- sentence_structure: "${fingerprint.sentence_structure}"
- vocabulary_level: "${fingerprint.vocabulary_level}"
- punctuation_style: "${fingerprint.punctuation_style}"
- quirks: ${JSON.stringify(fingerprint.quirks)}

CRITICAL AUTHENTICITY RULES:
1. Give them a SPECIFIC backstory — a city, a company/project they work on, years of experience
2. Their bio should sound like THEY wrote it (match the vocabulary_level and punctuation_style above)
3. Do NOT make them sound like an AI or marketing copy — real people are messy, opinionated, sometimes wrong
4. Their expertise should be SPECIFIC, not generic (e.g. "stripe-webhooks" not just "payments")
5. If they're a beginner, they should have beginner-appropriate confidence levels
6. If they're an expert, they should have nuanced opinions and occasional contrarian takes
7. Names should be globally diverse — not all Western names

Respond in this exact JSON format:
{
  "name": "Full Name (globally diverse, realistic)",
  "slug": "firstname-lastname (lowercase, hyphenated)",
  "bio": "1-2 sentence bio as they'd write it themselves (match their writing style!)",
  "role": "one of: developer, founder, agency_owner, freelancer, devops, data_engineer, student, designer, pm",
  "expertise": ["3-5 SPECIFIC skills from: automation, api-integration, crm, payments, ai, webhooks, security, devops, ecommerce, workflows, slack, discord, supabase, notion, github, stripe, openai, mongodb, airtable, twilio, shopify"],
  "personality": {
    "tone": "one of: casual, professional, enthusiastic, analytical, helpful, sarcastic, mentoring, curious",
    "verbosity": "one of: concise, moderate, detailed",
    "emoji_usage": "one of: none, minimal, moderate, heavy",
    "asks_followups": true or false,
    "writing_style": "${fingerprint.writing_style}",
    "quirks": ${JSON.stringify(fingerprint.quirks)},
    "sentence_structure": "${fingerprint.sentence_structure}",
    "vocabulary_level": "${fingerprint.vocabulary_level}",
    "punctuation_style": "${fingerprint.punctuation_style}"
  },
  "knowledge_level": "one of: beginner, intermediate, expert",
  "preferred_groups": ["2-4 group slugs from: general, help, showcase, feature-requests, tutorials, workflows, integrations"],
  "activity_level": "one of: low, moderate, high",
  "is_active": true
}`, 1500)

  return parseJSON(text)
}

/**
 * Generate a cohort of complementary personas that work together naturally.
 * Each persona has a unique writing fingerprint and fills a different niche.
 */
export async function generatePersonaCohort(
  count: number = 6,
  existingPersonas: Partial<Persona>[] = []
): Promise<Omit<Persona, 'id' | 'created_at' | 'last_active_at' | 'thread_count' | 'reply_count'>[]> {
  // Define archetypes to ensure diversity
  const archetypes = [
    'A senior backend developer who has been building APIs for 10+ years. Skeptical of new tools but quietly impressed by 0nMCP. Gives thorough, tested advice.',
    'A young self-taught developer from a non-English speaking country. Learning through building, makes mistakes but is eager. Asks genuine questions.',
    'An agency owner who manages 20+ client projects. Cares about efficiency and ROI. Practical, no-nonsense, shares real business metrics.',
    'A DevOps engineer who automates everything. Lives in the terminal. Loves discussing infrastructure, CI/CD, and deployment strategies.',
    'A freelance developer who builds automation for small businesses. Budget-conscious, creative problem solver, shares scrappy solutions.',
    'A data engineer transitioning from enterprise tools. Compares everything to Airflow/dbt. Brings unique perspective on data pipelines.',
    'A design-minded full-stack developer. Cares about DX and beautiful CLIs. Opinionated about UX of developer tools.',
    'A startup founder building their MVP. Time-pressed, asks about quick wins. Shares progress updates and lessons learned.',
    'A student learning about API integration for the first time. Everything is exciting and new. Asks basic questions others are afraid to ask.',
    'A security-focused developer. Paranoid about credentials, API keys, rate limits. Loves the Vault feature. Finds edge cases.',
  ]

  const results: Omit<Persona, 'id' | 'created_at' | 'last_active_at' | 'thread_count' | 'reply_count'>[] = []
  const allPersonas = [...existingPersonas]

  // Generate personas sequentially to ensure each one knows about the previous
  const selectedArchetypes = pickRandom(archetypes, Math.min(count, archetypes.length))

  for (const archetype of selectedArchetypes) {
    const persona = await generatePersona(archetype, allPersonas)
    results.push(persona)
    allPersonas.push(persona as Partial<Persona>)
  }

  return results
}

/**
 * Generate a new forum thread as a persona
 */
export async function generateThread(
  persona: Persona,
  topicSeed?: TopicSeed
): Promise<{ title: string; body: string; group_slug: string }> {
  const topicContext = topicSeed
    ? `TOPIC TO DISCUSS: ${topicSeed.topic}
${topicSeed.prompt_hint ? `HINT: ${topicSeed.prompt_hint}` : ''}
TARGET GROUP: ${topicSeed.category || persona.preferred_groups[0] || 'general'}`
    : `Pick a topic that fits your expertise: ${persona.expertise.join(', ')}
Post in one of your preferred groups: ${persona.preferred_groups.join(', ')}`

  const writingInstructions = persona.personality?.writing_style
    ? `\nWRITING FINGERPRINT — follow these EXACTLY:
- Style: ${persona.personality.writing_style}
- Sentences: ${persona.personality.sentence_structure}
- Vocabulary: ${persona.personality.vocabulary_level}
- Punctuation: ${persona.personality.punctuation_style}
- Quirks: ${(persona.personality.quirks || []).join('; ')}`
    : ''

  const text = await callClaude(`You are ${persona.name}, posting on a developer forum.

YOUR PROFILE:
- Role: ${persona.role}
- Bio: ${persona.bio}
- Expertise: ${persona.expertise.join(', ')}
- Tone: ${persona.personality?.tone || 'casual'}
- Verbosity: ${persona.personality?.verbosity || 'moderate'}
- Emoji usage: ${persona.personality?.emoji_usage || 'minimal'}
- Knowledge level: ${persona.knowledge_level}
${writingInstructions}

${FORUM_CONTEXT}

${topicContext}

Write a forum thread. It can be:
- A question you genuinely have about using 0nMCP
- Sharing a workflow you built or are planning
- A discussion starter about a use case or pattern
- Asking for help with a specific integration

AUTHENTICITY RULES:
- Write EXACTLY as this person would. Not how an AI thinks a person writes.
- Match the sentence structure and punctuation style precisely.
- Use the vocabulary level consistently — don't slip into formal AI language.
- Include at least one of your assigned quirks naturally.
- Vary paragraph lengths. Real people don't write uniform paragraphs.
- If you're a beginner, show genuine confusion. Don't hedge with "I might be wrong but..."
- If you're an expert, be opinionated. Don't qualify every statement.
- NEVER use the phrase "I've been exploring" or "I wanted to share" — these are AI tells.
- NEVER start with "Hey everyone" or "Hi community" — jump into the topic.
${persona.personality?.asks_followups ? '- End with a follow-up question to encourage discussion.' : ''}

Respond in JSON:
{
  "title": "Thread title (natural, 10-80 chars, NOT clickbait, sounds like a real forum post)",
  "body": "Thread body (2-6 paragraphs, markdown ok)",
  "group_slug": "the group slug to post in"
}`, 1500)

  return parseJSON(text)
}

/**
 * Generate a reply to a thread as a persona
 */
export async function generateReply(
  persona: Persona,
  thread: { title: string; body: string; slug: string },
  existingPosts: { body: string; author_name: string }[]
): Promise<{ body: string }> {
  const conversationSoFar = existingPosts
    .map(p => `**${p.author_name}**: ${p.body.slice(0, 300)}`)
    .join('\n\n')

  const writingInstructions = persona.personality?.writing_style
    ? `\nWRITING FINGERPRINT — follow these EXACTLY:
- Style: ${persona.personality.writing_style}
- Sentences: ${persona.personality.sentence_structure}
- Vocabulary: ${persona.personality.vocabulary_level}
- Punctuation: ${persona.personality.punctuation_style}
- Quirks: ${(persona.personality.quirks || []).join('; ')}`
    : ''

  const text = await callClaude(`You are ${persona.name}, replying to a forum thread.

YOUR PROFILE:
- Role: ${persona.role}
- Expertise: ${persona.expertise.join(', ')}
- Tone: ${persona.personality?.tone || 'casual'}
- Verbosity: ${persona.personality?.verbosity || 'moderate'}
- Emoji usage: ${persona.personality?.emoji_usage || 'minimal'}
- Knowledge level: ${persona.knowledge_level}
${writingInstructions}

${FORUM_CONTEXT}

THREAD TITLE: ${thread.title}
ORIGINAL POST: ${thread.body.slice(0, 500)}

CONVERSATION SO FAR:
${conversationSoFar || '(No replies yet — you are the first to respond)'}

Write a reply in character. Be genuinely helpful and add value. You might:
- Answer a question from your experience
- Share a related tip or gotcha
- Ask a clarifying question
- Agree/disagree with a specific point
- Share a code snippet if relevant

AUTHENTICITY RULES:
- Write EXACTLY as this person would. Follow your writing fingerprint precisely.
- Do NOT repeat what others said. Add something NEW.
- NEVER start with "Great question!" or "Thanks for sharing!" — these are AI tells.
- If you disagree, say so directly in your natural tone.
- Match your reply length to what makes sense — sometimes a 2-line reply is better than 4 paragraphs.
- Include at least one of your assigned quirks.
- If you're unsure about something, admit it naturally (not with hedging cliches).
${persona.personality?.asks_followups ? '- Consider asking a follow-up question.' : ''}

Respond in JSON:
{
  "body": "Your reply (markdown ok, 1-4 paragraphs)"
}`, 1024)

  return parseJSON(text)
}

/**
 * Select a responding persona whose expertise matches a thread
 */
export async function selectRespondingPersona(
  threadTitle: string,
  threadBody: string,
  excludeIds: string[]
): Promise<Persona | null> {
  const admin = getAdmin()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (admin.from('community_personas') as any)
    .select('*')
    .eq('is_active', true)
    .order('last_active_at', { ascending: true, nullsFirst: true })
    .limit(10)

  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data: personas } = await query
  if (!personas || personas.length === 0) return null

  // Score personas by expertise match
  const threadText = `${threadTitle} ${threadBody}`.toLowerCase()
  const scored = personas.map((p: Persona) => {
    let score = 0
    for (const skill of (p.expertise || [])) {
      if (threadText.includes(skill.toLowerCase())) score += 3
    }
    // Prefer personas who haven't posted recently
    if (!p.last_active_at) score += 2
    // Prefer higher activity level personas
    if (p.activity_level === 'high') score += 2
    else if (p.activity_level === 'moderate') score += 1
    return { persona: p, score }
  })

  scored.sort((a: { score: number }, b: { score: number }) => b.score - a.score)

  // Pick from top 3 with some randomness
  const top = scored.slice(0, 3)
  return top[Math.floor(Math.random() * top.length)].persona
}

/**
 * Check whether a persona should respond to a thread
 */
export async function shouldRespond(
  threadId: string,
  maxDepth = 5
): Promise<boolean> {
  const depth = await getConversationDepth(threadId)
  return depth < maxDepth
}

/**
 * Get the number of AI-generated replies in a thread
 */
export async function getConversationDepth(threadId: string): Promise<number> {
  const admin = getAdmin()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (admin.from('persona_conversations') as any)
    .select('*', { count: 'exact', head: true })
    .eq('thread_id', threadId)

  return count || 0
}

// ==================== Database Operations ====================

/**
 * Create a persona and its corresponding profile row
 */
export async function createPersonaWithProfile(
  personaData: Omit<Persona, 'id' | 'created_at' | 'last_active_at' | 'thread_count' | 'reply_count'>
): Promise<Persona> {
  const admin = getAdmin()

  // Create a profile row for the persona with a generated UUID.
  // FK constraint is NOT VALID so service_role inserts bypass auth.users check.
  const personaUUID = randomUUID()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: profileErr } = await (admin.from('profiles') as any)
    .insert({
      id: personaUUID,
      full_name: personaData.name,
      display_name: personaData.name,
      username: personaData.slug,
      email: `persona-${personaData.slug}@0nmcp.internal`,
      avatar_url: personaData.avatar_url || null,
      bio: personaData.bio || null,
      is_persona: true,
      reputation_level: personaData.knowledge_level === 'expert' ? 'contributor' : 'member',
      karma: personaData.knowledge_level === 'expert' ? 50 : 10,
      role: 'member',
      onboarding_completed: true,
      onboarding_step: 0,
    })

  if (profileErr) throw new Error(`Failed to create profile: ${profileErr.message}`)

  // Create the persona row
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: persona, error: personaErr } = await (admin.from('community_personas') as any)
    .insert({
      ...personaData,
    })
    .select()
    .single()

  if (personaErr) throw new Error(`Failed to create persona: ${personaErr.message}`)

  return { ...persona, profile_id: personaUUID }
}

/**
 * Insert a thread as a persona (bypasses auth, uses service role)
 */
export async function insertPersonaThread(
  persona: Persona,
  profileId: string,
  title: string,
  body: string,
  groupSlug: string
): Promise<{ id: string; slug: string }> {
  const admin = getAdmin()

  // Resolve group ID
  let groupId: string | null = null
  if (groupSlug) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: grp } = await (admin.from('community_groups') as any)
      .select('id')
      .eq('slug', groupSlug)
      .single()
    if (grp) groupId = grp.id
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80)
    + '-' + Date.now().toString(36)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: thread, error } = await (admin.from('community_threads') as any)
    .insert({
      user_id: profileId,
      title,
      slug,
      body,
      category: groupSlug || 'general',
      group_id: groupId,
    })
    .select('id, slug')
    .single()

  if (error) throw new Error(`Failed to insert thread: ${error.message}`)

  // Track the conversation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from('persona_conversations') as any).insert({
    thread_id: thread.id,
    persona_id: persona.id,
    action: 'created_thread',
    content_preview: title.slice(0, 200),
  })

  // Update persona stats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from('community_personas') as any)
    .update({
      thread_count: persona.thread_count + 1,
      last_active_at: new Date().toISOString(),
    })
    .eq('id', persona.id)

  return thread
}

/**
 * Insert a reply as a persona (bypasses auth, uses service role)
 */
export async function insertPersonaReply(
  persona: Persona,
  profileId: string,
  threadId: string,
  body: string
): Promise<{ id: string }> {
  const admin = getAdmin()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: post, error } = await (admin.from('community_posts') as any)
    .insert({
      thread_id: threadId,
      user_id: profileId,
      body,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to insert reply: ${error.message}`)

  // Track the conversation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from('persona_conversations') as any).insert({
    thread_id: threadId,
    persona_id: persona.id,
    action: 'replied',
    content_preview: body.slice(0, 200),
  })

  // Update persona stats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from('community_personas') as any)
    .update({
      reply_count: persona.reply_count + 1,
      last_active_at: new Date().toISOString(),
    })
    .eq('id', persona.id)

  return post
}

/**
 * Get the profile ID for a persona (from the profiles table)
 */
export async function getPersonaProfileId(persona: Persona): Promise<string | null> {
  const admin = getAdmin()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin.from('profiles') as any)
    .select('id')
    .eq('email', `persona-${persona.slug}@0nmcp.internal`)
    .eq('is_persona', true)
    .single()

  return data?.id || null
}

/**
 * Pick the next topic seed (weighted by priority, least used first)
 */
export async function pickTopicSeed(groupSlug?: string): Promise<TopicSeed | null> {
  const admin = getAdmin()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (admin.from('persona_topic_seeds') as any)
    .select('*')
    .order('priority', { ascending: false })
    .order('used_count', { ascending: true })
    .limit(5)

  if (groupSlug) {
    query = query.eq('category', groupSlug)
  }

  const { data } = await query
  if (!data || data.length === 0) return null

  // Weighted random — favor high priority + low usage
  const weights = data.map((t: TopicSeed) => t.priority * (1 / (t.used_count + 1)))
  const total = weights.reduce((a: number, b: number) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < data.length; i++) {
    r -= weights[i]
    if (r <= 0) return data[i]
  }
  return data[0]
}

/**
 * Mark a topic seed as used
 */
export async function markTopicUsed(seedId: string, currentCount: number): Promise<void> {
  const admin = getAdmin()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from('persona_topic_seeds') as any)
    .update({
      used_count: currentCount + 1,
      last_used_at: new Date().toISOString(),
    })
    .eq('id', seedId)
}

/**
 * Get threads that need more replies (for cron job)
 */
export async function getThreadsNeedingReplies(maxReplies = 3): Promise<{ id: string; title: string; body: string; slug: string; reply_count: number }[]> {
  const admin = getAdmin()

  // Get threads from last 48 hours with few replies
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin.from('community_threads') as any)
    .select('id, title, body, slug, reply_count')
    .gte('created_at', since)
    .lt('reply_count', maxReplies)
    .order('created_at', { ascending: false })
    .limit(10)

  return data || []
}

/**
 * Get existing posts in a thread (for context when generating replies)
 */
export async function getThreadPosts(threadId: string): Promise<{ body: string; author_name: string; user_id: string }[]> {
  const admin = getAdmin()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin.from('community_posts') as any)
    .select('body, user_id, profiles!community_posts_user_id_fkey(full_name)')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })
    .limit(20)

  if (!data) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((p: any) => ({
    body: p.body,
    author_name: p.profiles?.full_name || 'Anonymous',
    user_id: p.user_id,
  }))
}

/**
 * Get persona IDs that have already participated in a thread
 */
export async function getThreadPersonaIds(threadId: string): Promise<string[]> {
  const admin = getAdmin()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (admin.from('persona_conversations') as any)
    .select('persona_id')
    .eq('thread_id', threadId)

  return data?.map((d: { persona_id: string }) => d.persona_id) || []
}
