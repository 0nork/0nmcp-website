import { NextResponse } from 'next/server'
import { STATS, STATS_DISPLAY } from '@/data/stats'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ONMCP_URL = process.env.ONMCP_URL

export async function GET() {
  // If no ONMCP_URL configured, we're in cloud mode (default for production)
  if (!ONMCP_URL) {
    return NextResponse.json({
      status: 'cloud',
      version: '2.2.0',
      uptime: null,
      connections: 48,
      services: [],
      tools: STATS.tools,
      mode: 'cloud',
      message: `0nMCP Cloud — ${STATS_DISPLAY.tools} tools ready`,
    })
  }

  try {
    const res = await fetch(`${ONMCP_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      return NextResponse.json({
        status: 'cloud',
        version: '2.2.0',
        connections: 48,
        tools: STATS.tools,
        mode: 'cloud',
        message: `0nMCP Cloud — ${STATS_DISPLAY.tools} tools ready`,
      })
    }

    const data = await res.json()
    return NextResponse.json({
      status: 'online',
      version: data.version || '2.2.0',
      uptime: data.uptime || null,
      connections: data.connections || 0,
      services: data.services || [],
      tools: data.tools || 0,
      mode: 'local',
      spark_mode: true,
      workflows_count: data.workflows_count || data.workflows?.length || 0,
    })
  } catch {
    // Local server not running — fall back to cloud mode
    return NextResponse.json({
      status: 'cloud',
      version: '2.2.0',
      connections: 48,
      tools: STATS.tools,
      mode: 'cloud',
      message: `0nMCP Cloud — ${STATS_DISPLAY.tools} tools ready`,
    })
  }
}
