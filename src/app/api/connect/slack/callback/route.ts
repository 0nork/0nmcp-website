// Slack OAuth callback — exchange the code for the workspace's bot token and
// store it (encrypted) in the user's 0nVault. Their Slack, their token.
import { NextRequest, NextResponse } from 'next/server'
import { storeUserCredential } from '@/lib/vault-bridge'
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.0nmcp.com'
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code'); const state = searchParams.get('state'); const err = searchParams.get('error')
  if (err) return NextResponse.redirect(`${SITE}/vault?slack=denied`)
  if (!code || !state) return NextResponse.redirect(`${SITE}/vault?slack=error`)
  try {
    const body = new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      code,
      redirect_uri: `${SITE}/api/connect/slack/callback`,
    })
    const d = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body,
    }).then((r) => r.json())
    if (!d.ok || !d.access_token) return NextResponse.redirect(`${SITE}/vault?slack=error&reason=${encodeURIComponent(d.error || 'exchange')}`)
    await storeUserCredential(state, 'slack', { botToken: d.access_token, team: d.team?.name || '', teamId: d.team?.id || '' })
    return NextResponse.redirect(`${SITE}/vault?slack=connected`)
  } catch {
    return NextResponse.redirect(`${SITE}/vault?slack=error`)
  }
}
