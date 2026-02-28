import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const ONMCP_SERVICES = [
  'crm', 'stripe', 'sendgrid', 'slack', 'discord', 'twilio', 'github',
  'shopify', 'openai', 'anthropic', 'gmail', 'google_sheets', 'google_drive',
  'airtable', 'notion', 'mongodb', 'supabase', 'zendesk', 'jira', 'hubspot',
  'mailchimp', 'google_calendar', 'calendly', 'zoom', 'linear', 'microsoft',
]

function buildMockResult(content: string, filename: string) {
  const lower = content.toLowerCase()
  let platform = 'unknown'
  let confidence = 50

  if (lower.includes('zapier') || lower.includes('zap_id') || filename.endsWith('.zap')) {
    platform = 'zapier'
    confidence = 75
  } else if (lower.includes('make.com') || lower.includes('integromat') || lower.includes('"modules"')) {
    platform = 'make'
    confidence = 70
  } else if (lower.includes('n8n') || lower.includes('n8n-nodes-base')) {
    platform = 'n8n'
    confidence = 80
  } else if (lower.includes('power automate') || lower.includes('microsoft.com/flow')) {
    platform = 'power_automate'
    confidence = 70
  } else if (lower.includes('oracle') || lower.includes('oic')) {
    platform = 'oracle'
    confidence = 65
  } else if (lower.includes('ifttt')) {
    platform = 'ifttt'
    confidence = 75
  } else if (lower.includes('pipedream')) {
    platform = 'pipedream'
    confidence = 70
  }

  const detectedServices: string[] = []
  for (const svc of ONMCP_SERVICES) {
    const searchTerms = svc.replace(/_/g, ' ')
    if (lower.includes(svc) || lower.includes(searchTerms)) {
      detectedServices.push(svc)
    }
  }
  if (lower.includes('email') || lower.includes('smtp')) detectedServices.push('gmail')
  if (lower.includes('spreadsheet') || lower.includes('sheets')) detectedServices.push('google_sheets')
  const uniqueServices = [...new Set(detectedServices)].slice(0, 8)

  return {
    platform,
    confidence,
    stepsFound: Math.max(2, Math.min(12, Math.floor(content.length / 200))),
    servicesDetected: uniqueServices.length > 0 ? uniqueServices : ['openai', 'slack'],
    workflow: {
      name: `Migrated from ${platform}`,
      description: `Workflow imported from ${platform} via Unravel migration engine`,
      version: '1.0.0',
      trigger: { type: 'manual', description: 'Manually triggered after migration' },
      steps: [
        { id: 'step_1', name: 'Initialize', service: 'internal', action: 'Setup migrated workflow context' },
        { id: 'step_2', name: 'Process', service: uniqueServices[0] ?? 'openai', action: 'Execute primary logic' },
        { id: 'step_3', name: 'Notify', service: 'slack', action: 'Send completion notification' },
      ],
      services: uniqueServices.length > 0 ? uniqueServices : ['openai', 'slack'],
    },
    credentialQueue: uniqueServices.length > 0 ? uniqueServices : ['openai', 'slack'],
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, filename } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid content' }, { status: 400 })
    }
    if (!filename || typeof filename !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid filename' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      // Return mock result when no API key is configured
      const mockResult = buildMockResult(content, filename)
      return NextResponse.json(mockResult)
    }

    const anthropic = new Anthropic({ apiKey })

    const systemPrompt = `You are a workflow migration engine for 0nMCP, a universal AI API orchestrator.
Your job is to analyze workflow files exported from other automation platforms and convert them into .0n workflow format.

Available 0nMCP services: ${ONMCP_SERVICES.join(', ')}

When analyzing a workflow:
1. Detect the source platform (zapier, make, n8n, power_automate, oracle, ifttt, pipedream, or unknown)
2. Extract all steps, triggers, and services used
3. Map detected services to the closest 0nMCP service name from the list above
4. Generate an equivalent .0n workflow JSON

Respond ONLY with valid JSON (no markdown, no code fences). The response must match this structure exactly:
{
  "platform": "<detected_platform>",
  "confidence": <0-100>,
  "stepsFound": <number>,
  "servicesDetected": ["<service1>", "<service2>"],
  "workflow": {
    "name": "<descriptive name>",
    "description": "<what this workflow does>",
    "version": "1.0.0",
    "trigger": { "type": "<webhook|schedule|manual|event>", "description": "<trigger description>" },
    "steps": [
      { "id": "<step_id>", "name": "<Step Name>", "service": "<0nmcp_service>", "action": "<what this step does>" }
    ],
    "services": ["<service1>", "<service2>"]
  },
  "credentialQueue": ["<services_needing_api_keys>"]
}`

    const userPrompt = `Analyze this workflow file and convert it to .0n format.

Filename: ${filename}

Content:
${content.slice(0, 12000)}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        { role: 'user', content: userPrompt },
      ],
      system: systemPrompt,
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      const fallback = buildMockResult(content, filename)
      return NextResponse.json(fallback)
    }

    let parsed: Record<string, unknown>
    try {
      // Strip any markdown code fences if present
      const cleaned = textBlock.text.replace(/^```json?\s*\n?/i, '').replace(/\n?```\s*$/i, '')
      parsed = JSON.parse(cleaned)
    } catch {
      const fallback = buildMockResult(content, filename)
      return NextResponse.json(fallback)
    }

    // Validate and normalize the response
    const result = {
      platform: typeof parsed.platform === 'string' ? parsed.platform : 'unknown',
      confidence: typeof parsed.confidence === 'number' ? Math.min(100, Math.max(0, parsed.confidence)) : 50,
      stepsFound: typeof parsed.stepsFound === 'number' ? parsed.stepsFound : 0,
      servicesDetected: Array.isArray(parsed.servicesDetected) ? parsed.servicesDetected : [],
      workflow: typeof parsed.workflow === 'object' && parsed.workflow !== null ? parsed.workflow : {},
      credentialQueue: Array.isArray(parsed.credentialQueue) ? parsed.credentialQueue : [],
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Internal migration error' },
      { status: 500 }
    )
  }
}
