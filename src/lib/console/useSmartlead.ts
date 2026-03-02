'use client'

import { useState, useCallback } from 'react'

export interface SmartleadCampaign {
  id: number
  name: string
  status: string
  created_at: string
  lead_count?: number
  sent_count?: number
  open_count?: number
  click_count?: number
  reply_count?: number
  bounce_count?: number
}

export interface SmartleadLead {
  id: number
  email: string
  first_name?: string
  last_name?: string
  company_name?: string
  status?: string
}

export interface SmartleadStats {
  total_campaigns: number
  total_leads: number
  total_sent: number
  total_opens: number
  total_clicks: number
  total_replies: number
  total_bounces: number
  open_rate: number
  click_rate: number
  reply_rate: number
  bounce_rate: number
}

export interface SmartleadEmailAccount {
  id: number
  from_email: string
  from_name: string
  warmup_enabled?: boolean
  daily_limit?: number
}

export function useSmartlead() {
  const [campaigns, setCampaigns] = useState<SmartleadCampaign[]>([])
  const [leads, setLeads] = useState<SmartleadLead[]>([])
  const [stats, setStats] = useState<SmartleadStats | null>(null)
  const [emailAccounts, setEmailAccounts] = useState<SmartleadEmailAccount[]>([])
  const [activeCampaignId, setActiveCampaignId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState<boolean | null>(null)

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/console/smartlead?action=campaigns')
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 412) { setConnected(false); return }
        throw new Error(data.error || 'Failed to fetch campaigns')
      }
      setConnected(true)
      setCampaigns(data.campaigns || [])
      setStats(data.stats || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchLeads = useCallback(async (campaignId: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/console/smartlead?action=leads&campaignId=${campaignId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch leads')
      setLeads(data.leads || [])
      setActiveCampaignId(campaignId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchEmailAccounts = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch('/api/console/smartlead?action=email_accounts')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch accounts')
      setEmailAccounts(data.accounts || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [])

  const createCampaign = useCallback(async (name: string) => {
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/console/smartlead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_campaign', name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create campaign')
      await fetchCampaigns()
      return data.campaign
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    } finally {
      setCreating(false)
    }
  }, [fetchCampaigns])

  const addLeads = useCallback(async (campaignId: number, leadList: Array<{ email: string; first_name?: string; last_name?: string; company_name?: string }>) => {
    setError(null)
    try {
      const res = await fetch('/api/console/smartlead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_leads', campaignId, leadList }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add leads')
      if (activeCampaignId === campaignId) await fetchLeads(campaignId)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }, [activeCampaignId, fetchLeads])

  const getCampaignStats = useCallback(async (campaignId: number) => {
    setError(null)
    try {
      const res = await fetch(`/api/console/smartlead?action=campaign_stats&campaignId=${campaignId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch stats')
      return data.stats
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return null
    }
  }, [])

  return {
    campaigns,
    leads,
    stats,
    emailAccounts,
    activeCampaignId,
    loading,
    creating,
    error,
    connected,
    fetchCampaigns,
    fetchLeads,
    fetchEmailAccounts,
    createCampaign,
    addLeads,
    getCampaignStats,
    setActiveCampaignId,
    setError,
  }
}
