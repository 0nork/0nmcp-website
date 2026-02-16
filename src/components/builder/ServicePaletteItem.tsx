'use client'

import type { DragEvent } from 'react'
import type { Service } from '@/lib/sxo-helpers'

interface Props {
  service: Service
}

export default function ServicePaletteItem({ service }: Props) {
  function onDragStart(e: DragEvent) {
    const payload = JSON.stringify({
      serviceId: service.id,
      serviceName: service.name,
      serviceIcon: service.icon,
      serviceLogo: (service as Record<string, unknown>).logo ?? '',
      tools: 'tools' in service ? service.tools : [],
    })
    e.dataTransfer.setData('application/0n-service', payload)
    e.dataTransfer.effectAllowed = 'move'
  }

  const logo = (service as Record<string, unknown>).logo as string | undefined

  return (
    <div
      className="builder-service-item"
      draggable
      onDragStart={onDragStart}
    >
      <div className="builder-service-icon">
        {logo ? (
          <img src={logo} alt={service.name} width={20} height={20} />
        ) : (
          service.icon
        )}
      </div>
      <div className="builder-service-info">
        <div className="builder-service-name">{service.name}</div>
        <div className="builder-service-tools">
          {service.tool_count} tool{service.tool_count !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  )
}
