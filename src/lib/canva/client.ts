/**
 * Canva Connect API Client
 * OAuth PKCE flow + token management + design operations
 * Based on canva-connect-api-starter-kit patterns
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CANVA_API_BASE = 'https://api.canva.com/rest/v1'
const CANVA_AUTH_BASE = 'https://www.canva.com/api/oauth'

// ── OAuth Helpers ──

export function getCanvaAuthUrl(redirectUri: string, state: string, codeChallenge: string): string {
  const scopes = [
    'asset:read', 'asset:write',
    'brandtemplate:content:read', 'brandtemplate:meta:read',
    'design:content:read', 'design:content:write', 'design:meta:read',
    'folder:read', 'folder:write',
    'profile:read',
  ]

  const url = new URL(`${CANVA_AUTH_BASE}/authorize`)
  url.searchParams.set('code_challenge', codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('scope', scopes.join(' '))
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', process.env.CANVA_CLIENT_ID!)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('state', state)

  return url.toString()
}

export async function exchangeCanvaToken(code: string, codeVerifier: string, redirectUri: string) {
  const credentials = `${process.env.CANVA_CLIENT_ID}:${process.env.CANVA_CLIENT_SECRET}`

  const res = await fetch(`${CANVA_API_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(credentials).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Canva token exchange failed: ${res.status} ${err}`)
  }

  return res.json() as Promise<{
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
    scope: string
  }>
}

export async function refreshCanvaToken(refreshToken: string) {
  const credentials = `${process.env.CANVA_CLIENT_ID}:${process.env.CANVA_CLIENT_SECRET}`

  const res = await fetch(`${CANVA_API_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(credentials).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) throw new Error('Canva token refresh failed')
  return res.json()
}

// ── Token Store ──

export async function storeCanvaToken(userId: string, tokens: {
  access_token: string; refresh_token: string; expires_in: number; scope: string
}) {
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  await supabase.from('canva_tokens').upsert({
    user_id: userId,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: expiresAt,
    scope: tokens.scope,
  }, { onConflict: 'user_id' })
}

export async function getCanvaAccessToken(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('canva_tokens')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .single()

  if (!data) return null

  // Check if expired (with 10 min buffer)
  const expiresAt = new Date(data.expires_at).getTime()
  const buffer = 10 * 60 * 1000
  if (Date.now() > expiresAt - buffer) {
    // Refresh
    try {
      const refreshed = await refreshCanvaToken(data.refresh_token)
      await storeCanvaToken(userId, refreshed)
      return refreshed.access_token
    } catch {
      return null
    }
  }

  return data.access_token
}

// ── API Client ──

export async function canvaAPI(userId: string, path: string, options: RequestInit = {}) {
  const token = await getCanvaAccessToken(userId)
  if (!token) throw new Error('Canva not connected — no valid token')

  const res = await fetch(`${CANVA_API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Canva API ${res.status}: ${err}`)
  }

  return res.json()
}

// ── Design Operations ──

export async function createDesign(userId: string, params: {
  design_type?: string
  title?: string
  asset_id?: string
}) {
  return canvaAPI(userId, '/designs', {
    method: 'POST',
    body: JSON.stringify({
      design_type: params.design_type || 'Poster',
      title: params.title || 'Untitled Design',
      asset_id: params.asset_id,
    }),
  })
}

export async function getDesign(userId: string, designId: string) {
  return canvaAPI(userId, `/designs/${designId}`)
}

export async function exportDesign(userId: string, designId: string, format: string = 'png') {
  return canvaAPI(userId, '/exports', {
    method: 'POST',
    body: JSON.stringify({
      design_id: designId,
      format: { type: format },
    }),
  })
}

export async function getExportJob(userId: string, jobId: string) {
  return canvaAPI(userId, `/exports/${jobId}`)
}

export async function uploadAsset(userId: string, name: string, url: string) {
  return canvaAPI(userId, '/asset-uploads', {
    method: 'POST',
    body: JSON.stringify({ name, url }),
  })
}

export async function getAssetUpload(userId: string, jobId: string) {
  return canvaAPI(userId, `/asset-uploads/${jobId}`)
}

export async function createFolder(userId: string, name: string, parentFolderId?: string) {
  return canvaAPI(userId, '/folders', {
    method: 'POST',
    body: JSON.stringify({
      name,
      parent_folder_id: parentFolderId || 'root',
    }),
  })
}

export async function listBrandTemplates(userId: string) {
  return canvaAPI(userId, '/brand-templates')
}

export async function autofillDesign(userId: string, brandTemplateId: string, data: Record<string, unknown>) {
  return canvaAPI(userId, '/autofills', {
    method: 'POST',
    body: JSON.stringify({
      brand_template_id: brandTemplateId,
      data,
    }),
  })
}

export async function getAutofillJob(userId: string, jobId: string) {
  return canvaAPI(userId, `/autofills/${jobId}`)
}

export async function getUserProfile(userId: string) {
  return canvaAPI(userId, '/users/me')
}
