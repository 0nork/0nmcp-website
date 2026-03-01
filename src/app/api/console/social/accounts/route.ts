import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { listSocialAccounts } from '@/lib/crm-social'

export const dynamic = 'force-dynamic'

/**
 * GET /api/console/social/accounts
 * Returns connected social media accounts from the CRM.
 * Also includes direct-adapter platforms (Reddit, Dev.to) with their connection status.
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ accounts: [], error: 'Auth not configured' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ accounts: [], error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch CRM-connected social accounts
  let crmAccounts: { id: string; name: string; platform: string; avatar?: string }[] = []
  try {
    crmAccounts = await listSocialAccounts()
  } catch (err) {
    console.error('Failed to fetch CRM social accounts:', err)
  }

  // Map CRM platform names to our platform IDs
  const CRM_TO_PLATFORM: Record<string, string> = {
    linkedin: 'linkedin',
    facebook: 'facebook',
    instagram: 'instagram',
    twitter: 'x_twitter',
    google: 'google',
  }

  // Build connected platforms set from CRM accounts
  const connectedPlatforms = new Set<string>()
  for (const acct of crmAccounts) {
    const platId = CRM_TO_PLATFORM[acct.platform?.toLowerCase()]
    if (platId) connectedPlatforms.add(platId)
  }

  // Check direct-adapter platforms by env var presence
  if (process.env.REDDIT_CLIENT_ID && process.env.REDDIT_USERNAME) {
    connectedPlatforms.add('reddit')
  }
  if (process.env.DEVTO_API_KEY) {
    connectedPlatforms.add('dev_to')
  }

  // Build full platform list with connection status
  const allPlatforms = [
    { id: 'linkedin', name: 'LinkedIn', color: '#0077b5', method: 'crm' },
    { id: 'facebook', name: 'Facebook', color: '#1877f2', method: 'crm' },
    { id: 'instagram', name: 'Instagram', color: '#e4405f', method: 'crm' },
    { id: 'x_twitter', name: 'X / Twitter', color: '#000000', method: 'crm' },
    { id: 'google', name: 'Google Business', color: '#4285f4', method: 'crm' },
    { id: 'reddit', name: 'Reddit', color: '#ff4500', method: 'direct' },
    { id: 'dev_to', name: 'Dev.to', color: '#0a0a0a', method: 'direct' },
  ].map((p) => ({
    ...p,
    connected: connectedPlatforms.has(p.id),
  }))

  return NextResponse.json({
    accounts: crmAccounts,
    platforms: allPlatforms,
  })
}
