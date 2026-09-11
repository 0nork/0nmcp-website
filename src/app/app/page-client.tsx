// app/app/page.tsx
// Root of the Add0n iframe — embedded inside CRM platform as a Custom Menu Link.
// URL registered in CRM Developer Portal as the Custom Menu Link target.
// This page:
//   1. Reads the CRM SSO params from the query string
//   2. Calls /api/crm/oauth/sso to decrypt and load state
//   3. Renders the Storefront component
// Falls back to PWA shell when no SSO payload present (direct 0nmcp.com/app access)

'use client'

import { useEffect, useState } from 'react'
import Storefront              from '@/components/add0n/Storefront'
import PWAShell                from './components/PWAShell'

interface StoreState {
  location:  { locationId: string; companyId: string; userId: string }
  listings:  Listing[]
  history:   BuildRecord[]
}

interface Listing {
  id:            string
  slug:          string
  title:         string
  tagline:       string
  description:   string
  category:      string
  price_cents:   number
  action_key:    string | null
  is_featured:   boolean
  icon_emoji:    string
  purchased:     boolean
}

interface BuildRecord {
  id:            string
  listing_slug:  string
  action:        string
  status:        string
  business_name: string | null
  triggered_at:  string
}

export default function AppPage() {
  const [mode,    setMode]    = useState<'loading' | 'add0n' | 'pwa'>('loading')
  const [state,   setState]   = useState<StoreState | null>(null)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    const params  = new URLSearchParams(window.location.search)
    const encoded = params.get('userData')

    if (!encoded) {
      // No SSO payload — show PWA shell (direct access at 0nmcp.com/app)
      setMode('pwa')
      return
    }

    // CRM platform sends userData as a base64 JSON string containing { encryptedData, iv }
    let ssoPayload
    try {
      ssoPayload = JSON.parse(atob(encoded))
    } catch {
      setError('Invalid SSO payload encoding.')
      setMode('add0n')
      return
    }

    fetch('/api/crm/oauth/sso', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(ssoPayload),
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setState(data)
        setMode('add0n')
      })
      .catch(err => {
        setError(err.message)
        setMode('add0n')
      })
  }, [])

  if (mode === 'loading') return <LoadingScreen />
  if (mode === 'pwa')     return <PWAShell />
  if (error)              return <ErrorScreen message={error} />

  return <Storefront state={state!} />
}

function LoadingScreen() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#080B0F' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:40, height:40, border:'3px solid #1e2533', borderTopColor:'#6EE05A', borderRadius:'50%', animation:'spin .7s linear infinite', margin:'0 auto 16px' }} />
        <p style={{ color:'#7a8694', fontFamily:'Space Grotesk,sans-serif', fontSize:14 }}>Loading Add0n...</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#080B0F', padding:32 }}>
      <div style={{ background:'#0E1117', border:'1px solid rgba(255,80,80,.2)', borderRadius:12, padding:32, maxWidth:480 }}>
        <p style={{ color:'#ff6b6b', fontFamily:'Space Grotesk,sans-serif', fontWeight:600, margin:'0 0 8px' }}>Add0n failed to load</p>
        <p style={{ color:'#7a8694', fontFamily:'JetBrains Mono,monospace', fontSize:12, margin:0 }}>{message}</p>
      </div>
    </div>
  )
}
