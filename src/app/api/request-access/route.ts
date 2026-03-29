import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

const CRM_API = 'https://services.leadconnectorhq.com'
const CRM_VERSION = '2021-07-28'
const CRM_LOCATION = 'nphConTwfHcVE1oA0uep'
const CRM_PIT = process.env.CRM_PIT || 'pit-b7250922-356b-4131-b567-bbaaa9d08c61'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, company } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    // 1. Create CRM contact
    const nameParts = name.trim().split(/\s+/)
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    try {
      await fetch(`${CRM_API}/contacts/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CRM_PIT}`,
          'Content-Type': 'application/json',
          'Version': CRM_VERSION,
        },
        body: JSON.stringify({
          locationId: CRM_LOCATION,
          firstName,
          lastName,
          email,
          companyName: company || undefined,
          tags: ['waitlist', 'pre-launch', '0nmcp-request'],
          source: '0nmcp.com waitlist',
        }),
      })
    } catch {
      // CRM failure is non-blocking — still store in Supabase
      console.error('[request-access] CRM contact creation failed')
    }

    // 2. Store in Supabase waitlist table
    const supabase = await createSupabaseServer()
    if (supabase) {
      const { error: dbError } = await supabase
        .from('waitlist')
        .upsert(
          {
            email: email.toLowerCase(),
            name,
            company: company || null,
            source: '0nmcp.com',
            created_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        )

      if (dbError) {
        console.error('[request-access] Supabase insert error:', dbError.message)
      }
    }

    return NextResponse.json({ success: true, message: 'Your spot is reserved!' })
  } catch (err) {
    console.error('[request-access] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 })
  }
}
