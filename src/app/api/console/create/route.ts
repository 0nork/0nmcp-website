import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { callAIChat } from '@/lib/ai-provider'
import { EXECUTION_TOOLS, executeAction, type ExecutionResult } from '@/lib/execution-engine'
import { getUserCredentials } from '@/lib/vault-bridge'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/* ──────────────────────────────────────────── */
/*  Types                                      */
/* ──────────────────────────────────────────── */

interface ConversationEntry {
  role: 'user' | 'assistant'
  content: string
}

interface RequestBody {
  message: string
  history: ConversationEntry[]
  /** When true, AI should generate the final .0n workflow JSON */
  generateWorkflow?: boolean
  /** Execute a full workflow (array of steps) */
  executeWorkflow?: { steps: Array<{ id: string; service: string; action: string; params: Record<string, unknown>; description?: string }> }
}

/* ──────────────────────────────────────────── */
/*  Execution mode detection                   */
/* ──────────────────────────────────────────── */

const EXECUTION_TRIGGERS = [
  'run it', 'execute', 'test it', 'do it now', 'do it', 'run this',
  'try it', 'go ahead', 'make it happen', 'fire it', 'launch it',
  'how many contacts', 'how many customers', 'what\'s my revenue',
  'check my', 'show me my', 'list my', 'get my', 'send a message',
  'post to slack', 'create a contact', 'search contacts', 'check revenue',
  'what\'s my balance', 'list channels', 'send email', 'run the workflow',
  'execute the workflow', 'run each step', 'test the workflow',
]

function shouldUseExecution(message: string, hasWorkflow: boolean): boolean {
  const lower = message.toLowerCase().trim()
  // Direct execution requests
  if (EXECUTION_TRIGGERS.some(t => lower.includes(t))) return true
  // If a workflow was just generated and user confirms
  if (hasWorkflow && /^(yes|yep|yeah|sure|ok|do it|go|let'?s go|run|execute)$/i.test(lower)) return true
  return false
}

/* ──────────────────────────────────────────── */
/*  System Prompt                              */
/* ──────────────────────────────────────────── */

const SYSTEM_PROMPT = `You are the 0n Create Agent — an expert AI that guides users through building the perfect .0n workflow file, one question at a time. You can also EXECUTE real actions.

## Your Personality
- Conversational, encouraging, and concise
- Ask ONE question at a time — never multiple
- After each answer, briefly confirm what you heard, then ask the next question
- Use bullet options when possible so users can pick quickly

## The .0n Workflow Format
A .0n file is a JSON workflow definition with this structure:
\`\`\`json
{
  "$0n": {
    "version": "1.0.0",
    "type": "workflow",
    "created": "ISO-date",
    "name": "Workflow Name",
    "description": "What it does"
  },
  "trigger": {
    "type": "webhook|schedule|event|manual",
    "config": { ... }
  },
  "inputs": {
    "input_key": {
      "type": "string|number|boolean|select|textarea",
      "description": "What this input is for",
      "required": true,
      "placeholder": "example"
    }
  },
  "launch_codes": {
    "SERVICE_API_KEY": {
      "label": "Display Name",
      "description": "What key is needed",
      "type": "string",
      "required": true,
      "help_url": "https://where-to-get-it.com"
    }
  },
  "steps": [
    {
      "id": "step_id",
      "service": "service_name",
      "action": "what_this_step_does",
      "params": { ... },
      "description": "Human-readable explanation"
    }
  ]
}
\`\`\`

## Available Services (48)
crm, stripe, sendgrid, slack, discord, twilio, github, shopify, openai, anthropic, gmail, google_sheets, google_drive, airtable, notion, mongodb, supabase, zendesk, jira, hubspot, mailchimp, google_calendar, calendly, zoom, linear, microsoft, quickbooks, asana, intercom, dropbox, whatsapp, instagram, x_twitter, tiktok, google_ads, facebook_ads, plaid, square, linkedin, pipedrive, azure, aws_s3, vercel, cloudflare, twitch, reddit, pinterest, youtube

## Execution Mode
You can EXECUTE actions in real-time using the available tools. When the user asks you to run a workflow, test a step, or query real data, use the tools to execute REAL API calls. You have access to:
- CRM: search contacts, create contacts, send emails, manage pipelines, list contacts
- Stripe: check revenue, list customers, list subscriptions, get balance, create invoices
- Slack: post messages, list channels, get messages
- Data: query connected service data

When you execute an action, tell the user what you did and show the real result clearly. If a tool call fails, explain the error and suggest fixes.

## Conversation Flow
1. **Greeting**: "What would you like to automate?" — offer 4-5 popular ideas as bullet options
2. **Services**: Based on their answer, suggest which services to use — ask if they agree
3. **Trigger**: Ask how the workflow should start (webhook, schedule, event, manual)
4. **Steps**: Walk through the key steps 1-by-1, confirming each
5. **Inputs**: Ask if users need to provide any custom inputs when running it
6. **Summary**: Show a clean summary of the workflow, ask for confirmation
7. **Generate**: When they confirm, output ONLY the JSON inside a \`\`\`json fence, nothing else

## When generating the final workflow:
- Output ONLY the JSON inside \`\`\`json ... \`\`\` code fences
- No additional text before or after the JSON
- Use real service IDs from the 26-service catalog
- Include proper launch_codes for every service that needs API keys
- Create meaningful step IDs (snake_case)
- Reference previous step outputs with {{step_id.output}}
- Set the created date to now

## Rules
1. NEVER say "GHL", "Go High Level", "High Level", or "HighLevel" — always say "CRM"
2. Refer to .0n files as "SWITCH files" and workflows as "RUNs" when using brand terminology
3. Keep responses under 4 sentences + options unless summarizing
4. Be encouraging: "Nice choice!" not "Input accepted."
5. When offering options, format as a numbered list or bullet points
6. After step 6 (summary), ask: "Ready to generate your SWITCH file?"
7. If the user says "generate", "build it", "create it", "yes", "let's go" — output the JSON immediately`

/* ──────────────────────────────────────────── */
/*  POST Handler                               */
/* ──────────────────────────────────────────── */

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { message, history } = body

  /* ──────────────────────────────────────────── */
  /*  Workflow execution mode (Run Workflow btn) */
  /* ──────────────────────────────────────────── */
  if (body.executeWorkflow?.steps) {
    const steps = body.executeWorkflow.steps
    const results: Array<{ stepId: string; action: string; result: ExecutionResult }> = []
    const userCredentials = await getUserCredentials(user.id)

    for (const step of steps) {
      // Map workflow step action names to execution engine tool names
      const toolName = mapStepToTool(step.service, step.action)
      if (!toolName) {
        results.push({
          stepId: step.id,
          action: step.action,
          result: {
            success: false,
            action: step.action,
            service: step.service,
            error: `No executable tool found for ${step.service}/${step.action}. This step would need a ${step.service} connection.`,
            executedAt: new Date().toISOString(),
          },
        })
        continue
      }

      const result = await executeAction(toolName, step.params || {}, user.id, userCredentials)
      results.push({ stepId: step.id, action: toolName, result })

      // Stop on failure (unless it's a non-critical step)
      if (!result.success && step.id !== steps[steps.length - 1]?.id) {
        // Continue anyway — show all results
      }
    }

    return NextResponse.json({
      text: `Executed ${results.length} step(s).`,
      workflow: null,
      executions: results,
    })
  }

  /* ──────────────────────────────────────────── */
  /*  Regular chat / execution mode              */
  /* ──────────────────────────────────────────── */
  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  try {
    // Build messages from history
    const aiMessages: Array<{ role: 'user' | 'assistant'; content: string }> = []
    const conversationHistory = Array.isArray(history) ? history.slice(-20) : []

    // Check if any prior message has a workflow (for execution context)
    let hasWorkflowInHistory = false
    for (const entry of conversationHistory) {
      if (entry.role === 'user' || entry.role === 'assistant') {
        aiMessages.push({
          role: entry.role,
          content: String(entry.content).slice(0, 6000),
        })
        if (String(entry.content).includes('"$0n"') || String(entry.content).includes('"steps"')) {
          hasWorkflowInHistory = true
        }
      }
    }

    aiMessages.push({ role: 'user', content: String(message).slice(0, 6000) })

    // Decide: execution mode or build mode
    const useExecution = shouldUseExecution(message, hasWorkflowInHistory)

    if (useExecution) {
      console.log(`[create] Execution mode for user ${user.id}`)
      const execCreds = await getUserCredentials(user.id)
      const execResult = await callAnthropicWithTools(SYSTEM_PROMPT, aiMessages, user.id, execCreds)

      if (!execResult) {
        // Fall back to regular chat
        console.log('[create] Anthropic tool calling unavailable, falling back to chat')
        return await handleRegularChat(aiMessages, user, supabase)
      }

      return NextResponse.json({
        text: execResult.text,
        workflow: null,
        executions: execResult.executions,
      })
    }

    // Regular build mode
    return await handleRegularChat(aiMessages, user, supabase)
  } catch (err) {
    console.error('[console/create] AI error:', err)
    return NextResponse.json({
      text: 'Something went wrong generating your workflow. Please try again.',
      workflow: null,
    })
  }
}

/* ──────────────────────────────────────────── */
/*  Regular chat handler (build mode)          */
/* ──────────────────────────────────────────── */

async function handleRegularChat(
  aiMessages: Array<{ role: 'user' | 'assistant'; content: string }>,
  user: { id: string },
  supabase: Awaited<ReturnType<typeof createSupabaseServer>>
) {
  console.log(`[create] Calling callAIChat for user ${user.id} with ${aiMessages.length} messages`)
  const result = await callAIChat(SYSTEM_PROMPT, aiMessages, user.id, 4000)

  if (!result) {
    console.error(`[create] callAIChat returned null — all providers failed for user ${user.id}`)
    return NextResponse.json({
      text: "I'm not available right now — no AI provider is configured. Check your admin settings.",
      workflow: null,
    })
  }
  console.log(`[create] AI responded via ${result.provider}`)

  const rawText = result.text

  // Check if the response contains a .0n workflow JSON
  let workflow: Record<string, unknown> | null = null
  const jsonMatch = rawText.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/)
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1].trim())
      if (parsed.$0n || parsed['0n'] || parsed.steps) {
        workflow = parsed
      }
    } catch {
      // Not valid JSON, that's fine
    }
  }

  // If workflow was generated, save it to workflow_files
  let savedWorkflowId: string | null = null
  if (workflow && supabase) {
    const header = (workflow.$0n || workflow['0n']) as Record<string, string> | undefined
    const name = header?.name || (workflow as { name?: string }).name || 'Untitled Workflow'

    const { data: wf } = await supabase
      .from('workflow_files')
      .insert({
        owner_id: user.id,
        file_key: `create_${Date.now()}`,
        name,
        description: header?.description || (workflow as { description?: string }).description || '',
        version: header?.version || '1.0.0',
        step_count: Array.isArray(workflow.steps) ? workflow.steps.length : 0,
        services_used: Array.isArray(workflow.steps)
          ? [...new Set((workflow.steps as Array<{ service?: string }>).map(s => s.service).filter(Boolean))]
          : [],
        tags: [],
        status: 'active',
        workflow_data: workflow,
      })
      .select('id')
      .single()

    if (wf) savedWorkflowId = wf.id
  }

  // Clean text (remove the JSON block for display)
  const displayText = workflow
    ? rawText.replace(/```(?:json)?\s*\n?[\s\S]*?\n?```/g, '').trim() || 'Your SWITCH file has been generated and saved!'
    : rawText

  return NextResponse.json({
    text: displayText,
    workflow,
    savedWorkflowId,
  })
}

/* ──────────────────────────────────────────── */
/*  Anthropic tool calling (execution mode)    */
/* ──────────────────────────────────────────── */

interface ToolCallExecution {
  toolName: string
  toolInput: Record<string, unknown>
  result: ExecutionResult
}

async function callAnthropicWithTools(
  system: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  userId: string,
  userCredentials?: import('@/lib/vault-bridge').UserCredentials
): Promise<{ text: string; executions: ToolCallExecution[] } | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('[create] ANTHROPIC_API_KEY not set — cannot use tool calling')
    return null
  }

  // Convert EXECUTION_TOOLS to Anthropic tool format
  const tools = EXECUTION_TOOLS.map(t => ({
    name: t.name,
    description: t.description,
    input_schema: t.input_schema,
  }))

  // Build initial messages
  const anthropicMessages: Array<Record<string, unknown>> = messages.map(m => ({
    role: m.role,
    content: m.content,
  }))

  const executions: ToolCallExecution[] = []
  let finalText = ''
  let iterations = 0
  const MAX_ITERATIONS = 5

  while (iterations < MAX_ITERATIONS) {
    iterations++

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system,
        messages: anthropicMessages,
        tools,
      }),
      signal: AbortSignal.timeout(60000),
    })

    if (!res.ok) {
      const errBody = await res.text().catch(() => '')
      console.error(`[create] Anthropic tool call ${res.status}: ${errBody.slice(0, 500)}`)
      return null
    }

    const data = await res.json() as {
      content: Array<{ type: string; text?: string; id?: string; name?: string; input?: Record<string, unknown> }>
      stop_reason: string
    }

    // Collect text blocks
    const textBlocks: string[] = []
    const toolUseBlocks: Array<{ id: string; name: string; input: Record<string, unknown> }> = []

    for (const block of data.content) {
      if (block.type === 'text' && block.text) {
        textBlocks.push(block.text)
      } else if (block.type === 'tool_use' && block.id && block.name) {
        toolUseBlocks.push({
          id: block.id,
          name: block.name,
          input: block.input || {},
        })
      }
    }

    finalText += textBlocks.join('\n')

    // If no tool calls, we're done
    if (toolUseBlocks.length === 0 || data.stop_reason !== 'tool_use') {
      break
    }

    // Execute each tool call
    const toolResults: Array<{ type: 'tool_result'; tool_use_id: string; content: string }> = []

    for (const toolCall of toolUseBlocks) {
      console.log(`[create] Executing tool: ${toolCall.name}`, JSON.stringify(toolCall.input).slice(0, 200))
      const result = await executeAction(toolCall.name, toolCall.input, userId, userCredentials)
      executions.push({
        toolName: toolCall.name,
        toolInput: toolCall.input,
        result,
      })
      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolCall.id,
        content: JSON.stringify(result.success ? result.data : { error: result.error }).slice(0, 8000),
      })
    }

    // Add assistant message with tool use + tool results for next iteration
    anthropicMessages.push({
      role: 'assistant',
      content: data.content,
    })
    anthropicMessages.push({
      role: 'user',
      content: toolResults,
    })
  }

  return { text: finalText, executions }
}

/* ──────────────────────────────────────────── */
/*  Step-to-tool mapper (for Run Workflow)     */
/* ──────────────────────────────────────────── */

function mapStepToTool(service: string, action: string): string | null {
  // Direct match — action IS the tool name
  const toolNames = EXECUTION_TOOLS.map(t => t.name)
  if (toolNames.includes(action)) return action

  // Service + action mapping
  const lower = `${service}_${action}`.toLowerCase()
  const mapped = toolNames.find(t => t === lower)
  if (mapped) return mapped

  // Fuzzy mapping by service
  const serviceMap: Record<string, string[]> = {
    crm: toolNames.filter(t => t.includes('crm')),
    stripe: toolNames.filter(t => t.includes('stripe')),
    slack: toolNames.filter(t => t.includes('slack')),
  }

  const candidates = serviceMap[service.toLowerCase()] || []
  if (candidates.length === 0) return null

  // Try to match by action keyword
  const actionLower = action.toLowerCase()
  const match = candidates.find(c => {
    const parts = c.split('_')
    return parts.some(p => actionLower.includes(p))
  })

  return match || null
}
