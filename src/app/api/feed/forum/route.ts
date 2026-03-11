import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createBaseFeed, renderFeed } from '@/lib/rss'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey)
}

export async function GET(request: NextRequest) {
  const admin = getAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const format = request.nextUrl.searchParams.get('format') || 'rss'

  const { data: threads } = await admin
    .from('community_threads')
    .select(`
      id, title, slug, body, created_at, score, reply_count, view_count,
      profiles(full_name, email),
      community_groups(name, slug)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  const feed = createBaseFeed({
    title: '0nMCP Forum — Agentic AI & MCP Discussions',
    description: 'The latest threads from the 0nMCP community forum — MCP server development, agentic AI workflows, AI orchestration, and more.',
    feedPath: '/api/feed/forum',
  })

  for (const t of threads || []) {
    // Supabase joins can return object or array — normalize
    const profile = Array.isArray(t.profiles) ? t.profiles[0] : t.profiles
    const groupData = Array.isArray(t.community_groups) ? t.community_groups[0] : t.community_groups
    const author = profile?.full_name || profile?.email?.split('@')[0] || 'Anonymous'
    const group = groupData?.name || 'General'

    feed.addItem({
      title: t.title,
      id: `https://www.0nmcp.com/forum/${t.slug}`,
      link: `https://www.0nmcp.com/forum/${t.slug}`,
      description: t.body.slice(0, 300).replace(/\n/g, ' '),
      content: t.body,
      author: [{ name: author }],
      date: new Date(t.created_at),
      category: [{ name: group }],
    })
  }

  const { body, contentType } = renderFeed(feed, format)

  return new NextResponse(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
    },
  })
}
