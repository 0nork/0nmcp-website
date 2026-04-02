/**
 * 0nDefender — Supply Chain Scan API
 * POST /api/security/scan
 *
 * Scans package-lock.json for malicious packages, typosquatters, and suspicious patterns.
 * Called by Vercel cron every 6 hours.
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<NextResponse> {
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
    const { scanSupplyChain } = await import('@/lib/security/0n-watch');
    const result = await scanSupplyChain();

    const statusCode = result.threatLevel === 'malicious' ? 200 : 200;

    return NextResponse.json({
      ok: result.threatLevel === 'clean',
      defender: '0nWatch',
      result,
    }, { status: statusCode });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[0nDefender] Supply chain scan failed:', message);
    return NextResponse.json(
      { ok: false, defender: '0nWatch', error: message },
      { status: 500 },
    );
  }
}

// Also support GET for Vercel cron (crons send GET requests)
export async function GET(request: Request): Promise<NextResponse> {
  return POST(request);
}
