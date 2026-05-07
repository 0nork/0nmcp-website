import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export const dynamic = 'force-dynamic'

// GET /api/console/crew — Load user's agents + recent runs
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = getAdmin()
  const [agentsRes, runsRes] = await Promise.all([
    admin.from('crew_agents').select('*').eq('user_id', user.id).order('created_at'),
    admin.from('crew_runs').select('*').eq('user_id', user.id).order('started_at', { ascending: false }).limit(50),
  ])

  return NextResponse.json({
    agents: agentsRes.data || [],
    runs: runsRes.data || [],
  })
}

// POST /api/console/crew — Save agent OR execute agent
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const admin = getAdmin()

  // ── Save agent ──
  if (body.action === 'save') {
    const agent = body.agent
    if (!agent?.id || !agent?.name) {
      return NextResponse.json({ error: 'Agent id and name required' }, { status: 400 })
    }

    const { error } = await admin.from('crew_agents').upsert({
      id: agent.id,
      user_id: user.id,
      name: agent.name,
      role: agent.role || '',
      color: agent.color || '#6EE05A',
      abilities: agent.abilities || [],
      triggers: agent.triggers || [],
      status: agent.status || 'idle',
      workflow: agent.workflow || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  // ── Delete agent ──
  if (body.action === 'delete') {
    await admin.from('crew_agents').delete().eq('id', body.agentId).eq('user_id', user.id)
    return NextResponse.json({ success: true })
  }

  // ── Execute agent ──
  if (body.action === 'execute') {
    const agentId = body.agentId
    const trigger = body.trigger || 'manual'

    // Load agent
    const { data: agent } = await admin.from('crew_agents').select('*').eq('id', agentId).eq('user_id', user.id).single()
    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

    // Create run record
    const runId = crypto.randomUUID()
    await admin.from('crew_runs').insert({
      id: runId,
      agent_id: agentId,
      user_id: user.id,
      trigger,
      status: 'running',
      started_at: new Date().toISOString(),
    })

    // Build workflow from agent abilities
    const workflow = {
      name: `${agent.name}-crew-run`,
      version: '1.0',
      description: agent.role,
      steps: (agent.abilities || []).map((toolId: string, idx: number) => ({
        id: `step_${String(idx + 1).padStart(3, '0')}`,
        name: toolId.replace(/_/g, ' '),
        tool: toolId,
        inputs: body.inputs || {},
        ...(idx > 0 ? { depends_on: [`step_${String(idx).padStart(3, '0')}`] } : {}),
      })),
    }

    // Execute via 0nMCP
    const startTime = Date.now()
    let result: { status: string; steps: number; services: string[]; summary: string; error?: string | undefined }

    try {
      const mcpUrl = process.env.ONMCP_URL || 'http://localhost:3001'
      const res = await fetch(`${mcpUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow }),
        signal: AbortSignal.timeout(60000),
      })

      if (res.ok) {
        const data = await res.json()
        result = {
          status: 'completed',
          steps: data.steps_executed || data.steps || agent.abilities.length,
          services: (data.services_used || data.services || []) as string[],
          summary: data.result || data.output || `Executed ${agent.abilities.length} tools successfully`,
        }
      } else {
        const errText = await res.text()
        result = {
          status: 'failed',
          steps: 0,
          services: [],
          summary: `0nMCP execution failed: ${errText}`,
          error: errText,
        }
      }
    } catch (e: any) {
      result = {
        status: 'failed',
        steps: 0,
        services: [],
        summary: '0nMCP server is not reachable. Start it with: npx 0nmcp serve --port 3001',
        error: e.message || 'Connection refused',
      }
    }

    const durationMs = Date.now() - startTime

    // Update run record
    await admin.from('crew_runs').update({
      status: result.error ? 'failed' : 'completed',
      steps_executed: result.steps,
      services_used: result.services,
      result_summary: result.summary,
      error_message: result.error || null,
      duration_ms: durationMs,
      completed_at: new Date().toISOString(),
    }).eq('id', runId)

    // Update agent status
    await admin.from('crew_agents').update({
      status: 'active',
      updated_at: new Date().toISOString(),
    }).eq('id', agentId)

    return NextResponse.json({
      runId,
      status: result.status,
      steps: result.steps,
      services: result.services,
      summary: result.summary,
      durationMs,
    })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

/**
 * Simulated execution — runs when 0nMCP server isn't available.
 * Still provides realistic output so the UI works end-to-end.
 */
async function simulateExecution(agent: any): Promise<{ status: string; steps: number; services: string[]; summary: string; error?: string }> {
  // Simulate processing time
  await new Promise(r => setTimeout(r, 800 + Math.random() * 1200))

  const toolMap: Record<string, string> = {
    search_contacts: 'CRM', create_contact: 'CRM', update_contact: 'CRM',
    list_opportunities: 'CRM', update_opportunity: 'CRM',
    list_conversations: 'CRM', send_message: 'CRM', assign_conversation: 'CRM',
    list_invoices: 'Stripe', create_invoice: 'Stripe', list_payment_intents: 'Stripe',
    send_email: 'SendGrid', send_template_email: 'SendGrid',
    create_social_post: 'CRM Social', list_social_posts: 'CRM Social', update_social_post: 'CRM Social',
    list_pipelines: 'CRM', list_calendars: 'CRM', list_tags: 'CRM', list_workflows: 'CRM',
    run_workflow: '0nMCP', list_scenarios: '0nMCP',
    monitor_rss_feeds: '0nMonitor', check_scope_drift: '0nMonitor', compare_api_versions: '0nMonitor',
    alert_changes: '0nMonitor', patch_service_fields: '0nUpdater', update_stable_scopes: '0nUpdater',
    regenerate_guides: '0nUpdater', log_change_history: '0nUpdater',
    create_payment_intent: 'Stripe', list_customers: 'Stripe', list_templates: 'SendGrid',
  }

  const abilities = agent.abilities || []
  const serviceSet = new Set<string>()
  for (const a of abilities) serviceSet.add(toolMap[a as string] || '0nMCP')
  const services = Array.from(serviceSet)

  return {
    status: 'completed',
    steps: abilities.length,
    services,
    summary: `${agent.name} executed ${abilities.length} tools across ${services.join(', ')}. All steps completed successfully.`,
  }
}
