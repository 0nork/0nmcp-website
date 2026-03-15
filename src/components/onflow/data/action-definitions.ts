import type { ActionDefinition } from '../types'

const svg = (paths: string, color: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`)}`

export const ACTION_DEFINITIONS: ActionDefinition[] = [
  {
    id: 'send_email',
    label: 'Send Email',
    description: 'Send a transactional or marketing email',
    color: '#1A82E2',
    icon: svg('<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>', '%231A82E2'),
    serviceId: 'sendgrid',
    defaultTool: 'sendgrid_send_email',
    inputFields: [
      { key: 'to', label: 'To', placeholder: '{{contact.email}}' },
      { key: 'subject', label: 'Subject', placeholder: 'Welcome!' },
      { key: 'body', label: 'Body', placeholder: 'Email content...' },
    ],
  },
  {
    id: 'send_sms',
    label: 'Send SMS',
    description: 'Send a text message via Twilio',
    color: '#F22F46',
    icon: svg('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', '%23F22F46'),
    serviceId: 'twilio',
    defaultTool: 'twilio_send_sms',
    inputFields: [
      { key: 'to', label: 'To', placeholder: '{{contact.phone}}' },
      { key: 'body', label: 'Message', placeholder: 'SMS content...' },
    ],
  },
  {
    id: 'create_task',
    label: 'Create Task',
    description: 'Create a task in the CRM',
    color: '#ff6b35',
    icon: svg('<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>', '%23ff6b35'),
    serviceId: 'crm',
    defaultTool: 'crm_create_task',
    inputFields: [
      { key: 'title', label: 'Title', placeholder: 'Follow up with {{contact.name}}' },
      { key: 'description', label: 'Description', placeholder: 'Task details...' },
      { key: 'dueDate', label: 'Due Date', placeholder: '{{schedule.date}}' },
    ],
  },
  {
    id: 'update_contact',
    label: 'Update Contact',
    description: 'Update a CRM contact record',
    color: '#ff6b35',
    icon: svg('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', '%23ff6b35'),
    serviceId: 'crm',
    defaultTool: 'crm_update_contact',
    inputFields: [
      { key: 'contactId', label: 'Contact ID', placeholder: '{{contact.id}}' },
      { key: 'tags', label: 'Tags', placeholder: 'new-lead, contacted' },
    ],
  },
  {
    id: 'api_call',
    label: 'API Call',
    description: 'Make an HTTP request to any URL',
    color: '#00d4ff',
    icon: svg('<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>', '%2300d4ff'),
    serviceId: 'trigger',
    defaultTool: 'http_request',
    inputFields: [
      { key: 'url', label: 'URL', placeholder: 'https://api.example.com/endpoint' },
      { key: 'method', label: 'Method', placeholder: 'POST' },
      { key: 'body', label: 'Body', placeholder: '{"key": "value"}' },
    ],
  },
  {
    id: 'generate_content',
    label: 'Generate Content',
    description: 'Use AI to generate text content',
    color: '#cc785c',
    icon: svg('<circle cx="12" cy="12" r="3"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/>', '%23cc785c'),
    serviceId: 'anthropic',
    defaultTool: 'anthropic_messages_create',
    inputFields: [
      { key: 'prompt', label: 'Prompt', placeholder: 'Write a welcome email for {{contact.name}}...' },
      { key: 'model', label: 'Model', placeholder: 'claude-sonnet-4-5-20250929' },
    ],
  },
]
