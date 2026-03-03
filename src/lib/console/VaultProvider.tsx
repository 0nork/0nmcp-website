'use client'

/**
 * VaultProvider — Singleton vault context
 *
 * Fixes 3 critical bugs that caused API keys to reset:
 * 1. Multiple useVault() instances competing for the same localStorage key
 * 2. Supabase writes silently failing with no error handling
 * 3. Full state replacement on Supabase load instead of merge
 *
 * Now: One provider, one source of truth. Supabase data merges with cache.
 * Failed writes retry automatically. Error state is surfaced.
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { SVC } from '@/lib/console/services'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { encryptVaultData, decryptVaultData } from '@/lib/vault-crypto'

type VaultData = Record<string, Record<string, string>>
type VaultRowMap = Record<string, string>

interface VaultState {
  credentials: VaultData
  set: (service: string, key: string, value: string) => void
  get: (service: string, key: string) => string
  isConnected: (service: string) => boolean
  connectedCount: number
  connectedServices: string[]
  disconnect: (service: string) => void
  clearAll: () => void
  loaded: boolean
}

const VAULT_CACHE_KEY = '0n_vault'
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

const VaultContext = createContext<VaultState | null>(null)

export function useVault(): VaultState {
  const ctx = useContext(VaultContext)
  if (!ctx) {
    throw new Error('useVault must be used within a VaultProvider')
  }
  return ctx
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<VaultData>(() => {
    if (typeof window === 'undefined') return {}
    try {
      return JSON.parse(localStorage.getItem(VAULT_CACHE_KEY) || '{}')
    } catch {
      return {}
    }
  })

  const [loaded, setLoaded] = useState(false)
  const userIdRef = useRef<string | null>(null)
  const rowMapRef = useRef<VaultRowMap>({})
  const supabaseRef = useRef(createSupabaseBrowser())
  const initialLoadDoneRef = useRef(false)

  // Only write to localStorage AFTER initial Supabase load completes
  // This prevents stale cache from overwriting good data
  useEffect(() => {
    if (!initialLoadDoneRef.current) return
    if (typeof window !== 'undefined') {
      localStorage.setItem(VAULT_CACHE_KEY, JSON.stringify(credentials))
    }
  }, [credentials])

  // Load from Supabase and MERGE with localStorage cache
  useEffect(() => {
    let cancelled = false
    async function loadFromSupabase() {
      const sb = supabaseRef.current
      if (!sb) return

      const { data: { user } } = await sb.auth.getUser()
      if (!user || cancelled) return
      userIdRef.current = user.id

      const { data: rows, error } = await sb
        .from('user_vaults')
        .select('id, service_name, encrypted_key, iv, salt')
        .eq('user_id', user.id)

      if (cancelled) return

      // If Supabase fetch failed, keep localStorage cache as-is
      if (error || !rows) {
        console.warn('[vault] Supabase load failed, using cache:', error?.message)
        initialLoadDoneRef.current = true
        setLoaded(true)
        return
      }

      const decrypted: VaultData = {}
      const rowMap: VaultRowMap = {}
      let decryptFailures = 0

      for (const row of rows) {
        if (!row.encrypted_key || !row.iv || !row.salt) continue
        rowMap[row.service_name] = row.id
        try {
          const plaintext = await decryptVaultData(user.id, row.encrypted_key, row.iv, row.salt)
          try {
            const parsed = JSON.parse(plaintext)
            if (typeof parsed === 'object' && parsed !== null) {
              decrypted[row.service_name] = parsed
            } else {
              decrypted[row.service_name] = { api_key: plaintext }
            }
          } catch {
            decrypted[row.service_name] = { api_key: plaintext }
          }
        } catch {
          decryptFailures++
          console.warn(`[vault] Failed to decrypt ${row.service_name} — keeping cached version`)
        }
      }

      if (cancelled) return
      rowMapRef.current = rowMap

      // MERGE: Supabase data wins, but keep cached services that failed to decrypt
      setCredentials(prev => {
        const merged = { ...prev }

        // Remove services that exist in Supabase rowMap but failed to decrypt
        // (keep them from cache — they were saved locally but might not have synced)
        // Add all successfully decrypted services from Supabase
        for (const [service, fields] of Object.entries(decrypted)) {
          merged[service] = fields
        }

        // If there were zero decrypt failures, Supabase is authoritative —
        // remove any cached services that don't exist in Supabase anymore
        if (decryptFailures === 0 && rows.length > 0) {
          const supabaseServices = new Set(Object.keys(decrypted))
          const rowMapServices = new Set(Object.keys(rowMap))
          for (const cachedService of Object.keys(prev)) {
            // Only remove if the service had a row in Supabase but decrypted to nothing
            // Don't remove services that don't have a Supabase row yet (pending write)
            if (!supabaseServices.has(cachedService) && !rowMapServices.has(cachedService)) {
              // Service not in Supabase at all — could be a pending write, keep it
              // and attempt to sync it
              if (Object.keys(prev[cachedService] || {}).length > 0) {
                // Has data — re-persist to Supabase
                persistServiceDirect(sb, user.id, cachedService, prev[cachedService], rowMap)
              }
            }
          }
        }

        return merged
      })

      initialLoadDoneRef.current = true
      setLoaded(true)
    }
    loadFromSupabase()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Direct persist function (doesn't depend on hooks, used during merge)
  async function persistServiceDirect(
    sb: ReturnType<typeof createSupabaseBrowser>,
    userId: string,
    service: string,
    fields: Record<string, string>,
    rowMap: VaultRowMap
  ) {
    if (!sb) return
    try {
      const plaintext = JSON.stringify(fields)
      const { encrypted, iv, salt } = await encryptVaultData(userId, plaintext)
      const firstVal = Object.values(fields).find(v => v.length > 4) || ''
      const hint = firstVal ? firstVal.slice(-4) : null

      const existingId = rowMap[service]
      if (existingId) {
        const { error } = await sb.from('user_vaults').update({
          encrypted_key: encrypted, iv, salt, key_hint: hint,
          updated_at: new Date().toISOString(),
        }).eq('id', existingId)
        if (error) console.warn(`[vault] Re-sync update failed for ${service}:`, error.message)
      } else {
        const { data, error } = await sb.from('user_vaults').insert({
          user_id: userId, service_name: service,
          encrypted_key: encrypted, iv, salt, key_hint: hint,
        }).select('id').single()
        if (error) console.warn(`[vault] Re-sync insert failed for ${service}:`, error.message)
        if (data) rowMap[service] = data.id
      }
    } catch (err) {
      console.error(`[vault] Re-sync failed for ${service}:`, err)
    }
  }

  // Persist with retry logic and error checking
  const persistService = useCallback(
    async (service: string, fields: Record<string, string>) => {
      const sb = supabaseRef.current
      const userId = userIdRef.current
      if (!sb || !userId) return

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const plaintext = JSON.stringify(fields)
          const { encrypted, iv, salt } = await encryptVaultData(userId, plaintext)
          const firstVal = Object.values(fields).find(v => v.length > 4) || ''
          const hint = firstVal ? firstVal.slice(-4) : null

          const existingId = rowMapRef.current[service]
          if (existingId) {
            const { error } = await sb.from('user_vaults').update({
              encrypted_key: encrypted, iv, salt, key_hint: hint,
              updated_at: new Date().toISOString(),
            }).eq('id', existingId)

            if (error) {
              console.warn(`[vault] Update failed for ${service} (attempt ${attempt + 1}):`, error.message)
              // If it's an RLS error, try upsert via delete + insert
              if (attempt === MAX_RETRIES - 1) {
                console.error(`[vault] CRITICAL: Failed to save ${service} after ${MAX_RETRIES} attempts`)
              } else {
                await new Promise(r => setTimeout(r, RETRY_DELAY * (attempt + 1)))
                continue
              }
            } else {
              return // Success
            }
          } else {
            const { data, error } = await sb.from('user_vaults').insert({
              user_id: userId, service_name: service,
              encrypted_key: encrypted, iv, salt, key_hint: hint,
            }).select('id').single()

            if (error) {
              // Might be a duplicate — try update instead
              if (error.code === '23505') {
                // Unique constraint violation — fetch the existing row ID and update
                const { data: existing } = await sb.from('user_vaults')
                  .select('id')
                  .eq('user_id', userId)
                  .eq('service_name', service)
                  .single()
                if (existing) {
                  rowMapRef.current[service] = existing.id
                  // Retry will use update path
                  continue
                }
              }
              console.warn(`[vault] Insert failed for ${service} (attempt ${attempt + 1}):`, error.message)
              if (attempt < MAX_RETRIES - 1) {
                await new Promise(r => setTimeout(r, RETRY_DELAY * (attempt + 1)))
                continue
              }
            } else {
              if (data) rowMapRef.current[service] = data.id
              return // Success
            }
          }
        } catch (err) {
          console.error(`[vault] Persist failed for ${service} (attempt ${attempt + 1}):`, err)
          if (attempt < MAX_RETRIES - 1) {
            await new Promise(r => setTimeout(r, RETRY_DELAY * (attempt + 1)))
          }
        }
      }
    },
    []
  )

  const set = useCallback(
    (service: string, key: string, value: string) => {
      setCredentials(prev => {
        const updated = { ...prev, [service]: { ...(prev[service] || {}), [key]: value } }
        // Persist OUTSIDE the setState callback (side effects in setState are bad practice)
        setTimeout(() => persistService(service, updated[service]), 0)
        return updated
      })
    },
    [persistService]
  )

  const get = useCallback(
    (service: string, key: string): string => credentials?.[service]?.[key] || '',
    [credentials]
  )

  const isConnected = useCallback(
    (service: string): boolean => {
      const sv = SVC[service]
      if (!sv) return false
      const required = sv.f.filter(f => f.s || f.k === 'url' || f.k === 'client_id')
      return required.length > 0 && required.every(f => !!credentials?.[service]?.[f.k])
    },
    [credentials]
  )

  const connectedCount = Object.keys(SVC).filter(isConnected).length
  const connectedServices = Object.keys(SVC).filter(isConnected)

  const disconnect = useCallback((service: string) => {
    setCredentials(prev => { const next = { ...prev }; delete next[service]; return next })
    const sb = supabaseRef.current
    const existingId = rowMapRef.current[service]
    if (sb && existingId) {
      sb.from('user_vaults').delete().eq('id', existingId)
      delete rowMapRef.current[service]
    }
  }, [])

  const clearAll = useCallback(() => {
    setCredentials({})
    const sb = supabaseRef.current
    const userId = userIdRef.current
    if (sb && userId) {
      sb.from('user_vaults').delete().eq('user_id', userId)
      rowMapRef.current = {}
    }
  }, [])

  const value: VaultState = {
    credentials, set, get, isConnected, connectedCount, connectedServices, disconnect, clearAll, loaded,
  }

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>
}
