import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { generateTheme } from '@/lib/onpress/theme-generator'
import { generatePlugin } from '@/lib/onpress/plugin-generator'
import { packageAndUpload } from '@/lib/onpress/packager'
import type { DesignSystem, GenerationConfig } from '@/lib/onpress/types'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/**
 * POST /api/onpress/generate
 * Generate WordPress theme or plugin from a project's design_system.
 * Body: { project_id: string } or { design_system: DesignSystem, config: GenerationConfig }
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Server error' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { project_id, design_system: directDS, config: directConfig } = body

  let designSystem: DesignSystem
  let config: GenerationConfig
  let projectId: string | null = project_id || null

  if (project_id) {
    // Load from project
    const { data: project } = await supabase
      .from('onpress_projects')
      .select('*')
      .eq('id', project_id)
      .eq('user_id', user.id)
      .single()

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    if (!project.design_system) {
      return NextResponse.json({ error: 'No design system found. Extract first.' }, { status: 400 })
    }

    designSystem = project.design_system as DesignSystem
    config = {
      slug: project.config?.slug || project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'onpress-output',
      name: project.name,
      type: project.generation_type as 'theme' | 'plugin',
      options: project.config?.options || {},
    }
  } else if (directDS && directConfig) {
    designSystem = directDS
    config = directConfig
    projectId = null
  } else {
    return NextResponse.json({ error: 'project_id or design_system+config required' }, { status: 400 })
  }

  const admin = getAdminClient()

  try {
    // Update project status
    if (projectId && admin) {
      await admin.from('onpress_projects').update({ status: 'generating' }).eq('id', projectId)
    }

    // Create generation record
    let generationId: string | null = null
    if (projectId && admin) {
      const { data: gen } = await admin
        .from('onpress_generations')
        .insert({
          project_id: projectId,
          status: 'running',
        })
        .select('id')
        .single()
      generationId = gen?.id || null
    }

    // Generate files
    const files = config.type === 'plugin'
      ? generatePlugin(designSystem, config)
      : generateTheme(designSystem, config)

    // Package and upload
    const result = await packageAndUpload(
      files,
      config.slug,
      user.id,
      projectId || crypto.randomUUID()
    )

    // Update records
    if (generationId && admin) {
      await admin.from('onpress_generations').update({
        status: 'completed',
        zip_path: result.storagePath,
        file_manifest: result.manifest,
      }).eq('id', generationId)
    }

    if (projectId && admin) {
      await admin.from('onpress_projects').update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      }).eq('id', projectId)
    }

    return NextResponse.json({
      success: true,
      type: config.type,
      name: config.name,
      slug: config.slug,
      download_url: result.downloadUrl,
      file_count: result.fileCount,
      files: result.manifest,
      generation_id: generationId,
    })
  } catch (err) {
    console.error('[onpress/generate] Error:', err)

    if (projectId && admin) {
      await admin.from('onpress_projects').update({ status: 'error' }).eq('id', projectId)
    }

    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
