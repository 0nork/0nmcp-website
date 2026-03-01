'use client'

/**
 * 0n Console — Operations Hook
 *
 * Supabase `user_console_operations` is the single source of truth.
 * localStorage is a per-user read-through cache for instant hydration.
 *
 * Pattern: optimistic updates — state changes immediately, Supabase
 * persists asynchronously (fire-and-forget).
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'

// ─── Types ───────────────────────────────────────────────────────

export interface Operation {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'error'
  trigger: string
  actions: string[]
  services: string[]
  notifications: string[]
  frequency: string | null
  workflowData: Record<string, unknown>
  lastRun: string | null
  runCount: number
  createdAt: string
  errorMessage?: string
}

// DB row shape returned by Supabase SELECT
interface OperationRow {
  id: string
  user_id: string
  name: string
  description: string | null
  status: string
  trigger: string
  actions: string[] | null
  services: string[] | null
  notifications: string[] | null
  frequency: string | null
  workflow_data: Record<string, unknown> | null
  last_run: string | null
  run_count: number
  error_message: string | null
  created_at: string
  updated_at: string
}

// ─── Constants ───────────────────────────────────────────────────

const MAX_OPERATIONS = 50
const CACHE_PREFIX = '0n_operations_'

// ─── Helpers ─────────────────────────────────────────────────────

function cacheKey(userId: string): string {
  return `${CACHE_PREFIX}${userId}`
}

function loadCache(userId: string): Operation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(cacheKey(userId))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveCache(userId: string, ops: Operation[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(cacheKey(userId), JSON.stringify(ops))
  } catch {
    // localStorage full or unavailable — silent
  }
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

/** Map a Supabase row to the client-side Operation interface */
function rowToOperation(row: OperationRow): Operation {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    status: (row.status as Operation['status']) || 'active',
    trigger: row.trigger,
    actions: row.actions ?? [],
    services: row.services ?? [],
    notifications: row.notifications ?? [],
    frequency: row.frequency ?? null,
    workflowData: row.workflow_data ?? {},
    lastRun: row.last_run ?? null,
    runCount: row.run_count ?? 0,
    createdAt: row.created_at,
    errorMessage: row.error_message ?? undefined,
  }
}

// ─── Hook ────────────────────────────────────────────────────────

export function useOperations() {
  const [operations, setOperations] = useState<Operation[]>([])

  const supabaseRef = useRef(createSupabaseBrowser())
  const userIdRef = useRef<string | null>(null)

  // ── Sync localStorage cache whenever operations change ──
  useEffect(() => {
    const uid = userIdRef.current
    if (uid && operations.length >= 0) {
      saveCache(uid, operations)
    }
  }, [operations])

  // ── Load from Supabase on mount, fallback to cache ──
  useEffect(() => {
    let cancelled = false

    async function load() {
      const sb = supabaseRef.current
      if (!sb) return

      const {
        data: { user },
      } = await sb.auth.getUser()

      if (!user || cancelled) return
      userIdRef.current = user.id

      // Hydrate from cache immediately for fast paint
      const cached = loadCache(user.id)
      if (cached.length > 0 && !cancelled) {
        setOperations(cached)
      }

      // Then fetch authoritative data from Supabase
      const { data: rows, error } = await sb
        .from('user_console_operations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(MAX_OPERATIONS)

      if (cancelled) return

      if (error) {
        // Supabase failed — keep cache data (already set above)
        console.warn('[useOperations] Supabase load failed, using cache:', error.message)
        return
      }

      const ops = (rows as OperationRow[]).map(rowToOperation)
      setOperations(ops)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  // ── add ──
  const add = useCallback(
    (op: Omit<Operation, 'id' | 'createdAt' | 'lastRun' | 'runCount' | 'status'>) => {
      const newOp: Operation = {
        ...op,
        id: generateId(),
        status: 'active' as const,
        lastRun: null,
        runCount: 0,
        createdAt: new Date().toISOString(),
      }

      // Optimistic update
      setOperations((prev) => [newOp, ...prev].slice(0, MAX_OPERATIONS))

      // Persist to Supabase
      const sb = supabaseRef.current
      const userId = userIdRef.current
      if (sb && userId) {
        sb.from('user_console_operations')
          .insert({
            id: newOp.id,
            user_id: userId,
            name: newOp.name,
            description: newOp.description,
            status: newOp.status,
            trigger: newOp.trigger,
            actions: newOp.actions,
            services: newOp.services,
            notifications: newOp.notifications,
            frequency: newOp.frequency,
            workflow_data: newOp.workflowData,
            last_run: newOp.lastRun,
            run_count: newOp.runCount,
            error_message: newOp.errorMessage ?? null,
            created_at: newOp.createdAt,
            updated_at: newOp.createdAt,
          })
          .then(({ error }) => {
            if (error) console.warn('[useOperations] insert failed:', error.message)
          })
      }
    },
    [],
  )

  // ── remove ──
  const remove = useCallback((id: string) => {
    // Optimistic update
    setOperations((prev) => prev.filter((o) => o.id !== id))

    // Delete from Supabase
    const sb = supabaseRef.current
    if (sb) {
      sb.from('user_console_operations')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('[useOperations] delete failed:', error.message)
        })
    }
  }, [])

  // ── pause ──
  const pause = useCallback((id: string) => {
    // Optimistic update
    setOperations((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'paused' as const } : o)),
    )

    // Persist to Supabase
    const sb = supabaseRef.current
    if (sb) {
      sb.from('user_console_operations')
        .update({ status: 'paused', updated_at: new Date().toISOString() })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('[useOperations] pause failed:', error.message)
        })
    }
  }, [])

  // ── resume ──
  const resume = useCallback((id: string) => {
    // Optimistic update
    setOperations((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: 'active' as const, errorMessage: undefined } : o,
      ),
    )

    // Persist to Supabase
    const sb = supabaseRef.current
    if (sb) {
      sb.from('user_console_operations')
        .update({
          status: 'active',
          error_message: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('[useOperations] resume failed:', error.message)
        })
    }
  }, [])

  // ── updateStatus ──
  const updateStatus = useCallback(
    (id: string, status: Operation['status'], errorMessage?: string) => {
      // Optimistic update
      setOperations((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status, errorMessage } : o)),
      )

      // Persist to Supabase
      const sb = supabaseRef.current
      if (sb) {
        sb.from('user_console_operations')
          .update({
            status,
            error_message: errorMessage ?? null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .then(({ error }) => {
            if (error) console.warn('[useOperations] updateStatus failed:', error.message)
          })
      }
    },
    [],
  )

  // ── incrementRun ──
  const incrementRun = useCallback((id: string) => {
    const now = new Date().toISOString()

    // Optimistic update
    setOperations((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, runCount: o.runCount + 1, lastRun: now } : o,
      ),
    )

    // Persist to Supabase — use rpc-style increment via raw update
    // We read the current value from state and write count+1, which is
    // safe for single-user since we are the only writer for our own ops.
    const sb = supabaseRef.current
    if (sb) {
      // Find the current count from the optimistic state
      // (already incremented), so we write it directly.
      setOperations((current) => {
        const op = current.find((o) => o.id === id)
        if (op) {
          sb.from('user_console_operations')
            .update({
              run_count: op.runCount,
              last_run: now,
              updated_at: now,
            })
            .eq('id', id)
            .then(({ error }) => {
              if (error) console.warn('[useOperations] incrementRun failed:', error.message)
            })
        }
        return current // no state change — just reading
      })
    }
  }, [])

  // ── getById ──
  const getById = useCallback(
    (id: string): Operation | undefined => {
      return operations.find((o) => o.id === id)
    },
    [operations],
  )

  return {
    operations,
    add,
    remove,
    pause,
    resume,
    updateStatus,
    incrementRun,
    getById,
  }
}
