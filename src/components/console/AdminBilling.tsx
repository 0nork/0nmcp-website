'use client'

import { useState, useEffect } from 'react'

interface BillingData {
  executions: {
    total: number
    billed: number
    totalRevenueCents: number
    totalRevenueDollars: string
  }
  monthly: Array<{
    month: string
    total_executions: number
    successful: number
    failed: number
    billed_executions: number
    total_revenue_cents: number
    unique_users: number
  }>
  topUsers: Array<{
    user_id: string
    total_executions: number
    billed_executions: number
    total_spent_cents: number
    last_execution: string
    executions_30d: number
  }>
  recentExecutions: Array<{
    id: string
    user_id: string
    task: string | null
    workflow_name: string | null
    status: string
    duration_ms: number | null
    steps_executed: number
    services_used: string[]
    billed: boolean
    billing_amount_cents: number
    created_at: string
  }>
  subscribers: {
    total: number
    list: Array<{
      id: string
      full_name: string | null
      email: string | null
      stripe_customer_id: string
      plan: string | null
    }>
  }
  storePurchases: number
}

export function AdminBilling() {
  const [data, setData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/billing')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="bg-white/[0.02] rounded-xl border border-[var(--border)] h-20 animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!data) {
    return <div className="text-[var(--text-muted)] text-center py-8">Failed to load billing data</div>
  }

  return (
    <div className="flex flex-col gap-5">
      {/* KPI Cards */}
      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
        <KPICard label="Total Executions" value={String(data.executions.total)} color="#6EE05A" />
        <KPICard label="Billed Executions" value={String(data.executions.billed)} color="#00d4ff" />
        <KPICard label="Revenue" value={`$${data.executions.totalRevenueDollars}`} color="#a78bfa" />
        <KPICard label="Subscribers" value={String(data.subscribers.total)} color="#f59e0b" />
        <KPICard label="Store Purchases" value={String(data.storePurchases)} color="#6EE05A" />
      </div>

      {/* Monthly Breakdown */}
      {data.monthly.length > 0 && (
        <div className="bg-white/[0.02] rounded-xl border border-[var(--border)] p-4">
          <h3 className="text-[0.85rem] font-semibold text-[var(--text-primary)] mt-0 mb-3">
            Monthly Breakdown
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['Month', 'Executions', 'Success', 'Failed', 'Billed', 'Revenue', 'Users'].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-[var(--text-muted)] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.monthly.map((m, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-primary)] font-mono">
                      {new Date(m.month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)]">{m.total_executions}</td>
                    <td className="px-3 py-2 text-[#6EE05A]">{m.successful}</td>
                    <td className="px-3 py-2" style={{ color: m.failed > 0 ? '#ef4444' : 'var(--text-muted)' }}>{m.failed}</td>
                    <td className="px-3 py-2 text-[var(--text-secondary)]">{m.billed_executions}</td>
                    <td className="px-3 py-2 text-[#a78bfa] font-mono">
                      ${(m.total_revenue_cents / 100).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)]">{m.unique_users}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Users */}
      {data.topUsers.length > 0 && (
        <div className="bg-white/[0.02] rounded-xl border border-[var(--border)] p-4">
          <h3 className="text-[0.85rem] font-semibold text-[var(--text-primary)] mt-0 mb-3">
            Top Users by Executions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['User', 'Total', '30d', 'Billed', 'Spent', 'Last Run'].map(h => (
                    <th key={h} className="text-left px-3 py-2 text-[var(--text-muted)] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.topUsers.map((u, i) => (
                  <tr key={i} className="border-b border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-primary)] font-mono text-[0.65rem]">
                      {u.user_id.slice(0, 8)}...
                    </td>
                    <td className="px-3 py-2 text-[var(--text-secondary)]">{u.total_executions}</td>
                    <td className="px-3 py-2 text-[#00d4ff]">{u.executions_30d}</td>
                    <td className="px-3 py-2 text-[var(--text-secondary)]">{u.billed_executions}</td>
                    <td className="px-3 py-2 text-[#a78bfa] font-mono">
                      ${(u.total_spent_cents / 100).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-[var(--text-muted)] text-[0.65rem]">
                      {u.last_execution ? new Date(u.last_execution).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Executions */}
      <div className="bg-white/[0.02] rounded-xl border border-[var(--border)] p-4">
        <h3 className="text-[0.85rem] font-semibold text-[var(--text-primary)] mt-0 mb-3">
          Recent Executions
        </h3>
        {data.recentExecutions.length === 0 ? (
          <p className="text-[var(--text-muted)] text-[0.8rem] m-0">No executions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[0.7rem]">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['Status', 'Task', 'Duration', 'Steps', 'Billed', 'Time'].map(h => (
                    <th key={h} className="text-left px-2 py-1.5 text-[var(--text-muted)] font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentExecutions.slice(0, 20).map((e) => (
                  <tr key={e.id} className="border-b border-[var(--border)]">
                    <td className="px-2 py-1.5">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{
                          background: e.status === 'completed' ? '#6EE05A' : e.status === 'failed' ? '#ef4444' : '#f59e0b',
                        }}
                      />
                    </td>
                    <td className="px-2 py-1.5 text-[var(--text-primary)] max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {e.task || e.workflow_name || '-'}
                    </td>
                    <td className="px-2 py-1.5 text-[var(--text-muted)] font-mono">
                      {e.duration_ms ? `${e.duration_ms}ms` : '-'}
                    </td>
                    <td className="px-2 py-1.5 text-[var(--text-secondary)]">{e.steps_executed}</td>
                    <td
                      className="px-2 py-1.5"
                      style={{ color: e.billed ? '#a78bfa' : 'var(--text-muted)' }}
                    >
                      {e.billed ? '$0.01' : 'Free'}
                    </td>
                    <td className="px-2 py-1.5 text-[var(--text-muted)] text-[0.65rem]">
                      {new Date(e.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Subscribers */}
      {data.subscribers.list.length > 0 && (
        <div className="bg-white/[0.02] rounded-xl border border-[var(--border)] p-4">
          <h3 className="text-[0.85rem] font-semibold text-[var(--text-primary)] mt-0 mb-3">
            Stripe Customers ({data.subscribers.total})
          </h3>
          <div className="flex flex-col gap-2">
            {data.subscribers.list.map((s) => (
              <div key={s.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-[var(--border)]">
                <div className="flex-1">
                  <div className="text-[0.8rem] font-semibold text-[var(--text-primary)]">
                    {s.full_name || 'Unknown'}
                  </div>
                  <div className="text-[0.7rem] text-[var(--text-muted)]">{s.email}</div>
                </div>
                <div className="text-[0.65rem] font-mono text-[var(--text-muted)]">
                  {s.stripe_customer_id?.slice(0, 14)}...
                </div>
                {s.plan && (
                  <span className="text-[0.6rem] font-semibold px-2 py-0.5 rounded-full bg-[rgba(126,217,87,0.1)] text-[#6EE05A] border border-[rgba(126,217,87,0.2)]">
                    {s.plan}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function KPICard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-white/[0.02] rounded-xl p-4 border border-[var(--border)]">
      <div className="text-[0.65rem] text-[var(--text-muted)] mb-1.5 font-semibold tracking-[0.05em] uppercase">
        {label}
      </div>
      <div className="text-2xl font-bold font-mono" style={{ color }}>
        {value}
      </div>
    </div>
  )
}
