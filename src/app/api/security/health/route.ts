/**
 * 0nDefender — Key Health Check API
 * GET /api/security/health
 *
 * Probes all configured API keys and returns health status.
 * Called by Vercel cron every 12 hours.
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
  // Verify cron secret or allow localhost
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const url = new URL(request.url);
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';

  if (!isLocalhost && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Lazy import to avoid build-time crashes
    const { checkKeyHealth } = await import('@/lib/security/0n-vault-guard');
    const report = await checkKeyHealth();

    return NextResponse.json({
      ok: report.allHealthy,
      defender: '0nVaultGuard',
      report,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[0nDefender] Health check failed:', message);
    return NextResponse.json(
      { ok: false, defender: '0nVaultGuard', error: message },
      { status: 500 },
    );
  }
}
