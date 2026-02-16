'use client'

import { useState, useEffect, useRef } from 'react'
import { listAddons, saveAddon, deleteAddon, type StoredAddon } from '@/lib/idb'

export default function AddOnManager() {
  const [addons, setAddons] = useState<StoredAddon[]>([])
  const [viewingAddon, setViewingAddon] = useState<StoredAddon | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadAddons = async () => {
    try {
      const list = await listAddons()
      setAddons(list.sort((a, b) => b.updatedAt - a.updatedAt))
    } catch {
      // IndexedDB not available
    }
  }

  useEffect(() => {
    loadAddons()
  }, [])

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const content = await file.text()
      const parsed = JSON.parse(content)
      const name = parsed.name || file.name.replace(/\.0n$/, '')
      const steps = parsed.steps ? Object.keys(parsed.steps).length : 0

      const addon: StoredAddon = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        description: parsed.description || '',
        content,
        stepCount: steps,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }

      await saveAddon(addon)
      await loadAddons()
    } catch {
      alert('Invalid .0n file')
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this add0n?')) return
    await deleteAddon(id)
    await loadAddons()
  }

  const handleExecute = (addon: StoredAddon) => {
    // For now, copy to clipboard — in a future version this would send to the server
    navigator.clipboard.writeText(addon.content)
    alert('Add0n JSON copied to clipboard')
  }

  return (
    <div className="addon-manager">
      <div className="addon-header">
        <h2>Add0ns</h2>
        <button className="addon-import-btn" onClick={() => fileInputRef.current?.click()}>
          Import .0n
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".0n,.json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>

      <div className="addon-list">
        {addons.length === 0 && (
          <div className="addon-empty">
            <p>No add0ns yet</p>
            <p style={{ fontSize: 13 }}>Import a .0n file to get started</p>
          </div>
        )}

        {addons.map((addon) => (
          <div key={addon.id} className="addon-card">
            <div className="addon-card-name">{addon.name}</div>
            {addon.description && (
              <div className="addon-card-desc">{addon.description}</div>
            )}
            <div className="addon-card-meta">
              <span>{addon.stepCount} step{addon.stepCount !== 1 ? 's' : ''}</span>
              <span>{new Date(addon.updatedAt).toLocaleDateString()}</span>
            </div>
            <div className="addon-card-actions">
              <button onClick={() => setViewingAddon(addon)}>View</button>
              <button onClick={() => handleExecute(addon)}>Copy</button>
              <button className="danger" onClick={() => handleDelete(addon.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {viewingAddon && (
        <div className="json-modal-overlay" onClick={() => setViewingAddon(null)}>
          <div className="json-modal" onClick={(e) => e.stopPropagation()}>
            <div className="json-modal-header">
              <h3>{viewingAddon.name}</h3>
              <button onClick={() => setViewingAddon(null)}>&times;</button>
            </div>
            <div className="json-modal-body">
              <pre>{JSON.stringify(JSON.parse(viewingAddon.content), null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
