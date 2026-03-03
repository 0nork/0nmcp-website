'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'

type BrainData = Record<string, unknown>

const CACHE_KEY = '0n_brain'
const DEBOUNCE_MS = 500

export function useOnCallBrain() {
  const [brain, setBrain] = useState<Record<string, BrainData>>(() => {
    if (typeof window === 'undefined') return {}
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    } catch {
      return {}
    }
  })
  const [loaded, setLoaded] = useState(false)
  const userIdRef = useRef<string | null>(null)
  const supabaseRef = useRef(createSupabaseBrowser())
  const pendingWrites = useRef<Map<string, BrainData>>(new Map())
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CACHE_KEY, JSON.stringify(brain))
    }
  }, [brain])

  // Load from Supabase
  useEffect(() => {
    let cancelled = false
    async function load() {
      const sb = supabaseRef.current
      if (!sb) return

      const { data: { user } } = await sb.auth.getUser()
      if (!user || cancelled) return
      userIdRef.current = user.id

      const { data: rows } = await sb
        .from('oncall_brain')
        .select('context_key, context_value')
        .eq('user_id', user.id)

      if (cancelled) return

      if (rows && rows.length > 0) {
        const loaded: Record<string, BrainData> = {}
        for (const row of rows) {
          loaded[row.context_key] = row.context_value as BrainData
        }
        setBrain(loaded)
      }
      setLoaded(true)
    }
    load()
    return () => { cancelled = true }
  }, [])

  // Debounced flush to Supabase
  const flushWrites = useCallback(() => {
    const sb = supabaseRef.current
    const userId = userIdRef.current
    if (!sb || !userId || pendingWrites.current.size === 0) return

    const writes = new Map(pendingWrites.current)
    pendingWrites.current.clear()

    for (const [key, value] of writes) {
      sb.from('oncall_brain')
        .upsert(
          { user_id: userId, context_key: key, context_value: value, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,context_key' }
        )
        .then(({ error }) => {
          if (error) console.error('[brain] upsert failed:', key, error)
        })
    }
  }, [])

  const scheduleFlush = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(flushWrites, DEBOUNCE_MS)
  }, [flushWrites])

  const get = useCallback((key: string): BrainData | undefined => {
    return brain[key]
  }, [brain])

  const set = useCallback((key: string, value: BrainData) => {
    setBrain(prev => ({ ...prev, [key]: value }))
    pendingWrites.current.set(key, value)
    scheduleFlush()
  }, [scheduleFlush])

  const merge = useCallback((key: string, partial: Partial<BrainData>) => {
    setBrain(prev => {
      const existing = prev[key] || {}
      const merged = { ...existing, ...partial }
      pendingWrites.current.set(key, merged)
      scheduleFlush()
      return { ...prev, [key]: merged }
    })
  }, [scheduleFlush])

  return { brain, get, set, merge, loaded }
}
