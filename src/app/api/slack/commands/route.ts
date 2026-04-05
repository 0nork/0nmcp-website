/**
 * /api/slack/commands — Slash command handler for /0n
 *
 * Commands:
 * - /0n (no args) -- Welcome message
 * - /0n status    -- Connection status, tools count
 * - /0n run <desc> -- Execute a natural language task via AI with REAL execution
 * - /0n connect   -- Link to connect services
 * - /0n help      -- List all commands
 *
 * Strategy: Acknowledge with 200 immediately, then send the real
 * response to response_url asynchronously.
 *
 * The `run` command now uses Anthropic tool calling to ACTUALLY execute
 * actions (CRM, Stripe, Slack) — not just describe them.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { STATS, STATS_DISPLAY } from '@/data/stats'
import { executeAction, EXECUTION_TOOLS, type ExecutionResult } from '@/lib/execution-engine'
import {
  verifySlackRequest,
  section,
  header,
  divider,
  actions,
  button,
  codeBlock,
} from '@/lib/slack'
import type { SlackBlock } from '@/lib/slack'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SYSTEM_PROMPT =
  `You are the 0nMCP execution engine running inside Slack. You have access to tools that ACTUALLY execute API calls.\n` +
  `You have ${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services.\n\n` +
  'CRITICAL: When a user describes a task, USE THE TOOLS to execute it for real. Do not just describe what you would do.\n' +
  'For example:\n' +
  '- "search contacts for john" → call search_crm_contacts\n' +
  '- "how much revenue this month" → call get_stripe_revenue\n' +
  '- "post hello to #general" → call post_to_slack\n' +
  '- "create a contact for jane@example.com" → call create_crm_contact\n\n' +
  'After executing, format the results for Slack: use *bold* for tool names, `code` for values.\n' +
  'Keep it under 2000 characters. Never say "GHL" or "Go High Level" — always say "CRM".\n'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  // Verify signing secret
  const timestamp = request.headers.get('x-slack-request-timestamp')
  const signature = request.headers.get('x-slack-signature')

  if (!verifySlackRequest(timestamp, signature, rawBody)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Parse form-encoded body
  const params = new URLSearchParams(rawBody)
  const commandText = (params.get('text') || '').trim()
  const responseUrl = params.get('response_url') || ''

  // Parse subcommand
  const parts = commandText.split(/\s+/)
  const subcommand = (parts[0] || '').toLowerCase()
  const args = parts.slice(1).join(' ')

  // Acknowledge immediately with a loading state
  // Then send the real response to response_url
  if (subcommand === 'run' && args) {
    // Send immediate acknowledgment
    sendAsync(responseUrl, await buildRunResponse(args))
    return NextResponse.json({
      response_type: 'ephemeral',
      text: `Executing: ${args}...`,
    })
  }

  // For instant commands, respond directly
  let blocks: SlackBlock[]

  switch (subcommand) {
    case 'status':
      blocks = buildStatusBlocks()
      break
    case 'connect':
      blocks = buildConnectBlocks()
      break
    case 'help':
      blocks = buildHelpBlocks()
      break
    default:
      blocks = buildWelcomeBlocks()
  }

  return NextResponse.json({
    response_type: 'ephemeral',
    blocks,
  })
}

// ── Command Builders ──

function buildWelcomeBlocks(): SlackBlock[] {
  return [
    header('0nMCP -- Universal AI API Orchestrator'),
    section(
      `*${STATS_DISPLAY.tools} tools* across *${STATS_DISPLAY.services} services* in *${STATS_DISPLAY.categories} categories*.\n` +
      'Stop building workflows. Start describing outcomes.'
    ),
    divider(),
    section(
      '*Quick Commands:*\n' +
      '`/0n status` -- View connection status\n' +
      '`/0n run <task>` -- Execute a task with AI (REAL execution)\n' +
      '`/0n connect` -- Connect your services\n' +
      '`/0n help` -- Show all commands'
    ),
    divider(),
    actions([
      button('Open Dashboard', 'open_dashboard', 'https://www.0nmcp.com/dashboard', 'primary'),
      button('View Docs', 'open_docs', 'https://www.0nmcp.com/0n-standard'),
    ]),
  ]
}

function buildStatusBlocks(): SlackBlock[] {
  return [
    header('0nMCP Status'),
    section(
      `*Tools:* ${STATS.tools.toLocaleString()}\n` +
      `*Services:* ${STATS.services}\n` +
      `*Categories:* ${STATS.categories}\n` +
      `*Capabilities:* ${STATS.capabilities.toLocaleString()}\n` +
      `*Patents Pending:* ${STATS.patents}`
    ),
    divider(),
    section(
      '*Tool Breakdown:*\n' +
      `Catalog: ${STATS.catalog_tools} | CRM: ${STATS.crm_tools} | Vault: ${STATS.vault_tools + STATS.vault_container_tools} | Engine: ${STATS.engine_tools} | Deed: ${STATS.deed_tools}`
    ),
    section(
      '*Execution Engine:*\n' +
      `Live tools: ${EXECUTION_TOOLS.length} | Services: CRM, Stripe, Slack, Data\n` +
      'Status: ACTIVE -- tool calls execute for real'
    ),
  ]
}

function buildConnectBlocks(): SlackBlock[] {
  return [
    header('Connect Services'),
    section(
      'Connect your accounts to unlock 0nMCP workflows.\n' +
      'Visit the dashboard to configure your integrations:'
    ),
    actions([
      button('Connect Services', 'open_connect', 'https://www.0nmcp.com/connect', 'primary'),
    ]),
  ]
}

function buildHelpBlocks(): SlackBlock[] {
  return [
    header('0nMCP Commands'),
    section(
      '`/0n` -- Welcome message and quick links\n' +
      '`/0n status` -- Platform stats and tool counts\n' +
      '`/0n run <description>` -- *Execute a task using AI (REAL)*\n' +
      '`/0n connect` -- Connect your service accounts\n' +
      '`/0n help` -- This help message'
    ),
    divider(),
    section(
      '*Execution Engine:*\n' +
      'The `/0n run` command now ACTUALLY executes actions:\n' +
      '- `/0n run search contacts for john` -- searches CRM for real\n' +
      '- `/0n run how much revenue this month` -- queries Stripe\n' +
      '- `/0n run post "hello team" to #general` -- posts to Slack\n' +
      '- `/0n run create contact jane@example.com` -- creates CRM contact'
    ),
    divider(),
    section(
      '*Mention the bot:*\n' +
      'You can also @0nMCP in any channel to ask questions or run tasks.\n\n' +
      '*DM the bot:*\n' +
      'Send a direct message for private conversations.'
    ),
  ]
}

// ── AI + Execution Response Builder ──

async function buildRunResponse(taskDescription: string): Promise<SlackBlock[]> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY

  // If we have Anthropic key, use tool calling for REAL execution
  if (anthropicKey) {
    try {
      const result = await callAnthropicWithToolsForSlack(taskDescription)
      if (result) {
        const blocks: SlackBlock[] = [
          header('0nMCP Execution'),
          section(`*Task:* ${taskDescription}`),
          divider(),
        ]

        // Show each execution
        if (result.toolCalls.length > 0) {
          for (const tc of result.toolCalls) {
            const status = tc.result.success ? 'EXECUTED' : 'FAILED'
            const icon = tc.result.success ? ':white_check_mark:' : ':x:'
            blocks.push(section(
              `${icon} *${status}*: \`${tc.name}\` on *${tc.result.service}*\n` +
              `Input: \`${JSON.stringify(tc.input).slice(0, 200)}\`\n` +
              (tc.result.success
                ? `Result: \`${JSON.stringify(tc.result.data).slice(0, 500)}\``
                : `Error: ${tc.result.error}`)
            ))
          }
          blocks.push(divider())
        }

        // AI's summary
        if (result.text) {
          const truncated = result.text.length > 2000
            ? result.text.slice(0, 1950) + '\n\n_[Response truncated]_'
            : result.text
          blocks.push(section(truncated))
        }

        blocks.push(divider())
        blocks.push(section(
          `_${result.toolCalls.length} action(s) executed | Powered by ${STATS_DISPLAY.tools} tools_`
        ))

        return blocks
      }
    } catch (err) {
      console.error('[slack/run] Execution error:', err)
    }
  }

  // Fallback: text-only response via ai-provider
  const { callAIChat } = await import('@/lib/ai-provider')
  const result = await callAIChat(
    SYSTEM_PROMPT,
    [{ role: 'user' as const, content: taskDescription }],
    undefined,
    1024
  )

  const aiText = result?.text || 'Could not process this request right now. Please try again.'
  const truncated = aiText.length > 2800
    ? aiText.slice(0, 2750) + '\n\n_[Response truncated]_'
    : aiText

  return [
    header('0nMCP Run'),
    section(`*Task:* ${taskDescription}`),
    divider(),
    section(truncated),
    divider(),
    section(
      `_Powered by ${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services_`
    ),
  ]
}

// ── Anthropic Tool Calling (Slack-specific) ──

async function callAnthropicWithToolsForSlack(
  task: string
): Promise<{
  text: string
  toolCalls: Array<{ name: string; input: Record<string, unknown>; result: ExecutionResult }>
} | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return null

  const toolCalls: Array<{ name: string; input: Record<string, unknown>; result: ExecutionResult }> = []

  const tools = EXECUTION_TOOLS.map(t => ({
    name: t.name,
    description: t.description,
    input_schema: t.input_schema,
  }))

  type ContentBlock = {
    type: 'text' | 'tool_use' | 'tool_result'
    text?: string
    id?: string
    name?: string
    input?: Record<string, unknown>
    tool_use_id?: string
    content?: string
    is_error?: boolean
  }

  let messages: Array<{ role: 'user' | 'assistant'; content: string | ContentBlock[] }> = [
    { role: 'user', content: task },
  ]
  let finalText = ''

  for (let round = 0; round < 4; round++) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages,
        tools,
      }),
      signal: AbortSignal.timeout(30000),
    })

    if (!res.ok) {
      console.error(`[slack/run] Anthropic ${res.status}`)
      return null
    }

    const data = await res.json() as { content: ContentBlock[]; stop_reason: string }

    const toolUses = data.content.filter(c => c.type === 'tool_use')
    const textBlocks = data.content.filter(c => c.type === 'text')

    for (const block of textBlocks) {
      if (block.text) finalText += (finalText ? '\n' : '') + block.text
    }

    if (toolUses.length === 0) break

    // Execute tools
    const toolResults: ContentBlock[] = []
    for (const toolUse of toolUses) {
      if (!toolUse.name || !toolUse.id) continue

      console.log(`[slack/run] EXECUTING: ${toolUse.name}`)
      const result = await executeAction(toolUse.name, (toolUse.input || {}) as Record<string, unknown>)

      toolCalls.push({
        name: toolUse.name,
        input: (toolUse.input || {}) as Record<string, unknown>,
        result,
      })

      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolUse.id,
        content: JSON.stringify(result.success ? result.data : { error: result.error }),
        is_error: !result.success,
      })
    }

    messages = [
      ...messages,
      { role: 'assistant', content: data.content },
      { role: 'user', content: toolResults },
    ]
  }

  return { text: finalText, toolCalls }
}

async function sendAsync(responseUrl: string, blocks: SlackBlock[]) {
  if (!responseUrl) return

  try {
    await fetch(responseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        response_type: 'ephemeral',
        replace_original: true,
        blocks,
      }),
    })
  } catch (err) {
    console.error('[slack/commands] Failed to send async response:', err)
  }
}
