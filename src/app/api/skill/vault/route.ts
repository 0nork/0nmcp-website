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
      message: `No key found for ${service_name}. Add it at https://www.0nmcp.com/console → Vault.`,
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

/**
 * PUT /api/skill/vault — Write/update a credential from the skill → web vault
 *
 * Body: { service_name, encrypted_key, iv, salt }
 * The skill encrypts locally (AES-256-GCM with user_id as PBKDF2 key)
 * and sends the ciphertext here.
 */
export async function PUT(request: NextRequest) {
  const user = await verifySkillToken(request.headers.get('authorization'))
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await request.json()
  const { service_name, encrypted_key, iv, salt } = body

  if (!service_name || !encrypted_key || !iv || !salt) {
    return NextResponse.json({
      error: 'Missing required fields: service_name, encrypted_key, iv, salt',
    }, { status: 400 })
  }

  // Validate service_name (alphanumeric + underscore/dash, max 64 chars)
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(service_name)) {
    return NextResponse.json({
      error: 'Invalid service_name. Use alphanumeric, underscore, or dash (max 64 chars).',
    }, { status: 400 })
  }

  const admin = getSkillAdmin()
  const { error } = await admin
    .from('user_vaults')
    .upsert({
      user_id: user.id,
      service_name,
      encrypted_key,
      iv,
      salt,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,service_name' })

  if (error) {
    return NextResponse.json({ error: 'Failed to save credential' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    service_name,
    message: `Credential for ${service_name} saved to vault.`,
  })
}

/**
 * DELETE /api/skill/vault — Remove a credential from the vault
 *
 * Body: { service_name }
 */
export async function DELETE(request: NextRequest) {
  const user = await verifySkillToken(request.headers.get('authorization'))
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { service_name } = await request.json()
  if (!service_name) {
    return NextResponse.json({ error: 'service_name required' }, { status: 400 })
  }

  const admin = getSkillAdmin()
  const { error } = await admin
    .from('user_vaults')
    .delete()
    .eq('user_id', user.id)
    .eq('service_name', service_name)

  if (error) {
    return NextResponse.json({ error: 'Failed to delete credential' }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    service_name,
    message: `Credential for ${service_name} removed from vault.`,
  })
}
