import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { scanRedditOpportunities, trackEngagement, adjustWeights, redditToForum } from '@/lib/reddit-engine'
import { generateContent, pickTopic, generateAndQueue } from '@/lib/content-engine'
import { createSocialPost, resolveAccountIds } from '@/lib/crm-social'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

const CRON_SECRET = process.env.CRON_SECRET
const INSTALL_URL = 'https://www.0nmcp.com/install0n'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/cron/viral-campaign
 *
 * Runs every 4 hours. Continuous viral distribution engine:
 *
 * Phase 1: SCAN — Mine Reddit for MCP opportunities
 * Phase 2: GENERATE — Create LinkedIn + Reddit content
 * Phase 3: POST — Publish to LinkedIn via CRM Social API
 * Phase 4: CROSS-POLLINATE — Reddit ↔ Forum sync
 * Phase 5: TRACK — Check engagement on posted content
 * Phase 6: LEARN — Adjust weights based on performance
 *
 * Vercel cron: "0 */4 * * *" (every 4 hours)
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getAdmin()
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    phases: {},
  }

  // ── Phase 1: SCAN Reddit ──
  try {
    const scan = await scanRedditOpportunities(8)
    ;(results.phases as Record<string, unknown>).scan = scan
  } catch (err) {
    ;(results.phases as Record<string, unknown>).scan = { error: err instanceof Error ? err.message : 'Scan failed' }
  }

  // ── Phase 2: GENERATE LinkedIn post ──
  try {
    // Generate a LinkedIn post from content topics
    const topic = await pickTopic('linkedin')
    if (topic) {
      const { title, body } = await generateContent(topic, 'linkedin', 'post')

      // Append install0n CTA if not already present
      let postBody = body
      if (!postBody.includes('0nmcp.com')) {
        postBody += `\n\nTry it yourself (free, 60 seconds): ${INSTALL_URL}`
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin.from('content_queue') as any).insert({
        topic_id: topic.id,
        platform: 'linkedin',
        content_type: 'post',
        title: title || null,
        body: postBody,
        metadata: {
          source: 'viral-campaign-cron',
          target_url: INSTALL_URL,
          topic_category: topic.category,
          topic_keywords: topic.keywords,
        },
        status: 'approved',
        generated_by: 'viral-campaign-cron',
      })

      // Post immediately to LinkedIn
      const accountMap = await resolveAccountIds(['linkedin'])
      const accountIds = accountMap.get('linkedin') || []

      if (accountIds.length > 0) {
        const postResult = await createSocialPost({
          accountIds,
          content: postBody,
          tags: ['MCP', 'AI', 'Claude', 'automation'],
        })
        ;(results.phases as Record<string, unknown>).generate = {
          linkedin_generated: true,
          linkedin_posted: postResult.success,
          post_id: postResult.postId,
        }
      } else {
        ;(results.phases as Record<string, unknown>).generate = {
          linkedin_generated: true,
          linkedin_posted: false,
          reason: 'No LinkedIn account in CRM',
        }
      }
    }

    // Also queue a Reddit post
    try {
      await generateAndQueue('reddit', 'post')
      ;((results.phases as Record<string, unknown>).generate as Record<string, unknown>).reddit_queued = true
    } catch {
      // Non-critical — may have no Reddit topics
    }
  } catch (err) {
    ;(results.phases as Record<string, unknown>).generate = { error: err instanceof Error ? err.message : 'Generate failed' }
  }

  // ── Phase 3: CROSS-POLLINATE ──
  try {
    const crossPoll = await redditToForum(2)
    ;(results.phases as Record<string, unknown>).cross_pollinate = crossPoll
  } catch (err) {
    ;(results.phases as Record<string, unknown>).cross_pollinate = { error: err instanceof Error ? err.message : 'Cross-pollination failed' }
  }

  // ── Phase 4: TRACK engagement ──
  try {
    const tracking = await trackEngagement()
    ;(results.phases as Record<string, unknown>).track = tracking
  } catch (err) {
    ;(results.phases as Record<string, unknown>).track = { error: err instanceof Error ? err.message : 'Tracking failed' }
  }

  // ── Phase 5: LEARN from performance ──
  try {
    const learning = await adjustWeights()
    ;(results.phases as Record<string, unknown>).learn = learning
  } catch (err) {
    ;(results.phases as Record<string, unknown>).learn = { error: err instanceof Error ? err.message : 'Learning failed' }
  }

  return NextResponse.json(results)
}
