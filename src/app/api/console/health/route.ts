import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const ONMCP_URL = process.env.ONMCP_URL || 'http://localhost:3001'

export async function GET() {
  try {
    const res = await fetch(`${ONMCP_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) {
      return NextResponse.json({ status: 'offline' })
    }

    const data = await res.json()
    return NextResponse.json({
      status: 'online',
      version: data.version || null,
      uptime: data.uptime || null,
      connections: data.connections || 0,
      services: data.services || [],
      tools: data.tools || 0,
    })
  } catch {
    return NextResponse.json({ status: 'offline' })
  }
}
