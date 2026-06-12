// lib/crm/resolve-mcp-auth.ts
// Bridges 0n_ access tokens to real CRM API credentials for the remote MCP server.
//
// The remote MCP at /api/mcp accepts two kinds of bearer tokens:
//   1. A direct CRM token (PIT) — forwarded straight to the CRM API.
//   2. An 0n_ access token — identifies a 0nCore user, NOT a valid CRM API token.
//      It must be resolved: 0n_ → user → crm_location_id → decrypted OAuth token.
//
// Rule 16 (dispatch): never operate on another user's CRM location. For 0n_ tokens
// we ignore any caller-supplied locationId and use the user's own provisioned one;
// if they have none, we 403 rather than defaulting to a shared location.

import { validateToken } from '@/lib/token-auth'
import { getToken } from './token-store'

export interface ResolvedCrmAuth {
  token: string       // a token the CRM API will accept as `Authorization: Bearer`
  locationId: string
}

export type ResolveResult =
  | { ok: true; auth: ResolvedCrmAuth }
  | { ok: false; status: number; error: string }

/**
 * Resolve an incoming MCP bearer token + header locationId into a usable CRM
 * credential pair.
 *
 * - Non-0n token (PIT / direct CRM token): pass through unchanged, paired with the
 *   header locationId (or env fallback). Preserves Agent Studio / Cursor behaviour.
 * - 0n_ token: look up the user, then their CRM OAuth token from crm_tokens.
 */
export async function resolveCrmAuth(
  rawToken: string,
  headerLocationId: string
): Promise<ResolveResult> {
  // ── Direct CRM token (PIT) — forward as-is ──
  if (!rawToken.startsWith('0n_')) {
    const locationId = headerLocationId || process.env.CRM_LOCATION_ID || ''
    if (!locationId) {
      return { ok: false, status: 400, error: 'locationId required (header or CRM_LOCATION_ID)' }
    }
    return { ok: true, auth: { token: rawToken, locationId } }
  }

  // ── 0n_ token — resolve to the user's CRM OAuth credential ──
  const identity = await validateToken(rawToken)
  if (!identity) {
    return { ok: false, status: 401, error: 'Invalid, expired, or revoked 0n token' }
  }
  if (!identity.crmLocationId) {
    return {
      ok: false,
      status: 403,
      error: 'No CRM location provisioned for this account. Connect CRM in 0nCore first.',
    }
  }

  // Rule 16: the user's own location wins — never trust a caller-supplied locationId here.
  const locationId = identity.crmLocationId

  const record = await getToken(locationId)
  if (!record?.access_token) {
    return {
      ok: false,
      status: 403,
      error: `CRM is not connected for location ${locationId}. Reconnect CRM in 0nCore.`,
    }
  }

  return { ok: true, auth: { token: record.access_token, locationId } }
}
