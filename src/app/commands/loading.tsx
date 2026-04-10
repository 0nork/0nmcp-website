export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary, #07080c)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        width: 32,
        height: 32,
        border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: '#6EE05A',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
