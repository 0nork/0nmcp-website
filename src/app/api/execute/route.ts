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
import { getUserCredentials } from '@/lib/vault-bridge'
import { resolveAuth } from '@/lib/token-auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Owner emails that bypass rate limits
const OWNER_EMAILS = ['mike@rocketopp.com', 'mike@0nmcp.com']

export async function POST(request: NextRequest) {
  // Auth check — supports both session auth (web) and token auth (external)
  const auth = await resolveAuth(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized. Use session auth or pass Authorization: Bearer 0n_xxx' }, { status: 401 })
  }

  const userId = auth.userId

  // For rate limit check, get email
  let userEmail: string | undefined
  if (auth.source === 'session') {
    const supabase = await createSupabaseServer()
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser()
      userEmail = user?.email || undefined
    }
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
  const isOwner = userEmail && OWNER_EMAILS.includes(userEmail)
  if (!isOwner) {
    // TODO: Add proper rate limiting with Redis/Supabase
    // For now, trust auth + billing
  }

  // Decrypt user's vault credentials for execution
  const userCredentials = await getUserCredentials(userId)

  // Execute the action for real — user vault keys take priority, env vars as fallback
  const result = await executeAction(action, params || {}, userId, userCredentials)

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
