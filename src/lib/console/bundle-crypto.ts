// ============================================================
// 0nMCP — Browser Bundle Crypto
// ============================================================
// Web Crypto API implementation of AES-256-GCM + PBKDF2-SHA512
// that produces output EXACTLY compatible with 0nMCP engine's
// cipher-portable.js — sealed bundles work in both directions:
//   Browser → CLI (0nmcp engine open)
//   CLI → Browser (upload + unseal)
//
// Format: base64(salt[32] || iv[16] || authTag[16] || ciphertext)
// ============================================================

const SALT_LENGTH = 32
const IV_LENGTH = 16
const TAG_LENGTH = 16 // AES-GCM auth tag (128 bits)
const PBKDF2_ITERATIONS = 100_000
const KEY_LENGTH = 32 // 256 bits

/** Derive AES-256 key from passphrase using PBKDF2-SHA512 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations: PBKDF2_ITERATIONS, hash: 'SHA-512' },
    keyMaterial,
    { name: 'AES-GCM', length: KEY_LENGTH * 8 },
    false,
    ['encrypt', 'decrypt'],
  )
}

/** Convert ArrayBuffer to base64 string */
function bufToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/** Convert base64 string to Uint8Array */
function base64ToBuf(b64: string): Uint8Array {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/**
 * Encrypt plaintext with passphrase (AES-256-GCM + PBKDF2-SHA512).
 * Output format matches 0nMCP cipher-portable.js exactly.
 */
export async function sealPortable(plaintext: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH))
  const key = await deriveKey(passphrase, salt)

  const enc = new TextEncoder()
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, tagLength: TAG_LENGTH * 8 },
    key,
    enc.encode(plaintext),
  )

  // Web Crypto appends the auth tag to the ciphertext
  // We need to split them to match cipher-portable.js format:
  // combined = salt[32] || iv[16] || authTag[16] || ciphertext[...]
  const encryptedBytes = new Uint8Array(encrypted)
  const ciphertext = encryptedBytes.slice(0, encryptedBytes.length - TAG_LENGTH)
  const authTag = encryptedBytes.slice(encryptedBytes.length - TAG_LENGTH)

  const combined = new Uint8Array(SALT_LENGTH + IV_LENGTH + TAG_LENGTH + ciphertext.length)
  combined.set(salt, 0)
  combined.set(iv, SALT_LENGTH)
  combined.set(authTag, SALT_LENGTH + IV_LENGTH)
  combined.set(ciphertext, SALT_LENGTH + IV_LENGTH + TAG_LENGTH)

  return bufToBase64(combined.buffer)
}

/**
 * Decrypt sealed data with passphrase.
 * Compatible with both browser-sealed and CLI-sealed data.
 */
export async function unsealPortable(sealedData: string, passphrase: string): Promise<string> {
  const combined = base64ToBuf(sealedData)

  if (combined.length < SALT_LENGTH + IV_LENGTH + TAG_LENGTH + 1) {
    throw new Error('Invalid sealed data: too short')
  }

  const salt = combined.slice(0, SALT_LENGTH)
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const authTag = combined.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH)
  const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH)

  const key = await deriveKey(passphrase, salt)

  // Web Crypto expects authTag appended to ciphertext
  const dataWithTag = new Uint8Array(ciphertext.length + TAG_LENGTH)
  dataWithTag.set(ciphertext, 0)
  dataWithTag.set(authTag, ciphertext.length)

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, tagLength: TAG_LENGTH * 8 },
      key,
      dataWithTag,
    )
    return new TextDecoder().decode(decrypted)
  } catch {
    throw new Error('Unseal failed — wrong passphrase.')
  }
}

/**
 * SHA-256 hash of a string (for checksums).
 */
export async function sha256(data: string): Promise<string> {
  const enc = new TextEncoder()
  const hash = await crypto.subtle.digest('SHA-256', enc.encode(data))
  const bytes = new Uint8Array(hash)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ─── Bundle Types ─────────────────────────────────────────────

export interface BundleConnection {
  service: string
  name: string
  environment: string
  auth_type: string
  credential_keys: string[]
  sealed: boolean
  credentials?: Record<string, string>
  vault?: { data: string; algorithm: string; kdf: string; portable: boolean }
}

export interface BundleManifest {
  bundle_version: string
  generator: string
  connection_count: number
  platform_count: number
  include_count: number
  services: string[]
  encryption: { method: string; algorithm?: string; kdf?: string }
  checksums: { connections: string; platforms: string; includes: string }
}

export interface Bundle {
  $0n: {
    type: 'bundle'
    version: string
    created: string
    updated: string
    name: string
    description: string
  }
  connections: BundleConnection[]
  platforms: Record<string, unknown>
  includes: { name: string; type: string; target?: string; data: string; checksum: string; size: number }[]
  manifest: BundleManifest
}

// ─── Bundle Operations ────────────────────────────────────────

/**
 * Create a sealed bundle from vault credentials.
 */
export async function createBundle(
  connections: { service: string; name: string; authType: string; credentials: Record<string, string> }[],
  passphrase: string,
  bundleName: string,
  bundleDescription: string,
): Promise<Bundle> {
  const now = new Date().toISOString()
  const bundleConnections: BundleConnection[] = []

  for (const conn of connections) {
    const credJson = JSON.stringify(conn.credentials)
    const sealed = await sealPortable(credJson, passphrase)

    bundleConnections.push({
      service: conn.service,
      name: conn.name,
      environment: 'production',
      auth_type: conn.authType,
      credential_keys: Object.keys(conn.credentials),
      sealed: true,
      vault: {
        data: sealed,
        algorithm: 'aes-256-gcm',
        kdf: 'pbkdf2-sha512-100k',
        portable: true,
      },
    })
  }

  const platforms = {}
  const includes: Bundle['includes'] = []

  const connStr = JSON.stringify(bundleConnections)
  const platStr = JSON.stringify(platforms)
  const inclStr = JSON.stringify(includes)

  const manifest: BundleManifest = {
    bundle_version: '1.0.0',
    generator: '0nmcp-web/1.0.0',
    connection_count: bundleConnections.length,
    platform_count: 0,
    include_count: 0,
    services: bundleConnections.map(c => c.service),
    encryption: { method: 'portable', algorithm: 'aes-256-gcm', kdf: 'pbkdf2-sha512-100k' },
    checksums: {
      connections: `sha256:${await sha256(connStr)}`,
      platforms: `sha256:${await sha256(platStr)}`,
      includes: `sha256:${await sha256(inclStr)}`,
    },
  }

  return {
    $0n: {
      type: 'bundle',
      version: '1.0.0',
      created: now,
      updated: now,
      name: bundleName,
      description: bundleDescription,
    },
    connections: bundleConnections,
    platforms,
    includes,
    manifest,
  }
}

/**
 * Inspect a bundle without passphrase — shows metadata only.
 */
export function inspectBundle(bundle: Bundle): {
  name: string
  description: string
  created: string
  services: { service: string; name: string; sealed: boolean; credential_keys: string[] }[]
  encryption: string
  connectionCount: number
} {
  return {
    name: bundle.$0n.name,
    description: bundle.$0n.description,
    created: bundle.$0n.created,
    services: bundle.connections.map(c => ({
      service: c.service,
      name: c.name,
      sealed: c.sealed,
      credential_keys: c.credential_keys,
    })),
    encryption: bundle.manifest.encryption.method,
    connectionCount: bundle.manifest.connection_count,
  }
}

/**
 * Open a sealed bundle — decrypt all connections.
 */
export async function openBundle(
  bundle: Bundle,
  passphrase: string,
): Promise<{ service: string; name: string; credentials: Record<string, string>; authType: string }[]> {
  const results: { service: string; name: string; credentials: Record<string, string>; authType: string }[] = []

  for (const conn of bundle.connections) {
    if (conn.sealed && conn.vault?.data) {
      const decrypted = await unsealPortable(conn.vault.data, passphrase)
      results.push({
        service: conn.service,
        name: conn.name,
        credentials: JSON.parse(decrypted),
        authType: conn.auth_type,
      })
    } else if (conn.credentials) {
      results.push({
        service: conn.service,
        name: conn.name,
        credentials: conn.credentials,
        authType: conn.auth_type,
      })
    }
  }

  return results
}
