'use client'

import { useState, useEffect, useCallback } from 'react'

export interface Operation {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'error'
  trigger: string
  actions: string[]
  services: string[]
  notifications: string[]
  frequency: string | null
  workflowData: Record<string, unknown>
  lastRun: string | null
  runCount: number
  createdAt: string
  errorMessage?: string
}

const STORAGE_KEY = '0n_operations'
const MAX_OPERATIONS = 50

function load(): Operation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(ops: Operation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ops))
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

export function useOperations() {
  const [operations, setOperations] = useState<Operation[]>([])

  useEffect(() => {
    setOperations(load())
  }, [])

  const add = useCallback(
    (op: Omit<Operation, 'id' | 'createdAt' | 'lastRun' | 'runCount' | 'status'>) => {
      setOperations((prev) => {
        const newOp: Operation = {
          ...op,
          id: generateId(),
          status: 'active' as const,
          lastRun: null,
          runCount: 0,
          createdAt: new Date().toISOString(),
        }
        const next: Operation[] = [newOp, ...prev].slice(0, MAX_OPERATIONS)
        save(next)
        return next
      })
    },
    [],
  )

  const remove = useCallback((id: string) => {
    setOperations((prev) => {
      const next = prev.filter((o) => o.id !== id)
      save(next)
      return next
    })
  }, [])

  const pause = useCallback((id: string) => {
    setOperations((prev) => {
      const next = prev.map((o) =>
        o.id === id ? { ...o, status: 'paused' as const } : o,
      )
      save(next)
      return next
    })
  }, [])

  const resume = useCallback((id: string) => {
    setOperations((prev) => {
      const next = prev.map((o) =>
        o.id === id
          ? { ...o, status: 'active' as const, errorMessage: undefined }
          : o,
      )
      save(next)
      return next
    })
  }, [])

  const updateStatus = useCallback(
    (id: string, status: Operation['status'], errorMessage?: string) => {
      setOperations((prev) => {
        const next = prev.map((o) =>
          o.id === id ? { ...o, status, errorMessage } : o,
        )
        save(next)
        return next
      })
    },
    [],
  )

  const incrementRun = useCallback((id: string) => {
    setOperations((prev) => {
      const next = prev.map((o) =>
        o.id === id
          ? { ...o, runCount: o.runCount + 1, lastRun: new Date().toISOString() }
          : o,
      )
      save(next)
      return next
    })
  }, [])

  const getById = useCallback(
    (id: string): Operation | undefined => {
      return operations.find((o) => o.id === id)
    },
    [operations],
  )

  return {
    operations,
    add,
    remove,
    pause,
    resume,
    updateStatus,
    incrementRun,
    getById,
  }
}
