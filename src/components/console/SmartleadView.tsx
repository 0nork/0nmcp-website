'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Plus, Users, Mail, BarChart3, ChevronRight, X, Upload, Eye, MousePointerClick, MessageSquare, AlertTriangle } from 'lucide-react'
import type { useSmartlead } from '@/lib/console/useSmartlead'

type SmartleadHook = ReturnType<typeof useSmartlead>

interface SmartleadViewProps {
  smartlead: SmartleadHook
  onNavigateVault: () => void
}

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: typeof Mail; color: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '0.75rem',
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '0.5rem',
        background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{value}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
      </div>
    </div>
  )
}

// ── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = (status || '').toLowerCase()
  const color = s === 'completed' ? '#22c55e'
    : s === 'in_progress' || s === 'active' ? '#3b82f6'
    : s === 'paused' ? '#f59e0b'
    : s === 'draft' ? '#6b7280'
    : '#e2e2e2'
  return (
    <span style={{
      fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase',
      padding: '0.15rem 0.5rem', borderRadius: 999,
      background: `${color}20`, color, letterSpacing: '0.04em',
    }}>{status || 'unknown'}</span>
  )
}

// ── Not Connected View ───────────────────────────────────────
function NotConnectedView({ onNavigateVault }: { onNavigateVault: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div style={{
        maxWidth: 420, width: '100%', borderRadius: '1.5rem',
        padding: '2.5rem 2rem', textAlign: 'center',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '1rem', margin: '0 auto 1.25rem',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 24px rgba(59,130,246,0.3)',
        }}>
          <Mail size={28} color="#fff" />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Connect Smartlead
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          Add your Smartlead API key in the Vault to unlock cold email campaigns, lead management, sequences, and outreach analytics.
        </p>
        <button
          onClick={onNavigateVault}
          style={{
            width: '100%', padding: '0.75rem 1.5rem', borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: '#fff', fontWeight: 600, fontSize: '0.875rem',
            border: 'none', cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(59,130,246,0.4)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
        >
          Open Vault → Add API Key
        </button>
        <a
          href="https://app.smartlead.ai/app/settings/api"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem', textDecoration: 'underline' }}
        >
          Get your Smartlead API key →
        </a>
      </div>
    </div>
  )
}

// ── Create Campaign Modal ────────────────────────────────────
function CreateCampaignModal({ onClose, onCreate, creating }: { onClose: () => void; onCreate: (name: string) => void; creating: boolean }) {
  const [name, setName] = useState('')
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: 420,
        animation: 'console-scale-in 0.2s ease-out',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>New Campaign</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Campaign name..."
          autoFocus
          style={{
            width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem',
            background: 'var(--bg-primary)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', fontSize: '0.875rem',
            outline: 'none', fontFamily: 'inherit',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onCreate(name.trim()) }}
        />
        <button
          onClick={() => { if (name.trim()) onCreate(name.trim()) }}
          disabled={!name.trim() || creating}
          style={{
            width: '100%', marginTop: '1rem', padding: '0.75rem',
            borderRadius: '0.75rem', border: 'none', cursor: 'pointer',
            background: name.trim() ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'var(--border)',
            color: name.trim() ? '#fff' : 'var(--text-muted)',
            fontWeight: 600, fontSize: '0.875rem', fontFamily: 'inherit',
            opacity: creating ? 0.6 : 1,
          }}
        >
          {creating ? 'Creating...' : 'Create Campaign'}
        </button>
      </div>
    </div>
  )
}

// ── Campaign Row ─────────────────────────────────────────────
function CampaignRow({ campaign, onSelect }: { campaign: SmartleadHook['campaigns'][0]; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 1.25rem', borderRadius: '0.75rem',
        background: hovered ? 'rgba(59,130,246,0.06)' : 'var(--bg-card)',
        border: '1px solid var(--border)', cursor: 'pointer',
        transition: 'all 0.15s ease', fontFamily: 'inherit', textAlign: 'left',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {campaign.name}
        </div>
        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {campaign.lead_count != null && <span>{campaign.lead_count} leads</span>}
          {campaign.sent_count != null && <span>{campaign.sent_count} sent</span>}
          {campaign.reply_count != null && <span>{campaign.reply_count} replies</span>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
        <StatusBadge status={campaign.status} />
        <ChevronRight size={16} color="var(--text-muted)" />
      </div>
    </button>
  )
}

// ── Campaign Detail ──────────────────────────────────────────
function CampaignDetail({ campaign, leads, loading, onBack, onFetchLeads }: {
  campaign: SmartleadHook['campaigns'][0]
  leads: SmartleadHook['leads']
  loading: boolean
  onBack: () => void
  onFetchLeads: (id: number) => void
}) {
  useEffect(() => { onFetchLeads(campaign.id) }, [campaign.id, onFetchLeads])

  return (
    <div style={{ padding: '1.5rem', maxWidth: 800, margin: '0 auto', width: '100%' }}>
      <button onClick={onBack} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem',
        display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'inherit',
      }}>
        ← Back to Campaigns
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>{campaign.name}</h2>
        <StatusBadge status={campaign.status} />
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <StatCard label="Sent" value={campaign.sent_count || 0} icon={Mail} color="#3b82f6" />
        <StatCard label="Opens" value={campaign.open_count || 0} icon={Eye} color="#22c55e" />
        <StatCard label="Clicks" value={campaign.click_count || 0} icon={MousePointerClick} color="#f59e0b" />
        <StatCard label="Replies" value={campaign.reply_count || 0} icon={MessageSquare} color="#a855f7" />
        <StatCard label="Bounces" value={campaign.bounce_count || 0} icon={AlertTriangle} color="#ef4444" />
      </div>

      {/* Leads Table */}
      <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
        Leads {leads.length > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({leads.length})</span>}
      </h3>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
          Loading leads...
        </div>
      ) : leads.length === 0 ? (
        <div style={{
          padding: '2rem', textAlign: 'center', borderRadius: '0.75rem',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          color: 'var(--text-muted)', fontSize: '0.875rem',
        }}>
          No leads in this campaign yet.
        </div>
      ) : (
        <div style={{
          borderRadius: '0.75rem', border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-card)' }}>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Email</th>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Name</th>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Company</th>
                <th style={{ padding: '0.6rem 1rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 50).map((lead, i) => (
                <tr key={lead.id || i} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.6rem 1rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{lead.email}</td>
                  <td style={{ padding: '0.6rem 1rem', color: 'var(--text-secondary)' }}>{[lead.first_name, lead.last_name].filter(Boolean).join(' ') || '—'}</td>
                  <td style={{ padding: '0.6rem 1rem', color: 'var(--text-secondary)' }}>{lead.company_name || '—'}</td>
                  <td style={{ padding: '0.6rem 1rem' }}><StatusBadge status={lead.status || 'pending'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Main View ────────────────────────────────────────────────
export function SmartleadView({ smartlead, onNavigateVault }: SmartleadViewProps) {
  const {
    campaigns, leads, stats, loading, creating, error, connected,
    fetchCampaigns, fetchLeads, createCampaign, setError,
  } = smartlead

  const [showCreate, setShowCreate] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<SmartleadHook['campaigns'][0] | null>(null)

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])

  const handleCreate = useCallback(async (name: string) => {
    const result = await createCampaign(name)
    if (result) setShowCreate(false)
  }, [createCampaign])

  // Not connected
  if (connected === false) {
    return <NotConnectedView onNavigateVault={onNavigateVault} />
  }

  // Campaign detail
  if (selectedCampaign) {
    return (
      <CampaignDetail
        campaign={selectedCampaign}
        leads={leads}
        loading={loading}
        onBack={() => setSelectedCampaign(null)}
        onFetchLeads={fetchLeads}
      />
    )
  }

  // Main campaigns list
  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '1.5rem' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Mail size={22} color="#3b82f6" />
              Smartlead
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Cold email campaigns, leads, and outreach analytics
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => fetchCampaigns()}
              disabled={loading}
              style={{
                padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', display: 'flex', alignItems: 'center',
              }}
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                border: 'none', color: '#fff', fontWeight: 600, fontSize: '0.8rem',
                display: 'flex', alignItems: 'center', gap: '0.35rem', fontFamily: 'inherit',
              }}
            >
              <Plus size={15} /> New Campaign
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><X size={14} /></button>
          </div>
        )}

        {/* Stats Grid */}
        {stats && stats.total_campaigns > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <StatCard label="Campaigns" value={stats.total_campaigns} icon={Mail} color="#3b82f6" />
            <StatCard label="Total Leads" value={stats.total_leads.toLocaleString()} icon={Users} color="#22c55e" />
            <StatCard label="Emails Sent" value={stats.total_sent.toLocaleString()} icon={Upload} color="#a855f7" />
            <StatCard label="Open Rate" value={`${stats.open_rate}%`} icon={Eye} color="#f59e0b" />
            <StatCard label="Reply Rate" value={`${stats.reply_rate}%`} icon={MessageSquare} color="#10b981" />
            <StatCard label="Analytics" value={`${stats.click_rate}% CTR`} icon={BarChart3} color="#ec4899" />
          </div>
        )}

        {/* Loading */}
        {loading && campaigns.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 0.75rem' }} />
            <div>Loading campaigns...</div>
          </div>
        )}

        {/* Empty */}
        {!loading && campaigns.length === 0 && connected !== null && connected && (
          <div style={{
            padding: '3rem', textAlign: 'center', borderRadius: '0.75rem',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
          }}>
            <Mail size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: 4 }}>No campaigns yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>Create your first cold email campaign to get started.</p>
            <button
              onClick={() => setShowCreate(true)}
              style={{
                padding: '0.6rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer',
                background: '#3b82f6', border: 'none', color: '#fff',
                fontWeight: 600, fontSize: '0.8rem', fontFamily: 'inherit',
              }}
            >
              Create Campaign
            </button>
          </div>
        )}

        {/* Campaign List */}
        {campaigns.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
              Campaigns ({campaigns.length})
            </h2>
            {campaigns.map((c) => (
              <CampaignRow key={c.id} campaign={c} onSelect={() => setSelectedCampaign(c)} />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <CreateCampaignModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          creating={creating}
        />
      )}
    </div>
  )
}
