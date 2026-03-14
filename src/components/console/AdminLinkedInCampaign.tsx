'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Linkedin,
  Users,
  Zap,
  BarChart3,
  RefreshCw,
  Play,
  Pause,
  Settings,
  Activity,
  TrendingUp,
  Clock,
  Target,
  RotateCcw,
  Trash2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

interface CampaignStats {
  totalMembers: number
  automatedMembers: number
  onboardedMembers: number
  totalPosts: number
  totalEngagements: number
  totalVariants: number
  totalSegments: number
}

interface MemberRow {
  id: string
  linkedin_name: string
  linkedin_headline: string | null
  archetype: { tier: string; domain: string; style: string } | null
  automated_posting_enabled: boolean
  posting_frequency: string
  total_posts: number
  total_engagements: number
  onboarding_completed: boolean
  last_post_at: string | null
  created_at: string
}

interface VariantRow {
  id: string
  variant_key: string
  question_text: string
  alpha: number
  beta: number
  is_seed: boolean
  parent_variant_id: string | null
  created_at: string
}

interface SegmentRow {
  id: string
  segment_key: string
  sample_size: number
  avg_conversion_rate: number
  top_performing_variants: string[]
  updated_at: string
}

interface RecentPost {
  id: string
  member_id: string
  content: string
  linkedin_post_id: string | null
  posted_at: string | null
  created_at: string
}

interface ToolCallRow {
  id: string
  tool_name: string
  member_id: string | null
  success: boolean
  execution_time_ms: number
  created_at: string
}

type Tab = 'overview' | 'members' | 'variants' | 'segments' | 'posts' | 'activity'

export function AdminLinkedInCampaign() {
  const [tab, setTab] = useState<Tab>('overview')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [stats, setStats] = useState<CampaignStats | null>(null)
  const [members, setMembers] = useState<MemberRow[]>([])
  const [variants, setVariants] = useState<VariantRow[]>([])
  const [segments, setSegments] = useState<SegmentRow[]>([])
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([])
  const [recentToolCalls, setRecentToolCalls] = useState<ToolCallRow[]>([])
  const [cronResult, setCronResult] = useState<Record<string, unknown> | null>(null)
  const [expandedMember, setExpandedMember] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/linkedin-campaign?section=overview')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setStats(data.stats)
      setMembers(data.members || [])
      setVariants(data.variants || [])
      setSegments(data.segments || [])
      setRecentPosts(data.recentPosts || [])
      setRecentToolCalls(data.recentToolCalls || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const doAction = async (body: Record<string, unknown>, loadingKey?: string) => {
    setActionLoading(loadingKey || 'action')
    try {
      const res = await fetch('/api/admin/linkedin-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Action failed')
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed')
      return null
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleMember = async (memberId: string, enabled: boolean) => {
    const result = await doAction({ action: 'toggle_member_automation', member_id: memberId, enabled }, memberId)
    if (result?.success) {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, automated_posting_enabled: enabled } : m))
    }
  }

  const handleUpdateFrequency = async (memberId: string, frequency: string) => {
    const result = await doAction({ action: 'update_member_frequency', member_id: memberId, frequency }, `freq-${memberId}`)
    if (result?.success) {
      setMembers(prev => prev.map(m => m.id === memberId ? { ...m, posting_frequency: frequency } : m))
    }
  }

  const handleBulkToggle = async (enabled: boolean) => {
    const result = await doAction({ action: 'bulk_toggle_automation', enabled }, 'bulk')
    if (result?.success) {
      setMembers(prev => prev.map(m => ({ ...m, automated_posting_enabled: enabled })))
    }
  }

  const handleTriggerCron = async () => {
    setCronResult(null)
    const result = await doAction({ action: 'trigger_cron' }, 'cron')
    if (result?.cronResult) setCronResult(result.cronResult)
  }

  const handleResetVariant = async (variantId: string) => {
    const result = await doAction({ action: 'reset_variant_weights', variant_id: variantId }, `reset-${variantId}`)
    if (result?.success) {
      setVariants(prev => prev.map(v => v.id === variantId ? { ...v, alpha: 1, beta: 1 } : v))
    }
  }

  const handleDeleteVariant = async (variantId: string) => {
    const result = await doAction({ action: 'delete_variant', variant_id: variantId }, `del-${variantId}`)
    if (result?.success) {
      setVariants(prev => prev.filter(v => v.id !== variantId))
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ marginLeft: '0.5rem' }}>Loading campaign data...</span>
      </div>
    )
  }

  const TABS: { key: Tab; label: string; icon: typeof Activity }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'members', label: 'Members', icon: Users },
    { key: 'variants', label: 'LVOS Variants', icon: Target },
    { key: 'segments', label: 'CUCIA Segments', icon: TrendingUp },
    { key: 'posts', label: 'Posts', icon: Linkedin },
    { key: 'activity', label: 'Activity', icon: Activity },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Error banner */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.75rem 1rem', borderRadius: '0.75rem',
          background: 'rgba(255,59,48,0.1)', border: '1px solid rgba(255,59,48,0.2)',
          color: '#ff6b6b', fontSize: '0.8rem',
        }}>
          {error}
          <button onClick={() => setError(null)} style={{
            marginLeft: 'auto', background: 'none', border: 'none', color: '#ff6b6b',
            cursor: 'pointer', textDecoration: 'underline', fontSize: '0.75rem',
          }}>Dismiss</button>
        </div>
      )}

      {/* Tab strip */}
      <div style={{
        display: 'flex', gap: '0.25rem', overflowX: 'auto',
        borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem',
      }}>
        {TABS.map(t => {
          const Icon = t.icon
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                border: 'none', cursor: 'pointer',
                background: active ? 'rgba(126,217,87,0.1)' : 'transparent',
                color: active ? '#7ed957' : 'var(--text-secondary)',
                fontSize: '0.78rem', fontWeight: active ? 600 : 500,
                whiteSpace: 'nowrap', transition: 'all 0.15s ease',
              }}
            >
              <Icon size={14} />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* ─── Overview ─── */}
      {tab === 'overview' && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {[
              { label: 'Members', value: stats.totalMembers, color: '#0077B5' },
              { label: 'Onboarded', value: stats.onboardedMembers, color: '#7ed957' },
              { label: 'Automated', value: stats.automatedMembers, color: '#ffbb33' },
              { label: 'Total Posts', value: stats.totalPosts, color: '#00d4ff' },
              { label: 'Engagements', value: stats.totalEngagements, color: '#c084fc' },
              { label: 'LVOS Variants', value: stats.totalVariants, color: '#f97316' },
              { label: 'CUCIA Segments', value: stats.totalSegments, color: '#14b8a6' },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem',
                padding: '1rem', border: '1px solid var(--border)',
              }}>
                <div style={{
                  fontSize: '0.65rem', color: 'var(--text-muted)',
                  fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                  marginBottom: '0.375rem',
                }}>{s.label}</div>
                <div style={{
                  fontSize: '1.5rem', fontWeight: 700, color: s.color,
                  fontFamily: 'var(--font-mono)',
                }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{
            display: 'flex', gap: '0.5rem', flexWrap: 'wrap',
            padding: '1rem', borderRadius: '0.75rem',
            background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', alignSelf: 'center', marginRight: '0.5rem' }}>
              Quick Actions
            </span>
            <ActionButton
              icon={Play}
              label="Trigger Cron"
              color="#7ed957"
              loading={actionLoading === 'cron'}
              onClick={handleTriggerCron}
            />
            <ActionButton
              icon={Zap}
              label="Enable All"
              color="#ffbb33"
              loading={actionLoading === 'bulk'}
              onClick={() => handleBulkToggle(true)}
            />
            <ActionButton
              icon={Pause}
              label="Pause All"
              color="#ff6b6b"
              loading={actionLoading === 'bulk'}
              onClick={() => handleBulkToggle(false)}
            />
            <ActionButton
              icon={RefreshCw}
              label="Refresh"
              color="#00d4ff"
              loading={loading}
              onClick={fetchData}
            />
          </div>

          {/* Cron result */}
          {cronResult && (
            <div style={{
              padding: '1rem', borderRadius: '0.75rem',
              background: 'rgba(126,217,87,0.05)', border: '1px solid rgba(126,217,87,0.2)',
            }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#7ed957', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Cron Result
              </div>
              <pre style={{
                fontSize: '0.75rem', color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)', whiteSpace: 'pre-wrap', margin: 0,
              }}>
                {JSON.stringify(cronResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ─── Members ─── */}
      {tab === 'members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {members.length === 0 ? (
            <EmptyState text="No LinkedIn members yet" />
          ) : members.map(member => {
            const expanded = expandedMember === member.id
            return (
              <div key={member.id} style={{
                borderRadius: '0.75rem', border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.02)', overflow: 'hidden',
              }}>
                {/* Header row */}
                <button
                  onClick={() => setExpandedMember(expanded ? null : member.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    width: '100%', padding: '0.75rem 1rem',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-primary)', textAlign: 'left',
                  }}
                >
                  {expanded ? <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> : <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {member.linkedin_name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {member.linkedin_headline || 'No headline'}
                    </div>
                  </div>
                  {/* Archetype tags */}
                  {member.archetype && (
                    <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                      {[member.archetype.tier, member.archetype.domain, member.archetype.style].map(tag => (
                        <span key={tag} style={{
                          padding: '0.125rem 0.5rem', borderRadius: '9999px',
                          fontSize: '0.6rem', fontWeight: 600,
                          background: 'rgba(126,217,87,0.08)', color: 'var(--text-secondary)',
                          border: '1px solid var(--border)',
                        }}>{tag}</span>
                      ))}
                    </div>
                  )}
                  {/* Status badges */}
                  <StatusBadge active={member.automated_posting_enabled} label={member.automated_posting_enabled ? 'Auto' : 'Manual'} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                    {member.total_posts}p
                  </div>
                </button>

                {/* Expanded controls */}
                {expanded && (
                  <div style={{
                    padding: '0.75rem 1rem', borderTop: '1px solid var(--border)',
                    display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Automation:</span>
                      <button
                        onClick={() => handleToggleMember(member.id, !member.automated_posting_enabled)}
                        disabled={actionLoading === member.id}
                        style={{
                          padding: '0.25rem 0.75rem', borderRadius: '0.375rem',
                          fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
                          border: '1px solid',
                          ...(member.automated_posting_enabled
                            ? { background: 'rgba(255,59,48,0.1)', borderColor: 'rgba(255,59,48,0.2)', color: '#ff6b6b' }
                            : { background: 'rgba(126,217,87,0.1)', borderColor: 'rgba(126,217,87,0.2)', color: '#7ed957' }
                          ),
                        }}
                      >
                        {member.automated_posting_enabled ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Frequency:</span>
                      <select
                        value={member.posting_frequency}
                        onChange={e => handleUpdateFrequency(member.id, e.target.value)}
                        style={{
                          padding: '0.25rem 0.5rem', borderRadius: '0.375rem',
                          fontSize: '0.7rem', background: 'var(--bg-secondary)',
                          border: '1px solid var(--border)', color: 'var(--text-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="biweekly">Biweekly</option>
                      </select>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Posts: <strong style={{ color: 'var(--text-primary)' }}>{member.total_posts}</strong>
                      {' '} | Engagements: <strong style={{ color: 'var(--text-primary)' }}>{member.total_engagements}</strong>
                      {' '} | Last: <strong style={{ color: 'var(--text-primary)' }}>{member.last_post_at ? timeAgo(member.last_post_at) : 'Never'}</strong>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ─── LVOS Variants ─── */}
      {tab === 'variants' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {variants.length === 0 ? (
            <EmptyState text="No LVOS variants yet" />
          ) : variants.map(v => {
            const winRate = v.alpha + v.beta > 2
              ? ((v.alpha - 1) / ((v.alpha - 1) + (v.beta - 1)) * 100).toFixed(1)
              : '—'
            const samples = (v.alpha - 1) + (v.beta - 1)
            return (
              <div key={v.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', borderRadius: '0.75rem',
                border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.125rem' }}>
                    {v.question_text}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem' }}>
                    <span>{v.variant_key}</span>
                    <span>{v.is_seed ? 'Seed' : 'Generated'}</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                      a={v.alpha.toFixed(1)} b={v.beta.toFixed(1)}
                    </span>
                    <span>Samples: {samples}</span>
                    <span>Win: {winRate}%</span>
                  </div>
                </div>
                <button
                  onClick={() => handleResetVariant(v.id)}
                  disabled={actionLoading === `reset-${v.id}`}
                  title="Reset weights"
                  style={{
                    padding: '0.25rem', borderRadius: '0.375rem',
                    border: '1px solid var(--border)', background: 'none',
                    cursor: 'pointer', color: 'var(--text-muted)',
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <RotateCcw size={13} />
                </button>
                {!v.is_seed && (
                  <button
                    onClick={() => handleDeleteVariant(v.id)}
                    disabled={actionLoading === `del-${v.id}`}
                    title="Delete variant"
                    style={{
                      padding: '0.25rem', borderRadius: '0.375rem',
                      border: '1px solid rgba(255,59,48,0.2)', background: 'none',
                      cursor: 'pointer', color: '#ff6b6b',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ─── CUCIA Segments ─── */}
      {tab === 'segments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {segments.length === 0 ? (
            <EmptyState text="No CUCIA segments yet. Segments populate as users onboard." />
          ) : segments.map(seg => (
            <div key={seg.id} style={{
              padding: '0.75rem 1rem', borderRadius: '0.75rem',
              border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  padding: '0.25rem 0.625rem', borderRadius: '0.375rem',
                  background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)',
                  fontSize: '0.7rem', fontWeight: 600, color: '#00d4ff',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {seg.segment_key}
                </div>
                <div style={{ flex: 1 }} />
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Samples: <strong style={{ color: 'var(--text-primary)' }}>{seg.sample_size}</strong>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Conv: <strong style={{ color: seg.avg_conversion_rate > 0.3 ? '#7ed957' : 'var(--text-primary)' }}>
                    {(seg.avg_conversion_rate * 100).toFixed(1)}%
                  </strong>
                </div>
              </div>
              {seg.top_performing_variants.length > 0 && (
                <div style={{ marginTop: '0.375rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  Top variants: {seg.top_performing_variants.slice(0, 3).map(v => v.slice(0, 8)).join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ─── Posts ─── */}
      {tab === 'posts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {recentPosts.length === 0 ? (
            <EmptyState text="No automated posts yet" />
          ) : recentPosts.map(post => (
            <div key={post.id} style={{
              padding: '0.75rem 1rem', borderRadius: '0.75rem',
              border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
                <Linkedin size={13} style={{ color: '#0077B5', flexShrink: 0 }} />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {post.member_id.slice(0, 8)}...
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  {post.posted_at ? timeAgo(post.posted_at) : 'Not posted'}
                </span>
                {post.linkedin_post_id && (
                  <StatusBadge active label="Published" />
                )}
              </div>
              <div style={{
                fontSize: '0.78rem', color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap', maxHeight: '4rem', overflow: 'hidden',
                lineHeight: 1.5,
              }}>
                {post.content.length > 200 ? post.content.slice(0, 200) + '...' : post.content}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Activity Log ─── */}
      {tab === 'activity' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {recentToolCalls.length === 0 ? (
            <EmptyState text="No tool call activity yet" />
          ) : recentToolCalls.map(call => (
            <div key={call.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
              background: 'rgba(255,255,255,0.015)',
            }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: call.success ? '#7ed957' : '#ff4444', flexShrink: 0,
              }} />
              <span style={{
                fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)', minWidth: '140px',
              }}>
                {call.tool_name}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {call.execution_time_ms}ms
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', flex: 1 }}>
                {call.member_id ? call.member_id.slice(0, 8) + '...' : 'system'}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {timeAgo(call.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ActionButton({ icon: Icon, label, color, loading, onClick }: {
  icon: typeof Play; label: string; color: string; loading: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.375rem',
        padding: '0.375rem 0.75rem', borderRadius: '0.5rem',
        background: `${color}15`, border: `1px solid ${color}30`,
        color, fontSize: '0.72rem', fontWeight: 600,
        cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1,
        transition: 'all 0.15s ease',
      }}
    >
      {loading
        ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} />
        : <Icon size={13} />
      }
      {label}
    </button>
  )
}

function StatusBadge({ active, label }: { active: boolean; label: string }) {
  return (
    <span style={{
      padding: '0.125rem 0.5rem', borderRadius: '9999px',
      fontSize: '0.6rem', fontWeight: 600,
      background: active ? 'rgba(126,217,87,0.1)' : 'rgba(255,255,255,0.04)',
      color: active ? '#7ed957' : 'var(--text-muted)',
      border: `1px solid ${active ? 'rgba(126,217,87,0.2)' : 'var(--border)'}`,
      flexShrink: 0,
    }}>
      {label}
    </span>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{
      padding: '2rem', textAlign: 'center',
      color: 'var(--text-muted)', fontSize: '0.8rem',
      borderRadius: '0.75rem', border: '1px dashed var(--border)',
    }}>
      {text}
    </div>
  )
}

function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}
