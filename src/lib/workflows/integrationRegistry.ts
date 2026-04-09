// CRM Integration Registry — All native integrations, triggers, and actions
// The AI references this when generating .0n workflow files

export const CRM_INTEGRATION_REGISTRY: Record<string, {
  name: string; category: string; triggers: Array<{ id: string; label: string; description: string }>; actions: Array<{ id: string; label: string; params: string[] }>
}> = {
  stripe: {
    name: 'Stripe', category: 'payments',
    triggers: [
      { id: 'stripe.payment_received', label: 'Payment Received', description: 'Stripe payment succeeds' },
      { id: 'stripe.payment_failed', label: 'Payment Failed', description: 'Stripe payment fails' },
      { id: 'stripe.subscription_created', label: 'Subscription Started', description: 'New subscription' },
      { id: 'stripe.subscription_canceled', label: 'Subscription Cancelled', description: 'Subscription cancelled' },
    ],
    actions: [
      { id: 'stripe.create_invoice', label: 'Create Invoice', params: ['contact_id', 'amount', 'description'] },
      { id: 'stripe.create_subscription', label: 'Create Subscription', params: ['contact_id', 'price_id'] },
    ],
  },
  shopify: {
    name: 'Shopify', category: 'ecommerce',
    triggers: [
      { id: 'shopify.order_placed', label: 'New Order', description: 'Customer places order' },
      { id: 'shopify.order_fulfilled', label: 'Order Fulfilled', description: 'Order marked fulfilled' },
      { id: 'shopify.cart_abandoned', label: 'Cart Abandoned', description: 'Cart abandoned' },
      { id: 'shopify.new_customer', label: 'New Customer', description: 'New Shopify customer' },
    ],
    actions: [
      { id: 'shopify.create_product', label: 'Create Product', params: ['title', 'description', 'price', 'inventory', 'image_url'] },
      { id: 'shopify.update_product', label: 'Update Product', params: ['product_id', 'title', 'price'] },
      { id: 'shopify.create_discount', label: 'Create Discount', params: ['code', 'percentage', 'expires_at'] },
    ],
  },
  facebook: {
    name: 'Facebook / Instagram', category: 'social',
    triggers: [
      { id: 'facebook.lead_form_submitted', label: 'Lead Form Submitted', description: 'Facebook Lead Ad' },
      { id: 'facebook.new_dm', label: 'New Facebook DM', description: 'Facebook inbox message' },
      { id: 'instagram.new_dm', label: 'New Instagram DM', description: 'Instagram inbox message' },
    ],
    actions: [
      { id: 'facebook.reply_dm', label: 'Reply to DM', params: ['conversation_id', 'message'] },
    ],
  },
  google: {
    name: 'Google', category: 'google',
    triggers: [
      { id: 'google.new_review', label: 'New Google Review', description: 'Google Business review' },
      { id: 'google.new_lead', label: 'Google Ads Lead', description: 'Lead from Google Ads' },
    ],
    actions: [
      { id: 'google.reply_review', label: 'Reply to Review', params: ['review_id', 'reply_text'] },
      { id: 'google.create_calendar_event', label: 'Create Calendar Event', params: ['title', 'start_datetime', 'end_datetime', 'attendee_email'] },
    ],
  },
  twilio: {
    name: 'Twilio', category: 'communication',
    triggers: [
      { id: 'twilio.sms_received', label: 'SMS Received', description: 'Inbound SMS' },
      { id: 'twilio.call_missed', label: 'Call Missed', description: 'Missed call' },
    ],
    actions: [
      { id: 'twilio.send_sms', label: 'Send SMS', params: ['contact_id', 'message'] },
      { id: 'twilio.make_call', label: 'Make Call', params: ['contact_id', 'from_number'] },
    ],
  },
  whatsapp: {
    name: 'WhatsApp', category: 'communication',
    triggers: [{ id: 'whatsapp.message_received', label: 'Message Received', description: 'Inbound WhatsApp' }],
    actions: [{ id: 'whatsapp.send_message', label: 'Send Message', params: ['contact_id', 'template_name', 'variables'] }],
  },
  zoom: {
    name: 'Zoom', category: 'communication',
    triggers: [
      { id: 'zoom.meeting_attended', label: 'Meeting Attended', description: 'Contact attended Zoom' },
      { id: 'zoom.meeting_no_show', label: 'Meeting No-Show', description: 'Contact no-showed' },
    ],
    actions: [
      { id: 'zoom.create_meeting', label: 'Create Meeting', params: ['contact_id', 'topic', 'start_datetime', 'duration_minutes'] },
    ],
  },
  email: {
    name: 'Email (CRM Native)', category: 'communication',
    triggers: [
      { id: 'email.opened', label: 'Email Opened', description: 'Contact opens email' },
      { id: 'email.clicked', label: 'Link Clicked', description: 'Contact clicks email link' },
      { id: 'email.replied', label: 'Email Replied', description: 'Contact replies' },
    ],
    actions: [
      { id: 'email.send', label: 'Send Email', params: ['contact_id', 'subject', 'body_html', 'from_name'] },
      { id: 'email.send_template', label: 'Send Template', params: ['contact_id', 'template_id'] },
      { id: 'email.send_to_all_contacts', label: 'Send to All', params: ['subject', 'body_html', 'filter_tags'] },
    ],
  },
  crm: {
    name: 'CRM (Native)', category: 'crm',
    triggers: [
      { id: 'crm.contact_created', label: 'Contact Created', description: 'New contact' },
      { id: 'crm.contact_updated', label: 'Contact Updated', description: 'Contact field changed' },
      { id: 'crm.form_submitted', label: 'Form Submitted', description: 'CRM form submitted' },
      { id: 'crm.appointment_booked', label: 'Appointment Booked', description: 'New appointment' },
      { id: 'crm.opportunity_created', label: 'Opportunity Created', description: 'New opportunity' },
      { id: 'crm.opportunity_stage_changed', label: 'Stage Changed', description: 'Opportunity moved' },
      { id: 'crm.tag_added', label: 'Tag Added', description: 'Tag applied to contact' },
      { id: 'crm.payment_received', label: 'Payment Received', description: 'Payment recorded' },
    ],
    actions: [
      { id: 'crm.create_contact', label: 'Create Contact', params: ['first_name', 'last_name', 'email', 'phone', 'tags'] },
      { id: 'crm.update_contact', label: 'Update Contact', params: ['contact_id', 'field', 'value'] },
      { id: 'crm.add_tag', label: 'Add Tag', params: ['contact_id', 'tag'] },
      { id: 'crm.remove_tag', label: 'Remove Tag', params: ['contact_id', 'tag'] },
      { id: 'crm.create_opportunity', label: 'Create Opportunity', params: ['contact_id', 'pipeline_id', 'stage_id', 'name', 'value'] },
      { id: 'crm.move_opportunity', label: 'Move Opportunity', params: ['opportunity_id', 'stage_id'] },
      { id: 'crm.add_note', label: 'Add Note', params: ['contact_id', 'note_body'] },
      { id: 'crm.create_task', label: 'Create Task', params: ['contact_id', 'title', 'due_date'] },
      { id: 'crm.get_all_contacts', label: 'Get All Contacts', params: ['filter_tags', 'limit'] },
      { id: 'crm.add_to_campaign', label: 'Add to Campaign', params: ['contact_id', 'campaign_id'] },
    ],
  },
  canva: {
    name: 'Canva', category: 'design',
    triggers: [],
    actions: [
      { id: 'canva.generate_design', label: 'Generate Design', params: ['prompt', 'design_type'] },
      { id: 'canva.export_design', label: 'Export Design', params: ['design_id', 'format'] },
      { id: 'canva.from_template', label: 'Fill Template', params: ['template_id', 'data'] },
    ],
  },
  calendars: {
    name: 'CRM Calendars', category: 'scheduling',
    triggers: [
      { id: 'calendar.appointment_booked', label: 'Appointment Booked', description: 'New appointment' },
      { id: 'calendar.appointment_cancelled', label: 'Cancelled', description: 'Appointment cancelled' },
      { id: 'calendar.appointment_no_show', label: 'No-Show', description: 'Contact no-showed' },
    ],
    actions: [
      { id: 'calendar.send_reminder', label: 'Send Reminder', params: ['contact_id', 'appointment_id'] },
    ],
  },
  quickbooks: {
    name: 'QuickBooks', category: 'accounting',
    triggers: [{ id: 'quickbooks.invoice_paid', label: 'Invoice Paid', description: 'QB invoice paid' }],
    actions: [
      { id: 'quickbooks.create_customer', label: 'Create Customer', params: ['contact_id'] },
      { id: 'quickbooks.create_invoice', label: 'Create Invoice', params: ['contact_id', 'amount', 'description'] },
    ],
  },
}

export const ALL_TRIGGERS = Object.entries(CRM_INTEGRATION_REGISTRY).flatMap(([key, int]) =>
  int.triggers.map(t => ({ ...t, integration: key, integration_name: int.name }))
)

export const ALL_ACTIONS = Object.entries(CRM_INTEGRATION_REGISTRY).flatMap(([key, int]) =>
  int.actions.map(a => ({ ...a, integration: key, integration_name: int.name }))
)
