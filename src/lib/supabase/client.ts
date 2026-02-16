import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export function createSupabaseBrowser() {
  if (!isSupabaseConfigured) return null
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
