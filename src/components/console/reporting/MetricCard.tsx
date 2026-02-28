'use client'

interface MetricCardProps {
  label: string
  value: string | number
  trend?: 'up' | 'down' | 'neutral'
  change?: string
}

export function MetricCard({ label, value, trend, change }: MetricCardProps) {
  const trendColor =
    trend === 'up' ? '#22c55e' : trend === 'down' ? '#ef4444' : 'var(--text-muted)'
  const trendArrow = trend === 'up' ? '\u2191' : trend === 'down' ? '\u2193' : '\u2014'

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)'
        e.currentTarget.style.boxShadow = '0 0 20px var(--accent-glow)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Trend indicator */}
      {trend && change && (
        <div
          style={{
            position: 'absolute',
            top: '14px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 600,
            color: trendColor,
          }}
        >
          <span style={{ fontSize: '14px' }}>{trendArrow}</span>
          <span>{change}</span>
        </div>
      )}

      {/* Value */}
      <div
        style={{
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          fontFamily: 'monospace',
          lineHeight: 1.2,
        }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginTop: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  )
}
