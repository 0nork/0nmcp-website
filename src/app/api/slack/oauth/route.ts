import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/commands?error=no_code', req.url))
  }

  const response = await fetch('https://slack.com/api/oauth.v2.access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.SLACK_CLIENT_ID || '',
      client_secret: process.env.SLACK_CLIENT_SECRET || '',
      code,
      redirect_uri: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'}/api/slack/oauth`,
    }),
  })

  const data = await response.json()

  if (!data.ok) {
    return NextResponse.redirect(new URL(`/commands?error=${data.error}`, req.url))
  }

  // TODO: store data.access_token and data.team.id in database

  return NextResponse.redirect(new URL('/commands?slack=connected', req.url))
}
