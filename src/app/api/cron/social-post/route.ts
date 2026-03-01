import { NextRequest, NextResponse } from 'next/server'
import { getAdmin } from '@/lib/content-engine'
import { postContent } from '@/lib/poster'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const CRON_SECRET = process.env.CRON_SECRET

/**
 * GET /api/cron/social-post
 * Runs every 2 hours. Picks up approved/scheduled content from content_queue
 * and posts it to the target platforms.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getAdmin()
  const now = new Date().toISOString()

  // Fetch content that is approved and either has no scheduled_for or scheduled_for <= now
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: items, error } = await (admin.from('content_queue') as any)
    .select('id, platform, status, scheduled_for')
    .in('status', ['approved', 'scheduled'])
    .or(`scheduled_for.is.null,scheduled_for.lte.${now}`)
    .order('created_at', { ascending: true })
    .limit(10) as { data: { id: string; platform: string; status: string; scheduled_for: string | null }[] | null; error: { message: string } | null }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!items || items.length === 0) {
    return NextResponse.json({
      posted: 0,
      message: 'No content ready to post',
      timestamp: now,
    })
  }

  const results: { id: string; platform: string; success: boolean; url?: string; error?: string }[] = []

  for (const item of items) {
    try {
      const result = await postContent(item.id)
      results.push({
        id: item.id,
        platform: result.platform,
        success: result.success,
        url: result.url,
        error: result.error,
      })

      // Also log to social_posts table for console visibility
      if (result.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (admin.from('social_posts') as any).insert({
          content: '',
          platforms: [result.platform],
          status: 'posted',
          results: [{ platform: result.platform, success: true, url: result.url }],
        })
      }
    } catch (err) {
      results.push({
        id: item.id,
        platform: item.platform,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  const successCount = results.filter((r) => r.success).length

  return NextResponse.json({
    posted: successCount,
    failed: results.length - successCount,
    total: results.length,
    results,
    timestamp: now,
  })
}
