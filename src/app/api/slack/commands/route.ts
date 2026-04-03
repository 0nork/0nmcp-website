/**
 * /api/slack/commands — Slash command handler for /0nmcp
 *
 * Commands:
 * - /0nmcp (no args) -- Welcome message
 * - /0nmcp status    -- Connection status, tools count
 * - /0nmcp run <desc> -- Execute a natural language workflow via AI
 * - /0nmcp connect   -- Link to connect services
 * - /0nmcp help      -- List all commands
 *
 * Strategy: Acknowledge with 200 immediately, then send the real
 * response to response_url asynchronously.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { callAIChat } from '@/lib/ai-provider'
import { STATS, STATS_DISPLAY } from '@/data/stats'
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

const RUN_SYSTEM_PROMPT =
  `You are the 0nMCP execution engine -- a universal AI API orchestrator with ${STATS_DISPLAY.tools} tools across ${STATS_DISPLAY.services} services. ` +
  'The user describes a task in natural language. Explain step by step how 0nMCP would execute it, which services and tools would be used, and what the expected result would be. ' +
  'Format for Slack: use *bold* for tool names, `code` for values, bullet points for steps. ' +
  'Keep it under 2000 characters. Be specific about which 0nMCP tools apply.\n' +
  'Never say "GHL", "Go High Level", or "HighLevel" -- always say "CRM".\n'

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
      text: `Processing: ${args}...`,
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
      '`/0nmcp status` -- View connection status\n' +
      '`/0nmcp run <task>` -- Execute a workflow with AI\n' +
      '`/0nmcp connect` -- Connect your services\n' +
      '`/0nmcp help` -- Show all commands'
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
      '`/0nmcp` -- Welcome message and quick links\n' +
      '`/0nmcp status` -- Platform stats and tool counts\n' +
      '`/0nmcp run <description>` -- Run a workflow using AI\n' +
      '`/0nmcp connect` -- Connect your service accounts\n' +
      '`/0nmcp help` -- This help message'
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

// ── Async AI Response ──

async function buildRunResponse(taskDescription: string): Promise<SlackBlock[]> {
  const result = await callAIChat(
    RUN_SYSTEM_PROMPT,
    [{ role: 'user' as const, content: taskDescription }],
    undefined,
    1024
  )

  const aiText = result?.text || 'Could not process this request right now. Please try again.'

  // Truncate for Slack
  const truncated =
    aiText.length > 2800
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
