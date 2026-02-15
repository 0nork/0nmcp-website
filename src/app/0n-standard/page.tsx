import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The .0n Standard -- Universal Configuration for AI Orchestration',
  description:
    'The .0n Standard is the universal configuration format for AI orchestration. Like .env for environment variables, .0n is for AI config. One format, every client, zero fragmentation.',
  openGraph: {
    title: 'The .0n Standard -- Universal AI Config Format',
    description:
      'Like docker-compose.yml for MCP servers. One config format that works across Claude Desktop, Cursor, VS Code, Windsurf, and Gemini CLI.',
    url: 'https://0nmcp.com/0n-standard',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The .0n Standard -- Universal AI Config Format',
    description:
      'Like .env for environment variables, .0n is for AI config. One format, every client, zero fragmentation.',
  },
  alternates: { canonical: 'https://0nmcp.com/0n-standard' },
  keywords: [
    '.0n standard',
    '0n spec',
    'MCP configuration',
    'AI orchestration config',
    'universal MCP config',
    'Model Context Protocol configuration',
  ],
}

export default function OnStandardPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    name: 'The .0n Standard',
    headline:
      'The .0n Standard -- Universal Configuration for AI Orchestration',
    description:
      'The universal configuration format for AI orchestration. Like .env for environment variables, .0n is for AI config.',
    url: 'https://0nmcp.com/0n-standard',
    author: {
      '@type': 'Organization',
      name: '0nORK',
      url: 'https://github.com/0nork',
    },
    publisher: {
      '@type': 'Organization',
      name: 'RocketOpp, LLC',
      url: 'https://rocketopp.com',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ============================================
          HERO
          ============================================ */}
      <section className="pt-40 pb-16 px-8 text-center relative">
        <div
          className="absolute w-[500px] h-[500px] top-[5%] left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(0,212,255,0.12) 0%, transparent 70%)',
          }}
        />
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 relative z-[2]">
          The{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
            }}
          >
            .0n Standard
          </span>
        </h1>
        <p
          className="text-lg max-w-[680px] mx-auto leading-relaxed relative z-[2]"
          style={{ color: 'var(--text-secondary)' }}
        >
          The universal configuration format for AI orchestration. Like{' '}
          <code
            className="font-mono text-sm"
            style={{ color: 'var(--accent)' }}
          >
            .env
          </code>{' '}
          for environment variables,{' '}
          <code
            className="font-mono text-sm"
            style={{ color: 'var(--accent)' }}
          >
            .0n
          </code>{' '}
          is for AI config. One format. Every client. Zero fragmentation.
        </p>
        <div className="flex justify-center gap-3 flex-wrap mt-6 relative z-[2]">
          {['Spec v1.0.0', 'CC BY 4.0 License', 'JSON Schema Validated', 'CLI + Library'].map(
            (badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-mono text-xs"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--accent)' }}
                />
                {badge}
              </span>
            )
          )}
        </div>
      </section>

      {/* ============================================
          THE ANALOGY
          ============================================ */}
      <section
        className="py-20 px-8"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-[1000px] mx-auto">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
            style={{ color: 'var(--accent)' }}
          >
            The Idea
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Every revolution starts with a standard format.
          </h2>
          <p
            className="text-base max-w-[600px] leading-relaxed mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            The best infrastructure is invisible. Just like{' '}
            <code className="font-mono" style={{ color: 'var(--accent)' }}>
              .git
            </code>{' '}
            made version control universal,{' '}
            <code className="font-mono" style={{ color: 'var(--accent)' }}>
              .0n
            </code>{' '}
            makes AI orchestration config portable and universal.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                ext: '.git',
                title: 'Version Control',
                desc: 'Standardized how code is tracked, branched, and shared. Before Git, every team had their own system.',
                highlight: false,
              },
              {
                ext: '.env',
                title: 'Environment Config',
                desc: 'Standardized how apps read configuration. One file, every framework, every language.',
                highlight: false,
              },
              {
                ext: '.0n',
                title: 'AI Orchestration',
                desc: 'Standardizes how AI tools are configured, connected, and automated. One format, every client.',
                highlight: true,
              },
            ].map((item) => (
              <div
                key={item.ext}
                className="glow-box text-center"
                style={
                  item.highlight
                    ? {
                        borderColor: 'var(--accent)',
                        boxShadow: '0 0 30px var(--accent-glow)',
                      }
                    : undefined
                }
              >
                <span
                  className="font-mono text-2xl font-bold block mb-3"
                  style={{ color: 'var(--accent)' }}
                >
                  {item.ext}
                </span>
                <h3 className="text-base font-bold mb-2">{item.title}</h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          DIRECTORY STRUCTURE
          ============================================ */}
      <section className="py-20 px-8">
        <div className="max-w-[1000px] mx-auto">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
            style={{ color: 'var(--accent)' }}
          >
            Directory Structure
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Everything lives in{' '}
            <code className="font-mono" style={{ color: 'var(--accent)' }}>
              ~/.0n/
            </code>
          </h2>
          <p
            className="text-base max-w-[600px] leading-relaxed mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            A single directory on your machine holds all your AI orchestration
            configuration. Portable. Sharable. Version-controllable.
          </p>

          <div
            className="rounded-xl overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="flex items-center gap-2 px-5 py-3"
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
            </div>
            <pre className="p-6 font-mono text-sm leading-[2] overflow-x-auto">
              <span style={{ color: 'var(--accent-secondary)' }}>~/.0n/</span>
              {'\n'}
              <span style={{ color: 'var(--accent-secondary)' }}>
                ├── config.json
              </span>
              {'           '}
              <span
                className="italic"
                style={{ color: 'var(--text-muted)' }}
              >
                # Global settings
              </span>
              {'\n'}
              <span style={{ color: 'var(--accent-secondary)' }}>
                ├── connections/
              </span>
              {'          '}
              <span
                className="italic"
                style={{ color: 'var(--text-muted)' }}
              >
                # Service credentials
              </span>
              {'\n'}
              <span style={{ color: 'var(--text-secondary)' }}>
                │   ├── stripe.0n
              </span>
              {'\n'}
              <span style={{ color: 'var(--text-secondary)' }}>
                │   ├── slack.0n
              </span>
              {'\n'}
              <span style={{ color: 'var(--text-secondary)' }}>
                │   └── openai.0n
              </span>
              {'\n'}
              <span style={{ color: 'var(--accent-secondary)' }}>
                ├── workflows/
              </span>
              {'            '}
              <span
                className="italic"
                style={{ color: 'var(--text-muted)' }}
              >
                # Automation definitions
              </span>
              {'\n'}
              <span style={{ color: 'var(--text-secondary)' }}>
                │   └── invoice-notify.0n
              </span>
              {'\n'}
              <span style={{ color: 'var(--accent-secondary)' }}>
                ├── snapshots/
              </span>
              {'            '}
              <span
                className="italic"
                style={{ color: 'var(--text-muted)' }}
              >
                # System state captures
              </span>
              {'\n'}
              <span style={{ color: 'var(--text-secondary)' }}>
                │   └── crm-setup.0n
              </span>
              {'\n'}
              <span style={{ color: 'var(--accent-secondary)' }}>
                ├── history/
              </span>
              {'              '}
              <span
                className="italic"
                style={{ color: 'var(--text-muted)' }}
              >
                # Execution logs
              </span>
              {'\n'}
              <span style={{ color: 'var(--accent-secondary)' }}>
                └── cache/
              </span>
              {'                '}
              <span
                className="italic"
                style={{ color: 'var(--text-muted)' }}
              >
                # Response cache
              </span>
            </pre>
          </div>
        </div>
      </section>

      {/* ============================================
          FILE TYPES
          ============================================ */}
      <section
        className="py-20 px-8"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-[1000px] mx-auto">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
            style={{ color: 'var(--accent)' }}
          >
            File Types
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Five types. One header. Infinite possibilities.
          </h2>
          <p
            className="text-base max-w-[600px] leading-relaxed mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            Every{' '}
            <code className="font-mono" style={{ color: 'var(--accent)' }}>
              .0n
            </code>{' '}
            file starts with a standard{' '}
            <code className="font-mono" style={{ color: 'var(--accent)' }}>
              $0n
            </code>{' '}
            header that declares its type, version, and name.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Type', 'Purpose', 'Example'].map((h) => (
                    <th
                      key={h}
                      className="text-left font-mono text-[0.7rem] uppercase tracking-wide px-4 py-3"
                      style={{
                        color: 'var(--text-muted)',
                        borderBottom: '2px solid var(--border)',
                        backgroundColor: 'var(--bg-tertiary)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    type: 'connection',
                    purpose: 'Service credentials and authentication. Store API keys, OAuth tokens, and connection settings.',
                    example: 'stripe.0n',
                  },
                  {
                    type: 'workflow',
                    purpose: 'Multi-step automations. Define inputs, steps with service calls, and output mappings.',
                    example: 'invoice-notify.0n',
                  },
                  {
                    type: 'snapshot',
                    purpose: 'System state captures. Export your entire CRM setup, pipeline config, or service state.',
                    example: 'crm-setup.0n',
                  },
                  {
                    type: 'execution',
                    purpose: 'Task run history. JSONL logs of every workflow execution with timestamps and results.',
                    example: '2026-02-11.jsonl',
                  },
                  {
                    type: 'config',
                    purpose: 'Global settings. AI provider, default service preferences, rate limits.',
                    example: 'config.json',
                  },
                ].map((row) => (
                  <tr key={row.type}>
                    <td
                      className="px-4 py-4 align-top font-mono font-semibold"
                      style={{
                        color: 'var(--accent)',
                        borderBottom: '1px solid var(--border)',
                        fontSize: '0.85rem',
                      }}
                    >
                      {row.type}
                    </td>
                    <td
                      className="px-4 py-4 align-top"
                      style={{
                        color: 'var(--text-secondary)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {row.purpose}
                    </td>
                    <td
                      className="px-4 py-4 align-top font-mono text-xs"
                      style={{
                        color: 'var(--text-muted)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {row.example}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============================================
          VARIABLE RESOLUTION
          ============================================ */}
      <section className="py-20 px-8">
        <div className="max-w-[1000px] mx-auto">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
            style={{ color: 'var(--accent)' }}
          >
            Template Syntax
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Dynamic values with double-brace templates
          </h2>
          <p
            className="text-base max-w-[600px] leading-relaxed mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            Reference inputs, step outputs, environment variables, and built-in
            values. Resolution order: system &gt; launch &gt; inputs &gt;
            step.output.
          </p>

          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            {[
              { syntax: '{{inputs.name}}', desc: 'Reference a workflow input parameter' },
              { syntax: '{{step_id.output.field}}', desc: 'Reference the output of a previous step' },
              { syntax: '{{env.VAR_NAME}}', desc: 'Reference an environment variable' },
              { syntax: '{{now}}', desc: 'Current ISO 8601 timestamp' },
              { syntax: '{{uuid}}', desc: 'Generate a unique identifier' },
            ].map((row, i, arr) => (
              <div key={row.syntax} className="grid grid-cols-1 md:grid-cols-[auto_1fr]">
                <div
                  className="font-mono text-sm px-5 py-4 whitespace-nowrap"
                  style={{
                    color: 'var(--accent)',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  {row.syntax}
                </div>
                <div
                  className="text-sm px-5 py-4"
                  style={{
                    color: 'var(--text-secondary)',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  {row.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          COMPARISON TABLE
          ============================================ */}
      <section
        className="py-20 px-8"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-[1000px] mx-auto">
          <span
            className="font-mono text-xs uppercase tracking-[0.15em] block mb-4"
            style={{ color: 'var(--accent)' }}
          >
            The Problem
          </span>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Before .0n, configuration was chaos
          </h2>
          <p
            className="text-base max-w-[600px] leading-relaxed mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            Every orchestrator invented its own format. Credentials were
            scattered. Workflows were trapped.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Problem', '.0n Solution'].map((h) => (
                    <th
                      key={h}
                      className="text-left font-mono text-[0.7rem] uppercase tracking-wide px-4 py-3"
                      style={{
                        color: 'var(--text-muted)',
                        borderBottom: '2px solid var(--border)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Every orchestrator invents its own config format', 'One standard format for all'],
                  ['Credentials scattered across .env, JSON, YAML', '~/.0n/connections/ -- one place'],
                  ['Workflows trapped in proprietary tools', 'Portable .0n workflow files'],
                  ['No execution history standard', '~/.0n/history/ -- JSONL by date'],
                  ['System configs cannot be shared or exported', 'Shareable snapshots with .0n format'],
                  ['Different config format per MCP client', 'Write once, deploy everywhere'],
                ].map(([problem, solution], i) => (
                  <tr key={i}>
                    <td
                      className="px-4 py-3"
                      style={{
                        color: '#ff6b35',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {problem}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{
                        color: 'var(--accent)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {solution}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============================================
          CTA
          ============================================ */}
      <section className="py-24 px-8 text-center">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Start using the{' '}
            <span style={{ color: 'var(--accent)' }}>.0n Standard</span> today.
          </h2>
          <p
            className="text-base max-w-[550px] mx-auto leading-relaxed mb-8"
            style={{ color: 'var(--text-secondary)' }}
          >
            Install the spec package to validate .0n files, or install 0nMCP to
            start orchestrating immediately.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <a
              href="https://github.com/0nork/0n-spec"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent no-underline"
            >
              View Spec on GitHub
            </a>
            <a
              href="https://www.npmjs.com/package/0n-spec"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost no-underline"
            >
              npm: 0n-spec
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
