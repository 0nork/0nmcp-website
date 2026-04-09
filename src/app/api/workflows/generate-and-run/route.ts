// Generate .0n workflow from intent + execute immediately

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { generateWorkflow } from '@/lib/workflows/generator'
import { buildCRMWorkflow } from '@/lib/workflows/crmBuilder'
import { executeWorkflow } from '@/lib/workflows/executor'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(req: Request) {
  const { intent, sub_location_id, context } = await req.json()
  if (!intent || !sub_location_id) {
    return NextResponse.json({ error: 'intent and sub_location_id required' }, { status: 400 })
  }

  const start = Date.now()

  try {
    // Get connected integrations
    const { data: integrations } = await supabase
      .from('sub_location_integrations')
      .select('integration_key')
      .eq('sub_location_id', sub_location_id)
      .eq('status', 'connected')

    const connectedKeys = (integrations ?? []).map(i => i.integration_key)

    // Check library for existing match
    const { data: existing } = await supabase
      .from('workflow_library')
      .select('*')
      .eq('sub_location_id', sub_location_id)

    const match = (existing ?? []).find(w =>
      intent.toLowerCase().includes((w.name as string).toLowerCase().split(' ').slice(0, 2).join(' '))
    )

    if (match?.crm_workflow_id) {
      const result = await executeWorkflow({
        crmWorkflowId: match.crm_workflow_id,
        subLocationId: sub_location_id,
        workflowFile: match.on_file as Record<string, unknown>,
      })

      await supabase.from('workflow_library').update({ use_count: (match.use_count || 0) + 1, last_used_at: new Date().toISOString() }).eq('id', match.id)

      return NextResponse.json({ success: true, reused_existing: true, workflow_name: match.name, result })
    }

    // Generate new .0n workflow
    const workflowFile = await generateWorkflow({ intent, sub_location_id, connected_integrations: connectedKeys, context })

    // Build CRM payload
    const crmPayload = await buildCRMWorkflow(workflowFile)

    // Create in CRM
    const createRes = await fetch(`${process.env.CRM_BASE_URL}/locations/${sub_location_id}/workflows`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRM_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': process.env.CRM_API_VERSION || '2021-07-28',
      },
      body: JSON.stringify(crmPayload),
    })

    let crmWorkflowId: string | null = null
    let crmResult: Record<string, unknown> | null = null

    if (createRes.ok) {
      const created = await createRes.json()
      crmWorkflowId = created.workflow?.id || created.id
    }

    // Save to library
    const wf = workflowFile.workflow as Record<string, unknown>
    await supabase.from('workflow_library').insert({
      sub_location_id,
      name: wf.name as string,
      description: wf.description as string,
      on_file: workflowFile,
      crm_workflow_id: crmWorkflowId,
    })

    // Execute if requested
    const runImmediate = (wf.run_immediately as boolean) ?? true
    if (runImmediate && crmWorkflowId) {
      try {
        crmResult = await executeWorkflow({ crmWorkflowId, subLocationId: sub_location_id, workflowFile })
      } catch { /* non-fatal */ }
    }

    // Log execution
    await supabase.from('workflow_executions').insert({
      sub_location_id,
      workflow_name: wf.name as string,
      crm_workflow_id: crmWorkflowId,
      on_file: workflowFile,
      status: 'completed',
      triggered_by: context || 'k_layer_chat',
      result: crmResult,
      duration_ms: Date.now() - start,
    })

    return NextResponse.json({
      success: true,
      reused_existing: false,
      workflow_name: wf.name,
      crm_workflow_id: crmWorkflowId,
      executed: runImmediate,
      steps: ((wf.steps as unknown[]) || []).length,
      workflow_file: workflowFile,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await supabase.from('workflow_executions').insert({
      sub_location_id, workflow_name: 'failed_generation', status: 'failed',
      error_message: msg, duration_ms: Date.now() - start, triggered_by: context || 'k_layer_chat',
    })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
