'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createSupabaseBrowser } from '@/lib/supabase/client'

interface WeightRow {
  id: string
  impressions: number
  position: number
  ctr_gap: number
  conversions: number
  freshness: number
  active: boolean
  created_at: string
}

interface OutcomeSummary {
  bucket: string
  total: number
  successes: number
  rate: number
}

const FACTOR_COLORS: Record<string, string> = {
  impressions: '#ff6b35',
  position: '#00d4ff',
  ctr_gap: '#ff3d3d',
  conversions: '#7ed957',
  freshness: '#9945ff',
}

const FACTOR_DESCRIPTIONS: Record<string, string> = {
  impressions:
    'Search visibility volume. Higher weight favors pages with more impressions.',
  position:
    'Current ranking position. Higher weight favors pages closer to position 1.',
  ctr_gap:
    'Gap between actual CTR and expected CTR for position. Higher weight favors underperforming pages.',
  conversions:
    'Conversion rate impact. Higher weight favors pages that drive conversions.',
  freshness:
    'Content recency. Higher weight penalizes stale content more aggressively.',
}

export default function LearningDashboard() {
  const supabase = createSupabaseBrowser()
  const [weights, setWeights] = useState<WeightRow | null>(null)
  const [history, setHistory] = useState<WeightRow[]>([])
  const [outcomes, setOutcomes] = useState<OutcomeSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [editWeights, setEditWeights] = useState<Record<string, number>>({})

  const loadData = useCallback(async () => {
    if (!supabase) return

    // Load active weights
    const { data: activeWeights } = await supabase
      .from('seo_weights')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (activeWeights) {
      setWeights(activeWeights)
      setEditWeights({
        impressions: activeWeights.impressions,
        position: activeWeights.position,
        ctr_gap: activeWeights.ctr_gap,
        conversions: activeWeights.conversions,
        freshness: activeWeights.freshness,
      })
    }

    // Load weight history
    const { data: weightHistory } = await supabase
      .from('seo_weights')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)

    if (weightHistory) setHistory(weightHistory)

    // Load outcome summaries from seo_actions
    const { data: actions } = await supabase
      .from('seo_actions')
      .select('bucket, status, outcome')
      .not('outcome', 'is', null)

    if (actions) {
      const bucketMap = new Map<
        string,
        { total: number; successes: number }
      >()
      for (const action of actions) {
        const bucket = action.bucket
        if (!bucketMap.has(bucket)) {
          bucketMap.set(bucket, { total: 0, successes: 0 })
        }
        const entry = bucketMap.get(bucket)!
        entry.total++
        if (
          action.outcome &&
          typeof action.outcome === 'object' &&
          'success' in action.outcome &&
          action.outcome.success
        ) {
          entry.successes++
        }
      }

      const summaries: OutcomeSummary[] = []
      for (const [bucket, data] of bucketMap) {
        summaries.push({
          bucket,
          total: data.total,
          successes: data.successes,
          rate: data.total > 0 ? data.successes / data.total : 0,
        })
      }
      setOutcomes(summaries)
    }

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  function handleSlider(factor: string, value: number) {
    const newWeights = { ...editWeights, [factor]: value }

    // Normalize so all weights sum to 1.0
    const total = Object.values(newWeights).reduce((a, b) => a + b, 0)
    if (total > 0) {
      for (const key of Object.keys(newWeights)) {
        newWeights[key] = Math.round((newWeights[key] / total) * 10000) / 10000
      }
    }

    setEditWeights(newWeights)
  }

  async function saveWeights() {
    if (!supabase) return
    setSaving(true)
    setMessage('')

    try {
      // Deactivate old weights
      await supabase
        .from('seo_weights')
        .update({ active: false })
        .eq('active', true)

      // Insert new weights
      const { error } = await supabase.from('seo_weights').insert({
        impressions: editWeights.impressions,
        position: editWeights.position,
        ctr_gap: editWeights.ctr_gap,
        conversions: editWeights.conversions,
        freshness: editWeights.freshness,
        active: true,
      })

      if (error) {
        setMessage(`Save failed: ${error.message}`)
      } else {
        setMessage('Weights saved successfully')
        loadData()
      }
    } catch {
      setMessage('Network error saving weights')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div style={{ padding: '120px 32px', textAlign: 'center' }}>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--accent)',
            fontSize: '2rem',
            fontWeight: 900,
          }}
        >
          0n
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          Loading learning dashboard...
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '100px 32px 64px',
        maxWidth: 1200,
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 900,
              letterSpacing: '-0.02em',
            }}
          >
            Weight Learning
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.8125rem',
              marginTop: 4,
            }}
          >
            Adaptive weight system &mdash; learns from outcomes, adjusts
            scoring
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            href="/admin/blog"
            style={{ ...btnGhostStyle, textDecoration: 'none' }}
          >
            Blog Dashboard
          </Link>
          <Link
            href="/admin/blog/seo"
            style={{ ...btnGhostStyle, textDecoration: 'none' }}
          >
            SEO Analysis
          </Link>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            marginBottom: 16,
            fontSize: '0.8125rem',
            fontWeight: 600,
            background:
              message.includes('fail') || message.includes('error')
                ? 'rgba(255,61,61,0.1)'
                : 'rgba(126,217,87,0.1)',
            color:
              message.includes('fail') || message.includes('error')
                ? '#ff3d3d'
                : 'var(--accent)',
          }}
        >
          {message}
        </div>
      )}

      {/* Current Weights */}
      <div
        style={{
          padding: 24,
          borderRadius: 16,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          marginBottom: 24,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700 }}>
            Current Weight Configuration
          </h3>
          <button
            onClick={saveWeights}
            disabled={saving}
            style={{
              padding: '8px 20px',
              borderRadius: 10,
              background: saving ? 'var(--bg-card)' : 'var(--accent)',
              color: saving ? 'var(--text-muted)' : 'var(--bg-primary)',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.8125rem',
              cursor: saving ? 'wait' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Save Weights'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Object.entries(editWeights).map(([factor, value]) => (
            <div key={factor}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: FACTOR_COLORS[factor] || '#fff',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                    }}
                  >
                    {factor.replace('_', ' ')}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 900,
                    color: FACTOR_COLORS[factor],
                  }}
                >
                  {(value * 100).toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min={0.05}
                max={0.50}
                step={0.01}
                value={value}
                onChange={(e) =>
                  handleSlider(factor, parseFloat(e.target.value))
                }
                style={{
                  width: '100%',
                  accentColor: FACTOR_COLORS[factor],
                  height: 4,
                }}
              />
              <p
                style={{
                  fontSize: '0.625rem',
                  color: 'var(--text-muted)',
                  marginTop: 4,
                }}
              >
                {FACTOR_DESCRIPTIONS[factor]}
              </p>
            </div>
          ))}
        </div>

        {/* Visual weight bar */}
        <div
          style={{
            display: 'flex',
            height: 8,
            borderRadius: 4,
            overflow: 'hidden',
            marginTop: 20,
          }}
        >
          {Object.entries(editWeights).map(([factor, value]) => (
            <div
              key={factor}
              style={{
                width: `${value * 100}%`,
                background: FACTOR_COLORS[factor],
                transition: 'width 0.3s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Outcome Evaluation */}
      {outcomes.length > 0 && (
        <div
          style={{
            padding: 20,
            borderRadius: 16,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            marginBottom: 24,
          }}
        >
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            Outcome Evaluation (by Bucket)
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 10,
            }}
          >
            {outcomes.map((o) => (
              <div
                key={o.bucket}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                    marginBottom: 8,
                  }}
                >
                  {o.bucket.replace('_', ' ')}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 4,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 900,
                      color:
                        o.rate > 0.6
                          ? '#7ed957'
                          : o.rate > 0.3
                            ? '#ff6b35'
                            : '#ff3d3d',
                    }}
                  >
                    {(o.rate * 100).toFixed(0)}%
                  </span>
                  <span
                    style={{
                      fontSize: '0.625rem',
                      color: 'var(--text-muted)',
                    }}
                  >
                    success rate
                  </span>
                </div>
                <div
                  style={{
                    fontSize: '0.625rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  {o.successes} of {o.total} actions succeeded
                </div>
                {/* Progress bar */}
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.05)',
                    marginTop: 8,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${o.rate * 100}%`,
                      height: '100%',
                      borderRadius: 2,
                      background:
                        o.rate > 0.6
                          ? '#7ed957'
                          : o.rate > 0.3
                            ? '#ff6b35'
                            : '#ff3d3d',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weight History */}
      {history.length > 0 && (
        <div
          style={{
            padding: 20,
            borderRadius: 16,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <h3
            style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Weight History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {history.map((row) => (
              <div
                key={row.id}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: row.active
                    ? 'rgba(126,217,87,0.05)'
                    : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${
                    row.active ? 'rgba(126,217,87,0.2)' : 'var(--border)'
                  }`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  fontSize: '0.75rem',
                }}
              >
                {row.active && (
                  <span
                    style={{
                      fontSize: '0.5rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: 'rgba(126,217,87,0.15)',
                      color: '#7ed957',
                      textTransform: 'uppercase',
                    }}
                  >
                    Active
                  </span>
                )}
                <span style={{ color: FACTOR_COLORS.impressions }}>
                  imp: {(row.impressions * 100).toFixed(1)}%
                </span>
                <span style={{ color: FACTOR_COLORS.position }}>
                  pos: {(row.position * 100).toFixed(1)}%
                </span>
                <span style={{ color: FACTOR_COLORS.ctr_gap }}>
                  ctr: {(row.ctr_gap * 100).toFixed(1)}%
                </span>
                <span style={{ color: FACTOR_COLORS.conversions }}>
                  conv: {(row.conversions * 100).toFixed(1)}%
                </span>
                <span style={{ color: FACTOR_COLORS.freshness }}>
                  fresh: {(row.freshness * 100).toFixed(1)}%
                </span>
                <span
                  style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}
                >
                  {new Date(row.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const btnGhostStyle: React.CSSProperties = {
  padding: '6px 14px',
  borderRadius: 8,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  fontWeight: 600,
  fontSize: '0.75rem',
  cursor: 'pointer',
}
