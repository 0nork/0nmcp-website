import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getDownloadUrl } from '@/lib/onpress/packager'

/**
 * GET /api/onpress/download/[id]
 * Get a signed download URL for a generation's ZIP file.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: generationId } = await params
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Server error' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Find the generation and verify ownership
  const { data: generation } = await supabase
    .from('onpress_generations')
    .select('zip_path, project_id, status')
    .eq('id', generationId)
    .single()

  if (!generation) {
    return NextResponse.json({ error: 'Generation not found' }, { status: 404 })
  }

  // Verify project ownership
  const { data: project } = await supabase
    .from('onpress_projects')
    .select('id')
    .eq('id', generation.project_id)
    .eq('user_id', user.id)
    .single()

  if (!project) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  if (generation.status !== 'completed' || !generation.zip_path) {
    return NextResponse.json({ error: 'Generation not complete' }, { status: 400 })
  }

  try {
    const downloadUrl = await getDownloadUrl(generation.zip_path)
    return NextResponse.json({ download_url: downloadUrl })
  } catch (err) {
    console.error('[onpress/download] Error:', err)
    return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 })
  }
}
