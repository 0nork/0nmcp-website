'use client'

import { useState, useEffect } from 'react'
import {
  getConnectionConfig,
  saveConnectionConfig,
  healthCheck,
  type ConnectionMode,
} from '@/lib/pwa-api'

export default function ConnectionSettings() {
  const [mode, setMode] = useState<ConnectionMode>('anthropic')
  const [apiKey, setApiKey] = useState('')
  const [serverUrl, setServerUrl] = useState('http://localhost:3939')
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    const config = getConnectionConfig()
    setMode(config.mode)
    if (config.anthropicApiKey) setApiKey(config.anthropicApiKey)
    if (config.localServerUrl) setServerUrl(config.localServerUrl)
  }, [])

  const save = (newMode?: ConnectionMode, newKey?: string, newUrl?: string) => {
    const config = {
      mode: newMode ?? mode,
      anthropicApiKey: newKey ?? apiKey,
      localServerUrl: newUrl ?? serverUrl,
    }
    saveConnectionConfig(config)
  }

  const handleModeChange = (newMode: ConnectionMode) => {
    setMode(newMode)
    setStatus(null)
    save(newMode)
  }

  const handleTest = async () => {
    setTesting(true)
    setStatus(null)
    save()
    const result = await healthCheck()
    setStatus(result)
    setTesting(false)
  }

  return (
    <div className="settings-container">
      <h2>Connection</h2>

      <div className="settings-group">
        <label>Execution Mode</label>
        <div className="settings-radio-group">
          <button
            className={`settings-radio ${mode === 'anthropic' ? 'active' : ''}`}
            onClick={() => handleModeChange('anthropic')}
          >
            Anthropic API
          </button>
          <button
            className={`settings-radio ${mode === 'local' ? 'active' : ''}`}
            onClick={() => handleModeChange('local')}
          >
            Local Server
          </button>
        </div>
      </div>

      {mode === 'anthropic' && (
        <div className="settings-group">
          <label>API Key</label>
          <input
            type="password"
            className="settings-input"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value)
              save(undefined, e.target.value)
            }}
            placeholder="sk-ant-..."
          />
        </div>
      )}

      {mode === 'local' && (
        <div className="settings-group">
          <label>Server URL</label>
          <input
            type="text"
            className="settings-input"
            value={serverUrl}
            onChange={(e) => {
              setServerUrl(e.target.value)
              save(undefined, undefined, e.target.value)
            }}
            placeholder="http://localhost:3939"
          />
        </div>
      )}

      <button className="settings-test-btn" onClick={handleTest} disabled={testing}>
        {testing ? 'Testing...' : 'Test Connection'}
      </button>

      {status && (
        <div className={`settings-status ${status.ok ? 'ok' : 'error'}`}>
          {status.ok ? '\u2713' : '\u2717'} {status.message}
        </div>
      )}
    </div>
  )
}
