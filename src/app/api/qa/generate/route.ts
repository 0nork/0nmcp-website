import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { MultiPlatformGenerator } from '@/lib/qa/generator'
import { PlatformId, PLATFORMS } from '@/lib/qa/types'

// Default brand context for 0nMCP
const BRAND = {
  websiteUrl: 'https://0nmcp.com',
  websiteName: '0nMCP',
  businessDescription:
    '0nMCP is a universal AI API orchestrator with 550 tools across 26 services. It connects Claude, Slack, Stripe, GitHub, and 22 other services through one MCP server. Open source, MIT licensed, available on npm.',
}

// GET: Fetch stats and recent activity
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const wantsStats = request.nextUrl.searchParams.get('stats')

  if (wantsStats) {
    // Parallel queries for dashboard stats
    const [
      totalRes,
      draftRes,
      distributedRes,
      failedRes,
      pendingRes,
      recentRes,
    ] = await Promise.all([
      supabase.from('qa_content').select('*', { count: 'exact', head: true }),
      supabase.from('qa_content').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      supabase.from('qa_distributions').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('qa_distributions').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
      supabase.from('qa_distributions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase
        .from('qa_content')
        .select('id, topic, platform, status, quality_score, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    // Count unique platforms
    const { data: platformData } = await supabase
      .from('qa_content')
      .select('platform')
    const uniquePlatforms = new Set(platformData?.map((p) => p.platform) || [])

    return NextResponse.json({
      stats: {
        totalContent: totalRes.count || 0,
        drafted: draftRes.count || 0,
        distributed: distributedRes.count || 0,
        failed: failedRes.count || 0,
        pending: pendingRes.count || 0,
        platforms: uniquePlatforms.size,
      },
      recent: recentRes.data || [],
    })
  }

  // Default: return recent content
  const { data, error } = await supabase
    .from('qa_content')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ contents: data })
}

// POST: Generate content
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
  }

  let body: {
    topic: string
    keywords?: string[]
    platforms: PlatformId[]
    variantCount?: number
    contentType?: 'post' | 'answer' | 'comment' | 'article'
    includeBacklinks?: boolean
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { topic, keywords = [], platforms, variantCount = 1, contentType = 'post', includeBacklinks = true } = body

  if (!topic || !platforms || platforms.length === 0) {
    return NextResponse.json({ error: 'topic and platforms are required' }, { status: 400 })
  }

  // Validate platform IDs
  const validPlatforms = platforms.filter((p) => PLATFORMS[p])
  if (validPlatforms.length === 0) {
    return NextResponse.json({ error: 'No valid platforms provided' }, { status: 400 })
  }

  try {
    const generator = new MultiPlatformGenerator()

    const batch = await generator.generateBatch({
      topic,
      targetKeywords: keywords,
      websiteUrl: BRAND.websiteUrl,
      websiteName: BRAND.websiteName,
      businessDescription: BRAND.businessDescription,
      platforms: validPlatforms,
      contentType,
      numberOfVariants: variantCount,
      includeBacklinks,
    })

    // Save to Supabase
    const batchId = batch.requestId
    const insertRows = batch.contents.map((content, index) => ({
      topic,
      keywords,
      platform: content.platform,
      title: content.title || null,
      content: content.body,
      quality_score: (
        (content.scores.authenticity +
          content.scores.value +
          content.scores.seoOptimization +
          content.scores.platformFit) /
        4
      ).toFixed(2),
      reading_level: `Grade ${content.readingLevel}`,
      backlinks: content.backlinks.map((b) => b.url),
      variant_index: index,
      batch_id: batchId,
      status: 'draft',
    }))

    const { data: savedContent, error: saveError } = await supabase
      .from('qa_content')
      .insert(insertRows)
      .select('id, topic, platform, title, content, quality_score, reading_level, status, created_at')

    if (saveError) {
      console.error('Error saving to Supabase:', saveError)
      // Still return the generated content even if save fails
    }

    return NextResponse.json({
      contents: batch.contents.map((c, i) => ({
        ...c,
        dbId: savedContent?.[i]?.id || null,
      })),
      summary: batch.summary,
      batchId,
      saved: !saveError,
    })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: `Generation failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
