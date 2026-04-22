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
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-5 py-4 flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon size={18} color={color} />
      </div>
      <div>
        <div className="text-xl font-bold text-[var(--text-primary)] font-mono">{value}</div>
        <div className="text-xs text-[var(--text-muted)] mt-px">{label}</div>
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
    <span
      className="text-[0.7rem] font-semibold uppercase tracking-[0.04em] px-2 py-0.5 rounded-full"
      style={{ background: `${color}20`, color }}
    >
      {status || 'unknown'}
    </span>
  )
}

// ── Not Connected View ───────────────────────────────────────
function NotConnectedView({ onNavigateVault }: { onNavigateVault: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-[420px] w-full rounded-3xl p-10 text-center bg-[var(--bg-card)] border border-[var(--border)]">
        <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-[0_0_24px_rgba(59,130,246,0.3)] bg-gradient-to-br from-blue-500 to-blue-700">
          <Mail size={28} color="#fff" />
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
          Connect Smartlead
        </h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
          Add your Smartlead API key in the Vault to unlock cold email campaigns, lead management, sequences, and outreach analytics.
        </p>
        <button
          onClick={onNavigateVault}
          className="w-full py-3 px-6 rounded-xl font-semibold text-sm text-white transition-all duration-150 bg-gradient-to-br from-blue-500 to-blue-700 hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(59,130,246,0.4)] border-0 cursor-pointer"
        >
          Open Vault → Add API Key
        </button>
        <a
          href="https://app.smartlead.ai/app/settings/api"
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-[var(--text-muted)] mt-4 underline"
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
    <div
      className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-[6px] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-8 w-full max-w-[420px] animate-[console-scale-in_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">New Campaign</h3>
          <button onClick={onClose} className="bg-transparent border-0 cursor-pointer text-[var(--text-muted)]">
            <X size={18} />
          </button>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Campaign name..."
          autoFocus
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] text-sm outline-none font-[inherit] focus:border-blue-500 transition-colors"
          onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onCreate(name.trim()) }}
        />
        <button
          onClick={() => { if (name.trim()) onCreate(name.trim()) }}
          disabled={!name.trim() || creating}
          className="w-full mt-4 py-3 rounded-xl border-0 cursor-pointer font-semibold text-sm font-[inherit] transition-opacity disabled:opacity-60"
          style={{
            background: name.trim() ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 'var(--border)',
            color: name.trim() ? '#fff' : 'var(--text-muted)',
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
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] cursor-pointer transition-all duration-150 font-[inherit] text-left hover:bg-blue-500/[0.06]"
    >
      <div className="flex-1 min-w-0">
        <div className="text-[0.9rem] font-semibold text-[var(--text-primary)] mb-1 truncate">
          {campaign.name}
        </div>
        <div className="flex gap-4 text-xs text-[var(--text-muted)]">
          {campaign.lead_count != null && <span>{campaign.lead_count} leads</span>}
          {campaign.sent_count != null && <span>{campaign.sent_count} sent</span>}
          {campaign.reply_count != null && <span>{campaign.reply_count} replies</span>}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
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
    <div className="px-6 py-6 max-w-3xl mx-auto w-full">
      <button onClick={onBack} className="bg-transparent border-0 cursor-pointer text-blue-500 text-[0.8rem] font-semibold mb-4 flex items-center gap-1 font-[inherit]">
        ← Back to Campaigns
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] flex-1">{campaign.name}</h2>
        <StatusBadge status={campaign.status} />
      </div>

      {/* Stats Row */}
      <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
        <StatCard label="Sent" value={campaign.sent_count || 0} icon={Mail} color="#3b82f6" />
        <StatCard label="Opens" value={campaign.open_count || 0} icon={Eye} color="#22c55e" />
        <StatCard label="Clicks" value={campaign.click_count || 0} icon={MousePointerClick} color="#f59e0b" />
        <StatCard label="Replies" value={campaign.reply_count || 0} icon={MessageSquare} color="#a855f7" />
        <StatCard label="Bounces" value={campaign.bounce_count || 0} icon={AlertTriangle} color="#ef4444" />
      </div>

      {/* Leads Table */}
      <h3 className="text-[0.9rem] font-semibold text-[var(--text-primary)] mb-3">
        Leads {leads.length > 0 && <span className="text-[var(--text-muted)] font-normal">({leads.length})</span>}
      </h3>

      {loading ? (
        <div className="py-8 text-center text-[var(--text-muted)]">
          <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
          Loading leads...
        </div>
      ) : leads.length === 0 ? (
        <div className="py-8 text-center rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] text-sm">
          No leads in this campaign yet.
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] overflow-hidden">
          <table className="w-full border-collapse text-[0.8rem]">
            <thead>
              <tr className="bg-[var(--bg-card)]">
                <th className="px-4 py-2.5 text-left text-[var(--text-muted)] font-semibold border-b border-[var(--border)]">Email</th>
                <th className="px-4 py-2.5 text-left text-[var(--text-muted)] font-semibold border-b border-[var(--border)]">Name</th>
                <th className="px-4 py-2.5 text-left text-[var(--text-muted)] font-semibold border-b border-[var(--border)]">Company</th>
                <th className="px-4 py-2.5 text-left text-[var(--text-muted)] font-semibold border-b border-[var(--border)]">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.slice(0, 50).map((lead, i) => (
                <tr key={lead.id || i} className="border-b border-[var(--border)]">
                  <td className="px-4 py-2.5 text-[var(--text-primary)] font-mono text-xs">{lead.email}</td>
                  <td className="px-4 py-2.5 text-[var(--text-secondary)]">{[lead.first_name, lead.last_name].filter(Boolean).join(' ') || '—'}</td>
                  <td className="px-4 py-2.5 text-[var(--text-secondary)]">{lead.company_name || '—'}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={lead.status || 'pending'} /></td>
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
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[1.35rem] font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Mail size={22} color="#3b82f6" />
              Smartlead
            </h1>
            <p className="text-[0.8rem] text-[var(--text-muted)] mt-1">
              Cold email campaigns, leads, and outreach analytics
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchCampaigns()}
              disabled={loading}
              className="p-2 rounded-lg cursor-pointer bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-secondary)] flex items-center"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="px-4 py-2 rounded-lg cursor-pointer font-semibold text-[0.8rem] flex items-center gap-1.5 font-[inherit] text-white border-0 bg-gradient-to-br from-blue-500 to-blue-700"
            >
              <Plus size={15} /> New Campaign
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 rounded-lg mb-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[0.8rem] flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="bg-transparent border-0 cursor-pointer text-red-500"><X size={14} /></button>
          </div>
        )}

        {/* Stats Grid */}
        {stats && stats.total_campaigns > 0 && (
          <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
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
          <div className="py-12 text-center text-[var(--text-muted)]">
            <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
            <div>Loading campaigns...</div>
          </div>
        )}

        {/* Empty */}
        {!loading && campaigns.length === 0 && connected !== null && connected && (
          <div className="py-12 text-center rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
            <Mail size={32} color="var(--text-muted)" className="mx-auto mb-3" />
            <p className="text-[var(--text-secondary)] text-[0.9rem] font-semibold mb-1">No campaigns yet</p>
            <p className="text-[var(--text-muted)] text-[0.8rem] mb-4">Create your first cold email campaign to get started.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-5 py-2.5 rounded-lg cursor-pointer bg-blue-500 border-0 text-white font-semibold text-[0.8rem] font-[inherit]"
            >
              Create Campaign
            </button>
          </div>
        )}

        {/* Campaign List */}
        {campaigns.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-[0.85rem] font-semibold text-[var(--text-muted)] uppercase tracking-[0.05em] mb-1">
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
