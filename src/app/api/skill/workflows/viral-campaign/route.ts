import { NextRequest, NextResponse } from 'next/server'
import { verifySkillToken, getSkillAdmin } from '@/lib/skill-auth'
import { isOwner } from '@/lib/sparks'
import { createSocialPost, resolveAccountIds, listSocialAccounts } from '@/lib/crm-social'
import { scanRedditOpportunities, findForumThreadsForReddit, draftFromForumThread, redditToForum } from '@/lib/reddit-engine'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

const INSTALL_URL = 'https://www.0nmcp.com/install0n'

/**
 * POST /api/skill/workflows/viral-campaign — Full viral distribution campaign
 *
 * Coordinates all growth channels to drive traffic to the install page:
 *
 * 1. LinkedIn Thought Leadership — AI-generated viral posts with CTAs to install0n
 * 2. LinkedIn Auto-Comment Engine — Monitors and engages MCP-related content
 * 3. Reddit Opportunity Mining — Scans MCP subreddits, drafts helpful comments
 * 4. Forum Cross-Pollination — Creates discussion threads that link to install0n
 * 5. Multi-Platform CRM Social — Posts to all connected GHL channels
 * 6. Content Queue Seeding — Pre-generates a week of content
 *
 * Body: {
 *   mode: 'full' | 'linkedin' | 'reddit' | 'forum' | 'preview'
 *   topic?: string           — Override topic
 *   post_count?: number      — Number of posts to generate (default 3)
 *   include_comments?: bool  — Generate comment drafts for MCP content
 * }
 */
export async function POST(request: NextRequest) {
  const user = await verifySkillToken(request.headers.get('authorization'))
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated. Run: /0nmcp login' }, { status: 401 })
  }

  if (!isOwner(user.email)) {
    return NextResponse.json({
      error: 'This workflow is owner-only during beta',
    }, { status: 403 })
  }

  const body = await request.json()
  const {
    mode = 'full',
    topic,
    post_count = 3,
    include_comments = true,
  } = body

  const admin = getSkillAdmin()
  const results: Record<string, unknown> = { mode, timestamp: new Date().toISOString() }

  // ═══════════════════════════════════════════════════════════════
  // 1. LINKEDIN VIRAL POSTS — AI-crafted thought leadership
  // ═══════════════════════════════════════════════════════════════
  if (mode === 'full' || mode === 'linkedin') {
    const linkedinResults: {
      posts_generated: number
      posts_published: number
      errors: string[]
      posts: { content: string; posted: boolean; post_id?: string }[]
    } = {
      posts_generated: 0,
      posts_published: 0,
      errors: [],
      posts: [],
    }

    const viralHooks = getViralHooks(topic)
    const accountMap = await resolveAccountIds(['linkedin'])
    const linkedinAccountIds = accountMap.get('linkedin') || []

    for (let i = 0; i < Math.min(post_count, viralHooks.length); i++) {
      try {
        const hook = viralHooks[i]
        const postContent = await generateViralPost(hook)

        linkedinResults.posts_generated++

        // Queue in content_queue
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin.from('content_queue') as any).insert({
          platform: 'linkedin',
          content_type: 'post',
          title: hook.hook.slice(0, 100),
          body: postContent,
          metadata: {
            source: 'viral-campaign',
            hook_type: hook.type,
            target_url: INSTALL_URL,
            user_id: user.id,
          },
          status: i === 0 ? 'approved' : 'review', // Auto-approve first, review rest
          generated_by: 'viral-campaign',
        })

        // Post the first one immediately to LinkedIn
        if (i === 0 && linkedinAccountIds.length > 0) {
          const postResult = await createSocialPost({
            accountIds: linkedinAccountIds,
            content: postContent,
            tags: ['MCP', 'AI', 'Claude', 'automation', 'developer'],
          })

          if (postResult.success) {
            linkedinResults.posts_published++
            linkedinResults.posts.push({
              content: postContent,
              posted: true,
              post_id: postResult.postId,
            })
          } else {
            linkedinResults.errors.push(postResult.error || 'LinkedIn post failed')
            linkedinResults.posts.push({ content: postContent, posted: false })
          }
        } else {
          linkedinResults.posts.push({ content: postContent, posted: false })
        }
      } catch (err) {
        linkedinResults.errors.push(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    results.linkedin = linkedinResults
  }

  // ═══════════════════════════════════════════════════════════════
  // 2. LINKEDIN AUTO-COMMENT ENGINE — Engage MCP-related posts
  // ═══════════════════════════════════════════════════════════════
  if ((mode === 'full' || mode === 'linkedin') && include_comments) {
    const commentResults = await generateMCPCommentDrafts(admin)
    results.linkedin_comments = commentResults
  }

  // ═══════════════════════════════════════════════════════════════
  // 3. REDDIT OPPORTUNITY MINING — Scan + Draft for MCP subreddits
  // ═══════════════════════════════════════════════════════════════
  if (mode === 'full' || mode === 'reddit') {
    try {
      const scanResults = await scanRedditOpportunities(10)
      results.reddit_scan = scanResults

      // Also draft comments for top opportunities
      if (include_comments) {
        const commentDrafts = await draftRedditComments(admin)
        results.reddit_comments = commentDrafts
      }
    } catch (err) {
      results.reddit_scan = { error: err instanceof Error ? err.message : 'Scan failed' }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 4. FORUM CROSS-POLLINATION — Create install0n-linked threads
  // ═══════════════════════════════════════════════════════════════
  if (mode === 'full' || mode === 'forum') {
    try {
      // Forum → Reddit (trending forum → Reddit posts)
      const forumToReddit = await findForumThreadsForReddit(3)
      for (const thread of forumToReddit) {
        await draftFromForumThread(thread)
      }

      // Reddit → Forum (hot Reddit → forum discussions)
      const redditToForumResult = await redditToForum(3)

      results.forum = {
        forum_to_reddit_drafted: forumToReddit.length,
        reddit_to_forum_created: redditToForumResult.created,
        errors: redditToForumResult.errors,
      }
    } catch (err) {
      results.forum = { error: err instanceof Error ? err.message : 'Forum sync failed' }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 5. MULTI-PLATFORM CRM SOCIAL — Post to all GHL channels
  // ═══════════════════════════════════════════════════════════════
  if (mode === 'full') {
    try {
      const allAccounts = await listSocialAccounts()
      const platforms = [...new Set(allAccounts.map(a => a.platform))]

      results.crm_accounts = {
        total: allAccounts.length,
        platforms,
      }
    } catch (err) {
      results.crm_accounts = { error: err instanceof Error ? err.message : 'CRM check failed' }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 6. CAMPAIGN SUMMARY
  // ═══════════════════════════════════════════════════════════════
  results.install_url = INSTALL_URL
  results.next_steps = [
    'Review queued posts at /console → Content Queue',
    'Approve LinkedIn comment drafts for MCP posts',
    'Check Reddit opportunities at /console → Reddit Engine',
    'Monitor engagement via /0nmcp sparks and /api/cron/daily-social',
    'Run /0nmcp run viral-campaign again to generate more content',
  ]

  return NextResponse.json({ ok: true, campaign: results })
}

// ═══════════════════════════════════════════════════════════════════════════
// VIRAL POST GENERATION
// ═══════════════════════════════════════════════════════════════════════════

interface ViralHook {
  type: string
  hook: string
  angle: string
  cta_style: string
}

function getViralHooks(customTopic?: string): ViralHook[] {
  const hooks: ViralHook[] = [
    {
      type: 'contrarian',
      hook: 'Everyone is building MCP servers wrong.',
      angle: 'Most developers spend weeks connecting AI to APIs. One npm install gives you 1,155 tools across 91 services.',
      cta_style: 'curiosity_link',
    },
    {
      type: 'data_shock',
      hook: 'I connected Claude to 91 services in 60 seconds.',
      angle: 'Not a typo. Stripe, Slack, GitHub, Supabase, CRM, email — all live. Here\'s exactly how.',
      cta_style: 'how_to_link',
    },
    {
      type: 'before_after',
      hook: 'Last month: 3 days to connect Claude to Stripe. Today: 60 seconds.',
      angle: 'The MCP ecosystem is evolving fast. The gap between "building from scratch" and "describing outcomes" is closing.',
      cta_style: 'transformation_link',
    },
    {
      type: 'unpopular_opinion',
      hook: 'Unpopular opinion: AI agents without API access are just fancy chatbots.',
      angle: 'The real unlock is when your AI can actually DO things — send emails, process payments, update your CRM. Not just talk about it.',
      cta_style: 'opinion_link',
    },
    {
      type: 'listicle_tease',
      hook: '5 things I wish I knew before building AI workflows:',
      angle: 'After connecting 1,155+ tools and orchestrating thousands of API calls, here are the non-obvious lessons.',
      cta_style: 'value_list_link',
    },
    {
      type: 'question_bait',
      hook: 'What\'s stopping most companies from using AI agents in production?',
      angle: 'It\'s not the models. It\'s the integration layer. Most teams spend 80% of their time on API plumbing.',
      cta_style: 'discussion_link',
    },
    {
      type: 'social_proof',
      hook: 'This free tool just hit 1,155 tools across 91 services. Zero vendor lock-in.',
      angle: 'Open source, MIT licensed, works with Claude Desktop/Web/Mobile/Code. The MCP ecosystem is getting serious.',
      cta_style: 'social_proof_link',
    },
    {
      type: 'prediction',
      hook: 'By 2027, every developer will have an AI agent managing their API connections.',
      angle: 'The Model Context Protocol is doing for AI tools what REST did for web APIs. Here\'s what\'s happening right now.',
      cta_style: 'future_link',
    },
    {
      type: 'personal_story',
      hook: 'I spent $12,000/year on Zapier. Then I found this.',
      angle: 'Free, open source, and it actually lets the AI orchestrate instead of following rigid if/then workflows.',
      cta_style: 'story_link',
    },
    {
      type: 'challenge',
      hook: 'Challenge: Install 0nMCP and connect Claude to your entire stack in under 2 minutes.',
      angle: 'I\'ve seen devs do it in 47 seconds. Desktop, Web, Mobile, CLI — pick your platform.',
      cta_style: 'challenge_link',
    },
  ]

  if (customTopic) {
    hooks.unshift({
      type: 'custom',
      hook: customTopic,
      angle: 'Connect Claude to 1,155+ tools with one install. Free, open source.',
      cta_style: 'direct_link',
    })
  }

  // Shuffle for variety
  return hooks.sort(() => Math.random() - 0.5)
}

async function generateViralPost(hook: ViralHook): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY required')

  const ctaTemplates: Record<string, string> = {
    curiosity_link: `Try it yourself: ${INSTALL_URL}`,
    how_to_link: `60-second install, zero config: ${INSTALL_URL}`,
    transformation_link: `See the difference: ${INSTALL_URL}`,
    opinion_link: `What do you think? Try it and tell me: ${INSTALL_URL}`,
    value_list_link: `Start here (free): ${INSTALL_URL}`,
    discussion_link: `This is solving it. Free install: ${INSTALL_URL}`,
    social_proof_link: `Join the builders: ${INSTALL_URL}`,
    future_link: `Get ahead of it: ${INSTALL_URL}`,
    story_link: `Same setup, zero cost: ${INSTALL_URL}`,
    challenge_link: `Take the challenge: ${INSTALL_URL}`,
    direct_link: `Install free: ${INSTALL_URL}`,
  }

  const cta = ctaTemplates[hook.cta_style] || `Try it: ${INSTALL_URL}`

  const prompt = `You are a growth-focused LinkedIn content strategist. Write a VIRAL LinkedIn post.

HOOK: "${hook.hook}"
ANGLE: ${hook.angle}
HOOK TYPE: ${hook.type}

PRODUCT: 0nMCP — Universal AI API Orchestrator
- 1,155 tools across 91 services
- Works with Claude Desktop, Web, Mobile, and Claude Code
- Free, open source, MIT licensed
- npm package: 0nmcp
- Encrypted Vault for API keys
- Install in 60 seconds, zero config
- Replaces $12k+/year SaaS workflow tools

CTA TO INCLUDE (naturally, at the end): ${cta}

LINKEDIN VIRAL MECHANICS — Follow these EXACTLY:
1. HOOK: First line must stop the scroll. Bold, surprising, or contrarian. Under 12 words.
2. GAP: Create a gap between what people believe and what's true.
3. BODY: 3-5 short paragraphs. Each line is its own paragraph (LinkedIn mobile).
4. SPECIFICS: Use real numbers (1,155 tools, 91 services, 60 seconds, $0).
5. PATTERN INTERRUPT: Include one unexpected comparison or analogy.
6. EMOTION: Tap into frustration (wasted time on integrations) or aspiration (AI that actually does things).
7. ENGAGEMENT HOOK: End with a question or invitation that people WANT to respond to.
8. CTA: Weave the install link naturally — never "click here."
9. HASHTAGS: 3-5 relevant hashtags: #MCP #AI #ClaudeAI #Automation #DevTools
10. LENGTH: 150-250 words. Dense value, no fluff.

ANTI-PATTERNS (NEVER do these):
- Don't start with "I'm excited to share"
- Don't use "game-changer", "revolutionary", "cutting-edge"
- Don't write like a press release
- Don't be salesy — be genuinely helpful and opinionated
- Don't use bullet points (use line breaks instead)

Write ONLY the post. No meta-commentary.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text || ''
}

// ═══════════════════════════════════════════════════════════════════════════
// LINKEDIN AUTO-COMMENT ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Generate comment drafts for MCP-related LinkedIn content.
 * These get queued for review before posting.
 */
async function generateMCPCommentDrafts(admin: ReturnType<typeof getSkillAdmin>): Promise<{
  drafts_created: number
  comment_templates: { context: string; draft: string }[]
}> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { drafts_created: 0, comment_templates: [] }

  const mcpContexts = [
    'Someone posted about building their first MCP server from scratch',
    'A developer is asking which MCP servers to use with Claude',
    'Someone shared a comparison of AI orchestration tools (Zapier vs n8n vs custom)',
    'A post about connecting Claude to external APIs and databases',
    'Someone is frustrated with the complexity of setting up AI tool integrations',
    'A founder asking how to add AI capabilities to their product',
    'A post about the Model Context Protocol specification and its future',
    'Someone showcasing their AI agent workflow and asking for feedback',
  ]

  const prompt = `Generate 8 LinkedIn comment drafts — one for each context below.

Each comment should:
- Be genuinely helpful and add value (not just promotional)
- Naturally mention 0nMCP as a solution when relevant
- Include the install link ONLY if it fits naturally: ${INSTALL_URL}
- Sound like a real developer/builder sharing their experience
- Be 2-4 sentences max
- NEVER say "check out" or "you should try" — instead share experience: "I've been using...", "This solved it for me..."
- Include specifics: "1,155 tools", "91 services", "60 seconds to install"

CONTEXTS:
${mcpContexts.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Respond in JSON format:
{
  "comments": [
    { "context": "context description", "draft": "the comment text" }
  ]
}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250514',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) throw new Error(`API error: ${response.status}`)

    const data = await response.json()
    const text = data.content?.[0]?.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Failed to parse comments')

    const parsed = JSON.parse(jsonMatch[0])
    const comments = parsed.comments || []

    // Store drafts in content_queue for review
    for (const comment of comments) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin.from('content_queue') as any).insert({
        platform: 'linkedin',
        content_type: 'comment',
        title: `MCP Comment: ${comment.context.slice(0, 80)}`,
        body: comment.draft,
        metadata: {
          source: 'viral-campaign-comments',
          context: comment.context,
          target_url: INSTALL_URL,
        },
        status: 'review',
        generated_by: 'viral-campaign',
      })
    }

    return {
      drafts_created: comments.length,
      comment_templates: comments,
    }
  } catch (err) {
    return {
      drafts_created: 0,
      comment_templates: [],
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// REDDIT COMMENT DRAFTS FOR MCP OPPORTUNITIES
// ═══════════════════════════════════════════════════════════════════════════

async function draftRedditComments(admin: ReturnType<typeof getSkillAdmin>): Promise<{
  opportunities_found: number
  drafts_created: number
}> {
  // Get recent high-priority MCP opportunities
  const { data: opportunities } = await admin
    .from('reddit_opportunities')
    .select('*')
    .eq('status', 'found')
    .gte('priority_score', 2)
    .order('priority_score', { ascending: false })
    .limit(5)

  if (!opportunities?.length) {
    return { opportunities_found: 0, drafts_created: 0 }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { opportunities_found: opportunities.length, drafts_created: 0 }

  let draftsCreated = 0

  for (const opp of opportunities) {
    try {
      const prompt = `Write a helpful Reddit comment for this post.

SUBREDDIT: r/${opp.subreddit}
POST TITLE: ${opp.title}
POST BODY: ${(opp.body || '').slice(0, 500)}
MATCHED KEYWORDS: ${(opp.keywords_matched || []).join(', ')}

RULES:
- Be genuinely helpful — answer their question or add to the discussion
- If relevant, mention 0nMCP naturally ("I use 0nMCP for this" or "0nMCP handles this well")
- Include the link ONLY if it fits: ${INSTALL_URL}
- Sound like a real Redditor — casual, helpful, not promotional
- Include specifics when mentioning 0nMCP (1,155 tools, 91 services, free/open source)
- 3-6 sentences max
- NEVER be salesy

Write ONLY the comment text.`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250514',
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!response.ok) continue

      const data = await response.json()
      const commentBody = data.content?.[0]?.text || ''

      if (commentBody) {
        await admin
          .from('reddit_content')
          .insert({
            opportunity_id: opp.id,
            content_type: 'comment',
            subreddit: opp.subreddit,
            body: commentBody,
            persona: 'viral-campaign',
            tone: 'helpful',
            word_count: commentBody.split(/\s+/).length,
            includes_link: commentBody.includes('0nmcp.com'),
            link_url: commentBody.includes('0nmcp.com') ? INSTALL_URL : null,
            status: 'draft',
          })

        // Mark opportunity as drafted
        await admin
          .from('reddit_opportunities')
          .update({ status: 'drafted' })
          .eq('id', opp.id)

        draftsCreated++
      }
    } catch {
      // Continue to next opportunity
    }
  }

  return {
    opportunities_found: opportunities.length,
    drafts_created: draftsCreated,
  }
}

/**
 * GET /api/skill/workflows/viral-campaign — Campaign status and metrics
 */
export async function GET(request: NextRequest) {
  const user = await verifySkillToken(request.headers.get('authorization'))
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = getSkillAdmin()

  const [
    linkedinPosts,
    commentDrafts,
    redditOpps,
    redditContent,
    forumThreads,
  ] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin.from('content_queue') as any)
      .select('id, status, platform, created_at, posted_at')
      .contains('metadata', { source: 'viral-campaign' })
      .order('created_at', { ascending: false })
      .limit(20),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin.from('content_queue') as any)
      .select('id, status, title, body')
      .contains('metadata', { source: 'viral-campaign-comments' })
      .order('created_at', { ascending: false })
      .limit(20),
    admin.from('reddit_opportunities')
      .select('id, subreddit, title, priority_score, status', { count: 'exact' })
      .order('priority_score', { ascending: false })
      .limit(10),
    admin.from('reddit_content')
      .select('id, content_type, subreddit, status, posted_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(10),
    admin.from('community_threads')
      .select('id, title, score, reply_count', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return NextResponse.json({
    campaign: {
      name: 'Viral Install0n Campaign',
      target_url: INSTALL_URL,
      status: 'active',
    },
    metrics: {
      linkedin_posts: linkedinPosts.data?.length || 0,
      comment_drafts: commentDrafts.data?.length || 0,
      reddit_opportunities: redditOpps.count || 0,
      reddit_content: redditContent.count || 0,
      forum_threads: forumThreads.count || 0,
    },
    recent_linkedin: linkedinPosts.data || [],
    recent_comments: commentDrafts.data || [],
    top_reddit_opportunities: redditOpps.data || [],
    recent_reddit_content: redditContent.data || [],
  })
}
