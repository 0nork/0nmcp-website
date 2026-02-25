import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { RedditClient } from '@/lib/qa/reddit'

// GET: Search/monitor Reddit posts
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')
  const subreddit = request.nextUrl.searchParams.get('subreddit')
  const sort = request.nextUrl.searchParams.get('sort') as 'relevance' | 'hot' | 'top' | 'new' | 'comments' | null
  const time = request.nextUrl.searchParams.get('time') as 'hour' | 'day' | 'week' | 'month' | 'year' | 'all' | null
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '25')
  const action = request.nextUrl.searchParams.get('action')

  // Validate Reddit credentials
  if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'Reddit credentials not configured. Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET.' },
      { status: 500 }
    )
  }

  const client = new RedditClient()

  try {
    // Get new posts from a subreddit
    if (action === 'new' && subreddit) {
      const posts = await client.getNewPosts(subreddit, limit)
      return NextResponse.json({ posts, subreddit, count: posts.length })
    }

    // Get comments for a post
    if (action === 'comments') {
      const postId = request.nextUrl.searchParams.get('postId')
      if (!postId) {
        return NextResponse.json({ error: 'postId required for comments' }, { status: 400 })
      }
      const comments = await client.getPostComments(postId)
      return NextResponse.json({ comments, postId, count: comments.length })
    }

    // Default: Search posts
    if (!query) {
      return NextResponse.json({ error: 'Query parameter q is required' }, { status: 400 })
    }

    const posts = await client.searchPosts(query, {
      subreddit: subreddit || undefined,
      sort: sort || 'relevance',
      time: time || 'week',
      limit,
    })

    return NextResponse.json({
      posts,
      query,
      subreddit: subreddit || 'all',
      count: posts.length,
    })
  } catch (error) {
    console.error('Reddit API error:', error)
    return NextResponse.json(
      { error: `Reddit API error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

// POST: Submit content to Reddit
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'Reddit credentials not configured' },
      { status: 500 }
    )
  }

  let body: {
    action: 'post' | 'comment'
    subreddit?: string
    title?: string
    text?: string
    url?: string
    flair?: string
    postId?: string
    contentId?: string // Reference to qa_content record
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const client = new RedditClient()

  try {
    if (body.action === 'post') {
      // Submit a post
      if (!body.subreddit || !body.title) {
        return NextResponse.json({ error: 'subreddit and title are required' }, { status: 400 })
      }

      const result = await client.submitPost(body.subreddit, body.title, {
        text: body.text,
        url: body.url,
        flair: body.flair,
      })

      // If we have a contentId, create a distribution record
      if (body.contentId) {
        await supabase.from('qa_distributions').insert({
          content_id: body.contentId,
          platform: 'reddit',
          platform_url: result.url,
          status: 'completed',
          response: {
            reddit_id: result.id,
            subreddit: body.subreddit,
          },
          distributed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })

        // Update content status
        await supabase
          .from('qa_content')
          .update({ status: 'distributed' })
          .eq('id', body.contentId)
      }

      return NextResponse.json({
        success: true,
        id: result.id,
        url: result.url,
        subreddit: body.subreddit,
      })
    }

    if (body.action === 'comment') {
      // Submit a comment
      if (!body.postId || !body.text) {
        return NextResponse.json({ error: 'postId and text are required' }, { status: 400 })
      }

      const result = await client.submitComment(body.postId, body.text)

      // If we have a contentId, create a distribution record
      if (body.contentId) {
        await supabase.from('qa_distributions').insert({
          content_id: body.contentId,
          platform: 'reddit',
          platform_url: result.permalink,
          status: 'completed',
          response: {
            comment_id: result.id,
            post_id: body.postId,
          },
          distributed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })

        await supabase
          .from('qa_content')
          .update({ status: 'distributed' })
          .eq('id', body.contentId)
      }

      return NextResponse.json({
        success: true,
        id: result.id,
        permalink: result.permalink,
      })
    }

    return NextResponse.json({ error: 'Invalid action. Use "post" or "comment".' }, { status: 400 })
  } catch (error) {
    console.error('Reddit submission error:', error)
    return NextResponse.json(
      { error: `Reddit submission failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
