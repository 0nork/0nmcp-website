import { createClient, SupabaseClient } from '@supabase/supabase-js'

export const CRM_BASE = 'https://services.leadconnectorhq.com'
export const CRM_VERSION = '2021-07-28'

interface CrmConfig {
  locationId: string
  pitToken: string
}

/**
 * Get the user's active CRM location + PIT token from user_crm_accounts.
 * Falls back to env vars if no user-specific config exists.
 */
export async function getUserCrmConfig(
  supabase: SupabaseClient
): Promise<CrmConfig | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: account } = await admin
    .from('user_crm_accounts')
    .select('location_id, metadata')
    .eq('user_id', user.id)
    .single()

  if (!account) {
    // Fall back to env defaults
    return {
      locationId:
        process.env.CRM_LOCATION_ID ||
        process.env.CRM_COMMUNITY_LOCATION_ID ||
        '',
      pitToken: process.env.CRM_PIT || process.env.CRM_API_KEY || '',
    }
  }

  const meta = (account.metadata as Record<string, string>) || {}
  const activeLocation = meta.active_location || account.location_id
  const pitToken = meta.pit_token || process.env.CRM_PIT || process.env.CRM_API_KEY || ''

  return { locationId: activeLocation, pitToken }
}

/**
 * Build CRM API headers using a specific PIT token.
 */
export function getCrmHeaders(pitToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${pitToken}`,
    'Content-Type': 'application/json',
    Version: CRM_VERSION,
  }
}
