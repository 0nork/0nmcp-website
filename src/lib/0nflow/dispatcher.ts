/**
 * 0nFlow action dispatcher.
 *
 * Each flow step's `action` maps to a function here. Functions resolve
 * template variables against the dispatch context and call the appropriate
 * provider (CRM, Resend, Slack, etc.). Returns DispatchResult; the caller
 * (cron) writes status + result back to flow_steps.
 *
 * v0.1 actions: email, sms, slack, tag_add, webhook, wait.
 */

import type { DispatchContext, DispatchResult, FlowStepRow } from './types'
import { resolveTemplate } from './template'

const CRM_BASE = 'https://services.leadconnectorhq.com'
const CRM_VERSION = '2021-07-28'

export async function dispatch(
  step: FlowStepRow,
  ctx: DispatchContext,
): Promise<DispatchResult> {
  // Resolve {{contact.x}} and similar in all params before running.
  const resolved = resolveTemplate(step.params, {
    contact: {
      id: ctx.enrollment.contact_id,
      email: ctx.enrollment.contact_email,
      ...ctx.enrollment.contact_data,
    },
    flow: ctx.flow,
  }) as Record<string, unknown>

  switch (step.action) {
    case 'email':
      return runEmail(resolved, ctx)
    case 'sms':
      return runSms(resolved, ctx)
    case 'slack':
      return runSlack(resolved)
    case 'tag_add':
      return runTagAdd(resolved, ctx)
    case 'webhook':
      return runWebhook(resolved)
    case 'wait':
      return { ok: true, result: { kind: 'wait' } }
    default:
      return { ok: false, error: `Unknown action: ${step.action}` }
  }
}

// ---------- email ----------
//
// Provider precedence: step.params.provider > flow.default_provider > 'crm'.
// CRM provider sends via Conversations API on the flow's location, so the
// email comes from the verified sender configured on that sub-location.

async function runEmail(p: Record<string, unknown>, ctx: DispatchContext): Promise<DispatchResult> {
  const provider = (p.provider as string) || ctx.flow.default_provider || 'crm'
  const subject = String(p.subject || '')
  const html = String(p.html || p.body || '')
  const text = String(p.text || stripHtml(html))
  const to = ctx.enrollment.contact_email

  if (provider === 'crm') {
    const pit = pickCrmPit()
    if (!pit) return { ok: false, error: 'No CRM PIT available' }
    if (!ctx.enrollment.contact_id) return { ok: false, error: 'CRM email requires contact_id' }

    const res = await fetch(`${CRM_BASE}/conversations/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${pit}`,
        Version: CRM_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'Email',
        contactId: ctx.enrollment.contact_id,
        subject,
        html: html || text,
        message: text,
      }),
    })
    if (!res.ok) {
      const errText = await res.text()
      return { ok: false, error: `CRM ${res.status}: ${errText}` }
    }
    const data = await res.json().catch(() => ({}))
    return { ok: true, result: { provider, conversationId: data?.conversationId, messageId: data?.messageId } }
  }

  if (provider === 'resend') {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) return { ok: false, error: 'RESEND_API_KEY not set' }
    const from = (p.from as string) || process.env.RESEND_FROM || 'noreply@0nmcp.com'
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject, html, text }),
    })
    if (!res.ok) return { ok: false, error: `Resend ${res.status}: ${await res.text()}` }
    const data = await res.json().catch(() => ({}))
    return { ok: true, result: { provider, id: data?.id } }
  }

  return { ok: false, error: `Email provider not supported in v0.1: ${provider}` }
}

// ---------- sms ----------

async function runSms(p: Record<string, unknown>, ctx: DispatchContext): Promise<DispatchResult> {
  const pit = pickCrmPit()
  if (!pit) return { ok: false, error: 'No CRM PIT' }
  if (!ctx.enrollment.contact_id) return { ok: false, error: 'CRM SMS requires contact_id' }

  const res = await fetch(`${CRM_BASE}/conversations/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${pit}`, Version: CRM_VERSION, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'SMS',
      contactId: ctx.enrollment.contact_id,
      message: String(p.message || p.body || ''),
    }),
  })
  if (!res.ok) return { ok: false, error: `CRM ${res.status}: ${await res.text()}` }
  return { ok: true, result: { provider: 'crm-sms' } }
}

// ---------- slack ----------

async function runSlack(p: Record<string, unknown>): Promise<DispatchResult> {
  const url = (p.webhook_url as string) || process.env.SLACK_DEFAULT_WEBHOOK || ''
  const text = String(p.text || p.message || '')
  if (!url) return { ok: false, error: 'Slack webhook_url missing' }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, ...(p.blocks ? { blocks: p.blocks } : {}) }),
  })
  if (!res.ok) return { ok: false, error: `Slack ${res.status}: ${await res.text()}` }
  return { ok: true, result: { provider: 'slack' } }
}

// ---------- tag_add ----------

async function runTagAdd(p: Record<string, unknown>, ctx: DispatchContext): Promise<DispatchResult> {
  const pit = pickCrmPit()
  if (!pit) return { ok: false, error: 'No CRM PIT' }
  if (!ctx.enrollment.contact_id) return { ok: false, error: 'tag_add requires contact_id' }

  const tags = (Array.isArray(p.tags) ? p.tags : [p.tag]).filter(Boolean) as string[]
  if (tags.length === 0) return { ok: false, error: 'No tags supplied' }

  const res = await fetch(`${CRM_BASE}/contacts/${ctx.enrollment.contact_id}/tags`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${pit}`, Version: CRM_VERSION, 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags }),
  })
  if (!res.ok) return { ok: false, error: `CRM ${res.status}: ${await res.text()}` }
  return { ok: true, result: { provider: 'crm-tags', tags } }
}

// ---------- webhook ----------

async function runWebhook(p: Record<string, unknown>): Promise<DispatchResult> {
  const url = String(p.url || '')
  if (!url) return { ok: false, error: 'webhook url missing' }
  const method = String(p.method || 'POST').toUpperCase()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((p.headers as Record<string, string>) || {}),
  }
  const res = await fetch(url, {
    method,
    headers,
    body: method === 'GET' ? undefined : JSON.stringify(p.body ?? {}),
  })
  if (!res.ok) return { ok: false, error: `Webhook ${res.status}` }
  return { ok: true, result: { provider: 'webhook', status: res.status } }
}

// ---------- helpers ----------

function pickCrmPit(): string {
  return (
    process.env.CRM_SXO_PIT ||
    process.env.CRM_AGENCY_PIT ||
    process.env.CRM_PIT ||
    ''
  )
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}
