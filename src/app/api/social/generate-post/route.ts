import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// ── Archetype Types ──

interface Archetype {
  tier: string
  domain: string
  style: string
  postingBehavior: string
  vocabularyLevel: string
}

// ── PACG Classifier (Multi-Platform) ──

function classifyFromProfile(profile: {
  name?: string
  bio?: string
  headline?: string
  platform?: string
  interests?: string[]
}): Archetype {
  const bio = (profile.bio || profile.headline || '').toLowerCase()
  const name = profile.name || ''

  // Tier detection
  let tier = 'individual'
  if (/ceo|cto|cfo|coo|founder|co-founder|president|partner|chairman/i.test(bio)) tier = 'executive'
  else if (/director|vp|head of|manager|lead|principal/i.test(bio)) tier = 'manager'
  else if (/student|intern|junior|learning|studying/i.test(bio)) tier = 'student'

  // Domain detection
  let domain = 'other'
  if (/engineer|developer|software|code|tech|ai|ml|data|devops|cloud|saas|api/i.test(bio)) domain = 'tech'
  else if (/market|growth|seo|content|brand|social media|digital/i.test(bio)) domain = 'marketing'
  else if (/sales|revenue|account|business development|bdr|sdr/i.test(bio)) domain = 'sales'
  else if (/finance|invest|banking|capital|portfolio|crypto|defi/i.test(bio)) domain = 'finance'
  else if (/hr|people|talent|recruit|culture/i.test(bio)) domain = 'hr'
  else if (/operations|ops|logistics|supply|process/i.test(bio)) domain = 'operations'
  else if (/health|medical|clinical|pharma|wellness|fitness/i.test(bio)) domain = 'healthcare'
  else if (/educa|teach|professor|academ|research|learn/i.test(bio)) domain = 'education'
  else if (/legal|law|attorney|counsel|compliance/i.test(bio)) domain = 'legal'
  else if (/design|creative|art|ui|ux|product design/i.test(bio)) domain = 'tech'
  else if (/real estate|property|realt/i.test(bio)) domain = 'sales'

  // Style detection
  let style = 'casual'
  if (/thought leader|keynote|speaker|author|wrote|published/i.test(bio)) style = 'thought-leader'
  else if (/story|journey|passion|mission|impact/i.test(bio)) style = 'storyteller'
  else if (/data|metric|analytic|measure|roi|performance/i.test(bio)) style = 'data-driven'
  else if (/coach|mentor|inspir|empower|transform|mindset/i.test(bio)) style = 'motivational'
  else if (/teach|educate|train|workshop|course|tutorial/i.test(bio)) style = 'educational'

  // Vocabulary
  let vocabularyLevel = 'professional'
  if (tier === 'executive' || /phd|research|architect|principal/i.test(bio)) vocabularyLevel = 'expert'
  else if (tier === 'student' || /casual|fun|creative/i.test(bio)) vocabularyLevel = 'conversational'

  return { tier, domain, style, postingBehavior: 'occasional', vocabularyLevel }
}

// ── Platform-Specific Post Instructions ──

const PLATFORM_RULES: Record<string, string> = {
  linkedin: `Platform: LinkedIn
- Professional tone but authentic
- 150-300 words ideal
- Line breaks between paragraphs (LinkedIn loves whitespace)
- End with engagement hook (question or reflection)
- Max 3 hashtags, only if natural
- First person perspective
- NO "I'm excited to announce" or LinkedIn cliches`,

  twitter: `Platform: X (Twitter)
- 280 character limit (can be a thread of 2-3 tweets)
- Punchy, direct, no fluff
- Hot take energy — say something bold
- Emojis are OK but don't overdo
- Thread format: number each tweet (1/, 2/, 3/)
- End with a call to try it`,

  instagram: `Platform: Instagram
- Caption style — visual storytelling with text
- 100-200 words
- Use 3-5 relevant hashtags at the end
- Conversational, authentic voice
- Include a CTA (link in bio, try it, etc.)
- Emoji-friendly but not spammy`,

  facebook: `Platform: Facebook
- Conversational, like talking to friends
- 100-250 words
- Can be longer and more personal than Twitter
- Share the "why" behind the discovery
- Encourage comments and shares`,
}

// ── Banned Phrases ──

const BANNED = [
  'game-changer', 'game changer', 'disrupting', 'synergy', 'leverage',
  'circle back', 'move the needle', 'at the end of the day',
  'think outside the box', 'low-hanging fruit', 'deep dive', 'bandwidth',
  'paradigm shift', 'best-in-class', 'cutting-edge', 'robust',
  "i'm excited to announce", "i'm thrilled", "humbled and honored",
  'drumroll', '🚀🚀🚀',
]

function validatePost(content: string): { valid: boolean; issues: string[] } {
  const lower = content.toLowerCase()
  const issues: string[] = []
  for (const phrase of BANNED) {
    if (lower.includes(phrase)) issues.push(phrase)
  }
  return { valid: issues.length === 0, issues }
}

// ── Post Generation ──

function buildPrompt(archetype: Archetype, platform: string, profile: {
  name?: string
  bio?: string
  interests?: string[]
}): string {
  const platformRules = PLATFORM_RULES[platform] || PLATFORM_RULES.linkedin

  const interestBlock = profile.interests?.length
    ? `\nThe user's interests/topics: ${profile.interests.join(', ')}`
    : ''

  return `You are writing a social media post for a ${archetype.tier}-level ${archetype.domain} professional.
Their name is ${profile.name || 'the user'}.
Their bio: "${profile.bio || 'Not provided'}"${interestBlock}

${platformRules}

STYLE: ${archetype.style}
VOCABULARY: ${archetype.vocabularyLevel}

THE POST MUST:
1. Be written as if the USER wrote it (first person, their voice)
2. Describe their experience discovering and using 0n (0nMCP) — an AI execution engine
3. Mention something SPECIFIC to their industry/domain that 0n helps with
4. Sound genuinely impressed but NOT salesy — like telling a friend about something cool
5. Include the fact that they ran ONE command (npx 0nmcp install) and it set everything up
6. Reference that 0n has 1,640+ tools across 111 services
7. End with something that makes the reader want to try it

CRITICAL: This post should feel like a REAL person sharing a genuine discovery.
NOT a marketing announcement. NOT an ad. A person who found something incredible.

${profile.interests?.length ? `Weave in references to: ${profile.interests.join(', ')}` : ''}

Write ONLY the post content. No meta-commentary.`
}

/**
 * POST /api/social/generate-post
 *
 * Body: {
 *   user_id: string (optional — for logged-in users)
 *   name: string
 *   bio: string
 *   platform: "linkedin" | "twitter" | "instagram" | "facebook"
 *   interests?: string[]
 * }
 *
 * Returns: { post, archetype, platform, valid }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, bio, platform: socialPlatform, interests, user_id } = body

    if (!name || !socialPlatform) {
      return NextResponse.json({ error: 'name and platform required' }, { status: 400 })
    }

    // 1. Classify profile
    const archetype = classifyFromProfile({ name, bio, platform: socialPlatform, interests })

    // 2. Build prompt
    const prompt = buildPrompt(archetype, socialPlatform, { name, bio, interests })

    // 3. Generate with Claude (using Anthropic SDK)
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic()

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
      system: `You write authentic social media posts that sound like real people, not marketers. You match the user's professional level, domain expertise, and communication style perfectly.`,
    })

    const postContent = message.content[0]?.type === 'text' ? message.content[0].text : ''

    // 4. Validate
    const validation = validatePost(postContent)

    // 5. If invalid, retry once
    let finalContent = postContent
    if (!validation.valid) {
      const retry = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          { role: 'user', content: prompt },
          { role: 'assistant', content: postContent },
          { role: 'user', content: `Remove these banned phrases: ${validation.issues.join(', ')}. Rewrite naturally. Return ONLY the post.` },
        ],
      })
      finalContent = retry.content[0]?.type === 'text' ? retry.content[0].text : postContent
    }

    // 6. Save to DB if user_id provided
    if (user_id) {
      const admin = getAdmin()
      try {
        await admin.from('social_drafts').insert({
          user_id,
          platform: socialPlatform,
          content: finalContent,
          archetype,
          status: 'draft',
        })
      } catch { /* non-fatal — table may not exist yet */ }
    }

    return NextResponse.json({
      post: finalContent,
      archetype,
      platform: socialPlatform,
      valid: validatePost(finalContent).valid,
    })
  } catch (err) {
    console.error('[social/generate-post] Error:', err)
    return NextResponse.json({ error: 'Failed to generate post' }, { status: 500 })
  }
}
