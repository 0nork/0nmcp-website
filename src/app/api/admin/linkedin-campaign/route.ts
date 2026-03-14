import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['mike@rocketopp.com']

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!url || !key) return null
  return createClient(url, key)
}

async function requireAdmin() {
  try {
    const supabase = await createSupabaseServer()
    if (!supabase) return null
    const { data: { user }, error } = await supabase.auth.getUser()
    if (!user || error) {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return null
      const sessionUser = session.user
      if (ADMIN_EMAILS.includes(sessionUser.email || '')) return sessionUser
      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', sessionUser.id).single()
      if (profile?.is_admin) return sessionUser
      return null
    }
    if (ADMIN_EMAILS.includes(user.email || '')) return user
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (profile?.is_admin) return user
    return null
  } catch {
    return null
  }
}

/**
 * GET /api/admin/linkedin-campaign
 * Returns full campaign dashboard data: members, variants, segments, recent posts, tool calls
 */
export async function GET(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getServiceClient()
  if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

  const section = req.nextUrl.searchParams.get('section') || 'overview'

  try {
    if (section === 'overview') {
      const [members, variants, segments, posts, toolCalls] = await Promise.all([
        db.from('linkedin_members').select('id, linkedin_name, linkedin_headline, archetype, automated_posting_enabled, posting_frequency, total_posts, total_engagements, onboarding_completed, last_post_at, created_at').order('created_at', { ascending: false }),
        db.from('lvos_variants').select('*').order('created_at', { ascending: true }),
        db.from('cucia_segment_model').select('*').order('sample_size', { ascending: false }),
        db.from('automated_posts').select('id, member_id, content, linkedin_post_id, posted_at, engagement_metrics, created_at').order('created_at', { ascending: false }).limit(25),
        db.from('linkedin_tool_calls').select('id, tool_name, member_id, success, execution_time_ms, created_at').order('created_at', { ascending: false }).limit(50),
      ])

      const totalMembers = members.data?.length || 0
      const automatedMembers = members.data?.filter(m => m.automated_posting_enabled).length || 0
      const onboardedMembers = members.data?.filter(m => m.onboarding_completed).length || 0
      const totalPosts = members.data?.reduce((sum, m) => sum + (m.total_posts || 0), 0) || 0
      const totalEngagements = members.data?.reduce((sum, m) => sum + (m.total_engagements || 0), 0) || 0

      return NextResponse.json({
        stats: {
          totalMembers,
          automatedMembers,
          onboardedMembers,
          totalPosts,
          totalEngagements,
          totalVariants: variants.data?.length || 0,
          totalSegments: segments.data?.length || 0,
        },
        members: members.data || [],
        variants: variants.data || [],
        segments: segments.data || [],
        recentPosts: posts.data || [],
        recentToolCalls: toolCalls.data || [],
      })
    }

    if (section === 'selections') {
      const { data } = await db.from('lvos_selections').select('*, lvos_variants(question_text, variant_key)').order('created_at', { ascending: false }).limit(50)
      return NextResponse.json({ selections: data || [] })
    }

    if (section === 'ai-interactions') {
      const { data } = await db.from('ai_interactions').select('*').order('created_at', { ascending: false }).limit(50)
      return NextResponse.json({ interactions: data || [] })
    }

    return NextResponse.json({ error: 'Unknown section' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

/**
 * POST /api/admin/linkedin-campaign
 * Admin actions: toggle automation, update frequency, trigger cron, update variant weights
 */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getServiceClient()
  if (!db) return NextResponse.json({ error: 'DB unavailable' }, { status: 500 })

  try {
    const body = await req.json()
    const { action } = body

    switch (action) {
      case 'toggle_member_automation': {
        const { member_id, enabled } = body
        const { error } = await db.from('linkedin_members').update({ automated_posting_enabled: enabled }).eq('id', member_id)
        if (error) throw error
        return NextResponse.json({ success: true, member_id, enabled })
      }

      case 'update_member_frequency': {
        const { member_id, frequency } = body
        const { error } = await db.from('linkedin_members').update({ posting_frequency: frequency }).eq('id', member_id)
        if (error) throw error
        return NextResponse.json({ success: true, member_id, frequency })
      }

      case 'bulk_toggle_automation': {
        const { enabled } = body
        const { error } = await db.from('linkedin_members').update({ automated_posting_enabled: enabled }).neq('id', '')
        if (error) throw error
        return NextResponse.json({ success: true, enabled, scope: 'all' })
      }

      case 'update_variant': {
        const { variant_id, alpha, beta } = body
        const update: Record<string, number> = {}
        if (alpha !== undefined) update.alpha = alpha
        if (beta !== undefined) update.beta = beta
        const { error } = await db.from('lvos_variants').update(update).eq('id', variant_id)
        if (error) throw error
        return NextResponse.json({ success: true, variant_id })
      }

      case 'trigger_cron': {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000'
        const cronUrl = `${baseUrl}/api/cron/linkedin-posts`
        const res = await fetch(cronUrl)
        const data = await res.json()
        return NextResponse.json({ success: true, cronResult: data })
      }

      case 'reset_variant_weights': {
        const { variant_id } = body
        const { error } = await db.from('lvos_variants').update({ alpha: 1, beta: 1 }).eq('id', variant_id)
        if (error) throw error
        return NextResponse.json({ success: true, variant_id, alpha: 1, beta: 1 })
      }

      case 'delete_variant': {
        const { variant_id } = body
        const { error } = await db.from('lvos_variants').delete().eq('id', variant_id)
        if (error) throw error
        return NextResponse.json({ success: true, variant_id })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
