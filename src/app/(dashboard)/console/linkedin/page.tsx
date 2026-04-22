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
   Helpers
   ────────────────────────────────────────────── */

const LI_BLUE = '#0077b5'

function Badge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      className="inline-block font-semibold rounded-full"
      style={{ padding: '0.2rem 0.6rem', fontSize: '0.68rem', color, background: bg }}
    >
      {label}
    </span>
  )
}

function postStatusBadge(status: string) {
  const map: Record<string, { color: string; bg: string }> = {
    published: { color: '#059669', bg: '#ecfdf5' },
    scheduled:  { color: '#d97706', bg: '#fffbeb' },
    failed:     { color: '#ef4444', bg: '#fef2f2' },
  }
  const s = map[status] ?? { color: '#6b7280', bg: '#f3f4f6' }
  return <Badge label={status} color={s.color} bg={s.bg} />
}

function campaignStatusBadge(status: string) {
  const map: Record<string, { color: string; bg: string }> = {
    ACTIVE:  { color: '#059669', bg: '#ecfdf5' },
    PAUSED:  { color: '#d97706', bg: '#fffbeb' },
  }
  const s = map[status] ?? { color: '#6b7280', bg: '#f3f4f6' }
  return <Badge label={status} color={s.color} bg={s.bg} />
}

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

  useEffect(() => {
    if (tab !== 'posts' || accounts.length === 0) return
    setPostsLoading(true)
    fetch('/api/linkedin/suite/posts')
      .then(r => r.ok ? r.json() : { posts: [] })
      .then(d => setPosts(d.posts || []))
      .catch(() => {})
      .finally(() => setPostsLoading(false))
  }, [tab, accounts.length])

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

  /* ── Shared class helpers ── */

  const cardCls = 'rounded-2xl p-6 bg-[var(--bg-card)] border border-[var(--border)]'
  const inputCls = 'w-full px-3.5 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[10px] text-[var(--text-primary)] text-sm outline-none transition-colors font-inherit'
  const selectCls = `${inputCls} appearance-none min-w-[160px] w-auto pr-8`
  const btnPrimary = 'inline-flex items-center gap-1.5 px-6 py-2.5 rounded-[10px] border-none font-semibold text-[0.82rem] cursor-pointer transition-opacity'
  const btnSecondary = 'inline-flex items-center gap-1.5 px-6 py-2.5 rounded-[10px] border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] font-semibold text-[0.82rem] cursor-pointer transition-colors'
  const labelCls = 'block text-xs text-[#6b7280] font-semibold mb-1.5'
  const statLabelCls = 'text-[0.7rem] text-[#6b7280] uppercase tracking-[0.06em] font-semibold m-0'

  /* ── Render ── */

  if (loading) {
    return (
      <div className="p-8 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded-full border-2 border-[var(--border)] animate-spin"
            style={{ borderTopColor: LI_BLUE }}
          />
          <span className="text-[#6b7280] text-sm">Loading LinkedIn Suite...</span>
        </div>
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
    <div className="p-8 max-w-[1200px] mx-auto w-full bg-[var(--bg-secondary)] min-h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center"
          style={{ background: LI_BLUE }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </div>
        <div>
          <h1 className="text-[1.4rem] font-bold text-[var(--text-primary)] m-0">
            LinkedIn Suite
          </h1>
          <p className="text-[0.78rem] text-[#6b7280] m-0">
            Accounts, posts, ads, analytics, and organization management
          </p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0.5 mb-6 mt-5 border-b border-[var(--border)]">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex items-center gap-1.5 px-[1.1rem] py-2.5 bg-none border-none font-semibold text-[0.83rem] cursor-pointer font-inherit transition-colors -mb-px"
            style={{
              color: tab === t.key ? LI_BLUE : '#6b7280',
              borderBottom: tab === t.key ? `2px solid ${LI_BLUE}` : '2px solid transparent',
            }}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className="text-[0.65rem] font-bold rounded-[10px] px-1.5 py-0.5"
                style={{
                  background: tab === t.key ? `${LI_BLUE}10` : '#f3f4f6',
                  color: tab === t.key ? LI_BLUE : '#9ca3af',
                }}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════ OVERVIEW TAB ═══════════ */}
      {tab === 'overview' && (
        <div className="flex flex-col gap-4">
          {accounts.length === 0 ? (
            <div className={`${cardCls} text-center py-14`}>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                style={{ background: `${LI_BLUE}10` }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill={LI_BLUE}>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
              <h2 className="text-[1.1rem] font-bold text-[var(--text-primary)] mt-0 mb-2">
                Connect your LinkedIn account
              </h2>
              <p className="text-[#6b7280] text-sm mx-auto mb-5" style={{ maxWidth: 400 }}>
                Link your LinkedIn profile to manage posts, run ad campaigns, and track analytics all from one dashboard.
              </p>
              <a
                href="/api/linkedin/auth"
                className={`${btnPrimary} no-underline text-[var(--text-primary)]`}
                style={{ background: LI_BLUE }}
              >
                Connect LinkedIn
              </a>
            </div>
          ) : (
            <>
              {accounts.map(acct => (
                <div key={acct.id} className={`${cardCls} flex gap-4 items-center`}>
                  {acct.profile_photo ? (
                    <img
                      src={acct.profile_photo}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover"
                      style={{ border: `2px solid ${LI_BLUE}` }}
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                      style={{
                        background: `${LI_BLUE}10`,
                        border: `2px solid ${LI_BLUE}`,
                        color: LI_BLUE,
                      }}
                    >
                      {(acct.name || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-[1.05rem] font-bold text-[var(--text-primary)]">
                      {acct.name || 'LinkedIn User'}
                    </div>
                    {acct.headline && (
                      <div className="text-[0.8rem] text-[#6b7280] mt-0.5">{acct.headline}</div>
                    )}
                    <div className="flex gap-2 mt-1.5 flex-wrap">
                      <Badge label="Connected" color="#059669" bg="#ecfdf5" />
                      {acct.scopes && acct.scopes.length > 0 && (
                        <Badge label={`${acct.scopes.length} scopes`} color="#6b7280" bg="#f3f4f6" />
                      )}
                      {acct.org_ids && acct.org_ids.length > 0 && (
                        <Badge label={`${acct.org_ids.length} org${acct.org_ids.length > 1 ? 's' : ''}`} color={LI_BLUE} bg={`${LI_BLUE}10`} />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {acct.profile_url && (
                      <a href={acct.profile_url} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
                        View Profile
                      </a>
                    )}
                  </div>
                </div>
              ))}

              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                {[
                  { label: 'Accounts', value: accounts.length, color: LI_BLUE },
                  { label: 'Total Posts', value: posts.length, color: '#8b5cf6' },
                  { label: 'Campaigns', value: campaigns.length, color: '#f59e0b' },
                  { label: 'Organizations', value: accounts.reduce((n, a) => n + (a.org_ids?.length || 0), 0), color: '#6EE05A' },
                ].map(s => (
                  <div key={s.label} className={cardCls}>
                    <p className={statLabelCls}>{s.label}</p>
                    <p className="text-[1.75rem] font-bold leading-none mt-1 mb-0" style={{ color: s.color }}>
                      {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className={cardCls}>
                <h3 className="text-[0.95rem] font-bold text-[var(--text-primary)] mt-0 mb-3">
                  Quick Actions
                </h3>
                <div className="flex gap-3 flex-wrap">
                  <button onClick={() => setTab('posts')} className={btnPrimary} style={{ background: LI_BLUE }}>
                    Create Post
                  </button>
                  <button onClick={() => setTab('ads')} className={btnSecondary}>Manage Ads</button>
                  <button onClick={() => setTab('analytics')} className={btnSecondary}>View Analytics</button>
                  <button onClick={() => setTab('organization')} className={btnSecondary}>Organization Stats</button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══════════ POSTS TAB ═══════════ */}
      {tab === 'posts' && (
        <div className="flex flex-col gap-4">
          {accounts.length === 0 ? (
            <div className={`${cardCls} text-center py-10`}>
              <p className="text-[#6b7280] text-sm mb-4">Connect LinkedIn to create and schedule posts.</p>
              <a href="/api/linkedin/auth" className={`${btnPrimary} no-underline`} style={{ background: LI_BLUE }}>
                Connect LinkedIn
              </a>
            </div>
          ) : (
            <>
              <div className={cardCls}>
                <h3 className="text-base font-bold text-[var(--text-primary)] mt-0 mb-4">Create Post</h3>

                <div className="flex gap-3 mb-3 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <label className={labelCls}>Post as</label>
                    <select
                      value={newPost.authorType}
                      onChange={e => setNewPost(p => ({ ...p, authorType: e.target.value }))}
                      className={selectCls}
                    >
                      <option value="member">Personal Profile</option>
                      <option value="organization">Organization Page</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className={labelCls}>Schedule (optional)</label>
                    <input
                      type="datetime-local"
                      value={newPost.scheduledAt}
                      onChange={e => setNewPost(p => ({ ...p, scheduledAt: e.target.value }))}
                      className={inputCls}
                    />
                  </div>
                </div>

                <textarea
                  placeholder="What do you want to share with your network?"
                  value={newPost.content}
                  onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                  className={`${inputCls} resize-y leading-[1.65] mb-3`}
                  style={{ minHeight: 140 }}
                />

                <div className="flex justify-between items-center">
                  <span
                    className="text-xs"
                    style={{ color: newPost.content.length > 3000 ? '#ef4444' : '#9ca3af' }}
                  >
                    {newPost.content.length} / 3,000
                  </span>
                  <div className="flex gap-2">
                    {newPost.content.trim() && (
                      <button
                        onClick={() => setNewPost({ content: '', authorType: 'member', scheduledAt: '' })}
                        className={btnSecondary}
                      >
                        Discard
                      </button>
                    )}
                    <button
                      onClick={handleCreatePost}
                      disabled={publishing || !newPost.content.trim()}
                      className={btnPrimary}
                      style={{
                        background: LI_BLUE,
                        color: '#fff',
                        opacity: publishing || !newPost.content.trim() ? 0.5 : 1,
                      }}
                    >
                      {publishing ? 'Publishing...' : newPost.scheduledAt ? 'Schedule Post' : 'Publish Now'}
                    </button>
                  </div>
                </div>
              </div>

              <div className={cardCls}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-[var(--text-primary)] m-0">Posts</h3>
                  <span className="text-xs text-[var(--text-muted)]">{posts.length} total</span>
                </div>

                {postsLoading ? (
                  <p className="text-[var(--text-muted)] text-sm m-0">Loading posts...</p>
                ) : posts.length === 0 ? (
                  <p className="text-[var(--text-muted)] text-sm m-0 text-center py-8">
                    No posts yet. Create your first post above.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {posts.slice(0, 20).map(p => (
                      <div
                        key={p.id}
                        className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]"
                      >
                        <div className="flex justify-between items-start mb-2">
                          {postStatusBadge(p.status)}
                          <span className="text-[0.7rem] text-[var(--text-muted)]">
                            {p.published_at
                              ? new Date(p.published_at).toLocaleDateString()
                              : p.scheduled_at
                                ? `Scheduled: ${new Date(p.scheduled_at).toLocaleDateString()}`
                                : new Date(p.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[var(--text-primary)] text-[0.82rem] m-0 leading-relaxed whitespace-pre-wrap">
                          {p.content.slice(0, 280)}{p.content.length > 280 ? '...' : ''}
                        </p>
                        {p.engagement && Object.keys(p.engagement).length > 0 && (
                          <div className="flex gap-4 mt-2.5 text-[0.72rem] text-[#6b7280]">
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
        <div className="flex flex-col gap-4">
          {accounts.length === 0 ? (
            <div className={`${cardCls} text-center py-10`}>
              <p className="text-[#6b7280] text-sm mb-4">Connect LinkedIn to manage advertising.</p>
              <a href="/api/linkedin/auth" className={`${btnPrimary} no-underline`} style={{ background: LI_BLUE }}>
                Connect LinkedIn
              </a>
            </div>
          ) : (
            <>
              <div className={`${cardCls} flex items-center gap-4 flex-wrap`}>
                <div className="flex-1 min-w-[200px]">
                  <label className={labelCls}>Ad Account</label>
                  {adAccounts.length === 0 ? (
                    <p className="text-[var(--text-muted)] text-[0.82rem] m-0">
                      No ad accounts found. Check your LinkedIn permissions.
                    </p>
                  ) : (
                    <select
                      value={selectedAdAccount}
                      onChange={e => setSelectedAdAccount(e.target.value)}
                      className={`${selectCls} w-full`}
                    >
                      {adAccounts.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name || a.ad_account_id} ({a.status || 'ACTIVE'})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <button
                  onClick={() => setShowCreateCampaign(true)}
                  className={`${btnPrimary} self-end`}
                  style={{ background: LI_BLUE, color: '#fff' }}
                >
                  + New Campaign
                </button>
              </div>

              {showCreateCampaign && (
                <div className={cardCls} style={{ borderColor: LI_BLUE, borderWidth: 2 }}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-[var(--text-primary)] m-0">Create Campaign</h3>
                    <button
                      onClick={() => setShowCreateCampaign(false)}
                      className="bg-none border-none cursor-pointer text-[var(--text-muted)] text-xl leading-none"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                    <div>
                      <label className={labelCls}>Campaign Name</label>
                      <input
                        type="text"
                        placeholder="My Campaign"
                        value={campaignForm.name}
                        onChange={e => setCampaignForm(f => ({ ...f, name: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Type</label>
                      <select
                        value={campaignForm.type}
                        onChange={e => setCampaignForm(f => ({ ...f, type: e.target.value }))}
                        className={selectCls}
                      >
                        <option value="SPONSORED_UPDATES">Sponsored Content</option>
                        <option value="TEXT_AD">Text Ad</option>
                        <option value="SPONSORED_INMAILS">Message Ad</option>
                        <option value="DYNAMIC">Dynamic Ad</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Objective</label>
                      <select
                        value={campaignForm.objective}
                        onChange={e => setCampaignForm(f => ({ ...f, objective: e.target.value }))}
                        className={selectCls}
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
                      <label className={labelCls}>Daily Budget (USD)</label>
                      <input
                        type="number"
                        placeholder="50.00"
                        value={campaignForm.dailyBudget}
                        onChange={e => setCampaignForm(f => ({ ...f, dailyBudget: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button onClick={() => setShowCreateCampaign(false)} className={btnSecondary}>Cancel</button>
                    <button
                      onClick={handleCreateCampaign}
                      disabled={creatingCampaign || !campaignForm.name.trim()}
                      className={btnPrimary}
                      style={{
                        background: LI_BLUE,
                        color: '#fff',
                        opacity: creatingCampaign || !campaignForm.name.trim() ? 0.5 : 1,
                      }}
                    >
                      {creatingCampaign ? 'Creating...' : 'Create Campaign'}
                    </button>
                  </div>
                </div>
              )}

              <div className={cardCls}>
                <h3 className="text-base font-bold text-[var(--text-primary)] mt-0 mb-4">Campaigns</h3>
                {campaignsLoading ? (
                  <p className="text-[var(--text-muted)] text-sm m-0">Loading campaigns...</p>
                ) : campaigns.length === 0 ? (
                  <p className="text-[var(--text-muted)] text-sm m-0 text-center py-8">
                    No campaigns yet. Create your first campaign above.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-[0.82rem]" style={{ borderCollapse: 'collapse' }}>
                      <thead>
                        <tr className="border-b border-[var(--border)]">
                          {['Name', 'Status', 'Type', 'Objective', 'Daily Budget', 'Dates'].map(h => (
                            <th
                              key={h}
                              className="text-left px-3 py-2.5 text-[#6b7280] font-semibold text-[0.72rem] uppercase tracking-[0.04em]"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map(c => (
                          <tr key={c.id} className="border-b border-[var(--border)]">
                            <td className="px-3 py-3 font-semibold text-[var(--text-primary)]">{c.name}</td>
                            <td className="px-3 py-3">{campaignStatusBadge(c.status)}</td>
                            <td className="px-3 py-3 text-[var(--text-primary)]">{c.type || '-'}</td>
                            <td className="px-3 py-3 text-[var(--text-primary)]">{c.objective || '-'}</td>
                            <td className="px-3 py-3 text-[var(--text-primary)]">
                              {c.daily_budget ? `$${Number(c.daily_budget).toFixed(2)}` : '-'}
                            </td>
                            <td className="px-3 py-3 text-[var(--text-muted)] text-xs">
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
        <div className="flex flex-col gap-4">
          {accounts.length === 0 ? (
            <div className={`${cardCls} text-center py-10`}>
              <p className="text-[#6b7280] text-sm mb-4">Connect LinkedIn to view analytics.</p>
              <a href="/api/linkedin/auth" className={`${btnPrimary} no-underline`} style={{ background: LI_BLUE }}>
                Connect LinkedIn
              </a>
            </div>
          ) : (
            <>
              <div className={`${cardCls} flex items-end gap-4 flex-wrap`}>
                <div>
                  <label className={labelCls}>Entity Type</label>
                  <select
                    value={entityFilter}
                    onChange={e => setEntityFilter(e.target.value as typeof entityFilter)}
                    className={selectCls}
                  >
                    <option value="campaign">Campaigns</option>
                    <option value="creative">Creatives</option>
                    <option value="account">Accounts</option>
                    <option value="org_page">Organization Pages</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={e => setDateRange(r => ({ ...r, start: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={e => setDateRange(r => ({ ...r, end: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                {[
                  { label: 'Impressions', value: totals.impressions.toLocaleString(), color: LI_BLUE },
                  { label: 'Clicks', value: totals.clicks.toLocaleString(), color: '#8b5cf6' },
                  { label: 'Spend', value: `$${totals.spend.toFixed(2)}`, color: '#ef4444' },
                  { label: 'Conversions', value: totals.conversions.toLocaleString(), color: '#6EE05A' },
                  { label: 'Avg CTR', value: `${avgCtr.toFixed(2)}%`, color: '#f59e0b' },
                  { label: 'Avg CPC', value: `$${avgCpc.toFixed(2)}`, color: '#06b6d4' },
                  { label: 'Avg CPM', value: `$${avgCpm.toFixed(2)}`, color: '#ec4899' },
                  { label: 'Leads', value: totals.leads.toLocaleString(), color: '#14b8a6' },
                ].map(m => (
                  <div key={m.label} className={`${cardCls} transition-shadow duration-200 hover:shadow-md`}>
                    <p className={statLabelCls}>{m.label}</p>
                    <p className="text-[1.75rem] font-bold leading-none mt-1 mb-0" style={{ color: m.color }}>{m.value}</p>
                  </div>
                ))}
              </div>

              <div className={cardCls}>
                <h3 className="text-base font-bold text-[var(--text-primary)] mt-0 mb-4">Performance Over Time</h3>

                {analyticsLoading ? (
                  <p className="text-[var(--text-muted)] text-sm m-0">Loading analytics...</p>
                ) : analyticsData.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-[var(--text-muted)] text-sm m-0">No analytics data for the selected range.</p>
                  </div>
                ) : (
                  <>
                    <div
                      className="flex items-end gap-0.5 pb-2 mb-4 border-b border-[var(--border)]"
                      style={{ height: 120 }}
                    >
                      {analyticsData.slice(0, 60).map((d, i) => {
                        const maxImpressions = Math.max(...analyticsData.map(a => a.impressions), 1)
                        const height = Math.max((d.impressions / maxImpressions) * 100, 2)
                        return (
                          <div
                            key={i}
                            title={`${d.date}: ${d.impressions.toLocaleString()} impressions`}
                            className="flex-1 rounded-t-sm cursor-pointer transition-all duration-300"
                            style={{
                              height: `${height}%`,
                              background: `linear-gradient(to top, ${LI_BLUE}, ${LI_BLUE}cc)`,
                              minWidth: 4,
                            }}
                          />
                        )
                      })}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-[0.78rem]" style={{ borderCollapse: 'collapse' }}>
                        <thead>
                          <tr className="border-b border-[var(--border)]">
                            {['Date', 'Entity', 'Impressions', 'Clicks', 'CTR', 'Spend', 'Conversions', 'Engagement'].map(h => (
                              <th
                                key={h}
                                className="py-2 px-2.5 text-[#6b7280] font-semibold text-[0.7rem] uppercase tracking-[0.04em]"
                                style={{ textAlign: h === 'Date' || h === 'Entity' ? 'left' : 'right' }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {analyticsData.slice(0, 50).map((a, i) => (
                            <tr key={i} className="border-b border-[var(--border)]">
                              <td className="py-2 px-2.5 text-[var(--text-primary)]">{a.date}</td>
                              <td className="py-2 px-2.5 text-[#6b7280] overflow-hidden text-ellipsis whitespace-nowrap" style={{ maxWidth: 120 }}>{a.entity_id}</td>
                              <td className="py-2 px-2.5 text-right text-[var(--text-primary)] font-semibold">{a.impressions.toLocaleString()}</td>
                              <td className="py-2 px-2.5 text-right text-[var(--text-primary)]">{a.clicks.toLocaleString()}</td>
                              <td className="py-2 px-2.5 text-right text-[var(--text-primary)]">{a.ctr != null ? `${(a.ctr * 100).toFixed(2)}%` : '-'}</td>
                              <td className="py-2 px-2.5 text-right text-[var(--text-primary)]">${a.spend.toFixed(2)}</td>
                              <td className="py-2 px-2.5 text-right text-[var(--text-primary)]">{a.conversions}</td>
                              <td className="py-2 px-2.5 text-right text-[#6b7280]">
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

              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                <div className={cardCls}>
                  <h4 className="text-[0.85rem] font-bold text-[var(--text-primary)] mt-0 mb-3">Social Engagement</h4>
                  <div className="flex flex-col gap-2">
                    {[
                      { label: 'Reactions', value: totals.reactions, color: '#ef4444' },
                      { label: 'Comments', value: totals.comments, color: '#f59e0b' },
                      { label: 'Shares', value: totals.shares, color: '#06b6d4' },
                    ].map(item => {
                      const max = Math.max(totals.reactions, totals.comments, totals.shares, 1)
                      return (
                        <div key={item.label}>
                          <div className="flex justify-between text-[0.78rem] mb-1">
                            <span className="text-[var(--text-primary)]">{item.label}</span>
                            <span className="text-[var(--text-primary)] font-semibold">{item.value.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 bg-[var(--bg-secondary)] rounded-sm overflow-hidden">
                            <div
                              className="h-full rounded-sm transition-all duration-300"
                              style={{ width: `${(item.value / max) * 100}%`, background: item.color }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className={cardCls}>
                  <h4 className="text-[0.85rem] font-bold text-[var(--text-primary)] mt-0 mb-3">Cost Breakdown</h4>
                  <div className="flex flex-col gap-2.5">
                    {[
                      { label: 'Total Spend', value: `$${totals.spend.toFixed(2)}` },
                      { label: 'Cost per Click', value: `$${avgCpc.toFixed(2)}` },
                      { label: 'Cost per 1K Impressions', value: `$${avgCpm.toFixed(2)}` },
                      { label: 'Cost per Conversion', value: totals.conversions > 0 ? `$${(totals.spend / totals.conversions).toFixed(2)}` : '-' },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between text-[0.82rem]">
                        <span className="text-[#6b7280]">{item.label}</span>
                        <span className="text-[var(--text-primary)] font-semibold">{item.value}</span>
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
        <div className="flex flex-col gap-4">
          {accounts.length === 0 ? (
            <div className={`${cardCls} text-center py-10`}>
              <p className="text-[#6b7280] text-sm mb-4">Connect LinkedIn to view organization stats.</p>
              <a href="/api/linkedin/auth" className={`${btnPrimary} no-underline`} style={{ background: LI_BLUE }}>
                Connect LinkedIn
              </a>
            </div>
          ) : orgsLoading ? (
            <div className={`${cardCls} text-center py-10`}>
              <p className="text-[var(--text-muted)] text-sm m-0">Loading organizations...</p>
            </div>
          ) : orgs.length === 0 ? (
            <div className={`${cardCls} text-center py-10`}>
              <div className="w-14 h-14 rounded-[14px] bg-[var(--bg-secondary)] flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)] mt-0 mb-1.5">No organizations found</h3>
              <p className="text-[#6b7280] text-[0.82rem] m-0">
                You need admin access to a LinkedIn Company Page to see organization data.
              </p>
            </div>
          ) : (
            <>
              {orgs.map(org => (
                <div key={org.id} className="flex flex-col gap-4">
                  <div className={`${cardCls} flex gap-4 items-center`}>
                    <div
                      className="w-[52px] h-[52px] rounded-xl flex items-center justify-center text-xl font-bold shrink-0"
                      style={{ background: `${LI_BLUE}10`, color: LI_BLUE }}
                    >
                      {org.name[0]?.toUpperCase() || 'O'}
                    </div>
                    <div className="flex-1">
                      <div className="text-[1.05rem] font-bold text-[var(--text-primary)]">{org.name}</div>
                      <div className="text-[0.78rem] text-[#6b7280] mt-0.5">Organization ID: {org.id}</div>
                    </div>
                    <a
                      href={`https://www.linkedin.com/company/${org.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={btnSecondary}
                    >
                      View Page
                    </a>
                  </div>

                  <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                    {[
                      { label: 'Followers', value: org.follower_count.toLocaleString(), color: LI_BLUE },
                      { label: 'Page Views', value: org.page_views.toLocaleString(), color: '#8b5cf6' },
                      { label: 'Unique Visitors', value: org.unique_visitors.toLocaleString(), color: '#6EE05A' },
                    ].map(s => (
                      <div key={s.label} className={cardCls}>
                        <p className={statLabelCls}>{s.label}</p>
                        <p className="text-[1.75rem] font-bold leading-none mt-1 mb-0" style={{ color: s.color }}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className={cardCls}>
                    <h3 className="text-base font-bold text-[var(--text-primary)] mt-0 mb-3">Follower Growth</h3>
                    <div
                      className="flex items-center justify-center rounded-xl border border-dashed border-[#d1d5db] bg-[var(--bg-secondary)]"
                      style={{ height: 160 }}
                    >
                      <div className="text-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" className="mb-2 mx-auto">
                          <path d="M3 3v18h18" />
                          <path d="M7 16l4-4 4 2 6-6" />
                          <circle cx="21" cy="8" r="1.5" />
                        </svg>
                        <p className="text-[var(--text-muted)] text-[0.82rem] m-0">
                          Follower growth chart will appear here once enough data is collected.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                    <div className={cardCls}>
                      <h4 className="text-[0.85rem] font-bold text-[var(--text-primary)] mt-0 mb-3">Visitor Demographics</h4>
                      <div
                        className="flex items-center justify-center rounded-[10px] bg-[var(--bg-secondary)] border border-dashed border-[#d1d5db]"
                        style={{ height: 120 }}
                      >
                        <p className="text-[var(--text-muted)] text-[0.78rem] m-0 px-4 text-center">
                          Demographics breakdown by job function, seniority, and industry.
                        </p>
                      </div>
                    </div>

                    <div className={cardCls}>
                      <h4 className="text-[0.85rem] font-bold text-[var(--text-primary)] mt-0 mb-3">Content Performance</h4>
                      <div
                        className="flex items-center justify-center rounded-[10px] bg-[var(--bg-secondary)] border border-dashed border-[#d1d5db]"
                        style={{ height: 120 }}
                      >
                        <p className="text-[var(--text-muted)] text-[0.78rem] m-0 px-4 text-center">
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
