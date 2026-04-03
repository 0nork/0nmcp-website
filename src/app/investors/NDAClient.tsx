'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

const NDA_TEXT = `MUTUAL NON-DISCLOSURE AGREEMENT

Effective Date: The date of electronic signature below.

PARTIES:
  Disclosing Party: RocketOpp LLC, a Pennsylvania limited liability company ("RocketOpp")
  Receiving Party: The individual or entity identified in the signature block below ("Recipient")

Collectively referred to as the "Parties."

1. PURPOSE
The Parties wish to explore a potential business relationship relating to investment in, partnership with, or strategic collaboration with RocketOpp and its 0nMCP platform, products, and related technologies (the "Purpose"). In connection with the Purpose, each Party may disclose certain Confidential Information to the other Party.

2. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" means all non-public information disclosed by either Party to the other, whether orally, in writing, electronically, or by inspection, including but not limited to:
  (a) Business plans, strategies, projections, and financial data;
  (b) Patent applications, inventions, trade secrets, and intellectual property (including US Provisional Patent Applications #63/968,814, #63/990,046, and related filings);
  (c) Technical architecture, source code, algorithms, system designs, and product roadmaps;
  (d) Customer data, user metrics, revenue figures, and pricing models;
  (e) Marketing strategies, partnership arrangements, and distribution channels;
  (f) Information about employees, contractors, and organizational structure;
  (g) Any materials marked "Confidential," "Proprietary," or with similar designation;
  (h) Any information that a reasonable person would understand to be confidential given the nature of the information and circumstances of disclosure.

3. OBLIGATIONS OF THE RECEIVING PARTY
The Receiving Party agrees to:
  (a) Hold all Confidential Information in strict confidence;
  (b) Not disclose Confidential Information to any third party without prior written consent of the Disclosing Party;
  (c) Use Confidential Information solely for the Purpose described herein;
  (d) Not use Confidential Information to develop, create, or assist in the development of any competing product or service;
  (e) Limit internal disclosure to employees, advisors, or agents who have a need to know and who are bound by confidentiality obligations at least as protective as those herein;
  (f) Protect Confidential Information using the same degree of care used to protect its own confidential information, but in no event less than reasonable care;
  (g) Promptly notify the Disclosing Party of any unauthorized disclosure or use of Confidential Information.

4. EXCLUSIONS
Confidential Information does not include information that:
  (a) Is or becomes publicly available through no fault of the Receiving Party;
  (b) Was known to the Receiving Party prior to disclosure, as evidenced by written records;
  (c) Is independently developed by the Receiving Party without use of or reference to the Confidential Information;
  (d) Is rightfully obtained from a third party without restriction on disclosure.

5. COMPELLED DISCLOSURE
If the Receiving Party is compelled by law, regulation, or legal process to disclose Confidential Information, the Receiving Party shall provide prompt written notice to the Disclosing Party (to the extent legally permitted) and shall disclose only that portion of the Confidential Information that is legally required.

6. RETURN OF MATERIALS
Upon written request by the Disclosing Party, or upon termination of discussions relating to the Purpose, the Receiving Party shall promptly return or destroy all Confidential Information and any copies, extracts, or derivatives thereof, and shall certify such return or destruction in writing.

7. NO LICENSE OR WARRANTY
Nothing in this Agreement grants any license, title, or ownership rights in the Confidential Information. The Disclosing Party makes no warranty regarding the accuracy or completeness of the Confidential Information.

8. TERM
The obligations of confidentiality under this Agreement shall remain in effect for a period of two (2) years from the date of signature, regardless of whether the Parties proceed with any business relationship.

9. REMEDIES
The Receiving Party acknowledges that any breach of this Agreement may cause irreparable harm to the Disclosing Party for which monetary damages may be insufficient. The Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to any other remedies available at law.

10. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the Commonwealth of Pennsylvania, without regard to its conflict of laws provisions.

11. ENTIRE AGREEMENT
This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior discussions, negotiations, and agreements relating thereto. This Agreement may not be amended except by a writing signed by both Parties.

12. ELECTRONIC SIGNATURE
The Parties agree that typing one's name in the signature field below and clicking "I agree" constitutes a valid electronic signature under the Electronic Signatures in Global and National Commerce Act (E-SIGN Act) and the Uniform Electronic Transactions Act (UETA), and is binding to the same extent as a handwritten signature.`

export default function NDAClient() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [signature, setSignature] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = name.trim() && email.trim() && signature.trim() && agreed && !loading

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/investors/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim() || undefined,
          signature: signature.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to process NDA. Please try again.')
        setLoading(false)
        return
      }

      router.push(`/investors/portal?token=${data.token}`)
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#030508', color: '#e2e8f0' }}>
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '60px 24px 120px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <p
          style={{
            color: '#7ed957',
            fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
            fontSize: 13,
            textTransform: 'uppercase',
            letterSpacing: 3,
            marginBottom: 16,
          }}
        >
          Confidential
        </p>
        <h1
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            lineHeight: 1.15,
            marginBottom: 16,
            letterSpacing: '-0.03em',
            fontFamily: 'var(--font-display, "Instrument Sans", sans-serif)',
            background: 'linear-gradient(135deg, #7ed957 0%, #00d4ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Investor Portal
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 16, maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
          To access the 0nMCP pitch deck and investor materials, please review and sign the
          Non-Disclosure Agreement below.
        </p>
      </div>

      {/* NDA Card */}
      <form onSubmit={handleSubmit}>
        <div
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: 0,
            backdropFilter: 'blur(20px)',
            overflow: 'hidden',
          }}
        >
          {/* NDA Header */}
          <div
            style={{
              padding: '24px 32px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h2 style={{ fontSize: 18, margin: 0, fontWeight: 700, background: 'linear-gradient(135deg, #7ed957 0%, #00d4ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Non-Disclosure Agreement
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                RocketOpp LLC — Mutual NDA
              </p>
            </div>
            <div
              style={{
                background: 'rgba(126,217,87,0.1)',
                border: '1px solid rgba(126,217,87,0.2)',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 12,
                color: '#7ed957',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 600,
              }}
            >
              LEGAL DOCUMENT
            </div>
          </div>

          {/* NDA Text */}
          <div
            style={{
              padding: '24px 32px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 12,
                padding: '24px 28px',
                maxHeight: 400,
                overflowY: 'auto',
                fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
                fontSize: 12.5,
                lineHeight: 1.8,
                color: '#cbd5e1',
                whiteSpace: 'pre-wrap',
              }}
            >
              {NDA_TEXT}
            </div>
          </div>

          {/* Form Fields */}
          <div style={{ padding: '28px 32px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 20,
                marginBottom: 24,
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 8,
                    color: '#e2e8f0',
                  }}
                >
                  Full Legal Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    color: '#f1f5f9',
                    fontSize: 15,
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 8,
                    color: '#e2e8f0',
                  }}
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@company.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    color: '#f1f5f9',
                    fontSize: 15,
                    outline: 'none',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: '#e2e8f0',
                }}
              >
                Company / Fund Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Optional"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  color: '#f1f5f9',
                  fontSize: 15,
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Signature */}
            <div style={{ marginBottom: 28 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: '#e2e8f0',
                }}
              >
                Type Your Full Name as Signature *
              </label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Type your full legal name"
                required
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10,
                  color: '#f1f5f9',
                  fontSize: 20,
                  fontStyle: 'italic',
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{ margin: '8px 0 0', fontSize: 12, color: '#64748b' }}>
                Your typed name serves as your legally binding electronic signature under the E-SIGN Act.
              </p>
            </div>

            {/* Checkbox */}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                marginBottom: 28,
                cursor: 'pointer',
                fontSize: 14,
                color: '#e2e8f0',
                lineHeight: 1.5,
              }}
            >
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{
                  marginTop: 3,
                  width: 18,
                  height: 18,
                  accentColor: '#7ed957',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
              />
              <span>
                I have read and agree to the terms of this Non-Disclosure Agreement. I understand that this
                constitutes a legally binding agreement between myself (or my organization) and RocketOpp LLC.
              </span>
            </label>

            {/* Error */}
            {error && (
              <div
                style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: 10,
                  padding: '12px 16px',
                  marginBottom: 20,
                  color: '#fca5a5',
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              style={{
                width: '100%',
                padding: '16px 32px',
                background: canSubmit ? '#7ed957' : 'rgba(126,217,87,0.15)',
                color: canSubmit ? '#000' : 'rgba(126,217,87,0.4)',
                border: 'none',
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--font-display, "Instrument Sans", sans-serif)',
                transition: 'all 0.2s',
                letterSpacing: '0.01em',
              }}
            >
              {loading ? 'Processing...' : 'Sign NDA & Access Materials'}
            </button>

            <p
              style={{
                textAlign: 'center',
                marginTop: 16,
                fontSize: 12,
                color: '#475569',
              }}
            >
              Questions? Contact{' '}
              <a href="mailto:mike@rocketopp.com" style={{ color: '#7ed957', textDecoration: 'none' }}>
                mike@rocketopp.com
              </a>
            </p>
          </div>
        </div>
      </form>
    </div>
    </div>
  )
}
