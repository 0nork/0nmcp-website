import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET/PATCH/DELETE /api/marketplace/courses/drafts
 *
 * Draft management for AI Course Generator.
 * - GET:    List drafts for a location (or single draft by ?id=)
 * - PATCH:  Update draft fields (title, structure, etc.)
 * - DELETE: Remove a draft
 */

function db() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// ── GET: List or fetch single draft ──────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const locationId = searchParams.get('locationId')
  const status = searchParams.get('status')
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20))
  const offset = Math.max(0, Number(searchParams.get('offset')) || 0)

  const supabase = db()

  // Single draft by ID
  if (id) {
    const { data, error } = await supabase
      .from('course_drafts')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
    }
    return NextResponse.json({ draft: data })
  }

  // List drafts for a location
  if (!locationId) {
    return NextResponse.json({ error: 'locationId or id query param required' }, { status: 400 })
  }

  let query = supabase
    .from('course_drafts')
    .select('id, course_title, course_subtitle, skill_level, generation_status, publish_status, estimated_duration, module_count, lessons_per_module, created_at, updated_at', { count: 'exact' })
    .eq('location_id', locationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('generation_status', status)
  }

  const { data, error, count } = await query

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 })
  }

  return NextResponse.json({ drafts: data || [], total: count ?? 0 })
}

// ── PATCH: Update a draft ────────────────────────────────────────────
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // Only allow updating specific fields
    const allowedFields = [
      'course_title', 'course_subtitle', 'target_audience', 'skill_level',
      'course_goal', 'course_category', 'module_count', 'lessons_per_module',
      'include_quizzes', 'include_assignments', 'tone', 'keywords',
      'additional_instructions', 'generated_structure',
    ]

    const safeUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of allowedFields) {
      if (key in updates) {
        safeUpdates[key] = updates[key]
      }
    }

    const supabase = db()
    const { data, error } = await supabase
      .from('course_drafts')
      .update(safeUpdates)
      .eq('id', id)
      .select('*')
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Draft not found or update failed' }, { status: 404 })
    }

    return NextResponse.json({ draft: data })
  } catch (err) {
    console.error('Draft PATCH error:', err)
    return NextResponse.json({ error: 'Failed to update draft' }, { status: 500 })
  }
}

// ── DELETE: Remove a draft ───────────────────────────────────────────
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id query param required' }, { status: 400 })
  }

  const supabase = db()
  const { error } = await supabase
    .from('course_drafts')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 })
  }

  return NextResponse.json({ success: true, deletedId: id })
}
