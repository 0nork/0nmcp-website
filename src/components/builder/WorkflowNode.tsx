'use client'

import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { StepNode } from './types'

const CRM_MODULES: Record<string, string> = {
  crm_search_contacts: 'contacts', crm_get_contact: 'contacts', crm_create_contact: 'contacts',
  crm_update_contact: 'contacts', crm_delete_contact: 'contacts', crm_upsert_contact: 'contacts',
  crm_get_contact_tasks: 'contacts', crm_create_contact_task: 'contacts',
  crm_get_calendar: 'calendars', crm_create_calendar: 'calendars', crm_update_calendar: 'calendars',
  crm_get_appointment: 'calendars', crm_create_appointment: 'calendars',
  crm_get_opportunity: 'opportunities', crm_create_opportunity: 'opportunities',
  crm_search_conversations: 'conversations', crm_get_conversation: 'conversations',
  crm_create_invoice: 'invoices', crm_get_invoice: 'invoices',
  crm_get_transaction: 'payments', crm_list_transactions: 'payments',
  crm_list_products: 'products', crm_get_product: 'products',
  crm_get_location: 'locations', crm_search_locations: 'locations',
  crm_get_post: 'social', crm_create_post: 'social',
  crm_get_user: 'users', crm_search_users: 'users',
  crm_list_custom_objects: 'objects', crm_get_custom_object: 'objects',
}

function getCrmModule(toolId: string): string | null {
  if (!toolId.startsWith('crm_')) return null
  // Direct lookup first
  if (CRM_MODULES[toolId]) return CRM_MODULES[toolId]
  // Pattern match
  const patterns = [
    'contact', 'calendar', 'appointment', 'opportunity', 'conversation',
    'invoice', 'transaction', 'payment', 'product', 'location',
    'social', 'post', 'user', 'object', 'auth',
  ]
  const moduleMap: Record<string, string> = {
    contact: 'contacts', calendar: 'calendars', appointment: 'calendars',
    opportunity: 'opportunities', conversation: 'conversations',
    invoice: 'invoices', transaction: 'payments', payment: 'payments',
    product: 'products', location: 'locations', social: 'social',
    post: 'social', user: 'users', object: 'objects', auth: 'auth',
  }
  for (const p of patterns) {
    if (toolId.includes(p)) return moduleMap[p] || null
  }
  return null
}

const CRM_MODULE_COLORS: Record<string, string> = {
  contacts: '#ff6b35',
  calendars: '#4285F4',
  opportunities: '#22d3ee',
  conversations: '#a855f7',
  invoices: '#f59e0b',
  payments: '#10b981',
  products: '#ec4899',
  locations: '#6366f1',
  social: '#3b82f6',
  users: '#8b5cf6',
  objects: '#f97316',
  auth: '#ef4444',
}

function WorkflowNodeComponent({ data, selected }: NodeProps<StepNode>) {
  const hasBadges = data.condition || data.parallelGroup
  const isCrm = data.serviceId === 'crm'
  const crmModule = isCrm && data.toolId ? getCrmModule(data.toolId) : null
  const crmColor = crmModule ? CRM_MODULE_COLORS[crmModule] : '#ff6b35'

  return (
    <div
      className={`step-node${selected ? ' selected' : ''}${isCrm ? ' crm-node' : ''}`}
      style={isCrm ? { '--crm-accent': crmColor } as React.CSSProperties : undefined}
    >
      {/* 4-sided handles */}
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />

      <div className="step-node-header">
        <div className="step-node-icon">
          {data.serviceLogo ? (
            <img src={data.serviceLogo} alt={data.serviceName} width={18} height={18} />
          ) : isCrm ? (
            <span style={{ fontSize: 16 }}>🚀</span>
          ) : (
            data.serviceIcon
          )}
        </div>
        <div className="step-node-service">{data.serviceName}</div>
        {isCrm && crmModule && (
          <span
            className="step-node-crm-module"
            style={{
              backgroundColor: `${crmColor}22`,
              color: crmColor,
              border: `1px solid ${crmColor}44`,
            }}
          >
            {crmModule}
          </span>
        )}
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
    </div>
  )
}

export default memo(WorkflowNodeComponent)
