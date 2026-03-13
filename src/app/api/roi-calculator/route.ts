import { NextResponse } from 'next/server'
import { upsertContact, addContactTags, addContactNote } from '@/lib/crm'

export const dynamic = 'force-dynamic'

/**
 * POST /api/roi-calculator
 * Captures lead from ROI calculator → CRM contact with tags + detailed note
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, company, agencySize, inputs, results } = body

    if (!email || !name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Upsert CRM contact
    const [firstName, ...lastParts] = name.split(' ')
    const contact = await upsertContact({
      email,
      firstName: firstName || email.split('@')[0],
      lastName: lastParts.join(' ') || undefined,
      source: 'roi-calculator',
      companyName: company || undefined,
      tags: ['roi-calculator', 'lead', '0nmcp', 'agency-prospect'],
    })

    // Size-based tags
    const sizeTags: string[] = []
    if (agencySize <= 5) sizeTags.push('agency-small')
    else if (agencySize <= 25) sizeTags.push('agency-medium')
    else sizeTags.push('agency-large')

    const savingsBucket = Math.floor((results?.totalMonthlyCost || 0) / 1000)
    if (savingsBucket > 0) sizeTags.push(`monthly-savings-${savingsBucket}k-plus`)

    if (sizeTags.length > 0) {
      await addContactTags(contact.id, sizeTags)
    }

    // Detailed ROI note
    const note = [
      '--- ROI Calculator Lead ---',
      '',
      `Agency: ${company || 'Not provided'}`,
      `Clients: ${agencySize || inputs?.totalClients || 'N/A'}`,
      `Hourly Rate: $${inputs?.hourlyRate || 'N/A'}`,
      '',
      'Monthly Savings Breakdown:',
      `  Client Onboarding:  $${fmt(results?.onboardingCost)}`,
      `  Monthly Reporting:  $${fmt(results?.reportingCost)}`,
      `  Lead Follow-up:     $${fmt(results?.leadFollowUpCost)}`,
      `  Social Media:       $${fmt(results?.socialMediaCost)}`,
      `  Email Campaigns:    $${fmt(results?.emailCampaignCost)}`,
      `  Invoice & Billing:  $${fmt(results?.invoicingCost)}`,
      '',
      `Total Monthly Savings: $${fmt(results?.totalMonthlyCost)}`,
      `Total Annual Savings:  $${fmt(results?.totalAnnualCost)}`,
      `Hours Saved/Month:     ${results?.totalMonthlyHours?.toFixed(1) || '0'}`,
      `ROI Payback:           ${results?.roiPaybackDays || '0'} days`,
      `FTEs Replaced:         ${results?.ftesReplaced?.toFixed(1) || '0'}`,
      '',
      `Source: 0nmcp.com/roi-calculator`,
      `Date: ${new Date().toISOString()}`,
    ].join('\n')

    await addContactNote(contact.id, note)

    return NextResponse.json({ ok: true, contactId: contact.id })
  } catch (err) {
    console.error('[roi-calculator] Error:', err)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

function fmt(n: number | undefined): string {
  return (n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
