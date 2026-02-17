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
        stageId: STAGE_IDS.free,
        contactId: contact.id,
        monetaryValue: 0,
      })
    }

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
          stageId: STAGE_IDS[newTier],
          monetaryValue: TIER_VALUES[newTier] || 0,
        })
      }
    }

    console.log(`[crm-sync] Tier change: ${email} ${oldTier} → ${newTier}`)
  } catch (err) {
    console.error('[crm-sync] syncTierChange error:', err)
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

// ==================== AUTH EMAIL TEMPLATES ====================

/**
 * Send a magic link email via CRM
 */
export async function sendMagicLinkEmail(email: string, magicLink: string): Promise<boolean> {
  return sendTransactionalEmail({
    to: email,
    subject: 'Your 0nMCP Login Link',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0a0f; color: #e0e0e0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: 900; color: #00ff88; font-family: monospace;">0n</span>
          <span style="font-size: 18px; font-weight: 700; margin-left: 4px;">MCP</span>
        </div>
        <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Login Link</h2>
        <p style="font-size: 14px; color: #999; line-height: 1.6; margin-bottom: 24px;">
          Click the button below to sign in to your 0nMCP account. This link expires in 1 hour.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${magicLink}" style="display: inline-block; padding: 12px 32px; background: #00ff88; color: #0a0a0f; font-weight: 700; font-size: 14px; border-radius: 10px; text-decoration: none;">
            Sign In to 0nMCP
          </a>
        </div>
        <p style="font-size: 12px; color: #666; line-height: 1.5;">
          If you didn't request this link, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #1a1a2e; margin: 24px 0;" />
        <p style="font-size: 11px; color: #444; text-align: center;">
          0nMCP — Universal AI API Orchestrator<br />
          <a href="https://0nmcp.com" style="color: #00ff88;">0nmcp.com</a>
        </p>
      </div>
    `,
  })
}

/**
 * Send a password reset email via CRM
 */
export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  return sendTransactionalEmail({
    to: email,
    subject: 'Reset Your 0nMCP Password',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0a0f; color: #e0e0e0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: 900; color: #00ff88; font-family: monospace;">0n</span>
          <span style="font-size: 18px; font-weight: 700; margin-left: 4px;">MCP</span>
        </div>
        <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Password Reset</h2>
        <p style="font-size: 14px; color: #999; line-height: 1.6; margin-bottom: 24px;">
          Click the button below to reset your password. This link expires in 1 hour.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${resetLink}" style="display: inline-block; padding: 12px 32px; background: #00ff88; color: #0a0a0f; font-weight: 700; font-size: 14px; border-radius: 10px; text-decoration: none;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 12px; color: #666; line-height: 1.5;">
          If you didn't request a password reset, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #1a1a2e; margin: 24px 0;" />
        <p style="font-size: 11px; color: #444; text-align: center;">
          0nMCP — Universal AI API Orchestrator<br />
          <a href="https://0nmcp.com" style="color: #00ff88;">0nmcp.com</a>
        </p>
      </div>
    `,
  })
}

/**
 * Send a signup confirmation email via CRM
 */
export async function sendConfirmationEmail(email: string, confirmLink: string): Promise<boolean> {
  return sendTransactionalEmail({
    to: email,
    subject: 'Confirm Your 0nMCP Account',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0a0f; color: #e0e0e0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: 900; color: #00ff88; font-family: monospace;">0n</span>
          <span style="font-size: 18px; font-weight: 700; margin-left: 4px;">MCP</span>
        </div>
        <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Welcome to 0nMCP!</h2>
        <p style="font-size: 14px; color: #999; line-height: 1.6; margin-bottom: 24px;">
          Thanks for signing up. Confirm your email to access 550 tools across 26 services — free forever.
        </p>
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${confirmLink}" style="display: inline-block; padding: 12px 32px; background: #00ff88; color: #0a0a0f; font-weight: 700; font-size: 14px; border-radius: 10px; text-decoration: none;">
            Confirm Email
          </a>
        </div>
        <p style="font-size: 12px; color: #666; line-height: 1.5;">
          After confirming, check out the <a href="https://0nmcp.com/learn" style="color: #00ff88;">free courses</a> to get started.
        </p>
        <hr style="border: none; border-top: 1px solid #1a1a2e; margin: 24px 0;" />
        <p style="font-size: 11px; color: #444; text-align: center;">
          0nMCP — Universal AI API Orchestrator<br />
          <a href="https://0nmcp.com" style="color: #00ff88;">0nmcp.com</a>
        </p>
      </div>
    `,
  })
}

/**
 * Send a welcome email (after confirmation) via CRM
 */
export async function sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
  return sendTransactionalEmail({
    to: email,
    subject: 'You\'re in! Here\'s how to get started with 0nMCP',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0a0a0f; color: #e0e0e0; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-size: 24px; font-weight: 900; color: #00ff88; font-family: monospace;">0n</span>
          <span style="font-size: 18px; font-weight: 700; margin-left: 4px;">MCP</span>
        </div>
        <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Welcome${name ? `, ${name}` : ''}!</h2>
        <p style="font-size: 14px; color: #999; line-height: 1.6; margin-bottom: 16px;">
          You now have access to the most comprehensive MCP server available — 550 tools, 26 services, zero boilerplate.
        </p>
        <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 8px; color: #00ff88;">Quick Start</h3>
        <div style="background: #111; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; font-family: monospace; font-size: 13px;">
          npm install -g 0nmcp<br />
          0nmcp --version
        </div>
        <p style="font-size: 14px; color: #999; line-height: 1.6; margin-bottom: 16px;">
          <strong style="color: #e0e0e0;">Next steps:</strong>
        </p>
        <ul style="font-size: 13px; color: #999; line-height: 1.8; padding-left: 20px; margin-bottom: 24px;">
          <li><a href="https://0nmcp.com/learn/getting-started" style="color: #00ff88;">Take the Getting Started course</a> (free, 15 min)</li>
          <li><a href="https://0nmcp.com/builder" style="color: #00ff88;">Build your first workflow</a></li>
          <li><a href="https://0nmcp.com/forum" style="color: #00ff88;">Join the community forum</a></li>
          <li><a href="https://discord.gg/0nork" style="color: #00ff88;">Jump into Discord</a></li>
        </ul>
        <hr style="border: none; border-top: 1px solid #1a1a2e; margin: 24px 0;" />
        <p style="font-size: 11px; color: #444; text-align: center;">
          0nMCP — Stop building workflows. Start describing outcomes.<br />
          <a href="https://0nmcp.com" style="color: #00ff88;">0nmcp.com</a>
        </p>
      </div>
    `,
  })
}
