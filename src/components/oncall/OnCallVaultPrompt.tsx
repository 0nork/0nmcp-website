'use client'

import { useState } from 'react'
import { Lock, Check, Eye, EyeOff } from 'lucide-react'
import { SVC, type ServiceConfig } from '@/lib/console/services'

interface OnCallVaultPromptProps {
  serviceKey: string
  onSave: (service: string, fields: Record<string, string>) => void
  onDismiss: () => void
}

export function OnCallVaultPrompt({ serviceKey, onSave, onDismiss }: OnCallVaultPromptProps) {
  const svc: ServiceConfig | undefined = SVC[serviceKey]
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  if (!svc) return null

  const handleSave = async () => {
    const hasValues = svc.f.some(f => values[f.k]?.trim())
    if (!hasValues) return
    setSaving(true)
    // Save each field
    for (const field of svc.f) {
      if (values[field.k]?.trim()) {
        onSave(serviceKey, { ...values })
        break
      }
    }
    await new Promise(r => setTimeout(r, 400))
    setSaving(false)
    setSaved(true)
    setTimeout(() => onDismiss(), 1500)
  }

  if (saved) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl my-2"
        style={{
          background: 'rgba(126,217,87,0.08)',
          border: '1px solid rgba(126,217,87,0.2)',
          animation: 'oncall-msg-in 0.2s ease both',
        }}
      >
        <Check size={14} style={{ color: '#7ed957' }} />
        <span className="text-[13px]" style={{ color: '#7ed957' }}>
          {svc.l} connected and encrypted
        </span>
      </div>
    )
  }

  return (
    <div
      className="rounded-xl my-2 overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${svc.c}30`,
        animation: 'oncall-msg-in 0.2s ease both',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <Lock size={12} style={{ color: svc.c }} />
        <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          Connect {svc.l}
        </span>
        <span className="text-[10px] ml-auto" style={{ color: 'var(--text-muted)' }}>
          AES-256 encrypted
        </span>
      </div>

      {/* Fields */}
      <div className="px-3 py-2.5 space-y-2">
        {svc.f.map(field => (
          <div key={field.k}>
            <label className="text-[11px] mb-0.5 block" style={{ color: 'var(--text-secondary)' }}>
              {field.lb}
            </label>
            <div className="relative">
              <input
                type={field.s && !showSecrets[field.k] ? 'password' : 'text'}
                placeholder={field.ph}
                value={values[field.k] || ''}
                onChange={e => setValues(prev => ({ ...prev, [field.k]: e.target.value }))}
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] outline-none transition-colors pr-8"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                }}
                onFocus={e => e.currentTarget.style.borderColor = svc.c}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
              {field.s && (
                <button
                  onClick={() => setShowSecrets(prev => ({ ...prev, [field.k]: !prev[field.k] }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showSecrets[field.k] ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-3 pb-2.5">
        <button
          onClick={handleSave}
          disabled={saving || !svc.f.some(f => values[f.k]?.trim())}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-semibold cursor-pointer transition-opacity"
          style={{
            background: `linear-gradient(135deg, ${svc.c}, ${svc.c}cc)`,
            color: '#fff',
            opacity: saving || !svc.f.some(f => values[f.k]?.trim()) ? 0.5 : 1,
          }}
        >
          <Lock size={11} />
          {saving ? 'Encrypting...' : 'Encrypt & Save'}
        </button>
        <button
          onClick={onDismiss}
          className="px-3 py-1.5 rounded-lg text-[12px] cursor-pointer transition-colors"
          style={{
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          Later
        </button>
      </div>
    </div>
  )
}
