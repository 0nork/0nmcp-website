import { NextResponse } from 'next/server'
import { publishPostById } from '@/lib/cro9/publisher'

/**
 * POST /api/blog/publish
 *
 * Publish a draft blog post by its ID.
 * Updates the status to 'published' and sets publishedAt.
 *
 * Body:
 * - postId: string (UUID of the blog post)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { postId } = body as { postId: string }

    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      )
    }

    const result = await publishPostById(postId)

    return NextResponse.json({
      slug: result.slug,
      title: result.title,
      publishedAt: result.publishedAt,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error'
    console.error('[/api/blog/publish] Error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
