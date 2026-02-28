'use client'

import { useEffect, useCallback, useState } from 'react'
import { terminalBus } from '@/components/terminal/OnTerminalEventBus'

export function useTerminal() {
  const [isReady, setIsReady] = useState(false)
  const [lastOutput, setLastOutput] = useState('')

  useEffect(() => {
    const unsubReady = terminalBus.on('ready', () => setIsReady(true))
    const unsubOutput = terminalBus.on('output', (e) => setLastOutput(e.payload.text))
    return () => { unsubReady(); unsubOutput() }
  }, [])

  const execute = useCallback((command: string) => {
    terminalBus.executeFromChat(command)
  }, [])

  return { isReady, lastOutput, execute }
}
