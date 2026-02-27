import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ONMCP_URL = process.env.ONMCP_URL || 'http://localhost:3001'

/**
 * POST /api/console/execute
 * Execute a task via 0nMCP server.
 * Body: { task: string }
 */
export async function POST(request: NextRequest) {
  // Verify auth
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { task?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const task = body.task?.trim()
  if (!task) {
    return NextResponse.json({ error: 'Task is required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${ONMCP_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task }),
      signal: AbortSignal.timeout(60000),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json(
        { status: 'failed', message: err || 'Execution failed' },
        { status: 502 }
      )
    }

    const data = await res.json()
    return NextResponse.json({
      status: data.status || 'completed',
      result: data.result || data.output || data.message || 'Task executed.',
      steps: data.steps_executed || data.steps || 0,
      services: data.services_used || data.services || [],
      duration_ms: data.duration_ms || 0,
    })
  } catch {
    return NextResponse.json(
      { status: 'failed', message: '0nMCP server is not reachable. Start it with: npx 0nmcp serve' },
      { status: 502 }
    )
  }
}
