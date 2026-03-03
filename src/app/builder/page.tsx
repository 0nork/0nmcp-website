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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
      Loading...
    </div>
  )

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <BuilderApp />
    </div>
  )
}
