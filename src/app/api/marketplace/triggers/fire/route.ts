/**
 * Fire Trigger Endpoint
 * POST /api/marketplace/triggers/fire
 *
 * Internal endpoint to fire a trigger event to all subscribed CRM workflows.
 * Called by 0nMCP after tool execution or workflow completion.
 *
 * Body: { "triggerKey": "tool_executed", "locationId": "xxx", "payload": { ... } }
 */

import { NextRequest, NextResponse } from 'next/server'
import { fireTrigger } from '@/lib/marketplace'

export async function POST(req: NextRequest) {
  try {
    // Simple API key auth for internal calls
    const authHeader = req.headers.get('authorization')
    const apiKey = process.env.MARKETPLACE_INTERNAL_KEY
    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { triggerKey, locationId, payload } = await req.json()

    if (!triggerKey || !locationId) {
      return NextResponse.json({ error: 'triggerKey and locationId required' }, { status: 400 })
    }

    await fireTrigger(triggerKey, locationId, payload || {})

    return NextResponse.json({ fired: true, triggerKey, locationId })
  } catch (error) {
    console.error('Trigger fire error:', error)
    return NextResponse.json({ error: 'Failed to fire trigger' }, { status: 500 })
  }
}
