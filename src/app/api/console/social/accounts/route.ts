import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/console/social/accounts
 * Returns the authenticated user's connected social accounts.
 * Checks linkedin_members table for LinkedIn and social_connections for everything else.
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ platforms: [] }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ platforms: [] }, { status: 401 })
  }

  const admin = getAdmin()

  // Check LinkedIn connection from linkedin_members table
  const { data: linkedinMember } = await admin
    .from('linkedin_members')
    .select('id, linkedin_name, linkedin_avatar_url, linkedin_headline, token_expires_at, linkedin_access_token')
    .eq('user_id', user.id)
    .maybeSingle()

  const linkedinConnected = !!(linkedinMember?.linkedin_access_token)
  const linkedinExpired = linkedinMember?.token_expires_at
    ? new Date(linkedinMember.token_expires_at) < new Date()
    : false

  // Check other platforms from social_connections table
  const { data: connections } = await admin
    .from('social_connections')
    .select('platform, platform_username, platform_avatar_url, is_connected, token_expires_at')
    .eq('user_id', user.id)
    .eq('is_connected', true)

  const connectionMap = new Map(
    (connections || []).map((c) => [c.platform, c])
  )

  // Build full platform list with real connection status
  const platforms = [
    {
      id: 'linkedin',
      name: 'LinkedIn',
      color: '#0077b5',
      method: 'oauth' as const,
      connected: linkedinConnected && !linkedinExpired,
      expired: linkedinExpired,
      username: linkedinMember?.linkedin_name || null,
      avatar: linkedinMember?.linkedin_avatar_url || null,
      connectUrl: '/api/linkedin/auth',
    },
    {
      id: 'reddit',
      name: 'Reddit',
      color: '#ff4500',
      method: 'oauth' as const,
      connected: connectionMap.has('reddit'),
      username: connectionMap.get('reddit')?.platform_username || null,
      avatar: connectionMap.get('reddit')?.platform_avatar_url || null,
      connectUrl: '/api/social/reddit/auth',
    },
    {
      id: 'dev_to',
      name: 'Dev.to',
      color: '#0a0a0a',
      method: 'api_key' as const,
      connected: connectionMap.has('dev_to'),
      username: connectionMap.get('dev_to')?.platform_username || null,
      connectUrl: null, // API key entered in UI
    },
    {
      id: 'x_twitter',
      name: 'X / Twitter',
      color: '#000000',
      method: 'oauth' as const,
      connected: connectionMap.has('x_twitter'),
      username: connectionMap.get('x_twitter')?.platform_username || null,
      avatar: connectionMap.get('x_twitter')?.platform_avatar_url || null,
      connectUrl: '/api/social/twitter/auth',
      comingSoon: true,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      color: '#1877f2',
      method: 'oauth' as const,
      connected: connectionMap.has('facebook'),
      username: connectionMap.get('facebook')?.platform_username || null,
      avatar: connectionMap.get('facebook')?.platform_avatar_url || null,
      connectUrl: '/api/social/facebook/auth',
      comingSoon: true,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      color: '#e4405f',
      method: 'oauth' as const,
      connected: connectionMap.has('instagram'),
      username: connectionMap.get('instagram')?.platform_username || null,
      avatar: connectionMap.get('instagram')?.platform_avatar_url || null,
      connectUrl: null,
      comingSoon: true,
    },
  ]

  return NextResponse.json({ platforms })
}

/**
 * POST /api/console/social/accounts
 * Connect a platform via API key (Dev.to).
 * OAuth platforms use their own /api/social/{platform}/auth routes.
 */
export async function POST(request: Request) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { platform?: string; api_key?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.platform || !body.api_key) {
    return NextResponse.json({ error: 'platform and api_key required' }, { status: 400 })
  }

  // Only Dev.to supports API key connection
  if (body.platform !== 'dev_to') {
    return NextResponse.json({ error: 'This platform requires OAuth connection' }, { status: 400 })
  }

  const admin = getAdmin()

  // Verify Dev.to API key by fetching user profile
  let devtoUsername = ''
  try {
    const res = await fetch('https://dev.to/api/users/me', {
      headers: { 'api-key': body.api_key },
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Invalid Dev.to API key' }, { status: 400 })
    }
    const profile = await res.json()
    devtoUsername = profile.username || profile.name || 'dev.to user'
  } catch {
    return NextResponse.json({ error: 'Failed to verify Dev.to API key' }, { status: 400 })
  }

  // Upsert social connection
  const { error } = await admin
    .from('social_connections')
    .upsert({
      user_id: user.id,
      platform: 'dev_to',
      access_token: body.api_key,
      platform_username: devtoUsername,
      is_connected: true,
    }, { onConflict: 'user_id,platform' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ connected: true, username: devtoUsername })
}

/**
 * DELETE /api/console/social/accounts
 * Disconnect a social platform.
 */
export async function DELETE(request: Request) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { platform?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.platform) {
    return NextResponse.json({ error: 'platform required' }, { status: 400 })
  }

  const admin = getAdmin()

  if (body.platform === 'linkedin') {
    // Clear LinkedIn tokens
    await admin
      .from('linkedin_members')
      .update({ linkedin_access_token: null, linkedin_refresh_token: null })
      .eq('user_id', user.id)
  } else {
    await admin
      .from('social_connections')
      .update({ is_connected: false, access_token: null, refresh_token: null })
      .eq('user_id', user.id)
      .eq('platform', body.platform)
  }

  return NextResponse.json({ disconnected: true })
}
