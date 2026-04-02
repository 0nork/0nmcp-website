/**
 * 0nDefender — Alert Routing Module
 * Routes security alerts to Supabase + optional Slack/Discord webhooks
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ─── Types ───────────────────────────────────────────────────────────────────

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SecurityThreat {
  name: string;
  version?: string;
  reason: string;
  source?: string;
}

export interface SecurityFailure {
  service: string;
  error: string;
  status?: number;
}

export interface AlertPayload {
  type: string;
  severity: AlertSeverity;
  action?: string;
  threats?: SecurityThreat[];
  failures?: SecurityFailure[];
}

export interface AlertRecord extends AlertPayload {
  id: string;
  resolved_at: string | null;
  created_at: string;
}

interface WebhookConfig {
  url: string;
  enabled: boolean;
}

// ─── Lazy Supabase Client ────────────────────────────────────────────────────

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('0nAlert: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// ─── Severity Colors ─────────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<AlertSeverity, number> = {
  low: 0x7ed957,      // brand green
  medium: 0xffa500,   // orange
  high: 0xff4500,     // red-orange
  critical: 0xff0000, // red
};

const SEVERITY_EMOJI: Record<AlertSeverity, string> = {
  low: 'information_source',
  medium: 'warning',
  high: 'rotating_light',
  critical: 'skull_and_crossbones',
};

// ─── Core Alert Function ─────────────────────────────────────────────────────

export async function sendAlert(payload: AlertPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // 1. Persist to Supabase
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('security_alerts')
      .insert({
        type: payload.type,
        severity: payload.severity,
        action: payload.action || null,
        threats: payload.threats || [],
        failures: payload.failures || [],
      })
      .select('id')
      .single();

    if (error) {
      console.error('[0nAlert] Supabase insert failed:', error.message);
      return { success: false, error: error.message };
    }

    // 2. Route to webhooks (fire-and-forget)
    const webhookPromises: Promise<void>[] = [];

    const slackWebhook = getWebhookConfig('SECURITY_SLACK_WEBHOOK');
    if (slackWebhook.enabled) {
      webhookPromises.push(sendSlackAlert(slackWebhook.url, payload));
    }

    const discordWebhook = getWebhookConfig('SECURITY_DISCORD_WEBHOOK');
    if (discordWebhook.enabled) {
      webhookPromises.push(sendDiscordAlert(discordWebhook.url, payload));
    }

    if (webhookPromises.length > 0) {
      Promise.allSettled(webhookPromises).catch(() => {});
    }

    console.log(`[0nAlert] ${payload.severity.toUpperCase()} alert recorded: ${payload.type} (${data.id})`);
    return { success: true, id: data.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[0nAlert] Failed to send alert:', message);
    return { success: false, error: message };
  }
}

// ─── Recent Alerts ───────────────────────────────────────────────────────────

export async function getRecentAlerts(limit: number = 20): Promise<AlertRecord[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('security_alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[0nAlert] Failed to fetch alerts:', error.message);
    return [];
  }
  return data as AlertRecord[];
}

// ─── Resolve Alert ───────────────────────────────────────────────────────────

export async function resolveAlert(alertId: string): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase
    .from('security_alerts')
    .update({ resolved_at: new Date().toISOString() })
    .eq('id', alertId);

  if (error) {
    console.error('[0nAlert] Failed to resolve alert:', error.message);
    return false;
  }
  return true;
}

// ─── Webhook Helpers ─────────────────────────────────────────────────────────

function getWebhookConfig(envKey: string): WebhookConfig {
  const url = process.env[envKey];
  return { url: url || '', enabled: !!url };
}

async function sendSlackAlert(url: string, payload: AlertPayload): Promise<void> {
  const threatList = (payload.threats || [])
    .map((t) => `- *${t.name}*${t.version ? ` (${t.version})` : ''}: ${t.reason}`)
    .join('\n');

  const failureList = (payload.failures || [])
    .map((f) => `- *${f.service}*: ${f.error}`)
    .join('\n');

  const blocks = [
    `*:${SEVERITY_EMOJI[payload.severity]}: 0nDefender Alert — ${payload.severity.toUpperCase()}*`,
    `*Type:* ${payload.type}`,
    payload.action ? `*Action:* ${payload.action}` : '',
    threatList ? `*Threats:*\n${threatList}` : '',
    failureList ? `*Failures:*\n${failureList}` : '',
  ].filter(Boolean);

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: blocks.join('\n') }),
    });
  } catch (err) {
    console.error('[0nAlert] Slack webhook failed:', err);
  }
}

async function sendDiscordAlert(url: string, payload: AlertPayload): Promise<void> {
  const threatList = (payload.threats || [])
    .map((t) => `- **${t.name}**${t.version ? ` (${t.version})` : ''}: ${t.reason}`)
    .join('\n');

  const failureList = (payload.failures || [])
    .map((f) => `- **${f.service}**: ${f.error}`)
    .join('\n');

  const description = [
    `**Type:** ${payload.type}`,
    payload.action ? `**Action:** ${payload.action}` : '',
    threatList ? `**Threats:**\n${threatList}` : '',
    failureList ? `**Failures:**\n${failureList}` : '',
  ].filter(Boolean).join('\n');

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: `0nDefender Alert — ${payload.severity.toUpperCase()}`,
          description,
          color: SEVERITY_COLORS[payload.severity],
          timestamp: new Date().toISOString(),
        }],
      }),
    });
  } catch (err) {
    console.error('[0nAlert] Discord webhook failed:', err);
  }
}
