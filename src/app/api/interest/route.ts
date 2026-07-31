import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/interest — expression-of-interest capture for pre-launch products.
 *
 * Used by the app0n coming-soon page. Two intents share one endpoint: someone
 * waiting for the product, and someone asking about investing.
 *
 * The lead lands in the CRM sub-location that every 0nmcp.com signup lands in,
 * tagged by intent so the two are never worked as the same list. An investor
 * enquiry answered with a product waitlist email is worse than no reply.
 *
 * ON THE INVESTOR PATH: this captures INTEREST. It is not an offer and it takes
 * no money. Whoever follows up is responsible for how the actual conversation is
 * conducted — see the note on the page itself.
 */

const CRM_API = 'https://services.leadconnectorhq.com'
const LOCATION_ID = process.env.CRM_LOCATION_ID || 'nphConTwfHcVE1oA0uep'
const PIT =
  process.env.CRM_PIT_NPHCONTWFHCVE1OA0UEP || process.env.CRM_PIT_TOKEN || ''

export const runtime = 'nodejs'

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = String(body.name || '').trim().slice(0, 120)
    const email = String(body.email || '').trim().toLowerCase().slice(0, 200)
    const message = String(body.message || '').trim().slice(0, 2000)
    const product = String(body.product || 'app0n').trim().slice(0, 60)
    const intent = body.intent === 'invest' ? 'invest' : 'waitlist'

    if (!isEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
    if (!PIT) {
      return NextResponse.json(
        { error: 'We could not record that just now. Please email mike@rocketopp.com.' },
        { status: 503 },
      )
    }

    const [firstName, ...rest] = name.split(/\s+/)

    const res = await fetch(`${CRM_API}/contacts/upsert`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PIT}`,
        Version: '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: LOCATION_ID,
        email,
        firstName: firstName || email.split('@')[0],
        lastName: rest.join(' ') || undefined,
        source: `0nmcp.com — ${product} ${intent === 'invest' ? 'investor enquiry' : 'waitlist'}`,
        // Tagged by intent so an investor enquiry is never worked as a waitlist.
        tags: [
          `${product}-${intent}`,
          intent === 'invest' ? 'investor-enquiry' : 'product-waitlist',
        ],
      }),
      cache: 'no-store',
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('[interest] CRM upsert failed:', res.status, text.slice(0, 200))
      return NextResponse.json(
        { error: 'We could not record that just now. Please email mike@rocketopp.com.' },
        { status: 502 },
      )
    }

    const contact = await res.json().catch(() => ({}))
    const contactId = contact?.contact?.id

    // The message is the substance of an investor enquiry, so it must not be
    // dropped just because the note call is secondary. Failure is logged, never
    // surfaced — the contact was already saved and that is what matters.
    if (message && contactId) {
      await fetch(`${CRM_API}/contacts/${contactId}/notes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PIT}`,
          Version: '2021-07-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: `[${product} · ${intent}]\n\n${message}` }),
      }).catch((e) => console.error('[interest] note failed:', e))
    }

    return NextResponse.json({
      ok: true,
      message:
        intent === 'invest'
          ? 'Thanks — we have your details and will be in touch personally.'
          : "You're on the list. We'll let you know the moment it opens.",
    })
  } catch (e) {
    console.error('[interest] failed:', e)
    return NextResponse.json(
      { error: 'Something went wrong. Please email mike@rocketopp.com.' },
      { status: 500 },
    )
  }
}
