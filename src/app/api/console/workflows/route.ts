import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ONMCP_URL = process.env.ONMCP_URL || 'http://localhost:3001'

/**
 * GET /api/console/workflows
 * List available workflows from 0nMCP server.
 */
export async function GET() {
  try {
    const res = await fetch(`${ONMCP_URL}/workflows`, {
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      return NextResponse.json({ workflows: [] })
    }

    const data = await res.json()
    return NextResponse.json({
      workflows: data.workflows || data || [],
    })
  } catch {
    return NextResponse.json({ workflows: [] })
  }
}

/**
 * POST /api/console/workflows
 * Run a workflow via 0nMCP server.
 * Body: { workflow: string, inputs?: Record<string, string> }
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

  let body: { workflow?: string; inputs?: Record<string, string> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const workflow = body.workflow?.trim()
  if (!workflow) {
    return NextResponse.json({ error: 'Workflow name is required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${ONMCP_URL}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workflow, inputs: body.inputs || {} }),
      signal: AbortSignal.timeout(60000),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json(
        { status: 'failed', message: err || 'Workflow execution failed' },
        { status: 502 }
      )
    }

    const data = await res.json()
    return NextResponse.json({
      status: data.status || 'completed',
      message: data.message || 'Workflow completed',
      duration_ms: data.duration_ms || 0,
      steps_executed: data.steps_executed || 0,
      output: data.output || null,
    })
  } catch {
    return NextResponse.json(
      { status: 'failed', message: '0nMCP server is not reachable' },
      { status: 502 }
    )
  }
}
