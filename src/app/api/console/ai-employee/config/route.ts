import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { executeAgent } from '@/lib/crm-provisioning'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface AiEmployeeConfig {
  name: string
  personality: string
  businessDescription: string
  services: string
  greetingMessage: string
  channels: {
    chatWidget: boolean
    sms: boolean
    email: boolean
    whatsapp: boolean
  }
  autoBookAppointments: boolean
  selectedCalendar: string
  leadQualification: boolean
  escalationThreshold: number
  workingHoursStart: string
  workingHoursEnd: string
  afterHoursMessage: string
  enabled: boolean
}

/**
 * GET /api/console/ai-employee/config
 *
 * Returns the current AI Employee configuration from
 * user_crm_accounts.metadata.ai_employee
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('user_crm_accounts')
    .select('metadata')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: 'Failed to load config' }, { status: 500 })
  }

  const config = data?.metadata?.ai_employee || null

  return NextResponse.json({ success: true, config })
}

/**
 * POST /api/console/ai-employee/config
 *
 * Saves the AI Employee configuration and fires a CRM Agent Studio
 * update so the live agent reflects the new personality/instructions.
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let config: AiEmployeeConfig
  try {
    config = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Fetch existing row so we can merge metadata
  const { data: existing } = await supabase
    .from('user_crm_accounts')
    .select('metadata')
    .eq('user_id', user.id)
    .single()

  const mergedMetadata = {
    ...(existing?.metadata || {}),
    ai_employee: config,
  }

  const { error } = await supabase
    .from('user_crm_accounts')
    .update({ metadata: mergedMetadata })
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 })
  }

  // Fire CRM Agent Studio update (best-effort, don't block on failure)
  try {
    const channelList = Object.entries(config.channels || {})
      .filter(([, v]) => v)
      .map(([k]) => k)
      .join(', ')

    const instruction = [
      `UPDATE PERSONALITY: ${config.name || '0n Assistant'}`,
      `Style: ${config.personality || 'Professional'}`,
      `Greeting: ${config.greetingMessage || ''}`,
      `Services: ${config.services || ''}`,
      `Business: ${config.businessDescription || ''}`,
      `Channels: ${channelList || 'none'}`,
      `Auto-book: ${config.autoBookAppointments ? 'yes' : 'no'}`,
      `Lead qualification: ${config.leadQualification ? 'yes' : 'no'}`,
      `Escalate after: ${config.escalationThreshold || 3} unanswered`,
      `Hours: ${config.workingHoursStart || '09:00'} - ${config.workingHoursEnd || '17:00'}`,
      `After-hours message: ${config.afterHoursMessage || ''}`,
    ].join(' | ')

    await executeAgent({ message: instruction })
  } catch (err) {
    console.error('[ai-employee] Agent Studio update failed:', err)
    // Non-blocking — config is already saved
  }

  return NextResponse.json({ success: true, config })
}
