import { NextRequest, NextResponse } from 'next/server'
import {
  buildWorkflowPrompt,
  parseWorkflowFromResponse,
  saveWorkflow,
  activateWorkflow,
  listWorkflows,
  getConnectedServices,
} from '@/lib/workflow-builder'

/**
 * POST /api/workflows/agentic — Natural language → .0n workflow
 *
 * Body:
 *   action: 'generate' | 'save' | 'activate' | 'list'
 *   locationId: string
 *   prompt: string (for generate)
 *   workflow: object (for save)
 *   workflowId: string (for activate)
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, locationId } = body

  if (!locationId) {
    return NextResponse.json({ error: 'locationId required' }, { status: 400 })
  }

  switch (action) {
    case 'generate': {
      const { prompt, conversation } = body
      if (!prompt) {
        return NextResponse.json({ error: 'prompt required' }, { status: 400 })
      }

      // Get connected services for this location
      const services = await getConnectedServices(locationId)

      // Build the workflow generation system prompt
      const systemPrompt = buildWorkflowPrompt(services)

      // Call Groq (free) to generate the workflow
      const groqPool = (process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || '').split(',').filter(Boolean)
      if (!groqPool.length) {
        return NextResponse.json({ error: 'No AI provider configured' }, { status: 500 })
      }

      const groqKey = groqPool[Math.floor(Math.random() * groqPool.length)].trim()

      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...(conversation || []),
        { role: 'user' as const, content: prompt },
      ]

      const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b', reasoning_effort: 'low',
          messages,
          max_tokens: 2048,
          temperature: 0.3,
        }),
      })

      if (!aiRes.ok) {
        return NextResponse.json({ error: 'AI generation failed' }, { status: 502 })
      }

      const aiData = await aiRes.json()
      const reply = aiData.choices?.[0]?.message?.content || ''

      // Try to parse a workflow from the response
      const workflow = parseWorkflowFromResponse(reply)

      return NextResponse.json({
        reply,
        workflow,
        connected_services: services,
        has_workflow: !!workflow,
      })
    }

    case 'save': {
      const { workflow, userId } = body
      if (!workflow) {
        return NextResponse.json({ error: 'workflow required' }, { status: 400 })
      }

      const result = await saveWorkflow(locationId, workflow, userId)
      return NextResponse.json(result)
    }

    case 'activate': {
      const { workflowId } = body
      if (!workflowId) {
        return NextResponse.json({ error: 'workflowId required' }, { status: 400 })
      }

      const success = await activateWorkflow(workflowId)
      return NextResponse.json({ success })
    }

    case 'list': {
      const workflows = await listWorkflows(locationId)
      return NextResponse.json({ workflows })
    }

    default:
      return NextResponse.json({ error: 'Invalid action. Use: generate, save, activate, list' }, { status: 400 })
  }
}
