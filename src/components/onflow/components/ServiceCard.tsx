'use client'

import { useState } from 'react'

interface ServiceCardProps {
  service: {
    id: string
    name: string
    logo: string
    color: string
    tools: { id: string; name: string }[]
  }
  onSelectTool: (toolId: string, toolName: string, serviceId: string, serviceName: string, logo: string, color: string) => void
}

export default function ServiceCard({ service, onSelectTool }: ServiceCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="onflow-service-card" style={{ '--card-color': service.color } as React.CSSProperties}>
      <button className="onflow-service-card__header" onClick={() => setExpanded(!expanded)}>
        <img
          className="onflow-service-card__logo"
          src={service.logo}
          alt=""
          width={24}
          height={24}
        />
        <span className="onflow-service-card__name">{service.name}</span>
        <span className="onflow-service-card__count">{service.tools.length}</span>
        <svg
          className={`onflow-service-card__chevron ${expanded ? 'onflow-service-card__chevron--open' : ''}`}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {expanded && (
        <div className="onflow-service-card__tools">
          {service.tools.map((tool) => (
            <button
              key={tool.id}
              className="onflow-service-card__tool"
              onClick={() => onSelectTool(tool.id, tool.name, service.id, service.name, service.logo, service.color)}
            >
              {tool.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
