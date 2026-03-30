import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase/server'
import { CERT_TEMPLATES } from '@/lib/linkedin-certification'

interface Props {
  params: Promise<{ certId: string }>
}

async function getCertification(certId: string) {
  const supabase = await createSupabaseServer()
  if (!supabase) return null

  const { data } = await supabase
    .from('certifications')
    .select('*')
    .eq('cert_id', certId)
    .single()

  return data
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { certId } = await params
  const cert = await getCertification(certId)
  if (!cert) return { title: 'Certification Not Found — 0nMCP' }

  return {
    title: `${cert.cert_name} — Verified Certification | 0nMCP`,
    description: `Verify that ${cert.user_name ?? cert.user_email} earned the ${cert.cert_name} certification from 0nMCP by RocketOpp.`,
    openGraph: {
      title: `${cert.cert_name} — Verified`,
      description: `Issued to ${cert.user_name ?? 'a certified professional'} on ${new Date(cert.issued_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    },
  }
}

export default async function VerifyCertPage({ params }: Props) {
  const { certId } = await params
  const cert = await getCertification(certId)

  if (!cert) notFound()

  const template = CERT_TEMPLATES[cert.course_slug]
  const issueDate = new Date(cert.issued_at)
  const formattedDate = issueDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalCredential',
    name: cert.cert_name,
    description: template?.description ?? `${cert.cert_name} certification from 0nMCP by RocketOpp.`,
    credentialCategory: 'Certificate',
    recognizedBy: {
      '@type': 'Organization',
      name: '0nMCP by RocketOpp',
      url: 'https://0nmcp.com',
    },
    validFrom: cert.issued_at,
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'certId',
      value: cert.cert_id,
    },
    ...(cert.user_name
      ? {
          about: {
            '@type': 'Person',
            name: cert.user_name,
          },
        }
      : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
          fontFamily: "'Instrument Sans', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 600,
            width: '100%',
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0B0F19, #162032)',
              padding: '2rem 2rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: '#6EE05A',
                letterSpacing: '-0.02em',
              }}
            >
              0nMCP
            </div>
            <div
              style={{
                fontSize: 13,
                color: '#7A8290',
                marginTop: 4,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Certification Verification
            </div>
          </div>

          {/* Verified badge */}
          <div style={{ textAlign: 'center', marginTop: -20 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: cert.verified ? '#dcfce7' : '#fee2e2',
                color: cert.verified ? '#166534' : '#991b1b',
                padding: '8px 24px',
                borderRadius: 100,
                fontSize: 14,
                fontWeight: 700,
                border: `2px solid ${cert.verified ? '#bbf7d0' : '#fecaca'}`,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {cert.verified ? (
                  <path d="M20 6L9 17l-5-5" />
                ) : (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                )}
              </svg>
              {cert.verified ? 'Verified' : 'Revoked'}
            </span>
          </div>

          {/* Body */}
          <div style={{ padding: '2rem' }}>
            {/* Cert name */}
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: '#0f172a',
                textAlign: 'center',
                margin: '0.5rem 0',
                lineHeight: 1.3,
              }}
            >
              {cert.cert_name}
            </h1>

            {/* Recipient */}
            {cert.user_name && (
              <p
                style={{
                  fontSize: 18,
                  color: '#334155',
                  textAlign: 'center',
                  margin: '0.25rem 0 1.5rem',
                }}
              >
                Awarded to <strong>{cert.user_name}</strong>
              </p>
            )}

            {/* Details grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginTop: cert.user_name ? 0 : '1.5rem',
              }}
            >
              <DetailCard label="Course" value={template?.courseTitle ?? cert.course_slug} />
              <DetailCard label="Issued" value={formattedDate} />
              <DetailCard label="Cert ID" value={cert.cert_id} mono />
              <DetailCard
                label="Issuer"
                value="0nMCP by RocketOpp"
              />
            </div>

            {/* Description */}
            {template?.description && (
              <p
                style={{
                  fontSize: 14,
                  color: '#64748b',
                  lineHeight: 1.6,
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: '#f8fafc',
                  borderRadius: 8,
                  borderLeft: '3px solid #6EE05A',
                }}
              >
                {template.description}
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: '1px solid #e2e8f0',
              padding: '1.25rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
              This certification was issued by 0nMCP by RocketOpp
            </p>
            <a
              href={`https://0nmcp.com/learn/${cert.course_slug}`}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#6EE05A',
                textDecoration: 'none',
              }}
            >
              View Course &rarr;
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

function DetailCard({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div
      style={{
        background: '#f8fafc',
        borderRadius: 8,
        padding: '0.75rem 1rem',
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#1e293b',
          fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit',
          wordBreak: 'break-all',
        }}
      >
        {value}
      </div>
    </div>
  )
}
