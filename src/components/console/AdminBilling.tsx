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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem',
            border: '1px solid var(--border)', height: '80px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      </div>
    )
  }

  if (!data) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Failed to load billing data</div>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <KPICard label="Total Executions" value={String(data.executions.total)} color="#7ed957" />
        <KPICard label="Billed Executions" value={String(data.executions.billed)} color="#00d4ff" />
        <KPICard label="Revenue" value={`$${data.executions.totalRevenueDollars}`} color="#a78bfa" />
        <KPICard label="Subscribers" value={String(data.subscribers.total)} color="#f59e0b" />
        <KPICard label="Store Purchases" value={String(data.storePurchases)} color="#7ed957" />
      </div>

      {/* Monthly Breakdown */}
      {data.monthly.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '1rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.75rem 0' }}>
            Monthly Breakdown
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Month', 'Executions', 'Success', 'Failed', 'Billed', 'Revenue', 'Users'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.monthly.map((m, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(m.month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>{m.total_executions}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#7ed957' }}>{m.successful}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: m.failed > 0 ? '#ef4444' : 'var(--text-muted)' }}>{m.failed}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>{m.billed_executions}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#a78bfa', fontFamily: 'var(--font-mono)' }}>
                      ${(m.total_revenue_cents / 100).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>{m.unique_users}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top Users */}
      {data.topUsers.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '1rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.75rem 0' }}>
            Top Users by Executions
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['User', 'Total', '30d', 'Billed', 'Spent', 'Last Run'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.topUsers.map((u, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                      {u.user_id.slice(0, 8)}...
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>{u.total_executions}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#00d4ff' }}>{u.executions_30d}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-secondary)' }}>{u.billed_executions}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#a78bfa', fontFamily: 'var(--font-mono)' }}>
                      ${(u.total_spent_cents / 100).toFixed(2)}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.65rem' }}>
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
      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '1rem' }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.75rem 0' }}>
          Recent Executions
        </h3>
        {data.recentExecutions.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>No executions yet</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Status', 'Task', 'Duration', 'Steps', 'Billed', 'Time'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentExecutions.slice(0, 20).map((e) => (
                  <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.4rem 0.5rem' }}>
                      <span style={{
                        display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%',
                        background: e.status === 'completed' ? '#7ed957' : e.status === 'failed' ? '#ef4444' : '#f59e0b',
                      }} />
                    </td>
                    <td style={{ padding: '0.4rem 0.5rem', color: 'var(--text-primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {e.task || e.workflow_name || '-'}
                    </td>
                    <td style={{ padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {e.duration_ms ? `${e.duration_ms}ms` : '-'}
                    </td>
                    <td style={{ padding: '0.4rem 0.5rem', color: 'var(--text-secondary)' }}>{e.steps_executed}</td>
                    <td style={{ padding: '0.4rem 0.5rem', color: e.billed ? '#a78bfa' : 'var(--text-muted)' }}>
                      {e.billed ? '$0.01' : 'Free'}
                    </td>
                    <td style={{ padding: '0.4rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.65rem' }}>
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
        <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid var(--border)', padding: '1rem' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.75rem 0' }}>
            Stripe Customers ({data.subscribers.total})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.subscribers.list.map((s) => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {s.full_name || 'Unknown'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.email}</div>
                </div>
                <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {s.stripe_customer_id?.slice(0, 14)}...
                </div>
                {s.plan && (
                  <span style={{
                    fontSize: '0.6rem', fontWeight: 600, padding: '0.15rem 0.5rem',
                    borderRadius: '9999px', background: 'rgba(126,217,87,0.1)',
                    color: '#7ed957', border: '1px solid rgba(126,217,87,0.2)',
                  }}>
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
    <div style={{
      background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', padding: '1rem',
      border: '1px solid var(--border)',
    }}>
      <div style={{
        fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.375rem',
        fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '1.5rem', fontWeight: 700, color,
        fontFamily: 'var(--font-mono)',
      }}>
        {value}
      </div>
    </div>
  )
}
