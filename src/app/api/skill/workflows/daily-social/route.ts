import { NextRequest, NextResponse } from 'next/server'
import { verifySkillToken, getSkillAdmin } from '@/lib/skill-auth'
import { isOwner, checkBalance, deductSparks } from '@/lib/sparks'
import { generateContent, pickTopic } from '@/lib/content-engine'
import { createSocialPost, resolveAccountIds } from '@/lib/crm-social'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * POST /api/skill/workflows/daily-social — Generate and post daily social media content
 *
 * Generates AI-powered industry tips and posts to LinkedIn + GoHighLevel channels.
 *
 * Body: {
 *   platforms?: string[]   — default ['linkedin']
 *   topic?: string         — optional topic override
 *   niche?: string         — industry niche for tips (e.g. 'AI automation', 'SaaS')
 *   preview?: boolean      — if true, return generated content without posting
 *   schedule_for?: string  — ISO date to schedule instead of immediate post
 * }
 *
 * Flow:
 *   1. Authenticate user via Bearer token
 *   2. Deduct Sparks (console.workflow.run = 5)
 *   3. Pick a topic or use provided topic
 *   4. Generate platform-specific content via Claude
 *   5. Post to LinkedIn via CRM Social API
 *   6. Queue in content_queue for tracking
 *   7. Return results
 */
export async function POST(request: NextRequest) {
  const user = await verifySkillToken(request.headers.get('authorization'))
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated. Run: /0nmcp login' }, { status: 401 })
  }

  const body = await request.json()
  const {
    platforms = ['linkedin'],
    topic: userTopic,
    niche = 'AI automation and workflow orchestration',
    preview = false,
    schedule_for,
  } = body

  // Deduct Sparks (owner gets free)
  if (!isOwner(user.email)) {
    const check = await checkBalance(user.id, 'console.workflow.run', user.email)
    if (!check.allowed) {
      return NextResponse.json({
        error: 'insufficient_sparks',
        balance: check.balance,
        cost: check.cost,
        message: `This workflow costs ${check.cost} Sparks — you have ${check.balance}. Purchase more at https://www.0nmcp.com/console`,
      }, { status: 402 })
    }
    await deductSparks(user.id, 'console.workflow.run', 'Daily social media workflow', { source: 'skill-workflow' })
  }

  const admin = getSkillAdmin()
  const results: {
    platform: string
    content: string
    title: string
    posted: boolean
    post_id?: string
    error?: string
    scheduled_for?: string
  }[] = []

  for (const platform of platforms) {
    try {
      // Step 1: Pick a topic or use custom one
      let title: string
      let generatedBody: string

      if (userTopic) {
        // Generate from user-provided topic
        const generated = await generateFromTopic(userTopic, platform, niche)
        title = generated.title
        generatedBody = generated.body
      } else {
        // Pick from content_topics database
        const topic = await pickTopic(platform)
        if (!topic) {
          // Fallback: generate a generic industry tip
          const generated = await generateFromTopic(
            `Share a practical industry tip about ${niche}`,
            platform,
            niche
          )
          title = generated.title
          generatedBody = generated.body
        } else {
          const generated = await generateContent(topic, platform, 'post')
          title = generated.title
          generatedBody = generated.body
        }
      }

      // Step 2: Preview mode — return without posting
      if (preview) {
        results.push({
          platform,
          content: generatedBody,
          title,
          posted: false,
        })
        continue
      }

      // Step 3: Queue in content_queue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: queued } = await (admin.from('content_queue') as any).insert({
        platform,
        content_type: 'post',
        title: title || null,
        body: generatedBody,
        metadata: {
          source: 'daily-social-workflow',
          niche,
          user_id: user.id,
          user_email: user.email,
        },
        status: schedule_for ? 'scheduled' : 'approved',
        scheduled_for: schedule_for || null,
        generated_by: 'skill-workflow',
      }).select('id').single()

      // Step 4: Post to CRM Social API (LinkedIn, Facebook, etc.)
      if (!schedule_for) {
        const accountMap = await resolveAccountIds([platform])
        const accountIds = accountMap.get(platform)

        if (accountIds && accountIds.length > 0) {
          const postResult = await createSocialPost({
            accountIds,
            content: generatedBody,
            tags: ['0nMCP', 'AI', 'automation'],
          })

          if (postResult.success) {
            // Update queue status
            if (queued?.id) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await (admin.from('content_queue') as any).update({
                status: 'posted',
                posted_at: new Date().toISOString(),
              }).eq('id', queued.id)
            }

            results.push({
              platform,
              content: generatedBody,
              title,
              posted: true,
              post_id: postResult.postId,
            })
          } else {
            results.push({
              platform,
              content: generatedBody,
              title,
              posted: false,
              error: postResult.error || 'CRM posting failed',
            })
          }
        } else {
          results.push({
            platform,
            content: generatedBody,
            title,
            posted: false,
            error: `No ${platform} account connected in CRM. Connect it at your CRM Social Planner.`,
          })
        }
      } else {
        results.push({
          platform,
          content: generatedBody,
          title,
          posted: false,
          scheduled_for: schedule_for,
        })
      }
    } catch (err) {
      results.push({
        platform,
        content: '',
        title: '',
        posted: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  const successCount = results.filter(r => r.posted).length
  const scheduledCount = results.filter(r => r.scheduled_for).length

  return NextResponse.json({
    ok: true,
    summary: {
      posted: successCount,
      scheduled: scheduledCount,
      failed: results.length - successCount - scheduledCount,
      total: results.length,
    },
    results,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Generate content from a free-form topic string using Claude
 */
async function generateFromTopic(
  topic: string,
  platform: string,
  niche: string
): Promise<{ title: string; body: string }> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY required for content generation')

  const platformGuidelines: Record<string, string> = {
    linkedin: `LinkedIn post:
- Professional but conversational tone
- Start with a hook — surprising stat, bold claim, or question
- Use line breaks for readability
- 150-300 words
- Include 3-5 relevant hashtags at the end
- End with a call to action or question`,
    facebook: `Facebook post:
- Casual, engaging tone
- 100-200 words
- Include a question to drive comments
- Use emojis sparingly (1-2)`,
    instagram: `Instagram caption:
- Visual storytelling tone
- 100-150 words
- Include 5-10 relevant hashtags
- End with a CTA`,
  }

  const guidelines = platformGuidelines[platform] || platformGuidelines.linkedin

  const prompt = `You are a thought leader in ${niche}. Write a daily social media post.

TOPIC: ${topic}
PLATFORM: ${platform}

${guidelines}

Write an insightful, practical tip that provides genuine value. No fluff, no generic advice.
Share something specific and actionable that your audience can use today.

Respond in JSON format:
{
  "title": "Brief headline (empty string if not needed)",
  "body": "The full post content"
}`

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
    const err = await response.text()
    throw new Error(`Claude API error: ${response.status} — ${err}`)
  }

  const data = await response.json()
  const text = data.content?.[0]?.text || ''

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Failed to parse AI response')

  const parsed = JSON.parse(jsonMatch[0])
  return {
    title: parsed.title || '',
    body: parsed.body || text,
  }
}

/**
 * GET /api/skill/workflows/daily-social — Get workflow info and recent posts
 */
export async function GET(request: NextRequest) {
  const user = await verifySkillToken(request.headers.get('authorization'))
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = getSkillAdmin()

  // Get recent posts from this workflow
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: recentPosts } = await (admin.from('content_queue') as any)
    .select('id, platform, title, status, posted_at, scheduled_for, created_at')
    .eq('generated_by', 'skill-workflow')
    .order('created_at', { ascending: false })
    .limit(10)

  // Get connected CRM social accounts
  const accountMap = await resolveAccountIds(['linkedin', 'facebook', 'instagram'])

  return NextResponse.json({
    workflow: {
      name: 'Daily Social Media Posts',
      description: 'AI-generated industry tips posted to LinkedIn + GHL channels',
      cost: '5 Sparks per run',
      platforms: ['linkedin', 'facebook', 'instagram'],
    },
    connected_accounts: {
      linkedin: (accountMap.get('linkedin') || []).length,
      facebook: (accountMap.get('facebook') || []).length,
      instagram: (accountMap.get('instagram') || []).length,
    },
    recent_posts: recentPosts || [],
  })
}
