/**
 * Universal tool call logger — logs to canva_tool_calls
 * Sanitizes input to redact tokens/secrets before storing
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function logToolCall(
  subLocationId: string,
  toolName: string,
  input: unknown,
  output: unknown,
  status: 'success' | 'failed',
  errorMessage: string | null,
  durationMs: number,
  context?: string
) {
  const safeInput = JSON.parse(JSON.stringify(input ?? {}, (key, val) => {
    if (typeof val === 'string' && (key.includes('token') || key.includes('secret') || key.includes('key'))) {
      return '[REDACTED]'
    }
    return val
  }))

  await supabase.from('canva_tool_calls').insert({
    sub_location_id: subLocationId,
    tool_name: toolName,
    input_params: safeInput,
    output: output ?? null,
    status,
    error_message: errorMessage,
    duration_ms: durationMs,
    cost_usd: 0.01,
    context: context ?? 'unknown',
  })
}
