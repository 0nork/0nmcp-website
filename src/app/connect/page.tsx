'use client'

import { useState } from 'react'

const INQUIRY_TYPES = [
  { value: 'partnership', label: 'Partnership Opportunity', desc: 'Strategic alliances, integrations, and co-development' },
  { value: 'investment', label: 'Investment Inquiry', desc: 'Funding rounds, equity participation, and venture opportunities' },
  { value: 'enterprise', label: 'Enterprise Licensing', desc: 'Volume licensing, white-label, and custom deployments' },
  { value: 'general', label: 'General Inquiry', desc: 'Questions, feedback, and collaboration ideas' },
]

export default function ConnectPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [inquiryType, setInquiryType] = useState('general')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!firstName.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          company: company.trim(),
          phone: phone.trim(),
          inquiryType,
          message: message.trim(),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Something went wrong')
      }

      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <main className="connect-page">
        <div className="connect-success">
          <div className="connect-success-icon">&#10003;</div>
          <h1>Message Received</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.7, maxWidth: 520, margin: '0 auto' }}>
            Thank you for reaching out. Our team reviews every inquiry personally and will respond within one business day.
          </p>
          <a href="/" className="auth-btn primary" style={{ display: 'inline-block', marginTop: '2rem', textDecoration: 'none' }}>
            Back to Home
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="connect-page">
      <div className="connect-hero">
        <div className="connect-hero-badge">Connect with 0nORK</div>
        <h1 className="connect-hero-title">
          Let&apos;s Build the <span>Future of AI Infrastructure</span> Together
        </h1>
        <p className="connect-hero-subtitle">
          Whether you&apos;re exploring a strategic partnership, evaluating an investment opportunity, or seeking enterprise-grade AI orchestration &mdash; we&apos;re ready to talk.
        </p>
      </div>

      <div className="connect-grid">
        <div className="connect-info">
          <section className="connect-section">
            <h2>Investment Opportunities</h2>
            <p>
              0nORK is actively accepting strategic investment from qualified partners who understand the trajectory of AI infrastructure. With a patent-pending orchestration architecture spanning 558 tools across 26 services, a fully operational SaaS marketplace generating metered revenue, and a proprietary vault encryption system under US Patent Application #63/990,046 &mdash; we are not a startup searching for product-market fit. We are an infrastructure company executing on a proven thesis. Our technology is live, our intellectual property is protected, and our growth metrics speak for themselves. We engage with investors who bring more than capital: domain expertise in AI, enterprise SaaS, or developer tooling is valued. If you operate at the intersection of venture capital and technical conviction, we should be in conversation.
            </p>
          </section>

          <section className="connect-section">
            <h2>Partnership Opportunities</h2>
            <p>
              We partner with organizations that share our commitment to making AI orchestration accessible and interoperable. From API integrations and co-developed solutions to white-label deployments and channel partnerships &mdash; our platform is built for extensibility.
            </p>
            <ul className="connect-list">
              <li>Technology integrations (add your service to 0nMCP)</li>
              <li>Channel and reseller partnerships</li>
              <li>Co-marketing and joint go-to-market</li>
              <li>White-label and OEM licensing</li>
            </ul>
          </section>

          <section className="connect-section">
            <h2>By the Numbers</h2>
            <div className="connect-stats">
              <div className="connect-stat">
                <div className="connect-stat-value">558</div>
                <div className="connect-stat-label">Production Tools</div>
              </div>
              <div className="connect-stat">
                <div className="connect-stat-value">26</div>
                <div className="connect-stat-label">Integrated Services</div>
              </div>
              <div className="connect-stat">
                <div className="connect-stat-value">2</div>
                <div className="connect-stat-label">Patents Filed</div>
              </div>
              <div className="connect-stat">
                <div className="connect-stat-value">MIT</div>
                <div className="connect-stat-label">Open Source License</div>
              </div>
            </div>
          </section>

          <section className="connect-section">
            <h2>Direct Contact</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Mike Mento</strong><br />
              Founder &amp; CEO, RocketOpp LLC<br />
              <a href="mailto:mike@rocketopp.com" style={{ color: 'var(--accent)' }}>mike@rocketopp.com</a>
            </p>
          </section>
        </div>

        <div className="connect-form-side">
          <form onSubmit={handleSubmit} className="connect-form">
            <h2 style={{ marginBottom: '0.25rem' }}>Send a Message</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              All fields marked with * are required.
            </p>

            {error && (
              <div className="connect-error">{error}</div>
            )}

            <div className="connect-form-row">
              <div className="auth-field">
                <label htmlFor="firstName">First Name *</label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                />
              </div>
              <div className="auth-field">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="connect-form-row">
              <div className="auth-field">
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  placeholder="Company name"
                />
              </div>
              <div className="auth-field">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Inquiry Type *</label>
              <div className="connect-inquiry-grid">
                {INQUIRY_TYPES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    className={`connect-inquiry-option${inquiryType === t.value ? ' active' : ''}`}
                    onClick={() => setInquiryType(t.value)}
                  >
                    <span className="connect-inquiry-label">{t.label}</span>
                    <span className="connect-inquiry-desc">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Tell us about your goals and how we can work together..."
                rows={5}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-btn primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.95rem' }}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textAlign: 'center', marginTop: '1rem', lineHeight: 1.6 }}>
              By submitting this form, you agree to be contacted by the 0nORK team regarding your inquiry.
              Your information will not be shared with third parties.
            </p>
          </form>
        </div>
      </div>

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ContactPage',
            name: 'Connect with 0nORK',
            description: 'Partnership opportunities, investment inquiries, and enterprise licensing for 0nMCP — the universal AI API orchestrator.',
            url: 'https://0nmcp.com/connect',
            mainEntity: {
              '@type': 'Organization',
              name: '0nORK',
              url: 'https://0nmcp.com',
              email: 'mike@rocketopp.com',
              founder: {
                '@type': 'Person',
                name: 'Mike Mento',
                jobTitle: 'Founder & CEO',
              },
            },
          }),
        }}
      />
    </main>
  )
}
