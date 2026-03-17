'use client'

// components/add0n/BuildTriggerForm.tsx
// Add0n dashboard — client build trigger form.
// Submits to /api/crm-agent/trigger with business info.

import { useState, FormEvent } from 'react'

interface BuildFormData {
  businessName: string
  email:        string
  phone:        string
  address:      string
  city:         string
  state:        string
  zip:          string
  website:      string
  brandColor:   string
}

type TriggerStatus = 'idle' | 'loading' | 'success' | 'error'

interface TriggerResult {
  success?:        boolean
  conversationId?: string
  contactId?:      string
  message?:        string
  error?:          string
}

const DEFAULT_FORM: BuildFormData = {
  businessName: '',
  email:        '',
  phone:        '',
  address:      '',
  city:         '',
  state:        '',
  zip:          '',
  website:      '',
  brandColor:   '#6EE05A',
}

interface BuildTriggerFormProps {
  action?:     string
  locationId?: string
}

export default function BuildTriggerForm({ action, locationId }: BuildTriggerFormProps = {}) {
  const [form,   setForm]   = useState<BuildFormData>(DEFAULT_FORM)
  const [status, setStatus] = useState<TriggerStatus>('idle')
  const [result, setResult] = useState<TriggerResult | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setResult(null)

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_WEB0N_API_BASE ?? ''}/api/crm-agent/trigger`,
        {
          method:  'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_WEB0N_INTERNAL_API_KEY ?? ''}`,
          },
          body: JSON.stringify({ ...form, action: action ?? 'build_website', ...(locationId ? { locationId } : {}) }),
        }
      )
      const data: TriggerResult = await res.json()
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`)

      setResult(data)
      setStatus('success')
      setForm(DEFAULT_FORM)
    } catch (err: unknown) {
      setResult({ error: err instanceof Error ? err.message : 'Unknown error' })
      setStatus('error')
    }
  }

  return (
    <div className="build-trigger-form">
      <form onSubmit={handleSubmit} className="form-body">

        <div className="form-row">
          <div className="form-field full">
            <label htmlFor="businessName">Business name *</label>
            <input id="businessName" name="businessName" type="text"
              value={form.businessName} onChange={handleChange}
              placeholder="Acme Roofing Co." required />
          </div>
        </div>

        <div className="form-row two-col">
          <div className="form-field">
            <label htmlFor="email">Email *</label>
            <input id="email" name="email" type="email"
              value={form.email} onChange={handleChange}
              placeholder="owner@business.com" required />
          </div>
          <div className="form-field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" type="tel"
              value={form.phone} onChange={handleChange}
              placeholder="+1 555 000 0000" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field full">
            <label htmlFor="address">Street address</label>
            <input id="address" name="address" type="text"
              value={form.address} onChange={handleChange}
              placeholder="123 Main St" />
          </div>
        </div>

        <div className="form-row three-col">
          <div className="form-field">
            <label htmlFor="city">City</label>
            <input id="city" name="city" type="text"
              value={form.city} onChange={handleChange} placeholder="Pittsburgh" />
          </div>
          <div className="form-field">
            <label htmlFor="state">State</label>
            <input id="state" name="state" type="text"
              value={form.state} onChange={handleChange} placeholder="PA" maxLength={2} />
          </div>
          <div className="form-field">
            <label htmlFor="zip">Zip</label>
            <input id="zip" name="zip" type="text"
              value={form.zip} onChange={handleChange} placeholder="15222" />
          </div>
        </div>

        <div className="form-row two-col">
          <div className="form-field">
            <label htmlFor="website">Current website</label>
            <input id="website" name="website" type="url"
              value={form.website} onChange={handleChange}
              placeholder="https://example.com" />
          </div>
          <div className="form-field">
            <label htmlFor="brandColor">Brand color</label>
            <div className="color-input-row">
              <input id="brandColor" name="brandColor" type="color"
                value={form.brandColor} onChange={handleChange} className="color-swatch" />
              <input name="brandColor" type="text"
                value={form.brandColor} onChange={handleChange}
                placeholder="#6EE05A" maxLength={7} className="color-text" />
            </div>
          </div>
        </div>

        <button type="submit"
          className={`submit-btn ${status === 'loading' ? 'loading' : ''}`}
          disabled={status === 'loading'}>
          {status === 'loading' ? 'Triggering build...' : 'Build website →'}
        </button>
      </form>

      {result && (
        <div className={`result-banner ${status}`}>
          {status === 'success' && (
            <>
              <span className="result-icon">✓</span>
              <div>
                <p className="result-title">Build triggered</p>
                <p className="result-detail">
                  Agent is processing · Conversation {result.conversationId?.slice(0, 12)}...
                </p>
              </div>
            </>
          )}
          {status === 'error' && (
            <>
              <span className="result-icon error">✕</span>
              <div>
                <p className="result-title">Trigger failed</p>
                <p className="result-detail">{result.error}</p>
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        .build-trigger-form { font-family:'Space Grotesk',sans-serif; background:#0E1117; border:1px solid #1e2533; border-radius:12px; padding:28px; max-width:640px; }
        .form-body { display:flex; flex-direction:column; gap:16px; }
        .form-row { display:flex; gap:14px; }
        .form-row.two-col > *, .form-row.three-col > * { flex:1; }
        .form-field { display:flex; flex-direction:column; gap:6px; }
        .form-field.full { flex:1; }
        label { font-size:12px; font-weight:500; color:#7a8694; letter-spacing:.04em; text-transform:uppercase; }
        input[type="text"], input[type="email"], input[type="tel"], input[type="url"] {
          background:#080B0F; border:1px solid #1e2533; border-radius:8px; color:#e2e8f0;
          font-family:inherit; font-size:14px; padding:10px 14px; outline:none; transition:border-color .15s; }
        input:focus { border-color:#6EE05A; }
        input::placeholder { color:#3d4758; }
        .color-input-row { display:flex; gap:10px; align-items:center; }
        .color-swatch { width:40px; height:40px; border:1px solid #1e2533; border-radius:8px; padding:3px; background:#080B0F; cursor:pointer; }
        .color-text { flex:1; }
        .submit-btn { background:#6EE05A; border:none; border-radius:8px; color:#080B0F; cursor:pointer; font-family:'Barlow',sans-serif; font-size:15px; font-weight:900; padding:14px 24px; transition:opacity .15s,transform .1s; margin-top:8px; }
        .submit-btn:hover:not(:disabled) { opacity:.88; transform:translateY(-1px); }
        .submit-btn.loading, .submit-btn:disabled { opacity:.5; cursor:not-allowed; }
        .result-banner { display:flex; align-items:flex-start; gap:12px; border-radius:8px; margin-top:16px; padding:14px 16px; }
        .result-banner.success { background:rgba(110,224,90,.08); border:1px solid rgba(110,224,90,.2); }
        .result-banner.error   { background:rgba(255,80,80,.08);  border:1px solid rgba(255,80,80,.2); }
        .result-icon { font-size:18px; color:#6EE05A; margin-top:1px; }
        .result-icon.error { color:#ff5050; }
        .result-title  { font-size:14px; font-weight:600; color:#e2e8f0; margin:0; }
        .result-detail { font-size:12px; color:#7a8694; margin:4px 0 0; font-family:'JetBrains Mono',monospace; }
      `}</style>
    </div>
  )
}
