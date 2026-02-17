import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * POST /api/courses/[slug]/lessons/[lessonSlug]/complete — Mark lesson complete
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; lessonSlug: string }> }
) {
  const { slug, lessonSlug } = await params
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  // Get course + lesson
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

  const { data: lesson } = await supabase
    .from('lessons')
    .select('id')
    .eq('course_id', course.id)
    .eq('slug', lessonSlug)
    .single()

  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })

  // Check enrollment
  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('id')
    .eq('user_id', user.id)
    .eq('course_id', course.id)
    .single()

  if (!enrollment) return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })

  // Upsert progress
  const { data, error } = await supabase
    .from('lesson_progress')
    .upsert({
      user_id: user.id,
      lesson_id: lesson.id,
      completed: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
