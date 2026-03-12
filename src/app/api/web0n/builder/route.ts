/**
 * web0n Site Builder API
 *
 * POST /api/web0n/builder — Generate a complete static website from project data
 *   Body: { projectId: string }
 *   Returns: { pages: string[], previewBase: string }
 *
 * Admin only. Generates 5 HTML pages from the project brief and stores them in DB.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { generateSiteFromProject } from '@/lib/web0n-builder'

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }

  // Admin check
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  try {
    const { projectId } = await request.json()
    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
    }

    // Fetch project
    const { data: project, error } = await supabase
      .from('web0n_projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Generate all pages
    const pages = generateSiteFromProject(project)
    const pageNames = Object.keys(pages)

    // Store generated site in DB
    await supabase
      .from('web0n_projects')
      .update({
        generated_site: pages,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)

    return NextResponse.json({
      success: true,
      pages: pageNames,
      previewBase: `/api/web0n/builder/assets/${projectId}`,
      generatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Site generation error:', err)
    return NextResponse.json({ error: 'Failed to generate site' }, { status: 500 })
  }
}
