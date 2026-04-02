import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{
      minHeight: '80vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '2rem', position: 'relative',
    }}>
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 500 }}>
        <div style={{
          fontFamily: 'monospace', fontSize: 'clamp(6rem, 15vw, 10rem)',
          fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em',
          color: '#6EE05A', marginBottom: 16,
        }}>
          404
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>
          This page doesn&apos;t exist. Yet.
        </h1>
        <p style={{ fontSize: 16, color: '#555', lineHeight: 1.6, marginBottom: 32 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Try one of these instead.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{
            padding: '10px 24px', borderRadius: 10, background: '#1a1a1a',
            color: '#fff', fontWeight: 700, fontSize: 14, textDecoration: 'none',
          }}>
            Go Home
          </Link>
          <Link href="/start" style={{
            padding: '10px 24px', borderRadius: 10, background: '#fff',
            color: '#1a1a1a', fontWeight: 600, fontSize: 14, textDecoration: 'none',
            border: '1px solid #ddd',
          }}>
            Get Started
          </Link>
          <a href="https://github.com/0nork/0nMCP" target="_blank" rel="noopener noreferrer" style={{
            padding: '10px 24px', borderRadius: 10, background: '#fff',
            color: '#1a1a1a', fontWeight: 600, fontSize: 14, textDecoration: 'none',
            border: '1px solid #ddd',
          }}>
            GitHub
          </a>
        </div>
      </div>
    </div>
  )
}
