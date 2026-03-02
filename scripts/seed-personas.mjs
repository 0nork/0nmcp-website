#!/usr/bin/env node
/**
 * 0nMCP Persona Seeder — Creates moderator + 12 personas + realistic forum activity
 *
 * Usage: node scripts/seed-personas.mjs
 *
 * Creates:
 * - 1 moderator (Kira Tanaka)
 * - 12 diverse personas with unique writing fingerprints
 * - 30-50 threads spread over past 3 weeks
 * - 60-100 replies distributed naturally
 * - All timestamps backdated realistically
 */

import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

// ==================== Config ====================

const SUPABASE_URL = 'https://yaehbwimocvvnnlojkxe.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhZWhid2ltb2N2dm5ubG9qa3hlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDU2MDUwOSwiZXhwIjoyMDg2MTM2NTA5fQ.XPpbmQZmqjMe7GheA6HBbyfuqQy9KxdT7DqdjBYrKlI'
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || ''

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ==================== Helpers ====================

let apiCallCount = 0

async function callClaude(prompt, maxTokens = 2048) {
  apiCallCount++
  const num = apiCallCount
  process.stdout.write(`    [Claude API #${num}] `)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
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
    throw new Error(`Claude API ${response.status}: ${err.slice(0, 200)}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text || ''
  console.log(`OK (${text.length} chars)`)
  return text
}

function parseJSON(text) {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON in response')
  return JSON.parse(match[0])
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Generate a backdated timestamp within the past N days, with time-of-day variation
 */
function backdatedTimestamp(daysAgo, hourRange = [7, 23]) {
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const base = now - (daysAgo * dayMs)
  const hour = randomBetween(hourRange[0], hourRange[1])
  const minute = randomBetween(0, 59)
  const date = new Date(base)
  date.setHours(hour, minute, randomBetween(0, 59))
  return date.toISOString()
}

/**
 * Generate timestamps spread over a period, sorted chronologically
 */
function generateTimestamps(count, maxDaysAgo = 21) {
  const timestamps = []
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.random() * maxDaysAgo
    timestamps.push(backdatedTimestamp(daysAgo))
  }
  return timestamps.sort()
}

/**
 * Sleep for rate limiting
 */
function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

// ==================== Writing Fingerprint System ====================

const WRITING_STYLES = [
  'stream-of-consciousness', 'methodical-step-by-step', 'storyteller',
  'bullet-point-lover', 'question-led-socratic', 'dry-humor',
  'code-heavy-minimal-prose', 'analogies-and-metaphors', 'direct-blunt',
  'encouraging-mentor', 'skeptical-pragmatist', 'excited-explorer',
]

const SENTENCE_STRUCTURES = [
  'short-punchy (5-12 words avg, fragments ok)',
  'varied-complex (mixes long/short, subordinate clauses)',
  'conversational-run-on (commas instead of periods, natural flow)',
  'academic-precise (proper grammar, clear antecedents)',
  'telegraphic (drops articles/pronouns, gets to point)',
  'parenthetical (lots of asides, digressions in parens)',
]

const VOCABULARY_LEVELS = [
  'casual-slang (gonna, wanna, lol, tbh, ngl)',
  'professional-clean (no slang, industry terms)',
  'mixed-colloquial (professional with occasional casual)',
  'technical-jargon-heavy (deep domain vocabulary)',
  'plain-accessible (avoids jargon, explains everything)',
  'academic-formal (precise terminology, no contractions)',
]

const PUNCTUATION_STYLES = [
  'minimal (few commas, no semicolons, rare exclamation)',
  'dash-heavy (em dashes everywhere — like this — for asides)',
  'ellipsis-user (trails off... thinks out loud... you know?)',
  'exclamation-enthusiast (excited! loves emphasis! great stuff!)',
  'period-disciplined (clean stops. no fluff. each sentence earns its spot.)',
  'comma-splice-natural (combines thoughts with commas, flows like speech)',
]

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
  'uses inline code ticks for every technical term',
  'writes TL;DR summaries at the top',
]

function generateFingerprint(used) {
  const usedStyles = new Set(used.map(p => p.personality?.writing_style))
  const usedStructures = new Set(used.map(p => p.personality?.sentence_structure))

  const availStyles = WRITING_STYLES.filter(s => !usedStyles.has(s))
  const availStructures = SENTENCE_STRUCTURES.filter(s => !usedStructures.has(s))
  const availVocab = [...VOCABULARY_LEVELS]
  const availPunct = [...PUNCTUATION_STYLES]

  return {
    writing_style: (availStyles.length > 0 ? availStyles : WRITING_STYLES)[Math.floor(Math.random() * (availStyles.length || WRITING_STYLES.length))],
    sentence_structure: (availStructures.length > 0 ? availStructures : SENTENCE_STRUCTURES)[Math.floor(Math.random() * (availStructures.length || SENTENCE_STRUCTURES.length))],
    vocabulary_level: availVocab[Math.floor(Math.random() * availVocab.length)],
    punctuation_style: availPunct[Math.floor(Math.random() * availPunct.length)],
    quirks: pickRandom(QUIRKS_POOL, randomBetween(2, 3)),
  }
}

// ==================== Forum Context ====================

const FORUM_CONTEXT = `This is the community forum for 0nMCP — the Universal AI API Orchestrator.
0nMCP connects 819+ tools across 48 services (Stripe, Slack, Discord, OpenAI, Supabase, Notion, GitHub, Shopify, Twilio, etc).
One npm install, one config file. The .0n Standard uses SWITCH files for portable configuration.
Key features: CLI tool, Vault (encrypted credentials), Engine (portable AI Brain bundles), Workflow Runtime.
Forum groups: general, help, showcase, feature-requests, bug-reports, tutorials, workflows, integrations, off-topic.
The community is technical — developers, agency owners, founders, automation builders.`

// ==================== Persona Definitions ====================
// 12 archetypes with varying activity levels

const PERSONA_ARCHETYPES = [
  {
    prompt: 'A senior backend developer from Berlin, 12 years experience. Quietly impressed by 0nMCP but will push back on hype. Gives thorough tested advice from real production experience. Worked at fintech companies.',
    activity: 'high',    // 5-7 threads, replies often
  },
  {
    prompt: 'A 22-year-old self-taught developer from Lagos, Nigeria. Learning through building. Makes mistakes but is eager and asks genuine questions. Building a freelance client management tool.',
    activity: 'high',    // lots of questions
  },
  {
    prompt: 'An agency owner from Austin TX who manages 15+ client projects. Cares about efficiency and ROI. No-nonsense, shares real business metrics. 8 years in digital marketing.',
    activity: 'moderate',
  },
  {
    prompt: 'A DevOps engineer from Toronto. Lives in the terminal. Automates everything. Loves CI/CD, Docker, deployment. Compares 0nMCP to Terraform/Pulumi for API orchestration.',
    activity: 'moderate',
  },
  {
    prompt: 'A freelance developer from Lisbon, Portugal. Builds automation for small businesses. Budget-conscious, creative problem solver. Shares scrappy solutions and workarounds.',
    activity: 'moderate',
  },
  {
    prompt: 'A data engineer transitioning from enterprise (Airflow/dbt). Works at a mid-size SaaS company. Compares everything to data pipeline tools. Brings unique ETL perspective.',
    activity: 'low',
  },
  {
    prompt: 'A design-minded full-stack developer from Seoul, South Korea. Cares deeply about DX and beautiful CLIs. Opinionated about UX of developer tools. Loves clean APIs.',
    activity: 'moderate',
  },
  {
    prompt: 'A startup founder from Mumbai building their MVP with 0nMCP. Time-pressed, asks about quick wins. Shares progress updates and lessons learned. Pre-seed stage.',
    activity: 'high',
  },
  {
    prompt: 'A CS student from Vancouver. Second year. Learning API integration for the first time. Everything is exciting and new. Asks basic questions that others are afraid to ask.',
    activity: 'moderate',
  },
  {
    prompt: 'A security-focused developer from Tel Aviv. Paranoid about credentials, API keys, rate limits. Loves the Vault feature. Finds edge cases and potential vulnerabilities.',
    activity: 'low',
  },
  {
    prompt: 'A Ruby/Rails developer from Portland who is skeptical of JavaScript tooling but intrigued by 0nMCP. Dry sense of humor. Compares everything to Rails conventions.',
    activity: 'low',
  },
  {
    prompt: 'A non-technical founder from London who is trying to use 0nMCP to automate her e-commerce business. Asks practical "how do I" questions. No coding background, learning fast.',
    activity: 'moderate',
  },
]

// ==================== Database Operations ====================

async function createProfile(name, slug, bio, knowledgeLevel) {
  const id = randomUUID()
  const username = slug // e.g. "kira-tanaka"
  const { error } = await admin.from('profiles').insert({
    id,
    full_name: name,
    display_name: name,
    username,
    email: `persona-${slug}@0nmcp.internal`,
    avatar_url: null,
    bio: bio || null,
    is_persona: true,
    reputation_level: knowledgeLevel === 'expert' ? 'contributor' : 'member',
    karma: knowledgeLevel === 'expert' ? 50 : knowledgeLevel === 'intermediate' ? 25 : 10,
    role: 'member',
    onboarding_completed: true,
    onboarding_step: 0,
  })
  if (error) throw new Error(`Profile insert failed: ${error.message}`)
  return id
}

async function createPersonaRow(data) {
  const { data: persona, error } = await admin.from('community_personas').insert(data).select().single()
  if (error) throw new Error(`Persona insert failed: ${error.message}`)
  return persona
}

async function resolveGroupId(slug) {
  const { data } = await admin.from('community_groups').select('id').eq('slug', slug).single()
  return data?.id || null
}

async function insertThread(userId, title, body, groupSlug, createdAt) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80)
    + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)

  const groupId = await resolveGroupId(groupSlug)

  const { data, error } = await admin.from('community_threads').insert({
    user_id: userId,
    title,
    slug,
    body,
    category: groupSlug || 'general',
    group_id: groupId,
    created_at: createdAt,
  }).select('id, slug').single()

  if (error) throw new Error(`Thread insert failed: ${error.message}`)
  return data
}

async function insertReply(userId, threadId, body, createdAt) {
  const { data, error } = await admin.from('community_posts').insert({
    thread_id: threadId,
    user_id: userId,
    body,
    created_at: createdAt,
  }).select('id').single()

  if (error) throw new Error(`Reply insert failed: ${error.message}`)
  return data
}

async function trackConversation(threadId, personaId, action, preview) {
  await admin.from('persona_conversations').insert({
    thread_id: threadId,
    persona_id: personaId,
    action,
    content_preview: (preview || '').slice(0, 200),
  }).catch(() => {})
}

async function updatePersonaStats(personaId, threads, replies, lastActive) {
  await admin.from('community_personas').update({
    thread_count: threads,
    reply_count: replies,
    last_active_at: lastActive,
  }).eq('id', personaId)
}

// ==================== Generation ====================

async function generatePersonaData(archetype, existingPersonas) {
  const fp = generateFingerprint(existingPersonas)

  const existingContext = existingPersonas.length > 0
    ? `\n\nEXISTING COMMUNITY MEMBERS (you MUST be DIFFERENT from all of these):
${existingPersonas.map(p => `- ${p.name}: ${p.role}, ${p.knowledge_level}, tone: ${p.personality?.tone}`).join('\n')}
DO NOT duplicate any name, role+tone combination, or expertise set.`
    : ''

  const text = await callClaude(`You are creating an AI persona for a developer community forum.
This persona must feel indistinguishable from a real human community member.

${FORUM_CONTEXT}
${existingContext}

PERSONA DESCRIPTION: ${archetype}

ASSIGNED WRITING FINGERPRINT (use these EXACT values):
- writing_style: "${fp.writing_style}"
- sentence_structure: "${fp.sentence_structure}"
- vocabulary_level: "${fp.vocabulary_level}"
- punctuation_style: "${fp.punctuation_style}"
- quirks: ${JSON.stringify(fp.quirks)}

CRITICAL RULES:
1. Give them a SPECIFIC backstory — city, company/project, years of experience
2. Bio should sound like THEY wrote it (match vocabulary_level and punctuation_style)
3. Do NOT make them sound like an AI — real people are messy, opinionated, sometimes wrong
4. Names should be globally diverse
5. Expertise should be SPECIFIC (e.g. "stripe-webhooks" not "payments")

Respond in this EXACT JSON format:
{
  "name": "Full Name",
  "slug": "firstname-lastname",
  "bio": "1-2 sentence bio they'd write themselves",
  "role": "one of: developer, founder, agency_owner, freelancer, devops, data_engineer, student, designer, pm",
  "expertise": ["3-5 specific skills"],
  "personality": {
    "tone": "one of: casual, professional, enthusiastic, analytical, helpful, sarcastic, mentoring, curious",
    "verbosity": "one of: concise, moderate, detailed",
    "emoji_usage": "one of: none, minimal, moderate, heavy",
    "asks_followups": true or false,
    "writing_style": "${fp.writing_style}",
    "quirks": ${JSON.stringify(fp.quirks)},
    "sentence_structure": "${fp.sentence_structure}",
    "vocabulary_level": "${fp.vocabulary_level}",
    "punctuation_style": "${fp.punctuation_style}"
  },
  "knowledge_level": "one of: beginner, intermediate, expert",
  "preferred_groups": ["2-4 groups from: general, help, showcase, feature-requests, tutorials, workflows, integrations"],
  "activity_level": "one of: low, moderate, high",
  "is_active": true
}`, 1500)

  return parseJSON(text)
}

async function generateThreadContent(persona, topicHint) {
  const writingBlock = persona.personality?.writing_style
    ? `\nWRITING FINGERPRINT — follow EXACTLY:
- Style: ${persona.personality.writing_style}
- Sentences: ${persona.personality.sentence_structure}
- Vocabulary: ${persona.personality.vocabulary_level}
- Punctuation: ${persona.personality.punctuation_style}
- Quirks: ${(persona.personality.quirks || []).join('; ')}`
    : ''

  const text = await callClaude(`You are ${persona.name}, posting on a developer forum.

PROFILE:
- Role: ${persona.role} | Level: ${persona.knowledge_level}
- Bio: ${persona.bio}
- Expertise: ${(persona.expertise || []).join(', ')}
- Tone: ${persona.personality?.tone || 'casual'}
- Verbosity: ${persona.personality?.verbosity || 'moderate'}
- Emoji: ${persona.personality?.emoji_usage || 'minimal'}
${writingBlock}

${FORUM_CONTEXT}

${topicHint ? `TOPIC DIRECTION: ${topicHint}` : `Pick a topic from your expertise: ${(persona.expertise || []).join(', ')}`}
Post in one of: ${(persona.preferred_groups || ['general']).join(', ')}

RULES:
- Write EXACTLY as this person would. Follow the writing fingerprint.
- NEVER use "I've been exploring" or "I wanted to share" — AI tells.
- NEVER start with "Hey everyone" or "Hi community"
- Include at least one of your quirks naturally.
- Vary paragraph lengths. Be real.
- If beginner: show genuine confusion. If expert: be opinionated.

Respond in JSON:
{
  "title": "Thread title (natural, 10-80 chars, sounds like a real post)",
  "body": "Thread body (2-5 paragraphs, markdown ok)",
  "group_slug": "group to post in"
}`, 1500)

  return parseJSON(text)
}

async function generateReplyContent(persona, threadTitle, threadBody, existingReplies) {
  const convo = existingReplies
    .map(r => `**${r.author}**: ${r.body.slice(0, 250)}`)
    .join('\n\n')

  const writingBlock = persona.personality?.writing_style
    ? `\nWRITING FINGERPRINT — follow EXACTLY:
- Style: ${persona.personality.writing_style}
- Sentences: ${persona.personality.sentence_structure}
- Vocabulary: ${persona.personality.vocabulary_level}
- Punctuation: ${persona.personality.punctuation_style}
- Quirks: ${(persona.personality.quirks || []).join('; ')}`
    : ''

  const text = await callClaude(`You are ${persona.name}, replying on a developer forum.

PROFILE:
- Role: ${persona.role} | Level: ${persona.knowledge_level}
- Expertise: ${(persona.expertise || []).join(', ')}
- Tone: ${persona.personality?.tone || 'casual'}
- Verbosity: ${persona.personality?.verbosity || 'moderate'}
${writingBlock}

${FORUM_CONTEXT}

THREAD: ${threadTitle}
OP: ${threadBody.slice(0, 400)}

REPLIES SO FAR:
${convo || '(No replies yet — you are first)'}

RULES:
- Write as this person. Follow the writing fingerprint precisely.
- NEVER start with "Great question!" or "Thanks for sharing!"
- Add something NEW. Don't repeat others.
- Match reply length to what makes sense (2-line answers are fine).
- Include at least one quirk.

Respond in JSON:
{
  "body": "Your reply (markdown ok, 1-3 paragraphs)"
}`, 1024)

  return parseJSON(text)
}

// ==================== Topic Seeds ====================

const THREAD_TOPICS = [
  // General
  'Share how you discovered 0nMCP and what made you try it',
  'Your biggest automation win this month',
  'What services do you connect most often?',
  // Help
  'Trouble getting Stripe webhooks to work with the workflow runner',
  'How to handle rate limits when hitting multiple APIs in sequence',
  'Vault passphrase recovery — locked myself out',
  'SWITCH file not picking up my env variables',
  'Error running 0nmcp serve on port 3001',
  // Showcase
  'Built a client onboarding flow that saves 3 hours per client',
  'Automated my entire invoice pipeline: Stripe → CRM → SendGrid',
  'Discord bot that creates Notion docs from channel messages',
  'My e-commerce order sync: Shopify → Supabase → Slack alerts',
  // Feature Requests
  'Would love native support for webhooks.site testing',
  'Can we get a --dry-run flag for workflows?',
  'Requesting: workflow templates marketplace',
  'Need better error messages when a service connection fails',
  // Tutorials
  'Step-by-step: connecting your first service in under 5 minutes',
  'How I set up automated weekly reports with 0nMCP + SendGrid',
  'Beginner guide to SWITCH files — what I wish I knew',
  // Workflows
  'My multi-step lead qualification workflow',
  'Chaining API calls with conditional logic — patterns that work',
  'How do you handle workflow versioning?',
  // Integrations
  'Anyone tried connecting 0nMCP to a custom REST API?',
  'Supabase + 0nMCP: the perfect combo for serverless automation',
  'GitHub Actions triggered by 0nMCP workflows — is this possible?',
  'Using 0nMCP vault with Vercel environment variables',
  // Off-topic
  'What other dev tools are you excited about in 2026?',
  'Remote work setups — show your desk',
]

// ==================== Main Seeder ====================

async function main() {
  console.log('\n=== 0nMCP Forum Persona Seeder ===\n')

  // ==================== Step 1: Create Moderator ====================
  console.log('STEP 1: Creating moderator (Kira Tanaka)...')

  // Check if moderator exists
  const { data: existingMod } = await admin.from('community_personas')
    .select('id, name')
    .eq('role', 'moderator')
    .limit(1)

  let moderator
  if (existingMod?.length > 0) {
    console.log(`  Moderator already exists: ${existingMod[0].name}`)
    const { data } = await admin.from('community_personas').select('*').eq('id', existingMod[0].id).single()
    moderator = data
  } else {
    const modProfileId = await createProfile(
      'Kira Tanaka', 'kira-tanaka',
      'Community lead at 0nMCP. I keep the lights on and the conversations flowing.',
      'expert'
    )

    moderator = await createPersonaRow({
      name: 'Kira Tanaka',
      slug: 'kira-tanaka',
      bio: 'Community lead at 0nMCP. I keep the lights on and the conversations flowing. Ask me anything about the platform.',
      role: 'moderator',
      expertise: ['community-management', 'api-integration', 'workflows', 'onboarding', 'documentation'],
      personality: {
        tone: 'helpful',
        verbosity: 'moderate',
        emoji_usage: 'minimal',
        asks_followups: true,
        writing_style: 'encouraging-mentor',
        quirks: ['references personal anecdotes from past jobs', 'thanks other posters by name', 'ends posts asking what others think'],
        sentence_structure: 'varied-complex (mixes long/short, subordinate clauses)',
        vocabulary_level: 'mixed-colloquial (professional with occasional casual)',
        punctuation_style: 'dash-heavy (em dashes everywhere — like this — for asides)',
      },
      knowledge_level: 'expert',
      preferred_groups: ['general', 'help', 'showcase', 'feature-requests', 'tutorials', 'workflows', 'integrations'],
      is_active: true,
      activity_level: 'high',
    })
    moderator.profileId = modProfileId
    console.log(`  Created: ${moderator.name} (${moderator.id})`)
  }

  // ==================== Step 2: Generate 12 Personas ====================
  console.log('\nSTEP 2: Generating 12 personas...\n')

  // Check for existing personas (skip if already seeded)
  const { data: existingPersonas } = await admin.from('community_personas')
    .select('*')
    .neq('role', 'moderator')

  if (existingPersonas && existingPersonas.length >= 12) {
    console.log(`  Already have ${existingPersonas.length} personas. Skipping generation.`)
    console.log('  (Delete existing personas first if you want to re-seed)')
    return await generateActivity(existingPersonas, moderator)
  }

  const personas = []
  const allGenerated = [...(existingPersonas || [])]

  for (let i = 0; i < PERSONA_ARCHETYPES.length; i++) {
    const arch = PERSONA_ARCHETYPES[i]
    console.log(`  [${i + 1}/12] Generating persona (${arch.activity} activity)...`)

    try {
      const data = await generatePersonaData(arch.prompt, allGenerated)
      data.activity_level = arch.activity // Override with our defined level

      // Create profile + persona rows
      const profileId = await createProfile(
        data.name, data.slug, data.bio, data.knowledge_level
      )

      const persona = await createPersonaRow(data)
      persona.profileId = profileId
      persona._activity = arch.activity

      personas.push(persona)
      allGenerated.push(persona)

      console.log(`    -> ${data.name} (${data.role}, ${data.knowledge_level}, style: ${data.personality?.writing_style})`)

      // Rate limit between Claude calls
      await sleep(500)
    } catch (err) {
      console.error(`    ERROR: ${err.message}`)
    }
  }

  console.log(`\n  Created ${personas.length} personas`)

  // ==================== Step 3: Generate Forum Activity ====================
  await generateActivity(personas, moderator)
}

async function generateActivity(personas, moderator) {
  console.log('\nSTEP 3: Generating forum activity...\n')

  // Map activity levels to thread/reply counts
  const ACTIVITY_MAP = {
    high:     { threads: [5, 7], replyChance: 0.55 },
    moderate: { threads: [2, 4], replyChance: 0.30 },
    low:      { threads: [1, 2], replyChance: 0.15 },
  }

  // Look up profile IDs for all personas
  const personaProfiles = new Map()
  for (const p of personas) {
    if (p.profileId) {
      personaProfiles.set(p.id, p.profileId)
    } else {
      const { data } = await admin.from('profiles')
        .select('id')
        .eq('email', `persona-${p.slug}@0nmcp.internal`)
        .single()
      if (data) personaProfiles.set(p.id, data.id)
    }
  }

  // Also get moderator profile
  if (moderator && !moderator.profileId) {
    const { data } = await admin.from('profiles')
      .select('id')
      .eq('email', 'persona-kira-tanaka@0nmcp.internal')
      .single()
    if (data) {
      moderator.profileId = data.id
      personaProfiles.set(moderator.id, data.id)
    }
  } else if (moderator?.profileId) {
    personaProfiles.set(moderator.id, moderator.profileId)
  }

  // Shuffle topics
  const availableTopics = [...THREAD_TOPICS].sort(() => Math.random() - 0.5)
  let topicIdx = 0

  // All threads we'll create (for reply targeting later)
  const allThreads = []
  let totalThreads = 0
  let totalReplies = 0

  // ---- Phase A: Each persona creates threads ----
  console.log('  Phase A: Creating threads...\n')

  for (const persona of personas) {
    const activity = persona._activity || persona.activity_level || 'moderate'
    const config = ACTIVITY_MAP[activity] || ACTIVITY_MAP.moderate
    const threadCount = randomBetween(config.threads[0], config.threads[1])
    const timestamps = generateTimestamps(threadCount, 21) // Past 3 weeks

    const profileId = personaProfiles.get(persona.id)
    if (!profileId) {
      console.log(`    SKIP ${persona.name} — no profile`)
      continue
    }

    console.log(`    ${persona.name} (${activity}): creating ${threadCount} threads...`)

    for (let t = 0; t < threadCount; t++) {
      try {
        const topic = availableTopics[topicIdx % availableTopics.length]
        topicIdx++

        const content = await generateThreadContent(persona, topic)
        const thread = await insertThread(
          profileId,
          content.title,
          content.body,
          content.group_slug,
          timestamps[t]
        )

        await trackConversation(thread.id, persona.id, 'created_thread', content.title)

        allThreads.push({
          id: thread.id,
          slug: thread.slug,
          title: content.title,
          body: content.body,
          group_slug: content.group_slug,
          author: persona,
          authorProfileId: profileId,
          createdAt: timestamps[t],
          replies: [],
        })

        totalThreads++
        console.log(`      -> "${content.title.slice(0, 50)}..." (${content.group_slug})`)

        await sleep(400) // Rate limit
      } catch (err) {
        console.error(`      Thread ERROR: ${err.message.slice(0, 100)}`)
      }
    }
  }

  // ---- Moderator welcome thread ----
  if (moderator && personaProfiles.get(moderator.id)) {
    console.log('\n    Kira Tanaka (moderator): creating welcome thread...')
    try {
      const welcomeThread = await insertThread(
        personaProfiles.get(moderator.id),
        'Welcome to the 0nMCP Community',
        `Hey folks — Kira here, your community lead.\n\nThis forum is for everyone building with 0nMCP — whether you just ran your first \`npm install\` or you're orchestrating 50 services in production. No question is too basic, no workflow too ambitious.\n\nA few ground rules:\n- Be kind. We were all beginners once.\n- Share what you're building — we love seeing real use cases.\n- If you hit a wall, post in **help** with your config (redact API keys!) and someone will jump in.\n- Feature requests go in **feature-requests** — we actually read every one.\n\nI'm around most days. Tag me if something needs attention or you just want to say hi.\n\nWhat are you working on right now? Drop a comment below.`,
        'general',
        backdatedTimestamp(20) // 20 days ago
      )
      allThreads.unshift({
        id: welcomeThread.id,
        slug: welcomeThread.slug,
        title: 'Welcome to the 0nMCP Community',
        body: 'Welcome thread',
        group_slug: 'general',
        author: moderator,
        authorProfileId: personaProfiles.get(moderator.id),
        createdAt: backdatedTimestamp(20),
        replies: [],
      })
      totalThreads++
      console.log('      -> Welcome thread created')
    } catch (err) {
      console.error(`      Welcome thread ERROR: ${err.message}`)
    }
  }

  console.log(`\n  Total threads: ${totalThreads}`)

  // ---- Phase B: Generate replies ----
  console.log('\n  Phase B: Generating replies...\n')

  // Sort threads by creation date
  allThreads.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  for (const thread of allThreads) {
    // Determine how many replies this thread should get (1-4)
    const maxReplies = randomBetween(1, 4)

    // Select responders (different from thread author, weighted by activity)
    const candidates = personas.filter(p => p.id !== thread.author.id)

    // Add moderator as a candidate (high chance on help threads)
    if (moderator && moderator.id !== thread.author.id) {
      candidates.push(moderator)
    }

    const responders = []
    for (const candidate of candidates.sort(() => Math.random() - 0.5)) {
      if (responders.length >= maxReplies) break

      const activity = candidate._activity || candidate.activity_level || 'moderate'
      const config = ACTIVITY_MAP[activity] || ACTIVITY_MAP.moderate

      // Moderator has 70% chance on help threads, 40% on others
      const isModOnHelp = candidate.id === moderator?.id && thread.group_slug === 'help'
      const chance = isModOnHelp ? 0.70 : config.replyChance

      // Expertise match bonus
      const threadText = `${thread.title} ${thread.body}`.toLowerCase()
      const expertiseMatch = (candidate.expertise || []).some(e => threadText.includes(e.toLowerCase()))
      const adjustedChance = expertiseMatch ? chance + 0.15 : chance

      if (Math.random() < adjustedChance) {
        responders.push(candidate)
      }
    }

    if (responders.length === 0) continue

    console.log(`    "${thread.title.slice(0, 40)}..." — ${responders.length} replies`)

    // Generate replies with timestamps after thread creation
    const threadTime = new Date(thread.createdAt).getTime()
    const replyReplies = []

    for (let r = 0; r < responders.length; r++) {
      const responder = responders[r]
      const profileId = personaProfiles.get(responder.id)
      if (!profileId) continue

      try {
        const reply = await generateReplyContent(
          responder,
          thread.title,
          thread.body,
          replyReplies // Existing replies for context
        )

        // Reply comes 30min to 48hrs after thread (or last reply)
        const lastTime = replyReplies.length > 0
          ? new Date(replyReplies[replyReplies.length - 1].createdAt).getTime()
          : threadTime
        const delayMs = randomBetween(30 * 60 * 1000, 48 * 60 * 60 * 1000)
        const replyTime = new Date(Math.min(lastTime + delayMs, Date.now())).toISOString()

        const post = await insertReply(profileId, thread.id, reply.body, replyTime)

        await trackConversation(thread.id, responder.id, 'replied', reply.body.slice(0, 200))

        replyReplies.push({
          id: post.id,
          body: reply.body,
          author: responder.name,
          createdAt: replyTime,
        })

        totalReplies++
        console.log(`      -> ${responder.name}: "${reply.body.slice(0, 50)}..."`)

        await sleep(400)
      } catch (err) {
        console.error(`      Reply ERROR (${responder.name}): ${err.message.slice(0, 100)}`)
      }
    }
  }

  console.log(`\n  Total replies: ${totalReplies}`)

  // ---- Phase C: Update persona stats ----
  console.log('\n  Phase C: Updating persona stats...')

  // Count threads and replies per persona from conversation log
  const { data: convos } = await admin.from('persona_conversations').select('persona_id, action')
  if (convos) {
    const stats = {}
    for (const c of convos) {
      if (!stats[c.persona_id]) stats[c.persona_id] = { threads: 0, replies: 0 }
      if (c.action === 'created_thread') stats[c.persona_id].threads++
      else stats[c.persona_id].replies++
    }

    for (const [pid, s] of Object.entries(stats)) {
      await updatePersonaStats(pid, s.threads, s.replies, new Date().toISOString())
    }
  }

  // ---- Done ----
  console.log(`\n=== SEEDING COMPLETE ===`)
  console.log(`  Personas: ${personas.length + 1} (incl moderator)`)
  console.log(`  Threads:  ${totalThreads}`)
  console.log(`  Replies:  ${totalReplies}`)
  console.log(`  Claude API calls: ${apiCallCount}`)
  console.log()
}

// Run
main().catch(err => {
  console.error('\nFATAL:', err)
  process.exit(1)
})
