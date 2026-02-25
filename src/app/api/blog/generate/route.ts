import { NextResponse } from 'next/server'
import { generateBlogPost } from '@/lib/cro9/blog-generator'
import { saveDraft } from '@/lib/cro9/publisher'
import type { ContentBrief, ActionBucket } from '@/lib/cro9/types'

/**
 * POST /api/blog/generate
 *
 * Generate a blog post from a CRO9 content brief or a query string.
 * Saves the generated post as a draft in Supabase.
 *
 * Body:
 * - query: string (the target search query)
 * - bucket?: ActionBucket (defaults to STRIKING_DISTANCE)
 * - url?: string (the page URL being optimized)
 * - wordCount?: { min: number; max: number }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      query,
      bucket = 'STRIKING_DISTANCE',
      url = '',
      wordCount,
    } = body as {
      query: string
      bucket?: ActionBucket
      url?: string
      wordCount?: { min: number; max: number }
    }

    if (!query && !url) {
      return NextResponse.json(
        { error: 'Either query or url is required' },
        { status: 400 }
      )
    }

    // Build a content brief from the request params
    const brief: ContentBrief = {
      url: url || '',
      query: query || url,
      bucket: bucket as ActionBucket,
      wordCount: wordCount || {
        min: bucket === 'RELEVANCE_REBUILD' ? 2200 : 1000,
        max: bucket === 'RELEVANCE_REBUILD' ? 3200 : 1600,
      },
      structure: {
        paragraphWords: { min: 40, max: 85 },
        h2Frequency: {
          min: Math.max(2, Math.floor(1300 / 260)),
          max: Math.ceil(1300 / 180),
        },
      },
      keywords: {
        density: { min: 0.006, max: 0.012 },
        placements: [
          'Title tag (1x, front-loaded)',
          'H1 (1x exact match)',
          'First 100 words (1x)',
          'One H2 (1x exact or close variant)',
          'Last 120 words (1x)',
          'URL slug',
          'Meta description',
        ],
      },
      requiredSections: [
        'Author Box',
        'Proof Block',
        'Sources (2-3 external citations)',
        'Last Updated',
        'FAQ Section (5-8 questions)',
      ],
      priority: 80,
    }

    // Generate the blog post using Claude
    const blogPost = await generateBlogPost(brief)

    // Save as draft in Supabase
    const postId = await saveDraft(blogPost)

    return NextResponse.json({
      post: {
        id: postId,
        ...blogPost,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('[/api/blog/generate] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
