'use client'

import { useState, useCallback } from 'react'
import type { VendorProfile, VendorTransaction, VendorPayout } from '@/components/console/StoreTypes'

export interface VendorListing {
  id: string
  title: string
  slug: string
  description: string | null
  category: string
  tags: string[]
  price: number
  currency: string
  cover_image_url: string | null
  asset_type: string
  services: string[]
  status: 'active' | 'draft' | 'archived'
  total_purchases: number
  vendor_id: string
  stripe_product_id: string | null
  stripe_price_id: string | null
  created_at: string
  updated_at: string
}

export type VendorStatus =
  | 'not_vendor'
  | 'applied'
  | 'approved_needs_onboarding'
  | 'active'

interface VendorState {
  vendor: VendorProfile | null
  listings: VendorListing[]
  transactions: VendorTransaction[]
  payouts: VendorPayout[]
  loading: boolean
  vendorStatus: VendorStatus
}

export function useVendor() {
  const [state, setState] = useState<VendorState>({
    vendor: null,
    listings: [],
    transactions: [],
    payouts: [],
    loading: false,
    vendorStatus: 'not_vendor',
  })

  const resolveStatus = (profile: VendorProfile | null): VendorStatus => {
    if (!profile) return 'not_vendor'
    if (!profile.is_approved) return 'applied'
    if (!profile.charges_enabled) return 'approved_needs_onboarding'
    return 'active'
  }

  // ── Dashboard ──

  const fetchDashboard = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }))
    try {
      const res = await fetch('/api/vendor/dashboard')
      if (!res.ok) {
        // No vendor profile yet
        if (res.status === 404) {
          setState((s) => ({
            ...s,
            vendor: null,
            vendorStatus: 'not_vendor',
            loading: false,
          }))
          return
        }
        throw new Error('Failed to fetch vendor dashboard')
      }

      const data = await res.json()
      const vendor: VendorProfile = data.profile
      setState((s) => ({
        ...s,
        vendor,
        transactions: data.recentTransactions || [],
        payouts: data.payouts || [],
        vendorStatus: resolveStatus(vendor),
        loading: false,
      }))
    } catch {
      setState((s) => ({ ...s, loading: false }))
    }
  }, [])

  // ── Listings ──

  const fetchListings = useCallback(async (status?: string) => {
    setState((s) => ({ ...s, loading: true }))
    try {
      const params = new URLSearchParams()
      if (status) params.set('status', status)

      const res = await fetch(`/api/vendor/listings?${params}`)
      if (!res.ok) throw new Error('Failed to fetch listings')

      const data = await res.json()
      setState((s) => ({
        ...s,
        listings: data.listings || [],
        loading: false,
      }))
    } catch {
      setState((s) => ({ ...s, loading: false }))
    }
  }, [])

  const createListing = useCallback(async (listingData: {
    title: string
    description: string
    category: string
    asset_type: string
    price: number
    tags: string[]
    services: string[]
    cover_image_url?: string
    status?: 'draft' | 'active'
  }): Promise<{ listing?: VendorListing; error?: string }> => {
    try {
      const res = await fetch('/api/vendor/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(listingData),
      })

      const data = await res.json()
      if (!res.ok) return { error: data.error || 'Failed to create listing' }

      // Refresh listings
      await fetchListings()
      return { listing: data.listing }
    } catch {
      return { error: 'Network error' }
    }
  }, [fetchListings])

  const updateListing = useCallback(async (
    id: string,
    updates: Partial<{
      title: string
      description: string
      category: string
      asset_type: string
      price: number
      tags: string[]
      services: string[]
      cover_image_url: string
    }>
  ): Promise<{ listing?: VendorListing; error?: string }> => {
    try {
      const res = await fetch(`/api/vendor/listings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const data = await res.json()
      if (!res.ok) return { error: data.error || 'Failed to update listing' }

      await fetchListings()
      return { listing: data.listing }
    } catch {
      return { error: 'Network error' }
    }
  }, [fetchListings])

  const deleteListing = useCallback(async (id: string): Promise<{ error?: string }> => {
    try {
      const res = await fetch(`/api/vendor/listings/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        return { error: data.error || 'Failed to delete listing' }
      }

      await fetchListings()
      return {}
    } catch {
      return { error: 'Network error' }
    }
  }, [fetchListings])

  const publishListing = useCallback(async (id: string): Promise<{ error?: string }> => {
    try {
      const res = await fetch(`/api/vendor/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish' }),
      })

      if (!res.ok) {
        const data = await res.json()
        return { error: data.error || 'Failed to publish listing' }
      }

      await fetchListings()
      return {}
    } catch {
      return { error: 'Network error' }
    }
  }, [fetchListings])

  const unpublishListing = useCallback(async (id: string): Promise<{ error?: string }> => {
    try {
      const res = await fetch(`/api/vendor/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unpublish' }),
      })

      if (!res.ok) {
        const data = await res.json()
        return { error: data.error || 'Failed to unpublish listing' }
      }

      await fetchListings()
      return {}
    } catch {
      return { error: 'Network error' }
    }
  }, [fetchListings])

  // ── Vendor Application & Stripe Connect ──

  const applyAsVendor = useCallback(async (
    businessName: string,
    businessType: string
  ): Promise<{ error?: string }> => {
    setState((s) => ({ ...s, loading: true }))
    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply',
          business_name: businessName,
          business_type: businessType,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setState((s) => ({ ...s, loading: false }))
        return { error: data.error || 'Application failed' }
      }

      // Refresh to get updated status
      await fetchDashboard()
      return {}
    } catch {
      setState((s) => ({ ...s, loading: false }))
      return { error: 'Network error' }
    }
  }, [fetchDashboard])

  const getOnboardingLink = useCallback(async (): Promise<{ url?: string; error?: string }> => {
    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'onboarding_link' }),
      })

      const data = await res.json()
      if (!res.ok) return { error: data.error || 'Failed to get onboarding link' }

      return { url: data.url }
    } catch {
      return { error: 'Network error' }
    }
  }, [])

  const getDashboardLink = useCallback(async (): Promise<{ url?: string; error?: string }> => {
    try {
      const res = await fetch('/api/stripe/connect?action=dashboard')
      const data = await res.json()
      if (!res.ok) return { error: data.error || 'Failed to get dashboard link' }

      return { url: data.url }
    } catch {
      return { error: 'Network error' }
    }
  }, [])

  return {
    ...state,
    fetchDashboard,
    fetchListings,
    createListing,
    updateListing,
    deleteListing,
    publishListing,
    unpublishListing,
    applyAsVendor,
    getOnboardingLink,
    getDashboardLink,
  }
}
