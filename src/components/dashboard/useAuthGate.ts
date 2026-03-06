'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'

export function useAuthGate() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    const sb = createSupabaseBrowser()
    if (!sb) {
      router.push('/login')
      return
    }
    sb.auth.getUser().then(({ data }) => {
      if (data.user) {
        setAuthenticated(true)
      } else {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      }
      setLoading(false)
    })
  }, [router])

  return { loading, authenticated }
}
