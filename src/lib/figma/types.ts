/** Figma OAuth token response */
export interface FigmaTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

/** Stored tokens (before encryption) */
export interface FigmaTokens {
  access_token: string
  refresh_token: string
  expires_at: number // Unix ms
}

/** Figma /v1/me response */
export interface FigmaUser {
  id: string
  handle: string
  email: string
  img_url: string
}

/** Row from figma_connections table */
export interface FigmaConnection {
  id: string
  user_id: string
  figma_user_id: string
  handle: string | null
  email: string | null
  encrypted_tokens: string
  iv: string
  salt: string
  scopes: string[]
  connected_at: string
  last_refreshed_at: string | null
  is_active: boolean
}

/** Public connection status (safe for client) */
export interface FigmaConnectionStatus {
  connected: boolean
  handle?: string
  email?: string
  scopes?: string[]
  connected_at?: string
}
