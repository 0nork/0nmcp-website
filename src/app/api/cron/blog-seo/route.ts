import { NextResponse } from 'next/server'
import { scorePages } from '@/lib/cro9/scorer'
import { generateBriefs } from '@/lib/cro9/brief-generator'
import { generateBlogPost } from '@/lib/cro9/blog-generator'
import { fetchSearchData } from '@/lib/cro9/search-console'
import { saveDraft } from '@/lib/cro9/publisher'
import { evaluateOutcomes, summarizeOutcomes } from '@/lib/cro9/outcome-evaluator'
import { adjustWeights, normalizeWeights } from '@/lib/cro9/weight-adjuster'
import { createSupabaseServer } from '@/lib/supabase/server'
import type { WeightConfig, ActionRecord, PageData } from '@/lib/cro9/types'
import { DEFAULT_WEIGHTS } from '@/lib/cro9/types'

/**
 * GET /api/cron/blog-seo
 *
 * Scheduled CRO9 + blog generation cron job.
 * Runs daily at 6 AM via Vercel cron.
 *
 * Pipeline:
 * 1. Fetch Search Console data
 * 2. Load adaptive weights
 * 3. Run learning cycle (evaluate past actions, adjust weights)
 * 4. Score and analyze pages
 * 5. Generate briefs for top 3 opportunities
 * 6. Auto-generate blog posts as drafts
 * 7. Save all results to Supabase
 */
export async function GET() {
  const startTime = Date.now()
  const results: string[] = []

  try {
    const supabase = await createSupabaseServer()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      )
    }

    // Step 1: Fetch Search Console data
    results.push('[Step 1] Fetching Search Console data...')
    const siteUrl = process.env.SITE_URL || 'https://0nmcp.com/'
    let pageData: PageData[]
    try {
      pageData = await fetchSearchData(siteUrl, 28)
      results.push(`Fetched ${pageData.length} pages from Search Console`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      results.push(`Search Console fetch failed: ${msg}`)
      // Save error run
      await supabase.from('seo_runs').insert({
        pages_analyzed: 0,
        actions_generated: 0,
        status: 'failed',
        completed_at: new Date().toISOString(),
      })
      return NextResponse.json({
        success: false,
        error: `Search Console unavailable: ${msg}`,
        steps: results,
        duration: Date.now() - startTime,
      })
    }

    if (pageData.length === 0) {
      results.push('No data returned from Search Console')
      return NextResponse.json({
        success: false,
        steps: results,
        duration: Date.now() - startTime,
      })
    }

    // Step 2: Load current weights
    results.push('[Step 2] Loading adaptive weights...')
    let weights: WeightConfig = { ...DEFAULT_WEIGHTS }
    const { data: weightRow } = await supabase
      .from('seo_weights')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (weightRow) {
      weights = {
        impressions: weightRow.impressions,
        position: weightRow.position,
        ctrGap: weightRow.ctr_gap,
        conversions: weightRow.conversions,
        freshness: weightRow.freshness,
      }
    }
    results.push(`Active weights: ${JSON.stringify(weights)}`)

    // Step 3: Run learning cycle
    results.push('[Step 3] Running learning cycle...')
    const { data: pastActions } = await supabase
      .from('seo_actions')
      .select('id, bucket, brief, status, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(100)

    if (pastActions && pastActions.length > 0) {
      // Convert to ActionRecord format
      const actionRecords: ActionRecord[] = pastActions
        .filter((a) => a.brief && typeof a.brief === 'object')
        .map((a) => ({
          id: a.id,
          pageUrl: (a.brief as Record<string, string>).url || '',
          bucket: a.bucket as ActionRecord['bucket'],
          originalMetrics: {
            clicks: 0,
            impressions: 0,
            position: 0,
            ctr: 0,
          },
          createdAt: a.created_at,
          status: 'pending' as const,
        }))

      const outcomes = evaluateOutcomes(actionRecords, pageData)
      const summary = summarizeOutcomes(outcomes)
      results.push(
        `Learning: ${summary.successes} successes, ${summary.failures} failures out of ${summary.total} evaluated`
      )

      if (outcomes.length > 0) {
        const newWeights = adjustWeights(weights, outcomes)
        const normalized = normalizeWeights(newWeights)

        // Save new weights
        await supabase
          .from('seo_weights')
          .update({ active: false })
          .eq('active', true)

        await supabase.from('seo_weights').insert({
          impressions: normalized.impressions,
          position: normalized.position,
          ctr_gap: normalized.ctrGap,
          conversions: normalized.conversions,
          freshness: normalized.freshness,
          active: true,
        })

        weights = normalized
        results.push(`Weights adjusted: ${JSON.stringify(normalized)}`)

        // Mark evaluated actions
        for (const outcome of outcomes) {
          const action = pastActions.find(
            (a) =>
              a.brief &&
              typeof a.brief === 'object' &&
              (a.brief as Record<string, string>).url === outcome.pageUrl
          )
          if (action) {
            await supabase
              .from('seo_actions')
              .update({
                status: 'evaluated',
                outcome: outcome,
                evaluated_at: new Date().toISOString(),
              })
              .eq('id', action.id)
          }
        }
      }
    } else {
      results.push('No past actions to evaluate')
    }

    // Step 4: Score pages
    results.push('[Step 4] Scoring pages...')
    const scored = scorePages(pageData, weights)
    results.push(`Scored ${scored.length} pages`)

    // Step 5: Generate briefs for top 3
    results.push('[Step 5] Generating content briefs...')
    const topPages = scored.slice(0, 3)
    const briefs = generateBriefs(topPages)
    results.push(`Generated ${briefs.length} content briefs`)

    // Step 6: Auto-generate blog posts
    results.push('[Step 6] Generating blog posts...')
    const generatedPosts: { id: string; title: string }[] = []

    for (const brief of briefs) {
      try {
        const post = await generateBlogPost(brief)
        const postId = await saveDraft(post)
        generatedPosts.push({ id: postId, title: post.title })
        results.push(`Generated draft: "${post.title}" (${post.wordCount} words)`)
      } catch (genError) {
        const msg =
          genError instanceof Error ? genError.message : 'Unknown error'
        results.push(`Failed to generate post for "${brief.query}": ${msg}`)
      }
    }

    // Step 7: Save run
    results.push('[Step 7] Saving run results...')
    const { data: runData } = await supabase
      .from('seo_runs')
      .insert({
        pages_analyzed: pageData.length,
        actions_generated: topPages.length,
        weight_id: weightRow?.id || null,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    // Save scored pages
    if (runData?.id) {
      const pageRows = scored.slice(0, 50).map((page) => ({
        url: page.url,
        query: page.query,
        impressions: page.impressions,
        clicks: page.clicks,
        ctr: page.ctr,
        position: page.position,
        score: page.score,
        bucket: page.bucket,
        factors: page.factors,
        run_id: runData.id,
      }))

      await supabase.from('seo_pages').insert(pageRows)

      // Save actions
      const actionRows = briefs.map((brief) => ({
        bucket: brief.bucket,
        brief: brief,
        status: 'pending',
      }))

      await supabase.from('seo_actions').insert(actionRows)
    }

    const duration = Date.now() - startTime
    results.push(`\nCRO9 cron complete in ${duration}ms`)
    results.push(
      `Generated ${generatedPosts.length} blog posts as drafts`
    )

    return NextResponse.json({
      success: true,
      pagesAnalyzed: pageData.length,
      postsGenerated: generatedPosts.length,
      posts: generatedPosts,
      steps: results,
      duration,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('[/api/cron/blog-seo] Error:', message)
    return NextResponse.json(
      {
        success: false,
        error: message,
        steps: results,
        duration: Date.now() - startTime,
      },
      { status: 500 }
    )
  }
}
