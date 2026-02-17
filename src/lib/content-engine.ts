/**
 * 0nMCP Content Engine — AI Marketing Content Generator
 * Uses Claude to generate platform-specific marketing content
 */

import { createClient } from '@supabase/supabase-js'

let _admin: ReturnType<typeof createClient> | null = null
export function getAdmin() {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _admin
}

export interface ContentTopic {
  id: string
  category: string
  title: string
  description: string | null
  keywords: string[]
  platforms: string[]
  priority: number
  times_used: number
  last_used_at: string | null
}

export interface ContentItem {
  id: string
  topic_id: string | null
  platform: string
  content_type: string
  title: string | null
  body: string
  metadata: Record<string, unknown>
  status: string
  scheduled_for: string | null
  posted_at: string | null
  posted_url: string | null
  rejection_reason: string | null
  generated_by: string
  reviewed_by: string | null
  reviewed_at: string | null
  edit_count: number
  created_at: string
  updated_at: string
  content_topics?: ContentTopic
}

const PLATFORM_GUIDELINES: Record<string, string> = {
  reddit: `Reddit post guidelines:
- Title: Catchy, specific, 60-120 characters. No clickbait.
- Body: Genuine, helpful tone. Share knowledge, not sales pitches.
- Include code examples or concrete details where relevant.
- End with a question or discussion prompt to encourage engagement.
- ALWAYS disclose: "Disclosure: I'm one of the maintainers of 0nMCP."
- DO NOT use emojis excessively. 1-2 max.
- Target subreddits context: r/ClaudeAI, r/LocalLLaMA, r/selfhosted, r/programming, r/webdev`,

  linkedin: `LinkedIn post guidelines:
- Professional but conversational tone.
- Start with a hook — a surprising stat, bold claim, or question.
- Use line breaks liberally for readability.
- Include 3-5 relevant hashtags at the end.
- 150-300 words ideal length.
- Focus on business value, not just technical features.
- End with a call to action or question.`,

  blog: `Blog article guidelines:
- 800-1500 words.
- Include a clear introduction, body with subheadings, and conclusion.
- Use code blocks for any technical examples.
- Include a TL;DR at the top for skimmers.
- Link to relevant docs, GitHub, or npm where appropriate.
- SEO-friendly: use the target keywords naturally.
- End with next steps or a CTA.`,

  hackernews: `Hacker News post guidelines:
- Title: Factual, no hype. "Show HN:" prefix for launches.
- Keep it technical and substantive.
- Avoid marketing language — HN readers will downvote sales pitches.
- Focus on what's technically interesting or novel.
- Be ready to answer tough technical questions honestly.`,

  twitter: `Twitter/X post guidelines:
- 280 characters max.
- Punchy, direct.
- Use 1-2 relevant hashtags.
- Include a link.
- Thread format for longer content (3-5 tweets max).`,

  dev_to: `Dev.to article guidelines:
- Technical tutorial format with step-by-step instructions.
- Include all code examples in full (readers expect copy-paste ready).
- Use Dev.to frontmatter: title, description, tags, cover_image.
- 600-1200 words.
- Conversational but technical tone.
- Include a "What you'll build" section at the top.`,
}

const PRODUCT_CONTEXT = `
0nMCP is the Universal AI API Orchestrator — 550 tools across 26 services in 13 categories.
One npm install, one config file, zero boilerplate.

Key facts:
- npm package: 0nmcp (MIT licensed, free, open source)
- GitHub: github.com/0nork/0nMCP
- Website: 0nmcp.com
- App: app.0nmcp.com
- 550 tools: 290 catalog + 245 CRM + 4 vault + 6 engine + 5 app
- 26 services: Stripe, Slack, Discord, OpenAI, Supabase, Airtable, Notion, GitHub, Shopify, Twilio, SendGrid, and more
- 13 categories: Payments, Email, SMS, Communication, AI, Database, Code, Project Mgmt, E-Commerce, CRM, Scheduling, Storage, Support
- Three-Level Execution: Pipeline > Assembly Line > Radial Burst (Patent Pending)
- .0n Standard: Universal config format — SWITCH files, connections, workflows
- CLI: \`0nmcp\` with named runs/hotkeys, shell/REPL mode
- Vault: Machine-bound AES-256-GCM encrypted credential storage
- Engine: Portable AI Brain bundles — import from .env/CSV/JSON, export to 7 AI platforms

The .0n Standard means: drop a SWITCH file, run \`0nmcp launch\`, and every service connects automatically.
Compare to: Zapier ($20-600/mo, closed source, no self-hosting), n8n (complex setup, fewer integrations), Make (per-operation pricing).
0nMCP is free forever at the core. Pay-per-execution marketplace for pre-built workflows.

Brand: 0nORK — "Stop building workflows. Start describing outcomes."
`

export async function generateContent(
  topic: ContentTopic,
  platform: string,
  contentType: string
): Promise<{ title: string; body: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY required for content generation')

  const guidelines = PLATFORM_GUIDELINES[platform] || ''

  const prompt = `You are a content marketing writer for 0nMCP, an open-source AI orchestration tool.

${PRODUCT_CONTEXT}

TOPIC: ${topic.title}
DESCRIPTION: ${topic.description || 'Write about this topic based on the title'}
CATEGORY: ${topic.category}
KEYWORDS: ${topic.keywords.join(', ')}
PLATFORM: ${platform}
CONTENT TYPE: ${contentType}

${guidelines}

Generate a ${contentType} for ${platform} about this topic. Be authentic, helpful, and technically accurate.
Never be salesy or use excessive superlatives. Focus on genuinely helping the reader.

Respond in this exact JSON format:
{
  "title": "The title or headline (empty string for comments/replies)",
  "body": "The full content body"
}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Claude API error: ${response.status} — ${err}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text || ''

  // Parse JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse Claude response as JSON')

  const parsed = JSON.parse(jsonMatch[0])
  return {
    title: parsed.title || '',
    body: parsed.body || text,
  }
}

export async function pickTopic(
  platform: string,
  category?: string
): Promise<ContentTopic | null> {
  const admin = getAdmin()

  let query = admin
    .from('content_topics')
    .select('*')
    .eq('is_active', true)
    .contains('platforms', [platform])
    .order('priority', { ascending: false })
    .order('times_used', { ascending: true })
    .limit(5)

  if (category) {
    query = query.eq('category', category)
  }

  const { data } = await query

  if (!data || data.length === 0) return null

  // Weighted random selection favoring higher priority and less-used topics
  const weights = data.map((t: ContentTopic) => t.priority * (1 / (t.times_used + 1)))
  const totalWeight = weights.reduce((a: number, b: number) => a + b, 0)
  let random = Math.random() * totalWeight
  for (let i = 0; i < data.length; i++) {
    random -= weights[i]
    if (random <= 0) return data[i]
  }
  return data[0]
}

export async function generateAndQueue(
  platform: string,
  contentType: string,
  topicCategory?: string
): Promise<ContentItem> {
  const admin = getAdmin()

  // Pick a topic
  const topic = await pickTopic(platform, topicCategory)
  if (!topic) throw new Error(`No active topics found for ${platform}`)

  // Generate content
  const { title, body } = await generateContent(topic, platform, contentType)

  // Insert into queue
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (admin.from('content_queue') as any).insert({
    topic_id: topic.id,
    platform,
    content_type: contentType,
    title: title || null,
    body,
    metadata: {
      topic_category: topic.category,
      topic_keywords: topic.keywords,
    },
    status: 'review',
    generated_by: 'claude',
  }).select('*, content_topics(*)').single()

  if (error) throw error

  // Update topic usage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from('content_topics') as any).update({
    times_used: topic.times_used + 1,
    last_used_at: new Date().toISOString(),
  }).eq('id', topic.id)

  return data
}
