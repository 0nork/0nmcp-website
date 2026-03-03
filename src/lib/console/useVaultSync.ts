'use client'

import { useState, useCallback } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'

interface VaultSyncEntry {
  service_key: string
  encrypted_data: string
  iv: string
  salt: string
  version: number
  updated_at: string
}

/**
 * Hook for vault sync operations in the web console.
 * Handles fetching encrypted vault entries and syncing with the cloud.
 * Decryption happens client-side with Argon2id + AES-256-GCM.
 */
export function useVaultSync() {
  const [syncing, setSyncing] = useState(false)
  const [syncEntries, setSyncEntries] = useState<VaultSyncEntry[]>([])
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null)

  const fetchSyncEntries = useCallback(async (): Promise<VaultSyncEntry[]> => {
    const sb = createSupabaseBrowser()
    if (!sb) return []
    const { data: { session } } = await sb.auth.getSession()
    if (!session) return []

    try {
      const res = await fetch('/api/vault/sync', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const data = await res.json()
        const entries = data.entries || []
        setSyncEntries(entries)
        setLastSyncAt(new Date().toISOString())
        return entries
      }
    } catch {
      // Failed to fetch
    }
    return []
  }, [])

  const pushEntry = useCallback(async (
    serviceKey: string,
    encryptedData: string,
    iv: string,
    salt: string
  ) => {
    const sb = createSupabaseBrowser()
    if (!sb) return false
    const { data: { session } } = await sb.auth.getSession()
    if (!session) return false

    setSyncing(true)
    try {
      const res = await fetch('/api/vault/sync', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          service_key: serviceKey,
          encrypted_data: encryptedData,
          iv,
          salt,
        }),
      })
      setSyncing(false)
      return res.ok
    } catch {
      setSyncing(false)
      return false
    }
  }, [])

  const deleteEntry = useCallback(async (serviceKey: string) => {
    const sb = createSupabaseBrowser()
    if (!sb) return false
    const { data: { session } } = await sb.auth.getSession()
    if (!session) return false

    try {
      const res = await fetch('/api/vault/sync', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ service_key: serviceKey }),
      })
      if (res.ok) {
        setSyncEntries(prev => prev.filter(e => e.service_key !== serviceKey))
      }
      return res.ok
    } catch {
      return false
    }
  }, [])

  const hasSyncData = syncEntries.length > 0

  return {
    syncing,
    syncEntries,
    lastSyncAt,
    hasSyncData,
    fetchSyncEntries,
    pushEntry,
    deleteEntry,
  }
}
