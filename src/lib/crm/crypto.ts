// lib/crm/crypto.ts
// AES-256-GCM encryption for CRM OAuth tokens stored in Supabase.
// Key source: CRM_TOKEN_ENCRYPTION_KEY env var (64-char hex / 32 bytes).
// Generate: openssl rand -hex 32

const ALG      = 'AES-GCM'
const IV_BYTES = 12 // 96-bit IV — GCM standard

function importKey(): Promise<CryptoKey> {
  const hex = process.env.CRM_TOKEN_ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error('CRM_TOKEN_ENCRYPTION_KEY must be a 64-char hex string (32 bytes)')
  }
  return crypto.subtle.importKey(
    'raw',
    Buffer.from(hex, 'hex'),
    { name: ALG },
    false,
    ['encrypt', 'decrypt']
  )
}

/** Encrypt plaintext → base64(iv + ciphertext) */
export async function encryptToken(plaintext: string): Promise<string> {
  const key     = await importKey()
  const iv      = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const ct      = await crypto.subtle.encrypt({ name: ALG, iv }, key, new TextEncoder().encode(plaintext))
  const combined = new Uint8Array(iv.byteLength + ct.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(ct), iv.byteLength)
  return Buffer.from(combined).toString('base64')
}

/** Decrypt base64(iv + ciphertext) → plaintext */
export async function decryptToken(encoded: string): Promise<string> {
  const key      = await importKey()
  const combined = Buffer.from(encoded, 'base64')
  const iv       = combined.slice(0, IV_BYTES)
  const ct       = combined.slice(IV_BYTES)
  const plain    = await crypto.subtle.decrypt({ name: ALG, iv }, key, ct)
  return new TextDecoder().decode(plain)
}
