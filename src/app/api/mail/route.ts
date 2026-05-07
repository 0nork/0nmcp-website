import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getUser() {
  const supabase = await createSupabaseServer()
  if (!supabase) return null
  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  return user
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const action = req.nextUrl.searchParams.get('action') || 'dashboard_stats'
    const admin = getAdmin()

    switch (action) {
      case 'dashboard_stats': {
        const [campaigns, inboxes, contacts, sequences, replies] = await Promise.all([
          admin.from('onmail_campaigns').select('id, status, stats, name').eq('user_id', user.id),
          admin.from('onmail_inboxes').select('id, health_score, warmup_status').eq('user_id', user.id),
          admin.from('onmail_campaign_contacts').select('id, status, campaign_id').in(
            'campaign_id',
            (await admin.from('onmail_campaigns').select('id').eq('user_id', user.id)).data?.map(c => c.id) || []
          ),
          admin.from('onmail_sequences').select('id, status').eq('user_id', user.id),
          admin.from('onmail_replies').select('id, classification, status').eq('user_id', user.id),
        ])

        const activeCampaigns = campaigns.data?.filter(c => c.status === 'active') || []
        const totalContacts = contacts.data?.length || 0

        // Aggregate stats from all campaigns
        let totalSent = 0, totalOpened = 0, totalReplied = 0, totalMeetings = 0
        for (const c of campaigns.data || []) {
          const s = c.stats || {}
          totalSent += s.sent || 0
          totalOpened += s.opened || 0
          totalReplied += s.replied || 0
          totalMeetings += s.meetings_booked || 0
        }

        const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : '0'
        const replyRate = totalSent > 0 ? ((totalReplied / totalSent) * 100).toFixed(1) : '0'

        // Average health score across inboxes
        const healthScores = (inboxes.data || []).map(i => i.health_score)
        const avgHealth = healthScores.length > 0
          ? Math.round(healthScores.reduce((a: number, b: number) => a + b, 0) / healthScores.length)
          : 0

        return NextResponse.json({
          active_campaigns: activeCampaigns.length,
          total_contacts: totalContacts,
          emails_sent: totalSent,
          open_rate: openRate,
          reply_rate: replyRate,
          meetings_booked: totalMeetings,
          avg_health: avgHealth,
          total_inboxes: inboxes.data?.length || 0,
          warming_inboxes: inboxes.data?.filter(i => i.warmup_status === 'active').length || 0,
          recent_campaigns: (campaigns.data || []).slice(0, 5),
          unread_replies: replies.data?.filter(r => r.status === 'unread').length || 0,
        })
      }

      case 'inboxes': {
        const { data, error } = await admin
          .from('onmail_inboxes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ inboxes: data })
      }

      case 'sequences': {
        const { data, error } = await admin
          .from('onmail_sequences')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ sequences: data })
      }

      case 'campaigns': {
        const { data, error } = await admin
          .from('onmail_campaigns')
          .select('*, onmail_sequences(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ campaigns: data })
      }

      case 'domains': {
        const { data, error } = await admin
          .from('onmail_domains')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ domains: data })
      }

      case 'providers': {
        const { data, error } = await admin
          .from('onmail_providers')
          .select('id, provider_type, status, metadata, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ providers: data })
      }

      case 'replies': {
        const { data, error } = await admin
          .from('onmail_replies')
          .select('*, onmail_campaigns(name), onmail_campaign_contacts(first_name, last_name, email, company)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ replies: data })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { action } = body
    const admin = getAdmin()

    switch (action) {
      case 'create_inbox': {
        const { email_address, domain, provider, warmup_provider } = body
        const { data, error } = await admin
          .from('onmail_inboxes')
          .insert({
            user_id: user.id,
            email_address,
            domain,
            provider,
            warmup_provider: warmup_provider || 'smartlead',
          })
          .select()
          .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ inbox: data })
      }

      case 'create_domain': {
        const { domain, registrar } = body
        const { data, error } = await admin
          .from('onmail_domains')
          .insert({ user_id: user.id, domain, registrar })
          .select()
          .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ domain: data })
      }

      case 'create_provider': {
        const { provider_type, vault_key_ref, metadata } = body
        const { data, error } = await admin
          .from('onmail_providers')
          .insert({
            user_id: user.id,
            provider_type,
            vault_key_ref,
            metadata: metadata || {},
          })
          .select()
          .single()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ provider: data })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
