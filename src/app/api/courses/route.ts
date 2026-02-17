import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * GET /api/courses — List published courses
 * Query: category, tier
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { searchParams } = request.nextUrl
  const category = searchParams.get('category')
  const tier = searchParams.get('tier')

  let query = supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: true })

  if (category) query = query.eq('category', category)
  if (tier) query = query.eq('tier_required', tier)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
