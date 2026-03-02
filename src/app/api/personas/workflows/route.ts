import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAILS = ['mike@rocketopp.com']

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/personas/workflows — Get workflow configs for all personas
 * Returns each persona with their schedule config and recent activity stats
 */
export async function GET(request: NextRequest) {
  const { createSupabaseServer } = await import('@/lib/supabase/server')
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const admin = getAdmin()

  // Get all active personas with their stats
  const { data: personas, error } = await admin
    .from('community_personas')
    .select('id, name, slug, role, expertise, personality, knowledge_level, preferred_groups, is_active, activity_level, thread_count, reply_count, last_active_at, workflow_config')
    .order('name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get thread counts by persona for last 7 days
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: recentThreads } = await admin
    .from('community_threads')
    .select('user_id')
    .gte('created_at', weekAgo)

  const { data: recentPosts } = await admin
    .from('community_posts')
    .select('user_id')
    .gte('created_at', weekAgo)

  // Build per-persona weekly activity map
  const weeklyThreads: Record<string, number> = {}
  const weeklyReplies: Record<string, number> = {}
  for (const t of recentThreads || []) {
    weeklyThreads[t.user_id] = (weeklyThreads[t.user_id] || 0) + 1
  }
  for (const p of recentPosts || []) {
    weeklyReplies[p.user_id] = (weeklyReplies[p.user_id] || 0) + 1
  }

  // Get profile IDs for each persona (to match against thread/post user_id)
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, email')
    .like('email', 'persona-%@0nmcp.internal')

  const emailToProfileId: Record<string, string> = {}
  for (const profile of profiles || []) {
    emailToProfileId[profile.email] = profile.id
  }

  // Enrich personas with weekly stats
  const enriched = (personas || []).map(p => {
    const profileEmail = `persona-${p.slug}@0nmcp.internal`
    const profileId = emailToProfileId[profileEmail] || ''
    return {
      ...p,
      weekly_threads: weeklyThreads[profileId] || 0,
      weekly_replies: weeklyReplies[profileId] || 0,
      profile_id: profileId,
    }
  })

  return NextResponse.json({ personas: enriched })
}

/**
 * POST /api/personas/workflows — Execute workflow actions
 *
 * Actions:
 *   { action: 'update_config', persona_id: string, config: WorkflowConfig }
 *   { action: 'run_persona', persona_id: string } — Run one persona's workflow (create thread + replies)
 *   { action: 'run_all' } — Run all active personas with workflow configs
 *   { action: 'batch_threads', persona_ids: string[], count?: number } — Generate threads for multiple personas
 *   { action: 'batch_replies', thread_ids: string[] } — Generate replies on specific threads
 */
export async function POST(request: NextRequest) {
  const { createSupabaseServer } = await import('@/lib/supabase/server')
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'DB not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !ADMIN_EMAILS.includes(user.email || '')) {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const body = await request.json()
  const { action } = body

  try {
    switch (action) {
      case 'update_config':
        return await handleUpdateConfig(body.persona_id, body.config)
      case 'run_persona':
        return await handleRunPersona(body.persona_id, request)
      case 'run_all':
        return await handleRunAll(request)
      case 'batch_threads':
        return await handleBatchThreads(body.persona_ids, body.count || 1, request)
      case 'batch_replies':
        return await handleBatchReplies(body.thread_ids, request)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (err) {
    console.error('[personas/workflows] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Workflow action failed' },
      { status: 500 }
    )
  }
}

/**
 * Update a persona's workflow configuration
 */
async function handleUpdateConfig(personaId: string, config: Record<string, unknown>) {
  if (!personaId) return NextResponse.json({ error: 'persona_id required' }, { status: 400 })

  const admin = getAdmin()
  const { error } = await admin
    .from('community_personas')
    .update({ workflow_config: config })
    .eq('id', personaId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, persona_id: personaId })
}

/**
 * Run a single persona's workflow — create a thread and optionally replies
 */
async function handleRunPersona(personaId: string, request: NextRequest) {
  if (!personaId) return NextResponse.json({ error: 'persona_id required' }, { status: 400 })

  // Forward to converse API for thread creation
  const baseUrl = request.nextUrl.origin
  const threadRes = await fetch(`${baseUrl}/api/personas/converse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie: request.headers.get('cookie') || '',
    },
    body: JSON.stringify({ action: 'seed_thread', persona_id: personaId }),
  })

  const threadData = await threadRes.json()
  if (!threadRes.ok) {
    return NextResponse.json({ error: threadData.error || 'Thread creation failed' }, { status: threadRes.status })
  }

  // Try to get a reply on the new thread from a different persona
  const results = [{ action: 'thread', ...threadData }]

  if (threadData.thread?.id) {
    try {
      const replyRes = await fetch(`${baseUrl}/api/personas/converse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: request.headers.get('cookie') || '',
        },
        body: JSON.stringify({ action: 'reply', thread_id: threadData.thread.id }),
      })
      const replyData = await replyRes.json()
      if (replyRes.ok) {
        results.push({ action: 'reply', ...replyData })
      }
    } catch {
      // Reply is optional, thread was created successfully
    }
  }

  return NextResponse.json({
    success: true,
    persona: threadData.persona,
    results,
  }, { status: 201 })
}

/**
 * Run all active personas that have workflow configs enabled
 */
async function handleRunAll(request: NextRequest) {
  const admin = getAdmin()

  const { data: personas } = await admin
    .from('community_personas')
    .select('id, name, workflow_config')
    .eq('is_active', true)
    .not('workflow_config', 'is', null)

  if (!personas?.length) {
    return NextResponse.json({ error: 'No active personas with workflow configs' }, { status: 404 })
  }

  const baseUrl = request.nextUrl.origin
  const results: Array<{ persona: string; success: boolean; error?: string; thread?: string }> = []

  for (const p of personas) {
    const config = p.workflow_config as Record<string, unknown> | null
    if (!config || config.enabled === false) continue

    try {
      const res = await fetch(`${baseUrl}/api/personas/converse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: request.headers.get('cookie') || '',
        },
        body: JSON.stringify({ action: 'seed_thread', persona_id: p.id }),
      })
      const data = await res.json()
      results.push({
        persona: p.name,
        success: res.ok,
        thread: data.thread?.title,
        error: res.ok ? undefined : data.error,
      })
    } catch (err) {
      results.push({
        persona: p.name,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }

    // Small delay between personas to avoid rate limiting
    await new Promise(r => setTimeout(r, 500))
  }

  return NextResponse.json({
    success: true,
    ran: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  }, { status: 201 })
}

/**
 * Generate threads for multiple personas
 */
async function handleBatchThreads(personaIds: string[], count: number, request: NextRequest) {
  if (!personaIds?.length) return NextResponse.json({ error: 'persona_ids required' }, { status: 400 })

  const baseUrl = request.nextUrl.origin
  const results: Array<{ persona_id: string; persona?: string; success: boolean; thread?: string; error?: string }> = []

  for (const pid of personaIds) {
    for (let i = 0; i < Math.min(count, 3); i++) {
      try {
        const res = await fetch(`${baseUrl}/api/personas/converse`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            cookie: request.headers.get('cookie') || '',
          },
          body: JSON.stringify({ action: 'seed_thread', persona_id: pid }),
        })
        const data = await res.json()
        results.push({
          persona_id: pid,
          persona: data.persona,
          success: res.ok,
          thread: data.thread?.title,
          error: res.ok ? undefined : data.error,
        })
      } catch (err) {
        results.push({
          persona_id: pid,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
      await new Promise(r => setTimeout(r, 300))
    }
  }

  return NextResponse.json({
    success: true,
    created: results.filter(r => r.success).length,
    results,
  }, { status: 201 })
}

/**
 * Generate replies on specific threads
 */
async function handleBatchReplies(threadIds: string[], request: NextRequest) {
  if (!threadIds?.length) return NextResponse.json({ error: 'thread_ids required' }, { status: 400 })

  const baseUrl = request.nextUrl.origin
  const results: Array<{ thread_id: string; persona?: string; success: boolean; error?: string }> = []

  for (const tid of threadIds) {
    try {
      const res = await fetch(`${baseUrl}/api/personas/converse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: request.headers.get('cookie') || '',
        },
        body: JSON.stringify({ action: 'reply', thread_id: tid }),
      })
      const data = await res.json()
      results.push({
        thread_id: tid,
        persona: data.persona,
        success: res.ok,
        error: res.ok ? undefined : data.error,
      })
    } catch (err) {
      results.push({
        thread_id: tid,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      })
    }
    await new Promise(r => setTimeout(r, 300))
  }

  return NextResponse.json({
    success: true,
    replied: results.filter(r => r.success).length,
    results,
  }, { status: 201 })
}
