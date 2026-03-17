import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import blogData from '@/data/blog-posts.json'
import { createBaseFeed, renderFeed, SITE_URL } from '@/lib/rss'

export const dynamic = 'force-dynamic'

interface FeedPost {
  slug: string; title: string; date: string; excerpt: string
  body: string; author: string; tags: string[]; image: string
}

async function getFeedPosts(): Promise<FeedPost[]> {
  let dbPosts: FeedPost[] = []
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) {
    try {
      const admin = createClient(url, key)
      const { data } = await admin
        .from('blog_posts')
        .select('slug, title, published_at, created_at, excerpt, meta_description, body, content, author, tags, image')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
      dbPosts = (data || []).map((p: any) => ({
        slug: p.slug, title: p.title,
        date: (p.published_at || p.created_at || '')?.split('T')[0],
        excerpt: p.excerpt || p.meta_description || '',
        body: p.body || p.content || '',
        author: p.author || 'Mike Mento',
        tags: p.tags || [],
        image: p.image || `/blog/${p.slug}.svg`,
      }))
    } catch { /* fallback */ }
  }
  const dbSlugs = new Set(dbPosts.map(p => p.slug))
  return [
    ...dbPosts,
    ...(blogData.posts as any[]).filter(p => !dbSlugs.has(p.slug)).map(p => ({
      slug: p.slug, title: p.title, date: p.date,
      excerpt: p.excerpt, body: p.body, author: p.author,
      tags: p.tags, image: p.image,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get('format')

  const feed = createBaseFeed({
    title: '0nMCP Blog',
    description: 'Release notes, tutorials, and deep-dives from the team building 0nMCP — the universal AI API orchestrator.',
    feedPath: '/api/feed/blog',
  })

  const posts = await getFeedPosts()

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
