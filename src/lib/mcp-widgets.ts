/* ═══════════════════════════════════════════════════════════════
   0nMCP Widget Registry
   Maps MCP tool responses to React component configurations.
   Each widget can render in Console (dashboard) or Builder (flow node).
   ═══════════════════════════════════════════════════════════════ */

export interface WidgetConfig {
  /** Unique widget ID */
  id: string
  /** Display name */
  label: string
  /** MCP tool that provides data */
  tool: string
  /** Component type to render */
  component: 'table' | 'board' | 'card' | 'feed' | 'grid' | 'calendar' | 'chart' | 'embed'
  /** Widget icon (SVG path or emoji) */
  icon: string
  /** Brand color */
  color: string
  /** Description shown in widget picker */
  description: string
  /** Default size on dashboard grid */
  size: 'sm' | 'md' | 'lg' | 'xl'
  /** Auto-refresh interval in ms (0 = no refresh) */
  refreshInterval: number
  /** Source service */
  service: string
  /** Column definitions for table components */
  columns?: WidgetColumn[]
  /** Stage definitions for board components */
  stages?: { id: string; label: string; color: string }[]
  /** Fields to display in card components */
  fields?: string[]
  /** Required MCP connection */
  requires?: string
}

export interface WidgetColumn {
  key: string
  label: string
  type: 'text' | 'email' | 'phone' | 'date' | 'currency' | 'badge' | 'avatar'
  width?: string
  sortable?: boolean
}

/* ─── CRM WIDGETS ────────────────────────────────────────────── */

export const CRM_WIDGETS: WidgetConfig[] = [
  {
    id: 'crm-contacts',
    label: 'Contacts',
    tool: 'search_contacts',
    component: 'table',
    icon: '👤',
    color: '#7ed957',
    description: 'Live contact list from CRM — search, sort, and click to view details',
    size: 'lg',
    refreshInterval: 30000,
    service: 'crm',
    requires: 'crm',
    columns: [
      { key: 'firstName', label: 'Name', type: 'text', sortable: true },
      { key: 'email', label: 'Email', type: 'email', sortable: true },
      { key: 'phone', label: 'Phone', type: 'phone' },
      { key: 'tags', label: 'Tags', type: 'badge' },
      { key: 'dateAdded', label: 'Added', type: 'date', sortable: true },
    ],
  },
  {
    id: 'crm-pipeline',
    label: 'Pipeline',
    tool: 'list_pipelines',
    component: 'board',
    icon: '📊',
    color: '#00d4ff',
    description: 'Kanban board showing deal stages with drag-and-drop',
    size: 'xl',
    refreshInterval: 15000,
    service: 'crm',
    requires: 'crm',
  },
  {
    id: 'crm-calendar',
    label: 'Calendar',
    tool: 'list_calendars',
    component: 'calendar',
    icon: '📅',
    color: '#a78bfa',
    description: 'Upcoming appointments and bookable slots',
    size: 'lg',
    refreshInterval: 60000,
    service: 'crm',
    requires: 'crm',
  },
  {
    id: 'crm-conversations',
    label: 'Inbox',
    tool: 'list_conversations',
    component: 'feed',
    icon: '💬',
    color: '#f59e0b',
    description: 'Recent conversations and messages from CRM inbox',
    size: 'md',
    refreshInterval: 5000,
    service: 'crm',
    requires: 'crm',
  },
  {
    id: 'crm-opportunities',
    label: 'Deals',
    tool: 'list_opportunities',
    component: 'table',
    icon: '💰',
    color: '#7ed957',
    description: 'Active deals with stage, value, and contact info',
    size: 'lg',
    refreshInterval: 15000,
    service: 'crm',
    requires: 'crm',
    columns: [
      { key: 'name', label: 'Deal', type: 'text', sortable: true },
      { key: 'monetaryValue', label: 'Value', type: 'currency', sortable: true },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'assignedTo', label: 'Owner', type: 'text' },
      { key: 'updatedAt', label: 'Updated', type: 'date', sortable: true },
    ],
  },
  {
    id: 'crm-invoices',
    label: 'Invoices',
    tool: 'list_invoices',
    component: 'table',
    icon: '📄',
    color: '#635bff',
    description: 'Invoice list with status, amounts, and due dates',
    size: 'lg',
    refreshInterval: 30000,
    service: 'crm',
    requires: 'crm',
    columns: [
      { key: 'name', label: 'Invoice', type: 'text', sortable: true },
      { key: 'amount', label: 'Amount', type: 'currency', sortable: true },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'dueDate', label: 'Due', type: 'date', sortable: true },
    ],
  },
  {
    id: 'crm-social',
    label: 'Social Posts',
    tool: 'list_social_posts',
    component: 'feed',
    icon: '📱',
    color: '#1DA1F2',
    description: 'Scheduled and published social media posts',
    size: 'md',
    refreshInterval: 30000,
    service: 'crm',
    requires: 'crm',
  },
]

/* ─── STRIPE WIDGETS ─────────────────────────────────────────── */

export const STRIPE_WIDGETS: WidgetConfig[] = [
  {
    id: 'stripe-payments',
    label: 'Payments',
    tool: 'list_payment_intents',
    component: 'table',
    icon: '💳',
    color: '#635bff',
    description: 'Recent payment activity from Stripe',
    size: 'lg',
    refreshInterval: 15000,
    service: 'stripe',
    requires: 'stripe',
    columns: [
      { key: 'description', label: 'Description', type: 'text' },
      { key: 'amount', label: 'Amount', type: 'currency', sortable: true },
      { key: 'status', label: 'Status', type: 'badge' },
      { key: 'created', label: 'Date', type: 'date', sortable: true },
    ],
  },
  {
    id: 'stripe-customers',
    label: 'Customers',
    tool: 'list_customers',
    component: 'table',
    icon: '👥',
    color: '#635bff',
    description: 'Stripe customer list',
    size: 'lg',
    refreshInterval: 30000,
    service: 'stripe',
    requires: 'stripe',
    columns: [
      { key: 'name', label: 'Name', type: 'text', sortable: true },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'created', label: 'Since', type: 'date', sortable: true },
    ],
  },
]

/* ─── AUTOMATION PLATFORM WIDGETS ────────────────────────────── */

export const AUTOMATION_WIDGETS: WidgetConfig[] = [
  {
    id: 'n8n-workflows',
    label: 'n8n Workflows',
    tool: 'list_workflows',
    component: 'table',
    icon: '⚡',
    color: '#ff6d5a',
    description: 'n8n workflow list with status and last run',
    size: 'md',
    refreshInterval: 30000,
    service: 'n8n',
    requires: 'n8n',
    columns: [
      { key: 'name', label: 'Workflow', type: 'text', sortable: true },
      { key: 'active', label: 'Status', type: 'badge' },
      { key: 'updatedAt', label: 'Updated', type: 'date', sortable: true },
    ],
  },
  {
    id: 'make-scenarios',
    label: 'Make Scenarios',
    tool: 'list_scenarios',
    component: 'table',
    icon: '🔮',
    color: '#6e00f5',
    description: 'Make (Integromat) scenario list',
    size: 'md',
    refreshInterval: 30000,
    service: 'make',
    requires: 'make',
    columns: [
      { key: 'name', label: 'Scenario', type: 'text', sortable: true },
      { key: 'islinked', label: 'Status', type: 'badge' },
      { key: 'updatedAt', label: 'Updated', type: 'date', sortable: true },
    ],
  },
]

/* ─── INFRASTRUCTURE WIDGETS ─────────────────────────────────── */

export const INFRA_WIDGETS: WidgetConfig[] = [
  {
    id: 'cf-workers',
    label: 'Workers',
    tool: 'list_workers',
    component: 'table',
    icon: '☁️',
    color: '#f48120',
    description: 'Cloudflare Workers deployment list',
    size: 'md',
    refreshInterval: 60000,
    service: 'cloudflare',
    requires: 'cloudflare',
    columns: [
      { key: 'id', label: 'Worker', type: 'text', sortable: true },
      { key: 'modified_on', label: 'Modified', type: 'date', sortable: true },
    ],
  },
  {
    id: 'cf-dns',
    label: 'DNS Records',
    tool: 'list_dns_records',
    component: 'table',
    icon: '🌐',
    color: '#f48120',
    description: 'Cloudflare DNS zone records',
    size: 'lg',
    refreshInterval: 120000,
    service: 'cloudflare',
    requires: 'cloudflare',
    columns: [
      { key: 'name', label: 'Name', type: 'text', sortable: true },
      { key: 'type', label: 'Type', type: 'badge' },
      { key: 'content', label: 'Value', type: 'text' },
      { key: 'proxied', label: 'Proxy', type: 'badge' },
    ],
  },
]

/* ─── FULL WIDGET REGISTRY ───────────────────────────────────── */

export const WIDGET_REGISTRY: WidgetConfig[] = [
  ...CRM_WIDGETS,
  ...STRIPE_WIDGETS,
  ...AUTOMATION_WIDGETS,
  ...INFRA_WIDGETS,
]

/** Get all widgets for a specific service */
export function getWidgetsForService(service: string): WidgetConfig[] {
  return WIDGET_REGISTRY.filter(w => w.service === service)
}

/** Get a single widget by ID */
export function getWidget(id: string): WidgetConfig | undefined {
  return WIDGET_REGISTRY.find(w => w.id === id)
}

/** Get all widget categories */
export function getWidgetCategories(): { label: string; service: string; count: number; color: string }[] {
  const cats = new Map<string, { label: string; count: number; color: string }>()
  for (const w of WIDGET_REGISTRY) {
    const existing = cats.get(w.service)
    if (existing) {
      existing.count++
    } else {
      cats.set(w.service, {
        label: w.service === 'crm' ? 'CRM' : w.service.charAt(0).toUpperCase() + w.service.slice(1),
        count: 1,
        color: w.color,
      })
    }
  }
  return Array.from(cats.entries()).map(([service, data]) => ({ service, ...data }))
}
