import { NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { callAIChat } from '@/lib/ai-provider'
import servicesData from '@/data/services.json'

// ONLY WHAT THE ORCHESTRATOR CAN ACTUALLY RUN.
// This string IS the model's world: it will not name a service it cannot see
// here, and it will name any service it can. Until 2026-08-27 it was every row
// in services.json, including `listkit` (no catalog entry, no API upstream) and
// `twitter_ads` (registered as `x_ads`) — so the builder could hand a customer a
// workflow whose first step dies with `Unknown service: listkit` in
// WorkflowRunner._executeService, with nothing on the page to warn them.
// `executable` is derived from catalog.js by 0n-bridge/tools/services-sync.mjs
// and re-derived daily by fleet-sweep check 20, so this filter cannot go stale
// silently the way the hand-kept list did.
const SERVICE_CATALOG = servicesData.services
  .filter((s) => s.executable !== false && s.kind !== 'builder_primitive')
  .map((s) => {
    const tools = 'tools' in s && Array.isArray(s.tools)
      ? s.tools.map((t: { id: string }) => t.id).join(', ')
      : '(CRM module — 245 tools via 0nMCP)'
    return `${s.id}|${s.name}|${s.icon}: ${tools}`
  })
  .join('\n')

// Control flow is not a connector. These dispatch through `"service": "internal"`
// to INTERNAL_ACTIONS in 0nMCP/workflow.js — the list is exactly those six, and
// naming anything else there throws `Unknown internal action`.
const INTERNAL_ACTIONS = 'lookup, set, transform, compute, condition, map'

const SYSTEM_PROMPT = `You are the 0nMCP Workflow Builder AI. You generate valid .0n workflow files from natural language descriptions.

## .0n File Format

This is the format 0nMCP's WorkflowRunner actually executes and that 0n-spec's
workflow schema validates. Field names are not interchangeable — a step keyed
\`mcp_server\`/\`tool\`/\`inputs\` is read as having no service at all and fails with
\`Unknown service: undefined\`.

{
  "$0n": {
    "type": "workflow",
    "version": "1.0.0",
    "name": "kebab-case-name",
    "description": "What this workflow does"
  },
  "execution_pattern": "pipeline" | "assembly_line" | "radial_burst",
  "trigger": { "type": "manual" | "schedule" | "webhook" | "event", "config": {} },
  "inputs": {
    "input_name": { "type": "string", "required": true, "description": "..." }
  },
  "steps": [
    {
      "id": "snake_case_id",
      "name": "Human readable step name",
      "service": "service_id",
      "action": "tool_id",
      "params": { "param": "value or {{template}}" },
      "conditions": ["{{steps.other_step.status}}"],
      "error_handling": { "on_error": "stop" | "continue" | "retry", "retries": 3, "backoff_ms": 1000 }
    }
  ],
  "error_handling": { "on_error": "stop" | "continue" | "retry" },
  "outputs": { "result_name": "{{steps.step_id.field}}" }
}

## Template Variables
Resolved against exactly three roots — nothing else exists at run time:
- {{inputs.name}} — a value declared in the workflow's \`inputs\` block
- {{steps.step_id.field}} — output of an earlier step, keyed by that step's \`id\`
- {{env.VAR}} — environment variable

## Execution Order
Steps run **sequentially, in array order**. There is no \`depends_on\` and no
\`parallel_group\` — order the array to express the dependency. \`execution_pattern\`
describes the shape of the workflow (Three-Level Execution Hierarchy, patent
pending); it does not reorder steps.

## Available Services (service_id|Name|Icon: tool_ids)
${SERVICE_CATALOG}

## Control Flow (no connector, no credentials)
Use \`"service": "internal"\` with one of these actions: ${INTERNAL_ACTIONS}

## Rules
1. ALWAYS output a complete, valid .0n JSON object inside a \`\`\`json code fence
2. ALWAYS include the \`$0n\` header with \`"type": "workflow"\` — a file without it is rejected before any step runs
3. Use \`service\` and \`action\`, never \`mcp_server\` or \`tool\`. Use \`params\`, never \`inputs\`, on a step
4. Only use service ids and tool ids from the catalog above, or \`internal\` with one of the actions listed. Never invent one — an unknown id fails at run time with \`Unknown service\`
5. Step ids are snake_case and must match ^[a-z][a-z0-9_]*$
6. Order steps so that any step referencing {{steps.x.…}} comes after step x
7. Declare anything the user must supply in the top-level \`inputs\` block; use {{env.VAR}} for API keys and secrets
8. Generate 5-25 steps depending on complexity
9. Always include a description in \`$0n\` and a \`trigger\`
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
