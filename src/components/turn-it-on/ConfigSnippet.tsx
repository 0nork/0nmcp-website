'use client'

import { useState } from 'react'

interface ConfigSnippetProps {
  config: string
  triggerName: string
  actionName: string
}

export default function ConfigSnippet({
  config,
  triggerName,
  actionName,
}: ConfigSnippetProps) {
  const [copied, setCopied] = useState(false)

  let formattedConfig: string
  try {
    formattedConfig = JSON.stringify(JSON.parse(config), null, 2)
  } catch {
    formattedConfig = config
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedConfig)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = formattedConfig
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <section className="py-16">
      <div className="section-container max-w-3xl">
        <h2
          className="text-2xl md:text-3xl font-bold text-center mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          .0n Config
        </h2>
        <p
          className="text-center mb-8"
          style={{ color: 'var(--text-secondary)' }}
        >
          This is all it takes to connect {triggerName} to {actionName}.
        </p>

        <div
          className="relative rounded-xl overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Header bar */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#ff5f57' }}
                />
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#febc2e' }}
                />
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#28c840' }}
                />
              </div>
              <span
                className="text-xs ml-3"
                style={{
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                workflow.0n
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1 rounded transition-all duration-200"
              style={{
                fontFamily: 'var(--font-mono)',
                color: copied ? 'var(--accent)' : 'var(--text-secondary)',
                backgroundColor: copied
                  ? 'rgba(126, 217, 87, 0.1)'
                  : 'var(--bg-secondary)',
                border: `1px solid ${
                  copied ? 'var(--accent)' : 'var(--border)'
                }`,
              }}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {/* Code block */}
          <pre
            className="p-6 overflow-x-auto text-sm leading-relaxed"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-primary)',
            }}
          >
            <code>{formattedConfig}</code>
          </pre>
        </div>
      </div>
    </section>
  )
}
