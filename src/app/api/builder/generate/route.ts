import { NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
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
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json(
      { error: 'Sign in required. Your Anthropic API key from your vault is used to power the builder.' },
      { status: 401 }
    )
  }

  // Get user's Anthropic key from vault
  const { data: vaultEntry } = await supabase
    .from('user_vaults')
    .select('encrypted_key, iv, salt')
    .eq('user_id', user.id)
    .eq('service_name', 'anthropic')
    .single()

  if (!vaultEntry) {
    return Response.json(
      { error: 'No Anthropic key found. Add your Anthropic API key in Account > Credentials with service name "anthropic".' },
      { status: 400 }
    )
  }

  // Decrypt the API key server-side using user ID as key material
  // The client encrypted with PBKDF2(userId) + AES-256-GCM
  // We need the client to pass the decrypted key, since server can't decrypt PBKDF2(userId) keys
  // Instead, accept the key from the client header (already decrypted client-side)
  const clientApiKey = request.headers.get('x-api-key')
  if (!clientApiKey) {
    return Response.json(
      { error: 'API key required. Your browser decrypts the key from your vault before sending.' },
      { status: 400 }
    )
  }

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

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': clientApiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      stream: true,
      messages,
    }),
  })

  if (response.status === 401) {
    return Response.json(
      { error: 'Invalid Anthropic API key. Update your key in Account > Credentials.' },
      { status: 401 }
    )
  }

  if (!response.ok) {
    return Response.json(
      { error: `AI service error: ${response.status}` },
      { status: 502 }
    )
  }

  // Stream the response through
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader()
      if (!reader) {
        controller.close()
        return
      }

      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const event = JSON.parse(data)
              if (event.type === 'content_block_delta' && event.delta?.text) {
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
                )
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
