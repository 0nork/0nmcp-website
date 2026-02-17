import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * GET /api/courses/[slug]/lessons/[lessonSlug] — Get lesson content
 * Returns full content if enrolled or free preview, otherwise 403
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; lessonSlug: string }> }
) {
  const { slug, lessonSlug } = await params
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  // Get course + lesson
  const { data: course } = await supabase
    .from('courses')
    .select('id, title, slug, tier_required')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('course_id', course.id)
    .eq('slug', lessonSlug)
    .single()

  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

  // Free preview — always accessible
  if (lesson.is_free_preview) {
    return NextResponse.json({ lesson, course, access: 'preview' })
  }

  // Check auth + enrollment
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({
      lesson: { ...lesson, content_markdown: null },
      course,
      access: 'login_required',
    }, { status: 401 })
  }

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .single()

  if (!enrollment) {
    return NextResponse.json({
      lesson: { ...lesson, content_markdown: null },
      course,
      access: 'enroll_required',
    }, { status: 403 })
  }

  // Get completion status
  const { data: progress } = await supabase
    .from('lesson_progress')
    .select('completed, completed_at')
    .eq('user_id', user.id)
    .eq('lesson_id', lesson.id)
    .single()

  return NextResponse.json({
    lesson,
    course,
    access: 'enrolled',
    completed: progress?.completed || false,
  })
}
