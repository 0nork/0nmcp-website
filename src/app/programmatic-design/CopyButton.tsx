'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CopyButton({ text, small }: { text: string; small?: boolean }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      })
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={small ? 'sm' : 'default'}
      onClick={copy}
      className={small ? 'h-6 px-2 text-[10px]' : 'h-8 px-3 text-xs'}
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className="mr-1 h-3 w-3 text-[#6EE05A]" />
          Copied
        </>
      ) : (
        <>
          <Copy className="mr-1 h-3 w-3" />
          Copy
        </>
      )}
    </Button>
  )
}
