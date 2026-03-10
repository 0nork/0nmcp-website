/**
 * Skill Auth — Token-based authentication for Claude Code skill users.
 *
 * The /0nmcp skill authenticates via Supabase email/password,
 * gets a JWT, and sends it as Bearer token on subsequent requests.
 * This module verifies that token and returns the user.
 */

import { createClient } from '@supabase/supabase-js'

export interface SkillUser {
  id: string
  email: string
  full_name: string | null
  role: string
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Verify a Bearer token from the skill and return the user.
 * Returns null if invalid/expired.
 */
export async function verifySkillToken(authHeader: string | null): Promise<SkillUser | null> {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)

  // Use the token to create an authenticated Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return null

  // Get profile
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
  const { data: profile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  return {
    id: user.id,
    email: user.email || '',
    full_name: profile?.full_name || null,
    role: user.email === 'mike@rocketopp.com' ? 'owner' : 'user',
  }
}

/**
 * Get admin Supabase client (service role).
 */
export function getSkillAdmin() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
}
