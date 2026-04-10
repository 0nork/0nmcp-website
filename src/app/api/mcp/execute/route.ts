import { NextRequest, NextResponse } from 'next/server'
import { runMCPCommand } from '@/lib/command-runner'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ') || authHeader.slice(7) !== process.env.MCP_API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { prompt, userId } = await req.json()
  if (!prompt) {
    return NextResponse.json({ error: 'prompt required' }, { status: 400 })
  }

  const result = await runMCPCommand(prompt, userId || 'api')
  return NextResponse.json(result)
}
