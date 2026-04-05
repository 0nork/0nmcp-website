/**
 * POST /api/execute — 0nAI Real Execution Endpoint
 *
 * This endpoint ACTUALLY executes API calls against CRM, Stripe, Slack, etc.
 * It is the core of the 0nAI execution engine.
 *
 * Body: { action: string, params: object }
 * Returns: { success: boolean, action: string, service: string, data?: object, error?: string }
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { executeAction, EXECUTION_TOOLS } from '@/lib/execution-engine'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Owner emails that bypass rate limits
const OWNER_EMAILS = ['mike@rocketopp.com', 'mike@0nmcp.com']

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse body
  let body: { action?: string; params?: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { action, params } = body
  if (!action || typeof action !== 'string') {
    return NextResponse.json({
      error: 'Action is required',
      available_actions: EXECUTION_TOOLS.map(t => ({ name: t.name, description: t.description })),
    }, { status: 400 })
  }

  // Validate action exists
  const toolDef = EXECUTION_TOOLS.find(t => t.name === action)
  if (!toolDef) {
    return NextResponse.json({
      error: `Unknown action: ${action}`,
      available_actions: EXECUTION_TOOLS.map(t => ({ name: t.name, description: t.description })),
    }, { status: 400 })
  }

  // Rate limiting for non-owners (simple in-memory check)
  const isOwner = user.email && OWNER_EMAILS.includes(user.email)
  if (!isOwner) {
    // TODO: Add proper rate limiting with Redis/Supabase
    // For now, trust auth + billing
  }

  // Execute the action for real
  const result = await executeAction(action, params || {}, user.id)

  return NextResponse.json(result, {
    status: result.success ? 200 : 500,
  })
}

// GET /api/execute — List available actions
export async function GET() {
  return NextResponse.json({
    engine: '0nAI Execution Engine',
    version: '1.0.0',
    status: 'active',
    tools: EXECUTION_TOOLS.map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.input_schema.properties,
      required: t.input_schema.required || [],
    })),
    total_tools: EXECUTION_TOOLS.length,
    services: ['crm', 'stripe', 'slack', 'data'],
  })
}
