import { NextRequest, NextResponse } from 'next/server'

const CRM_API = 'https://services.leadconnectorhq.com'
const CRM_VERSION = '2021-07-28'

function getCrmHeaders(): Record<string, string> {
  const key = process.env.CRM_API_KEY
  if (!key) throw new Error('CRM_API_KEY not configured')
  return {
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Version': CRM_VERSION,
  }
}

function getLocationId(): string {
  return process.env.CRM_LOCATION_ID || ''
}

const INQUIRY_TAGS: Record<string, string[]> = {
  partnership: ['0nmcp-connect', 'partnership-inquiry', 'inbound-lead'],
  investment: ['0nmcp-connect', 'investment-inquiry', 'investor-lead', 'high-priority'],
  enterprise: ['0nmcp-connect', 'enterprise-inquiry', 'enterprise-lead'],
  general: ['0nmcp-connect', 'general-inquiry', 'inbound-lead'],
}

function buildWelcomeEmail(firstName: string, inquiryType: string): string {
  const typeLabels: Record<string, string> = {
    partnership: 'Partnership Opportunity',
    investment: 'Investment Inquiry',
    enterprise: 'Enterprise Licensing',
    general: 'General Inquiry',
  }

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0c0c14;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0c0c14;">
<tr><td align="center" style="padding:40px 20px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#111118;border:1px solid #2a2a3a;border-radius:12px;overflow:hidden;">

<!-- Header -->
<tr><td style="padding:32px 40px 24px;border-bottom:1px solid #2a2a3a;">
<span style="font-family:'JetBrains Mono',monospace;font-size:24px;font-weight:900;color:#7ed957;letter-spacing:-0.03em;">0nORK</span>
</td></tr>

<!-- Body -->
<tr><td style="padding:32px 40px;">
<h1 style="color:#e8e8ef;font-size:22px;margin:0 0 16px;">Thank you, ${firstName}.</h1>
<p style="color:#8888a0;font-size:15px;line-height:1.7;margin:0 0 20px;">
We received your <strong style="color:#e8e8ef;">${typeLabels[inquiryType] || 'inquiry'}</strong> and appreciate your interest in 0nORK. Our team personally reviews every submission and will respond within one business day.
</p>
<p style="color:#8888a0;font-size:15px;line-height:1.7;margin:0 0 24px;">
In the meantime, explore what we&rsquo;re building:
</p>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
<tr>
<td style="padding:12px 16px;background:#16161f;border-radius:8px 8px 0 0;border-bottom:1px solid #2a2a3a;">
<a href="https://0nmcp.com/security" style="color:#7ed957;text-decoration:none;font-size:14px;font-weight:600;">Patent-Pending 0nVault Security</a>
<p style="color:#55556a;font-size:13px;margin:4px 0 0;">7-layer encrypted business asset transfer with multi-party escrow</p>
</td>
</tr>
<tr>
<td style="padding:12px 16px;background:#16161f;border-bottom:1px solid #2a2a3a;">
<a href="https://0nmcp.com/turn-it-on" style="color:#7ed957;text-decoration:none;font-size:14px;font-weight:600;">819 AI Orchestration Tools</a>
<p style="color:#55556a;font-size:13px;margin:4px 0 0;">48 services, 21 categories &mdash; the most comprehensive MCP server available</p>
</td>
</tr>
<tr>
<td style="padding:12px 16px;background:#16161f;border-radius:0 0 8px 8px;">
<a href="https://github.com/0nork/0nMCP" style="color:#7ed957;text-decoration:none;font-size:14px;font-weight:600;">Open Source on GitHub</a>
<p style="color:#55556a;font-size:13px;margin:4px 0 0;">MIT licensed &mdash; free forever for the community</p>
</td>
</tr>
</table>

<p style="color:#8888a0;font-size:14px;line-height:1.7;margin:0;">
&mdash; Mike Mento<br/>
<span style="color:#55556a;">Founder &amp; CEO, RocketOpp LLC</span>
</p>
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 40px;border-top:1px solid #2a2a3a;background:#0c0c14;">
<p style="color:#55556a;font-size:11px;line-height:1.6;margin:0;text-align:center;">
<a href="https://0nmcp.com" style="color:#55556a;">0nmcp.com</a> &middot;
<a href="https://github.com/0nork/0nMCP" style="color:#55556a;">GitHub</a> &middot;
<a href="https://npmjs.com/package/0nmcp" style="color:#55556a;">npm</a>
</p>
<p style="color:#55556a;font-size:10px;line-height:1.5;margin:8px 0 0;text-align:center;">
RocketOpp LLC &middot; Pittsburgh, PA<br/>
You received this email because you submitted an inquiry on 0nmcp.com.
</p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, company, phone, inquiryType, message } = body

    if (!firstName || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const locationId = getLocationId()
    if (!locationId) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const headers = getCrmHeaders()
    const tags = INQUIRY_TAGS[inquiryType] || INQUIRY_TAGS.general

    // 1. Upsert contact in CRM
    const contactRes = await fetch(`${CRM_API}/contacts/upsert`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        locationId,
        email,
        firstName,
        lastName: lastName || undefined,
        phone: phone || undefined,
        companyName: company || undefined,
        source: '0nmcp.com/connect',
        tags,
      }),
    })

    if (!contactRes.ok) {
      const errData = await contactRes.json().catch(() => ({}))
      console.error('CRM upsert failed:', contactRes.status, errData)
      return NextResponse.json({ error: 'Failed to process your inquiry' }, { status: 500 })
    }

    const contactData = await contactRes.json()
    const contactId = contactData.contact?.id

    if (!contactId) {
      return NextResponse.json({ error: 'Failed to create contact record' }, { status: 500 })
    }

    // 2. Add a note with the inquiry message
    const typeLabels: Record<string, string> = {
      partnership: 'Partnership Opportunity',
      investment: 'Investment Inquiry',
      enterprise: 'Enterprise Licensing',
      general: 'General Inquiry',
    }

    await fetch(`${CRM_API}/contacts/${contactId}/notes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        body: `[0nmcp.com Connect Form]\n\nType: ${typeLabels[inquiryType] || inquiryType}\nCompany: ${company || 'N/A'}\nPhone: ${phone || 'N/A'}\n\nMessage:\n${message}\n\nSubmitted: ${new Date().toISOString()}`,
      }),
    }).catch(err => console.error('Note creation failed:', err))

    // 3. Create opportunity for investment/enterprise inquiries
    const pipelineId = process.env.CRM_PIPELINE_ID
    if (pipelineId && (inquiryType === 'investment' || inquiryType === 'enterprise')) {
      const stageId = inquiryType === 'investment'
        ? process.env.CRM_STAGE_ENTERPRISE
        : process.env.CRM_STAGE_BUILDER

      if (stageId) {
        await fetch(`${CRM_API}/opportunities/`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            pipelineId,
            pipelineStageId: stageId,
            contactId,
            name: `${email} — ${typeLabels[inquiryType]}`,
            status: 'open',
            monetaryValue: 0,
          }),
        }).catch(err => console.error('Opportunity creation failed:', err))
      }
    }

    // 4. Send welcome email
    const fromEmail = process.env.CRM_FROM_EMAIL || 'noreply@0nmcp.com'
    await fetch(`${CRM_API}/conversations/messages/email`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type: 'Email',
        contactId,
        emailFrom: `0nORK <${fromEmail}>`,
        subject: `Thank you for reaching out, ${firstName}`,
        html: buildWelcomeEmail(firstName, inquiryType),
        emailTo: email,
      }),
    }).catch(err => console.error('Welcome email failed:', err))

    return NextResponse.json({ success: true, contactId })
  } catch (err) {
    console.error('Connect form error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
