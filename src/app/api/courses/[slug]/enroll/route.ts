import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * POST /api/courses/[slug]/enroll — Enroll in a course
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  // Get course
  const { data: course } = await supabase
    .from('courses')
    .select('id, tier_required')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  // Check tier access
  const tierHierarchy: Record<string, number> = { free: 0, supporter: 1, builder: 2, enterprise: 3 }
  const { data: profile } = await supabase
    .from('profiles')
    .select('sponsor_tier')
    .eq('id', user.id)
    .single()

  const userTier = (profile as { sponsor_tier: string | null } | null)?.sponsor_tier || 'free'
  const requiredLevel = tierHierarchy[course.tier_required] || 0
  const userLevel = tierHierarchy[userTier] || 0

  if (userLevel < requiredLevel) {
    return NextResponse.json({
      error: `This course requires ${course.tier_required} tier or higher`,
      required_tier: course.tier_required,
    }, { status: 403 })
  }

  // Enroll (upsert to handle re-enrollment)
  const { data, error } = await supabase
    .from('enrollments')
    .upsert({ user_id: user.id, course_id: course.id }, { onConflict: 'user_id,course_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
