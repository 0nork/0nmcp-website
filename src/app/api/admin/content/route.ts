import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getAdmin, generateAndQueue } from '@/lib/content-engine'

const ADMIN_EMAILS = ['mike@rocketopp.com']

async function requireAdmin() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase!.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return null
  }
  return user
}

/**
 * GET /api/admin/content — List content queue
 * Query params: status, platform, limit, offset
 */
export async function GET(request: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const status = searchParams.get('status')
  const platform = searchParams.get('platform')
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')

  const admin = getAdmin()
  let query = admin
    .from('content_queue')
    .select('*, content_topics(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) query = query.eq('status', status)
  if (platform) query = query.eq('platform', platform)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Also get summary stats
  const { data: stats } = await admin.rpc('content_stats').single()

  return NextResponse.json({ items: data, total: count, stats })
}

/**
 * POST /api/admin/content — Generate new content
 * Body: { platform, content_type, topic_category? }
 */
export async function POST(request: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { platform, content_type, topic_category } = await request.json()

    if (!platform || !content_type) {
      return NextResponse.json({ error: 'platform and content_type required' }, { status: 400 })
    }

    const item = await generateAndQueue(platform, content_type, topic_category)
    return NextResponse.json({ item })
  } catch (err) {
    console.error('Content generation error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
