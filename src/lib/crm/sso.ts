// lib/crm/sso.ts
// Decrypts the SSO payload the CRM platform sends when loading the iframe.
// Used in: app/api/crm/oauth/sso/route.ts
// CRM_APP_SSO_KEY is a 32-byte key from the CRM Developer Portal -> My Apps -> SSO.

import crypto from 'crypto'

export interface SSOPayload {
  locationId: string
  companyId:  string
  userId:     string
  email?:     string
  name?:      string
  role?:      string
  exp?:       number
}

export function decryptSSO(encryptedData: string, ivHex: string): SSOPayload {
  const key = process.env.CRM_APP_SSO_KEY
  if (!key) throw new Error('CRM_APP_SSO_KEY not configured')

  const decipher = crypto.createDecipheriv(
    'aes-256-ecb',
    Buffer.from(key, 'hex'),
    null                         // ECB mode — no IV
  )

  const decrypted =
    decipher.update(encryptedData, 'base64', 'utf8') +
    decipher.final('utf8')

  return JSON.parse(decrypted) as SSOPayload
}
