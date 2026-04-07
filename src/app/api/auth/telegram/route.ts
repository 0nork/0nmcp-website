/**
 * POST /api/auth/telegram — Telegram Login Widget Verification
 *
 * Verifies the hash from the Telegram Login Widget (https://core.telegram.org/widgets/login)
 * and either links to existing account or creates a new session via token.
 *
 * The widget provides: id, first_name, last_name, username, photo_url, auth_date, hash
 * We verify the hash using HMAC-SHA256 with the bot token as key.
 *
 * Auth flow:
 *   1. User clicks Telegram Login Widget on 0nmcp.com
 *   2. Telegram sends user data + hash to our callback
 *   3. We verify hash against bot token
 *   4. If user has existing 0nmcp.com account linked → issue 0n_ token
 *   5. If new user → create profile + issue token
 *   6. Return token with permission level based on request
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createHmac } from 'crypto'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface TelegramLoginData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
  // Optional: requested permission level
  permission_level?: 'simple' | 'full' | 'temporary'
  expires_in?: string // '1h', '24h', '7d', '30d', '90d', 'forever'
}

const EXPIRY_MAP: Record<string, number | null> = {
  '1h': 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
  '90d': 90 * 24 * 60 * 60 * 1000,
  'forever': null,
}

const PERMISSION_SCOPES: Record<string, string[]> = {
  simple: ['read'],
  full: ['read', 'write', 'execute', 'manage'],
  temporary: ['read', 'execute'],
  admin: ['read', 'write', 'execute', 'manage', 'billing'],
}

/**
 * Verify the Telegram Login Widget hash.
 * See: https://core.telegram.org/widgets/login#checking-authorization
 */
function verifyTelegramAuth(data: TelegramLoginData, botToken: string): boolean {
  const { hash, ...rest } = data
  // Remove non-telegram fields
  const checkData: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(rest)) {
    if (['id', 'first_name', 'last_name', 'username', 'photo_url', 'auth_date'].includes(key) && value !== undefined) {
      checkData[key] = value as string | number
    }
  }

  // Build check string: sorted key=value pairs joined by \n
  const checkString = Object.keys(checkData)
    .sort()
    .map(key => `${key}=${checkData[key]}`)
    .join('\n')

  // Secret key = SHA256(bot_token)
  const secretKey = createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest()

  // Verify: HMAC-SHA256(secret_key, check_string) === hash
  const hmac = createHmac('sha256', secretKey)
    .update(checkString)
    .digest('hex')

  return hmac === hash
}

export async function POST(request: NextRequest) {
  let data: TelegramLoginData
  try {
    data = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!data.id || !data.hash || !data.auth_date) {
    return NextResponse.json({ error: 'Missing required Telegram fields' }, { status: 400 })
  }

  // Check auth_date is not too old (allow 1 hour window)
  const now = Math.floor(Date.now() / 1000)
  if (now - data.auth_date > 3600) {
    return NextResponse.json({ error: 'Authorization expired. Please try again.' }, { status: 401 })
  }

  // Verify hash
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    return NextResponse.json({ error: 'Telegram not configured' }, { status: 500 })
  }

  if (!verifyTelegramAuth(data, botToken)) {
    return NextResponse.json({ error: 'Invalid Telegram authorization' }, { status: 401 })
  }

  const admin = getAdmin()

  // Check if this Telegram user is already linked to an 0nmcp.com account
  const { data: existingTgUser } = await admin
    .from('telegram_auth')
    .select('*')
    .eq('telegram_id', data.id)
    .single()

  let userId: string

  if (existingTgUser?.user_id) {
    // Existing linked user — update their Telegram data
    userId = existingTgUser.user_id
    await admin
      .from('telegram_auth')
      .update({
        telegram_username: data.username || null,
        telegram_first_name: data.first_name,
        telegram_last_name: data.last_name || null,
        telegram_photo_url: data.photo_url || null,
        auth_date: data.auth_date,
        hash: data.hash,
        verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq('telegram_id', data.id)
  } else {
    // Check if there's a profile with matching username/name to auto-link
    // Otherwise create a new profile
    let profile: { id: string } | null = null

    if (data.username) {
      const { data: matchByHandle } = await admin
        .from('profiles')
        .select('id')
        .eq('handle', data.username)
        .single()
      if (matchByHandle) profile = matchByHandle
    }

    if (!profile) {
      // Create a new profile for this Telegram user
      const { data: newProfile, error: profileError } = await admin
        .from('profiles')
        .insert({
          full_name: [data.first_name, data.last_name].filter(Boolean).join(' '),
          handle: data.username || `tg_${data.id}`,
          avatar_url: data.photo_url || null,
          source: 'telegram',
        })
        .select('id')
        .single()

      if (profileError || !newProfile) {
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }
      profile = newProfile
    }

    userId = profile.id

    // Create telegram_auth record
    await admin
      .from('telegram_auth')
      .upsert({
        user_id: userId,
        telegram_id: data.id,
        telegram_username: data.username || null,
        telegram_first_name: data.first_name,
        telegram_last_name: data.last_name || null,
        telegram_photo_url: data.photo_url || null,
        auth_date: data.auth_date,
        hash: data.hash,
        verified: true,
      }, { onConflict: 'telegram_id' })
  }

  // Generate an access token based on requested permission level
  const permLevel = data.permission_level || 'simple'
  const scopes = PERMISSION_SCOPES[permLevel] || PERMISSION_SCOPES.simple
  const expiresIn = data.expires_in || (permLevel === 'temporary' ? '24h' : 'forever')
  const expiryMs = EXPIRY_MAP[expiresIn] ?? null
  const expiresAt = expiryMs ? new Date(Date.now() + expiryMs).toISOString() : null

  // Generate token
  const { randomBytes } = await import('crypto')
  const hex = randomBytes(24).toString('hex')
  const token = `0n_${hex}`

  const { data: tokenRecord, error: tokenError } = await admin
    .from('access_tokens')
    .insert({
      user_id: userId,
      token,
      label: `Telegram Login (${data.username || data.first_name})`,
      permissions: scopes,
      expires_at: expiresAt,
      is_revoked: false,
      source: 'telegram',
    })
    .select('id')
    .single()

  if (tokenError) {
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    token,
    token_id: tokenRecord?.id,
    user_id: userId,
    permission_level: permLevel,
    scopes,
    expires_at: expiresAt,
    telegram: {
      id: data.id,
      username: data.username,
      first_name: data.first_name,
      photo_url: data.photo_url,
    },
  })
}
