/**
 * CRM Sync Layer — Bridges Supabase ↔ CRM
 * Syncs users, tiers, enrollments, and sends transactional emails
 */

import {
  upsertContact,
  findContactByEmail,
  addContactTags,
  removeContactTags,
  sendEmail,
  createOpportunity,
  updateOpportunity,
  findOpportunityByContact,
} from './crm'

// Pipeline/stage IDs — set these after creating the pipeline in CRM
const PIPELINE_ID = process.env.CRM_PIPELINE_ID || ''
const STAGE_IDS: Record<string, string> = {
  free: process.env.CRM_STAGE_FREE || '',
  supporter: process.env.CRM_STAGE_SUPPORTER || '',
  builder: process.env.CRM_STAGE_BUILDER || '',
  enterprise: process.env.CRM_STAGE_ENTERPRISE || '',
}

const TIER_VALUES: Record<string, number> = {
  free: 0,
  supporter: 60,      // $5/mo × 12
  builder: 300,        // $25/mo × 12
  enterprise: 1200,    // $100/mo × 12
}

// ==================== COMMUNITY ENROLLMENT ====================

const COMMUNITY_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/nphConTwfHcVE1oA0uep/webhook-trigger/45345fec-2d97-4c7b-9de3-e3c190cf0847'

/**
 * Trigger CRM workflow to auto-enroll user into "the-0nboard" community
 * Fires the inbound webhook which triggers the community grant workflow
 */
async function triggerCommunityEnrollment(data: {
  email: string
  firstName?: string
  lastName?: string
  source?: string
}): Promise<void> {
  try {
    const res = await fetch(COMMUNITY_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        firstName: data.firstName || data.email.split('@')[0],
        lastName: data.lastName || '',
        source: data.source || '0nmcp.com',
        tags: ['0nmcp-signup', 'website-signup'],
        action: 'community_enroll',
        timestamp: new Date().toISOString(),
      }),
    })

    if (res.ok) {
      console.log(`[crm-sync] Community enrollment triggered for ${data.email}`)
    } else {
      console.warn(`[crm-sync] Community webhook returned ${res.status}`)
    }
  } catch (err) {
    console.error('[crm-sync] triggerCommunityEnrollment error:', err)
  }
}

// ==================== USER SYNC ====================

/**
 * Sync a new Supabase user to CRM
 * Called on: profiles INSERT webhook
 */
export async function syncNewUser(record: Record<string, unknown>): Promise<string | null> {
  try {
    const email = record.email as string
    if (!email) return null

    const fullName = (record.full_name as string) || ''
    const [firstName, ...lastParts] = fullName.split(' ')

    // Upsert contact in CRM
    const contact = await upsertContact({
      email,
      firstName: firstName || email.split('@')[0],
      lastName: lastParts.join(' ') || undefined,
      source: '0nmcp.com',
      tags: ['0nmcp', 'website-signup', 'free-tier'],
      companyName: (record.company as string) || undefined,
    })

    // Create opportunity in pipeline (if pipeline is configured)
    if (PIPELINE_ID && STAGE_IDS.free) {
      await createOpportunity({
        name: `${email} — 0nMCP User`,
        pipelineId: PIPELINE_ID,
        pipelineStageId: STAGE_IDS.free,
        contactId: contact.id,
        monetaryValue: 0,
      })
    }

    // Auto-enroll in the 0nBoard community
    await triggerCommunityEnrollment({
      email,
      firstName: firstName || email.split('@')[0],
      lastName: lastParts.join(' ') || undefined,
    })

    console.log(`[crm-sync] New user synced: ${email} → contact ${contact.id}`)
    return contact.id
  } catch (err) {
    console.error('[crm-sync] syncNewUser error:', err)
    return null
  }
}

// ==================== TIER SYNC ====================

/**
 * Sync a tier change to CRM pipeline
 * Called on: profiles UPDATE webhook (when sponsor_tier changes)
 */
export async function syncTierChange(
  record: Record<string, unknown>,
  oldRecord: Record<string, unknown>
): Promise<void> {
  try {
    const email = record.email as string
    const newTier = (record.sponsor_tier as string) || 'free'
    const oldTier = (oldRecord.sponsor_tier as string) || 'free'

    if (newTier === oldTier) return

    const contact = await findContactByEmail(email)
    if (!contact) {
      console.warn(`[crm-sync] Contact not found for tier change: ${email}`)
      return
    }

    // Update tags
    const oldTag = `${oldTier}-tier`
    const newTag = `${newTier}-tier`
    await removeContactTags(contact.id, [oldTag])
    await addContactTags(contact.id, [newTag, `upgraded-${newTier}`])

    // Update pipeline opportunity
    if (PIPELINE_ID && STAGE_IDS[newTier]) {
      const opp = await findOpportunityByContact(contact.id, PIPELINE_ID)
      if (opp) {
        await updateOpportunity(opp.id, {
          pipelineStageId: STAGE_IDS[newTier],
          monetaryValue: TIER_VALUES[newTier] || 0,
        })
      }
    }

    console.log(`[crm-sync] Tier change: ${email} ${oldTier} → ${newTier}`)
  } catch (err) {
    console.error('[crm-sync] syncTierChange error:', err)
  }
}

// ==================== ONBOARDING SYNC ====================

/**
 * Sync onboarding completion to CRM
 * Called on: profiles UPDATE webhook (when onboarding_completed flips to true)
 * Tags contact with role and interest tags for segmented marketing
 */
export async function syncOnboardingComplete(record: Record<string, unknown>): Promise<void> {
  try {
    const email = record.email as string
    if (!email) return

    const contact = await findContactByEmail(email)
    if (!contact) {
      console.warn(`[crm-sync] Contact not found for onboarding complete: ${email}`)
      return
    }

    const tags: string[] = ['onboarded']

    // Add role tag
    const role = record.role as string
    if (role) tags.push(`role-${role}`)

    // Add interest tags
    const interests = record.interests as string[] | null
    if (interests && interests.length > 0) {
      interests.forEach(interest => {
        tags.push(`interest-${interest.toLowerCase().replace(/[^a-z0-9]/g, '-')}`)
      })
    }

    await addContactTags(contact.id, tags)
    console.log(`[crm-sync] Onboarding complete: ${email} tagged with ${tags.join(', ')}`)
  } catch (err) {
    console.error('[crm-sync] syncOnboardingComplete error:', err)
  }
}

// ==================== ENROLLMENT SYNC ====================

/**
 * Sync a course enrollment to CRM tags/notes
 * Called on: enrollments INSERT webhook
 */
export async function syncEnrollment(record: Record<string, unknown>): Promise<void> {
  try {
    const userId = record.user_id as string
    const courseId = record.course_id as string

    if (!userId || !courseId) return

    // We need to look up the user email — the webhook only has user_id
    // The webhook handler should pass the full profile data
    // For now, tag with course ID
    console.log(`[crm-sync] Enrollment: user=${userId} course=${courseId}`)
    // Tags are added in the webhook handler after looking up the user
  } catch (err) {
    console.error('[crm-sync] syncEnrollment error:', err)
  }
}

// ==================== EMAIL SENDING ====================

/**
 * Send a transactional email via CRM
 * Used for: auth emails, welcome emails, notifications
 */
export async function sendTransactionalEmail(params: {
  to: string
  subject: string
  html: string
}): Promise<boolean> {
  try {
    // Find or create contact
    let contact = await findContactByEmail(params.to)
    if (!contact) {
      contact = await upsertContact({
        email: params.to,
        source: '0nmcp.com',
        tags: ['0nmcp', 'transactional'],
      })
    }

    await sendEmail({
      contactId: contact.id,
      subject: params.subject,
      html: params.html,
      emailTo: params.to,
    })

    console.log(`[crm-sync] Email sent: "${params.subject}" → ${params.to}`)
    return true
  } catch (err) {
    console.error('[crm-sync] sendTransactionalEmail error:', err)
    return false
  }
}

// ==================== EMAIL TEMPLATE SYSTEM ====================

/**
 * Shared email layout — 0nMCP branded with CAN-SPAM compliant footer
 * All transactional emails go through this wrapper for consistent branding.
 */
function emailLayout(params: {
  preheader?: string
  heading: string
  body: string
  ctaText?: string
  ctaUrl?: string
  footnote?: string
  reason: string // CAN-SPAM: why they received this email
}): string {
  const cta = params.ctaUrl && params.ctaText
    ? `<div style="text-align:center;margin:28px 0;">
        <a href="${params.ctaUrl}" style="display:inline-block;padding:14px 36px;background:#00ff88;color:#0a0a0f;font-weight:800;font-size:15px;border-radius:10px;text-decoration:none;letter-spacing:-0.01em;mso-padding-alt:14px 36px;">
          ${params.ctaText}
        </a>
      </div>`
    : ''

  const footnote = params.footnote
    ? `<p style="font-size:12px;color:#777;line-height:1.6;margin:0 0 20px;">${params.footnote}</p>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>0nMCP</title>
  <!--[if mso]>
  <style>body{font-family:Arial,sans-serif!important;}</style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background:#06060a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,sans-serif;">
  ${params.preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${params.preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#06060a;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding:0 0 8px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:24px 32px 20px;background:#0c0c14;border-radius:16px 16px 0 0;border:1px solid #1a1a2e;border-bottom:none;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom:6px;">
                          <span style="font-size:32px;font-weight:900;color:#00ff88;font-family:'Courier New',Courier,monospace;letter-spacing:-0.03em;">0n</span><span style="font-size:22px;font-weight:700;color:#e0e0e0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin-left:3px;">MCP</span>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <span style="font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;">Universal AI API Orchestrator</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:28px 32px 32px;background:#0c0c14;border:1px solid #1a1a2e;border-top:none;border-bottom:none;">
                    <h1 style="font-size:20px;font-weight:800;color:#e8e8e8;margin:0 0 12px;letter-spacing:-0.02em;">${params.heading}</h1>
                    ${params.body}
                    ${cta}
                    ${footnote}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:0 32px;background:#0c0c14;border:1px solid #1a1a2e;border-top:none;border-bottom:none;">
                    <div style="border-top:1px solid #1a1a2e;"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Social + Links -->
          <tr>
            <td style="padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:20px 32px;background:#0c0c14;border:1px solid #1a1a2e;border-top:none;border-bottom:none;text-align:center;">
                    <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                      <tr>
                        <td style="padding:0 8px;"><a href="https://0nmcp.com" style="color:#00ff88;font-size:11px;text-decoration:none;font-weight:600;">Website</a></td>
                        <td style="color:#333;font-size:11px;">&middot;</td>
                        <td style="padding:0 8px;"><a href="https://0n.app.clientclub.net/communities/groups/the-0nboard/home" style="color:#00ff88;font-size:11px;text-decoration:none;font-weight:600;">0nBoard</a></td>
                        <td style="color:#333;font-size:11px;">&middot;</td>
                        <td style="padding:0 8px;"><a href="https://0nmcp.com/forum" style="color:#00ff88;font-size:11px;text-decoration:none;font-weight:600;">Forum</a></td>
                        <td style="color:#333;font-size:11px;">&middot;</td>
                        <td style="padding:0 8px;"><a href="https://github.com/0nork/0nMCP" style="color:#00ff88;font-size:11px;text-decoration:none;font-weight:600;">GitHub</a></td>
                        <td style="color:#333;font-size:11px;">&middot;</td>
                        <td style="padding:0 8px;"><a href="https://npmjs.com/package/0nmcp" style="color:#00ff88;font-size:11px;text-decoration:none;font-weight:600;">npm</a></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CAN-SPAM Footer -->
          <tr>
            <td style="padding:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:20px 32px 28px;background:#0a0a10;border-radius:0 0 16px 16px;border:1px solid #1a1a2e;border-top:none;text-align:center;">
                    <p style="font-size:11px;color:#555;line-height:1.6;margin:0 0 8px;">
                      ${params.reason}
                    </p>
                    <p style="font-size:11px;color:#444;line-height:1.6;margin:0 0 8px;">
                      <strong style="color:#555;">RocketOpp LLC</strong> d/b/a 0nMCP<br />
                      651 N Broad St, Suite 201, Middletown, DE 19709
                    </p>
                    <p style="font-size:10px;color:#444;line-height:1.6;margin:0;">
                      <a href="https://0nmcp.com/account" style="color:#00ff88;text-decoration:none;">Manage preferences</a>
                      &nbsp;&middot;&nbsp;
                      <a href="https://0nmcp.com/unsubscribe" style="color:#888;text-decoration:none;">Unsubscribe</a>
                    </p>
                    <p style="font-size:10px;color:#333;margin:12px 0 0;">
                      &copy; ${new Date().getFullYear()} RocketOpp LLC. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ==================== AUTH EMAIL TEMPLATES ====================

/**
 * Send a magic link email via CRM
 */
export async function sendMagicLinkEmail(email: string, magicLink: string): Promise<boolean> {
  return sendTransactionalEmail({
    to: email,
    subject: 'Your 0nMCP Login Link',
    html: emailLayout({
      preheader: 'Click to sign in to your 0nMCP account',
      heading: 'Sign in to 0nMCP',
      body: `
        <p style="font-size:14px;color:#999;line-height:1.7;margin:0 0 4px;">
          Click the button below to sign in to your account. This link is valid for <strong style="color:#e0e0e0;">1 hour</strong> and can only be used once.
        </p>
      `,
      ctaText: 'Sign In to 0nMCP',
      ctaUrl: magicLink,
      footnote: 'If you didn\'t request this link, you can safely ignore this email. Your account is secure.',
      reason: 'You received this email because a sign-in was requested for this email address on 0nmcp.com.',
    }),
  })
}

/**
 * Send a password reset email via CRM
 */
export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  return sendTransactionalEmail({
    to: email,
    subject: 'Reset Your 0nMCP Password',
    html: emailLayout({
      preheader: 'Reset your 0nMCP password',
      heading: 'Reset your password',
      body: `
        <p style="font-size:14px;color:#999;line-height:1.7;margin:0 0 4px;">
          We received a request to reset the password for your 0nMCP account. Click the button below to choose a new password. This link expires in <strong style="color:#e0e0e0;">1 hour</strong>.
        </p>
      `,
      ctaText: 'Reset Password',
      ctaUrl: resetLink,
      footnote: 'If you didn\'t request a password reset, no action is needed. Your password will remain unchanged and your account is secure.',
      reason: 'You received this email because a password reset was requested for this email address on 0nmcp.com.',
    }),
  })
}

/**
 * Send a signup confirmation email via CRM
 */
export async function sendConfirmationEmail(email: string, confirmLink: string): Promise<boolean> {
  return sendTransactionalEmail({
    to: email,
    subject: 'Confirm Your 0nMCP Account',
    html: emailLayout({
      preheader: 'Confirm your email to activate your 0nMCP account',
      heading: 'Confirm your email',
      body: `
        <p style="font-size:14px;color:#999;line-height:1.7;margin:0 0 8px;">
          Thanks for signing up for 0nMCP! Confirm your email address to activate your account and get access to:
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
          <tr><td style="padding:6px 0;font-size:13px;color:#bbb;"><span style="color:#00ff88;margin-right:8px;">&#10003;</span> 545 tools across 26 services</td></tr>
          <tr><td style="padding:6px 0;font-size:13px;color:#bbb;"><span style="color:#00ff88;margin-right:8px;">&#10003;</span> Free interactive courses</td></tr>
          <tr><td style="padding:6px 0;font-size:13px;color:#bbb;"><span style="color:#00ff88;margin-right:8px;">&#10003;</span> Community forum access</td></tr>
          <tr><td style="padding:6px 0;font-size:13px;color:#bbb;"><span style="color:#00ff88;margin-right:8px;">&#10003;</span> Workflow builder</td></tr>
        </table>
      `,
      ctaText: 'Confirm Email Address',
      ctaUrl: confirmLink,
      footnote: 'If you didn\'t create an account on 0nmcp.com, you can safely ignore this email.',
      reason: 'You received this email because an account was registered with this email address on 0nmcp.com.',
    }),
  })
}

/**
 * Send a welcome email (after confirmation) via CRM
 */
export async function sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
  const greeting = name ? `Welcome, ${name}!` : 'Welcome to 0nMCP!'
  return sendTransactionalEmail({
    to: email,
    subject: "You're in! Here's how to get started with 0nMCP",
    html: emailLayout({
      preheader: 'Your 0nMCP account is ready. Here\'s how to get started.',
      heading: greeting,
      body: `
        <p style="font-size:14px;color:#999;line-height:1.7;margin:0 0 20px;">
          Your account is confirmed. You now have access to the most comprehensive MCP server available &mdash; 545 tools, 26 services, zero boilerplate.
        </p>
        <div style="background:#111118;border:1px solid #1a1a2e;border-radius:10px;padding:16px 20px;margin:0 0 20px;">
          <p style="font-size:12px;color:#00ff88;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 10px;">Quick Start</p>
          <div style="background:#0a0a10;border-radius:6px;padding:12px 16px;font-family:'Courier New',Courier,monospace;font-size:13px;color:#e0e0e0;">
            npm install -g 0nmcp<br />
            0nmcp --version
          </div>
        </div>
        <p style="font-size:14px;font-weight:700;color:#e0e0e0;margin:0 0 12px;">Next steps:</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
          <tr>
            <td style="padding:8px 0;font-size:13px;color:#999;border-bottom:1px solid #1a1a2e;">
              <a href="https://0nmcp.com/learn/getting-started" style="color:#00ff88;text-decoration:none;font-weight:600;">Take the Getting Started course</a>
              <span style="color:#555;margin-left:6px;">(free, 15 min)</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:13px;color:#999;border-bottom:1px solid #1a1a2e;">
              <a href="https://0nmcp.com/turn-it-on" style="color:#00ff88;text-decoration:none;font-weight:600;">Turn it 0n</a>
              <span style="color:#555;margin-left:6px;">&mdash; connect your services</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:13px;color:#999;border-bottom:1px solid #1a1a2e;">
              <a href="https://0n.app.clientclub.net/communities/groups/the-0nboard/home" style="color:#00ff88;text-decoration:none;font-weight:600;">Join the 0nBoard</a>
              <span style="color:#555;margin-left:6px;">&mdash; our community hub</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:13px;color:#999;">
              <a href="https://0nmcp.com/forum" style="color:#00ff88;text-decoration:none;font-weight:600;">Browse the forum</a>
            </td>
          </tr>
        </table>
      `,
      ctaText: 'Go to Your Dashboard',
      ctaUrl: 'https://0nmcp.com/account',
      reason: 'You received this email because you confirmed your account on 0nmcp.com.',
    }),
  })
}
