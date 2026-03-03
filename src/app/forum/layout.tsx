import { Suspense } from 'react'
import ForumShell from './ForumShell'

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '2rem', fontWeight: 900 }}>0n</div>
      </div>
    }>
      <ForumShell>{children}</ForumShell>
    </Suspense>
  )
}
