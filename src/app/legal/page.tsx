import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Legal Notice -- Trademark, Patent & Intellectual Property Policy',
  description:
    'Legal notice, trademark policy, patent information, and intellectual property enforcement for 0nMCP, 0nORK, and the 0n ecosystem. RocketOpp, LLC actively enforces its IP rights.',
  openGraph: {
    title: 'Legal Notice -- 0nMCP Intellectual Property Policy',
    description:
      'Trademark, patent, and IP enforcement policy for 0nMCP, 0nORK, and the 0n ecosystem by RocketOpp, LLC.',
    url: 'https://0nmcp.com/legal',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Legal Notice -- 0nMCP IP Policy',
    description:
      'Trademark, patent, and IP enforcement for the 0n ecosystem.',
  },
  alternates: { canonical: 'https://0nmcp.com/legal' },
  robots: { index: true, follow: true },
}

const marks = [
  { mark: '0nMCP', type: 'Word Mark', status: 'Common Law TM', desc: 'Universal MCP orchestrator software' },
  { mark: '0nORK', type: 'Word Mark', status: 'Common Law TM', desc: 'AI orchestration parent brand' },
  { mark: '0n-spec', type: 'Word Mark', status: 'Common Law TM', desc: 'Universal configuration specification' },
  { mark: '0nork', type: 'Word Mark', status: 'Common Law TM', desc: 'Namespace package' },
  { mark: '.0n Standard', type: 'Word Mark', status: 'Common Law TM', desc: 'Universal MCP configuration standard' },
  { mark: '0nData', type: 'Word Mark', status: 'Common Law TM', desc: 'CRM application backend platform' },
  { mark: '0n Apps', type: 'Word Mark', status: 'Common Law TM', desc: 'CRM application marketplace' },
  { mark: '0n [prefix]', type: 'Trade Dress', status: 'Common Law TM', desc: 'The "0n" prefix as a brand family identifier for software products' },
]

const tocItems = [
  { id: 'ownership', label: 'Ownership & Corporate Identity' },
  { id: 'patent', label: 'Patent Notice' },
  { id: 'trademark', label: 'Trademark Policy' },
  { id: 'prohibited', label: 'Prohibited Uses' },
  { id: 'open-source', label: 'Open Source License Scope' },
  { id: 'enforcement', label: 'Enforcement & Remedies' },
  { id: 'dmca', label: 'DMCA & Takedown Policy' },
  { id: 'report-section', label: 'Reporting Infringement' },
  { id: 'disclaimers', label: 'Disclaimers & Limitation of Liability' },
  { id: 'contact', label: 'Contact Information' },
]

export default function LegalPage() {
  return (
    <>
      {/* ============================================
          HERO
          ============================================ */}
      <section className="pt-40 pb-16 px-8 text-center relative z-[1]">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
          Legal Notice &amp;
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #ff6b35, #ef4444)',
            }}
          >
            Intellectual Property Policy
          </span>
        </h1>
        <p
          className="text-lg max-w-[700px] mx-auto leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          This document sets forth the intellectual property rights, trademark
          policy, patent disclosures, and enforcement procedures for
          0nMCP&trade;, 0nORK&trade;, and the entire 0n ecosystem owned by
          RocketOpp, LLC.
        </p>
      </section>

      {/* Effective Date */}
      <div
        className="text-center font-mono text-xs uppercase tracking-wide py-4 px-8 relative z-[1]"
        style={{
          color: 'var(--text-muted)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        Effective Date: February 12, 2026 | Last Updated: February 12, 2026 |
        Jurisdiction: United States of America
      </div>

      {/* ============================================
          LEGAL CONTENT
          ============================================ */}
      <div className="max-w-[860px] mx-auto px-8 py-12 relative z-[1]">
        {/* TABLE OF CONTENTS */}
        <div
          className="rounded-xl p-8 mb-12"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          <h3
            className="font-mono text-xs uppercase tracking-[0.1em] mb-4"
            style={{ color: 'var(--text-muted)' }}
          >
            Table of Contents
          </h3>
          <ol className="list-decimal ml-5 flex flex-col gap-1">
            {tocItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-sm leading-loose no-underline hover:underline"
                  style={{ color: 'var(--accent)' }}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </div>

        {/* 1. OWNERSHIP */}
        <section className="mb-16" id="ownership">
          <h2
            className="text-2xl font-bold mb-6 pb-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            1. Ownership &amp; Corporate Identity
          </h2>
          <p
            className="text-[0.95rem] leading-relaxed mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            All intellectual property associated with the 0n ecosystem --
            including but not limited to software, documentation, trademarks,
            trade dress, patents, trade secrets, and copyrighted works -- is
            owned exclusively by{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              RocketOpp, LLC
            </strong>
            , a limited liability company organized and existing under the laws
            of the Commonwealth of Pennsylvania, United States of America.
          </p>
          <p
            className="text-[0.95rem] leading-relaxed mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            The 0n ecosystem operates under the{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              0nORK&trade;
            </strong>{' '}
            brand, which serves as the parent organization for all 0n-branded
            products, services, and open-source projects. The GitHub
            organization{' '}
            <code
              className="font-mono text-sm px-2 py-0.5 rounded"
              style={{
                color: 'var(--accent)',
                backgroundColor: 'var(--bg-card)',
              }}
            >
              0nork
            </code>{' '}
            and npm namespace are controlled exclusively by RocketOpp, LLC.
          </p>
        </section>

        {/* 2. PATENT */}
        <section className="mb-16" id="patent">
          <h2
            className="text-2xl font-bold mb-6 pb-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            2. Patent Notice
          </h2>
          <div
            className="rounded-lg p-6 mb-6"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderLeft: '4px solid #ef4444',
            }}
          >
            <h4
              className="font-mono text-xs uppercase tracking-wide mb-2"
              style={{ color: '#ef4444' }}
            >
              Patent Pending -- US Application #63/968,814
            </h4>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              The following technologies are subject to one or more pending US
              patent applications filed by RocketOpp, LLC in January 2026.
            </p>
          </div>
          <h3 className="text-lg font-semibold mb-3 mt-8">
            Protected Technologies
          </h3>
          <ul
            className="text-[0.95rem] leading-relaxed ml-6 list-disc flex flex-col gap-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>
                Three-Level Execution Hierarchy
              </strong>{' '}
              -- The Pipeline &rarr; Assembly Line &rarr; Radial Burst execution
              model for orchestrating multiple Model Context Protocol (MCP)
              servers.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>
                MCP Federation
              </strong>{' '}
              -- The method of federating multiple independent MCP servers under
              a single orchestration gateway.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>
                JSON Smart Deploy
              </strong>{' '}
              -- The system for automatically deploying MCP server configurations
              across multiple AI client applications.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>
                Verified Fact Repository
              </strong>{' '}
              -- The architecture for storing and verifying factual assertions
              generated by AI systems with cryptographic audit trails.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>
                .FED File Format
              </strong>{' '}
              -- The file format specification for packaging federated MCP server
              configurations.
            </li>
          </ul>
        </section>

        {/* 3. TRADEMARK */}
        <section className="mb-16" id="trademark">
          <h2
            className="text-2xl font-bold mb-6 pb-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            3. Trademark Policy
          </h2>
          <p
            className="text-[0.95rem] leading-relaxed mb-6"
            style={{ color: 'var(--text-secondary)' }}
          >
            The following marks are claimed as trademarks and/or service marks
            of RocketOpp, LLC, whether or not they are registered with the
            United States Patent and Trademark Office (USPTO):
          </p>

          <div className="overflow-x-auto mb-8">
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Mark', 'Type', 'Status', 'Description'].map((h) => (
                    <th
                      key={h}
                      className="text-left font-mono text-[0.7rem] uppercase tracking-wide px-4 py-3"
                      style={{
                        color: 'var(--text-muted)',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {marks.map((m) => (
                  <tr key={m.mark}>
                    <td
                      className="px-4 py-3 font-mono font-semibold"
                      style={{
                        color: 'var(--text-primary)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {m.mark}&trade;
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{
                        color: 'var(--text-secondary)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {m.type}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{
                        color: 'var(--text-secondary)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {m.status}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{
                        color: 'var(--text-secondary)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {m.desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. PROHIBITED USES */}
        <section className="mb-16" id="prohibited">
          <h2
            className="text-2xl font-bold mb-6 pb-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            4. Prohibited Uses
          </h2>
          <div
            className="rounded-lg p-6 mb-6"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderLeft: '4px solid #ef4444',
            }}
          >
            <h4
              className="font-mono text-xs uppercase tracking-wide mb-2"
              style={{ color: '#ef4444' }}
            >
              Strictly Prohibited Activities
            </h4>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              Violation of any of the following may result in immediate legal
              action without prior notice.
            </p>
          </div>
          <ol
            className="text-[0.95rem] leading-relaxed ml-6 list-decimal flex flex-col gap-3"
            style={{ color: 'var(--text-secondary)' }}
          >
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>
                Impersonation:
              </strong>{' '}
              Creating software, websites, or social media accounts that
              impersonate or are confusingly similar to any 0n product or brand.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>
                Commercial exploitation:
              </strong>{' '}
              Using any 0n technology, mark, or brand element for commercial
              gain without a valid license.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>
                Unauthorized forking for profit:
              </strong>{' '}
              Forking and redistributing under a confusingly similar name
              constitutes trademark infringement regardless of the source code
              license.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>
                False claims of authorship:
              </strong>{' '}
              Claiming to have created or substantially contributed to 0nMCP
              when no such contribution exists.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>
                Passing off:
              </strong>{' '}
              Presenting any third-party software as 0nMCP or as an
              &quot;official&quot; version.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>
                Reverse engineering for competitive purposes:
              </strong>{' '}
              Using source code to create a competing product that mimics the
              distinctive architecture or brand identity.
            </li>
            <li>
              <strong style={{ color: 'var(--text-primary)' }}>
                API or service impersonation:
              </strong>{' '}
              Creating services that respond to or intercept traffic intended
              for 0n domains.
            </li>
          </ol>
        </section>

        {/* 5. OPEN SOURCE */}
        <section className="mb-16" id="open-source">
          <h2
            className="text-2xl font-bold mb-6 pb-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            5. Open Source License Scope
          </h2>
          <p
            className="text-[0.95rem] leading-relaxed mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            Certain 0n ecosystem software is released under the{' '}
            <strong style={{ color: 'var(--text-primary)' }}>MIT License</strong>.
            This license grants permissions related to the{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              source code only
            </strong>
            . The MIT License explicitly does{' '}
            <strong style={{ color: 'var(--text-primary)' }}>not</strong> grant
            any rights to:
          </p>
          <ul
            className="text-[0.95rem] leading-relaxed ml-6 list-disc flex flex-col gap-2 mb-6"
            style={{ color: 'var(--text-secondary)' }}
          >
            <li>Trademarks, service marks, or trade dress owned by RocketOpp, LLC</li>
            <li>Patents or patent applications filed by RocketOpp, LLC</li>
            <li>Brand identity elements including names, logos, color schemes, and visual design</li>
            <li>The distinctive &quot;0n&quot; prefix as used in product names</li>
            <li>Domain names, social media handles, or npm package names controlled by RocketOpp, LLC</li>
          </ul>
          <div
            className="rounded-lg p-6"
            style={{
              background: 'rgba(255,107,53,0.08)',
              border: '1px solid rgba(255,107,53,0.25)',
              borderLeft: '4px solid #ff6b35',
            }}
          >
            <h4
              className="font-mono text-xs uppercase tracking-wide mb-2"
              style={{ color: '#ff6b35' }}
            >
              Important Clarification
            </h4>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              The MIT License permits you to use, copy, modify, and distribute
              the software code. It does{' '}
              <strong style={{ color: 'var(--text-primary)' }}>not</strong>{' '}
              permit you to use the{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                name &quot;0nMCP&quot;
              </strong>
              , the{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                &quot;0n&quot; brand prefix
              </strong>
              , or any of our trademarks in connection with your modified
              version. If you fork the code, you must use a different name.
            </p>
          </div>
        </section>

        {/* 6-10 abbreviated sections */}
        <section className="mb-16" id="enforcement">
          <h2
            className="text-2xl font-bold mb-6 pb-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            6. Enforcement &amp; Remedies
          </h2>
          <p
            className="text-[0.95rem] leading-relaxed mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            RocketOpp, LLC actively monitors for unauthorized use of its
            intellectual property. We employ automated monitoring systems,
            manual review processes, and third-party enforcement services. Upon
            detecting infringement, we may pursue cease-and-desist letters,
            DMCA takedowns, UDRP complaints, platform abuse reports, and
            federal court litigation.
          </p>
        </section>

        <section className="mb-16" id="dmca">
          <h2
            className="text-2xl font-bold mb-6 pb-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            7. DMCA &amp; Takedown Policy
          </h2>
          <p
            className="text-[0.95rem] leading-relaxed mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            RocketOpp, LLC complies with the Digital Millennium Copyright Act.
            To file a DMCA notice, contact:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              legal@rocketopp.com
            </strong>
          </p>
        </section>

        <section className="mb-16" id="report-section">
          <h2
            className="text-2xl font-bold mb-6 pb-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            8. Reporting Infringement
          </h2>
          <div
            className="rounded-xl p-8"
            style={{
              background:
                'linear-gradient(135deg, rgba(0,255,136,0.05), rgba(0,212,255,0.05))',
              border: '1px solid rgba(0,255,136,0.15)',
            }}
          >
            <h4 className="mb-2" style={{ color: 'var(--accent)' }}>
              Report Infringement
            </h4>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              <strong style={{ color: 'var(--text-primary)' }}>Email:</strong>{' '}
              legal@rocketopp.com
              <br />
              <strong style={{ color: 'var(--text-primary)' }}>
                Dedicated Page:
              </strong>{' '}
              <a href="/report" style={{ color: 'var(--accent)' }}>
                0nmcp.com/report
              </a>
              <br />
              <strong style={{ color: 'var(--text-primary)' }}>
                Response Time:
              </strong>{' '}
              Within 24 hours on business days
            </p>
          </div>
        </section>

        <section className="mb-16" id="disclaimers">
          <h2
            className="text-2xl font-bold mb-6 pb-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            9. Disclaimers &amp; Limitation of Liability
          </h2>
          <p
            className="text-[0.95rem] leading-relaxed mb-4 uppercase"
            style={{ color: 'var(--text-secondary)' }}
          >
            THE 0nMCP SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY
            OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
            WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
            NONINFRINGEMENT.
          </p>
        </section>

        <section className="mb-16" id="contact">
          <h2
            className="text-2xl font-bold mb-6 pb-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            10. Contact Information
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <tbody>
                {[
                  ['Entity', 'RocketOpp, LLC'],
                  ['Location', 'Pittsburgh, Pennsylvania, United States'],
                  ['Legal Inquiries', 'legal@rocketopp.com'],
                  ['General Contact', 'mike@rocketopp.com'],
                  ['Website', 'https://0nmcp.com'],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td
                      className="px-4 py-3 font-semibold font-mono"
                      style={{
                        color: 'var(--text-primary)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {label}
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{
                        color: 'var(--text-secondary)',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p
            className="mt-8 font-mono text-xs text-center"
            style={{ color: 'var(--text-muted)' }}
          >
            &copy; 2026 RocketOpp, LLC. All rights reserved.
            <br />
            0nMCP&trade;, 0nORK&trade;, .0n Standard&trade; are trademarks of
            RocketOpp, LLC.
            <br />
            Patent Pending: US Application #63/968,814
          </p>
        </section>
      </div>
    </>
  )
}
