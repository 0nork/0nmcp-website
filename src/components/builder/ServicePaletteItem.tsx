'use client'

import type { DragEvent } from 'react'
import type { BuilderService } from './ServicePalette'

interface Props {
  service: BuilderService
}

export default function ServicePaletteItem({ service }: Props) {
  function onDragStart(e: DragEvent) {
    const payload = JSON.stringify({
      serviceId: service.id,
      serviceName: service.name,
      serviceIcon: service.icon,
      serviceLogo: service.logo ?? '',
      tools: service.tools ?? [],
      defaultTool: service.defaultTool ?? '',
    })
    e.dataTransfer.setData('application/0n-service', payload)
    e.dataTransfer.effectAllowed = 'move'
  }

  const color = service.brandColor || '#666'

  return (
    <div
      className="builder-service-item"
      draggable
      onDragStart={onDragStart}
      style={{ borderLeftColor: color }}
    >
      {/* Colored rounded icon square */}
      <div
        className="builder-service-icon"
        style={{ background: `${color}20`, borderRadius: 10 }}
      >
        {service.logo ? (
          <img
            src={service.logo}
            alt={service.name}
            width={20}
            height={20}
            style={{ filter: 'brightness(1.2)' }}
          />
        ) : (
          <span style={{ fontSize: 16 }}>
            {service.icon || service.name.charAt(0)}
          </span>
        )}
      </div>

      <div className="builder-service-info">
        <div className="builder-service-name">
          {service.name}
          {service.category_id && (
            <span className="builder-service-badge" style={{ background: `${color}22`, color, borderColor: `${color}44` }}>
              {service.category_id}
            </span>
          )}
        </div>
        <div className="builder-service-tools">
          {service.description_short
            ? service.description_short.slice(0, 40) + (service.description_short.length > 40 ? '...' : '')
            : `${service.tool_count} tool${service.tool_count !== 1 ? 's' : ''}`
          }
        </div>
      </div>
    </div>
  )
}
