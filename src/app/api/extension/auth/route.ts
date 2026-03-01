import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { randomBytes, createHmac } from 'crypto'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const TOKEN_SECRET = process.env.EXTENSION_TOKEN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'extension-fallback-secret'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function generateToken(userId: string): string {
  const payload = `${userId}:${Date.now()}:${randomBytes(16).toString('hex')}`
  const signature = createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex')
  return Buffer.from(`${payload}:${signature}`).toString('base64url')
}

export function verifyToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString()
    const parts = decoded.split(':')
    if (parts.length < 4) return null
    const signature = parts.pop()!
    const payload = parts.join(':')
    const expected = createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex')
    if (signature !== expected) return null
    // Token is valid — extract user_id (first part)
    return parts[0]
  } catch {
    return null
  }
}

/**
 * GET /api/extension/auth — Generate extension auth token for logged-in user
 * Returns HTML page with token display + copy button
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Redirect to login
    return new Response(getLoginHTML(), {
      headers: { 'Content-Type': 'text/html' },
    })
  }

  // Generate token
  const token = generateToken(user.id)

  // Store token hash in DB for validation
  const admin = getAdmin()
  const tokenHash = createHmac('sha256', TOKEN_SECRET).update(token).digest('hex')

  await admin
    .from('extension_tokens')
    .upsert({
      user_id: user.id,
      token_hash: tokenHash,
      created_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

  return new Response(getSuccessHTML(token, user.email || ''), {
    headers: { 'Content-Type': 'text/html' },
  })
}

/**
 * POST /api/extension/auth — Validate a token (called by extension)
 */
export async function POST(request: NextRequest) {
  let body: { token?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { token } = body
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  const userId = verifyToken(token)
  if (!userId) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  // Check token exists in DB
  const admin = getAdmin()
  const tokenHash = createHmac('sha256', TOKEN_SECRET).update(token).digest('hex')
  const { data: tokenRecord } = await admin
    .from('extension_tokens')
    .select('user_id')
    .eq('user_id', userId)
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (!tokenRecord) {
    return NextResponse.json({ error: 'Token revoked' }, { status: 401 })
  }

  // Get user profile
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', userId)
    .maybeSingle()

  return NextResponse.json({
    valid: true,
    user_id: userId,
    name: profile?.full_name || null,
    avatar: profile?.avatar_url || null,
  })
}

function getLoginHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>0n for Chrome — Connect Account</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0a; color: #e0e0e0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #141414; border: 1px solid #222; border-radius: 16px; padding: 48px; max-width: 420px; text-align: center; }
    .logo { font-size: 32px; font-weight: 800; color: #7ed957; margin-bottom: 8px; }
    .subtitle { color: #888; font-size: 14px; margin-bottom: 32px; }
    .btn { display: inline-block; background: #7ed957; color: #0a0a0a; font-weight: 700; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-size: 15px; }
    .btn:hover { background: #6cc948; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">0nMCP</div>
    <p class="subtitle">Sign in to connect your Chrome extension</p>
    <a href="/login?redirect=/api/extension/auth" class="btn">Sign In</a>
  </div>
</body>
</html>`
}

function getSuccessHTML(token: string, email: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>0n for Chrome — Connected</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0a; color: #e0e0e0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .card { background: #141414; border: 1px solid #222; border-radius: 16px; padding: 48px; max-width: 480px; text-align: center; }
    .logo { font-size: 32px; font-weight: 800; color: #7ed957; margin-bottom: 8px; }
    .check { font-size: 48px; margin-bottom: 16px; }
    .title { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 8px; }
    .email { color: #888; font-size: 13px; margin-bottom: 24px; }
    .token-box { background: #0a0a0a; border: 1px solid #333; border-radius: 8px; padding: 12px 16px; font-family: 'JetBrains Mono', monospace; font-size: 11px; word-break: break-all; color: #7ed957; margin-bottom: 16px; max-height: 80px; overflow: auto; }
    .btn { display: inline-block; background: #7ed957; color: #0a0a0a; font-weight: 700; padding: 12px 32px; border-radius: 8px; border: none; cursor: pointer; font-size: 15px; width: 100%; }
    .btn:hover { background: #6cc948; }
    .btn.copied { background: #333; color: #7ed957; }
    .hint { color: #666; font-size: 12px; margin-top: 16px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">0nMCP</div>
    <div class="check">&check;</div>
    <div class="title">Extension Authorized</div>
    <div class="email">${email}</div>
    <div class="token-box" id="token">${token}</div>
    <button class="btn" id="copyBtn" onclick="copyToken()">Copy Token</button>
    <p class="hint">Paste this token in the Chrome extension settings under "Account" to connect.</p>
  </div>
  <script>
    function copyToken() {
      navigator.clipboard.writeText(document.getElementById('token').textContent)
      const btn = document.getElementById('copyBtn')
      btn.textContent = 'Copied!'
      btn.classList.add('copied')
      setTimeout(() => { btn.textContent = 'Copy Token'; btn.classList.remove('copied') }, 2000)
    }
  </script>
</body>
</html>`
}
