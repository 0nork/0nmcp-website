// lib/hub-gate.ts
// IKY ("I know you") verification for the 0nVault door. Picks a LOGICAL question
// only the real account owner would easily answer — drawn from their own profile —
// and derives the expected answer for the AI judge. No "tech-savvy" trivia.
import { createHash } from 'crypto'

type Profile = {
  full_name?: string | null
  display_name?: string | null
  company?: string | null
  business_name?: string | null
  business_type?: string | null
  website?: string | null
}

const SECRET = process.env.HUB_TRUST_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'onvault-dev'

/** A per-user token proving THIS browser was verified. Stored in the 0n_trusted cookie. */
export function hubTrustToken(userId: string): string {
  return createHash('sha256').update(`${userId}::${SECRET}`).digest('hex').slice(0, 40)
}

export interface Challenge { id: string; question: string }

/** Choose the most answerable logical question given what we know about the user. */
export function buildChallenge(p: Profile, services: string[], email: string): Challenge {
  if (p.business_name || p.company) return { id: 'company', question: "To confirm it's really you — what's the name of your business?" }
  if (p.website) return { id: 'website', question: 'What website is on your account?' }
  if (p.business_type) return { id: 'business_type', question: 'What kind of business do you run?' }
  if (services && services.length) return { id: 'connected', question: "Name one app you've connected to your 0n vault." }
  if (email) return { id: 'email', question: 'What email address is this account under?' }
  return { id: 'name', question: "What's your first name?" }
}

/** The private truth the answer is checked against (never sent to the browser). */
export function expectedFor(id: string, p: Profile, services: string[], email: string): string {
  switch (id) {
    case 'company': return String(p.business_name || p.company || '')
    case 'website': return String(p.website || '')
    case 'business_type': return String(p.business_type || '')
    case 'connected': return (services || []).join(', ')
    case 'email': return email || ''
    case 'name': return String(p.full_name || p.display_name || '').split(/\s+/)[0] || ''
    default: return ''
  }
}
