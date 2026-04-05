"use client"
import Loader from '@/components/loader'

import { useMounted } from '@/hooks/use-mounted'
import React from 'react'

const MountedProvider = ({ children }: { children: React.ReactNode }) => {
  const mounted = useMounted()
  if (!mounted) return <Loader />
  return children
}

export default MountedProvider