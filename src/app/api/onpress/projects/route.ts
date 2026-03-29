import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

/**
 * GET /api/onpress/projects — List user's projects
 * POST /api/onpress/projects — Create a new project
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Server error' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('onpress_projects')
    .select('id, name, figma_file_key, figma_file_name, generation_type, status, config, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ projects: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Server error' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, figma_file_key, figma_file_name, generation_type, config } = body

  if (!name || !figma_file_key) {
    return NextResponse.json({ error: 'name and figma_file_key are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('onpress_projects')
    .insert({
      user_id: user.id,
      name,
      figma_file_key,
      figma_file_name: figma_file_name || null,
      generation_type: generation_type || 'theme',
      config: config || {},
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ project: data }, { status: 201 })
}
