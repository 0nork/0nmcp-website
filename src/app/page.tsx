import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '0nMCP — Your AI Command Center',
  description:
    'One extension. 1,171 tools. Every platform. AI Compose, Multi-AI Council, LinkedIn Automation, CRM Integration. Start free with 100 Sparks.',
  keywords: [
    '0nMCP',
    'AI command center',
    'Chrome extension',
    'AI tools',
    'LinkedIn automation',
    'CRM integration',
    'AI compose',
  ],
  openGraph: {
    title: '0nMCP — Your AI Command Center',
    description: 'One extension. 1,171 tools. Every platform. Start free with 100 Sparks.',
    url: 'https://www.0nmcp.com',
    siteName: '0nMCP',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '0nMCP — Your AI Command Center',
    description: 'One extension. 1,171 tools. Every platform. Start free with 100 Sparks.',
  },
  alternates: { canonical: 'https://www.0nmcp.com' },
}

const features = [
  {
    title: 'AI Compose',
    desc: 'Generate messages, posts, emails — anywhere you type.',
    color: '#6EE05A',
  },
  {
    title: 'Multi-AI Council',
    desc: 'Ask GPT, Gemini, Grok, Claude at once. Compare answers.',
    color: '#00d4ff',
  },
  {
    title: 'LinkedIn Automation',
    desc: 'Scrape, compose, manage leads — all from one panel.',
    color: '#a78bfa',
  },
  {
    title: 'CRM Integration',
    desc: 'Contacts, pipeline, invoices — connected to your AI.',
    color: '#fbbf24',
  },
]

const steps = [
  { num: '1', title: 'Sign up in 10 seconds', desc: 'Name, email, password. That\'s it.' },
  { num: '2', title: 'Install the Chrome extension', desc: 'One click from your dashboard.' },
  { num: '3', title: 'AI works everywhere', desc: 'LinkedIn, CRM, email, social — all powered.' },
]

export default function HomePage() {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'RocketOpp, LLC',
    url: 'https://www.0nmcp.com',
    logo: 'https://www.0nmcp.com/icon.svg',
    sameAs: [
      'https://github.com/0nork/0nMCP',
      'https://npmjs.com/package/0nmcp',
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />

      <div style={{
        minHeight: '100vh',
        background: '#0B0F19',
        color: '#E8EAED',
        fontFamily: "'Instrument Sans', system-ui, sans-serif",
      }}>
        {/* ── HERO ── */}
        <section style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '4rem 1.5rem 3rem',
        }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            margin: '0 0 1rem',
            maxWidth: '700px',
          }}>
            Your AI{' '}
            <span style={{
              background: 'linear-gradient(135deg, #6EE05A 0%, #4CAF3D 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Command Center
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.375rem)',
            color: '#a0a0a0',
            margin: '0 0 2.5rem',
            maxWidth: '500px',
            lineHeight: 1.5,
          }}>
            One extension. 1,171 tools. Every platform.
          </p>

          <Link
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 2.5rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #6EE05A 0%, #4CAF3D 100%)',
              color: '#0B0F19',
              fontSize: '1.125rem',
              fontWeight: 700,
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 0 40px rgba(110, 224, 90, 0.25)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            Get Started Free — 100 Sparks
          </Link>

          <p style={{
            fontSize: '0.8125rem',
            color: '#606060',
            marginTop: '0.875rem',
          }}>
            No credit card required to start
          </p>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section style={{
          padding: '4rem 1.5rem',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          <h2 style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#6EE05A',
            textAlign: 'center',
            marginBottom: '2.5rem',
          }}>
            How it works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
          }}>
            {steps.map((step) => (
              <div key={step.num} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '0.75rem',
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  border: '2px solid #6EE05A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#6EE05A',
                }}>
                  {step.num}
                </div>
                <h3 style={{
                  fontSize: '1.0625rem',
                  fontWeight: 700,
                  margin: 0,
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#a0a0a0',
                  margin: 0,
                  lineHeight: 1.5,
                }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section style={{
          padding: '4rem 1.5rem',
          maxWidth: '900px',
          margin: '0 auto',
        }}>
          <h2 style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color: '#6EE05A',
            textAlign: 'center',
            marginBottom: '2.5rem',
          }}>
            What you get
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
          }}>
            {features.map((f) => (
              <div key={f.title} style={{
                padding: '1.5rem',
                borderRadius: '14px',
                background: '#111827',
                border: '1px solid #1e1e1e',
              }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: f.color,
                  marginBottom: '1rem',
                  boxShadow: `0 0 12px ${f.color}44`,
                }} />
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  margin: '0 0 0.5rem',
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontSize: '0.8125rem',
                  color: '#a0a0a0',
                  margin: 0,
                  lineHeight: 1.5,
                }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SOCIAL PROOF ── */}
        <section style={{
          padding: '3rem 1.5rem',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: '#606060',
            letterSpacing: '0.02em',
          }}>
            1,171 tools &middot; 54 services &middot; AES-256 encrypted
          </p>
        </section>

        {/* ── FOOTER CTA ── */}
        <section style={{
          padding: '4rem 1.5rem 6rem',
          textAlign: 'center',
        }}>
          <h2 style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: '0 0 1rem',
          }}>
            Start free. 100 Sparks on us.
          </h2>
          <p style={{
            fontSize: '1rem',
            color: '#a0a0a0',
            margin: '0 0 2rem',
          }}>
            No credit card. No commitment. Just AI that works.
          </p>
          <Link
            href="/signup"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 2rem',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6EE05A 0%, #4CAF3D 100%)',
              color: '#0B0F19',
              fontSize: '1rem',
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 0 30px rgba(110, 224, 90, 0.2)',
            }}
          >
            Get Started Free
          </Link>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{
          padding: '2rem 1.5rem',
          textAlign: 'center',
          borderTop: '1px solid #1e1e1e',
        }}>
          <p style={{
            fontSize: '0.75rem',
            color: '#606060',
            margin: 0,
          }}>
            &copy; {new Date().getFullYear()} RocketOpp, LLC. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  )
}
