'use client'

/**
 * 0n Console — Builder Hook
 *
 * Manages AI marketing builder state: assets CRUD, generation,
 * preview, and export. Fetches from /api/builder/* routes.
 */

import { useState, useCallback } from 'react'
import type { BuilderAsset, AssetType } from '@/components/console/StoreTypes'

// ─── Types ───────────────────────────────────────────────────────

export interface GenerateConfig {
  assetType: AssetType
  prompt: string
  companyName?: string
  brandColors?: { primary?: string; secondary?: string; accent?: string }
  logoUrl?: string
  style?: 'minimal' | 'bold' | 'corporate' | 'creative'
  sections?: string[]
  crmWebhook?: string
  includeCheckout?: boolean
  checkoutPrice?: number
}

interface BuilderState {
  assets: BuilderAsset[]
  loading: boolean
  generating: boolean
  currentAsset: BuilderAsset | null
  previewHtml: string | null
  error: string | null
}

// ─── Hook ────────────────────────────────────────────────────────

export function useBuilder() {
  const [state, setState] = useState<BuilderState>({
    assets: [],
    loading: false,
    generating: false,
    currentAsset: null,
    previewHtml: null,
    error: null,
  })

  // ── fetchAssets ──
  const fetchAssets = useCallback(async (type?: AssetType, status?: string) => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const params = new URLSearchParams()
      if (type) params.set('type', type)
      if (status) params.set('status', status)

      const res = await fetch(`/api/builder/assets?${params}`)
      if (!res.ok) throw new Error('Failed to fetch assets')

      const data = await res.json()
      setState((s) => ({
        ...s,
        assets: data.assets || [],
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

  // ── generateAsset ──
  const generateAsset = useCallback(async (config: GenerateConfig): Promise<BuilderAsset | null> => {
    setState((s) => ({ ...s, generating: true, error: null }))
    try {
      const res = await fetch('/api/builder/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      const data = await res.json()

      if (!res.ok) {
        const errMsg = data.error === 'insufficient_sparks'
          ? data.message || 'Insufficient Sparks'
          : data.error || 'Generation failed'
        setState((s) => ({ ...s, generating: false, error: errMsg }))
        return null
      }

      const asset = data.asset as BuilderAsset
      setState((s) => ({
        ...s,
        generating: false,
        currentAsset: asset,
        previewHtml: asset.html || null,
        assets: [asset, ...s.assets],
      }))
      return asset
    } catch (err) {
      setState((s) => ({
        ...s,
        generating: false,
        error: err instanceof Error ? err.message : 'Network error',
      }))
      return null
    }
  }, [])

  // ── getAsset ──
  const getAsset = useCallback(async (id: string): Promise<BuilderAsset | null> => {
    setState((s) => ({ ...s, loading: true, error: null }))
    try {
      const res = await fetch(`/api/builder/assets/${id}`)
      if (!res.ok) throw new Error('Asset not found')

      const data = await res.json()
      const asset = data.asset as BuilderAsset

      setState((s) => ({
        ...s,
        loading: false,
        currentAsset: asset,
        previewHtml: asset.html || null,
      }))
      return asset
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }))
      return null
    }
  }, [])

  // ── updateAsset ──
  const updateAsset = useCallback(async (
    id: string,
    updates: { title?: string; html?: string; config?: Record<string, unknown>; status?: BuilderAsset['status'] }
  ): Promise<boolean> => {
    setState((s) => ({ ...s, error: null }))
    try {
      const res = await fetch(`/api/builder/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Update failed')
      }

      const now = new Date().toISOString()

      // Update local state
      setState((s) => {
        const patch: Partial<BuilderAsset> & { updated_at: string } = { updated_at: now }
        if (updates.title !== undefined) patch.title = updates.title
        if (updates.html !== undefined) patch.html = updates.html
        if (updates.config !== undefined) patch.config = updates.config
        if (updates.status !== undefined) patch.status = updates.status

        return {
          ...s,
          assets: s.assets.map((a) =>
            a.id === id ? { ...a, ...patch } : a
          ),
          currentAsset: s.currentAsset?.id === id
            ? { ...s.currentAsset, ...patch }
            : s.currentAsset,
          previewHtml: s.currentAsset?.id === id && updates.html !== undefined
            ? updates.html
            : s.previewHtml,
        }
      })
      return true
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Update failed',
      }))
      return false
    }
  }, [])

  // ── deleteAsset ──
  const deleteAsset = useCallback(async (id: string): Promise<boolean> => {
    setState((s) => ({ ...s, error: null }))
    try {
      const res = await fetch(`/api/builder/assets/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Delete failed')

      setState((s) => ({
        ...s,
        assets: s.assets.filter((a) => a.id !== id),
        currentAsset: s.currentAsset?.id === id ? null : s.currentAsset,
        previewHtml: s.currentAsset?.id === id ? null : s.previewHtml,
      }))
      return true
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Delete failed',
      }))
      return false
    }
  }, [])

  // ── exportAsset ──
  const exportAsset = useCallback(async (
    id: string,
    format: 'html' | 'react' | 'crm_funnel' | 'crm_email'
  ): Promise<{ content: string; filename: string } | null> => {
    setState((s) => ({ ...s, error: null }))
    try {
      const res = await fetch(`/api/builder/export/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Export failed')
      }

      const data = await res.json()
      return { content: data.content, filename: data.filename }
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : 'Export failed',
      }))
      return null
    }
  }, [])

  // ── setCurrentAsset ──
  const setCurrentAsset = useCallback((asset: BuilderAsset | null) => {
    setState((s) => ({
      ...s,
      currentAsset: asset,
      previewHtml: asset?.html || null,
    }))
  }, [])

  // ── clearError ──
  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }))
  }, [])

  return {
    ...state,
    fetchAssets,
    generateAsset,
    getAsset,
    updateAsset,
    deleteAsset,
    exportAsset,
    setCurrentAsset,
    clearError,
  }
}
