import { createClient } from '@supabase/supabase-js'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Log an interaction from a third-party AI system.
 */
export async function logAiInteraction(params: {
  aiSystemIdentifier: string
  manifestVersion: string
  toolCalled: string
  inputParams: Record<string, unknown>
  executionReceiptId?: string
  interactionQuality?: number
}): Promise<string> {
  const admin = getAdmin()

  const { data, error } = await admin
    .from('ai_interactions')
    .insert({
      ai_system_identifier: params.aiSystemIdentifier,
      manifest_version: params.manifestVersion,
      tool_called: params.toolCalled,
      input_params: params.inputParams,
      execution_receipt_id: params.executionReceiptId || null,
      interaction_quality: params.interactionQuality || null,
    })
    .select('id')
    .single()

  if (error) throw new Error(`Failed to log AI interaction: ${error.message}`)
  return data.id
}

/**
 * Get interaction stats for manifest optimization.
 */
export async function getInteractionStats(): Promise<{
  totalInteractions: number
  byTool: Record<string, number>
  bySystem: Record<string, number>
  avgQuality: number
}> {
  const admin = getAdmin()

  const { data: interactions } = await admin
    .from('ai_interactions')
    .select('tool_called, ai_system_identifier, interaction_quality')

  if (!interactions || interactions.length === 0) {
    return { totalInteractions: 0, byTool: {}, bySystem: {}, avgQuality: 0 }
  }

  const byTool: Record<string, number> = {}
  const bySystem: Record<string, number> = {}
  let qualitySum = 0
  let qualityCount = 0

  for (const i of interactions) {
    byTool[i.tool_called] = (byTool[i.tool_called] || 0) + 1
    bySystem[i.ai_system_identifier] = (bySystem[i.ai_system_identifier] || 0) + 1
    if (i.interaction_quality != null) {
      qualitySum += i.interaction_quality
      qualityCount++
    }
  }

  return {
    totalInteractions: interactions.length,
    byTool,
    bySystem,
    avgQuality: qualityCount > 0 ? qualitySum / qualityCount : 0,
  }
}
