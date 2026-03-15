'use client'

import { useState, useMemo } from 'react'
import { useOnFlow, useOnFlowDispatch } from '../OnFlowContext'
import { getServiceActionGroups } from '../data/service-actions'
import ServiceCard from '../components/ServiceCard'
import type { OnFlowStep } from '../types'

export default function ActionColumn() {
  const state = useOnFlow()
  const dispatch = useOnFlowDispatch()
  const [search, setSearch] = useState('')

  const groups = useMemo(() => getServiceActionGroups(), [])

  const filtered = useMemo(() => {
    if (!search.trim()) return groups
    const q = search.toLowerCase()
    return groups
      .map((g) => ({
        ...g,
        services: g.services
          .filter((s) =>
            s.name.toLowerCase().includes(q) ||
            s.tools.some((t) => t.name.toLowerCase().includes(q))
          )
          .map((s) => ({
            ...s,
            tools: s.tools.filter(
              (t) => t.name.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
            ),
          })),
      }))
      .filter((g) => g.services.length > 0)
  }, [groups, search])

  function handleSelectTool(
    toolId: string,
    toolName: string,
    serviceId: string,
    serviceName: string,
    logo: string,
    color: string
  ) {
    const step: OnFlowStep = {
      id: `step_${String(state.stepCounter).padStart(3, '0')}`,
      type: 'action',
      serviceId,
      serviceName,
      serviceLogo: logo,
      toolId,
      toolName,
      description: `${toolName} via ${serviceName}`,
      inputs: {},
      outputs: {},
      condition: '',
      onFail: 'halt',
      timeout: 0,
      parallelGroup: '',
      status: 'idle',
      color,
    }
    dispatch({ type: 'ADD_STEP', step })
  }

  return (
    <div className="onflow-column onflow-column--actions">
      <div className="onflow-column__header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2" /><path d="M12 21v2" />
          <path d="M4.22 4.22l1.42 1.42" /><path d="M18.36 18.36l1.42 1.42" />
          <path d="M1 12h2" /><path d="M21 12h2" />
          <path d="M4.22 19.78l1.42-1.42" /><path d="M18.36 5.64l1.42-1.42" />
        </svg>
        <span>Services</span>
      </div>

      <input
        className="onflow-service-search"
        type="text"
        placeholder="Search services & tools..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="onflow-column__list">
        {filtered.map((group) => (
          <div key={group.category}>
            <div className="onflow-column__category">{group.category}</div>
            {group.services.map((svc) => (
              <ServiceCard
                key={svc.id}
                service={svc}
                onSelectTool={handleSelectTool}
              />
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="onflow-column__empty">No services match &ldquo;{search}&rdquo;</p>
        )}
      </div>
    </div>
  )
}
