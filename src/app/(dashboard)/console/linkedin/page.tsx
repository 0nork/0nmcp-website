'use client'

import { useState, useEffect, useCallback } from 'react'

type Tab = 'overview' | 'content' | 'advertising' | 'analytics'

interface MemberData {
  id: string
  linkedin_name: string
  linkedin_headline: string | null
  linkedin_avatar_url: string | null
  linkedin_profile_url: string | null
  automated_posting_enabled: boolean
  posting_frequency: string
  total_posts: number
  total_engagements: number
  archetype: { tier: string; domain: string; style: string } | null
  ads_enabled: boolean
  ad_account_ids: string[]
}

interface AdAccountData {
  id: string
  name: string
  status: string
  currency: string
}

interface CampaignData {
  id: string
  name: string
  status: string
  type: string
  dailyBudget?: { amount: string; currencyCode: string }
}

interface AnalyticsData {
  impressions: number
  clicks: number
  spend: number
  conversions: number
  ctr: number
  cpm: number
  cpc: number
  pivotValue?: string
}

interface PostData {
  id: string
  content: string
  posted_at: string | null
  engagement_metrics: Record<string, number> | null
}

export default function LinkedInPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [member, setMember] = useState<MemberData | null>(null)
  const [loading, setLoading] = useState(true)

  // Content state
  const [topic, setTopic] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [generating, setGenerating] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [posts, setPosts] = useState<PostData[]>([])

  // Advertising state
  const [adAccounts, setAdAccounts] = useState<AdAccountData[]>([])
  const [selectedAccount, setSelectedAccount] = useState('')
  const [campaigns, setCampaigns] = useState<CampaignData[]>([])
  const [campaignsLoading, setCampaignsLoading] = useState(false)
  const [showCreateCampaign, setShowCreateCampaign] = useState(false)
  const [newCampaign, setNewCampaign] = useState({ name: '', type: 'SPONSORED_UPDATES', budget: '' })
  const [creating, setCreating] = useState(false)

  // Analytics state
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([])
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [pivot, setPivot] = useState<'CAMPAIGN' | 'CREATIVE' | 'ACCOUNT'>('CAMPAIGN')
  const [granularity, setGranularity] = useState<'DAILY' | 'MONTHLY' | 'ALL'>('DAILY')
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })

  // Fetch member data
  useEffect(() => {
    async function fetchMember() {
      try {
        const res = await fetch('/api/linkedin/member')
        if (res.ok) {
          const data = await res.json()
          setMember(data.member)
        }
      } catch { /* not connected */ }
      setLoading(false)
    }
    fetchMember()
  }, [])

  // Fetch posts when content tab is active
  useEffect(() => {
    if (tab !== 'content' || !member) return
    fetch('/api/linkedin/posts')
      .then(r => r.ok ? r.json() : { posts: [] })
      .then(d => setPosts(d.posts || []))
      .catch(() => {})
  }, [tab, member])

  // Fetch ad accounts when advertising tab is active
  useEffect(() => {
    if (tab !== 'advertising' && tab !== 'analytics') return
    if (!member || adAccounts.length > 0) return
    fetch('/api/linkedin/ads/accounts')
      .then(r => r.ok ? r.json() : { accounts: [] })
      .then(d => {
        setAdAccounts(d.accounts || [])
        if (d.accounts?.length > 0) setSelectedAccount(d.accounts[0].id)
      })
      .catch(() => {})
  }, [tab, member, adAccounts.length])

  // Fetch campaigns when account selected
  const fetchCampaigns = useCallback(async (accountId: string) => {
    setCampaignsLoading(true)
    try {
      const res = await fetch(`/api/linkedin/ads/campaigns?accountId=${accountId}`)
      const data = res.ok ? await res.json() : { campaigns: [] }
      setCampaigns(data.campaigns || [])
    } catch { setCampaigns([]) }
    setCampaignsLoading(false)
  }, [])

  useEffect(() => {
    if (selectedAccount && tab === 'advertising') fetchCampaigns(selectedAccount)
  }, [selectedAccount, tab, fetchCampaigns])

  // Generate post
  async function handleGenerate() {
    if (!member || !topic.trim()) return
    setGenerating(true)
    try {
      const res = await fetch('/api/linkedin/post/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: member.id, topic }),
      })
      const data = await res.json()
      if (data.content) setGeneratedContent(data.content)
    } catch { /* ignore */ }
    setGenerating(false)
  }

  // Publish post
  async function handlePublish() {
    if (!member || !generatedContent.trim()) return
    setPublishing(true)
    try {
      const res = await fetch('/api/linkedin/post/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_id: member.id, content: generatedContent }),
      })
      if (res.ok) {
        setGeneratedContent('')
        setTopic('')
        // Refresh posts
        const postsRes = await fetch('/api/linkedin/posts')
        if (postsRes.ok) {
          const d = await postsRes.json()
          setPosts(d.posts || [])
        }
      }
    } catch { /* ignore */ }
    setPublishing(false)
  }

  // Create campaign
  async function handleCreateCampaign() {
    if (!selectedAccount || !newCampaign.name) return
    setCreating(true)
    try {
      const res = await fetch('/api/linkedin/ads/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedAccount,
          name: newCampaign.name,
          type: newCampaign.type,
          dailyBudget: newCampaign.budget ? { amount: newCampaign.budget, currencyCode: 'USD' } : undefined,
        }),
      })
      if (res.ok) {
        setShowCreateCampaign(false)
        setNewCampaign({ name: '', type: 'SPONSORED_UPDATES', budget: '' })
        fetchCampaigns(selectedAccount)
      }
    } catch { /* ignore */ }
    setCreating(false)
  }

  // Fetch analytics
  async function fetchAnalytics() {
    if (!selectedAccount) return
    setAnalyticsLoading(true)
    try {
      const params = new URLSearchParams({
        accountId: selectedAccount,
        pivot,
        timeGranularity: granularity,
        startDate: dateRange.start,
        endDate: dateRange.end,
      })
      const res = await fetch(`/api/linkedin/ads/analytics?${params}`)
      const data = res.ok ? await res.json() : { analytics: [] }
      setAnalytics(data.analytics || [])
    } catch { setAnalytics([]) }
    setAnalyticsLoading(false)
  }

  useEffect(() => {
    if (tab === 'analytics' && selectedAccount) fetchAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, selectedAccount, pivot, granularity, dateRange])

  const card: React.CSSProperties = {
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '0.875rem', padding: '1.25rem',
  }

  const btnPrimary: React.CSSProperties = {
    padding: '0.5rem 1.25rem', borderRadius: '0.5rem', border: 'none',
    background: '#0077b5', color: '#fff', fontSize: '0.8rem',
    fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  }

  const btnSecondary: React.CSSProperties = {
    padding: '0.5rem 1.25rem', borderRadius: '0.5rem',
    border: '1px solid var(--border)', background: 'transparent',
    color: 'var(--text-secondary)', fontSize: '0.8rem',
    fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.6rem 0.75rem',
    background: '#080810', border: '1px solid var(--border)',
    borderRadius: '0.5rem', color: 'var(--text-secondary)',
    fontFamily: 'inherit', fontSize: '0.85rem',
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading...</p>
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'content', label: 'Content' },
    { key: 'advertising', label: 'Advertising' },
    { key: 'analytics', label: 'Analytics' },
  ]

  // Aggregate analytics totals
  const totals = analytics.reduce(
    (acc, a) => ({
      impressions: acc.impressions + a.impressions,
      clicks: acc.clicks + a.clicks,
      spend: acc.spend + a.spend,
      conversions: acc.conversions + a.conversions,
    }),
    { impressions: 0, clicks: 0, spend: 0, conversions: 0 }
  )

  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', margin: 0 }}>
        LinkedIn
      </h1>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.25rem 0 1rem 0' }}>
        Content management, advertising, and analytics
      </p>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '0.5rem 1rem', background: 'none', border: 'none',
              color: tab === t.key ? '#0077b5' : 'var(--text-muted)',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
              borderBottom: tab === t.key ? '2px solid #0077b5' : '2px solid transparent',
              marginBottom: '-1px',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {tab === 'overview' && (
        <>
          {!member ? (
            <div style={{ ...card, textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Connect your LinkedIn account to get started
              </p>
              <a href="/api/linkedin/auth" style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-block' }}>
                Connect LinkedIn
              </a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Profile card */}
              <div style={{ ...card, display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {member.linkedin_avatar_url && (
                  <img
                    src={member.linkedin_avatar_url}
                    alt=""
                    style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid #0077b5' }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {member.linkedin_name}
                  </div>
                  {member.linkedin_headline && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {member.linkedin_headline}
                    </div>
                  )}
                  {member.archetype && (
                    <span style={{
                      display: 'inline-block', marginTop: '0.35rem',
                      padding: '0.15rem 0.5rem', borderRadius: '1rem',
                      background: '#0077b520', color: '#0077b5',
                      fontSize: '0.7rem', fontWeight: 600,
                    }}>
                      {member.archetype.style} {member.archetype.tier}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {member.linkedin_profile_url && (
                    <a href={member.linkedin_profile_url} target="_blank" rel="noopener noreferrer" style={btnSecondary}>
                      View Profile
                    </a>
                  )}
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {[
                  { label: 'Total Posts', value: member.total_posts, color: '#0077b5' },
                  { label: 'Engagements', value: member.total_engagements, color: '#6EE05A' },
                  { label: 'Ad Accounts', value: member.ad_account_ids?.length || 0, color: '#00d4ff' },
                  { label: 'Auto-posting', value: member.automated_posting_enabled ? 'ON' : 'OFF', color: member.automated_posting_enabled ? '#6EE05A' : '#666' },
                ].map(s => (
                  <div key={s.label} style={card}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, marginTop: '0.25rem' }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Content Tab ── */}
      {tab === 'content' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!member ? (
            <div style={{ ...card, textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Connect LinkedIn to create content</p>
              <a href="/api/linkedin/auth" style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-block', marginTop: '0.75rem' }}>
                Connect LinkedIn
              </a>
            </div>
          ) : (
            <>
              {/* Post composer */}
              <div style={card}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem 0' }}>
                  Post Composer
                </h2>
                <div style={{ marginBottom: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Enter a topic or idea for your post..."
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    style={inputStyle}
                    onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <button onClick={handleGenerate} disabled={generating || !topic.trim()} style={{
                    ...btnPrimary, opacity: generating || !topic.trim() ? 0.5 : 1,
                  }}>
                    {generating ? 'Generating...' : 'Generate with AI'}
                  </button>
                </div>
                {generatedContent && (
                  <>
                    <textarea
                      value={generatedContent}
                      onChange={e => setGeneratedContent(e.target.value)}
                      style={{
                        ...inputStyle, minHeight: 180, resize: 'vertical',
                        lineHeight: 1.6, marginBottom: '0.75rem',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button onClick={() => setGeneratedContent('')} style={btnSecondary}>
                        Discard
                      </button>
                      <button onClick={handlePublish} disabled={publishing} style={{
                        ...btnPrimary, opacity: publishing ? 0.5 : 1,
                      }}>
                        {publishing ? 'Publishing...' : 'Publish to LinkedIn'}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Recent posts */}
              <div style={card}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem 0' }}>
                  Recent Posts
                </h2>
                {posts.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>No posts yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {posts.slice(0, 10).map(p => (
                      <div key={p.id} style={{
                        padding: '0.75rem', background: '#080810',
                        borderRadius: '0.5rem', border: '1px solid var(--border)',
                      }}>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                          {p.content.slice(0, 200)}{p.content.length > 200 ? '...' : ''}
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {p.posted_at && <span>{new Date(p.posted_at).toLocaleDateString()}</span>}
                          {p.engagement_metrics && (
                            <>
                              {p.engagement_metrics.likes > 0 && <span>{p.engagement_metrics.likes} likes</span>}
                              {p.engagement_metrics.comments > 0 && <span>{p.engagement_metrics.comments} comments</span>}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Advertising Tab ── */}
      {tab === 'advertising' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!member ? (
            <div style={{ ...card, textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Connect LinkedIn to manage ads</p>
              <a href="/api/linkedin/auth" style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-block', marginTop: '0.75rem' }}>
                Connect LinkedIn
              </a>
            </div>
          ) : (
            <>
              {/* Account selector */}
              <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Ad Account:</label>
                {adAccounts.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No ad accounts found — check your LinkedIn permissions</span>
                ) : (
                  <select
                    value={selectedAccount}
                    onChange={e => setSelectedAccount(e.target.value)}
                    style={{ ...inputStyle, width: 'auto', flex: 1 }}
                  >
                    {adAccounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.status})</option>
                    ))}
                  </select>
                )}
                <button onClick={() => setShowCreateCampaign(!showCreateCampaign)} style={btnPrimary}>
                  New Campaign
                </button>
              </div>

              {/* Create campaign form */}
              {showCreateCampaign && (
                <div style={card}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem 0' }}>
                    Create Campaign
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Campaign Name</label>
                      <input
                        type="text"
                        placeholder="My Campaign"
                        value={newCampaign.name}
                        onChange={e => setNewCampaign(p => ({ ...p, name: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Type</label>
                      <select
                        value={newCampaign.type}
                        onChange={e => setNewCampaign(p => ({ ...p, type: e.target.value }))}
                        style={inputStyle}
                      >
                        <option value="SPONSORED_UPDATES">Sponsored Content</option>
                        <option value="TEXT_AD">Text Ad</option>
                        <option value="SPONSORED_INMAILS">Sponsored InMail</option>
                        <option value="DYNAMIC">Dynamic Ad</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Daily Budget (USD)</label>
                      <input
                        type="number"
                        placeholder="50.00"
                        value={newCampaign.budget}
                        onChange={e => setNewCampaign(p => ({ ...p, budget: e.target.value }))}
                        style={inputStyle}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button onClick={() => setShowCreateCampaign(false)} style={btnSecondary}>Cancel</button>
                    <button onClick={handleCreateCampaign} disabled={creating || !newCampaign.name} style={{
                      ...btnPrimary, opacity: creating || !newCampaign.name ? 0.5 : 1,
                    }}>
                      {creating ? 'Creating...' : 'Create Campaign'}
                    </button>
                  </div>
                </div>
              )}

              {/* Campaign list */}
              <div style={card}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem 0' }}>
                  Campaigns {campaignsLoading && '(loading...)'}
                </h3>
                {campaigns.length === 0 && !campaignsLoading ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>No campaigns found</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Name</th>
                          <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Status</th>
                          <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Type</th>
                          <th style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Daily Budget</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map(c => (
                          <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.5rem', color: 'var(--text-primary)' }}>{c.name}</td>
                            <td style={{ padding: '0.5rem' }}>
                              <StatusBadge status={c.status} />
                            </td>
                            <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{c.type.replace(/_/g, ' ')}</td>
                            <td style={{ padding: '0.5rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
                              {c.dailyBudget ? `$${c.dailyBudget.amount}` : '—'}
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

      {/* ── Analytics Tab ── */}
      {tab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!member ? (
            <div style={{ ...card, textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Connect LinkedIn to view analytics</p>
              <a href="/api/linkedin/auth" style={{ ...btnPrimary, textDecoration: 'none', display: 'inline-block', marginTop: '0.75rem' }}>
                Connect LinkedIn
              </a>
            </div>
          ) : (
            <>
              {/* Controls */}
              <div style={{ ...card, display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Ad Account</label>
                  <select value={selectedAccount} onChange={e => setSelectedAccount(e.target.value)} style={{ ...inputStyle, width: 'auto' }}>
                    {adAccounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                    {adAccounts.length === 0 && <option value="">No accounts</option>}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Pivot</label>
                  <select value={pivot} onChange={e => setPivot(e.target.value as typeof pivot)} style={{ ...inputStyle, width: 'auto' }}>
                    <option value="CAMPAIGN">By Campaign</option>
                    <option value="CREATIVE">By Creative</option>
                    <option value="ACCOUNT">By Account</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Granularity</label>
                  <select value={granularity} onChange={e => setGranularity(e.target.value as typeof granularity)} style={{ ...inputStyle, width: 'auto' }}>
                    <option value="DAILY">Daily</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="ALL">All</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Start</label>
                  <input type="date" value={dateRange.start} onChange={e => setDateRange(p => ({ ...p, start: e.target.value }))} style={{ ...inputStyle, width: 'auto' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>End</label>
                  <input type="date" value={dateRange.end} onChange={e => setDateRange(p => ({ ...p, end: e.target.value }))} style={{ ...inputStyle, width: 'auto' }} />
                </div>
                <button onClick={fetchAnalytics} disabled={analyticsLoading || !selectedAccount} style={{
                  ...btnPrimary, opacity: analyticsLoading || !selectedAccount ? 0.5 : 1,
                }}>
                  {analyticsLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {[
                  { label: 'Impressions', value: totals.impressions.toLocaleString(), color: '#0077b5' },
                  { label: 'Clicks', value: totals.clicks.toLocaleString(), color: '#6EE05A' },
                  { label: 'Spend', value: `$${totals.spend.toFixed(2)}`, color: '#00d4ff' },
                  { label: 'Conversions', value: totals.conversions.toLocaleString(), color: '#a78bfa' },
                ].map(m => (
                  <div key={m.label} style={card}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: m.color, marginTop: '0.25rem' }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Derived metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {[
                  { label: 'CTR', value: totals.impressions > 0 ? `${((totals.clicks / totals.impressions) * 100).toFixed(2)}%` : '0%' },
                  { label: 'CPC', value: totals.clicks > 0 ? `$${(totals.spend / totals.clicks).toFixed(2)}` : '$0.00' },
                  { label: 'CPM', value: totals.impressions > 0 ? `$${((totals.spend / totals.impressions) * 1000).toFixed(2)}` : '$0.00' },
                ].map(m => (
                  <div key={m.label} style={card}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Data table */}
              {analytics.length > 0 && (
                <div style={card}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 0.75rem 0' }}>Breakdown</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>{pivot}</th>
                          <th style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Impressions</th>
                          <th style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Clicks</th>
                          <th style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>CTR</th>
                          <th style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Spend</th>
                          <th style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>CPC</th>
                          <th style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Conv.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.map((a, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '0.5rem', color: 'var(--text-primary)' }}>{a.pivotValue || '—'}</td>
                            <td style={{ padding: '0.5rem', color: 'var(--text-secondary)', textAlign: 'right' }}>{a.impressions.toLocaleString()}</td>
                            <td style={{ padding: '0.5rem', color: 'var(--text-secondary)', textAlign: 'right' }}>{a.clicks.toLocaleString()}</td>
                            <td style={{ padding: '0.5rem', color: 'var(--text-secondary)', textAlign: 'right' }}>{(a.ctr * 100).toFixed(2)}%</td>
                            <td style={{ padding: '0.5rem', color: 'var(--text-secondary)', textAlign: 'right' }}>${a.spend.toFixed(2)}</td>
                            <td style={{ padding: '0.5rem', color: 'var(--text-secondary)', textAlign: 'right' }}>${a.cpc.toFixed(2)}</td>
                            <td style={{ padding: '0.5rem', color: 'var(--text-secondary)', textAlign: 'right' }}>{a.conversions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    ACTIVE: { bg: '#6EE05A20', text: '#6EE05A' },
    PAUSED: { bg: '#f5a62320', text: '#f5a623' },
    DRAFT: { bg: '#0077b520', text: '#0077b5' },
    ARCHIVED: { bg: '#4A556820', text: '#666' },
    CANCELED: { bg: '#ff4d4f20', text: '#ff4d4f' },
  }
  const c = colors[status] || colors.DRAFT
  return (
    <span style={{
      padding: '0.15rem 0.5rem', borderRadius: '1rem',
      background: c.bg, color: c.text,
      fontSize: '0.7rem', fontWeight: 600,
    }}>
      {status}
    </span>
  )
}
