import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import blogData from '@/data/blog-posts.json'

export const dynamic = 'force-dynamic'

export async function GET() {
  interface TrendingPost {
    title: string; date: string; slug: string; image: string
  }

  let posts: TrendingPost[] = []

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && key) {
    try {
      const admin = createClient(url, key)
      const { data } = await admin
        .from('blog_posts')
        .select('title, slug, image, published_at, created_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3)
      if (data?.length) {
        posts = data.map((p: any) => ({
          title: p.title,
          slug: p.slug,
          date: new Date(p.published_at || p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          image: p.image || `/blog/${p.slug}.svg`,
        }))
      }
    } catch { /* fallback */ }
  }

  // Fallback/merge with JSON if not enough from DB
  if (posts.length < 3) {
    const dbSlugs = new Set(posts.map(p => p.slug))
    const jsonPosts = (blogData.posts as any[])
      .filter(p => !dbSlugs.has(p.slug))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3 - posts.length)
      .map(p => ({
        title: p.title,
        slug: p.slug,
        date: new Date(p.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        image: p.image || `/blog/${p.slug}.svg`,
      }))
    posts = [...posts, ...jsonPosts]
  }

  return NextResponse.json(posts, {
    headers: { 'Cache-Control': 'public, max-age=600, s-maxage=600' },
  })
}
