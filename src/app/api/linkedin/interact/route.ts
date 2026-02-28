import { NextResponse, type NextRequest } from 'next/server'
import { logAiInteraction } from '@/lib/linkedin/network/ai-interaction-logger'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  let body: {
    ai_system: string
    tool: string
    params: Record<string, unknown>
    manifest_version?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.ai_system || !body.tool) {
    return NextResponse.json({ error: 'ai_system and tool are required' }, { status: 400 })
  }

  // Log the interaction
  const interactionId = await logAiInteraction({
    aiSystemIdentifier: body.ai_system,
    manifestVersion: body.manifest_version || '1.0',
    toolCalled: body.tool,
    inputParams: body.params || {},
  })

  return NextResponse.json({
    interaction_id: interactionId,
    status: 'logged',
    tools_endpoint: '/api/linkedin',
    manifest: '/.well-known/0n-manifest.json',
  })
}
