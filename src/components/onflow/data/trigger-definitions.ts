import type { TriggerDefinition } from '../types'

const svg = (paths: string, color: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`)}`

export const TRIGGER_DEFINITIONS: TriggerDefinition[] = [
  {
    id: 'new_contact',
    label: 'New Contact',
    description: 'When a new contact is added to CRM',
    color: '#ff6b35',
    icon: svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/>', '%23ff6b35'),
    serviceId: 'crm',
    defaultTool: 'crm_create_contact',
    outputVariables: [
      { key: 'contact.email', label: 'Email', type: 'string' },
      { key: 'contact.name', label: 'Name', type: 'string' },
      { key: 'contact.phone', label: 'Phone', type: 'string' },
      { key: 'contact.tags', label: 'Tags', type: 'array' },
    ],
  },
  {
    id: 'form_submit',
    label: 'Form Submit',
    description: 'When a form is filled out and submitted',
    color: '#ff6b35',
    icon: svg('<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>', '%23ff6b35'),
    serviceId: 'crm',
    defaultTool: 'crm_form_submitted',
    outputVariables: [
      { key: 'form.name', label: 'Name', type: 'string' },
      { key: 'form.email', label: 'Email', type: 'string' },
      { key: 'form.phone', label: 'Phone', type: 'string' },
      { key: 'form.message', label: 'Message', type: 'string' },
    ],
  },
  {
    id: 'email_opened',
    label: 'Email Opened',
    description: 'When a recipient opens your email',
    color: '#1A82E2',
    icon: svg('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>', '%231A82E2'),
    serviceId: 'sendgrid',
    defaultTool: 'sendgrid_event_webhook',
    outputVariables: [
      { key: 'email.to', label: 'Recipient', type: 'string' },
      { key: 'email.subject', label: 'Subject', type: 'string' },
      { key: 'email.timestamp', label: 'Timestamp', type: 'string' },
    ],
  },
  {
    id: 'schedule',
    label: 'Schedule',
    description: 'Run on a timer or cron schedule',
    color: '#a855f7',
    icon: svg('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>', '%23a855f7'),
    serviceId: 'schedule',
    defaultTool: 'schedule_cron',
    outputVariables: [
      { key: 'schedule.time', label: 'Time', type: 'string' },
      { key: 'schedule.date', label: 'Date', type: 'string' },
    ],
  },
  {
    id: 'webhook',
    label: 'Webhook',
    description: 'Receive data from an external HTTP request',
    color: '#00d4ff',
    icon: svg('<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>', '%2300d4ff'),
    serviceId: 'trigger',
    defaultTool: 'webhook_received',
    outputVariables: [
      { key: 'webhook.body', label: 'Body', type: 'object' },
      { key: 'webhook.headers', label: 'Headers', type: 'object' },
      { key: 'webhook.method', label: 'Method', type: 'string' },
    ],
  },
  {
    id: 'custom_event',
    label: 'Custom Event',
    description: 'Fire on a custom-named event',
    color: '#eab308',
    icon: svg('<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>', '%23eab308'),
    serviceId: 'trigger',
    defaultTool: 'custom_event',
    outputVariables: [
      { key: 'event.name', label: 'Event Name', type: 'string' },
      { key: 'event.data', label: 'Event Data', type: 'object' },
    ],
  },
]
