'use client'

export default function OnPressSuccessPage() {
  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 500, padding: 40 }}>
        <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #7ed957, #5cb83a)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 24, color: '#0A0E17', margin: '0 auto 24px' }}>0n</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 12 }}>You're in!</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
          OnPress is yours. Check your email for download links and setup instructions.
        </p>
        <div style={{ background: 'var(--bg-card)', border: '1px solid #1a1f2e', borderRadius: 12, padding: 24, textAlign: 'left', marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#7ed957', marginBottom: 12 }}>Next Steps:</h3>
          <ol style={{ padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#bbb' }}>
            <li>Open <a href="https://0ncore.com" style={{ color: '#7ed957' }}>0nCore</a> and sign in.</li>
            <li>Go to <strong>Downloads → OnPress</strong> for the Figma plugin and the WordPress plugin.</li>
            <li>In Figma: Plugins → Development → Import from manifest.</li>
            <li>In WordPress: Plugins → Add New → Upload.</li>
            <li>Start converting designs!</li>
          </ol>
        </div>
        <a href="https://0nmcp.com" style={{ color: '#7ed957', fontSize: 14, textDecoration: 'none' }}>Back to 0nMCP</a>
      </div>
    </div>
  )
}
