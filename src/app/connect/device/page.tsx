'use client'

import { useState, useEffect, useRef } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'

export default function DeviceConnectPage() {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'input' | 'confirming' | 'approved' | 'denied' | 'error' | 'loading'>('loading')
  const [deviceInfo, setDeviceInfo] = useState<{ platform: string; device_name: string; ip_address: string } | null>(null)
  const [error, setError] = useState('')
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    async function checkAuth() {
      const sb = createSupabaseBrowser()
      if (!sb) return
      const { data: { user: u } } = await sb.auth.getUser()
      if (!u) {
        window.location.href = '/login?redirect=/connect/device' + (window.location.search || '')
        return
      }
      setUser({ email: u.email })
      setStatus('input')

      // Check for pre-filled code from URL
      const params = new URLSearchParams(window.location.search)
      const urlCode = params.get('code')
      if (urlCode && /^[A-Z]{4}-\d{4}$/.test(urlCode)) {
        setCode(urlCode)
      }
    }
    checkAuth()
  }, [])

  const formatCode = (raw: string) => {
    const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (clean.length <= 4) return clean
    return clean.slice(0, 4) + '-' + clean.slice(4, 8)
  }

  const handleCodeChange = (value: string) => {
    const formatted = formatCode(value)
    setCode(formatted)
  }

  const handleVerify = async () => {
    if (code.length !== 9) {
      setError('Enter a valid 8-character code (XXXX-0000)')
      return
    }

    setStatus('confirming')
    setError('')

    try {
      const res = await fetch('/api/auth/device/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_code: code }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Invalid or expired code')
        setStatus('input')
        return
      }

      const data = await res.json()
      setDeviceInfo(data.device)
      setStatus('confirming')
    } catch {
      setError('Connection error. Please try again.')
      setStatus('input')
    }
  }

  const handleApprove = async () => {
    try {
      const sb = createSupabaseBrowser()
      if (!sb) return
      const { data: { session } } = await sb.auth.getSession()

      const res = await fetch('/api/auth/device/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ user_code: code, action: 'approve' }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to approve')
        return
      }

      setStatus('approved')
    } catch {
      setError('Connection error. Please try again.')
    }
  }

  const handleDeny = async () => {
    try {
      const sb = createSupabaseBrowser()
      if (!sb) return
      const { data: { session } } = await sb.auth.getSession()

      await fetch('/api/auth/device/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ user_code: code, action: 'deny' }),
      })
    } catch {
      // Denial is best-effort
    }
    setStatus('denied')
  }

  if (status === 'loading') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logo}>0nMCP</div>
          <p style={styles.subtitle}>Checking authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>0nMCP</div>

        {status === 'input' && (
          <>
            <h1 style={styles.title}>Connect a Device</h1>
            <p style={styles.subtitle}>
              Enter the code shown in your terminal to authorize this device.
            </p>

            <div style={styles.codeInputWrapper}>
              <input
                type="text"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                placeholder="ABCD-1234"
                maxLength={9}
                style={styles.codeInput}
                autoFocus
                spellCheck={false}
                autoComplete="off"
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button onClick={handleVerify} style={styles.btn} disabled={code.length !== 9}>
              Verify Code
            </button>

            <p style={styles.hint}>
              Run <code style={styles.code}>0nmcp login</code> in your terminal to get a code.
            </p>
          </>
        )}

        {status === 'confirming' && (
          <>
            <h1 style={styles.title}>Authorize Device?</h1>
            <p style={styles.subtitle}>
              A device is requesting access to your 0nMCP account.
            </p>

            <div style={styles.infoBox}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Code</span>
                <span style={styles.infoValue}>{code}</span>
              </div>
              {deviceInfo && (
                <>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>Platform</span>
                    <span style={styles.infoValue}>{deviceInfo.platform}</span>
                  </div>
                  {deviceInfo.device_name && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Device</span>
                      <span style={styles.infoValue}>{deviceInfo.device_name}</span>
                    </div>
                  )}
                </>
              )}
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Account</span>
                <span style={styles.infoValue}>{user?.email}</span>
              </div>
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.buttonRow}>
              <button onClick={handleApprove} style={styles.btn}>
                Allow
              </button>
              <button onClick={handleDeny} style={styles.btnDanger}>
                Deny
              </button>
            </div>
          </>
        )}

        {status === 'approved' && (
          <>
            <div style={styles.check}>&#10003;</div>
            <h1 style={styles.title}>Device Authorized</h1>
            <p style={styles.subtitle}>
              Your CLI is now connected. You can close this tab.
            </p>
          </>
        )}

        {status === 'denied' && (
          <>
            <div style={{ ...styles.check, color: '#ef4444' }}>&#10007;</div>
            <h1 style={styles.title}>Access Denied</h1>
            <p style={styles.subtitle}>
              The device was not authorized. You can close this tab.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0f',
    padding: '1rem',
  },
  card: {
    background: '#141420',
    border: '1px solid #2a2a3a',
    borderRadius: '1rem',
    padding: '3rem',
    maxWidth: '440px',
    width: '100%',
    textAlign: 'center' as const,
  },
  logo: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#7ed957',
    marginBottom: '0.5rem',
    fontFamily: 'JetBrains Mono, monospace',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#e8e8ef',
    margin: '1rem 0 0.5rem',
  },
  subtitle: {
    color: '#8888a0',
    fontSize: '0.875rem',
    marginBottom: '1.5rem',
    lineHeight: 1.5,
  },
  codeInputWrapper: {
    marginBottom: '1rem',
  },
  codeInput: {
    width: '100%',
    padding: '1rem',
    fontSize: '1.5rem',
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: 700,
    textAlign: 'center' as const,
    letterSpacing: '0.2em',
    background: '#0a0a0f',
    border: '2px solid #2a2a3a',
    borderRadius: '0.75rem',
    color: '#7ed957',
    outline: 'none',
  },
  btn: {
    width: '100%',
    padding: '0.875rem 2rem',
    background: '#7ed957',
    color: '#0a0a0f',
    fontWeight: 700,
    fontSize: '0.9375rem',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnDanger: {
    width: '100%',
    padding: '0.875rem 2rem',
    background: 'transparent',
    color: '#ef4444',
    fontWeight: 700,
    fontSize: '0.9375rem',
    border: '1px solid #ef4444',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  buttonRow: {
    display: 'flex',
    gap: '0.75rem',
  },
  hint: {
    color: '#55556a',
    fontSize: '0.75rem',
    marginTop: '1rem',
    lineHeight: 1.5,
  },
  code: {
    fontFamily: 'JetBrains Mono, monospace',
    color: '#7ed957',
    background: 'rgba(126, 217, 87, 0.1)',
    padding: '0.15em 0.4em',
    borderRadius: '0.25rem',
    fontSize: '0.8rem',
  },
  error: {
    color: '#ef4444',
    fontSize: '0.8125rem',
    marginBottom: '0.75rem',
  },
  infoBox: {
    background: '#0a0a0f',
    border: '1px solid #2a2a3a',
    borderRadius: '0.75rem',
    padding: '1rem',
    marginBottom: '1.5rem',
    textAlign: 'left' as const,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid rgba(42, 42, 58, 0.5)',
  },
  infoLabel: {
    color: '#55556a',
    fontSize: '0.8125rem',
  },
  infoValue: {
    color: '#e8e8ef',
    fontSize: '0.8125rem',
    fontFamily: 'JetBrains Mono, monospace',
  },
  check: {
    fontSize: '3rem',
    color: '#7ed957',
    marginBottom: '0.5rem',
  },
}
