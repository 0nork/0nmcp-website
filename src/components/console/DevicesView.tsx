'use client'

import { useState, useEffect, useCallback } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'

interface Device {
  id: string
  device_name: string | null
  platform: string
  last_used_at: string | null
  created_at: string
  expires_at: string | null
}

const PLATFORM_LABELS: Record<string, string> = {
  cli: 'CLI',
  extension: 'Chrome Extension',
  web: 'Web Console',
  app: 'Mobile App',
}

const PLATFORM_COLORS: Record<string, string> = {
  cli: '#00d4ff',
  extension: '#7ed957',
  web: '#a78bfa',
  app: '#ff6b35',
}

export function DevicesView() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)

  const loadDevices = useCallback(async () => {
    setLoading(true)
    try {
      const sb = createSupabaseBrowser()
      if (!sb) return
      const { data: { session } } = await sb.auth.getSession()
      if (!session) return

      const res = await fetch('/api/auth/devices', {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setDevices(data.devices || [])
      }
    } catch {
      // Failed to load
    }
    setLoading(false)
  }, [])

  useEffect(() => { loadDevices() }, [loadDevices])

  const revokeDevice = async (deviceId: string) => {
    setRevoking(deviceId)
    try {
      const sb = createSupabaseBrowser()
      if (!sb) return
      const { data: { session } } = await sb.auth.getSession()
      if (!session) return

      await fetch('/api/auth/devices', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ device_id: deviceId }),
      })
      setDevices(prev => prev.filter(d => d.id !== deviceId))
    } catch {
      // Failed to revoke
    }
    setRevoking(null)
  }

  const revokeAll = async () => {
    if (!confirm('Revoke all connected devices? They will need to re-authenticate.')) return

    try {
      const sb = createSupabaseBrowser()
      if (!sb) return
      const { data: { session } } = await sb.auth.getSession()
      if (!session) return

      await fetch('/api/auth/devices', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ revoke_all: true }),
      })
      setDevices([])
    } catch {
      // Failed
    }
  }

  const formatDate = (iso: string | null) => {
    if (!iso) return 'Never'
    const d = new Date(iso)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60_000) return 'Just now'
    if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`
    if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`
    return d.toLocaleDateString()
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '48rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Connected Devices
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>
            Manage devices authorized to access your 0nMCP account.
          </p>
        </div>
        {devices.length > 0 && (
          <button
            onClick={revokeAll}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 600,
              fontFamily: 'inherit',
            }}
          >
            Revoke All
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>
          Loading devices...
        </div>
      ) : devices.length === 0 ? (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '0.75rem',
          padding: '3rem',
          textAlign: 'center',
        }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '0.75rem' }}>
            No connected devices
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            Run <code style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: '#7ed957',
              background: 'rgba(126, 217, 87, 0.1)',
              padding: '0.15em 0.4em',
              borderRadius: '0.25rem',
            }}>0nmcp login</code> in your terminal to connect a device.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {devices.map(device => (
            <div
              key={device.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Platform indicator */}
                <div style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: '0.625rem',
                  background: `${PLATFORM_COLORS[device.platform] || '#888'}15`,
                  border: `1px solid ${PLATFORM_COLORS[device.platform] || '#888'}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: PLATFORM_COLORS[device.platform] || '#888',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  {device.platform === 'cli' ? '>' : device.platform === 'extension' ? 'Ext' : device.platform[0].toUpperCase()}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                      {device.device_name || 'Unknown Device'}
                    </span>
                    <span style={{
                      fontSize: '0.6875rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '1rem',
                      background: `${PLATFORM_COLORS[device.platform] || '#888'}15`,
                      color: PLATFORM_COLORS[device.platform] || '#888',
                      fontWeight: 600,
                    }}>
                      {PLATFORM_LABELS[device.platform] || device.platform}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                    Last active: {formatDate(device.last_used_at)} · Connected: {formatDate(device.created_at)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => revokeDevice(device.id)}
                disabled={revoking === device.id}
                style={{
                  padding: '0.375rem 0.75rem',
                  background: 'transparent',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.375rem',
                  cursor: revoking === device.id ? 'wait' : 'pointer',
                  fontSize: '0.75rem',
                  fontFamily: 'inherit',
                  opacity: revoking === device.id ? 0.5 : 1,
                }}
              >
                {revoking === device.id ? 'Revoking...' : 'Revoke'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Vault Sync Status */}
      <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.75rem' }}>
        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
          Vault Sync
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', lineHeight: 1.6, margin: 0 }}>
          Sync your vault credentials across devices with end-to-end encryption.
          Set a sync passphrase in your CLI with <code style={{
            fontFamily: 'JetBrains Mono, monospace',
            color: '#7ed957',
            background: 'rgba(126, 217, 87, 0.1)',
            padding: '0.1em 0.3em',
            borderRadius: '0.2rem',
            fontSize: '0.75rem',
          }}>0nmcp vault sync-passphrase</code>, then
          use <code style={{
            fontFamily: 'JetBrains Mono, monospace',
            color: '#7ed957',
            background: 'rgba(126, 217, 87, 0.1)',
            padding: '0.1em 0.3em',
            borderRadius: '0.2rem',
            fontSize: '0.75rem',
          }}>0nmcp vault sync</code> to push encrypted credentials to the cloud.
          The server never sees your plaintext keys.
        </p>
      </div>
    </div>
  )
}
