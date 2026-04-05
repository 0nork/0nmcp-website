'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import BuilderApp from '@/components/builder/BuilderApp'

export default function BuilderPage() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const sb = createSupabaseBrowser()
    if (!sb) { router.push('/login?redirect=/builder'); return }
    sb.auth.getUser().then(({ data }) => {
      if (data.user) setAuthed(true)
      else router.push('/login?redirect=/builder')
    })
  }, [router])

  if (!authed) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-muted)',
      fontSize: 14, fontFamily: 'inherit',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'linear-gradient(135deg, #6EE05A, #00d4ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#080B0F" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>
        <span>Loading 0nFlow...</span>
        <style>{`@keyframes pulse { 0%,100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.05); } }`}</style>
      </div>
    </div>
  )

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <BuilderApp />
    </div>
  )
}
