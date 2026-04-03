/**
 * /api/slack/interactions — Interactive components handler
 *
 * Handles button clicks, modal submissions, and other
 * Block Kit interactive payloads from Slack.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { verifySlackRequest, getBotToken, postMessage } from '@/lib/slack'
import { SLACK_CONFIG } from '@/lib/slack'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  // Verify signing secret
  const timestamp = request.headers.get('x-slack-request-timestamp')
  const signature = request.headers.get('x-slack-signature')

  if (!verifySlackRequest(timestamp, signature, rawBody)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // Interactions come as form-encoded with a `payload` field
  const params = new URLSearchParams(rawBody)
  const payloadStr = params.get('payload')
  if (!payloadStr) {
    return NextResponse.json({ error: 'No payload' }, { status: 400 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(payloadStr)
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const type = payload.type as string

  // Handle block_actions (button clicks)
  if (type === 'block_actions') {
    const actionsArr = payload.actions as Array<Record<string, string>> | undefined
    if (!actionsArr?.length) return NextResponse.json({ ok: true })

    const action = actionsArr[0]
    const actionId = action.action_id

    // URL-opening buttons are handled client-side by Slack.
    // For non-URL actions, we can handle them here.
    switch (actionId) {
      case 'open_dashboard':
      case 'open_docs':
      case 'open_connect': {
        // These are link buttons -- Slack opens them directly
        // No server action needed
        break
      }
      default: {
        // Unknown action -- acknowledge
        const team = payload.team as { id?: string } | undefined
        const channel = (payload.channel as { id?: string })?.id
        if (channel) {
          const token = await getBotToken(team?.id)
          await postMessage(
            token,
            channel,
            `Action received: ${actionId}. Visit ${SLACK_CONFIG.APP_URL}/dashboard for full functionality.`
          )
        }
      }
    }

    return NextResponse.json({ ok: true })
  }

  // Handle view_submission (modal forms)
  if (type === 'view_submission') {
    // Future: handle modal submissions for service connections
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ ok: true })
}
