/**
 * Trigger Subscription Endpoint
 * POST /api/marketplace/triggers/subscribe
 *
 * Called by the CRM when a trigger is CREATED, UPDATED, or DELETED in a workflow.
 * Stores the subscription so we know where to fire events.
 *
 * Payload from CRM:
 * {
 *   "triggerData": {
 *     "id": "def",
 *     "key": "tool_executed",
 *     "filters": [],
 *     "eventType": "CREATED",
 *     "targetUrl": "https://services.leadconnectorhq.com/workflows-marketplace/triggers/execute/abc/def"
 *   },
 *   "meta": { "key": "tool_executed", "version": "1.0" },
 *   "extras": { "locationId": "xxx", "workflowId": "yyy", "companyId": "zzz" }
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { saveTriggerSubscription } from '@/lib/marketplace'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { triggerData = {}, extras = {}, meta = {} } = body

    if (!triggerData.id) {
      return NextResponse.json({ error: 'Missing trigger ID' }, { status: 400 })
    }

    await saveTriggerSubscription({
      triggerId: triggerData.id,
      triggerKey: triggerData.key || meta.key || 'unknown',
      locationId: extras.locationId || '',
      workflowId: extras.workflowId || '',
      companyId: extras.companyId,
      targetUrl: triggerData.targetUrl || '',
      filters: triggerData.filters || [],
      eventType: triggerData.eventType || 'CREATED',
    })

    console.log(`[marketplace] Trigger ${triggerData.eventType}: ${triggerData.key} for location ${extras.locationId}`)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Trigger subscription error:', error)
    return NextResponse.json({ error: 'Failed to process trigger subscription' }, { status: 500 })
  }
}
