'use client'

interface TrackingEvent {
  id: string
  page_url: string | null
  referrer: string | null
  event_type: string
  device: string | null
  created_at: string
}

interface EventsTableProps {
  events: TrackingEvent[]
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (seconds < 0) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

function getDeviceIcon(device: string | null): string {
  if (!device) return '\u2753'
  const d = device.toLowerCase()
  if (d === 'mobile') return '\ud83d\udcf1'
  if (d === 'desktop') return '\ud83d\udda5\ufe0f'
  return '\ud83c\udf10'
}

function truncateUrl(url: string | null, maxLen: number = 50): string {
  if (!url) return '\u2014'
  try {
    const parsed = new URL(url)
    const path = parsed.pathname + parsed.search
    if (path.length <= maxLen) return path
    return path.substring(0, maxLen - 3) + '...'
  } catch {
    if (url.length <= maxLen) return url
    return url.substring(0, maxLen - 3) + '...'
  }
}

const headerStyle: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  color: 'var(--text-muted)',
  textAlign: 'left',
  borderBottom: '1px solid var(--border)',
  backgroundColor: 'rgba(255,255,255,0.02)',
}

const cellStyle: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: '13px',
  color: 'var(--text-secondary)',
  borderBottom: '1px solid var(--border)',
  verticalAlign: 'middle',
}

export function EventsTable({ events }: EventsTableProps) {
  if (!events || events.length === 0) {
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.5 }}>{'\ud83d\udcca'}</div>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            margin: 0,
          }}
        >
          No events recorded yet
        </p>
        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            margin: '8px 0 0 0',
            opacity: 0.6,
          }}
        >
          Add the tracking code to your site to start collecting data
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
          }}
        >
          Recent Events
        </h3>
        <p
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            margin: '4px 0 0 0',
          }}
        >
          Last {events.length} events
        </p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '600px',
          }}
        >
          <thead>
            <tr>
              <th style={headerStyle}>Time</th>
              <th style={headerStyle}>Page</th>
              <th style={headerStyle}>Event</th>
              <th style={headerStyle}>Referrer</th>
              <th style={{ ...headerStyle, textAlign: 'center' }}>Device</th>
            </tr>
          </thead>
          <tbody>
            {events.slice(0, 50).map((event, i) => (
              <tr
                key={event.id}
                style={{
                  backgroundColor:
                    i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'
                }}
              >
                <td
                  style={{
                    ...cellStyle,
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {timeAgo(event.created_at)}
                </td>
                <td
                  style={{
                    ...cellStyle,
                    maxWidth: '240px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'var(--text-primary)',
                  }}
                  title={event.page_url || undefined}
                >
                  {truncateUrl(event.page_url)}
                </td>
                <td style={cellStyle}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor:
                        event.event_type === 'pageview'
                          ? 'rgba(126,217,87,0.1)'
                          : 'rgba(255,107,53,0.1)',
                      color:
                        event.event_type === 'pageview'
                          ? 'var(--accent)'
                          : 'var(--accent-secondary)',
                    }}
                  >
                    {event.event_type}
                  </span>
                </td>
                <td
                  style={{
                    ...cellStyle,
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={event.referrer || undefined}
                >
                  {truncateUrl(event.referrer, 40) || '\u2014'}
                </td>
                <td style={{ ...cellStyle, textAlign: 'center', fontSize: '18px' }}>
                  {getDeviceIcon(event.device)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
