'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { StepNode } from './types'

function WorkflowNodeComponent({ data, selected }: NodeProps<StepNode>) {
  const hasBadges = data.condition || data.parallelGroup

  return (
    <div className={`step-node${selected ? ' selected' : ''}`}>
      <Handle type="target" position={Position.Top} />

      <div className="step-node-header">
        <div className="step-node-icon">
          {data.serviceLogo ? (
            <img src={data.serviceLogo} alt={data.serviceName} width={18} height={18} />
          ) : (
            data.serviceIcon
          )}
        </div>
        <div className="step-node-service">{data.serviceName}</div>
      </div>

      <div className="step-node-body">
        <div className="step-node-id">{data.stepId}</div>
        <div className="step-node-tool">
          {data.toolName || 'Select a tool...'}
        </div>
      </div>

      {hasBadges && (
        <div className="step-node-badges">
          {data.condition && (
            <span className="step-node-badge condition">IF</span>
          )}
          {data.parallelGroup && (
            <span className="step-node-badge parallel">
              {data.parallelGroup}
            </span>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}

export default memo(WorkflowNodeComponent)
