import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { getFigmaAccessToken } from '@/lib/figma/auth'
import { parseFigmaUrl } from '@/lib/figma/api'
import { extractDesignSystem } from '@/lib/onpress/extractor'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/**
 * POST /api/onpress/extract
 * Extract design system from a Figma file.
 * Body: { project_id: string } or { figma_url: string }
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Server error' }, { status: 500 })

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { project_id, figma_url } = body

  // Get Figma access token
  const accessToken = await getFigmaAccessToken(user.id)
  if (!accessToken) {
    return NextResponse.json({ error: 'Figma not connected. Please connect your Figma account first.' }, { status: 400 })
  }

  let fileKey: string

  if (project_id) {
    // Get file key from project
    const { data: project } = await supabase
      .from('onpress_projects')
      .select('figma_file_key')
      .eq('id', project_id)
      .eq('user_id', user.id)
      .single()

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    fileKey = project.figma_file_key
  } else if (figma_url) {
    const parsed = parseFigmaUrl(figma_url)
    if (!parsed) return NextResponse.json({ error: 'Invalid Figma URL' }, { status: 400 })
    fileKey = parsed.fileKey
  } else {
    return NextResponse.json({ error: 'project_id or figma_url required' }, { status: 400 })
  }

  try {
    // Update project status
    if (project_id) {
      const admin = getAdminClient()
      if (admin) {
        await admin.from('onpress_projects').update({ status: 'extracting' }).eq('id', project_id)
      }
    }

    // Extract design system
    const designSystem = await extractDesignSystem(fileKey, accessToken)

    // Store in project if we have one
    if (project_id) {
      const admin = getAdminClient()
      if (admin) {
        await admin.from('onpress_projects').update({
          design_system: designSystem,
          status: 'extracted',
          updated_at: new Date().toISOString(),
        }).eq('id', project_id)
      }
    }

    return NextResponse.json({
      success: true,
      design_system: designSystem,
      stats: {
        colors: designSystem.colors.length,
        typography: designSystem.typography.length,
        components: designSystem.components.length,
        pages: designSystem.pages.length,
        spacing: designSystem.spacing.length,
        radii: designSystem.radii.length,
        effects: designSystem.effects.length,
      },
    })
  } catch (err) {
    console.error('[onpress/extract] Error:', err)

    if (project_id) {
      const admin = getAdminClient()
      if (admin) {
        await admin.from('onpress_projects').update({ status: 'error' }).eq('id', project_id)
      }
    }

    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Extraction failed' },
      { status: 500 }
    )
  }
}
