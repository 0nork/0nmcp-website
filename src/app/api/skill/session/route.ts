import { NextRequest, NextResponse } from 'next/server'
import { verifySkillToken, getSkillAdmin } from '@/lib/skill-auth'
import { isOwner } from '@/lib/runs'

export const dynamic = 'force-dynamic'

/**
 * GET /api/skill/session — Get current session info
 *
 * Returns: user profile, Runs balance, Vault summary, brain tier
 * Used by /0nmcp skill on startup to show status.
 */
export async function GET(request: NextRequest) {
  const user = await verifySkillToken(request.headers.get('authorization'))
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired token. Run: /0nmcp login' }, { status: 401 })
  }

  const admin = getSkillAdmin()

  // Parallel queries
  const [runsRes, vaultRes, tierRes] = await Promise.all([
    admin.from('run_balances').select('balance, lifetime_earned, lifetime_spent').eq('user_id', user.id).maybeSingle(),
    admin.from('user_vaults').select('service_name').eq('user_id', user.id),
    admin.from('council_knowledge').select('id', { count: 'exact', head: true }),
  ])

  // Get brain tier info
  const knowledgeCount = tierRes.count || 0
  let tierName = 'Seed'
  let tierLevel = 0
  if (knowledgeCount >= 1000) { tierName = 'Neural'; tierLevel = 4 }
  else if (knowledgeCount >= 500) { tierName = 'Canopy'; tierLevel = 3 }
  else if (knowledgeCount >= 200) { tierName = 'Growth'; tierLevel = 2 }
  else if (knowledgeCount >= 50) { tierName = 'Sprout'; tierLevel = 1 }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      is_owner: isOwner(user.email),
    },
    runs: {
      balance: runsRes.data?.balance || 0,
      lifetime_earned: runsRes.data?.lifetime_earned || 0,
      lifetime_spent: runsRes.data?.lifetime_spent || 0,
      is_owner: isOwner(user.email), // owners have infinite runs
    },
    vault: {
      connected_services: vaultRes.data?.map(v => v.service_name) || [],
      count: vaultRes.data?.length || 0,
    },
    brain: {
      tier: tierLevel,
      tier_name: tierName,
      knowledge_count: knowledgeCount,
    },
  })
}
