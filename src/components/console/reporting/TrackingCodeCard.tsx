'use client'

import { useState } from 'react'

interface TrackingCodeCardProps {
  siteId: string
}

type InstallTab = 'html' | 'wordpress' | 'shopify' | 'react'

const TABS: { key: InstallTab; label: string }[] = [
  { key: 'html', label: 'HTML' },
  { key: 'wordpress', label: 'WordPress' },
  { key: 'shopify', label: 'Shopify' },
  { key: 'react', label: 'React' },
]

function getTrackingScript(siteId: string): string {
  return `<script>
(function(s,i,t){var e=new XMLHttpRequest();
e.open('POST','https://0nmcp.com/api/t');
e.setRequestHeader('Content-Type','application/json');
e.send(JSON.stringify({s:s,p:location.href,r:document.referrer,
d:navigator.userAgent,t:Date.now()}))})('${siteId}');
</script>`
}

function getImgPixel(siteId: string): string {
  return `<img src="https://0nmcp.com/api/t?s=${siteId}&p={{PAGE_URL}}" style="display:none" alt="" />`
}

function getInstructions(tab: InstallTab, siteId: string): string {
  switch (tab) {
    case 'html':
      return `Paste the tracking script just before the closing </body> tag on every page you want to track.\n\nAlternatively, use the image pixel for environments where JavaScript is restricted:\n\n${getImgPixel(siteId)}`
    case 'wordpress':
      return `1. Go to Appearance > Theme Editor (or use a plugin like "Insert Headers and Footers")\n2. Paste the tracking script into the footer section\n3. Save changes\n\nFor WooCommerce: Add to your theme's footer.php before </body>`
    case 'shopify':
      return `1. Go to Online Store > Themes > Edit Code\n2. Open theme.liquid\n3. Paste the tracking script just before </body>\n4. Save\n\nThe tracker will automatically capture all page views across your store.`
    case 'react':
      return `Add this to your root layout or App component:\n\nuseEffect(() => {\n  const data = {\n    s: '${siteId}',\n    p: window.location.href,\n    r: document.referrer,\n    d: navigator.userAgent,\n    t: Date.now()\n  };\n  fetch('https://0nmcp.com/api/t', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify(data)\n  });\n}, []);`
    default:
      return ''
  }
}

export function TrackingCodeCard({ siteId }: TrackingCodeCardProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<InstallTab>('html')

  const script = getTrackingScript(siteId)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = script
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        marginTop: '8px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Universal Tracking Code
          </h3>
          <p
            style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              margin: '4px 0 0 0',
            }}
          >
            Site ID: {siteId}
          </p>
        </div>
        <button
          onClick={handleCopy}
          style={{
            backgroundColor: copied ? '#22c55e' : 'var(--accent)',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
            minWidth: '100px',
          }}
        >
          {copied ? 'Copied!' : 'Copy Code'}
        </button>
      </div>

      {/* Code block */}
      <div
        style={{
          backgroundColor: '#0a0a0a',
          border: '1px solid var(--accent)',
          borderRadius: '10px',
          padding: '16px',
          overflow: 'auto',
          maxHeight: '200px',
        }}
      >
        <pre
          style={{
            margin: 0,
            fontSize: '12px',
            lineHeight: 1.6,
            color: 'var(--accent)',
            fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        >
          {script}
        </pre>
      </div>

      {/* Installation tabs */}
      <div style={{ marginTop: '20px' }}>
        <div
          style={{
            display: 'flex',
            gap: '4px',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '0',
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom:
                  activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
                color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-muted)',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: activeTab === tab.key ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div
          style={{
            padding: '16px 0',
            fontSize: '13px',
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            whiteSpace: 'pre-wrap',
            fontFamily: activeTab === 'react' ? "'SF Mono', monospace" : 'inherit',
          }}
        >
          {getInstructions(activeTab, siteId)}
        </div>
      </div>
    </div>
  )
}
