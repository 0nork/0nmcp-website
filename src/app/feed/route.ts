import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1 hour

const SITE_URL = 'https://www.0nmcp.com'
const SITE_TITLE = '0nMCP — Universal AI API Orchestrator'
const SITE_DESCRIPTION = 'The most comprehensive MCP server available. 1,598+ tools across 106 services. Connect any AI to any API.'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('title, slug, excerpt, content, published_at, author, category, tags, meta_description')
    .eq('status', 'published')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(50)

  const items = (posts || []).map(post => {
    const pubDate = new Date(post.published_at).toUTCString()
    const description = post.meta_description || post.excerpt || post.content?.slice(0, 300) || ''
    const tags = Array.isArray(post.tags) ? post.tags : []

    const imageUrl = `${SITE_URL}/api/og/blog?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(post.category || '')}`

    return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <description><![CDATA[${description}]]></description>
      <enclosure url="${imageUrl}" type="image/png" length="0" />
      <media:content url="${imageUrl}" type="image/png" width="1200" height="630" />
      <pubDate>${pubDate}</pubDate>
      <author>${post.author || 'mike@rocketopp.com (Mike Mento)'}</author>
      ${post.category ? `<category>${post.category}</category>` : ''}
      ${tags.map((t: string) => `<category>${t}</category>`).join('\n      ')}
    </item>`
  }).join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${SITE_TITLE}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/brand/icon-green.png</url>
      <title>${SITE_TITLE}</title>
      <link>${SITE_URL}</link>
    </image>
${items}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
