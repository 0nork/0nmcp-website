/**
 * .0n File Security Module
 *
 * Enforces three security invariants:
 * 1. NO plaintext secrets ever appear in a .0n file
 * 2. Every exported .0n file is HMAC-signed for integrity
 * 3. Only files signed by an authorized 0nMCP system can be imported
 */

// Patterns that indicate a hardcoded secret (not a template variable)
const SECRET_PATTERNS = [
  /^sk[-_]/i,                   // Stripe, Anthropic, OpenAI keys
  /^pk[-_]/i,                   // Stripe publishable
  /^xox[bpat]-/i,               // Slack tokens
  /^ghp_/i,                     // GitHub PAT
  /^gho_/i,                     // GitHub OAuth
  /^ghu_/i,                     // GitHub user-to-server
  /^ghs_/i,                     // GitHub server-to-server
  /^glpat-/i,                   // GitLab PAT
  /^Bearer\s+[A-Za-z0-9]/i,    // Bearer tokens
  /^eyJ[A-Za-z0-9_-]{10,}/,    // JWT tokens
  /^AKIA[A-Z0-9]{16}/,         // AWS access keys
  /^[A-Za-z0-9+/]{40,}={0,2}$/, // Base64-encoded long secrets
  /^pit-[a-f0-9-]+$/i,         // CRM PIT tokens
  /^[a-f0-9]{32,}$/i,          // Hex-encoded secrets (32+ chars)
  /^whsec_/i,                  // Webhook secrets
  /^rk_live_/i,                // Stripe restricted keys
  /^AC[a-f0-9]{32}$/i,         // Twilio Account SID
  /^SG\.[A-Za-z0-9_-]+/,      // SendGrid keys
  /password/i,                 // Literal passwords
]

// Template variable pattern — these are safe, they're references not values
const TEMPLATE_VAR = /^\{\{.*\}\}$/

/**
 * Check if a string value looks like a hardcoded secret
 */
function looksLikeSecret(value: string): boolean {
  const trimmed = value.trim()

  // Template variables are always safe
  if (TEMPLATE_VAR.test(trimmed)) return false

  // Empty or very short strings are safe
  if (trimmed.length < 8) return false

  // Check against known secret patterns
  return SECRET_PATTERNS.some((pattern) => pattern.test(trimmed))
}

/**
 * Deep-scan an object for any hardcoded secrets
 * Returns array of paths where secrets were found
 */
function findSecrets(obj: unknown, path = ''): string[] {
  const found: string[] = []

  if (typeof obj === 'string') {
    if (looksLikeSecret(obj)) found.push(path)
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      found.push(...findSecrets(item, `${path}[${i}]`))
    })
  } else if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      found.push(...findSecrets(value, path ? `${path}.${key}` : key))
    }
  }

  return found
}

/**
 * Sanitize a .0n workflow for export — strip all hardcoded secrets
 * Replaces detected secrets with template variable placeholders
 */
export function sanitizeForExport(workflow: Record<string, unknown>): {
  sanitized: Record<string, unknown>
  strippedPaths: string[]
} {
  const copy = JSON.parse(JSON.stringify(workflow))
  const strippedPaths: string[] = []

  function sanitize(obj: Record<string, unknown>, path: string) {
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key
      if (typeof value === 'string' && looksLikeSecret(value)) {
        // Replace with a safe template reference
        obj[key] = `{{env.${key.toUpperCase()}}}`
        strippedPaths.push(fullPath)
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        sanitize(value as Record<string, unknown>, fullPath)
      } else if (Array.isArray(value)) {
        value.forEach((item, i) => {
          if (typeof item === 'string' && looksLikeSecret(item)) {
            value[i] = `{{env.REDACTED_${i}}}`
            strippedPaths.push(`${fullPath}[${i}]`)
          } else if (item && typeof item === 'object') {
            sanitize(item as Record<string, unknown>, `${fullPath}[${i}]`)
          }
        })
      }
    }
  }

  sanitize(copy, '')
  return { sanitized: copy, strippedPaths }
}

/**
 * Generate HMAC-SHA256 signature for a .0n file
 * Uses Web Crypto API for browser-side signing
 */
export async function signWorkflow(workflow: Record<string, unknown>): Promise<string> {
  // Create a canonical JSON representation (sorted keys, no _0n_meta)
  const { _0n_meta, ...rest } = workflow
  void _0n_meta // suppress unused
  const canonical = JSON.stringify(rest, Object.keys(rest).sort())

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode('0nMCP-v0.2-integrity'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(canonical))
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Verify a .0n file's HMAC signature
 */
export async function verifySignature(
  workflow: Record<string, unknown>,
  signature: string
): Promise<boolean> {
  const expected = await signWorkflow(workflow)
  // Constant-time comparison
  if (expected.length !== signature.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return diff === 0
}

/**
 * Prepare a .0n file for secure export
 * 1. Sanitize all secrets
 * 2. Add _0n_meta with signature + origin
 */
export async function secureExport(
  workflow: Record<string, unknown>,
  origin?: string
): Promise<{ file: Record<string, unknown>; warnings: string[] }> {
  const warnings: string[] = []

  // Step 1: Sanitize
  const { sanitized, strippedPaths } = sanitizeForExport(workflow)
  if (strippedPaths.length > 0) {
    warnings.push(
      `Removed ${strippedPaths.length} hardcoded secret(s): ${strippedPaths.join(', ')}. ` +
      'Use {{env.VAR}} template references instead.'
    )
  }

  // Step 2: Sign
  const signature = await signWorkflow(sanitized)

  // Step 3: Add meta
  sanitized._0n_meta = {
    signed_by: '0nMCP',
    signed_at: new Date().toISOString(),
    origin: origin || (typeof window !== 'undefined' ? window.location.origin : 'https://0nmcp.com'),
    signature,
    version: '0.2',
    integrity: 'hmac-sha256',
  }

  return { file: sanitized, warnings }
}

/**
 * Validate a .0n file for secure import
 * 1. Check for _0n_meta and valid signature
 * 2. Scan for any remaining hardcoded secrets
 * 3. Reject unauthorized files
 */
export async function secureImport(
  workflow: Record<string, unknown>
): Promise<{
  valid: boolean
  errors: string[]
  warnings: string[]
  cleaned: Record<string, unknown>
}> {
  const errors: string[] = []
  const warnings: string[] = []

  // Check 1: Must have _0n_meta with signature
  const meta = workflow._0n_meta as Record<string, unknown> | undefined
  if (!meta || !meta.signature) {
    errors.push(
      'This .0n file is not signed. Only files created by an authorized 0nMCP system can be imported. ' +
      'Use the 0nMCP Builder at 0nmcp.com/builder to create valid workflow files.'
    )
    return { valid: false, errors, warnings, cleaned: workflow }
  }

  // Check 2: Verify signature integrity
  const signature = meta.signature as string
  const isValid = await verifySignature(workflow, signature)
  if (!isValid) {
    errors.push(
      'Signature verification failed. This file has been modified outside of 0nMCP or is corrupted. ' +
      'Re-export from the 0nMCP Builder to generate a valid signature.'
    )
    return { valid: false, errors, warnings, cleaned: workflow }
  }

  // Check 3: Deep scan for secrets that shouldn't be there
  const { _0n_meta: _, ...rest } = workflow
  const secretPaths = findSecrets(rest)
  if (secretPaths.length > 0) {
    errors.push(
      `Security violation: ${secretPaths.length} hardcoded secret(s) detected at: ${secretPaths.join(', ')}. ` +
      '.0n files must use {{env.VAR}} template references for sensitive values.'
    )
    return { valid: false, errors, warnings, cleaned: workflow }
  }

  // Check 4: Validate structure
  if (!rest.steps || !Array.isArray(rest.steps)) {
    errors.push('Invalid .0n file: missing "steps" array.')
    return { valid: false, errors, warnings, cleaned: workflow }
  }

  // Check 5: Verify origin is a known 0nMCP source
  const origin = meta.origin as string | undefined
  const signedBy = meta.signed_by as string | undefined
  if (signedBy !== '0nMCP') {
    warnings.push(`File was signed by "${signedBy}" — not the official 0nMCP system.`)
  }

  if (origin && !origin.includes('0nmcp.com') && !origin.includes('localhost')) {
    warnings.push(`File originated from ${origin}. Verify this is a trusted source.`)
  }

  return { valid: true, errors, warnings, cleaned: rest }
}
