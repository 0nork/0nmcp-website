/**
 * Command Queue — 0nCommand ↔ 0nLive Bridge
 *
 * The sync layer between offline (Claude Code) and online (Vercel).
 * Uses Supabase as a bidirectional message bus.
 *
 * Directions:
 *   to_offline  — 0nLive queues a job for 0nCommand to pick up
 *   to_live     — 0nCommand pushes results for 0nLive to consume
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ── Types ──

export type CommandDirection = 'to_offline' | 'to_live'
export type CommandStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
export type VipRole = 'vip' | 'admin' | 'owner'

export interface QueuedCommand {
  id: string
  direction: CommandDirection
  command_type: string
  payload: Record<string, unknown>
  result: Record<string, unknown> | null
  status: CommandStatus
  priority: number
  created_by: string
  vip_verified: boolean
  created_at: string
  started_at: string | null
  completed_at: string | null
  error: string | null
  retry_count: number
  max_retries: number
}

export interface SyncEntry {
  id: string
  sync_type: string
  source_table: string
  source_id: string
  content_hash: string | null
  direction: string
  status: string
  synced_at: string
}

export interface VipPermission {
  id: string
  user_id: string
  role: VipRole
  can_queue_commands: boolean
  can_trigger_training: boolean
  can_push_content: boolean
  can_view_queue: boolean
  can_cancel_commands: boolean
  granted_at: string
  expires_at: string | null
}

// ── Command Types Registry ──

export const COMMAND_TYPES = {
  // 0nLive → 0nCommand (run offline)
  'training.run': { label: 'Run Training Batch', direction: 'to_offline' as const, description: 'Execute a brain training batch in Claude Code' },
  'training.status': { label: 'Training Status', direction: 'to_offline' as const, description: 'Get current brain training status' },
  'content.generate': { label: 'Generate Content', direction: 'to_offline' as const, description: 'Generate content (blog, social, SEO) offline' },
  'persona.generate': { label: 'Generate Personas', direction: 'to_offline' as const, description: 'Run persona generation batch offline' },
  'knowledge.query': { label: 'Knowledge Query', direction: 'to_offline' as const, description: 'Deep knowledge query requiring AI reasoning' },

  // 0nCommand → 0nLive (push results)
  'knowledge.push': { label: 'Push Knowledge', direction: 'to_live' as const, description: 'Push training results to live database' },
  'content.push': { label: 'Push Content', direction: 'to_live' as const, description: 'Push generated content to live site' },
  'config.push': { label: 'Push Config', direction: 'to_live' as const, description: 'Push configuration changes to live' },
  'deploy.trigger': { label: 'Trigger Deploy', direction: 'to_live' as const, description: 'Trigger a Vercel deployment' },
} as const

export type CommandType = keyof typeof COMMAND_TYPES

// ── Admin Client ──

let _admin: SupabaseClient | null = null
function getAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _admin
}

// ── VIP Permission Check ──

export async function checkVipPermission(
  userId: string,
  permission: keyof Omit<VipPermission, 'id' | 'user_id' | 'role' | 'granted_at' | 'granted_by' | 'expires_at'>
): Promise<boolean> {
  const admin = getAdmin()
  const { data } = await admin
    .from('vip_permissions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (!data) return false

  // Check expiry
  if (data.expires_at && new Date(data.expires_at) < new Date()) return false

  // Owner bypasses all checks
  if (data.role === 'owner') return true

  return !!data[permission]
}

export async function getVipRole(userId: string): Promise<VipPermission | null> {
  const admin = getAdmin()
  const { data } = await admin
    .from('vip_permissions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  return data
}

// ── Queue Operations ──

/**
 * Create a new command in the queue.
 * VIP permission required.
 */
export async function queueCommand(
  userId: string,
  commandType: string,
  payload: Record<string, unknown>,
  opts?: { priority?: number; direction?: CommandDirection }
): Promise<QueuedCommand> {
  const admin = getAdmin()

  const typeInfo = COMMAND_TYPES[commandType as CommandType]
  const direction = opts?.direction || typeInfo?.direction || 'to_offline'

  const { data, error } = await admin
    .from('command_queue')
    .insert({
      direction,
      command_type: commandType,
      payload,
      status: 'pending',
      priority: opts?.priority || 0,
      created_by: userId,
      vip_verified: true,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to queue command: ${error.message}`)
  return data
}

/**
 * Get pending commands (for 0nCommand to pick up).
 */
export async function getPendingCommands(
  direction: CommandDirection = 'to_offline',
  limit = 10
): Promise<QueuedCommand[]> {
  const admin = getAdmin()

  const { data } = await admin
    .from('command_queue')
    .select('*')
    .eq('status', 'pending')
    .eq('direction', direction)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(limit)

  return data || []
}

/**
 * Claim a command (mark as running).
 */
export async function claimCommand(commandId: string): Promise<QueuedCommand | null> {
  const admin = getAdmin()

  const { data, error } = await admin
    .from('command_queue')
    .update({
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .eq('id', commandId)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) return null
  return data
}

/**
 * Complete a command with results.
 */
export async function completeCommand(
  commandId: string,
  result: Record<string, unknown>
): Promise<QueuedCommand> {
  const admin = getAdmin()

  const { data, error } = await admin
    .from('command_queue')
    .update({
      status: 'completed',
      result,
      completed_at: new Date().toISOString(),
    })
    .eq('id', commandId)
    .select()
    .single()

  if (error) throw new Error(`Failed to complete command: ${error.message}`)
  return data
}

/**
 * Fail a command with error.
 */
export async function failCommand(
  commandId: string,
  errorMsg: string
): Promise<void> {
  const admin = getAdmin()

  // Get current retry count
  const { data: cmd } = await admin
    .from('command_queue')
    .select('retry_count, max_retries')
    .eq('id', commandId)
    .single()

  const retryCount = (cmd?.retry_count || 0) + 1
  const maxRetries = cmd?.max_retries || 3
  const newStatus = retryCount >= maxRetries ? 'failed' : 'pending'

  await admin
    .from('command_queue')
    .update({
      status: newStatus,
      error: errorMsg,
      retry_count: retryCount,
      ...(newStatus === 'failed' ? { completed_at: new Date().toISOString() } : {}),
    })
    .eq('id', commandId)
}

/**
 * Cancel a command.
 */
export async function cancelCommand(commandId: string): Promise<void> {
  const admin = getAdmin()

  await admin
    .from('command_queue')
    .update({
      status: 'cancelled',
      completed_at: new Date().toISOString(),
    })
    .eq('id', commandId)
    .in('status', ['pending', 'running'])
}

/**
 * Get queue overview for dashboard.
 */
export async function getQueueStats(): Promise<{
  pending: number
  running: number
  completed_today: number
  failed_today: number
  recent: QueuedCommand[]
}> {
  const admin = getAdmin()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    { count: pending },
    { count: running },
    { count: completed_today },
    { count: failed_today },
    { data: recent },
  ] = await Promise.all([
    admin.from('command_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    admin.from('command_queue').select('*', { count: 'exact', head: true }).eq('status', 'running'),
    admin.from('command_queue').select('*', { count: 'exact', head: true }).eq('status', 'completed').gte('completed_at', todayStart.toISOString()),
    admin.from('command_queue').select('*', { count: 'exact', head: true }).eq('status', 'failed').gte('completed_at', todayStart.toISOString()),
    admin.from('command_queue').select('*').order('created_at', { ascending: false }).limit(20),
  ])

  return {
    pending: pending || 0,
    running: running || 0,
    completed_today: completed_today || 0,
    failed_today: failed_today || 0,
    recent: recent || [],
  }
}

// ── Sync Ledger ──

/**
 * Record a sync event.
 */
export async function recordSync(
  syncType: string,
  sourceTable: string,
  sourceId: string,
  direction: 'command_to_live' | 'live_to_command' = 'command_to_live',
  contentHash?: string
): Promise<void> {
  const admin = getAdmin()

  await admin
    .from('sync_ledger')
    .upsert({
      sync_type: syncType,
      source_table: sourceTable,
      source_id: sourceId,
      content_hash: contentHash || null,
      direction,
      status: 'synced',
      synced_at: new Date().toISOString(),
    }, { onConflict: 'source_table,source_id,direction' })
}

/**
 * Check if a record has been synced.
 */
export async function isSynced(
  sourceTable: string,
  sourceId: string,
  direction: 'command_to_live' | 'live_to_command' = 'command_to_live'
): Promise<boolean> {
  const admin = getAdmin()

  const { count } = await admin
    .from('sync_ledger')
    .select('*', { count: 'exact', head: true })
    .eq('source_table', sourceTable)
    .eq('source_id', sourceId)
    .eq('direction', direction)
    .eq('status', 'synced')

  return (count || 0) > 0
}

/**
 * Get recent sync history.
 */
export async function getSyncHistory(limit = 50): Promise<SyncEntry[]> {
  const admin = getAdmin()

  const { data } = await admin
    .from('sync_ledger')
    .select('*')
    .order('synced_at', { ascending: false })
    .limit(limit)

  return data || []
}
