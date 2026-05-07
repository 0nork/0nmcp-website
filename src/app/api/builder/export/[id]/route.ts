import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'
import { exportAsset, type ExportFormat } from '@/lib/marketing-builder'
import { deductRuns, isOwner } from '@/lib/runs'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServer()
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    const user = (await supabase.auth.getSession()).data.session?.user ?? null
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const format = body.format as ExportFormat

    const validFormats: ExportFormat[] = ['html', 'react', 'crm_funnel', 'crm_email']
    if (!format || !validFormats.includes(format)) {
      return NextResponse.json({ error: `Invalid format. Must be one of: ${validFormats.join(', ')}` }, { status: 400 })
    }

    // Get asset
    const { data: asset, error } = await getAdmin()
      .from('builder_assets')
      .select('html, title, asset_type')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error || !asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 })

    // HTML export is free, others cost 1 Spark (for the AI conversion)
    if (format !== 'html' && !isOwner(user.email || '')) {
      await deductRuns(user.id, 'console.export', `Export ${asset.asset_type} as ${format}`)
    }

    const exported = await exportAsset(asset.html, format)

    const extensions: Record<ExportFormat, string> = {
      html: '.html',
      react: '.tsx',
      crm_funnel: '.html',
      crm_email: '.html',
    }

    const filename = `${asset.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}${extensions[format]}`

    return NextResponse.json({
      content: exported,
      filename,
      format,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Export failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
