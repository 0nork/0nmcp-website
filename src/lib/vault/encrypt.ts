/**
 * 0n Vault — AES-256-GCM encryption with PBKDF2 key derivation
 * Each sub_location_id derives a unique key from the master key
 * Format: iv(hex):authTag(hex):ciphertext(hex)
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16
const ITERATIONS = parseInt(process.env.VAULT_PBKDF2_ITERATIONS || '100000')

function deriveKey(subLocationId: string): Buffer {
  const masterKey = process.env.VAULT_MASTER_KEY
  if (!masterKey) {
    // Fallback for dev — use a deterministic key from env
    return crypto.pbkdf2Sync(
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'dev-fallback-key',
      subLocationId,
      ITERATIONS,
      KEY_LENGTH,
      'sha256'
    )
  }
  return crypto.pbkdf2Sync(Buffer.from(masterKey, 'hex'), subLocationId, ITERATIONS, KEY_LENGTH, 'sha256')
}

export async function vaultEncrypt(plaintext: string, subLocationId: string): Promise<string> {
  const key = deriveKey(subLocationId)
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export async function vaultDecrypt(ciphertext: string, subLocationId: string): Promise<string> {
  const [ivHex, authTagHex, encryptedHex] = ciphertext.split(':')
  if (!ivHex || !authTagHex || !encryptedHex) throw new Error('Invalid Vault ciphertext format')

  const key = deriveKey(subLocationId)
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  const encrypted = Buffer.from(encryptedHex, 'hex')

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH })
  decipher.setAuthTag(authTag)

  return decipher.update(encrypted).toString('utf8') + decipher.final('utf8')
}
