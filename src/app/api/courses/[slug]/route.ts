import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * GET /api/courses/[slug] — Course detail + lessons + enrollment status
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  // Get course
  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  // Get lessons (titles + metadata, not full content)
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id, title, slug, order_index, duration_minutes, is_free_preview')
    .eq('course_id', course.id)
    .order('order_index', { ascending: true })

  // Check enrollment
  const { data: { user } } = await supabase.auth.getUser()
  let enrollment = null
  let progress: Record<string, boolean> = {}

  if (user) {
    const { data: enr } = await supabase
      .from('enrollments')
      .select('*')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .single()
    enrollment = enr

    if (enrollment) {
      const { data: prog } = await supabase
        .from('lesson_progress')
        .select('lesson_id, completed')
        .eq('user_id', user.id)
      if (prog) {
        progress = Object.fromEntries(prog.map((p: { lesson_id: string; completed: boolean }) => [p.lesson_id, p.completed]))
      }
    }
  }

  return NextResponse.json({ course, lessons, enrollment, progress })
}
