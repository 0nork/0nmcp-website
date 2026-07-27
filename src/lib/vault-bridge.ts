/**
 * Vault Bridge — decrypts user credentials server-side for execution.
 *
 * The execution engine needs API keys to call services. Keys are stored
 * encrypted in user_vaults. This bridge:
 * 1. Fetches the user's encrypted vault entries
 * 2. Decrypts them server-side using Node.js crypto
 * 3. Returns a credentials map: { stripe: { api_key: "sk-..." }, slack: { bot_token: "xoxb-..." } }
 * 4. Credentials are held in memory only for the duration of the request
 *
 * SECURITY: This module must NEVER log, expose, or persist decrypted keys.
 */

import { createClient } from '@supabase/supabase-js'
import { pbkdf2Sync, createDecipheriv, createCipheriv, randomBytes } from 'crypto'

const ITERATIONS = 100_000

/**
 * Server-side decryption matching the client-side WebCrypto format.
 *
 * WebCrypto AES-256-GCM encrypt() returns: ciphertext || authTag (16 bytes).
 * Node.js crypto requires them separated via setAuthTag().
 * Key derivation: PBKDF2-SHA-256, 256-bit, same as vault-crypto.ts client.
 */
function serverDecrypt(userId: string, encryptedB64: string, ivB64: string, saltB64: string): string {
  const salt = Buffer.from(saltB64, 'base64')
  const iv = Buffer.from(ivB64, 'base64')
  const encrypted = Buffer.from(encryptedB64, 'base64')

  // Derive key identically to client: PBKDF2-SHA256, 256-bit
  const key = pbkdf2Sync(userId, salt, ITERATIONS, 32, 'sha256')

  // AES-256-GCM — WebCrypto appends 16-byte auth tag to ciphertext
  const authTag = encrypted.subarray(encrypted.length - 16)
  const ciphertext = encrypted.subarray(0, encrypted.length - 16)

  const decipher = createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(ciphertext, undefined, 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

export interface UserCredentials {
  [service: string]: Record<string, string>
}

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Get decrypted credentials for a user.
 * Only call this server-side (API routes).
 */
export async function getUserCredentials(userId: string): Promise<UserCredentials> {
  const admin = getAdmin()

  const { data: rows, error } = await admin
    .from('user_vaults')
    .select('service_name, encrypted_key, iv, salt')
    .eq('user_id', userId)

  if (error || !rows || rows.length === 0) return {}

  const creds: UserCredentials = {}

  for (const row of rows) {
    const serviceName = row.service_name
    const encryptedData = row.encrypted_key
    if (!serviceName || !encryptedData || !row.iv || !row.salt) continue

    try {
      const plaintext = serverDecrypt(userId, encryptedData, row.iv, row.salt)
      try {
        const parsed = JSON.parse(plaintext)
        creds[serviceName] = typeof parsed === 'object' && parsed !== null ? parsed : { api_key: plaintext }
      } catch {
        creds[serviceName] = { api_key: plaintext }
      }
    } catch {
      // Decryption failed — skip this entry silently
      // Do NOT log the error details as they may leak key metadata
    }
  }

  return creds
}

/**
 * Get a specific credential for a service.
 */
export async function getServiceCredential(
  userId: string,
  service: string,
  key: string = 'api_key'
): Promise<string | null> {
  const creds = await getUserCredentials(userId)
  return creds[service]?.[key] || null
}

/**
 * Check which services a user has vault entries for (without decrypting).
 * Used by the integrations status endpoint.
 */
/**
 * Server-side encrypt in the same format the client/serverDecrypt expect:
 * PBKDF2-SHA256(userId, salt) → AES-256-GCM → ciphertext || authTag (base64).
 */
function serverEncrypt(userId: string, plaintext: string): { encrypted_key: string; iv: string; salt: string } {
  const salt = randomBytes(16)
  const iv = randomBytes(12)
  const key = pbkdf2Sync(userId, salt, ITERATIONS, 32, 'sha256')
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return {
    encrypted_key: Buffer.concat([ciphertext, authTag]).toString('base64'),
    iv: iv.toString('base64'),
    salt: salt.toString('base64'),
  }
}

/** Store (or replace) one service's credentials in the user's vault, encrypted. */
export async function storeUserCredential(userId: string, service: string, creds: Record<string, string>): Promise<void> {
  const admin = getAdmin()
  const enc = serverEncrypt(userId, JSON.stringify(creds))
  await admin.from('user_vaults').upsert(
    { user_id: userId, service_name: service, ...enc, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,service_name' }
  )
}

export async function getUserVaultServices(userId: string): Promise<string[]> {
  const admin = getAdmin()

  const { data: rows, error } = await admin
    .from('user_vaults')
    .select('service_name')
    .eq('user_id', userId)

  if (error || !rows) return []
  return rows.map(r => r.service_name).filter(Boolean)
}
