'use client'

import { useState } from 'react'

interface CertificationBadgeProps {
  certId: string
  certName: string
  courseTitle: string
  issuedAt: string
  linkedinUrl: string
  userName?: string
}

export default function CertificationBadge({
  certId,
  certName,
  courseTitle,
  issuedAt,
  linkedinUrl,
  userName,
}: CertificationBadgeProps) {
  const [copied, setCopied] = useState(false)
  const verifyUrl = `https://0nmcp.com/verify/${certId}`

  const formattedDate = new Date(issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  function handleShare() {
    navigator.clipboard.writeText(verifyUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleDownload() {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${certName} — Certificate</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Instrument Sans', system-ui, sans-serif; background: #f1f5f9; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .cert { width: 800px; background: #fff; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #0B0F19, #162032); padding: 40px; text-align: center; }
    .logo { font-size: 42px; font-weight: 800; color: #6EE05A; letter-spacing: -0.02em; }
    .subtitle { font-size: 14px; color: #7A8290; margin-top: 8px; text-transform: uppercase; letter-spacing: 0.15em; }
    .body { padding: 48px 40px; text-align: center; }
    .cert-name { font-size: 28px; font-weight: 800; color: #0f172a; margin-bottom: 8px; }
    .awarded { font-size: 16px; color: #64748b; margin-bottom: 4px; }
    .name { font-size: 22px; font-weight: 700; color: #1e293b; margin-bottom: 24px; }
    .date { font-size: 14px; color: #94a3b8; margin-bottom: 8px; }
    .id { font-family: 'Courier New', monospace; font-size: 13px; color: #94a3b8; }
    .divider { width: 80px; height: 3px; background: #6EE05A; margin: 24px auto; border-radius: 2px; }
    .footer { border-top: 1px solid #e2e8f0; padding: 20px 40px; text-align: center; font-size: 12px; color: #94a3b8; }
    @media print { body { background: #fff; } .cert { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="cert">
    <div class="header">
      <div class="logo">0nMCP</div>
      <div class="subtitle">Certificate of Completion</div>
    </div>
    <div class="body">
      <h1 class="cert-name">${certName}</h1>
      <div class="divider"></div>
      <p class="awarded">This certifies that</p>
      <p class="name">${userName || 'Certified Professional'}</p>
      <p class="awarded">has successfully completed</p>
      <p class="name" style="margin-bottom:32px">${courseTitle}</p>
      <p class="date">Issued: ${formattedDate}</p>
      <p class="id">ID: ${certId}</p>
    </div>
    <div class="footer">
      Issued by 0nMCP by RocketOpp &mdash; Verify at ${verifyUrl}
    </div>
  </div>
</body>
</html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${certId}-certificate.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div
      style={{
        background: 'var(--bg-card, #111827)',
        borderRadius: 16,
        border: '1px solid var(--border, #1E293B)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(110,224,90,0.1)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        maxWidth: 480,
        width: '100%',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow =
          '0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px rgba(110,224,90,0.25)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow =
          '0 8px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(110,224,90,0.1)'
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: 4,
          background: 'linear-gradient(90deg, #6EE05A, #60A5FA)',
        }}
      />

      {/* Content */}
      <div style={{ padding: '1.5rem' }}>
        {/* Badge icon + cert name */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(110,224,90,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6EE05A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 15l-3.5 2 .9-3.8L6 10.3l3.9-.3L12 6.5l2.1 3.5 3.9.3-3.4 2.9.9 3.8z" />
              <path d="M8 21l1-4.5M16 21l-1-4.5" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: 'var(--text-primary, #E8EAED)',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {certName}
            </h3>
            <p
              style={{
                fontSize: 13,
                color: 'var(--text-secondary, #7A8290)',
                margin: '4px 0 0',
              }}
            >
              {courseTitle}
            </p>
          </div>
        </div>

        {/* Meta row */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 16,
            paddingTop: 16,
            borderTop: '1px solid var(--border, #1E293B)',
          }}
        >
          <MetaItem label="Issued" value={formattedDate} />
          <MetaItem label="ID" value={certId} mono />
        </div>
      </div>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '0 1.5rem 1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <ActionButton
          onClick={() => window.open(linkedinUrl, '_blank')}
          variant="primary"
          label="Add to LinkedIn Profile"
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          }
        />
        <ActionButton
          onClick={handleDownload}
          variant="secondary"
          label="Download"
          icon={
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          }
        />
        <ActionButton
          onClick={handleShare}
          variant="secondary"
          label={copied ? 'Copied!' : 'Share'}
          icon={
            copied ? (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            )
          }
        />
      </div>
    </div>
  )
}

function MetaItem({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-muted, #4A5568)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: 'var(--text-secondary, #7A8290)',
          fontFamily: mono ? "'JetBrains Mono', monospace" : 'inherit',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </div>
    </div>
  )
}

function ActionButton({
  onClick,
  variant,
  label,
  icon,
}: {
  onClick: () => void
  variant: 'primary' | 'secondary'
  label: string
  icon: React.ReactNode
}) {
  const isPrimary = variant === 'primary'

  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: isPrimary ? '10px 18px' : '10px 14px',
        borderRadius: 8,
        border: isPrimary ? 'none' : '1px solid var(--border, #1E293B)',
        background: isPrimary ? '#0A66C2' : 'transparent',
        color: isPrimary ? '#fff' : 'var(--text-secondary, #7A8290)',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: 'inherit',
        flex: isPrimary ? '1 1 100%' : '0 0 auto',
      }}
      onMouseEnter={(e) => {
        if (isPrimary) {
          e.currentTarget.style.background = '#004182'
        } else {
          e.currentTarget.style.borderColor = 'var(--border-hover, #2D3748)'
          e.currentTarget.style.color = 'var(--text-primary, #E8EAED)'
        }
      }}
      onMouseLeave={(e) => {
        if (isPrimary) {
          e.currentTarget.style.background = '#0A66C2'
        } else {
          e.currentTarget.style.borderColor = 'var(--border, #1E293B)'
          e.currentTarget.style.color = 'var(--text-secondary, #7A8290)'
        }
      }}
    >
      {icon}
      {label}
    </button>
  )
}
