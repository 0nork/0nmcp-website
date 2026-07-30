// Start Slack OAuth — the user installs the 0n app into THEIR workspace.
import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { SLACK_REDIRECT_URI } from '@/lib/slack-oauth'
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.0nmcp.com'
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Server error' }, { status: 500 })
  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return NextResponse.redirect(new URL('/login?redirect=/vault', SITE))
  if (!process.env.SLACK_CLIENT_ID) {
    // Without this, Slack receives client_id=undefined and shows a generic
    // failure that looks like a redirect problem — sending someone hunting in
    // entirely the wrong place.
    return NextResponse.json({ error: 'SLACK_CLIENT_ID is not configured.' }, { status: 503 })
  }
  const params = new URLSearchParams({
    client_id: process.env.SLACK_CLIENT_ID!,
    scope: 'chat:write,chat:write.public,channels:read',
    redirect_uri: SLACK_REDIRECT_URI,
    state: user.id,
  })
  return NextResponse.redirect(`https://slack.com/oauth/v2/authorize?${params.toString()}`)
}
