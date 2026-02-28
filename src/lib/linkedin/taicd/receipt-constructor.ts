import { createClient } from '@supabase/supabase-js'
import type { ExecutionReceipt } from '@/lib/linkedin/types'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Build an execution receipt for a tool call.
 * Receipts are returned to the calling AI system as proof of execution.
 */
export function buildReceipt(params: {
  toolName: string
  memberId: string
  inputSummary: Record<string, unknown>
  outputSummary: Record<string, unknown>
  executionTimeMs: number
  success: boolean
  followUp?: string
}): ExecutionReceipt {
  return {
    receipt_id: `rcpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    tool_name: params.toolName,
    member_id: params.memberId,
    timestamp: new Date().toISOString(),
    input_summary: params.inputSummary,
    output_summary: params.outputSummary,
    execution_time_ms: params.executionTimeMs,
    success: params.success,
    follow_up: params.followUp || null,
  }
}

/**
 * Log a tool call to the database and return a receipt.
 */
export async function logToolCall(params: {
  toolName: string
  memberId: string | null
  inputParams: Record<string, unknown>
  outputResult: Record<string, unknown>
  executionTimeMs: number
  success: boolean
  errorMessage?: string
  followUp?: string
}): Promise<ExecutionReceipt> {
  const admin = getAdmin()

  // Insert tool call log
  await admin.from('linkedin_tool_calls').insert({
    tool_name: params.toolName,
    member_id: params.memberId,
    input_params: params.inputParams,
    output_result: params.outputResult,
    execution_time_ms: params.executionTimeMs,
    success: params.success,
    error_message: params.errorMessage || null,
  })

  // Build and return receipt
  return buildReceipt({
    toolName: params.toolName,
    memberId: params.memberId || 'anonymous',
    inputSummary: params.inputParams,
    outputSummary: params.outputResult,
    executionTimeMs: params.executionTimeMs,
    success: params.success,
    followUp: params.followUp,
  })
}

/**
 * Get recent tool call receipts for a member.
 */
export async function getRecentReceipts(memberId: string, limit: number = 10) {
  const admin = getAdmin()

  const { data } = await admin
    .from('linkedin_tool_calls')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return (data || []).map(call => buildReceipt({
    toolName: call.tool_name,
    memberId: call.member_id,
    inputSummary: call.input_params,
    outputSummary: call.output_result,
    executionTimeMs: call.execution_time_ms,
    success: call.success,
  }))
}
