'use client'

import { useState, useCallback } from 'react'
import type { StoreListing, PurchaseWithWorkflow, StoreCategory } from '@/components/console/StoreTypes'

interface StoreState {
  listings: StoreListing[]
  purchasedIds: string[]
  purchases: PurchaseWithWorkflow[]
  loading: boolean
  purchasesLoading: boolean
  error: string | null
}

export function useStore() {
  const [state, setState] = useState<StoreState>({
    listings: [],
    purchasedIds: [],
    purchases: [],
    loading: false,
    purchasesLoading: false,
    error: null,
  })

  const fetchListings = useCallback(async (category?: StoreCategory, search?: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const params = new URLSearchParams()
      if (category && category !== 'all') params.set('category', category)
      if (search) params.set('search', search)

      const res = await fetch(`/api/console/store?${params}`)
      if (!res.ok) throw new Error('Failed to fetch store')

      const data = await res.json()
      setState((s) => ({
        ...s,
        listings: data.listings || [],
        purchasedIds: data.purchasedListingIds || [],
        loading: false,
      }))
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }))
    }
  }, [])

  const fetchPurchases = useCallback(async () => {
    setState((s) => ({ ...s, purchasesLoading: true }))
    try {
      const res = await fetch('/api/console/store/purchases')
      if (!res.ok) throw new Error('Failed to fetch purchases')

      const data = await res.json()
      setState((s) => ({
        ...s,
        purchases: data.purchases || [],
        purchasesLoading: false,
      }))
    } catch {
      setState((s) => ({ ...s, purchasesLoading: false }))
    }
  }, [])

  const checkout = useCallback(async (listingId: string): Promise<{ free?: boolean; url?: string; error?: string }> => {
    try {
      const res = await fetch('/api/console/store/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      })

      const data = await res.json()

      if (!res.ok) return { error: data.error || 'Checkout failed' }

      if (data.free) {
        // Refresh listings to update owned state
        await fetchListings()
        await fetchPurchases()
        return { free: true }
      }

      return { url: data.url }
    } catch {
      return { error: 'Network error' }
    }
  }, [fetchListings, fetchPurchases])

  const download = useCallback(async (workflowId: string): Promise<{ workflow?: unknown; filename?: string; error?: string }> => {
    try {
      const res = await fetch('/api/console/store/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId }),
      })

      const data = await res.json()
      if (!res.ok) return { error: data.error || 'Download failed' }

      return { workflow: data.workflow, filename: data.filename }
    } catch {
      return { error: 'Network error' }
    }
  }, [])

  return {
    ...state,
    fetchListings,
    fetchPurchases,
    checkout,
    download,
  }
}
