import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { decryptVaultData } from '@/lib/vault-crypto'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

const SMARTLEAD_BASE = 'https://server.smartlead.ai/api/v1'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getSmartleadKey(userId: string): Promise<string | null> {
  const admin = getAdmin()
  const { data: row } = await admin
    .from('user_vaults')
    .select('encrypted_key, iv, salt')
    .eq('user_id', userId)
    .eq('service_name', 'smartlead')
    .maybeSingle()

  if (!row?.encrypted_key || !row?.iv || !row?.salt) return null

  try {
    const plaintext = await decryptVaultData(userId, row.encrypted_key, row.iv, row.salt)
    try {
      const parsed = JSON.parse(plaintext)
      return parsed.api_key || null
    } catch {
      return plaintext || null
    }
  } catch {
    return null
  }
}

async function smartleadFetch(path: string, apiKey: string, options?: RequestInit) {
  const separator = path.includes('?') ? '&' : '?'
  const url = `${SMARTLEAD_BASE}${path}${separator}api_key=${apiKey}`
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    signal: AbortSignal.timeout(25000),
  })
}

/**
 * GET /api/console/smartlead?action=campaigns|leads|email_accounts|campaign_stats
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'campaigns'

  const apiKey = await getSmartleadKey(user.id)
  if (!apiKey) {
    return NextResponse.json({ error: 'Smartlead not connected. Add your API key in the Vault.' }, { status: 412 })
  }

  try {
    switch (action) {
      case 'campaigns': {
        const res = await smartleadFetch('/campaigns', apiKey)
        if (!res.ok) {
          const text = await res.text()
          return NextResponse.json({ error: `Smartlead API error: ${res.status}`, detail: text }, { status: 502 })
        }
        const data = await res.json()
        const campaigns = Array.isArray(data) ? data : (data.data || data.campaigns || [])

        // Compute aggregate stats
        let totalSent = 0, totalOpens = 0, totalClicks = 0, totalReplies = 0, totalBounces = 0, totalLeads = 0
        for (const c of campaigns) {
          totalSent += c.sent_count || 0
          totalOpens += c.open_count || 0
          totalClicks += c.click_count || 0
          totalReplies += c.reply_count || 0
          totalBounces += c.bounce_count || 0
          totalLeads += c.lead_count || 0
        }

        const stats = {
          total_campaigns: campaigns.length,
          total_leads: totalLeads,
          total_sent: totalSent,
          total_opens: totalOpens,
          total_clicks: totalClicks,
          total_replies: totalReplies,
          total_bounces: totalBounces,
          open_rate: totalSent ? Math.round((totalOpens / totalSent) * 1000) / 10 : 0,
          click_rate: totalSent ? Math.round((totalClicks / totalSent) * 1000) / 10 : 0,
          reply_rate: totalSent ? Math.round((totalReplies / totalSent) * 1000) / 10 : 0,
          bounce_rate: totalSent ? Math.round((totalBounces / totalSent) * 1000) / 10 : 0,
        }

        return NextResponse.json({ campaigns, stats })
      }

      case 'leads': {
        const campaignId = searchParams.get('campaignId')
        if (!campaignId) return NextResponse.json({ error: 'campaignId required' }, { status: 400 })
        const res = await smartleadFetch(`/campaigns/${campaignId}/leads?offset=0&limit=100`, apiKey)
        if (!res.ok) return NextResponse.json({ error: `Smartlead API error: ${res.status}` }, { status: 502 })
        const data = await res.json()
        return NextResponse.json({ leads: Array.isArray(data) ? data : (data.data || []) })
      }

      case 'email_accounts': {
        const res = await smartleadFetch('/email-accounts', apiKey)
        if (!res.ok) return NextResponse.json({ error: `Smartlead API error: ${res.status}` }, { status: 502 })
        const data = await res.json()
        return NextResponse.json({ accounts: Array.isArray(data) ? data : (data.data || []) })
      }

      case 'campaign_stats': {
        const campaignId = searchParams.get('campaignId')
        if (!campaignId) return NextResponse.json({ error: 'campaignId required' }, { status: 400 })
        const res = await smartleadFetch(`/campaigns/${campaignId}/analytics`, apiKey)
        if (!res.ok) return NextResponse.json({ error: `Smartlead API error: ${res.status}` }, { status: 502 })
        const data = await res.json()
        return NextResponse.json({ stats: data })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Smartlead request failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/**
 * POST /api/console/smartlead
 * Body: { action: 'create_campaign' | 'add_leads', ...params }
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const apiKey = await getSmartleadKey(user.id)
  if (!apiKey) {
    return NextResponse.json({ error: 'Smartlead not connected. Add your API key in the Vault.' }, { status: 412 })
  }

  const action = body.action as string

  try {
    switch (action) {
      case 'create_campaign': {
        const name = body.name as string
        if (!name) return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 })

        const res = await smartleadFetch('/campaigns/create', apiKey, {
          method: 'POST',
          body: JSON.stringify({ name }),
        })
        if (!res.ok) {
          const text = await res.text()
          return NextResponse.json({ error: `Smartlead API error: ${res.status}`, detail: text }, { status: 502 })
        }
        const data = await res.json()
        return NextResponse.json({ campaign: data })
      }

      case 'add_leads': {
        const campaignId = body.campaignId as number
        const leadList = body.leadList as Array<Record<string, string>>
        if (!campaignId || !leadList?.length) {
          return NextResponse.json({ error: 'campaignId and leadList required' }, { status: 400 })
        }

        const res = await smartleadFetch(`/campaigns/${campaignId}/leads`, apiKey, {
          method: 'POST',
          body: JSON.stringify({ lead_list: leadList }),
        })
        if (!res.ok) {
          const text = await res.text()
          return NextResponse.json({ error: `Smartlead API error: ${res.status}`, detail: text }, { status: 502 })
        }
        const data = await res.json()
        return NextResponse.json({ result: data })
      }

      case 'create_sequence': {
        const campaignId = body.campaignId as number
        const sequences = body.sequences as Array<Record<string, unknown>>
        if (!campaignId || !sequences?.length) {
          return NextResponse.json({ error: 'campaignId and sequences required' }, { status: 400 })
        }

        const res = await smartleadFetch(`/campaigns/${campaignId}/sequences`, apiKey, {
          method: 'POST',
          body: JSON.stringify({ sequences }),
        })
        if (!res.ok) {
          const text = await res.text()
          return NextResponse.json({ error: `Smartlead API error: ${res.status}`, detail: text }, { status: 502 })
        }
        const data = await res.json()
        return NextResponse.json({ result: data })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Smartlead request failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
