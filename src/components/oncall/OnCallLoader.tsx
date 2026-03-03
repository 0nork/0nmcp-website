'use client'

import dynamic from 'next/dynamic'

const OnCallBot = dynamic(() => import('./OnCallBot'), { ssr: false })

export default function OnCallLoader() {
  return <OnCallBot />
}
