// Slack OAuth callback — exchange the code for the workspace's bot token and
// store it (encrypted) in the user's 0nVault. Their Slack, their token.
import { NextRequest, NextResponse } from 'next/server'
import { storeUserCredential } from '@/lib/vault-bridge'
import { SLACK_REDIRECT_URI } from '@/lib/slack-oauth'
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
      redirect_uri: SLACK_REDIRECT_URI,
    })
    const d = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body,
    }).then((r) => r.json())

    if (!d.ok) {
      return NextResponse.redirect(`${SITE}/vault?slack=error&reason=${encodeURIComponent(d.error || 'exchange')}`)
    }

    /**
     * TWO BUGS FIXED HERE, both of which silently produced "Slack says it is
     * connected but nothing is in the vault".
     *
     * 1. USER TOKENS WERE DROPPED. Slack returns a BOT token at the top level as
     *    `access_token`, but a USER token nested at `authed_user.access_token`.
     *    The old code only read the top level, so an app configured with user
     *    scopes exchanged successfully and then failed the `!d.access_token`
     *    check — redirecting to an error even though the install had worked.
     *
     * 2. TOKEN ROTATION WAS IGNORED. A token beginning `xoxe.` means rotation is
     *    enabled on the Slack app: it expires (typically 12h) and must be renewed
     *    with the accompanying refresh_token. The old code stored the access
     *    token and discarded both `refresh_token` and `expires_in` — so even a
     *    successful connection would have died the next day with no way back.
     */
    const botToken: string | undefined = d.access_token
    const userToken: string | undefined = d.authed_user?.access_token
    const token = botToken || userToken

    if (!token) {
      return NextResponse.redirect(
        `${SITE}/vault?slack=error&reason=${encodeURIComponent('no_token_in_response')}`,
      )
    }

    // Rotation applies per-token; whichever one we are keeping carries its own
    // refresh_token and expires_in.
    const refreshToken: string | undefined = botToken
      ? d.refresh_token
      : d.authed_user?.refresh_token
    const expiresIn: number | undefined = botToken
      ? d.expires_in
      : d.authed_user?.expires_in

    await storeUserCredential(state, 'slack', {
      botToken: token,
      tokenType: botToken ? 'bot' : 'user',
      team: d.team?.name || '',
      teamId: d.team?.id || '',
      ...(refreshToken ? { refreshToken } : {}),
      ...(expiresIn ? { expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString() } : {}),
      // Record<string, string> — store as a string, not a boolean.
      rotating: token.startsWith('xoxe.') ? 'true' : 'false',
    })
    return NextResponse.redirect(`${SITE}/vault?slack=connected`)
  } catch {
    return NextResponse.redirect(`${SITE}/vault?slack=error`)
  }
}
