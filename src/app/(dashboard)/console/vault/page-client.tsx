'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useVault } from '@/lib/console/hooks'
import { VaultOverlay } from '@/components/console/VaultOverlay'
import { VaultDetail } from '@/components/console/VaultDetail'
import { VaultFilesPanel } from '@/components/console/VaultFilesPanel'
import { BundleManager } from '@/components/console/BundleManager'

type SubView = 'credentials' | 'files' | 'bundles'

export default function VaultPage() {
  const searchParams = useSearchParams()

  const vault = useVault()
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [subView, setSubView] = useState<SubView>('credentials')

  // Handle Google OAuth callback params
  useEffect(() => {
    const google = searchParams.get('google')
    if (google === 'connected') {
      window.history.replaceState({}, '', '/console/vault')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle ?service= param for deep linking
  useEffect(() => {
    const s = searchParams.get('service')
    if (s) setSelectedService(s)
    const tab = searchParams.get('tab')
    if (tab === 'bundles') setSubView('bundles')
    else if (tab === 'files') setSubView('files')
  }, [searchParams])

  const TABS: { key: SubView; label: string }[] = [
    { key: 'credentials', label: 'Credentials' },
    { key: 'files', label: 'Files' },
    { key: 'bundles', label: 'Bundles' },
  ]

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-primary)' }}>
      {/* Top nav */}
      <div
        className="flex items-center gap-3 px-6 py-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {selectedService ? 'Service Detail' : 'Vault'}
        </span>

        {/* Sub-view toggle */}
        {!selectedService && (
          <div
            className="flex rounded-lg overflow-hidden ml-auto"
            style={{ border: '1px solid var(--border)' }}
          >
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setSubView(tab.key)}
                className="px-3 py-1.5 text-xs font-medium cursor-pointer border-none transition-colors"
                style={{
                  background: subView === tab.key ? 'var(--accent-glow)' : 'transparent',
                  color: subView === tab.key ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {selectedService ? (
        <VaultDetail
          service={selectedService}
          onBack={() => { setSelectedService(null); window.history.replaceState({}, '', '/console/vault') }}
          vault={vault.credentials}
          onSave={vault.set}
        />
      ) : subView === 'credentials' ? (
        <VaultOverlay
          onSelect={(s) => {
            setSelectedService(s)
            window.history.replaceState({}, '', `/console/vault?service=${s}`)
          }}
          connectedServices={vault.connectedServices}
          searchQuery={search}
          onSearch={setSearch}
        />
      ) : subView === 'bundles' ? (
        <BundleManager
          connectedServices={vault.connectedServices}
          vault={vault.credentials}
          onImport={vault.set}
          onSwitchToCredentials={() => setSubView('credentials')}
        />
      ) : (
        <VaultFilesPanel
          onSwitchToCredentials={() => setSubView('credentials')}
          onSwitchToBundles={() => setSubView('bundles')}
          onAddToBuilder={(data) => {
            localStorage.setItem('0n_builder_import', JSON.stringify(data))
            window.location.href = '/builder'
          }}
        />
      )}
    </div>
  )
}
