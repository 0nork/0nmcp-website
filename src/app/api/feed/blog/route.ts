import { NextRequest, NextResponse } from 'next/server'
import blogData from '@/data/blog-posts.json'
import { createBaseFeed, renderFeed, SITE_URL } from '@/lib/rss'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get('format')

  const feed = createBaseFeed({
    title: '0nMCP Blog',
    description: 'Release notes, tutorials, and deep-dives from the team building 0nMCP — the universal AI API orchestrator.',
    feedPath: '/api/feed/blog',
  })

  const posts = [...blogData.posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  for (const post of posts) {
    feed.addItem({
      title: post.title,
      id: `${SITE_URL}/blog/${post.slug}`,
      link: `${SITE_URL}/blog/${post.slug}`,
      description: post.excerpt,
      content: post.body,
      author: [{ name: post.author }],
      date: new Date(post.date + 'T12:00:00Z'),
      category: post.tags.map(t => ({ name: t })),
      image: post.image ? `${SITE_URL}${post.image}` : undefined,
    })
  }

  const { body, contentType } = renderFeed(feed, format)

  return new NextResponse(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
