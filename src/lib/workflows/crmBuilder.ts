// Converts .0n workflow file → CRM workflow API payload

const EVENT_MAP: Record<string, string> = {
  'crm.contact_created': 'CONTACT_CREATED',
  'crm.form_submitted': 'FORM_SUBMISSION',
  'crm.appointment_booked': 'APPOINTMENT_BOOKED',
  'crm.opportunity_created': 'OPPORTUNITY_CREATED',
  'crm.tag_added': 'TAG_ADDED',
  'stripe.payment_received': 'STRIPE_PAYMENT_RECEIVED',
  'shopify.order_placed': 'SHOPIFY_ORDER_PLACED',
  'shopify.cart_abandoned': 'SHOPIFY_CART_ABANDONED',
  'facebook.lead_form_submitted': 'FB_LEADAD',
  'email.opened': 'EMAIL_OPENED',
  'calendar.appointment_booked': 'APPOINTMENT_BOOKED',
}

const ACTION_MAP: Record<string, string> = {
  'email.send': 'SEND_EMAIL',
  'email.send_template': 'SEND_EMAIL_TEMPLATE',
  'email.send_to_all_contacts': 'SEND_EMAIL_BULK',
  'twilio.send_sms': 'SEND_SMS',
  'crm.create_contact': 'CREATE_CONTACT',
  'crm.update_contact': 'UPDATE_CONTACT',
  'crm.add_tag': 'ADD_TAG',
  'crm.remove_tag': 'REMOVE_TAG',
  'crm.create_opportunity': 'CREATE_OPPORTUNITY',
  'crm.move_opportunity': 'MOVE_OPPORTUNITY',
  'crm.add_note': 'ADD_NOTE',
  'crm.create_task': 'CREATE_TASK',
  'crm.get_all_contacts': 'GET_CONTACTS',
  'shopify.create_product': 'SHOPIFY_CREATE_PRODUCT',
  'stripe.create_invoice': 'STRIPE_CREATE_INVOICE',
  'canva.generate_design': 'CANVA_GENERATE',
  'zoom.create_meeting': 'ZOOM_CREATE_MEETING',
  'whatsapp.send_message': 'WHATSAPP_SEND',
}

export async function buildCRMWorkflow(file: Record<string, unknown>): Promise<Record<string, unknown>> {
  const workflow = file.workflow as Record<string, unknown>
  const trigger = workflow.trigger as Record<string, unknown>
  const steps = workflow.steps as Array<Record<string, unknown>>

  const triggerType = trigger.type === 'event'
    ? EVENT_MAP[trigger.event_id as string] || 'INBOUND_WEBHOOK'
    : trigger.type === 'schedule' ? 'SCHEDULE' : 'INBOUND_WEBHOOK'

  const actions = steps.map((step, i) => {
    const params = step.params as Record<string, { value: string; type: string }>
    const resolved: Record<string, string> = {}
    for (const [k, v] of Object.entries(params)) {
      resolved[k] = v.value
    }

    return {
      id: step.id,
      type: ACTION_MAP[step.action_id as string] || 'CUSTOM_WEBHOOK',
      name: step.name,
      order: i + 1,
      config: resolved,
      ...(step.delay ? { delay: step.delay } : {}),
      ...(step.condition ? { condition: step.condition } : {}),
    }
  })

  return {
    name: workflow.name,
    status: 'published',
    locationId: file.sub_location_id,
    triggerType,
    triggers: [{ type: triggerType, filters: (trigger as Record<string, unknown>).filters || {} }],
    actions,
  }
}
