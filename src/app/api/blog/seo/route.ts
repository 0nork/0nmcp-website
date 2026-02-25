import { NextResponse } from 'next/server'
import { scorePages } from '@/lib/cro9/scorer'
import { bucketPages } from '@/lib/cro9/bucketer'
import { generateBriefs } from '@/lib/cro9/brief-generator'
import { fetchSearchData } from '@/lib/cro9/search-console'
import { createSupabaseServer } from '@/lib/supabase/server'
import type { PageData, WeightConfig } from '@/lib/cro9/types'
import { DEFAULT_WEIGHTS } from '@/lib/cro9/types'

/**
 * POST /api/blog/seo
 *
 * Run CRO9 SEO analysis pipeline:
 * 1. Fetch Search Console data (or accept uploaded data)
 * 2. Load adaptive weights from Supabase
 * 3. Score and bucket all pages
 * 4. Generate content briefs for top opportunities
 * 5. Save run results to Supabase
 *
 * Body:
 * - action: 'analyze' (required)
 * - siteUrl?: string (defaults to env SITE_URL)
 * - days?: number (defaults to 28)
 * - uploadedData?: PageData[] (skip Search Console and use provided data)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      action,
      siteUrl,
      days = 28,
      uploadedData,
    } = body as {
      action: string
      siteUrl?: string
      days?: number
      uploadedData?: PageData[]
    }

    if (action !== 'analyze') {
      return NextResponse.json(
        { error: 'Invalid action. Use "analyze".' },
        { status: 400 }
      )
    }

    const supabase = await createSupabaseServer()

    // Step 1: Get page data
    let pageData: PageData[]

    if (uploadedData && uploadedData.length > 0) {
      // Use uploaded data (for testing or manual input)
      pageData = uploadedData
    } else {
      // Fetch from Search Console
      const site = siteUrl || process.env.SITE_URL || 'https://0nmcp.com/'
      try {
        pageData = await fetchSearchData(site, days)
      } catch (gscError) {
        // If Search Console fails, return a helpful error
        const msg =
          gscError instanceof Error ? gscError.message : 'Unknown error'
        return NextResponse.json(
          {
            error: `Search Console fetch failed: ${msg}. You can also provide uploadedData in the request body.`,
          },
          { status: 400 }
        )
      }
    }

    if (pageData.length === 0) {
      return NextResponse.json(
        { error: 'No page data available for analysis' },
        { status: 400 }
      )
    }

    // Step 2: Load weights from Supabase (or use defaults)
    let weights: WeightConfig = { ...DEFAULT_WEIGHTS }
    if (supabase) {
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
    }

    // Step 3: Score all pages
    const scored = scorePages(pageData, weights)

    // Step 4: Bucket pages
    const buckets = bucketPages(scored)

    // Step 5: Generate briefs for top opportunities
    const topPages = scored.slice(0, 15)
    const briefs = generateBriefs(topPages)

    // Step 6: Save run to Supabase
    let runId: string | undefined
    if (supabase) {
      // Get weight ID
      const { data: weightRow } = await supabase
        .from('seo_weights')
        .select('id')
        .eq('active', true)
        .limit(1)
        .single()

      // Create run record
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

      runId = runData?.id

      // Save scored pages
      if (runId) {
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
          run_id: runId,
        }))

        await supabase.from('seo_pages').insert(pageRows)

        // Save actions for top opportunities
        const actionRows = topPages.map((page, i) => ({
          page_id: null, // We'd need to look up the page ID
          bucket: page.bucket,
          brief: briefs[i] || null,
          status: 'pending',
        }))

        await supabase.from('seo_actions').insert(actionRows)
      }
    }

    // Build bucket distribution
    const bucketDistribution: Record<string, number> = {}
    for (const [bucket, pages] of buckets) {
      bucketDistribution[bucket] = pages.length
    }

    return NextResponse.json({
      runId,
      pagesAnalyzed: pageData.length,
      actionsGenerated: topPages.length,
      weights,
      bucketDistribution,
      pages: scored.slice(0, 50).map((p) => ({
        url: p.url,
        query: p.query,
        impressions: p.impressions,
        clicks: p.clicks,
        ctr: p.ctr,
        position: p.position,
        score: p.score,
        bucket: p.bucket,
        factors: p.factors,
      })),
      briefs: briefs.slice(0, 10),
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('[/api/blog/seo] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
