import { NextRequest, NextResponse } from 'next/server'
import { generateAndQueue } from '@/lib/content-engine'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const CRON_SECRET = process.env.CRON_SECRET

/**
 * GET /api/cron/content-generate
 * Runs every 6 hours. Picks 2-3 topics and generates platform-specific content.
 * Content is inserted into content_queue with status='review' for admin approval
 * or status='approved' for auto-posting.
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get('authorization')
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: { platform: string; contentType: string; success: boolean; error?: string; id?: string }[] = []

  // Generate content for different platforms
  const jobs = [
    { platform: 'reddit', contentType: 'post' },
    { platform: 'linkedin', contentType: 'post' },
    { platform: 'dev_to', contentType: 'article' },
  ]

  // Pick 2-3 jobs (random subset)
  const shuffled = jobs.sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, 2 + Math.floor(Math.random() * 2))

  for (const job of selected) {
    try {
      const item = await generateAndQueue(job.platform, job.contentType)
      results.push({
        platform: job.platform,
        contentType: job.contentType,
        success: true,
        id: item.id,
      })
    } catch (err) {
      results.push({
        platform: job.platform,
        contentType: job.contentType,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
  }

  const successCount = results.filter((r) => r.success).length

  return NextResponse.json({
    generated: successCount,
    total: selected.length,
    results,
    timestamp: new Date().toISOString(),
  })
}
