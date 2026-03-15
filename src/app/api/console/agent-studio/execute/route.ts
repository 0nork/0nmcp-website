import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { executeAgent } from '@/lib/agent-studio'
import {
  getOrCreateCrmAccount,
  getActiveSession,
  upsertSession,
  incrementExecutionCount,
} from '@/lib/crm-provisioning'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * POST /api/console/agent-studio/execute
 *
 * Execute a CRM Agent Studio agent.
 * Auto-provisions the user's CRM account if needed.
 * Handles session persistence for multi-turn conversations.
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    message?: string
    agentId?: string
    newSession?: boolean
    inputVariables?: Record<string, string>
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  // Auto-provision CRM account if user doesn't have one
  const account = await getOrCreateCrmAccount(user.id)

  const agentId = body.agentId || account?.default_agent_id || process.env.CRM_AGENT_STUDIO_AGENT_ID || ''
  const locationId = account?.location_id || process.env.CRM_AGENT_STUDIO_LOCATION_ID || ''

  if (!agentId) {
    return NextResponse.json({ error: 'No agent available' }, { status: 404 })
  }

  // Get existing session for conversation continuity (unless new session requested)
  let executionId: string | undefined
  if (!body.newSession) {
    const existingSession = await getActiveSession(user.id, agentId)
    if (existingSession) executionId = existingSession
  }

  // Execute the agent
  const result = await executeAgent(agentId, {
    message: body.message.trim(),
    locationId,
    executionId,
    inputVariables: {
      ...body.inputVariables,
      userId: user.id,
      userEmail: user.email || '',
    },
  })

  if (result.error) {
    return NextResponse.json({
      text: result.error,
      source: 'agent-studio',
      status: 'failed',
    })
  }

  // Track session for multi-turn
  if (result.executionId) {
    await upsertSession({
      userId: user.id,
      executionId: result.executionId,
      agentId,
      locationId,
    }).catch(() => {})
  }

  // Meter the execution
  await incrementExecutionCount(user.id).catch(() => {})

  return NextResponse.json({
    text: result.text || result.output || 'Agent completed.',
    source: 'agent-studio',
    status: 'completed',
    executionId: result.executionId,
  })
}
