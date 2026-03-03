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
    })
    e.dataTransfer.setData('application/0n-service', payload)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      className="builder-service-item"
      draggable
      onDragStart={onDragStart}
    >
      <div className="builder-service-icon">
        {service.logo ? (
          <img src={service.logo} alt={service.name} width={20} height={20} />
        ) : (
          service.icon || service.name.charAt(0)
        )}
      </div>
      <div className="builder-service-info">
        <div className="builder-service-name">
          <span
            className="builder-service-dot"
            style={{ backgroundColor: service.brandColor || '#666' }}
          />
          {service.name}
        </div>
        <div className="builder-service-tools">
          {service.tool_count} tool{service.tool_count !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}
