import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey)
}

/**
 * GET /api/community/profiles/[id] — Public profile data
 * No auth required. Projects safe fields only.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const admin = getAdmin()
  if (!admin) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  // Fetch profile — safe fields only
  const { data: profile, error } = await admin
    .from('profiles')
    .select('id, full_name, bio, avatar_url, karma, reputation_level, role, interests, created_at, is_persona')
    .eq('id', id)
    .single()

  if (error || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Fetch badges
  const { data: userBadges } = await admin
    .from('community_user_badges')
    .select('earned_at, community_badges(name, slug, icon, description, color, tier)')
    .eq('user_id', id)
    .order('earned_at', { ascending: false })

  // Fetch recent threads (10)
  const { data: threads } = await admin
    .from('community_threads')
    .select('id, title, slug, score, reply_count, view_count, created_at, community_groups(name, slug, icon, color)')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch recent replies (10) with thread info
  const { data: replies } = await admin
    .from('community_posts')
    .select('id, body, score, created_at, thread_id, community_threads(title, slug)')
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json({
    profile,
    badges: userBadges || [],
    threads: threads || [],
    replies: replies || [],
  })
}
