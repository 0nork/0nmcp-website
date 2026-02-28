'use client'

import { useState, useEffect, useCallback } from 'react'
import { MetricCard } from './reporting/MetricCard'
import { TrackingCodeCard } from './reporting/TrackingCodeCard'
import { EventsTable } from './reporting/EventsTable'

type TimeRange = '24h' | '7d' | '30d' | '90d'

interface TopPage {
  url: string
  count: number
}

interface TopReferrer {
  referrer: string
  count: number
}

interface ChartPoint {
  label: string
  value: number
}

interface TrackingEvent {
  id: string
  page_url: string | null
  referrer: string | null
  event_type: string
  device: string | null
  created_at: string
}

interface TrackingData {
  totalVisits: number
  uniqueVisitors: number
  pageViews: number
  topPages: TopPage[]
  topReferrers: TopReferrer[]
  chartData: ChartPoint[]
  recentEvents: TrackingEvent[]
}

const RANGE_OPTIONS: { key: TimeRange; label: string }[] = [
  { key: '24h', label: '24h' },
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: '90d', label: '90d' },
]

const STORAGE_KEY = '0nmcp_tracking_site_id'

function getOrCreateSiteId(): string {
  if (typeof window === 'undefined') return ''
  let siteId = localStorage.getItem(STORAGE_KEY)
  if (!siteId) {
    siteId = crypto.randomUUID()
    localStorage.setItem(STORAGE_KEY, siteId)
  }
  return siteId
}

export function ReportingView() {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('7d')
  const [data, setData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [siteId, setSiteId] = useState('')

  useEffect(() => {
    setSiteId(getOrCreateSiteId())
  }, [])

  const fetchData = useCallback(async () => {
    if (!siteId) return
    setLoading(true)
    try {
      const res = await fetch(
        `/api/console/tracking?site_id=${siteId}&range=${selectedRange}`
      )
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (err) {
      console.error('Failed to fetch tracking data:', err)
    } finally {
      setLoading(false)
    }
  }, [siteId, selectedRange])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const chartMax = data?.chartData
    ? Math.max(...data.chartData.map((d) => d.value), 1)
    : 1

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '100%',
        width: '100%',
        animation: 'console-fade-in 0.3s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Reporting
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              margin: '4px 0 0 0',
            }}
          >
            Universal tracker analytics for your sites
          </p>
        </div>

        {/* Range selector */}
        <div
          style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '10px',
            padding: '4px',
          }}
        >
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSelectedRange(opt.key)}
              style={{
                backgroundColor:
                  selectedRange === opt.key ? 'var(--accent)' : 'transparent',
                color:
                  selectedRange === opt.key ? '#000' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '7px',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: selectedRange === opt.key ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && !data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '20px',
                  height: '96px',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </div>
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              height: '200px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              height: '300px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>
        </div>
      )}

      {/* Main content */}
      {(!loading || data) && (
        <>
          {/* Metric cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <MetricCard
              label="Total Visits"
              value={data?.totalVisits ?? 0}
              trend={data && data.totalVisits > 0 ? 'up' : 'neutral'}
              change={data && data.totalVisits > 0 ? '+' + data.totalVisits : undefined}
            />
            <MetricCard
              label="Unique Visitors"
              value={data?.uniqueVisitors ?? 0}
              trend={data && data.uniqueVisitors > 0 ? 'up' : 'neutral'}
              change={
                data && data.uniqueVisitors > 0 ? '+' + data.uniqueVisitors : undefined
              }
            />
            <MetricCard
              label="Page Views"
              value={data?.pageViews ?? 0}
              trend={data && data.pageViews > 0 ? 'up' : 'neutral'}
              change={data && data.pageViews > 0 ? '+' + data.pageViews : undefined}
            />
            <MetricCard
              label="Avg Duration"
              value="--"
              trend="neutral"
            />
          </div>

          {/* Tracking Code Card */}
          {siteId && <TrackingCodeCard siteId={siteId} />}

          {/* Chart */}
          {data?.chartData && data.chartData.length > 0 && (
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '24px',
                marginTop: '20px',
              }}
            >
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: '0 0 20px 0',
                }}
              >
                Traffic Over Time
              </h3>

              {/* Bar chart */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '3px',
                  height: '160px',
                  width: '100%',
                  overflowX: 'auto',
                  paddingBottom: '28px',
                  position: 'relative',
                }}
              >
                {data.chartData.map((point, idx) => {
                  const height = chartMax > 0 ? (point.value / chartMax) * 140 : 0
                  const showLabel =
                    data.chartData.length <= 14 ||
                    idx % Math.ceil(data.chartData.length / 12) === 0

                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flex: '1 1 0',
                        minWidth: '16px',
                        position: 'relative',
                      }}
                      title={`${point.label}: ${point.value} visits`}
                    >
                      {/* Value label on hover via title */}
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '32px',
                          height: `${Math.max(height, 2)}px`,
                          backgroundColor: 'var(--accent)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height 0.3s ease, opacity 0.2s ease',
                          opacity: point.value > 0 ? 1 : 0.2,
                          cursor: 'default',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1'
                          e.currentTarget.style.boxShadow = '0 0 10px var(--accent-glow)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = point.value > 0 ? '1' : '0.2'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      />
                      {showLabel && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '-24px',
                            fontSize: '9px',
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                            transform: 'rotate(-30deg)',
                            transformOrigin: 'top center',
                          }}
                        >
                          {point.label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Two-column: Top Pages + Top Referrers */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
              marginTop: '20px',
            }}
          >
            {/* Top Pages */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: '0 0 16px 0',
                }}
              >
                Top Pages
              </h3>
              {!data?.topPages || data.topPages.length === 0 ? (
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    margin: 0,
                  }}
                >
                  No page data yet
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.topPages.map((page, i) => {
                    const maxCount = data.topPages[0]?.count || 1
                    const barWidth = (page.count / maxCount) * 100

                    return (
                      <div key={i}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '4px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '13px',
                              color: 'var(--text-secondary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '70%',
                            }}
                            title={page.url}
                          >
                            {page.url}
                          </span>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              fontFamily: 'monospace',
                            }}
                          >
                            {page.count}
                          </span>
                        </div>
                        <div
                          style={{
                            height: '4px',
                            backgroundColor: 'var(--border)',
                            borderRadius: '2px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${barWidth}%`,
                              backgroundColor: 'var(--accent)',
                              borderRadius: '2px',
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Top Referrers */}
            <div
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  margin: '0 0 16px 0',
                }}
              >
                Top Referrers
              </h3>
              {!data?.topReferrers || data.topReferrers.length === 0 ? (
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    margin: 0,
                  }}
                >
                  No referrer data yet
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {data.topReferrers.map((ref, i) => {
                    const maxCount = data.topReferrers[0]?.count || 1
                    const barWidth = (ref.count / maxCount) * 100

                    return (
                      <div key={i}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '4px',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '13px',
                              color: 'var(--text-secondary)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '70%',
                            }}
                            title={ref.referrer}
                          >
                            {ref.referrer || 'Direct'}
                          </span>
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                              fontFamily: 'monospace',
                            }}
                          >
                            {ref.count}
                          </span>
                        </div>
                        <div
                          style={{
                            height: '4px',
                            backgroundColor: 'var(--border)',
                            borderRadius: '2px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${barWidth}%`,
                              backgroundColor: 'var(--accent-secondary, #ff6b35)',
                              borderRadius: '2px',
                              transition: 'width 0.4s ease',
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Events Table */}
          <div style={{ marginTop: '20px' }}>
            <EventsTable events={data?.recentEvents ?? []} />
          </div>
        </>
      )}
    </div>
  )
}
