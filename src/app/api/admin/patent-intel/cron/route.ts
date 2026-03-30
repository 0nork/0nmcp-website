import { NextResponse } from 'next/server'

export const maxDuration = 300

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { runScan } = await import('@/lib/patent-intel/scan-engine')
    await runScan('full')
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() })
  } catch (err) {
    console.error('[0nDefender] Cron scan error:', err)
    return NextResponse.json({ error: 'Scan failed' }, { status: 500 })
  }
}
