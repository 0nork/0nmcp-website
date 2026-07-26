'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'

// Simple 0nVault dashboard: sign in → generate your single 0n token → connect 0nTask.
export default function OnVaultPage() {
  const [status, setStatus] = useState<'loading' | 'anon' | 'ready'>('loading')
  const [token, setToken] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  // Auth probe only — does NOT reveal/create the token (that happens on button click).
  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/token', { credentials: 'same-origin', cache: 'no-store' })
      setStatus(r.status === 401 ? 'anon' : 'ready')
    } catch {
      setStatus('anon')
    }
  }, [])
  useEffect(() => { load() }, [load])

  async function reveal() {
    setBusy(true)
    try {
      // ?full=1 returns the existing master token, creating it if it doesn't exist yet.
      const r = await fetch('/api/token?full=1', { credentials: 'same-origin', cache: 'no-store' })
      const d = await r.json().catch(() => ({}))
      setToken(d.token || null)
    } catch { /* ignore */ }
    setBusy(false)
  }

  async function regenerate() {
    setBusy(true)
    try {
      await fetch('/api/token', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const r = await fetch('/api/token?full=1', { credentials: 'same-origin', cache: 'no-store' })
      const d = await r.json().catch(() => ({}))
      setToken(d.token || null)
    } catch { /* ignore */ }
    setBusy(false)
  }
  function copy() {
    if (!token) return
    navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4efe6] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-[#e4dccf] bg-white p-8 shadow-[0_20px_60px_-20px_rgba(26,44,39,0.25)]">
        {/* 0nVault logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <Image src="/brand/icon-green.png" alt="" width={44} height={44} className="h-11 w-11 object-contain" />
          <span className="text-2xl font-extrabold tracking-tight">
            <span className="text-[#9aa39b]">0n</span><span className="text-[#16a34a]">VAULT</span>
          </span>
        </div>

        {status === 'loading' && (
          <p className="text-center text-sm text-[#8a978d] py-8">Loading…</p>
        )}

        {status === 'anon' && (
          <div className="text-center">
            <h1 className="text-xl font-bold text-[#1a2c27] mb-2">Sign in to get your token</h1>
            <p className="text-sm text-[#5b6b62] mb-6">Log into your 0n account to generate the token that connects 0nTask.</p>
            <a href="/login?next=/0nvault" className="inline-flex items-center justify-center rounded-xl bg-[#16a34a] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#15803d] shadow-[0_6px_18px_-6px_rgba(22,163,74,0.5)]">
              Sign in
            </a>
          </div>
        )}

        {status === 'ready' && (
          <div>
            <h1 className="text-center text-xl font-bold text-[#1a2c27] mb-1">Your 0n token</h1>
            <p className="text-center text-sm text-[#5b6b62] mb-6">One token per account — it links a single 0nTask connection.</p>

            {!token ? (
              <button
                onClick={reveal}
                disabled={busy}
                className="w-full rounded-xl bg-[#16a34a] py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#15803d] disabled:opacity-50 shadow-[0_6px_18px_-6px_rgba(22,163,74,0.5)]"
              >
                {busy ? 'Generating…' : 'Generate my 0n token'}
              </button>
            ) : (
              <>
                <div className="rounded-xl border border-[#e4dccf] bg-[#faf7f1] p-3 mb-3">
                  <div className="flex items-center gap-2">
                    <code className="min-w-0 flex-1 truncate font-mono text-sm text-[#1a2c27]">{token}</code>
                    <button
                      onClick={copy}
                      className="shrink-0 rounded-lg bg-[#16a34a] px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-[#15803d]"
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-[#8a978d] mb-6">Keep this private — it&apos;s a key to your account. You can regenerate it below (this replaces the old one and disconnects any existing link).</p>

                {/* Instructions */}
                <div className="rounded-2xl bg-[#f4efe6] border border-[#e4dccf] p-4 mb-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#16a34a] mb-3">Connect it to 0nTask</p>
                  <ol className="space-y-2.5">
                    {[
                      'Copy your token above.',
                      'Open 0nTask → Connections (or the 0nVault panel).',
                      'Paste the token to link your 0n account.',
                      'Done — 0nTask can now use your connected services.',
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#16a34a] text-[11px] font-bold text-white">{i + 1}</span>
                        <span className="text-sm text-[#2c4b43] leading-snug">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <button
                  onClick={regenerate}
                  disabled={busy}
                  className="w-full rounded-xl border border-[#e4dccf] py-2.5 text-sm font-semibold text-[#5b6b62] transition-colors hover:border-[#16a34a] hover:text-[#16a34a] disabled:opacity-50"
                >
                  {busy ? 'Working…' : 'Regenerate token'}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
