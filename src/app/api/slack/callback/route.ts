/**
 * /api/slack/callback — Slack OAuth callback
 *
 * Exchanges the authorization code for an access token,
 * stores the installation in Supabase, and redirects to success page.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase/admin'
import { SLACK_CONFIG } from '@/lib/slack'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  // User denied or error occurred
  if (error || !code) {
    return NextResponse.redirect(
      `${SLACK_CONFIG.APP_URL}/slack?error=${error || 'no_code'}`
    )
  }

  // Exchange code for token
  let tokenData: Record<string, unknown>
  try {
    const tokenRes = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: SLACK_CONFIG.CLIENT_ID,
        client_secret: SLACK_CONFIG.CLIENT_SECRET,
        code,
        redirect_uri: SLACK_CONFIG.REDIRECT_URI,
      }),
    })
    tokenData = await tokenRes.json() as Record<string, unknown>
  } catch (err) {
    console.error('[slack/callback] Token exchange failed:', err)
    return NextResponse.redirect(`${SLACK_CONFIG.APP_URL}/slack?error=token_exchange_failed`)
  }

  if (!tokenData.ok) {
    console.error('[slack/callback] OAuth error:', tokenData.error)
    return NextResponse.redirect(
      `${SLACK_CONFIG.APP_URL}/slack?error=${tokenData.error || 'oauth_failed'}`
    )
  }

  // Extract installation data
  const team = tokenData.team as { id?: string; name?: string } | undefined
  const botToken = (tokenData.access_token as string) || ''
  const botUserId = (tokenData.bot_user_id as string) || ''
  const authedUser = tokenData.authed_user as { id?: string } | undefined
  const scope = (tokenData.scope as string) || ''

  if (!team?.id || !botToken) {
    return NextResponse.redirect(`${SLACK_CONFIG.APP_URL}/slack?error=missing_data`)
  }

  // Store in Supabase
  const supabase = createSupabaseAdmin()
  if (supabase) {
    const { error: dbError } = await supabase
      .from('slack_installations')
      .upsert(
        {
          team_id: team.id,
          team_name: team.name || '',
          bot_token: botToken,
          bot_user_id: botUserId,
          installer_user_id: authedUser?.id || '',
          app_id: 'A0AQHLXC3FD',
          scopes: scope.split(','),
          installed_at: new Date().toISOString(),
          is_active: true,
          metadata: {
            token_type: tokenData.token_type,
            enterprise: tokenData.enterprise,
          },
        },
        { onConflict: 'team_id' }
      )

    if (dbError) {
      console.error('[slack/callback] DB insert error:', dbError)
    }
  }

  // Redirect to success page
  return NextResponse.redirect(
    `${SLACK_CONFIG.APP_URL}/slack?installed=true&team=${encodeURIComponent(team.name || team.id)}`
  )
}
