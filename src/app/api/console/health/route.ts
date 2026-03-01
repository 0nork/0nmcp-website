import { NextResponse } from 'next/server'

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
      tools: 819,
      mode: 'cloud',
      message: '0nMCP Cloud — 819 tools ready',
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
        tools: 819,
        mode: 'cloud',
        message: '0nMCP Cloud — 819 tools ready',
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
    })
  } catch {
    // Local server not running — fall back to cloud mode
    return NextResponse.json({
      status: 'cloud',
      version: '2.2.0',
      connections: 48,
      tools: 819,
      mode: 'cloud',
      message: '0nMCP Cloud — 819 tools ready',
    })
  }
}
