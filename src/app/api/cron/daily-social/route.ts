import { NextRequest, NextResponse } from 'next/server'
import { generateContent, pickTopic } from '@/lib/content-engine'
import { createSocialPost, resolveAccountIds } from '@/lib/crm-social'
import { getAdmin } from '@/lib/content-engine'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const CRON_SECRET = process.env.CRON_SECRET

/**
 * GET /api/cron/daily-social
 *
 * Runs once daily. Generates an industry tip post and publishes
 * to all connected LinkedIn + GHL social accounts.
 *
 * Vercel cron config: "0 14 * * *" (2 PM UTC = 9 AM EST)
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getAdmin()
  const platforms = ['linkedin']
  const results: { platform: string; success: boolean; post_id?: string; error?: string }[] = []

  for (const platform of platforms) {
    try {
      // Pick a topic from the database
      const topic = await pickTopic(platform)
      if (!topic) {
        results.push({ platform, success: false, error: 'No active topics found' })
        continue
      }

      // Generate content
      const { title, body } = await generateContent(topic, platform, 'post')

      // Queue in content_queue
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin.from('content_queue') as any).insert({
        topic_id: topic.id,
        platform,
        content_type: 'post',
        title: title || null,
        body,
        metadata: {
          source: 'daily-social-cron',
          topic_category: topic.category,
          topic_keywords: topic.keywords,
        },
        status: 'approved',
        generated_by: 'daily-social-cron',
      })

      // Post to CRM social accounts
      const accountMap = await resolveAccountIds([platform])
      const accountIds = accountMap.get(platform)

      if (accountIds && accountIds.length > 0) {
        const postResult = await createSocialPost({
          accountIds,
          content: body,
          tags: ['AI', 'automation', 'MCP'],
        })

        results.push({
          platform,
          success: postResult.success,
          post_id: postResult.postId,
          error: postResult.error,
        })
      } else {
        results.push({
          platform,
          success: false,
          error: `No ${platform} account connected in CRM`,
        })
      }
    } catch (err) {
      results.push({
        platform,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  const successCount = results.filter(r => r.success).length

  return NextResponse.json({
    posted: successCount,
    total: results.length,
    results,
    timestamp: new Date().toISOString(),
  })
}
