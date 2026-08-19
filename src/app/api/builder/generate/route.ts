import { NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { callAIChat } from '@/lib/ai-provider'
import servicesData from '@/data/services.json'

const SERVICE_CATALOG = servicesData.services
  .map((s) => {
    const tools = 'tools' in s && Array.isArray(s.tools)
      ? s.tools.map((t: { id: string }) => t.id).join(', ')
      : '(CRM module — 245 tools via 0nMCP)'
    return `${s.id}|${s.name}|${s.icon}: ${tools}`
  })
  .join('\n')

const SYSTEM_PROMPT = `You are the 0nMCP Workflow Builder AI. You generate valid .0n workflow files from natural language descriptions.

## .0n File Format (version 0.2)

A .0n file is a JSON object with this structure:
{
  "name": "kebab-case-name",
  "version": "0.2",
  "description": "What this workflow does",
  "author": "Author name",
  "env": { "KEY": "{{env.KEY}}" },
  "variables": { "var_name": "default_value" },
  "on_complete": "log" | "notify" | "webhook",
  "metadata": {
    "pipeline": "pipeline-name",
    "environment": "production",
    "tags": ["tag1", "tag2"]
  },
  "steps": [
    {
      "id": "unique-step-id",
      "name": "Service Display Name",
      "mcp_server": "service_id",
      "tool": "tool_id",
      "inputs": { "param": "value or {{template}}" },
      "outputs": { "key": "{{step.output.field}}" },
      "depends_on": ["other-step-id"],
      "condition": "optional condition expression",
      "on_fail": "halt" | "skip" | "retry:1" | "retry:2" | "retry:3",
      "timeout": 30000,
      "parallel_group": "group-name"
    }
  ]
}

## Template Variables
- {{env.VAR}} — environment variable
- {{variables.name}} — workflow variable
- {{step.step-id.output.field}} — output from a previous step
- {{system.date}} — current date

## Three-Level Execution Hierarchy (Patent Pending)
1. PIPELINE — sequential phases (steps with depends_on chains)
2. ASSEMBLY LINE — ordered moments within a phase
3. RADIAL BURST — parallel actions (steps sharing a parallel_group, all depending on the same parent)

## Available Services (service_id|Name|Icon: tool_ids)
${SERVICE_CATALOG}

## Rules
1. ALWAYS output a complete, valid .0n JSON object inside a \`\`\`json code fence
2. Use REAL service IDs and tool IDs from the catalog above
3. Create proper depends_on chains — no orphaned steps except the first
4. Use parallel_group for steps that should execute simultaneously (Radial Burst)
5. Include env vars for any API keys or secrets needed
6. Use meaningful step IDs (kebab-case, descriptive)
7. Include inputs and outputs with template variables where appropriate
8. Generate 5-25 steps depending on complexity
9. Always include description and metadata with relevant tags
10. Respond conversationally first, then provide the .0n file in a json code fence`

export async function POST(request: NextRequest) {
  // BYOK: Require authenticated user
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return Response.json({ error: 'Auth not configured' }, { status: 503 })
  }
  const user = (await supabase.auth.getSession()).data.session?.user ?? null

  if (!user) {
    return Response.json(
      { error: 'Sign in required. Your Anthropic API key from your vault is used to power the builder.' },
      { status: 401 }
    )
  }

  // Try user's BYOK key first, fall back to platform keys
  // Check vault for any AI provider key (anthropic, openai, groq, etc.)
  const { data: vaultEntries } = await supabase
    .from('user_vaults')
    .select('service_name, encrypted_key, iv, salt')
    .eq('user_id', user.id)
    .in('service_name', ['anthropic', 'openai', 'groq', 'gemini', 'xai', 'openrouter'])

  // Accept client-decrypted key from header
  const clientApiKey = request.headers.get('x-api-key')
  const clientProvider = request.headers.get('x-ai-provider') || 'anthropic'

  // If no user key AND no vault entries, we'll use platform keys as fallback
  const hasUserKey = !!clientApiKey || (vaultEntries && vaultEntries.length > 0)

  let body: { messages: { role: string; content: string }[] }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return Response.json({ error: 'Messages array required' }, { status: 400 })
  }

  // Limit conversation to last 20 messages
  const messages = body.messages.slice(-20).map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: String(m.content).slice(0, 10000),
  }))

  // Try user's BYOK key first via direct API call
  if (clientApiKey) {
    // Determine provider endpoint from client header
    const providerEndpoints: Record<string, { url: string; headers: Record<string, string>; bodyFn: () => string }> = {
      anthropic: {
        url: 'https://api.anthropic.com/v1/messages',
        headers: { 'x-api-key': clientApiKey, 'anthropic-version': '2023-06-01' },
        bodyFn: () => JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 8192, system: SYSTEM_PROMPT, stream: true, messages }),
      },
      openai: {
        url: 'https://api.openai.com/v1/chat/completions',
        headers: { 'Authorization': `Bearer ${clientApiKey}` },
        bodyFn: () => JSON.stringify({ model: 'gpt-4o', max_tokens: 8192, stream: true, messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages] }),
      },
      groq: {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        headers: { 'Authorization': `Bearer ${clientApiKey}` },
        bodyFn: () => JSON.stringify({ model: process.env.GROQ_MODEL || 'openai/gpt-oss-120b', reasoning_effort: 'low', max_tokens: 8192, stream: true, messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages] }),
      },
    }

    const endpoint = providerEndpoints[clientProvider] || providerEndpoints.anthropic
    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...endpoint.headers },
      body: endpoint.bodyFn(),
    })

    if (response.ok && response.body) {
      return new Response(response.body, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
      })
    }

    // BYOK failed — fall through to platform keys
    console.warn(`[builder] User BYOK (${clientProvider}) failed: ${response.status}`)
  }

  // Fallback: use platform keys via ai-provider (non-streaming)
  const result = await callAIChat(
    SYSTEM_PROMPT,
    messages,
    user.id,
    8192
  )

  if (!result) {
    return Response.json(
      { error: 'All AI providers failed. Add an API key in Account > Credentials, or contact support.' },
      { status: 502 }
    )
  }

  // Non-streaming fallback — emit result as SSE for frontend compatibility
  const encoder = new TextEncoder()
  const fallbackStream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: result.text })}\n\n`))
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })

  return new Response(fallbackStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
