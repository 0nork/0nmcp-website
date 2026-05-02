/**
 * 0nFlow API auth.
 *
 * Mutating endpoints (POST /api/flows*, POST /api/flows/run-now,
 * POST /api/flows/<id>/enroll) require:
 *
 *   Authorization: Bearer <FLOW_API_TOKEN>
 *
 * `FLOW_API_TOKEN` is set on the 0nmcp-website Vercel project (type:plain).
 * In dev, if the env var is missing, requests are allowed (warning logged)
 * so `vercel dev` and local Next.js still work.
 *
 * Service-to-service callers (onork-app webhook handler, MCP tool clients)
 * should send the same token. The MCP tool layer reads it from
 * ONMCP_FLOW_API_TOKEN to keep the env var name namespaced on the client.
 */

export function isFlowAuthorized(req: Request): { ok: true } | { ok: false; reason: string } {
  const expected = process.env.FLOW_API_TOKEN || ''

  if (!expected) {
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, reason: 'FLOW_API_TOKEN not configured' }
    }
    // Dev: allow through but warn
    console.warn('[0nflow] FLOW_API_TOKEN not set — allowing request in non-prod')
    return { ok: true }
  }

  const auth = req.headers.get('authorization') || ''
  if (auth === `Bearer ${expected}`) return { ok: true }

  // Also accept the same token via x-flow-token for environments that
  // strip Authorization headers (some CDNs/proxies do this).
  const xtoken = req.headers.get('x-flow-token') || ''
  if (xtoken === expected) return { ok: true }

  return { ok: false, reason: 'Invalid or missing bearer token' }
}
