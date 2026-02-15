'use client'

import dynamic from 'next/dynamic'

const BuilderApp = dynamic(() => import('./BuilderApp'), { ssr: false })

export default function BuilderLoader() {
  return <BuilderApp />
}
