/**
 * 0nFlow v0.1 — types shared by API + cron + dispatcher.
 *
 * A flow is a template. Enrollment materializes its steps into flow_steps
 * rows with concrete scheduled_at timestamps. The cron drains pending steps
 * and the dispatcher resolves params (template substitution against
 * contact_data) and calls the right 0nMCP tool.
 */

export type FlowAction =
  | 'email'
  | 'sms'
  | 'slack'
  | 'tag_add'
  | 'webhook'
  | 'wait'

export interface StepTemplate {
  /** What this step does. */
  action: FlowAction
  /** Action-specific input. Strings can include {{contact.x}} variables. */
  params: Record<string, unknown>
  /** Delay in seconds from enrollment time before this step fires. */
  delay_seconds?: number
}

export interface FlowDefinition {
  id?: string
  slug: string
  name: string
  description?: string
  owner_email?: string
  owner_product?: string
  active?: boolean
  steps: StepTemplate[]
  default_provider?: 'crm' | 'resend' | 'sendgrid' | 'gmail' | 'postmark'
  default_location_id?: string
  metadata?: Record<string, unknown>
}

export interface EnrollmentInput {
  flow_id?: string
  flow_slug?: string
  contact_id?: string
  contact_email: string
  contact_data?: Record<string, unknown>
}

export interface FlowStepRow {
  id: string
  enrollment_id: string
  flow_id: string
  step_index: number
  action: FlowAction
  params: Record<string, unknown>
  scheduled_at: string
  status: 'pending' | 'running' | 'sent' | 'failed' | 'skipped' | 'cancelled'
  attempts: number
  last_error?: string | null
  result?: Record<string, unknown> | null
}

export interface DispatchContext {
  enrollment: {
    id: string
    contact_id: string | null
    contact_email: string
    contact_data: Record<string, unknown>
  }
  flow: {
    id: string
    slug: string
    default_provider: string
    default_location_id: string | null
  }
}

export interface DispatchResult {
  ok: boolean
  result?: Record<string, unknown>
  error?: string
}
