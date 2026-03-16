'use client'

import { useState, useRef } from 'react'

interface SignatureData {
  name: string
  title: string
  company: string
  companyUrl: string
  email: string
  location: string
  iconUrl: string
  tagline: string
  badge: string
  ctaText: string
  ctaUrl: string
  ctaLabel: string
  footerText: string
  github: string
  linkedin: string
  discord: string
  twitter: string
  accentColor: string
  accentSecondary: string
}

const DEFAULT: SignatureData = {
  name: 'Michael Mento Jr.',
  title: 'Founder & CEO',
  company: '0nMCP',
  companyUrl: 'https://0nmcp.com',
  email: 'mike@0ncore.com',
  location: 'New Alexandria, PA',
  iconUrl: 'https://0nmcp.com/brand/0n-icon.jpg',
  tagline: 'Universal AI API Orchestrator  \u00b7  Pay Per Use  \u00b7  No Subscriptions',
  badge: '870+ TOOLS',
  ctaText: 'Build, package & transfer complete digital businesses',
  ctaUrl: 'https://0nmcp.com',
  ctaLabel: 'Try 0nMCP Free \u2192',
  footerText: 'Patent Pending  \u00b7  USPTO #63/990,046  \u00b7  \u00a9 2026 RocketOpp LLC',
  github: 'https://github.com/0nork',
  linkedin: 'https://linkedin.com/in/mikemento',
  discord: 'https://discord.gg/0nmcp',
  twitter: 'https://x.com/0nmcp',
  accentColor: '#7ed957',
  accentSecondary: '#5cb83a',
}

function generateHTML(d: SignatureData): string {
  const accent = d.accentColor || '#7ed957'
  const accentDim = d.accentSecondary || '#5cb83a'
  const accentRgb = hexToRgb(accent)
  const accentBg = accentRgb ? `rgba(${accentRgb},0.1)` : 'rgba(126,217,87,0.1)'
  const accentBorder = accentRgb ? `rgba(${accentRgb},0.2)` : 'rgba(126,217,87,0.2)'

  const socials = [
    d.github ? `<td style="padding-right:6px"><a href="${esc(d.github)}" style="text-decoration:none"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="width:32px;height:32px;background:#f3f4f6;border-radius:8px;text-align:center;vertical-align:middle"><img src="https://img.icons8.com/fluency-systems-filled/18/1a1a2e/github.png" alt="GitHub" width="16" height="16" style="display:inline-block;vertical-align:middle"></td></tr></table></a></td>` : '',
    d.linkedin ? `<td style="padding-right:6px"><a href="${esc(d.linkedin)}" style="text-decoration:none"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="width:32px;height:32px;background:#f3f4f6;border-radius:8px;text-align:center;vertical-align:middle"><img src="https://img.icons8.com/fluency-systems-filled/18/1a1a2e/linkedin.png" alt="LinkedIn" width="16" height="16" style="display:inline-block;vertical-align:middle"></td></tr></table></a></td>` : '',
    d.discord ? `<td style="padding-right:6px"><a href="${esc(d.discord)}" style="text-decoration:none"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="width:32px;height:32px;background:#f3f4f6;border-radius:8px;text-align:center;vertical-align:middle"><img src="https://img.icons8.com/fluency-systems-filled/18/1a1a2e/discord-new-logo.png" alt="Discord" width="16" height="16" style="display:inline-block;vertical-align:middle"></td></tr></table></a></td>` : '',
    d.twitter ? `<td><a href="${esc(d.twitter)}" style="text-decoration:none"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="width:32px;height:32px;background:#f3f4f6;border-radius:8px;text-align:center;vertical-align:middle"><img src="https://img.icons8.com/fluency-systems-filled/18/1a1a2e/twitterx--v1.png" alt="X" width="16" height="16" style="display:inline-block;vertical-align:middle"></td></tr></table></a></td>` : '',
  ].filter(Boolean).join('\n            ')

  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1a1a2e;max-width:560px">
  <tr>
    <td style="padding-bottom:0">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr><td style="height:3px;background:linear-gradient(90deg,${accent} 0%,${accentDim} 50%,${accent} 100%);border-radius:3px;font-size:0;line-height:0">&nbsp;</td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding-top:20px">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:top;padding-right:20px">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="width:72px;height:72px;background:#0a0a0f;border-radius:16px;text-align:center;vertical-align:middle;overflow:hidden">
                  <a href="${esc(d.companyUrl)}" style="text-decoration:none">
                    <img src="${esc(d.iconUrl)}" alt="${esc(d.company)}" width="72" height="72" style="display:block;border-radius:16px;object-fit:cover">
                  </a>
                </td>
              </tr>
            </table>
          </td>
          <td style="vertical-align:top">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="font-size:18px;font-weight:700;color:#0f0f1a;letter-spacing:-0.3px;line-height:1.2;padding-bottom:2px">
                  ${esc(d.name)}
                </td>
              </tr>
              <tr>
                <td style="font-size:12px;font-weight:600;color:${accent};letter-spacing:1.5px;text-transform:uppercase;padding-bottom:10px;line-height:1.4">
                  ${esc(d.title)}
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:14px">
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="font-size:15px;font-weight:800;color:#0f0f1a;letter-spacing:-0.5px;font-family:'SF Mono','Fira Code','Consolas',monospace">
                        ${esc(d.company)}
                      </td>${d.badge ? `
                      <td style="padding-left:10px">
                        <span style="font-size:10px;font-weight:600;color:${accent};background:${accentBg};padding:2px 8px;border-radius:10px;letter-spacing:0.5px;border:1px solid ${accentBorder}">${esc(d.badge)}</span>
                      </td>` : ''}
                    </tr>
                  </table>
                </td>
              </tr>${d.tagline ? `
              <tr>
                <td style="font-size:11px;color:#6b7280;font-style:italic;padding-bottom:14px;line-height:1.5;letter-spacing:0.2px">
                  ${esc(d.tagline)}
                </td>
              </tr>` : ''}
              <tr>
                <td style="padding-bottom:14px">
                  <table cellpadding="0" cellspacing="0" border="0" width="100%">
                    <tr><td style="height:1px;background:linear-gradient(90deg,#e5e7eb 0%,transparent 100%);font-size:0;line-height:0">&nbsp;</td></tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td style="padding-bottom:6px">
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="width:16px;vertical-align:middle;padding-right:8px">
                              <img src="https://img.icons8.com/fluency-systems-filled/16/${accent.replace('#', '')}/globe--v1.png" alt="" width="14" height="14" style="display:block">
                            </td>
                            <td style="font-size:13px;color:#4b5563;vertical-align:middle;line-height:1">
                              <a href="${esc(d.companyUrl)}" style="color:#0f0f1a;text-decoration:none;font-weight:600">${esc(d.companyUrl.replace('https://', ''))}</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom:6px">
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="width:16px;vertical-align:middle;padding-right:8px">
                              <img src="https://img.icons8.com/fluency-systems-filled/16/${accent.replace('#', '')}/new-post.png" alt="" width="14" height="14" style="display:block">
                            </td>
                            <td style="font-size:13px;color:#4b5563;vertical-align:middle;line-height:1">
                              <a href="mailto:${esc(d.email)}" style="color:#4b5563;text-decoration:none">${esc(d.email)}</a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>${d.location ? `
                    <tr>
                      <td style="padding-bottom:0">
                        <table cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="width:16px;vertical-align:middle;padding-right:8px">
                              <img src="https://img.icons8.com/fluency-systems-filled/16/6b7280/marker.png" alt="" width="14" height="14" style="display:block">
                            </td>
                            <td style="font-size:12px;color:#9ca3af;vertical-align:middle;line-height:1">
                              ${esc(d.location)}
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>` : ''}
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>${socials ? `
  <tr>
    <td style="padding-top:16px">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
            ${socials}
        </tr>
      </table>
    </td>
  </tr>` : ''}${d.ctaText ? `
  <tr>
    <td style="padding-top:16px">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background:linear-gradient(135deg,#0f0f1a 0%,#1a1a2e 100%);border-radius:10px;padding:12px 20px">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:middle;padding-right:12px">
                  <span style="font-size:16px">\u26A1</span>
                </td>
                <td style="vertical-align:middle">
                  <span style="font-size:11px;color:#9ca3af;letter-spacing:0.3px;line-height:1.4">${esc(d.ctaText)}</span><br>
                  <a href="${esc(d.ctaUrl)}" style="font-size:12px;color:${accent};text-decoration:none;font-weight:700;letter-spacing:0.5px">${esc(d.ctaLabel)}</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>` : ''}${d.footerText ? `
  <tr>
    <td style="padding-top:12px">
      <span style="font-size:9px;color:#c4c4c4;letter-spacing:0.5px">${esc(d.footerText)}</span>
    </td>
  </tr>` : ''}
</table>`
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function hexToRgb(hex: string): string | null {
  const m = hex.replace('#', '').match(/.{2}/g)
  if (!m || m.length < 3) return null
  return m.slice(0, 3).map(h => parseInt(h, 16)).join(',')
}

const FIELD_STYLE: React.CSSProperties = {
  width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8,
  border: '1px solid var(--border)', background: 'var(--bg-card)',
  color: 'var(--text-primary)', fontSize: '0.8rem', fontFamily: 'inherit',
  outline: 'none',
}

const LABEL_STYLE: React.CSSProperties = {
  fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)',
  textTransform: 'uppercase' as const, letterSpacing: '0.04em', marginBottom: 4, display: 'block',
}

export default function EmailSignaturePage() {
  const [data, setData] = useState<SignatureData>({ ...DEFAULT })
  const [copied, setCopied] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const set = (key: keyof SignatureData, val: string) => setData(d => ({ ...d, [key]: val }))

  const html = generateHTML(data)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(html)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = html
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyRich = async () => {
    try {
      const blob = new Blob([html], { type: 'text/html' })
      await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      handleCopy()
    }
  }

  return (
    <div style={{ padding: '24px 32px 64px', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
        Email Signature Builder
      </h1>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 24 }}>
        Fill in your details, customize colors, then copy the HTML into your email client.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Form */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 14, border: '1px solid var(--border)',
          padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
          maxHeight: 'calc(100vh - 140px)', overflowY: 'auto',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Personal Info
          </div>

          <div>
            <label style={LABEL_STYLE}>Full Name</label>
            <input style={FIELD_STYLE} value={data.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label style={LABEL_STYLE}>Title</label>
            <input style={FIELD_STYLE} value={data.title} onChange={e => set('title', e.target.value)} />
          </div>
          <div>
            <label style={LABEL_STYLE}>Company</label>
            <input style={FIELD_STYLE} value={data.company} onChange={e => set('company', e.target.value)} />
          </div>
          <div>
            <label style={LABEL_STYLE}>Company URL</label>
            <input style={FIELD_STYLE} value={data.companyUrl} onChange={e => set('companyUrl', e.target.value)} />
          </div>
          <div>
            <label style={LABEL_STYLE}>Email</label>
            <input style={FIELD_STYLE} value={data.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label style={LABEL_STYLE}>Location</label>
            <input style={FIELD_STYLE} value={data.location} onChange={e => set('location', e.target.value)} />
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Brand
          </div>

          <div>
            <label style={LABEL_STYLE}>Icon / Logo URL</label>
            <input style={FIELD_STYLE} value={data.iconUrl} onChange={e => set('iconUrl', e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label style={LABEL_STYLE}>Badge Text (optional)</label>
            <input style={FIELD_STYLE} value={data.badge} onChange={e => set('badge', e.target.value)} placeholder="e.g. 500+ TOOLS" />
          </div>
          <div>
            <label style={LABEL_STYLE}>Tagline (optional)</label>
            <input style={FIELD_STYLE} value={data.tagline} onChange={e => set('tagline', e.target.value)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div>
              <label style={LABEL_STYLE}>Accent Color</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="color" value={data.accentColor} onChange={e => set('accentColor', e.target.value)}
                  style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
                <input style={{ ...FIELD_STYLE, fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}
                  value={data.accentColor} onChange={e => set('accentColor', e.target.value)} />
              </div>
            </div>
            <div>
              <label style={LABEL_STYLE}>Secondary</label>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input type="color" value={data.accentSecondary} onChange={e => set('accentSecondary', e.target.value)}
                  style={{ width: 32, height: 32, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
                <input style={{ ...FIELD_STYLE, fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}
                  value={data.accentSecondary} onChange={e => set('accentSecondary', e.target.value)} />
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            Social Links
          </div>

          <div>
            <label style={LABEL_STYLE}>GitHub</label>
            <input style={FIELD_STYLE} value={data.github} onChange={e => set('github', e.target.value)} placeholder="https://github.com/..." />
          </div>
          <div>
            <label style={LABEL_STYLE}>LinkedIn</label>
            <input style={FIELD_STYLE} value={data.linkedin} onChange={e => set('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label style={LABEL_STYLE}>Discord</label>
            <input style={FIELD_STYLE} value={data.discord} onChange={e => set('discord', e.target.value)} placeholder="https://discord.gg/..." />
          </div>
          <div>
            <label style={LABEL_STYLE}>X / Twitter</label>
            <input style={FIELD_STYLE} value={data.twitter} onChange={e => set('twitter', e.target.value)} placeholder="https://x.com/..." />
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            CTA Banner (optional)
          </div>

          <div>
            <label style={LABEL_STYLE}>CTA Description</label>
            <input style={FIELD_STYLE} value={data.ctaText} onChange={e => set('ctaText', e.target.value)} />
          </div>
          <div>
            <label style={LABEL_STYLE}>CTA Button Text</label>
            <input style={FIELD_STYLE} value={data.ctaLabel} onChange={e => set('ctaLabel', e.target.value)} />
          </div>
          <div>
            <label style={LABEL_STYLE}>CTA URL</label>
            <input style={FIELD_STYLE} value={data.ctaUrl} onChange={e => set('ctaUrl', e.target.value)} />
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />

          <div>
            <label style={LABEL_STYLE}>Footer Text (optional)</label>
            <input style={FIELD_STYLE} value={data.footerText} onChange={e => set('footerText', e.target.value)} />
          </div>
        </div>

        {/* Preview + Actions */}
        <div>
          {/* Copy buttons */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              onClick={handleCopyRich}
              style={{
                padding: '10px 20px', borderRadius: 10,
                background: 'var(--accent, #7ed957)', color: '#0a0a0f',
                border: 'none', cursor: 'pointer', fontWeight: 700,
                fontSize: '0.85rem', fontFamily: 'inherit',
              }}
            >
              {copied ? 'Copied!' : 'Copy Signature'}
            </button>
            <button
              onClick={handleCopy}
              style={{
                padding: '10px 20px', borderRadius: 10,
                background: 'var(--bg-card)', color: 'var(--text-secondary)',
                border: '1px solid var(--border)', cursor: 'pointer', fontWeight: 600,
                fontSize: '0.8rem', fontFamily: 'inherit',
              }}
            >
              Copy Raw HTML
            </button>
          </div>

          {/* Live Preview */}
          <div style={{
            background: '#ffffff', borderRadius: 14, border: '1px solid var(--border)',
            padding: 32, minHeight: 300,
          }}>
            <div ref={previewRef} dangerouslySetInnerHTML={{ __html: html }} />
          </div>

          {/* Usage instructions */}
          <div style={{
            marginTop: 16, padding: 16, borderRadius: 10,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--text-secondary)' }}>How to use:</strong><br />
            1. Click <strong>Copy Signature</strong> to copy as rich text (works in Gmail, Outlook, Apple Mail)<br />
            2. Go to your email settings &rarr; Signature &rarr; Paste<br />
            3. Or click <strong>Copy Raw HTML</strong> for platforms that accept HTML input
          </div>
        </div>
      </div>
    </div>
  )
}
