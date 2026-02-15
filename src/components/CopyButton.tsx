'use client'

import { useState } from 'react'

export default function CopyButton({ text, display }: { text: string; display: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      className="btn-ghost text-base px-8 py-3"
      onClick={handleCopy}
      title={`Copy to clipboard: ${text}`}
    >
      <code className="font-mono" style={{ color: 'var(--accent)' }}>
        {copied ? 'Copied!' : display}
      </code>
    </button>
  )
}
