import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function logStage(
  subLocationId: string,
  stage: string,
  status: 'started' | 'completed' | 'failed',
  durationMs?: number,
  error?: string
) {
  await supabase.from('brand_generation_log').insert({
    sub_location_id: subLocationId,
    mode: 'pipeline',
    stage,
    status,
    duration_ms: durationMs,
    error_message: error,
  })
}
