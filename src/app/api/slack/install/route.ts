/**
 * /api/slack/install — Redirect to Slack OAuth authorization
 *
 * GET /api/slack/install → redirect to Slack's OAuth page
 */

import { redirect } from 'next/navigation'
import { SLACK_CONFIG } from '@/lib/slack'

export const dynamic = 'force-dynamic'

export async function GET() {
  const url = new URL('https://slack.com/oauth/v2/authorize')
  url.searchParams.set('client_id', SLACK_CONFIG.CLIENT_ID)
  url.searchParams.set('scope', SLACK_CONFIG.SCOPES)
  url.searchParams.set('user_scope', SLACK_CONFIG.USER_SCOPES)
  url.searchParams.set('redirect_uri', SLACK_CONFIG.REDIRECT_URI)

  redirect(url.toString())
}
