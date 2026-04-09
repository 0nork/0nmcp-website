/**
 * Canva Tool Handlers — 5 registered tools
 * canva_generate, canva_export, canva_from_template, canva_search, canva_upload_asset
 * All calls logged to canva_tool_calls at $0.01 each
 */

import { createClient } from '@supabase/supabase-js'
import { vaultDecrypt, vaultEncrypt } from '@/lib/vault/encrypt'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CANVA_API = process.env.CANVA_API_BASE || 'https://api.canva.com/rest/v1'

// ── Token Management ──

async function getAccessToken(subLocationId: string): Promise<string> {
  const { data } = await supabase
    .from('canva_connections')
    .select('encrypted_access_token, encrypted_refresh_token, token_expires_at')
    .eq('sub_location_id', subLocationId)
    .eq('status', 'connected')
    .single()

  if (!data) throw new Error(`CANVA_NOT_CONNECTED: No Canva connection for ${subLocationId}`)

  // Check expiry with 60s buffer
  if (Date.now() < new Date(data.token_expires_at).getTime() - 60000) {
    return await vaultDecrypt(data.encrypted_access_token, subLocationId)
  }

  // Refresh token
  const refreshToken = await vaultDecrypt(data.encrypted_refresh_token, subLocationId)
  const res = await fetch(`${CANVA_API}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: process.env.CANVA_CLIENT_ID!,
      client_secret: process.env.CANVA_CLIENT_SECRET!,
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) {
    await supabase.from('canva_connections').update({ status: 'disconnected', updated_at: new Date().toISOString() }).eq('sub_location_id', subLocationId)
    throw new Error('CANVA_TOKEN_EXPIRED: Refresh failed — user must reconnect')
  }

  const tokens = await res.json()
  await supabase.from('canva_connections').update({
    encrypted_access_token: await vaultEncrypt(tokens.access_token, subLocationId),
    encrypted_refresh_token: await vaultEncrypt(tokens.refresh_token, subLocationId),
    token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('sub_location_id', subLocationId)

  return tokens.access_token
}

async function authHeaders(subLocationId: string): Promise<HeadersInit> {
  const token = await getAccessToken(subLocationId)
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
}

// ── Audit Logger ──

async function logCall(subLocationId: string, toolName: string, input: unknown, output: unknown, status: string, error: string | null, durationMs: number, context?: string) {
  const safeInput = JSON.parse(JSON.stringify(input ?? {}, (key, val) =>
    typeof val === 'string' && (key.includes('token') || key.includes('secret')) ? '[REDACTED]' : val
  ))
  await supabase.from('canva_tool_calls').insert({
    sub_location_id: subLocationId, tool_name: toolName, input_params: safeInput,
    output: output ?? null, status, error_message: error, duration_ms: durationMs,
    cost_usd: 0.01, context: context ?? 'unknown',
  })
}

// ── canva_generate ──

export async function handleCanvaGenerate(params: {
  prompt: string; design_type?: string; sub_location_id: string; brand_kit_id?: string; context?: string
}) {
  const start = Date.now()
  const headers = await authHeaders(params.sub_location_id)

  const body: Record<string, unknown> = { query: params.prompt }
  if (params.design_type) body.design_type = params.design_type
  if (params.brand_kit_id) body.brand_kit_id = params.brand_kit_id

  const res = await fetch(`${CANVA_API}/designs/generate`, { method: 'POST', headers, body: JSON.stringify(body) })
  if (!res.ok) {
    const err = await res.text()
    await logCall(params.sub_location_id, 'canva_generate', params, null, 'failed', err, Date.now() - start, params.context)
    throw new Error(`Canva generate ${res.status}: ${err}`)
  }

  const data = await res.json()
  const candidate = data.candidates?.[0]
  if (!candidate) throw new Error('No candidates returned')

  // Create editable design from candidate
  const createRes = await fetch(`${CANVA_API}/designs`, {
    method: 'POST', headers, body: JSON.stringify({ job_id: data.job_id, candidate_id: candidate.candidate_id }),
  })
  const created = await createRes.json()

  const output = {
    design_id: created.design?.id, thumbnail_url: candidate.thumbnail?.url,
    edit_url: created.design?.urls?.edit_url, job_id: data.job_id, candidate_id: candidate.candidate_id,
  }

  await supabase.from('canva_assets').insert({
    sub_location_id: params.sub_location_id, design_id: output.design_id, asset_type: 'design',
    thumbnail_url: output.thumbnail_url, edit_url: output.edit_url,
    design_type: params.design_type, prompt_used: params.prompt,
  })

  await logCall(params.sub_location_id, 'canva_generate', params, output, 'success', null, Date.now() - start, params.context)
  return output
}

// ── canva_export ──

export async function handleCanvaExport(params: {
  design_id: string; format?: string; transparent?: boolean; sub_location_id: string; context?: string
}) {
  const start = Date.now()
  const headers = await authHeaders(params.sub_location_id)
  const format = params.format || 'png'

  const exportBody: Record<string, unknown> = {
    design_id: params.design_id,
    format: { type: format, ...(format === 'png' ? { transparent_background: params.transparent ?? false } : {}) },
  }

  const res = await fetch(`${CANVA_API}/exports`, { method: 'POST', headers, body: JSON.stringify(exportBody) })
  if (!res.ok) {
    const err = await res.text()
    await logCall(params.sub_location_id, 'canva_export', params, null, 'failed', err, Date.now() - start, params.context)
    throw new Error(`Canva export ${res.status}: ${err}`)
  }

  const data = await res.json()
  const output = { download_url: data.urls?.download_url, expires_at: data.expires_at, format }

  if (output.download_url) {
    await supabase.from('canva_assets').update({
      export_url: output.download_url, asset_type: `exported_${format}`, expires_at: output.expires_at,
    }).eq('design_id', params.design_id).eq('sub_location_id', params.sub_location_id)
  }

  await logCall(params.sub_location_id, 'canva_export', params, output, 'success', null, Date.now() - start, params.context)
  return output
}

// ── canva_from_template ──

export async function handleCanvaFromTemplate(params: {
  template_id: string; data: Record<string, string>; sub_location_id: string; context?: string
}) {
  const start = Date.now()
  const headers = await authHeaders(params.sub_location_id)

  const res = await fetch(`${CANVA_API}/autofills`, {
    method: 'POST', headers,
    body: JSON.stringify({
      brand_template_id: params.template_id,
      data: Object.entries(params.data).map(([key, value]) => ({ name: key, text: { text: value } })),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    await logCall(params.sub_location_id, 'canva_from_template', params, null, 'failed', err, Date.now() - start, params.context)
    throw new Error(`Canva autofill ${res.status}: ${err}`)
  }

  const data = await res.json()
  const output = { design_id: data.design?.id, thumbnail_url: data.design?.thumbnail?.url, edit_url: data.design?.urls?.edit_url }

  await logCall(params.sub_location_id, 'canva_from_template', params, output, 'success', null, Date.now() - start, params.context)
  return output
}

// ── canva_search ──

export async function handleCanvaSearch(params: {
  query: string; limit?: number; sub_location_id: string; context?: string
}) {
  const start = Date.now()
  const headers = await authHeaders(params.sub_location_id)

  const qs = new URLSearchParams({ query: params.query, limit: String(Math.min(params.limit || 10, 50)) })
  const res = await fetch(`${CANVA_API}/designs?${qs}`, { headers })

  if (!res.ok) {
    const err = await res.text()
    await logCall(params.sub_location_id, 'canva_search', params, null, 'failed', err, Date.now() - start, params.context)
    throw new Error(`Canva search ${res.status}: ${err}`)
  }

  const data = await res.json()
  const designs = (data.items ?? []).map((d: Record<string, unknown>) => ({
    id: d.id, title: d.title, thumbnail_url: (d.thumbnail as Record<string, string>)?.url,
    edit_url: (d.urls as Record<string, string>)?.edit_url, updated_at: d.updated_at,
  }))

  const output = { designs, total: designs.length }
  await logCall(params.sub_location_id, 'canva_search', params, output, 'success', null, Date.now() - start, params.context)
  return output
}

// ── canva_upload_asset ──

export async function handleCanvaUploadAsset(params: {
  image_url: string; name: string; sub_location_id: string; context?: string
}) {
  const start = Date.now()
  const headers = await authHeaders(params.sub_location_id)

  const res = await fetch(`${CANVA_API}/assets/upload`, {
    method: 'POST', headers, body: JSON.stringify({ name: params.name, url: params.image_url }),
  })

  if (!res.ok) {
    const err = await res.text()
    await logCall(params.sub_location_id, 'canva_upload_asset', params, null, 'failed', err, Date.now() - start, params.context)
    throw new Error(`Canva upload ${res.status}: ${err}`)
  }

  const data = await res.json()
  const output = { asset_id: data.asset?.id, name: data.asset?.name, thumbnail_url: data.asset?.thumbnail?.url }

  await supabase.from('canva_assets').insert({
    sub_location_id: params.sub_location_id, asset_id: output.asset_id,
    asset_type: 'uploaded_image', thumbnail_url: output.thumbnail_url, title: params.name,
  })

  await logCall(params.sub_location_id, 'canva_upload_asset', params, output, 'success', null, Date.now() - start, params.context)
  return output
}
