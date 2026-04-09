/**
 * 0nExec Alert Dispatcher
 * Sends Slack alerts when scores cross CRITICAL threshold
 * Writes to exec_alerts table
 */

import { createClient } from '@supabase/supabase-js'
import type { ClientScore, AnomalyFlag } from './scoring-engine'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface AlertContext {
  userId: string
  clientId: string
  clientName: string
  dealId: string
  scoreBefore: number
  scoreAfter: ClientScore
  slackWebhookUrl?: string
}

export async function dispatchAlerts(ctx: AlertContext): Promise<void> {
  const { scoreAfter } = ctx

  // Only alert on CRITICAL band or significant drops
  const isCritical = scoreAfter.band === 'CRITICAL'
  const isSignificantDrop = ctx.scoreBefore - scoreAfter.total >= 15

  if (!isCritical && !isSignificantDrop) return

  // Find the worst flag to highlight
  const worstFlag = scoreAfter.flags
    .filter(f => f.severity === 'critical')
    .sort((a, b) => (b.hackNumber || 0) - (a.hackNumber || 0))[0]
    || scoreAfter.flags[0]

  // Write to exec_alerts
  await supabase.from('exec_alerts').insert({
    onmcp_user_id: ctx.userId,
    client_id: ctx.clientId,
    alert_type: isCritical ? 'score_drop' : 'score_drop',
    score_before: ctx.scoreBefore,
    score_after: scoreAfter.total,
    flag_hack_number: worstFlag?.hackNumber,
    flag_layer: worstFlag?.layer,
    flag_issue: worstFlag?.message,
  })

  // Send Slack if webhook configured
  if (ctx.slackWebhookUrl) {
    await sendSlackAlert(ctx, worstFlag)
  }
}

async function sendSlackAlert(ctx: AlertContext, flag?: AnomalyFlag): Promise<void> {
  const hackInfo = flag?.hackNumber
    ? `\n*Hack #${flag.hackNumber}* — ${flag.message}`
    : flag?.message ? `\n${flag.message}` : ''

  const message = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*⬡ AI FLAG — ${ctx.scoreAfter.band}*\n*${ctx.clientName}* dropped to *${ctx.scoreAfter.total}/100* (was ${ctx.scoreBefore})${hackInfo}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'View in 0nExec' },
            url: `https://0nmcp.com/console/exec/client/${ctx.dealId}`,
          },
        ],
      },
    ],
  }

  try {
    await fetch(ctx.slackWebhookUrl!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    })

    // Mark slack_sent
    await supabase
      .from('exec_alerts')
      .update({ slack_sent: true })
      .eq('client_id', ctx.clientId)
      .eq('score_after', ctx.scoreAfter.total)
      .order('created_at', { ascending: false })
      .limit(1)
  } catch {
    // Slack send failure is non-fatal
  }
}
