import { NextRequest, NextResponse } from 'next/server'
import {
  scanRedditOpportunities,
  trackEngagement,
  adjustWeights,
  findForumThreadsForReddit,
  draftFromForumThread,
  redditToForum,
  postToReddit,
} from '@/lib/reddit-engine'
import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

/**
 * GET /api/cron/reddit-engine — Vercel Cron handler
 *
 * Runs the full Reddit Growth Engine loop:
 * 1. SCAN — Find new Reddit opportunities
 * 2. FORUM→REDDIT — Queue trending forum threads for Reddit
 * 3. REDDIT→FORUM — Turn hot Reddit topics into forum discussions
 * 4. POST — Submit approved content to Reddit
 * 5. TRACK — Check engagement on posted content
 * 6. LEARN — Adjust weights from engagement data
 *
 * ?phase=scan|draft|post|track|learn|all (default: all)
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const phase = request.nextUrl.searchParams.get('phase') || 'all'
  const admin = getAdmin()

  const results: Record<string, unknown> = { phase, timestamp: new Date().toISOString() }

  try {
    // ===== PHASE 1: SCAN =====
    if (phase === 'all' || phase === 'scan') {
      const scanResult = await scanRedditOpportunities(5)
      results.scan = scanResult
      console.log('[reddit-engine] Scan:', JSON.stringify(scanResult))
    }

    // ===== PHASE 2: FORUM → REDDIT (draft new content from forum) =====
    if (phase === 'all' || phase === 'draft') {
      const forumThreads = await findForumThreadsForReddit(2)
      const drafted: string[] = []

      for (const thread of forumThreads) {
        const contentId = await draftFromForumThread(thread)
        if (contentId) {
          drafted.push(`${thread.title} → ${contentId}`)

          // Auto-approve content that came from our own forum
          await admin.from('reddit_content')
            .update({ status: 'approved' })
            .eq('id', contentId)
        }
      }

      results.draft = { forumThreadsFound: forumThreads.length, drafted }
      console.log('[reddit-engine] Draft:', JSON.stringify(results.draft))
    }

    // ===== PHASE 3: REDDIT → FORUM =====
    if (phase === 'all' || phase === 'reddit-to-forum') {
      const r2f = await redditToForum(2)
      results.redditToForum = r2f
      console.log('[reddit-engine] Reddit→Forum:', JSON.stringify(r2f))
    }

    // ===== PHASE 4: POST approved content =====
    if (phase === 'all' || phase === 'post') {
      // Check if Reddit credentials exist
      const hasRedditCreds = !!(
        process.env.REDDIT_CLIENT_ID &&
        process.env.REDDIT_CLIENT_SECRET &&
        process.env.REDDIT_USERNAME &&
        process.env.REDDIT_PASSWORD
      )

      if (hasRedditCreds) {
        // Get approved content ready to post
        const { data: approved } = await admin
          .from('reddit_content')
          .select('id')
          .eq('status', 'approved')
          .order('created_at', { ascending: true })
          .limit(2) // Max 2 posts per cron run

        const posted: Array<{ id: string; success: boolean; url?: string; error?: string }> = []

        for (const item of (approved || [])) {
          const result = await postToReddit(item.id)
          posted.push({ id: item.id, ...result })

          // Wait between posts to avoid rate limits
          if (posted.length < (approved?.length || 0)) {
            await new Promise(r => setTimeout(r, 5000))
          }
        }

        results.post = { approved: approved?.length || 0, posted }
      } else {
        results.post = { skipped: 'Reddit credentials not configured' }
      }
      console.log('[reddit-engine] Post:', JSON.stringify(results.post))
    }

    // ===== PHASE 5: TRACK engagement =====
    if (phase === 'all' || phase === 'track') {
      const trackResult = await trackEngagement()
      results.track = trackResult
      console.log('[reddit-engine] Track:', JSON.stringify(trackResult))
    }

    // ===== PHASE 6: LEARN from performance =====
    if (phase === 'all' || phase === 'learn') {
      const learnResult = await adjustWeights()
      results.learn = learnResult
      console.log('[reddit-engine] Learn:', JSON.stringify(learnResult))
    }

    return NextResponse.json({ ok: true, ...results })
  } catch (err) {
    console.error('[reddit-engine] Fatal error:', err)
    return NextResponse.json(
      { error: 'Reddit engine failed', details: err instanceof Error ? err.message : 'unknown' },
      { status: 500 },
    )
  }
}
