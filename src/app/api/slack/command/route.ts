import { NextRequest, NextResponse } from 'next/server'
import { verifySlackRequest } from '@/lib/slack'
import { runMCPCommand } from '@/lib/command-runner'

export async function POST(req: NextRequest) {
  const body = await req.text()

  const timestamp = req.headers.get('x-slack-request-timestamp')
  const signature = req.headers.get('x-slack-signature')

  if (!verifySlackRequest(timestamp, signature, body)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const params = new URLSearchParams(body)
  const rawCommand = params.get('command') || '/0n'
  const text = params.get('text') || ''
  const userId = params.get('user_id') || ''
  const responseUrl = params.get('response_url') || ''

  // Map specific slash commands to their prompt prefix
  const COMMAND_MAP: Record<string, string> = {
    '/0n-leads': 'leads',
    '/0n-enrich': 'enrich',
    '/0n-brief': 'brief',
    '/0n-sequence': 'sequence',
    '/0n-post': 'post',
    '/0n-pipeline': 'pipeline',
    '/0n-revenue': 'revenue',
    '/0n-deploy': 'deploy-status',
    '/0n-pr': 'pr',
    '/0n-query': 'query',
    '/0n-bug': 'bug',
    '/0n-research': 'research',
    '/0n-person': 'person',
    '/0n-find': 'find',
    '/0n-briefing': 'briefing',
    '/0n-wrap': 'wrap',
    '/0n-report': 'report',
    '/0n-task': 'task',
    '/0n-prospect': 'prospect',
    '/0n-compete': 'compete',
    '/0n-newsletter': 'newsletter',
    '/0n-seo': 'seo-brief',
    '/0n-security': 'security-check',
    '/0n-stack': 'stack',
  }

  const prefix = COMMAND_MAP[rawCommand] || ''
  const fullPrompt = prefix ? `${prefix} ${text}`.trim() : text

  // Immediately acknowledge (Slack requires <3s response)
  processCommand(fullPrompt, userId, responseUrl)

  const displayCmd = rawCommand === '/0n' ? text : `${rawCommand.replace('/0n-', '')} ${text}`.trim()

  return NextResponse.json({
    response_type: 'ephemeral',
    text: `Running: *${displayCmd}*\nResult coming in a few seconds...`,
  })
}

async function processCommand(
  text: string,
  userId: string,
  responseUrl: string
) {
  try {
    const result = await runMCPCommand(text, userId)

    const response = {
      response_type: 'in_channel',
      blocks: [
        {
          type: 'header',
          text: { type: 'plain_text', text: '0nmcp Result' },
        },
        {
          type: 'section',
          text: { type: 'mrkdwn', text: result.content },
        },
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `Services used: ${result.servicesUsed.join(', ')} | ${result.duration}ms` },
          ],
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Save to Notion' },
              value: `save:${result.id}`,
              action_id: 'save_to_notion',
            },
            {
              type: 'button',
              text: { type: 'plain_text', text: 'Run Again' },
              value: text,
              action_id: 'run_again',
            },
          ],
        },
      ],
    }

    await fetch(responseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    })
  } catch (err) {
    await fetch(responseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        response_type: 'ephemeral',
        text: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }),
    })
  }
}
