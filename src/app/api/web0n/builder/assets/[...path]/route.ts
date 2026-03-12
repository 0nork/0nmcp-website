/**
 * Serve generated web0n site pages for preview
 *
 * GET /api/web0n/builder/assets/[projectId]/[page]
 *   Returns the generated HTML page with content-type text/html
 *
 * Example: /api/web0n/builder/assets/abc-123/index.html
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  if (!path || path.length < 2) {
    return NextResponse.json({ error: 'Path must be /[projectId]/[page]' }, { status: 400 })
  }

  const projectId = path[0]
  let pageName = path.slice(1).join('/')

  // Normalize: strip .html extension, default to index
  pageName = pageName.replace(/\.html$/, '')
  if (!pageName || pageName === '/') pageName = 'index'
  const pageKey = `${pageName}.html`

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
  }

  // Use service role to bypass RLS for preview
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { data: project, error } = await supabase
    .from('web0n_projects')
    .select('generated_site, business_name')
    .eq('id', projectId)
    .single()

  if (error || !project) {
    return new NextResponse('Project not found', { status: 404 })
  }

  const site = project.generated_site as Record<string, string> | null
  if (!site) {
    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:3rem;text-align:center">
        <h1>Site Not Generated Yet</h1>
        <p>Click "Build Site" in the admin dashboard to generate pages for ${project.business_name}.</p>
      </body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  const html = site[pageKey]
  if (!html) {
    const available = Object.keys(site).join(', ')
    return new NextResponse(
      `<html><body style="font-family:sans-serif;padding:3rem;text-align:center">
        <h1>Page Not Found</h1>
        <p>Available pages: ${available}</p>
      </body></html>`,
      { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  })
}
