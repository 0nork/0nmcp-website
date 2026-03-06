'use client'

import { useState, useRef, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'

type QRTab = 'url' | 'text' | 'wifi' | 'vcard'

interface WifiConfig {
  ssid: string
  password: string
  encryption: 'WPA' | 'WEP' | 'nopass'
  hidden: boolean
}

interface VCardConfig {
  name: string
  phone: string
  email: string
  url: string
  org: string
}

export default function ToolsPage() {
  const [tab, setTab] = useState<QRTab>('url')
  const [url, setUrl] = useState('https://0nmcp.com')
  const [text, setText] = useState('')
  const [wifi, setWifi] = useState<WifiConfig>({ ssid: '', password: '', encryption: 'WPA', hidden: false })
  const [vcard, setVcard] = useState<VCardConfig>({ name: '', phone: '', email: '', url: '', org: '' })
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [size, setSize] = useState(256)
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M')
  const [copied, setCopied] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const getQRValue = useCallback((): string => {
    switch (tab) {
      case 'url':
        return url || 'https://0nmcp.com'
      case 'text':
        return text || '0nMCP'
      case 'wifi':
        return `WIFI:T:${wifi.encryption};S:${wifi.ssid};P:${wifi.password};H:${wifi.hidden ? 'true' : 'false'};;`
      case 'vcard':
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          vcard.name ? `FN:${vcard.name}` : '',
          vcard.phone ? `TEL:${vcard.phone}` : '',
          vcard.email ? `EMAIL:${vcard.email}` : '',
          vcard.url ? `URL:${vcard.url}` : '',
          vcard.org ? `ORG:${vcard.org}` : '',
          'END:VCARD',
        ].filter(Boolean).join('\n')
      default:
        return url
    }
  }, [tab, url, text, wifi, vcard])

  const handleDownload = useCallback(() => {
    const svgElement = qrRef.current?.querySelector('svg')
    if (!svgElement) return
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const canvas = document.createElement('canvas')
    canvas.width = size * 2
    canvas.height = size * 2
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size * 2, size * 2)
      const a = document.createElement('a')
      a.download = 'qrcode.png'
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }, [size])

  const handleCopySVG = useCallback(async () => {
    const svgElement = qrRef.current?.querySelector('svg')
    if (!svgElement) return
    const svgData = new XMLSerializer().serializeToString(svgElement)
    await navigator.clipboard.writeText(svgData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  const tabs: { key: QRTab; label: string }[] = [
    { key: 'url', label: 'URL' },
    { key: 'text', label: 'Text' },
    { key: 'wifi', label: 'WiFi' },
    { key: 'vcard', label: 'vCard' },
  ]

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-muted)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
        QR Code Generator
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24 }}>
        Generate QR codes for URLs, text, WiFi networks, or contact cards.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }}>
        {/* Left: inputs */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-card)', padding: 4, borderRadius: 10 }}>
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: tab === t.key ? 'var(--accent-glow, rgba(126,217,87,0.15))' : 'transparent',
                  color: tab === t.key ? 'var(--accent, #7ed957)' : 'var(--text-muted)',
                  fontSize: 13,
                  fontWeight: tab === t.key ? 600 : 500,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {tab === 'url' && (
            <div>
              <label style={labelStyle}>URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                style={inputStyle}
              />
            </div>
          )}

          {tab === 'text' && (
            <div>
              <label style={labelStyle}>Text Content</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter any text..."
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          )}

          {tab === 'wifi' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={labelStyle}>Network Name (SSID)</label>
                <input
                  value={wifi.ssid}
                  onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                  placeholder="MyNetwork"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input
                  type="password"
                  value={wifi.password}
                  onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                  placeholder="Password"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Encryption</label>
                <select
                  value={wifi.encryption}
                  onChange={(e) => setWifi({ ...wifi, encryption: e.target.value as WifiConfig['encryption'] })}
                  style={inputStyle}
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None</option>
                </select>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={wifi.hidden}
                  onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })}
                />
                Hidden network
              </label>
            </div>
          )}

          {tab === 'vcard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(['name', 'phone', 'email', 'url', 'org'] as const).map((field) => (
                <div key={field}>
                  <label style={labelStyle}>{field === 'org' ? 'Organization' : field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input
                    value={vcard[field]}
                    onChange={(e) => setVcard({ ...vcard, [field]: e.target.value })}
                    placeholder={field === 'phone' ? '+1 555 123 4567' : field === 'email' ? 'name@example.com' : ''}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Customization options */}
          <div style={{ marginTop: 24, padding: 16, borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>Customize</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={labelStyle}>Foreground</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    style={{ width: 32, height: 32, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                  />
                  <input
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12 }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Background</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    style={{ width: 32, height: 32, border: 'none', cursor: 'pointer', borderRadius: 4 }}
                  />
                  <input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace', fontSize: 12 }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Size (px)</label>
                <input
                  type="number"
                  min={64}
                  max={1024}
                  step={32}
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Error Correction</label>
                <select
                  value={errorLevel}
                  onChange={(e) => setErrorLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
                  style={inputStyle}
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: QR preview */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div
            style={{
              padding: 24,
              borderRadius: 16,
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              ref={qrRef}
              style={{
                background: bgColor,
                borderRadius: 12,
                padding: 16,
                display: 'inline-block',
              }}
            >
              <QRCodeSVG
                value={getQRValue()}
                size={Math.min(size, 256)}
                bgColor={bgColor}
                fgColor={fgColor}
                level={errorLevel}
              />
            </div>

            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <button
                onClick={handleDownload}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  background: 'var(--accent, #7ed957)',
                  color: '#0a0a0f',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
              >
                Download PNG
              </button>
              <button
                onClick={handleCopySVG}
                style={{
                  flex: 1,
                  padding: '10px 16px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  background: 'transparent',
                  color: copied ? 'var(--accent, #7ed957)' : 'var(--text-secondary)',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'inherit',
                  transition: 'all 0.2s ease',
                }}
              >
                {copied ? 'Copied!' : 'Copy SVG'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
