'use client'

import { useState } from 'react'

interface DataChipProps {
  variableKey: string
  label: string
  sourceStepId: string
}

export default function DataChip({ variableKey, label, sourceStepId }: DataChipProps) {
  const [copied, setCopied] = useState(false)

  function handleClick() {
    const template = `{{step.${sourceStepId}.output.${variableKey.split('.').pop()}}}`
    navigator.clipboard.writeText(template).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <button
      className="onflow-data-chip"
      onClick={handleClick}
      title={`Copy {{${variableKey}}} — click to copy`}
    >
      <span className="onflow-data-chip__text">{copied ? 'Copied!' : label}</span>
    </button>
  )
}
