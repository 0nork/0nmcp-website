/**
 * 0nDefender — Vault Guard (Key Health Verification)
 * Checks liveness of all configured API keys by making lightweight probe requests
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { sendAlert, type SecurityFailure } from './0n-alert';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface KeyProbeResult {
  service: string;
  healthy: boolean;
  status: number | null;
  latencyMs: number;
  error?: string;
}

export interface KeyHealthReport {
  results: KeyProbeResult[];
  allHealthy: boolean;
  checkedAt: string;
  totalServices: number;
  healthyCount: number;
  failedCount: number;
}

interface ServiceProbe {
  service: string;
  envKey: string;
  url: string;
  method?: string;
  headers?: (key: string) => Record<string, string>;
  bodyFn?: () => string;
  expectedStatus?: number[];
}

// ─── Lazy Supabase Client ────────────────────────────────────────────────────

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('0nVaultGuard: Missing Supabase credentials');
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// ─── Service Probes ──────────────────────────────────────────────────────────

const SERVICE_PROBES: ServiceProbe[] = [
  {
    service: 'stripe',
    envKey: 'STRIPE_SECRET_KEY',
    url: 'https://api.stripe.com/v1/balance',
    headers: (key) => ({ Authorization: `Bearer ${key}` }),
    expectedStatus: [200],
  },
  {
    service: 'supabase',
    envKey: 'NEXT_PUBLIC_SUPABASE_URL',
    url: '', // built dynamically
    headers: () => ({}),
    expectedStatus: [200],
  },
  {
    service: 'anthropic',
    envKey: 'ANTHROPIC_API_KEY',
    url: 'https://api.anthropic.com/v1/models',
    headers: (key) => ({
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    }),
    expectedStatus: [200],
  },
  {
    service: 'sendgrid',
    envKey: 'SENDGRID_API_KEY',
    url: 'https://api.sendgrid.com/v3/scopes',
    headers: (key) => ({ Authorization: `Bearer ${key}` }),
    expectedStatus: [200],
  },
  {
    service: 'github',
    envKey: 'GITHUB_TOKEN',
    url: 'https://api.github.com/rate_limit',
    headers: (key) => ({ Authorization: `Bearer ${key}`, 'User-Agent': '0nDefender' }),
    expectedStatus: [200],
  },
  {
    service: 'openai',
    envKey: 'OPENAI_API_KEY',
    url: 'https://api.openai.com/v1/models',
    headers: (key) => ({ Authorization: `Bearer ${key}` }),
    expectedStatus: [200],
  },
  {
    service: 'resend',
    envKey: 'RESEND_API_KEY',
    url: 'https://api.resend.com/domains',
    headers: (key) => ({ Authorization: `Bearer ${key}` }),
    expectedStatus: [200],
  },
];

// ─── Probe Execution ─────────────────────────────────────────────────────────

async function probeService(probe: ServiceProbe): Promise<KeyProbeResult> {
  const apiKey = process.env[probe.envKey];
  if (!apiKey) {
    return {
      service: probe.service,
      healthy: false,
      status: null,
      latencyMs: 0,
      error: `Missing env var: ${probe.envKey}`,
    };
  }

  // Special handling for Supabase — probe the REST endpoint
  let url = probe.url;
  if (probe.service === 'supabase') {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      return {
        service: 'supabase',
        healthy: false,
        status: null,
        latencyMs: 0,
        error: 'Missing SUPABASE_URL or ANON_KEY',
      };
    }
    url = `${supabaseUrl}/rest/v1/`;
    const start = Date.now();
    try {
      const res = await fetch(url, {
        method: 'HEAD',
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
        signal: AbortSignal.timeout(10000),
      });
      return {
        service: 'supabase',
        healthy: res.status < 500,
        status: res.status,
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      return {
        service: 'supabase',
        healthy: false,
        status: null,
        latencyMs: Date.now() - start,
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  const start = Date.now();
  try {
    const headers = probe.headers ? probe.headers(apiKey) : {};
    const res = await fetch(url, {
      method: probe.method || 'GET',
      headers,
      body: probe.bodyFn ? probe.bodyFn() : undefined,
      signal: AbortSignal.timeout(10000),
    });
    const expectedStatuses = probe.expectedStatus || [200];
    const healthy = expectedStatuses.includes(res.status);
    return {
      service: probe.service,
      healthy,
      status: res.status,
      latencyMs: Date.now() - start,
      error: healthy ? undefined : `Unexpected status: ${res.status}`,
    };
  } catch (err) {
    return {
      service: probe.service,
      healthy: false,
      status: null,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// ─── Main Health Check ───────────────────────────────────────────────────────

export async function checkKeyHealth(): Promise<KeyHealthReport> {
  // Only probe services that have their env var set
  const activeProbes = SERVICE_PROBES.filter((p) => {
    if (p.service === 'supabase') return !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    return !!process.env[p.envKey];
  });

  const results = await Promise.all(activeProbes.map(probeService));

  const healthyCount = results.filter((r) => r.healthy).length;
  const failedCount = results.filter((r) => !r.healthy).length;
  const allHealthy = failedCount === 0;
  const checkedAt = new Date().toISOString();

  const report: KeyHealthReport = {
    results,
    allHealthy,
    checkedAt,
    totalServices: results.length,
    healthyCount,
    failedCount,
  };

  // Persist to Supabase
  try {
    const supabase = getSupabase();
    await supabase.from('security_key_health').insert({
      results: results as unknown as Record<string, unknown>[],
      all_healthy: allHealthy,
      checked_at: checkedAt,
    });
  } catch (err) {
    console.error('[0nVaultGuard] Failed to persist health check:', err);
  }

  // Alert on failures
  if (failedCount > 0) {
    const failures: SecurityFailure[] = results
      .filter((r) => !r.healthy)
      .map((r) => ({
        service: r.service,
        error: r.error || `Status ${r.status}`,
        status: r.status || undefined,
      }));

    await sendAlert({
      type: 'key_health_failure',
      severity: failedCount >= 3 ? 'critical' : failedCount >= 2 ? 'high' : 'medium',
      action: `${failedCount} API key(s) failed health check`,
      failures,
    });
  }

  return report;
}

// ─── Get Latest Health Report ────────────────────────────────────────────────

export async function getLatestHealthReport(): Promise<KeyHealthReport | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('security_key_health')
      .select('*')
      .order('checked_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    return {
      results: data.results as KeyProbeResult[],
      allHealthy: data.all_healthy,
      checkedAt: data.checked_at,
      totalServices: (data.results as KeyProbeResult[]).length,
      healthyCount: (data.results as KeyProbeResult[]).filter((r: KeyProbeResult) => r.healthy).length,
      failedCount: (data.results as KeyProbeResult[]).filter((r: KeyProbeResult) => !r.healthy).length,
    };
  } catch {
    return null;
  }
}
