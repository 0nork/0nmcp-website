import { NextRequest, NextResponse } from 'next/server'
import { verifySlackSignature } from '@/lib/slack-client'
import { runMCPCommand } from '@/lib/command-runner'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headers = req.headers

  const isValid = await verifySlackSignature(body, headers)
  if (!isValid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = new URLSearchParams(body)
  const text = params.get('text') || ''
  const userId = params.get('user_id') || ''
  const responseUrl = params.get('response_url') || ''

  // Immediately acknowledge (Slack requires <3s response)
  processCommand(text, userId, responseUrl)

  return NextResponse.json({
    response_type: 'ephemeral',
    text: `Running: *${text}*\nResult coming in a few seconds...`,
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
