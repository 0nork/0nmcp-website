import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — 0nMCP by RocketOpp LLC',
  description: 'Privacy policy for 0nmcp.com. How we collect, use, and protect your data.',
  alternates: { canonical: 'https://0nmcp.com/privacy' },
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <main className="py-20 px-6">
      <div className="max-w-[800px] mx-auto">
        <div className="section-accent-line" />
        <span className="section-label">Legal</span>
        <h1 className="section-heading mb-4">Privacy Policy</h1>
        <p className="text-sm mb-12" style={{ color: 'var(--text-muted)' }}>
          Last updated: March 3, 2026
        </p>

        <div className="space-y-10">
          <Section title="1. Who We Are">
            <p>
              0nmcp.com is operated by <strong>RocketOpp LLC</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), a
              Pennsylvania limited liability company. Our principal contact is{' '}
              <a href="mailto:mike@rocketopp.com" className="text-link">mike@rocketopp.com</a>.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Account Information</h4>
            <p className="mb-4">
              When you create an account, we collect your email address, name, and any profile information you provide.
              If you sign in with Google, LinkedIn, or GitHub, we receive your public profile data (name, email, avatar)
              from the identity provider.
            </p>
            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>OAuth Tokens</h4>
            <p className="mb-4">
              If you use &ldquo;Connect Google&rdquo; to link your Google account, we store OAuth access tokens and refresh
              tokens to maintain your connection to Google services. These tokens are stored securely in our database and
              are only used to authenticate API calls on your behalf.
            </p>
            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Vault Credentials</h4>
            <p className="mb-4">
              API keys you store in the Console Vault are encrypted client-side using AES-256-GCM with PBKDF2 key
              derivation before being transmitted. We cannot read your API keys. Encryption and decryption happen
              entirely in your browser.
            </p>
            <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Usage Data</h4>
            <p>
              We collect standard web analytics data: pages visited, session duration, referral source, browser type,
              and device information. We use this data to improve our service.
            </p>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul className="list-disc list-inside space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Authenticate your identity and manage your account</li>
              <li>Execute API calls to third-party services on your behalf (using your stored credentials)</li>
              <li>Send transactional emails (account confirmation, password reset, security alerts)</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="mt-4">
              We do <strong>not</strong> sell your personal information to third parties. We do <strong>not</strong> use
              your data for advertising purposes.
            </p>
          </Section>

          <Section title="4. Third-Party Services">
            <p className="mb-4">We use the following third-party services to operate 0nmcp.com:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Supabase</strong> — Authentication and database hosting</li>
              <li><strong>Vercel</strong> — Application hosting and deployment</li>
              <li><strong>Stripe</strong> — Payment processing (we never store credit card numbers)</li>
              <li><strong>Google OAuth</strong> — Optional account linking for Google services</li>
            </ul>
            <p className="mt-4">
              Each third-party service has its own privacy policy governing its use of data.
            </p>
          </Section>

          <Section title="5. Google API Services">
            <p className="mb-4">
              0nmcp.com&apos;s use and transfer of information received from Google APIs adheres to the{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                Google API Services User Data Policy
              </a>
              , including the Limited Use requirements.
            </p>
            <p className="mb-4">
              When you connect your Google account, we request access to specific Google services (Gmail, Calendar,
              Drive, Sheets, etc.) as described during the consent process. We only access data within the scopes
              you explicitly authorize.
            </p>
            <p>
              You can revoke 0nmcp.com&apos;s access to your Google account at any time from your{' '}
              <a
                href="https://myaccount.google.com/permissions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                Google Account permissions page
              </a>
              .
            </p>
          </Section>

          <Section title="6. Data Security">
            <p>
              We implement industry-standard security measures including:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>Client-side AES-256-GCM encryption for vault credentials</li>
              <li>HTTPS/TLS encryption for all data in transit</li>
              <li>Row Level Security (RLS) policies on all database tables</li>
              <li>OAuth 2.0 with PKCE for authentication flows</li>
              <li>Secure HTTP-only cookies for session management</li>
            </ul>
          </Section>

          <Section title="7. Data Retention">
            <p>
              We retain your account data for as long as your account is active. If you delete your account, we will
              delete your personal data within 30 days, except where retention is required by law. Anonymized usage
              analytics may be retained indefinitely.
            </p>
          </Section>

          <Section title="8. Your Rights">
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent for optional data processing</li>
              <li>Revoke third-party OAuth connections at any time</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at{' '}
              <a href="mailto:mike@rocketopp.com" className="text-link">mike@rocketopp.com</a>.
            </p>
          </Section>

          <Section title="9. Cookies">
            <p>
              We use essential cookies for authentication and session management. We do not use advertising or
              tracking cookies. Analytics data is collected via server-side methods where possible.
            </p>
          </Section>

          <Section title="10. Children&apos;s Privacy">
            <p>
              0nmcp.com is not directed at children under 13. We do not knowingly collect personal information from
              children. If you believe we have inadvertently collected data from a child, contact us and we will
              delete it promptly.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this privacy policy from time to time. We will notify registered users of material
              changes via email. The &ldquo;Last updated&rdquo; date at the top reflects the most recent revision.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              For questions about this privacy policy or our data practices, contact:
            </p>
            <div className="float-card mt-4">
              <p><strong>RocketOpp LLC</strong></p>
              <p>Email: <a href="mailto:mike@rocketopp.com" className="text-link">mike@rocketopp.com</a></p>
              <p>Website: <a href="https://0nmcp.com" className="text-link">0nmcp.com</a></p>
            </div>
          </Section>
        </div>

        <div className="mt-16 pt-8 flex items-center gap-4" style={{ borderTop: '1px solid var(--border)' }}>
          <Link href="/legal" className="text-sm text-link">Legal &amp; IP Policy</Link>
          <span style={{ color: 'var(--text-muted)' }}>&middot;</span>
          <Link href="/terms" className="text-sm text-link">Terms of Service</Link>
          <span style={{ color: 'var(--text-muted)' }}>&middot;</span>
          <Link href="/" className="text-sm text-link">Home</Link>
        </div>
      </div>
    </main>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{title}</h3>
      <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{children}</div>
    </section>
  )
}
