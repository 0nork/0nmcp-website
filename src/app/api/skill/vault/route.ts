import { NextRequest, NextResponse } from 'next/server'
import { verifySkillToken, getSkillAdmin } from '@/lib/skill-auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/skill/vault — List connected services (names only, not keys)
 * POST /api/skill/vault — Get a specific service's encrypted key data
 *
 * Keys are encrypted with AES-256-GCM. The skill decrypts them
 * locally using the user's ID as the derivation key.
 */
export async function GET(request: NextRequest) {
  const user = await verifySkillToken(request.headers.get('authorization'))
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = getSkillAdmin()
  const { data: vaults } = await admin
    .from('user_vaults')
    .select('service_name, created_at, updated_at')
    .eq('user_id', user.id)
    .order('service_name')

  return NextResponse.json({
    services: vaults || [],
    count: vaults?.length || 0,
  })
}

export async function POST(request: NextRequest) {
  const user = await verifySkillToken(request.headers.get('authorization'))
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { service_name } = await request.json()
  if (!service_name) {
    return NextResponse.json({ error: 'service_name required' }, { status: 400 })
  }

  const admin = getSkillAdmin()
  const { data: vault } = await admin
    .from('user_vaults')
    .select('encrypted_key, iv, salt, service_name')
    .eq('user_id', user.id)
    .eq('service_name', service_name)
    .maybeSingle()

  if (!vault) {
    return NextResponse.json({
      error: 'not_found',
      message: `No key found for ${service_name}. Add it at https://0nmcp.com/console → Vault.`,
    }, { status: 404 })
  }

  // Return encrypted data — the skill decrypts locally
  return NextResponse.json({
    service_name: vault.service_name,
    encrypted_key: vault.encrypted_key,
    iv: vault.iv,
    salt: vault.salt,
    decrypt_hint: 'Use user_id as PBKDF2 key derivation input with the provided iv and salt.',
  })
}
