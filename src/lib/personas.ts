/**
 * 0nMCP Persona Engine — AI Forum Agents
 * Generates personas, threads, and replies for organic forum activity
 */

import { createClient } from '@supabase/supabase-js'

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
0nMCP connects 550+ tools across 26 services (Stripe, Slack, Discord, OpenAI, Supabase, Notion, GitHub, Shopify, Twilio, etc).
One npm install, one config file. The .0n Standard uses SWITCH files for portable configuration.
Key features: CLI tool, Vault (encrypted credentials), Engine (portable AI Brain bundles), Workflow Runtime.
Forum groups: general, help, showcase, feature-requests, bug-reports, tutorials, workflows, integrations, off-topic.
The community is technical — developers, agency owners, founders, automation builders.`

// ==================== CRM Community Cross-Post ====================

const COMMUNITY_POST_WEBHOOK = 'https://services.leadconnectorhq.com/hooks/nphConTwfHcVE1oA0uep/webhook-trigger/d523fafd-e35d-47a3-ac34-070edd728ff7'

/**
 * Cross-post a persona's thread to the CRM community "the-0nboard"
 * Fires the inbound webhook which triggers the community post workflow
 */
export async function crossPostToCommunity(data: {
  title: string
  content: string
  author: string
  group?: string
  forumUrl?: string
}): Promise<boolean> {
  try {
    // Append forum link to content if available
    const fullContent = data.forumUrl
      ? `${data.content}\n\n---\nDiscuss on the forum: https://0nmcp.com/forum/${data.forumUrl}`
      : data.content

    const res = await fetch(COMMUNITY_POST_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: data.title,
        content: fullContent,
        author: data.author,
        group: data.group || 'the-0nboard',
        channel: 'general',
        type: 'community_post',
        source: 'persona_engine',
        timestamp: new Date().toISOString(),
      }),
    })

    if (res.ok) {
      console.log(`[personas] Cross-posted to community: "${data.title}" by ${data.author}`)
      return true
    }
    console.warn(`[personas] Community cross-post returned ${res.status}`)
    return false
  } catch (err) {
    console.error('[personas] crossPostToCommunity error:', err)
    return false
  }
}

// ==================== Core Functions ====================

/**
 * Generate a full persona profile from a description prompt
 */
export async function generatePersona(prompt: string): Promise<Omit<Persona, 'id' | 'created_at' | 'last_active_at' | 'thread_count' | 'reply_count'>> {
  const text = await callClaude(`You are creating an AI persona for a developer community forum.

${FORUM_CONTEXT}

USER PROMPT: ${prompt}

Generate a realistic forum persona. They should feel like a real community member — not a bot.
Give them a believable backstory, specific technical interests, and a distinct communication style.

Respond in this exact JSON format:
{
  "name": "Full Name (realistic, diverse)",
  "slug": "firstname-lastname (lowercase, hyphenated)",
  "bio": "1-2 sentence bio as they'd write it themselves",
  "role": "one of: developer, founder, agency_owner, freelancer, devops, data_engineer, student",
  "expertise": ["3-5 specific skills from: automation, api-integration, crm, payments, ai, webhooks, security, devops, ecommerce, workflows, slack, discord, supabase, notion, github"],
  "personality": {
    "tone": "one of: casual, professional, enthusiastic, analytical, helpful",
    "verbosity": "one of: concise, moderate, detailed",
    "emoji_usage": "one of: none, minimal, moderate",
    "asks_followups": true or false
  },
  "knowledge_level": "one of: beginner, intermediate, expert",
  "preferred_groups": ["2-4 group slugs from: general, help, showcase, feature-requests, tutorials, workflows, integrations"],
  "activity_level": "one of: low, moderate, high",
  "is_active": true
}`, 1024)

  return parseJSON(text)
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

  const text = await callClaude(`You are ${persona.name}, posting on a developer forum.

YOUR PROFILE:
- Role: ${persona.role}
- Bio: ${persona.bio}
- Expertise: ${persona.expertise.join(', ')}
- Tone: ${persona.personality?.tone || 'casual'}
- Verbosity: ${persona.personality?.verbosity || 'moderate'}
- Emoji usage: ${persona.personality?.emoji_usage || 'minimal'}
- Knowledge level: ${persona.knowledge_level}

${FORUM_CONTEXT}

${topicContext}

Write a forum thread. It can be:
- A question you genuinely have about using 0nMCP
- Sharing a workflow you built or are planning
- A discussion starter about a use case or pattern
- Asking for help with a specific integration

Be authentic. Write as this person would actually write. Don't be overly positive or promotional.
If you're a beginner, ask beginner questions. If you're an expert, share nuanced insights.
${persona.personality?.asks_followups ? 'End with a follow-up question to encourage discussion.' : ''}

Respond in JSON:
{
  "title": "Thread title (natural, 10-80 chars)",
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

  const text = await callClaude(`You are ${persona.name}, replying to a forum thread.

YOUR PROFILE:
- Role: ${persona.role}
- Expertise: ${persona.expertise.join(', ')}
- Tone: ${persona.personality?.tone || 'casual'}
- Verbosity: ${persona.personality?.verbosity || 'moderate'}
- Emoji usage: ${persona.personality?.emoji_usage || 'minimal'}
- Knowledge level: ${persona.knowledge_level}

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

Do NOT repeat what others said. Add something NEW to the conversation.
Keep it natural — vary length based on what you're saying.
${persona.personality?.asks_followups ? 'Consider asking a follow-up question.' : ''}

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

  // Create a profile row so the persona shows up in forum joins
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile, error: profileErr } = await (admin.from('profiles') as any)
    .insert({
      full_name: personaData.name,
      email: `persona-${personaData.slug}@0nmcp.internal`,
      avatar_url: personaData.avatar_url || null,
      bio: personaData.bio || null,
      is_persona: true,
      reputation_level: personaData.knowledge_level === 'expert' ? 'contributor' : 'member',
      karma: personaData.knowledge_level === 'expert' ? 50 : 10,
    })
    .select('id')
    .single()

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

  return { ...persona, profile_id: profile.id }
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
