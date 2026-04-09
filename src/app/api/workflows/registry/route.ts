import { NextResponse } from 'next/server'
import { CRM_INTEGRATION_REGISTRY, ALL_TRIGGERS, ALL_ACTIONS } from '@/lib/workflows/integrationRegistry'

export async function GET() {
  return NextResponse.json({
    integrations: CRM_INTEGRATION_REGISTRY,
    triggers: ALL_TRIGGERS,
    actions: ALL_ACTIONS,
    trigger_count: ALL_TRIGGERS.length,
    action_count: ALL_ACTIONS.length,
  })
}
