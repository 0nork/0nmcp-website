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
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = getAdmin()
    const status = req.nextUrl.searchParams.get('status')

    let query = admin
      .from('onmail_campaigns')
      .select('*, onmail_sequences(name, steps)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Attach contact counts
    const campaignIds = (data || []).map(c => c.id)
    const { data: contactCounts } = await admin
      .from('onmail_campaign_contacts')
      .select('campaign_id')
      .in('campaign_id', campaignIds)

    const countMap: Record<string, number> = {}
    for (const cc of contactCounts || []) {
      countMap[cc.campaign_id] = (countMap[cc.campaign_id] || 0) + 1
    }

    const campaigns = (data || []).map(c => ({
      ...c,
      contact_count: countMap[c.id] || c.contact_count || 0,
    }))

    return NextResponse.json({ campaigns })
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
    const { name, sequence_id, inbox_ids, contacts, contact_source } = body
    const admin = getAdmin()

    // Create campaign
    const { data: campaign, error: campError } = await admin
      .from('onmail_campaigns')
      .insert({
        user_id: user.id,
        name,
        sequence_id,
        inbox_ids: inbox_ids || [],
        contact_source: contact_source || 'manual',
        contact_count: contacts?.length || 0,
      })
      .select()
      .single()

    if (campError) return NextResponse.json({ error: campError.message }, { status: 500 })

    // Insert contacts if provided
    if (contacts && contacts.length > 0) {
      const contactRows = contacts.map((c: Record<string, unknown>) => ({
        campaign_id: campaign.id,
        email: c.email,
        first_name: c.first_name || null,
        last_name: c.last_name || null,
        company: c.company || null,
        title: c.title || null,
        linkedin_url: c.linkedin_url || null,
        personalization_data: c.personalization_data || {},
      }))

      const { error: contactError } = await admin
        .from('onmail_campaign_contacts')
        .insert(contactRows)

      if (contactError) {
        console.error('Contact insert error:', contactError)
      }
    }

    return NextResponse.json({ campaign })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
