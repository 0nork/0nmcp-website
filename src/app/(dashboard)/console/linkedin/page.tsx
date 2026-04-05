'use client'

import { useState, useEffect, useCallback } from 'react'

/* ──────────────────────────────────────────────
   Types
   ────────────────────────────────────────────── */

type Tab = 'overview' | 'posts' | 'ads' | 'analytics' | 'organization'

interface AccountData {
  id: string
  linkedin_id: string
  name: string | null
  email: string | null
  headline: string | null
  profile_url: string | null
  profile_photo: string | null
  scopes: string[] | null
  org_ids: string[] | null
  connected_at: string
}

interface PostData {
  id: string
  author_type: string
  author_id: string
  content: string
  media_urls: string[] | null
  post_id: string | null
  status: string
  scheduled_at: string | null
  published_at: string | null
  engagement: Record<string, number> | null
  created_at: string
}

interface AdAccountData {
  id: string
  ad_account_id: string
  name: string | null
  status: string | null
  currency: string
}

interface CampaignData {
  id: string
  campaign_id: string
  name: string
  status: string
  type: string | null
  objective: string | null
  daily_budget: number | null
  total_budget: number | null
  start_date: string | null
  end_date: string | null
}

interface AnalyticsData {
  entity_type: string
  entity_id: string
  date: string
  impressions: number
  clicks: number
  spend: number
  conversions: number
  engagement_rate: number | null
  ctr: number | null
  cpc: number | null
  cpm: number | null
  leads: number
  followers_gained: number
  shares: number
  comments: number
  reactions: number
}

interface OrgData {
  id: string
  name: string
  follower_count: number
  page_views: number
  unique_visitors: number
}

/* ──────────────────────────────────────────────
   Styles
   ────────────────────────────────────────────── */

const LI_BLUE = '#0077b5'
const LI_BLUE_LIGHT = '#0077b510'
const GREEN = '#6EE05A'

const card: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: '1.5rem',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)',
}

const cardHover: React.CSSProperties = {
  ...card,
  transition: 'box-shadow 0.2s, transform 0.2s',
}

const btnPrimary: React.CSSProperties = {
  padding: '0.55rem 1.5rem',
  borderRadius: 10,
  border: 'none',
  background: LI_BLUE,
  color: 'var(--text-primary)',
  fontSize: '0.82rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'opacity 0.15s',
}

const btnSecondary: React.CSSProperties = {
  padding: '0.55rem 1.5rem',
  borderRadius: 10,
  border: '1px solid var(--border)',
  background: 'var(--bg-card)',
  color: 'var(--text-primary)',
  fontSize: '0.82rem',
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'background 0.15s',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.85rem',
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  color: 'var(--text-primary)',
  fontFamily: 'inherit',
  fontSize: '0.85rem',
  outline: 'none',
  transition: 'border-color 0.15s',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  width: 'auto',
  minWidth: 160,
  appearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 0.75rem center',
  paddingRight: '2rem',
}

const badge = (color: string, bg: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '0.2rem 0.6rem',
  borderRadius: 20,
  fontSize: '0.68rem',
  fontWeight: 600,
  color,
  background: bg,
})

const statLabel: React.CSSProperties = {
  fontSize: '0.7rem',
  color: '#6b7280',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  fontWeight: 600,
  margin: 0,
}

const statValue = (color: string): React.CSSProperties => ({
  fontSize: '1.75rem',
  fontWeight: 700,
  color,
  margin: '0.25rem 0 0',
  lineHeight: 1,
})

/* ──────────────────────────────────────────────
   Component
   ────────────────────────────────────────────── */

export default function LinkedInSuitePage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [accounts, setAccounts] = useState<AccountData[]>([])
  const [loading, setLoading] = useState(true)

  // Posts state
  const [posts, setPosts] = useState<PostData[]>([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [newPost, setNewPost] = useState({ content: '', authorType: 'member', scheduledAt: '' })
  const [publishing, setPublishing] = useState(false)

  // Ads state
  const [adAccounts, setAdAccounts] = useState<AdAccountData[]>([])
  const [selectedAdAccount, setSelectedAdAccount] = useState('')
  const [campaigns, setCampaigns] = useState<CampaignData[]>([])
  const [campaignsLoading, setCampaignsLoading] = useState(false)
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [campaignForm, setCampaignForm] = useState({
    name: '', type: 'SPONSORED_UPDATES', objective: 'BRAND_AWARENESS', dailyBudget: '', status: 'DRAFT',
  })
  const [creatingCampaign, setCreatingCampaign] = useState(false)

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([])
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })
  const [entityFilter, setEntityFilter] = useState<'campaign' | 'creative' | 'account' | 'org_page'>('campaign')

  // Org state
  const [orgs, setOrgs] = useState<OrgData[]>([])
  const [orgsLoading, setOrgsLoading] = useState(false)

  /* ── Data fetching ── */

  useEffect(() => {
    fetch('/api/linkedin/suite/accounts')
      .then(r => r.ok ? r.json() : { accounts: [] })
      .then(d => setAccounts(d.accounts || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Posts
  useEffect(() => {
    if (tab !== 'posts' || accounts.length === 0) return
    setPostsLoading(true)
    fetch('/api/linkedin/suite/posts')
      .then(r => r.ok ? r.json() : { posts: [] })
      .then(d => setPosts(d.posts || []))
      .catch(() => {})
      .finally(() => setPostsLoading(false))
  }, [tab, accounts.length])

  // Ad accounts
  useEffect(() => {
    if (tab !== 'ads' || accounts.length === 0 || adAccounts.length > 0) return
    fetch('/api/linkedin/suite/ad-accounts')
      .then(r => r.ok ? r.json() : { adAccounts: [] })
      .then(d => {
        const items = d.adAccounts || []
        setAdAccounts(items)
        if (items.length > 0 && !selectedAdAccount) setSelectedAdAccount(items[0].id)
      })
      .catch(() => {})
  }, [tab, accounts.length, adAccounts.length, selectedAdAccount])

  // Campaigns
  const fetchCampaigns = useCallback(async (adAccountId: string) => {
    setCampaignsLoading(true)
    try {
      const res = await fetch(`/api/linkedin/suite/campaigns?adAccountId=${adAccountId}`)
      const data = res.ok ? await res.json() : { campaigns: [] }
      setCampaigns(data.campaigns || [])
    } catch { setCampaigns([]) }
    setCampaignsLoading(false)
  }, [])

  useEffect(() => {
    if (selectedAdAccount && tab === 'ads') fetchCampaigns(selectedAdAccount)
  }, [selectedAdAccount, tab, fetchCampaigns])

  // Analytics
  useEffect(() => {
    if (tab !== 'analytics' || accounts.length === 0) return
    setAnalyticsLoading(true)
    const params = new URLSearchParams({
      entityType: entityFilter,
      startDate: dateRange.start,
      endDate: dateRange.end,
    })
    fetch(`/api/linkedin/suite/analytics?${params}`)
      .then(r => r.ok ? r.json() : { analytics: [] })
      .then(d => setAnalyticsData(d.analytics || []))
      .catch(() => {})
      .finally(() => setAnalyticsLoading(false))
  }, [tab, accounts.length, entityFilter, dateRange])

  // Orgs
  useEffect(() => {
    if (tab !== 'organization' || accounts.length === 0) return
    setOrgsLoading(true)
    fetch('/api/linkedin/suite/organizations')
      .then(r => r.ok ? r.json() : { organizations: [] })
      .then(d => setOrgs(d.organizations || []))
      .catch(() => {})
      .finally(() => setOrgsLoading(false))
  }, [tab, accounts.length])

  /* ── Actions ── */

  async function handleCreatePost() {
    if (!newPost.content.trim()) return
    setPublishing(true)
    try {
      const body: Record<string, unknown> = {
        content: newPost.content,
        authorType: newPost.authorType,
      }
      if (newPost.scheduledAt) body.scheduledAt = newPost.scheduledAt

      const res = await fetch('/api/linkedin/suite/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setNewPost({ content: '', authorType: 'member', scheduledAt: '' })
        // Refresh posts
        const postsRes = await fetch('/api/linkedin/suite/posts')
        if (postsRes.ok) {
          const d = await postsRes.json()
          setPosts(d.posts || [])
        }
      }
    } catch { /* ignore */ }
    setPublishing(false)
  }

  async function handleCreateCampaign() {
    if (!selectedAdAccount || !campaignForm.name.trim()) return
    setCreatingCampaign(true)
    try {
      const res = await fetch('/api/linkedin/suite/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adAccountId: selectedAdAccount,
          ...campaignForm,
          dailyBudget: campaignForm.dailyBudget ? Number(campaignForm.dailyBudget) : undefined,
        }),
      })
      if (res.ok) {
        setShowCreateCampaign(false)
        setCampaignForm({ name: '', type: 'SPONSORED_UPDATES', objective: 'BRAND_AWARENESS', dailyBudget: '', status: 'DRAFT' })
        fetchCampaigns(selectedAdAccount)
      }
    } catch { /* ignore */ }
    setCreatingCampaign(false)
  }

  /* ── Analytics aggregation ── */

  const totals = analyticsData.reduce(
    (acc, a) => ({
      impressions: acc.impressions + a.impressions,
      clicks: acc.clicks + a.clicks,
      spend: acc.spend + a.spend,
      conversions: acc.conversions + a.conversions,
      leads: acc.leads + a.leads,
      shares: acc.shares + a.shares,
      comments: acc.comments + a.comments,
      reactions: acc.reactions + a.reactions,
    }),
    { impressions: 0, clicks: 0, spend: 0, conversions: 0, leads: 0, shares: 0, comments: 0, reactions: 0 }
  )

  const avgCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
  const avgCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0
  const avgCpm = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0

  /* ── Render ── */

  if (loading) {
    return (
      <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 24, height: 24, border: '2px solid var(--border)',
            borderTopColor: LI_BLUE, borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>Loading LinkedIn Suite...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'posts', label: 'Posts', count: posts.length || undefined },
    { key: 'ads', label: 'Ads', count: campaigns.length || undefined },
    { key: 'analytics', label: 'Analytics' },
    { key: 'organization', label: 'Organization', count: orgs.length || undefined },
  ]

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', width: '100%', background: 'var(--bg-secondary)', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: LI_BLUE, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            LinkedIn Suite
          </h1>
          <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0 }}>
            Accounts, posts, ads, analytics, and organization management
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: '0.125rem', marginBottom: '1.5rem', marginTop: '1.25rem',
        borderBottom: '1px solid var(--border)', paddingBottom: 0,
      }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '0.6rem 1.1rem',
              background: 'none',
              border: 'none',
              color: tab === t.key ? LI_BLUE : '#6b7280',
              fontSize: '0.83rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              borderBottom: tab === t.key ? `2px solid ${LI_BLUE}` : '2px solid transparent',
              marginBottom: '-1px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'color 0.15s',
            }}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span style={{
                fontSize: '0.65rem',
                background: tab === t.key ? LI_BLUE_LIGHT : '#f3f4f6',
                color: tab === t.key ? LI_BLUE : '#9ca3af',
                padding: '0.1rem 0.45rem',
                borderRadius: 10,
                fontWeight: 700,
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════ OVERVIEW TAB ═══════════ */}
      {tab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {accounts.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: '3.5rem 2rem' }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: LI_BLUE_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill={LI_BLUE}>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
                Connect your LinkedIn account
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0 0 1.25rem', maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
                Link your LinkedIn profile to manage posts, run ad campaigns, and track analytics all from one dashboard.
              </p>
              <a href="/api/linkedin/auth" style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-block' }}>
                Connect LinkedIn
              </a>
            </div>
          ) : (
            <>
              {/* Connected accounts */}
              {accounts.map(acct => (
                <div key={acct.id} style={{ ...card, display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  {acct.profile_photo ? (
                    <img src={acct.profile_photo} alt="" style={{
                      width: 56, height: 56, borderRadius: '50%',
                      border: `2px solid ${LI_BLUE}`, objectFit: 'cover',
                    }} />
                  ) : (
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: LI_BLUE_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `2px solid ${LI_BLUE}`,
                      fontSize: '1.25rem', fontWeight: 700, color: LI_BLUE,
                    }}>
                      {(acct.name || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {acct.name || 'LinkedIn User'}
                    </div>
                    {acct.headline && (
                      <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.1rem' }}>
                        {acct.headline}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={badge('#059669', '#ecfdf5')}>Connected</span>
                      {acct.scopes && acct.scopes.length > 0 && (
                        <span style={badge('#6b7280', '#f3f4f6')}>{acct.scopes.length} scopes</span>
                      )}
                      {acct.org_ids && acct.org_ids.length > 0 && (
                        <span style={badge(LI_BLUE, LI_BLUE_LIGHT)}>{acct.org_ids.length} org{acct.org_ids.length > 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {acct.profile_url && (
                      <a href={acct.profile_url} target="_blank" rel="noopener noreferrer" style={btnSecondary}>
                        View Profile
                      </a>
                    )}
                  </div>
                </div>
              ))}

              {/* Quick stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Accounts', value: accounts.length, color: LI_BLUE },
                  { label: 'Total Posts', value: posts.length, color: '#8b5cf6' },
                  { label: 'Campaigns', value: campaigns.length, color: '#f59e0b' },
                  { label: 'Organizations', value: accounts.reduce((n, a) => n + (a.org_ids?.length || 0), 0), color: GREEN },
                ].map(s => (
                  <div key={s.label} style={card}>
                    <p style={statLabel}>{s.label}</p>
                    <p style={statValue(s.color)}>{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent activity */}
              <div style={card}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>
                  Quick Actions
                </h3>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button onClick={() => setTab('posts')} style={btnPrimary}>Create Post</button>
                  <button onClick={() => setTab('ads')} style={btnSecondary}>Manage Ads</button>
                  <button onClick={() => setTab('analytics')} style={btnSecondary}>View Analytics</button>
                  <button onClick={() => setTab('organization')} style={btnSecondary}>Organization Stats</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════ POSTS TAB ═══════════ */}
      {tab === 'posts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {accounts.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: '2.5rem' }}>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0 0 1rem' }}>Connect LinkedIn to create and schedule posts.</p>
              <a href="/api/linkedin/auth" style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-block' }}>Connect LinkedIn</a>
            </div>
          ) : (
            <>
              {/* Composer */}
              <div style={card}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>
                  Create Post
                </h3>

                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Post as
                    </label>
                    <select
                      value={newPost.authorType}
                      onChange={e => setNewPost(p => ({ ...p, authorType: e.target.value }))}
                      style={selectStyle}
                    >
                      <option value="member">Personal Profile</option>
                      <option value="organization">Organization Page</option>
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.35rem' }}>
                      Schedule (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={newPost.scheduledAt}
                      onChange={e => setNewPost(p => ({ ...p, scheduledAt: e.target.value }))}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <textarea
                  placeholder="What do you want to share with your network?"
                  value={newPost.content}
                  onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                  style={{
                    ...inputStyle,
                    minHeight: 140,
                    resize: 'vertical',
                    lineHeight: 1.65,
                    marginBottom: '0.75rem',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: newPost.content.length > 3000 ? '#ef4444' : '#9ca3af' }}>
                    {newPost.content.length} / 3,000
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {newPost.content.trim() && (
                      <button
                        onClick={() => setNewPost({ content: '', authorType: 'member', scheduledAt: '' })}
                        style={btnSecondary}
                      >
                        Discard
                      </button>
                    )}
                    <button
                      onClick={handleCreatePost}
                      disabled={publishing || !newPost.content.trim()}
                      style={{ ...btnPrimary, opacity: publishing || !newPost.content.trim() ? 0.5 : 1 }}
                    >
                      {publishing ? 'Publishing...' : newPost.scheduledAt ? 'Schedule Post' : 'Publish Now'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Posts list */}
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Posts
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {posts.length} total
                  </span>
                </div>

                {postsLoading ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Loading posts...</p>
                ) : posts.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, textAlign: 'center', padding: '2rem 0' }}>
                    No posts yet. Create your first post above.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {posts.slice(0, 20).map(p => (
                      <div key={p.id} style={{
                        padding: '1rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: 12,
                        border: '1px solid var(--border)',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <span style={badge(
                            p.status === 'published' ? '#059669' : p.status === 'scheduled' ? '#d97706' : p.status === 'failed' ? '#ef4444' : '#6b7280',
                            p.status === 'published' ? '#ecfdf5' : p.status === 'scheduled' ? '#fffbeb' : p.status === 'failed' ? '#fef2f2' : '#f3f4f6',
                          )}>
                            {p.status}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {p.published_at ? new Date(p.published_at).toLocaleDateString() : p.scheduled_at ? `Scheduled: ${new Date(p.scheduled_at).toLocaleDateString()}` : new Date(p.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-primary)', fontSize: '0.82rem', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {p.content.slice(0, 280)}{p.content.length > 280 ? '...' : ''}
                        </p>
                        {p.engagement && Object.keys(p.engagement).length > 0 && (
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.65rem', fontSize: '0.72rem', color: '#6b7280' }}>
                            {p.engagement.reactions > 0 && <span>{p.engagement.reactions} reactions</span>}
                            {p.engagement.comments > 0 && <span>{p.engagement.comments} comments</span>}
                            {p.engagement.shares > 0 && <span>{p.engagement.shares} shares</span>}
                            {p.engagement.impressions > 0 && <span>{p.engagement.impressions} impressions</span>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════ ADS TAB ═══════════ */}
      {tab === 'ads' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {accounts.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: '2.5rem' }}>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0 0 1rem' }}>Connect LinkedIn to manage advertising.</p>
              <a href="/api/linkedin/auth" style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-block' }}>Connect LinkedIn</a>
            </div>
          ) : (
            <>
              {/* Account selector + create button */}
              <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Ad Account
                  </label>
                  {adAccounts.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>No ad accounts found. Check your LinkedIn permissions.</p>
                  ) : (
                    <select
                      value={selectedAdAccount}
                      onChange={e => setSelectedAdAccount(e.target.value)}
                      style={{ ...selectStyle, width: '100%' }}
                    >
                      {adAccounts.map(a => (
                        <option key={a.id} value={a.id}>{a.name || a.ad_account_id} ({a.status || 'ACTIVE'})</option>
                      ))}
                    </select>
                  )}
                </div>
                <button
                  onClick={() => setShowCreateCampaign(true)}
                  style={{ ...btnPrimary, alignSelf: 'flex-end' }}
                >
                  + New Campaign
                </button>
              </div>

              {/* Create campaign wizard */}
              {showCreateCampaign && (
                <div style={{ ...card, borderColor: LI_BLUE, borderWidth: 2 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Create Campaign
                    </h3>
                    <button onClick={() => setShowCreateCampaign(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}>
                      x
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.35rem' }}>Campaign Name</label>
                      <input
                        type="text"
                        placeholder="My Campaign"
                        value={campaignForm.name}
                        onChange={e => setCampaignForm(f => ({ ...f, name: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.35rem' }}>Type</label>
                      <select
                        value={campaignForm.type}
                        onChange={e => setCampaignForm(f => ({ ...f, type: e.target.value }))}
                        style={selectStyle}
                      >
                        <option value="SPONSORED_UPDATES">Sponsored Content</option>
                        <option value="TEXT_AD">Text Ad</option>
                        <option value="SPONSORED_INMAILS">Message Ad</option>
                        <option value="DYNAMIC">Dynamic Ad</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.35rem' }}>Objective</label>
                      <select
                        value={campaignForm.objective}
                        onChange={e => setCampaignForm(f => ({ ...f, objective: e.target.value }))}
                        style={selectStyle}
                      >
                        <option value="BRAND_AWARENESS">Brand Awareness</option>
                        <option value="WEBSITE_VISITS">Website Visits</option>
                        <option value="ENGAGEMENT">Engagement</option>
                        <option value="VIDEO_VIEWS">Video Views</option>
                        <option value="LEAD_GENERATION">Lead Generation</option>
                        <option value="WEBSITE_CONVERSIONS">Website Conversions</option>
                        <option value="JOB_APPLICANTS">Job Applicants</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.35rem' }}>Daily Budget (USD)</label>
                      <input
                        type="number"
                        placeholder="50.00"
                        value={campaignForm.dailyBudget}
                        onChange={e => setCampaignForm(f => ({ ...f, dailyBudget: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                    <button onClick={() => setShowCreateCampaign(false)} style={btnSecondary}>
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateCampaign}
                      disabled={creatingCampaign || !campaignForm.name.trim()}
                      style={{ ...btnPrimary, opacity: creatingCampaign || !campaignForm.name.trim() ? 0.5 : 1 }}
                    >
                      {creatingCampaign ? 'Creating...' : 'Create Campaign'}
                    </button>
                  </div>
                </div>
              )}

              {/* Campaigns list */}
              <div style={card}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>
                  Campaigns
                </h3>

                {campaignsLoading ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Loading campaigns...</p>
                ) : campaigns.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, textAlign: 'center', padding: '2rem 0' }}>
                    No campaigns yet. Create your first campaign above.
                  </p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          {['Name', 'Status', 'Type', 'Objective', 'Daily Budget', 'Dates'].map(h => (
                            <th key={h} style={{
                              textAlign: 'left', padding: '0.6rem 0.75rem',
                              color: '#6b7280', fontWeight: 600, fontSize: '0.72rem',
                              textTransform: 'uppercase', letterSpacing: '0.04em',
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map(c => (
                          <tr key={c.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '0.7rem 0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</td>
                            <td style={{ padding: '0.7rem 0.75rem' }}>
                              <span style={badge(
                                c.status === 'ACTIVE' ? '#059669' : c.status === 'PAUSED' ? '#d97706' : '#6b7280',
                                c.status === 'ACTIVE' ? '#ecfdf5' : c.status === 'PAUSED' ? '#fffbeb' : '#f3f4f6',
                              )}>
                                {c.status}
                              </span>
                            </td>
                            <td style={{ padding: '0.7rem 0.75rem', color: 'var(--text-primary)' }}>{c.type || '-'}</td>
                            <td style={{ padding: '0.7rem 0.75rem', color: 'var(--text-primary)' }}>{c.objective || '-'}</td>
                            <td style={{ padding: '0.7rem 0.75rem', color: 'var(--text-primary)' }}>
                              {c.daily_budget ? `$${Number(c.daily_budget).toFixed(2)}` : '-'}
                            </td>
                            <td style={{ padding: '0.7rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                              {c.start_date || '-'} {c.end_date ? `to ${c.end_date}` : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════ ANALYTICS TAB ═══════════ */}
      {tab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {accounts.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: '2.5rem' }}>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0 0 1rem' }}>Connect LinkedIn to view analytics.</p>
              <a href="/api/linkedin/auth" style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-block' }}>Connect LinkedIn</a>
            </div>
          ) : (
            <>
              {/* Filters */}
              <div style={{ ...card, display: 'flex', alignItems: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.35rem' }}>Entity Type</label>
                  <select
                    value={entityFilter}
                    onChange={e => setEntityFilter(e.target.value as typeof entityFilter)}
                    style={selectStyle}
                  >
                    <option value="campaign">Campaigns</option>
                    <option value="creative">Creatives</option>
                    <option value="account">Accounts</option>
                    <option value="org_page">Organization Pages</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.35rem' }}>Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, marginBottom: '0.35rem' }}>End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Key metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Impressions', value: totals.impressions.toLocaleString(), color: LI_BLUE },
                  { label: 'Clicks', value: totals.clicks.toLocaleString(), color: '#8b5cf6' },
                  { label: 'Spend', value: `$${totals.spend.toFixed(2)}`, color: '#ef4444' },
                  { label: 'Conversions', value: totals.conversions.toLocaleString(), color: GREEN },
                  { label: 'Avg CTR', value: `${avgCtr.toFixed(2)}%`, color: '#f59e0b' },
                  { label: 'Avg CPC', value: `$${avgCpc.toFixed(2)}`, color: '#06b6d4' },
                  { label: 'Avg CPM', value: `$${avgCpm.toFixed(2)}`, color: '#ec4899' },
                  { label: 'Leads', value: totals.leads.toLocaleString(), color: '#14b8a6' },
                ].map(m => (
                  <div key={m.label} style={cardHover}>
                    <p style={statLabel}>{m.label}</p>
                    <p style={statValue(m.color)}>{m.value}</p>
                  </div>
                ))}
              </div>

              {/* Analytics chart placeholder + table */}
              <div style={card}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1rem' }}>
                  Performance Over Time
                </h3>

                {analyticsLoading ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Loading analytics...</p>
                ) : analyticsData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                      No analytics data for the selected range.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Mini bar chart */}
                    <div style={{
                      display: 'flex', alignItems: 'flex-end', gap: 2, height: 120,
                      padding: '0 0 0.5rem', marginBottom: '1rem',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      {analyticsData.slice(0, 60).map((d, i) => {
                        const maxImpressions = Math.max(...analyticsData.map(a => a.impressions), 1)
                        const height = Math.max((d.impressions / maxImpressions) * 100, 2)
                        return (
                          <div
                            key={i}
                            title={`${d.date}: ${d.impressions.toLocaleString()} impressions`}
                            style={{
                              flex: 1,
                              height: `${height}%`,
                              background: `linear-gradient(to top, ${LI_BLUE}, ${LI_BLUE}cc)`,
                              borderRadius: '3px 3px 0 0',
                              minWidth: 4,
                              transition: 'height 0.3s',
                              cursor: 'pointer',
                            }}
                          />
                        )
                      })}
                    </div>

                    {/* Data table */}
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            {['Date', 'Entity', 'Impressions', 'Clicks', 'CTR', 'Spend', 'Conversions', 'Engagement'].map(h => (
                              <th key={h} style={{
                                textAlign: h === 'Date' || h === 'Entity' ? 'left' : 'right',
                                padding: '0.5rem 0.6rem', color: '#6b7280', fontWeight: 600,
                                fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em',
                              }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.slice(0, 50).map((a, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                              <td style={{ padding: '0.5rem 0.6rem', color: 'var(--text-primary)' }}>{a.date}</td>
                              <td style={{ padding: '0.5rem 0.6rem', color: '#6b7280', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.entity_id}</td>
                              <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{a.impressions.toLocaleString()}</td>
                              <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', color: 'var(--text-primary)' }}>{a.clicks.toLocaleString()}</td>
                              <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', color: 'var(--text-primary)' }}>{a.ctr != null ? `${(a.ctr * 100).toFixed(2)}%` : '-'}</td>
                              <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', color: 'var(--text-primary)' }}>${a.spend.toFixed(2)}</td>
                              <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', color: 'var(--text-primary)' }}>{a.conversions}</td>
                              <td style={{ padding: '0.5rem 0.6rem', textAlign: 'right', color: '#6b7280' }}>
                                {(a.reactions + a.comments + a.shares).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {/* Engagement breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div style={card}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>Social Engagement</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      { label: 'Reactions', value: totals.reactions, color: '#ef4444' },
                      { label: 'Comments', value: totals.comments, color: '#f59e0b' },
                      { label: 'Shares', value: totals.shares, color: '#06b6d4' },
                    ].map(item => {
                      const max = Math.max(totals.reactions, totals.comments, totals.shares, 1)
                      return (
                        <div key={item.label}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '0.25rem' }}>
                            <span style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.value.toLocaleString()}</span>
                          </div>
                          <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${(item.value / max) * 100}%`,
                              background: item.color,
                              borderRadius: 3,
                              transition: 'width 0.4s',
                            }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div style={card}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>Cost Breakdown</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {[
                      { label: 'Total Spend', value: `$${totals.spend.toFixed(2)}` },
                      { label: 'Cost per Click', value: `$${avgCpc.toFixed(2)}` },
                      { label: 'Cost per 1K Impressions', value: `$${avgCpm.toFixed(2)}` },
                      { label: 'Cost per Conversion', value: totals.conversions > 0 ? `$${(totals.spend / totals.conversions).toFixed(2)}` : '-' },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: '#6b7280' }}>{item.label}</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════ ORGANIZATION TAB ═══════════ */}
      {tab === 'organization' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {accounts.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: '2.5rem' }}>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0 0 1rem' }}>Connect LinkedIn to view organization stats.</p>
              <a href="/api/linkedin/auth" style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-block' }}>Connect LinkedIn</a>
            </div>
          ) : orgsLoading ? (
            <div style={{ ...card, textAlign: 'center', padding: '2.5rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Loading organizations...</p>
            </div>
          ) : orgs.length === 0 ? (
            <div style={{ ...card, textAlign: 'center', padding: '2.5rem' }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem', fontSize: '1.5rem',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.4rem' }}>No organizations found</h3>
              <p style={{ color: '#6b7280', fontSize: '0.82rem', margin: 0 }}>
                You need admin access to a LinkedIn Company Page to see organization data.
              </p>
            </div>
          ) : (
            <>
              {orgs.map(org => (
                <div key={org.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Org header */}
                  <div style={{ ...card, display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 12,
                      background: LI_BLUE_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem', fontWeight: 700, color: LI_BLUE,
                    }}>
                      {org.name[0]?.toUpperCase() || 'O'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{org.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.1rem' }}>Organization ID: {org.id}</div>
                    </div>
                    <a
                      href={`https://www.linkedin.com/company/${org.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={btnSecondary}
                    >
                      View Page
                    </a>
                  </div>

                  {/* Org stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    {[
                      { label: 'Followers', value: org.follower_count.toLocaleString(), color: LI_BLUE },
                      { label: 'Page Views', value: org.page_views.toLocaleString(), color: '#8b5cf6' },
                      { label: 'Unique Visitors', value: org.unique_visitors.toLocaleString(), color: GREEN },
                    ].map(s => (
                      <div key={s.label} style={card}>
                        <p style={statLabel}>{s.label}</p>
                        <p style={statValue(s.color)}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Follower analytics placeholder */}
                  <div style={card}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>
                      Follower Growth
                    </h3>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      height: 160, background: 'var(--bg-secondary)', borderRadius: 12,
                      border: '1px dashed #d1d5db',
                    }}>
                      <div style={{ textAlign: 'center' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ marginBottom: '0.5rem' }}>
                          <path d="M3 3v18h18" />
                          <path d="M7 16l4-4 4 2 6-6" />
                          <circle cx="21" cy="8" r="1.5" />
                        </svg>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                          Follower growth chart will appear here once enough data is collected.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Visitor demographics placeholder */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    <div style={card}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>
                        Visitor Demographics
                      </h4>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        height: 120, background: 'var(--bg-secondary)', borderRadius: 10,
                        border: '1px dashed #d1d5db',
                      }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>
                          Demographics breakdown by job function, seniority, and industry.
                        </p>
                      </div>
                    </div>

                    <div style={card}>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem' }}>
                        Content Performance
                      </h4>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        height: 120, background: 'var(--bg-secondary)', borderRadius: 10,
                        border: '1px dashed #d1d5db',
                      }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0 }}>
                          Top-performing posts by engagement, reach, and click-through rate.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
