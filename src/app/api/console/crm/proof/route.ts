import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { getUserCrmConfig, getCrmHeaders, CRM_BASE } from '@/lib/crm/config'

export const dynamic = 'force-dynamic'

/**
 * POST /api/console/crm/proof
 *
 * PROOF OF LIFE — Creates a real CRM contact, adds tags, adds a note.
 * Visible immediately in CRM contacts list.
 * Returns the contact ID + link so you can verify it exists.
 */
export async function POST() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const config = await getUserCrmConfig(supabase)
  if (!config?.pitToken) {
    return NextResponse.json({ error: 'CRM not connected — no PIT token found' }, { status: 500 })
  }

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const timestamp = new Date().toISOString()
  const proofId = `proof-${Date.now()}`

  const steps: Array<{ step: string; status: string; data?: unknown; error?: string }> = []

  // ── Step 1: Create contact via upsert ──
  let contactId = ''
  try {
    const res = await fetch(`${CRM_BASE}/contacts/upsert`, {
      method: 'POST',
      headers: getCrmHeaders(config.pitToken),
      body: JSON.stringify({
        locationId: config.locationId,
        firstName: '0n Console',
        lastName: `Proof ${proofId.slice(-6)}`,
        email: `${proofId}@0nmcp-proof.test`,
        tags: ['0n-proof-of-life', '0n-console'],
        source: '0n Console',
        companyName: '0nMCP Ecosystem',
      }),
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      const errText = await res.text()
      steps.push({ step: 'create_contact', status: 'failed', error: `${res.status}: ${errText}` })
      return NextResponse.json({ success: false, steps, error: 'Failed to create contact' }, { status: 502 })
    }

    const data = await res.json()
    contactId = data.contact?.id || ''
    steps.push({
      step: 'create_contact',
      status: 'success',
      data: {
        contactId,
        name: `0n Console Proof ${proofId.slice(-6)}`,
        email: `${proofId}@0nmcp-proof.test`,
        tags: ['0n-proof-of-life', '0n-console'],
      },
    })
  } catch (err) {
    steps.push({ step: 'create_contact', status: 'failed', error: err instanceof Error ? err.message : 'Unknown' })
    return NextResponse.json({ success: false, steps }, { status: 502 })
  }

  // ── Step 2: Add a note to the contact ──
  try {
    const noteBody = [
      `🟢 PROOF OF LIFE — 0n Console → CRM`,
      ``,
      `This contact was created by the 0n Console at ${timestamp}.`,
      `If you can see this note, the full pipeline works:`,
      `  ✓ Supabase auth verified`,
      `  ✓ CRM PIT token valid`,
      `  ✓ Contact created via API`,
      `  ✓ Note added via API`,
      ``,
      `User: ${user.email || user.id}`,
      `Location: ${config.locationId}`,
      `Proof ID: ${proofId}`,
    ].join('\n')

    const res = await fetch(`${CRM_BASE}/contacts/${contactId}/notes`, {
      method: 'POST',
      headers: getCrmHeaders(config.pitToken),
      body: JSON.stringify({ body: noteBody }),
      signal: AbortSignal.timeout(10000),
    })

    if (res.ok) {
      steps.push({ step: 'add_note', status: 'success', data: { noteLength: noteBody.length } })
    } else {
      const errText = await res.text()
      steps.push({ step: 'add_note', status: 'failed', error: `${res.status}: ${errText}` })
    }
  } catch (err) {
    steps.push({ step: 'add_note', status: 'failed', error: err instanceof Error ? err.message : 'Unknown' })
  }

  // ── Step 3: Add extra tag to prove tag endpoint works ──
  try {
    const res = await fetch(`${CRM_BASE}/contacts/${contactId}/tags`, {
      method: 'POST',
      headers: getCrmHeaders(config.pitToken),
      body: JSON.stringify({ tags: [`proof-${new Date().toISOString().slice(0, 10)}`] }),
      signal: AbortSignal.timeout(10000),
    })

    if (res.ok) {
      steps.push({ step: 'add_tag', status: 'success', data: { tag: `proof-${new Date().toISOString().slice(0, 10)}` } })
    } else {
      const errText = await res.text()
      steps.push({ step: 'add_tag', status: 'failed', error: `${res.status}: ${errText}` })
    }
  } catch (err) {
    steps.push({ step: 'add_tag', status: 'failed', error: err instanceof Error ? err.message : 'Unknown' })
  }

  const allSuccess = steps.every(s => s.status === 'success')

  return NextResponse.json({
    success: allSuccess,
    contactId,
    locationId: config.locationId,
    timestamp,
    proofId,
    steps,
    message: allSuccess
      ? `Contact created in CRM. Go check your contacts — search for "${proofId.slice(-6)}" or tag "0n-proof-of-life".`
      : 'Partial success — check steps for details.',
  })
}
