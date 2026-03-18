/**
 * EXECUTABLE SERVICES — The single source of truth for what the builder can produce.
 *
 * Every service here maps to a REAL tool in 0nMCP's catalog.js (54 services)
 * or CRM module (245 tools). The builder MUST NOT produce .0n files with
 * service/action combos that aren't in this map.
 *
 * Services NOT listed here can be wired in later via MCP server additions.
 * They should show as "coming soon" in the builder UI.
 *
 * Generated from: ~/Github/0nMCP/catalog.js + ~/Github/0nMCP/crm/
 */

export interface ExecutableAction {
  id: string
  name: string
  description: string
}

export interface ExecutableService {
  id: string
  name: string
  category: string
  actions: ExecutableAction[]
}

// ── 54 catalog services with their real actions ──

export const EXECUTABLE_SERVICES: ExecutableService[] = [
  // ── CRM (14 catalog + 245 module tools) ──
  {
    id: 'crm',
    name: 'CRM',
    category: 'crm_sales',
    actions: [
      { id: 'create_contact', name: 'Create Contact', description: 'Create a new CRM contact' },
      { id: 'search_contacts', name: 'Search Contacts', description: 'Search contacts by query' },
      { id: 'get_contact', name: 'Get Contact', description: 'Get contact by ID' },
      { id: 'update_contact', name: 'Update Contact', description: 'Update a contact' },
      { id: 'delete_contact', name: 'Delete Contact', description: 'Delete a contact' },
      { id: 'create_pipeline', name: 'Create Pipeline', description: 'Create a sales pipeline' },
      { id: 'list_pipelines', name: 'List Pipelines', description: 'List all pipelines' },
      { id: 'create_opportunity', name: 'Create Opportunity', description: 'Create a deal/opportunity' },
      { id: 'create_tag', name: 'Create Tag', description: 'Create a tag' },
      { id: 'list_tags', name: 'List Tags', description: 'List all tags' },
      { id: 'create_custom_value', name: 'Create Custom Value', description: 'Create a custom field value' },
      { id: 'list_custom_values', name: 'List Custom Values', description: 'List custom field values' },
      { id: 'list_workflows', name: 'List Workflows', description: 'List CRM workflows' },
      { id: 'list_calendars', name: 'List Calendars', description: 'List CRM calendars' },
      // CRM module adds 245 more tools via registerTools() — contacts, calendars,
      // conversations, opportunities, invoices, payments, products, locations,
      // social, users, objects. These are auto-registered at runtime.
    ],
  },

  // ── Payments & Finance ──
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'finance',
    actions: [
      { id: 'create_customer', name: 'Create Customer', description: 'Create a Stripe customer' },
      { id: 'list_customers', name: 'List Customers', description: 'List customers' },
      { id: 'get_customer', name: 'Get Customer', description: 'Get customer by ID' },
      { id: 'create_charge', name: 'Create Charge', description: 'Charge a customer' },
      { id: 'create_invoice', name: 'Create Invoice', description: 'Create an invoice' },
      { id: 'send_invoice', name: 'Send Invoice', description: 'Send an invoice' },
      { id: 'list_invoices', name: 'List Invoices', description: 'List invoices' },
      { id: 'create_subscription', name: 'Create Subscription', description: 'Create a subscription' },
      { id: 'get_balance', name: 'Get Balance', description: 'Get account balance' },
      { id: 'list_payments', name: 'List Payments', description: 'List payments' },
      { id: 'create_product', name: 'Create Product', description: 'Create a product' },
      { id: 'create_price', name: 'Create Price', description: 'Create a price' },
    ],
  },
  {
    id: 'square',
    name: 'Square',
    category: 'finance',
    actions: [
      { id: 'create_payment', name: 'Create Payment', description: 'Process a payment' },
      { id: 'list_payments', name: 'List Payments', description: 'List payments' },
      { id: 'create_customer', name: 'Create Customer', description: 'Create a customer' },
      { id: 'list_customers', name: 'List Customers', description: 'List customers' },
      { id: 'create_order', name: 'Create Order', description: 'Create an order' },
      { id: 'list_orders', name: 'List Orders', description: 'List orders' },
      { id: 'create_catalog_object', name: 'Create Catalog Object', description: 'Create a catalog item' },
      { id: 'list_catalog', name: 'List Catalog', description: 'List catalog items' },
    ],
  },
  {
    id: 'plaid',
    name: 'Plaid',
    category: 'finance',
    actions: [
      { id: 'create_link_token', name: 'Create Link Token', description: 'Create a Plaid Link token' },
      { id: 'get_accounts', name: 'Get Accounts', description: 'Get linked accounts' },
      { id: 'get_balance', name: 'Get Balance', description: 'Get account balances' },
      { id: 'get_transactions', name: 'Get Transactions', description: 'Get transactions' },
    ],
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    category: 'finance',
    actions: [
      { id: 'create_invoice', name: 'Create Invoice', description: 'Create an invoice' },
      { id: 'list_invoices', name: 'List Invoices', description: 'List invoices' },
      { id: 'create_customer', name: 'Create Customer', description: 'Create a customer' },
      { id: 'list_customers', name: 'List Customers', description: 'List customers' },
      { id: 'create_payment', name: 'Create Payment', description: 'Record a payment' },
      { id: 'profit_loss_report', name: 'Profit & Loss', description: 'Get P&L report' },
      { id: 'balance_sheet', name: 'Balance Sheet', description: 'Get balance sheet' },
    ],
  },

  // ── Communication ──
  {
    id: 'slack',
    name: 'Slack',
    category: 'notifications',
    actions: [
      { id: 'send_message', name: 'Send Message', description: 'Send a Slack message' },
      { id: 'list_channels', name: 'List Channels', description: 'List channels' },
      { id: 'list_users', name: 'List Users', description: 'List workspace users' },
      { id: 'create_channel', name: 'Create Channel', description: 'Create a channel' },
    ],
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'notifications',
    actions: [
      { id: 'send_message', name: 'Send Message', description: 'Send a Discord message' },
      { id: 'list_channels', name: 'List Channels', description: 'List server channels' },
    ],
  },
  {
    id: 'twilio',
    name: 'Twilio',
    category: 'notifications',
    actions: [
      { id: 'send_sms', name: 'Send SMS', description: 'Send a text message' },
      { id: 'list_messages', name: 'List Messages', description: 'List SMS messages' },
      { id: 'make_call', name: 'Make Call', description: 'Make a phone call' },
    ],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'notifications',
    actions: [
      { id: 'send_text_message', name: 'Send Text', description: 'Send a WhatsApp message' },
      { id: 'send_template_message', name: 'Send Template', description: 'Send a template message' },
      { id: 'send_media_message', name: 'Send Media', description: 'Send image/video/document' },
      { id: 'list_templates', name: 'List Templates', description: 'List message templates' },
    ],
  },

  // ── Email ──
  {
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'marketing',
    actions: [
      { id: 'send_email', name: 'Send Email', description: 'Send an email' },
      { id: 'add_contacts', name: 'Add Contacts', description: 'Add to contact list' },
      { id: 'search_contacts', name: 'Search Contacts', description: 'Search contacts' },
      { id: 'list_templates', name: 'List Templates', description: 'List email templates' },
    ],
  },
  {
    id: 'resend',
    name: 'Resend',
    category: 'marketing',
    actions: [
      { id: 'send_email', name: 'Send Email', description: 'Send an email' },
      { id: 'send_batch_emails', name: 'Send Batch', description: 'Send batch emails' },
      { id: 'create_contact', name: 'Create Contact', description: 'Create a contact' },
      { id: 'create_broadcast', name: 'Create Broadcast', description: 'Create a broadcast' },
      { id: 'send_broadcast', name: 'Send Broadcast', description: 'Send a broadcast' },
    ],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    category: 'marketing',
    actions: [
      { id: 'send_message', name: 'Send Email', description: 'Send an email' },
      { id: 'list_messages', name: 'List Messages', description: 'List inbox messages' },
      { id: 'get_message', name: 'Get Message', description: 'Get a specific email' },
      { id: 'create_draft', name: 'Create Draft', description: 'Create an email draft' },
      { id: 'list_labels', name: 'List Labels', description: 'List Gmail labels' },
    ],
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: 'marketing',
    actions: [
      { id: 'add_member', name: 'Add Member', description: 'Add to audience' },
      { id: 'list_members', name: 'List Members', description: 'List audience members' },
      { id: 'create_campaign', name: 'Create Campaign', description: 'Create email campaign' },
      { id: 'send_campaign', name: 'Send Campaign', description: 'Send campaign' },
      { id: 'get_campaign_report', name: 'Get Report', description: 'Get campaign report' },
    ],
  },
  {
    id: 'smartlead',
    name: 'Smartlead',
    category: 'marketing',
    actions: [
      { id: 'create_campaign', name: 'Create Campaign', description: 'Create outreach campaign' },
      { id: 'list_campaigns', name: 'List Campaigns', description: 'List campaigns' },
      { id: 'add_leads', name: 'Add Leads', description: 'Add leads to campaign' },
      { id: 'list_leads', name: 'List Leads', description: 'List campaign leads' },
      { id: 'get_campaign_stats', name: 'Get Stats', description: 'Get campaign stats' },
      { id: 'create_sequence', name: 'Create Sequence', description: 'Create email sequence' },
    ],
  },

  // ── AI ──
  {
    id: 'openai',
    name: 'OpenAI',
    category: 'ai',
    actions: [
      { id: 'chat_completion', name: 'Chat', description: 'Generate chat completion' },
      { id: 'create_image', name: 'Generate Image', description: 'Generate an image (DALL-E)' },
      { id: 'create_embedding', name: 'Create Embedding', description: 'Generate embeddings' },
      { id: 'text_to_speech', name: 'Text to Speech', description: 'Convert text to audio' },
    ],
  },
  // Note: anthropic is NOT in catalog.js as a callable service with endpoints.
  // It's used internally for AI routing, not as a workflow tool.

  // ── Social ──
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'social',
    actions: [
      { id: 'create_post', name: 'Create Post', description: 'Publish a LinkedIn post' },
      { id: 'get_profile', name: 'Get Profile', description: 'Get user profile' },
      { id: 'list_connections', name: 'List Connections', description: 'List connections' },
      { id: 'get_organization', name: 'Get Org', description: 'Get company page' },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'social',
    actions: [
      { id: 'list_media', name: 'List Media', description: 'List posts' },
      { id: 'create_media_container', name: 'Create Post', description: 'Create a post' },
      { id: 'publish_media', name: 'Publish Post', description: 'Publish post' },
      { id: 'list_comments', name: 'List Comments', description: 'List comments' },
      { id: 'reply_to_comment', name: 'Reply to Comment', description: 'Reply to a comment' },
      { id: 'get_insights', name: 'Get Insights', description: 'Get account insights' },
    ],
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    category: 'social',
    actions: [
      { id: 'create_tweet', name: 'Create Tweet', description: 'Post a tweet' },
      { id: 'search_tweets', name: 'Search', description: 'Search tweets' },
      { id: 'get_user', name: 'Get User', description: 'Get user profile' },
      { id: 'like_tweet', name: 'Like', description: 'Like a tweet' },
      { id: 'retweet', name: 'Retweet', description: 'Retweet' },
      { id: 'send_dm', name: 'Send DM', description: 'Send direct message' },
    ],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    category: 'social',
    actions: [
      { id: 'list_videos', name: 'List Videos', description: 'List posted videos' },
      { id: 'get_video_info', name: 'Get Video', description: 'Get video details' },
    ],
  },

  // ── Ads ──
  {
    id: 'facebook_ads',
    name: 'Facebook Ads',
    category: 'marketing',
    actions: [
      { id: 'create_campaign', name: 'Create Campaign', description: 'Create ad campaign' },
      { id: 'list_campaigns', name: 'List Campaigns', description: 'List campaigns' },
      { id: 'get_campaign', name: 'Get Campaign', description: 'Get campaign details' },
      { id: 'update_campaign', name: 'Update Campaign', description: 'Update campaign' },
      { id: 'create_adset', name: 'Create Ad Set', description: 'Create an ad set' },
      { id: 'create_ad', name: 'Create Ad', description: 'Create an ad' },
      { id: 'get_insights', name: 'Get Insights', description: 'Get performance insights' },
      { id: 'create_audience', name: 'Create Audience', description: 'Create custom audience' },
    ],
  },
  {
    id: 'google_ads',
    name: 'Google Ads',
    category: 'marketing',
    actions: [
      { id: 'create_campaign', name: 'Create Campaign', description: 'Create ad campaign' },
      { id: 'list_campaigns', name: 'List Campaigns', description: 'List campaigns' },
      { id: 'create_ad_group', name: 'Create Ad Group', description: 'Create ad group' },
      { id: 'create_ad', name: 'Create Ad', description: 'Create an ad' },
      { id: 'get_report', name: 'Get Report', description: 'Get performance report' },
    ],
  },
  {
    id: 'linkedin_ads',
    name: 'LinkedIn Ads',
    category: 'marketing',
    actions: [
      { id: 'create_campaign', name: 'Create Campaign', description: 'Create ad campaign' },
      { id: 'list_campaigns', name: 'List Campaigns', description: 'List campaigns' },
      { id: 'create_creative', name: 'Create Creative', description: 'Create ad creative' },
      { id: 'get_analytics', name: 'Get Analytics', description: 'Get campaign analytics' },
    ],
  },
  {
    id: 'instagram_ads',
    name: 'Instagram Ads',
    category: 'marketing',
    actions: [
      { id: 'create_campaign', name: 'Create Campaign', description: 'Create ad campaign' },
      { id: 'create_adset', name: 'Create Ad Set', description: 'Create an ad set' },
      { id: 'create_ad', name: 'Create Ad', description: 'Create an ad' },
      { id: 'get_insights', name: 'Get Insights', description: 'Get performance insights' },
    ],
  },
  {
    id: 'tiktok_ads',
    name: 'TikTok Ads',
    category: 'marketing',
    actions: [
      { id: 'create_campaign', name: 'Create Campaign', description: 'Create ad campaign' },
      { id: 'list_campaigns', name: 'List Campaigns', description: 'List campaigns' },
      { id: 'create_adgroup', name: 'Create Ad Group', description: 'Create ad group' },
      { id: 'create_ad', name: 'Create Ad', description: 'Create an ad' },
      { id: 'get_report', name: 'Get Report', description: 'Get performance report' },
    ],
  },
  {
    id: 'x_ads',
    name: 'X Ads',
    category: 'marketing',
    actions: [
      { id: 'create_campaign', name: 'Create Campaign', description: 'Create ad campaign' },
      { id: 'list_campaigns', name: 'List Campaigns', description: 'List campaigns' },
      { id: 'get_stats', name: 'Get Stats', description: 'Get campaign stats' },
    ],
  },

  // ── CRM & Sales ──
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm_sales',
    actions: [
      { id: 'create_contact', name: 'Create Contact', description: 'Create a contact' },
      { id: 'list_contacts', name: 'List Contacts', description: 'List contacts' },
      { id: 'search_contacts', name: 'Search Contacts', description: 'Search contacts' },
      { id: 'create_company', name: 'Create Company', description: 'Create a company' },
      { id: 'create_deal', name: 'Create Deal', description: 'Create a deal' },
      { id: 'list_deals', name: 'List Deals', description: 'List deals' },
    ],
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    category: 'crm_sales',
    actions: [
      { id: 'create_deal', name: 'Create Deal', description: 'Create a deal' },
      { id: 'list_deals', name: 'List Deals', description: 'List deals' },
      { id: 'create_person', name: 'Create Person', description: 'Create a person' },
      { id: 'list_persons', name: 'List Persons', description: 'List persons' },
      { id: 'list_pipelines', name: 'List Pipelines', description: 'List pipelines' },
      { id: 'create_activity', name: 'Create Activity', description: 'Create an activity' },
    ],
  },
  {
    id: 'intercom',
    name: 'Intercom',
    category: 'crm_sales',
    actions: [
      { id: 'create_contact', name: 'Create Contact', description: 'Create a contact' },
      { id: 'list_contacts', name: 'List Contacts', description: 'List contacts' },
      { id: 'create_conversation', name: 'Create Conversation', description: 'Start a conversation' },
      { id: 'reply_to_conversation', name: 'Reply', description: 'Reply to conversation' },
      { id: 'tag_contact', name: 'Tag Contact', description: 'Tag a contact' },
    ],
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    category: 'crm_sales',
    actions: [
      { id: 'create_ticket', name: 'Create Ticket', description: 'Create a support ticket' },
      { id: 'list_tickets', name: 'List Tickets', description: 'List tickets' },
      { id: 'update_ticket', name: 'Update Ticket', description: 'Update a ticket' },
      { id: 'search', name: 'Search', description: 'Search tickets/users' },
      { id: 'create_user', name: 'Create User', description: 'Create a user' },
    ],
  },

  // ── Database ──
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'database',
    actions: [
      { id: 'query_table', name: 'Query Table', description: 'Query table data' },
      { id: 'insert_row', name: 'Insert Row', description: 'Insert a new row' },
      { id: 'update_row', name: 'Update Row', description: 'Update a row' },
      { id: 'delete_row', name: 'Delete Row', description: 'Delete a row' },
      { id: 'list_users', name: 'List Users', description: 'List auth users' },
    ],
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'database',
    actions: [
      { id: 'find_one', name: 'Find One', description: 'Find a document' },
      { id: 'find_many', name: 'Find Many', description: 'Find documents' },
      { id: 'insert_one', name: 'Insert One', description: 'Insert a document' },
      { id: 'update_one', name: 'Update One', description: 'Update a document' },
      { id: 'delete_one', name: 'Delete One', description: 'Delete a document' },
    ],
  },
  {
    id: 'airtable',
    name: 'Airtable',
    category: 'database',
    actions: [
      { id: 'list_records', name: 'List Records', description: 'List table records' },
      { id: 'create_record', name: 'Create Record', description: 'Create a record' },
      { id: 'update_record', name: 'Update Record', description: 'Update a record' },
      { id: 'delete_record', name: 'Delete Record', description: 'Delete a record' },
    ],
  },

  // ── Productivity ──
  {
    id: 'notion',
    name: 'Notion',
    category: 'productivity',
    actions: [
      { id: 'search', name: 'Search', description: 'Search Notion' },
      { id: 'create_page', name: 'Create Page', description: 'Create a page' },
      { id: 'get_page', name: 'Get Page', description: 'Get a page' },
      { id: 'query_database', name: 'Query Database', description: 'Query a database' },
      { id: 'list_databases', name: 'List Databases', description: 'List databases' },
    ],
  },
  {
    id: 'asana',
    name: 'Asana',
    category: 'productivity',
    actions: [
      { id: 'create_task', name: 'Create Task', description: 'Create a task' },
      { id: 'list_tasks', name: 'List Tasks', description: 'List tasks' },
      { id: 'update_task', name: 'Update Task', description: 'Update a task' },
      { id: 'create_project', name: 'Create Project', description: 'Create a project' },
      { id: 'list_projects', name: 'List Projects', description: 'List projects' },
    ],
  },
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    category: 'productivity',
    actions: [
      { id: 'get_values', name: 'Get Values', description: 'Read spreadsheet values' },
      { id: 'update_values', name: 'Update Values', description: 'Write values' },
      { id: 'append_values', name: 'Append Values', description: 'Append rows' },
      { id: 'create_spreadsheet', name: 'Create Spreadsheet', description: 'Create new spreadsheet' },
    ],
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    category: 'productivity',
    actions: [
      { id: 'list_events', name: 'List Events', description: 'List calendar events' },
      { id: 'create_event', name: 'Create Event', description: 'Create an event' },
      { id: 'update_event', name: 'Update Event', description: 'Update an event' },
      { id: 'delete_event', name: 'Delete Event', description: 'Delete an event' },
    ],
  },
  {
    id: 'calendly',
    name: 'Calendly',
    category: 'productivity',
    actions: [
      { id: 'list_events', name: 'List Events', description: 'List scheduled events' },
      { id: 'list_event_types', name: 'List Event Types', description: 'List event types' },
      { id: 'get_user', name: 'Get User', description: 'Get user details' },
    ],
  },
  {
    id: 'zoom',
    name: 'Zoom',
    category: 'productivity',
    actions: [
      { id: 'create_meeting', name: 'Create Meeting', description: 'Create a Zoom meeting' },
      { id: 'list_meetings', name: 'List Meetings', description: 'List meetings' },
      { id: 'get_meeting', name: 'Get Meeting', description: 'Get meeting details' },
      { id: 'list_recordings', name: 'List Recordings', description: 'List cloud recordings' },
    ],
  },
  {
    id: 'whimsical',
    name: 'Whimsical',
    category: 'productivity',
    actions: [
      { id: 'list_boards', name: 'List Boards', description: 'List flowchart boards' },
      { id: 'create_board', name: 'Create Board', description: 'Create a board' },
      { id: 'create_from_mermaid', name: 'From Mermaid', description: 'Create from Mermaid diagram' },
      { id: 'create_from_text', name: 'From Text', description: 'Create from text description' },
    ],
  },

  // ── Dev Tools ──
  {
    id: 'github',
    name: 'GitHub',
    category: 'dev_tools',
    actions: [
      { id: 'list_repos', name: 'List Repos', description: 'List repositories' },
      { id: 'create_issue', name: 'Create Issue', description: 'Create an issue' },
      { id: 'list_issues', name: 'List Issues', description: 'List issues' },
      { id: 'create_pr', name: 'Create PR', description: 'Create a pull request' },
      { id: 'list_prs', name: 'List PRs', description: 'List pull requests' },
    ],
  },
  {
    id: 'linear',
    name: 'Linear',
    category: 'dev_tools',
    actions: [
      { id: 'graphql', name: 'GraphQL Query', description: 'Execute a GraphQL query' },
    ],
  },
  {
    id: 'jira',
    name: 'Jira',
    category: 'dev_tools',
    actions: [
      { id: 'create_issue', name: 'Create Issue', description: 'Create a Jira issue' },
      { id: 'search_issues', name: 'Search Issues', description: 'Search with JQL' },
      { id: 'update_issue', name: 'Update Issue', description: 'Update an issue' },
      { id: 'transition_issue', name: 'Transition', description: 'Move issue to new status' },
      { id: 'add_comment', name: 'Add Comment', description: 'Add a comment' },
      { id: 'list_projects', name: 'List Projects', description: 'List projects' },
    ],
  },

  // ── Ecommerce ──
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'ecommerce',
    actions: [
      { id: 'list_products', name: 'List Products', description: 'List products' },
      { id: 'create_product', name: 'Create Product', description: 'Create a product' },
      { id: 'list_orders', name: 'List Orders', description: 'List orders' },
      { id: 'get_order', name: 'Get Order', description: 'Get order details' },
      { id: 'list_customers', name: 'List Customers', description: 'List customers' },
      { id: 'create_customer', name: 'Create Customer', description: 'Create a customer' },
    ],
  },

  // ── Cloud & Infra ──
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    category: 'cloud',
    actions: [
      { id: 'list_zones', name: 'List Zones', description: 'List DNS zones' },
      { id: 'list_dns_records', name: 'List DNS Records', description: 'List DNS records' },
      { id: 'create_dns_record', name: 'Create DNS Record', description: 'Create a DNS record' },
      { id: 'list_workers', name: 'List Workers', description: 'List Cloudflare Workers' },
      { id: 'list_kv_namespaces', name: 'List KV', description: 'List KV namespaces' },
      { id: 'list_r2_buckets', name: 'List R2 Buckets', description: 'List R2 storage buckets' },
    ],
  },
  {
    id: 'godaddy',
    name: 'GoDaddy',
    category: 'cloud',
    actions: [
      { id: 'check_availability', name: 'Check Domain', description: 'Check domain availability' },
      { id: 'suggest_domains', name: 'Suggest Domains', description: 'Get domain suggestions' },
      { id: 'list_domains', name: 'List Domains', description: 'List your domains' },
      { id: 'list_dns_records', name: 'List DNS', description: 'List DNS records' },
    ],
  },
  {
    id: 'microsoft',
    name: 'Microsoft 365',
    category: 'cloud',
    actions: [
      { id: 'send_mail', name: 'Send Email', description: 'Send Outlook email' },
      { id: 'list_messages', name: 'List Messages', description: 'List emails' },
      { id: 'create_event', name: 'Create Event', description: 'Create calendar event' },
      { id: 'list_drive_items', name: 'List Files', description: 'List OneDrive files' },
      { id: 'send_channel_message', name: 'Teams Message', description: 'Send Teams message' },
    ],
  },
  {
    id: 'azure',
    name: 'Azure',
    category: 'cloud',
    actions: [
      { id: 'list_resource_groups', name: 'List Resources', description: 'List resource groups' },
      { id: 'list_vms', name: 'List VMs', description: 'List virtual machines' },
      { id: 'start_vm', name: 'Start VM', description: 'Start a VM' },
      { id: 'stop_vm', name: 'Stop VM', description: 'Stop a VM' },
    ],
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    category: 'cloud',
    actions: [
      { id: 'list_folder', name: 'List Folder', description: 'List folder contents' },
      { id: 'create_folder', name: 'Create Folder', description: 'Create a folder' },
      { id: 'search', name: 'Search', description: 'Search files' },
      { id: 'create_shared_link', name: 'Share Link', description: 'Create a shared link' },
    ],
  },
  {
    id: 'google_drive',
    name: 'Google Drive',
    category: 'cloud',
    actions: [
      { id: 'list_files', name: 'List Files', description: 'List files' },
      { id: 'create_file', name: 'Create File', description: 'Create a file' },
      { id: 'copy_file', name: 'Copy File', description: 'Copy a file' },
      { id: 'create_permission', name: 'Share', description: 'Share a file' },
    ],
  },

  // ── Automation Platforms ──
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'cloud',
    actions: [
      { id: 'list_zaps', name: 'List Zaps', description: 'List your Zaps' },
      { id: 'enable_zap', name: 'Enable Zap', description: 'Turn on a Zap' },
      { id: 'disable_zap', name: 'Disable Zap', description: 'Turn off a Zap' },
    ],
  },
  {
    id: 'make',
    name: 'Make',
    category: 'cloud',
    actions: [
      { id: 'list_scenarios', name: 'List Scenarios', description: 'List scenarios' },
      { id: 'run_scenario', name: 'Run Scenario', description: 'Execute a scenario' },
      { id: 'start_scenario', name: 'Start', description: 'Activate a scenario' },
      { id: 'stop_scenario', name: 'Stop', description: 'Deactivate a scenario' },
    ],
  },
  {
    id: 'n8n',
    name: 'n8n',
    category: 'cloud',
    actions: [
      { id: 'list_workflows', name: 'List Workflows', description: 'List workflows' },
      { id: 'execute_workflow', name: 'Execute', description: 'Execute a workflow' },
      { id: 'activate_workflow', name: 'Activate', description: 'Activate a workflow' },
      { id: 'deactivate_workflow', name: 'Deactivate', description: 'Deactivate a workflow' },
    ],
  },
  {
    id: 'pabbly',
    name: 'Pabbly',
    category: 'cloud',
    actions: [
      { id: 'list_workflows', name: 'List Workflows', description: 'List workflows' },
      { id: 'trigger_webhook', name: 'Trigger', description: 'Trigger a webhook workflow' },
      { id: 'enable_workflow', name: 'Enable', description: 'Enable a workflow' },
      { id: 'disable_workflow', name: 'Disable', description: 'Disable a workflow' },
    ],
  },
]

// ── Lookup helpers ──

const _serviceMap = new Map(EXECUTABLE_SERVICES.map(s => [s.id, s]))
const _actionMap = new Map<string, Set<string>>()
for (const svc of EXECUTABLE_SERVICES) {
  _actionMap.set(svc.id, new Set(svc.actions.map(a => a.id)))
}

/** Check if a service ID is executable */
export function isExecutable(serviceId: string): boolean {
  return _serviceMap.has(serviceId)
}

/** Check if a specific service + action combo is executable */
export function isActionExecutable(serviceId: string, actionId: string): boolean {
  const actions = _actionMap.get(serviceId)
  return actions ? actions.has(actionId) : false
}

/** Get a service definition */
export function getExecutableService(serviceId: string): ExecutableService | undefined {
  return _serviceMap.get(serviceId)
}

/** Get all executable service IDs */
export function getExecutableServiceIds(): string[] {
  return EXECUTABLE_SERVICES.map(s => s.id)
}

/** Get executable services by category */
export function getExecutableServicesByCategory(category: string): ExecutableService[] {
  return EXECUTABLE_SERVICES.filter(s => s.category === category)
}

/** Validate an entire .0n workflow — returns list of invalid steps */
export function validateWorkflowServices(
  steps: Array<{ id: string; service: string; action: string }>
): Array<{ stepId: string; service: string; action: string; error: string }> {
  const errors: Array<{ stepId: string; service: string; action: string; error: string }> = []

  for (const step of steps) {
    if (!isExecutable(step.service)) {
      errors.push({
        stepId: step.id,
        service: step.service,
        action: step.action,
        error: `Service "${step.service}" is not available. Wire it in via MCP server or use an available service.`,
      })
    } else if (!isActionExecutable(step.service, step.action)) {
      const svc = getExecutableService(step.service)
      const available = svc?.actions.map(a => a.id).join(', ') || 'none'
      errors.push({
        stepId: step.id,
        service: step.service,
        action: step.action,
        error: `Action "${step.action}" not found on "${step.service}". Available: ${available}`,
      })
    }
  }

  return errors
}

// ── Coming Soon services (in builder UI but not yet in catalog) ──

export const COMING_SOON_SERVICES = [
  'gemini', 'perplexity', 'cohere', 'mistral', 'replicate', 'stability',
  'elevenlabs', 'deepgram', 'groq', 'salesforce', 'freshdesk',
  'planetscale', 'neon', 'turso', 'cockroachdb', 'webflow', 'mcpfed',
  'postmark', 'mailgun', 'convertkit', 'brevo', 'activecampaign', 'lemlist',
  'outlook', 'xero', 'wave', 'pinterest', 'youtube', 'twitch',
  'clickup', 'monday', 'figma', 'typeform', 'loom', 'docusign', 'trello',
  'woocommerce', 'bigcommerce', 'wordpress', 'vercel', 'netlify',
  'railway', 'render', 'aws', 'gcloud', 'telegram',
] as const

export function isComingSoon(serviceId: string): boolean {
  return (COMING_SOON_SERVICES as readonly string[]).includes(serviceId)
}
