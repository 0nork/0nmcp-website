/**
 * 0nCrew — AI Agent Team System
 *
 * Data model for visual agent management. Each agent is a named node
 * with abilities (tool IDs), triggers, and an optional .0n workflow.
 */

export interface CrewAgent {
  id: string
  name: string
  role: string
  avatar: string
  color: string
  abilities: string[]
  workflow?: string
  status: 'active' | 'idle' | 'disabled'
  triggers: string[]
  createdAt: string
}

export interface CrewConfig {
  agents: CrewAgent[]
  teamName: string
  teamDescription: string
}

/** Pre-built agent templates */
export const AGENT_TEMPLATES: CrewAgent[] = [
  {
    id: 'scout',
    name: 'Scout',
    role: 'Monitors new leads and enriches contact data',
    avatar: '\u{1F50D}',
    color: '#7ed957',
    abilities: ['search_contacts', 'create_contact', 'update_contact'],
    status: 'idle',
    triggers: ['webhook:new_contact'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'closer',
    name: 'Closer',
    role: 'Manages pipeline opportunities and follow-ups',
    avatar: '\u{1F3AF}',
    color: '#ff6b35',
    abilities: ['list_opportunities', 'update_opportunity', 'send_email'],
    status: 'idle',
    triggers: ['webhook:opportunity_stage_change'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'publisher',
    name: 'Publisher',
    role: 'Creates and schedules social media content',
    avatar: '\u{1F4E2}',
    color: '#a78bfa',
    abilities: ['create_social_post', 'list_social_posts', 'update_social_post'],
    status: 'idle',
    triggers: ['schedule:daily'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'dispatcher',
    name: 'Dispatcher',
    role: 'Routes conversations to the right team member',
    avatar: '\u{1F4EC}',
    color: '#00d4ff',
    abilities: ['list_conversations', 'send_message', 'assign_conversation'],
    status: 'idle',
    triggers: ['webhook:new_message'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'accountant',
    name: 'Accountant',
    role: 'Tracks invoices, payments, and billing',
    avatar: '\u{1F4B0}',
    color: '#635bff',
    abilities: ['list_invoices', 'create_invoice', 'list_payment_intents'],
    status: 'idle',
    triggers: ['webhook:payment_received'],
    createdAt: new Date().toISOString(),
  },
]

/** Available trigger types for agents */
export const TRIGGER_TYPES = [
  { value: 'webhook:new_contact', label: 'New Contact' },
  { value: 'webhook:new_message', label: 'New Message' },
  { value: 'webhook:opportunity_stage_change', label: 'Deal Stage Change' },
  { value: 'webhook:payment_received', label: 'Payment Received' },
  { value: 'webhook:form_submission', label: 'Form Submission' },
  { value: 'webhook:appointment_booked', label: 'Appointment Booked' },
  { value: 'schedule:hourly', label: 'Every Hour' },
  { value: 'schedule:daily', label: 'Every Day' },
  { value: 'schedule:weekly', label: 'Every Week' },
  { value: 'manual', label: 'Manual Trigger' },
] as const

/** Available abilities (tool IDs) grouped by service */
export const ABILITY_GROUPS: Record<string, { label: string; color: string; tools: { id: string; label: string }[] }> = {
  crm: {
    label: 'CRM',
    color: '#7c3aed',
    tools: [
      { id: 'search_contacts', label: 'Search Contacts' },
      { id: 'create_contact', label: 'Create Contact' },
      { id: 'update_contact', label: 'Update Contact' },
      { id: 'list_opportunities', label: 'List Deals' },
      { id: 'update_opportunity', label: 'Update Deal' },
      { id: 'list_conversations', label: 'List Conversations' },
      { id: 'send_message', label: 'Send Message' },
      { id: 'assign_conversation', label: 'Assign Conversation' },
      { id: 'list_invoices', label: 'List Invoices' },
      { id: 'create_invoice', label: 'Create Invoice' },
      { id: 'list_pipelines', label: 'List Pipelines' },
      { id: 'list_calendars', label: 'List Calendars' },
      { id: 'list_workflows', label: 'List Workflows' },
      { id: 'list_tags', label: 'List Tags' },
      { id: 'create_social_post', label: 'Create Social Post' },
      { id: 'list_social_posts', label: 'List Social Posts' },
      { id: 'update_social_post', label: 'Update Social Post' },
    ],
  },
  email: {
    label: 'Email',
    color: '#1a82e2',
    tools: [
      { id: 'send_email', label: 'Send Email' },
      { id: 'send_template_email', label: 'Send Template Email' },
      { id: 'list_templates', label: 'List Templates' },
    ],
  },
  stripe: {
    label: 'Stripe',
    color: '#635bff',
    tools: [
      { id: 'list_payment_intents', label: 'List Payments' },
      { id: 'create_payment_intent', label: 'Create Payment' },
      { id: 'list_customers', label: 'List Customers' },
      { id: 'create_invoice', label: 'Create Invoice' },
    ],
  },
  automation: {
    label: 'Automation',
    color: '#ff6d5a',
    tools: [
      { id: 'list_scenarios', label: 'List Scenarios' },
      { id: 'run_workflow', label: 'Run Workflow' },
      { id: 'list_workflows', label: 'List Workflows' },
    ],
  },
}

/** Generate a .0n workflow JSON from agent abilities */
export function generateAgentWorkflow(agent: CrewAgent): object {
  return {
    name: `${agent.id}-agent`,
    version: '1.0',
    description: agent.role,
    author: '0nCrew',
    steps: agent.abilities.map((toolId, idx) => ({
      id: `step_${String(idx + 1).padStart(3, '0')}`,
      name: toolId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      mcp_server: 'crm',
      tool: toolId,
      inputs: {},
      ...(idx > 0 ? { depends_on: [`step_${String(idx).padStart(3, '0')}`] } : {}),
    })),
  }
}

/** Load crew config from localStorage */
export function loadCrewConfig(): CrewConfig {
  if (typeof window === 'undefined') {
    return { agents: [...AGENT_TEMPLATES], teamName: 'My Team', teamDescription: '' }
  }
  try {
    const raw = localStorage.getItem('0n_crew_config')
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { agents: [...AGENT_TEMPLATES], teamName: 'My Team', teamDescription: '' }
}

/** Save crew config to localStorage */
export function saveCrewConfig(config: CrewConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('0n_crew_config', JSON.stringify(config))
  }
}
