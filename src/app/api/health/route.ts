import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function GET() {
  const start = Date.now()
  const result: Record<string, unknown> = {
    status: 'ok',
    project: '0nmcp-website',
    timestamp: new Date().toISOString(),
    db: false,
    latestMigration: null,
    migrationCount: 0,
  }

  try {
    const supabase = getAdmin()

    // Check basic connectivity
    const { error: pingError } = await supabase
      .from('_0n_migrations')
      .select('id')
      .limit(1)

    if (pingError) {
      const { error: fallbackError } = await supabase.rpc('now' as never)
      if (fallbackError) {
        result.status = 'degraded'
        result.error = 'Database connectivity failed'
        result.duration_ms = Date.now() - start
        return NextResponse.json(result, { status: 503 })
      }
      result.db = true
      result.note = '_0n_migrations table not yet created'
      result.duration_ms = Date.now() - start
      return NextResponse.json(result)
    }

    result.db = true

    // Get latest migration
    const { data: migrations } = await supabase
      .from('_0n_migrations')
      .select('filename, applied_at, success')
      .eq('project_name', '0nmcp-website')
      .eq('success', true)
      .order('applied_at', { ascending: false })
      .limit(1)

    if (migrations && migrations.length > 0) {
      result.latestMigration = migrations[0].filename
    }

    // Get total count
    const { count } = await supabase
      .from('_0n_migrations')
      .select('*', { count: 'exact', head: true })
      .eq('project_name', '0nmcp-website')
      .eq('success', true)

    result.migrationCount = count || 0
    result.duration_ms = Date.now() - start

    return NextResponse.json(result)
  } catch (err) {
    result.status = 'error'
    result.error = err instanceof Error ? err.message : 'Unknown error'
    result.duration_ms = Date.now() - start
    return NextResponse.json(result, { status: 500 })
  }
}
