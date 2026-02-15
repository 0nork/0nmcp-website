export default function ComparisonTable() {
  const rows = [
    {
      tool: 'Zapier',
      steps: '5+ steps',
      cost: '$20+/mo',
      setup: '15 min setup',
      highlight: false,
    },
    {
      tool: 'Make',
      steps: '8+ steps',
      cost: '$9+/mo',
      setup: '30 min setup',
      highlight: false,
    },
    {
      tool: '0nMCP',
      steps: '1 command',
      cost: 'Free (open source)',
      setup: '60 seconds',
      highlight: true,
    },
  ]

  return (
    <section className="py-16">
      <div className="section-container">
        <h2
          className="text-2xl md:text-3xl font-bold text-center mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Why 0nMCP?
        </h2>
        <p
          className="text-center mb-10 max-w-xl mx-auto"
          style={{ color: 'var(--text-secondary)' }}
        >
          See how 0nMCP compares to legacy automation platforms.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full max-w-3xl mx-auto" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                {['Platform', 'Complexity', 'Cost', 'Setup Time'].map(
                  (header) => (
                    <th
                      key={header}
                      className="text-left text-xs uppercase tracking-widest font-semibold px-6 py-4"
                      style={{
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.tool}
                  style={
                    row.highlight
                      ? {
                          backgroundColor: 'rgba(0, 255, 136, 0.06)',
                          borderLeft: '3px solid var(--accent)',
                        }
                      : {}
                  }
                >
                  <td
                    className="px-6 py-4 text-sm font-semibold"
                    style={{
                      color: row.highlight
                        ? 'var(--accent)'
                        : 'var(--text-primary)',
                      fontFamily: row.highlight
                        ? 'var(--font-mono)'
                        : 'var(--font-display)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {row.tool}
                  </td>
                  <td
                    className="px-6 py-4 text-sm"
                    style={{
                      color: row.highlight
                        ? 'var(--accent)'
                        : 'var(--text-secondary)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {row.steps}
                  </td>
                  <td
                    className="px-6 py-4 text-sm font-medium"
                    style={{
                      color: row.highlight
                        ? 'var(--accent)'
                        : 'var(--text-secondary)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {row.cost}
                  </td>
                  <td
                    className="px-6 py-4 text-sm"
                    style={{
                      color: row.highlight
                        ? 'var(--accent)'
                        : 'var(--text-secondary)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {row.setup}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
