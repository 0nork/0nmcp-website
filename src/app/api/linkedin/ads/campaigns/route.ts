import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { getCampaigns, createCampaign } from '@/lib/linkedin/ads'

export const dynamic = 'force-dynamic'

async function getLinkedInToken() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) return null

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: member } = await admin
    .from('linkedin_members')
    .select('linkedin_access_token, token_expires_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!member?.linkedin_access_token) return null
  if (member.token_expires_at && new Date(member.token_expires_at) < new Date()) return null

  return member.linkedin_access_token
}

export async function GET(request: NextRequest) {
  const token = await getLinkedInToken()
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized or LinkedIn not connected' }, { status: 401 })
  }

  const accountId = request.nextUrl.searchParams.get('accountId')
  if (!accountId) {
    return NextResponse.json({ error: 'accountId required' }, { status: 400 })
  }

  try {
    const campaigns = await getCampaigns(token, accountId)
    return NextResponse.json({ campaigns })
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Failed to fetch campaigns',
    }, { status: 502 })
  }
}

export async function POST(request: NextRequest) {
  const token = await getLinkedInToken()
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized or LinkedIn not connected' }, { status: 401 })
  }

  let body: { accountId?: string; name?: string; type?: string; dailyBudget?: { amount: string; currencyCode: string }; targeting?: Record<string, unknown> }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.accountId || !body.name) {
    return NextResponse.json({ error: 'accountId and name required' }, { status: 400 })
  }

  try {
    const campaign = await createCampaign(token, body.accountId, {
      name: body.name,
      type: (body.type as 'TEXT_AD' | 'SPONSORED_UPDATES' | 'SPONSORED_INMAILS' | 'DYNAMIC') || undefined,
      dailyBudget: body.dailyBudget,
    })
    return NextResponse.json({ campaign }, { status: 201 })
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Failed to create campaign',
    }, { status: 502 })
  }
}
