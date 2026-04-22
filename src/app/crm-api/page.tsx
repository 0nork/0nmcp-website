'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ──────────────────────────────────────────────────
   CRM API Categories — 245 tools across 12 modules
   ────────────────────────────────────────────────── */
const categories = [
  {
    name: 'Contacts',
    count: 23,
    color: '#6EE05A',
    icon: '01',
    desc: 'Full CRUD on every contact field — search, create, update, upsert, bulk operations, tags, notes, tasks, and DND settings.',
    tools: [
      'contacts_search', 'contacts_get', 'contacts_create', 'contacts_update', 'contacts_upsert',
      'contacts_delete', 'contacts_list_tasks', 'contacts_create_task', 'contacts_update_task',
      'contacts_delete_task', 'contacts_add_tags', 'contacts_remove_tags', 'contacts_list_notes',
      'contacts_create_note', 'contacts_update_note', 'contacts_delete_note', 'contacts_list_appointments',
      'contacts_get_dnd', 'contacts_update_dnd', 'contacts_add_followers', 'contacts_remove_followers',
      'contacts_list_campaigns', 'contacts_bulk_update',
    ],
  },
  {
    name: 'Conversations',
    count: 13,
    color: '#00d4ff',
    icon: '02',
    desc: 'Search conversations, read full message threads, send SMS, email, WhatsApp, and live chat — all via API.',
    tools: [
      'conversations_search', 'conversations_get', 'conversations_create',
      'conversations_update', 'conversations_delete', 'conversations_list_messages',
      'conversations_send_message', 'conversations_send_inbound', 'conversations_send_email',
      'conversations_get_email_by_id', 'conversations_cancel_scheduled',
      'conversations_upload_file', 'conversations_update_status',
    ],
  },
  {
    name: 'Calendars',
    count: 27,
    color: '#a78bfa',
    icon: '03',
    desc: 'Manage calendars, booking widgets, appointment slots, availability, groups, and resources programmatically.',
    tools: [
      'calendars_list', 'calendars_get', 'calendars_create', 'calendars_update', 'calendars_delete',
      'calendars_list_groups', 'calendars_create_group', 'calendars_validate_group_slug',
      'calendars_delete_group', 'calendars_disable_group', 'calendars_edit_group',
      'calendars_list_events', 'calendars_get_event', 'calendars_list_blocked_slots',
      'calendars_create_blocked_slot', 'calendars_update_blocked_slot', 'calendars_delete_blocked_slot',
      'calendars_get_appointments', 'calendars_get_appointment', 'calendars_create_appointment',
      'calendars_update_appointment', 'calendars_delete_appointment', 'calendars_list_resources',
      'calendars_create_resource', 'calendars_update_resource', 'calendars_delete_resource',
      'calendars_free_slots',
    ],
  },
  {
    name: 'Opportunities',
    count: 14,
    color: '#fbbf24',
    icon: '04',
    desc: 'Pipeline management — create deals, move stages, update values, search by status, and manage pipeline structure.',
    tools: [
      'opportunities_search', 'opportunities_get', 'opportunities_create', 'opportunities_update',
      'opportunities_delete', 'opportunities_update_status', 'opportunities_upsert',
      'opportunities_list_pipelines', 'opportunities_get_followers', 'opportunities_add_followers',
      'opportunities_remove_followers', 'opportunities_add_tags', 'opportunities_remove_tags',
      'opportunities_list_stages',
    ],
  },
  {
    name: 'Invoices',
    count: 20,
    color: '#f472b6',
    icon: '05',
    desc: 'Create, send, void, and track invoices. Manage line items, discounts, taxes, and recurring billing.',
    tools: [
      'invoices_list', 'invoices_get', 'invoices_create', 'invoices_update', 'invoices_delete',
      'invoices_send', 'invoices_void', 'invoices_record_payment', 'invoices_list_templates',
      'invoices_create_template', 'invoices_update_template', 'invoices_delete_template',
      'invoices_generate_number', 'invoices_get_schedule', 'invoices_create_schedule',
      'invoices_update_schedule', 'invoices_delete_schedule', 'invoices_list_items',
      'invoices_create_item', 'invoices_delete_item',
    ],
  },
  {
    name: 'Social Media',
    count: 35,
    color: '#fb923c',
    icon: '06',
    desc: 'Post to Facebook, Instagram, Google, LinkedIn, TikTok, and Twitter. Schedule content, manage comments, and track analytics.',
    tools: [
      'social_list_accounts', 'social_get_account', 'social_create_post', 'social_get_post',
      'social_update_post', 'social_delete_post', 'social_list_posts', 'social_list_categories',
      'social_create_category', 'social_update_category', 'social_delete_category',
      'social_list_tags', 'social_create_tag', 'social_delete_tag', 'social_get_analytics',
      'social_list_comments', 'social_create_comment', 'social_delete_comment',
      'social_list_reviews', 'social_get_review', 'social_reply_review', 'social_delete_review_reply',
      'social_list_csv_posts', 'social_upload_csv', 'social_set_account',
      'social_get_post_metrics', 'social_bulk_delete_posts', 'social_get_insights',
      'social_start_oauth', 'social_finish_oauth', 'social_list_google_locations',
      'social_reconnect_account', 'social_delete_account', 'social_list_media',
      'social_upload_media',
    ],
  },
  {
    name: 'Locations',
    count: 24,
    color: '#34d399',
    icon: '07',
    desc: 'Manage location settings, custom fields, custom values, tags, templates, timezones, and business profiles.',
    tools: [
      'locations_get', 'locations_update', 'locations_list_tags', 'locations_create_tag',
      'locations_update_tag', 'locations_delete_tag', 'locations_list_custom_fields',
      'locations_create_custom_field', 'locations_update_custom_field', 'locations_delete_custom_field',
      'locations_list_custom_values', 'locations_create_custom_value', 'locations_update_custom_value',
      'locations_delete_custom_value', 'locations_list_templates', 'locations_search',
      'locations_list_timezones', 'locations_get_snippets', 'locations_create_snippet',
      'locations_update_snippet', 'locations_delete_snippet', 'locations_get_task_search',
      'locations_get_template', 'locations_delete_template',
    ],
  },
  {
    name: 'Users',
    count: 24,
    color: '#60a5fa',
    icon: '08',
    desc: 'Full user management — create team members, set permissions, manage roles, and control access.',
    tools: [
      'users_list', 'users_get', 'users_create', 'users_update', 'users_delete',
      'users_search', 'users_list_by_location', 'users_get_by_location',
      'users_create_by_location', 'users_update_by_location', 'users_delete_by_location',
      'users_list_roles', 'users_get_role', 'users_create_role', 'users_update_role',
      'users_delete_role', 'users_list_permissions', 'users_update_permissions',
      'users_list_locations', 'users_get_available_locations', 'users_assign_location',
      'users_unassign_location', 'users_list_company', 'users_update_company',
    ],
  },
  {
    name: 'Products',
    count: 10,
    color: '#c084fc',
    icon: '09',
    desc: 'Create and manage products, pricing, inventory, and product collections for e-commerce.',
    tools: [
      'products_list', 'products_get', 'products_create', 'products_update', 'products_delete',
      'products_list_prices', 'products_create_price', 'products_update_price',
      'products_delete_price', 'products_list_collections',
    ],
  },
  {
    name: 'Payments',
    count: 16,
    color: '#4ade80',
    icon: '10',
    desc: 'Process transactions, manage subscriptions, create orders, handle refunds, and track revenue.',
    tools: [
      'payments_list_transactions', 'payments_get_transaction', 'payments_list_subscriptions',
      'payments_get_subscription', 'payments_list_orders', 'payments_get_order',
      'payments_create_order', 'payments_list_fulfillments', 'payments_create_fulfillment',
      'payments_list_integration_providers', 'payments_create_white_label_order',
      'payments_list_coupons', 'payments_get_coupon', 'payments_create_coupon',
      'payments_update_coupon', 'payments_delete_coupon',
    ],
  },
  {
    name: 'Custom Objects',
    count: 34,
    color: '#f97316',
    icon: '11',
    desc: 'Build custom data models — define schemas, create records, manage associations, and query with full flexibility.',
    tools: [
      'objects_list_schemas', 'objects_get_schema', 'objects_create_schema', 'objects_update_schema',
      'objects_delete_schema', 'objects_list_records', 'objects_get_record', 'objects_create_record',
      'objects_update_record', 'objects_delete_record', 'objects_search_records',
      'objects_bulk_create_records', 'objects_bulk_update_records', 'objects_bulk_delete_records',
      'objects_list_associations', 'objects_get_association', 'objects_create_association',
      'objects_update_association', 'objects_delete_association', 'objects_list_fields',
      'objects_get_field', 'objects_create_field', 'objects_update_field', 'objects_delete_field',
      'objects_list_pipelines', 'objects_get_pipeline', 'objects_create_pipeline',
      'objects_update_pipeline', 'objects_delete_pipeline', 'objects_list_stages',
      'objects_get_stage', 'objects_create_stage', 'objects_update_stage', 'objects_delete_stage',
    ],
  },
  {
    name: 'Auth',
    count: 5,
    color: '#e879f9',
    icon: '12',
    desc: 'OAuth flow management — generate tokens, refresh credentials, manage scopes, and SSO integration.',
    tools: [
      'auth_get_token', 'auth_get_location_token', 'auth_refresh_token',
      'auth_get_token_info', 'auth_revoke_token',
    ],
  },
]

const painPoints = [
  {
    title: 'Limited API Coverage',
    desc: 'Your CRM has hundreds of features but the public API only covers a fraction. Want to manage courses via API? Social comments? Workflow toggles? Good luck.',
    color: '#ef4444',
  },
  {
    title: 'Complex Authentication',
    desc: 'OAuth tokens, PIT keys, refresh logic, scope management — just getting authenticated is a weekend project.',
    color: '#f59e0b',
  },
  {
    title: 'No AI Integration',
    desc: 'You want Claude or GPT to manage your CRM? The API was not built for AI agents. Until now.',
    color: '#8b5cf6',
  },
  {
    title: 'One-Off Scripts',
    desc: 'Every automation requires a custom API call, custom auth, custom error handling. There is no unified interface.',
    color: '#06b6d4',
  },
]

const useCases = [
  { title: 'AI AutoResponder', desc: 'Instant AI replies to every conversation across SMS, email, and chat.', price: '$29/mo value', color: '#6EE05A' },
  { title: 'Lead Scoring', desc: 'AI scores every contact 0-100 based on engagement, behavior, and fit.', price: '$49/mo value', color: '#00d4ff' },
  { title: 'Course Generator', desc: 'Generate complete courses with AI, deploy directly to your CRM.', price: 'Hours saved', color: '#a78bfa' },
  { title: 'Social Automation', desc: 'Post to all platforms — Facebook, Instagram, Google, LinkedIn — from one command.', price: '35 tools', color: '#fb923c' },
  { title: 'Pipeline Automation', desc: 'Auto-move deals based on engagement signals, email opens, and call outcomes.', price: 'Zero manual work', color: '#fbbf24' },
  { title: 'Bulk Operations', desc: 'Mass update contacts, tags, opportunities, and custom fields in seconds.', price: '10x faster', color: '#f472b6' },
]

const faqItems = [
  {
    q: 'How does 0nMCP connect to my CRM?',
    a: 'You provide your CRM API credentials (PIT key or OAuth token), and 0nMCP handles all authentication, token refresh, rate limiting, and error handling automatically. Setup takes under 5 minutes.',
  },
  {
    q: 'Does this work with sub-accounts and multiple locations?',
    a: 'Yes. 0nMCP supports location-level tokens, agency-level tokens, and can manage multiple CRM locations from one instance. Switch between locations with a single parameter.',
  },
  {
    q: 'What AI platforms can access my CRM through 0nMCP?',
    a: '0nMCP speaks the Model Context Protocol (MCP), so it works with Claude Desktop, Cursor, Windsurf, Gemini, Continue, Cline, and any MCP-compatible client. Your CRM becomes a native AI tool.',
  },
  {
    q: 'Is my CRM data secure?',
    a: 'Absolutely. 0nMCP uses AES-256-GCM encryption for stored credentials, never logs sensitive data, and all API calls go directly from your machine to the CRM API. Nothing passes through our servers.',
  },
  {
    q: 'How is pricing calculated?',
    a: 'Each CRM API action costs 1 Spark ($0.01). You get 100 free Sparks to start. A typical automation that creates a contact, adds tags, and sends a message uses 3 Sparks ($0.03).',
  },
]

const comparisonRows = [
  { label: 'CRM API endpoints covered', diy: '~30', onmcp: '245' },
  { label: 'Authentication handling', diy: 'Manual OAuth + refresh', onmcp: 'Automatic' },
  { label: 'AI integration', diy: 'Build from scratch', onmcp: 'Built-in (Claude, GPT)' },
  { label: 'Error handling', diy: 'Per-endpoint', onmcp: 'Universal' },
  { label: 'Setup time', diy: 'Weeks', onmcp: '5 minutes' },
  { label: 'Maintenance', diy: 'Ongoing', onmcp: 'Zero' },
  { label: 'Price', diy: '$50-200/hr dev time', onmcp: '$0.01/execution' },
]

function CategoryCard({ cat }: { cat: typeof categories[0] }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="rounded-2xl p-6 cursor-pointer transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${open ? cat.color + '44' : 'var(--border)'}`,
        boxShadow: open ? `0 0 30px ${cat.color}11` : 'none',
      }}
      onClick={() => setOpen(!open)}
    >
      <div className={`flex items-center justify-between ${open ? 'mb-4' : ''}`}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xs font-bold font-mono"
            style={{ background: cat.color + '15', color: cat.color }}
          >
            {cat.icon}
          </div>
          <div>
            <h3 className="m-0 text-[1.0625rem] font-bold">{cat.name}</h3>
            <p className="m-0 text-[0.8125rem] text-white/40">{cat.count} tools</p>
          </div>
        </div>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-sm transition-transform duration-200"
          style={{
            border: `1px solid ${cat.color}33`,
            color: cat.color,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          v
        </div>
      </div>
      {!open && (
        <p className="mt-3 mb-0 text-[0.8125rem] text-white/50 leading-relaxed">
          {cat.desc}
        </p>
      )}
      {open && (
        <div>
          <p className="mb-4 text-[0.8125rem] text-white/50 leading-relaxed">
            {cat.desc}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {cat.tools.map((t) => (
              <span
                key={t}
                className="text-[0.6875rem] font-mono px-2.5 py-1 rounded-md whitespace-nowrap"
                style={{
                  background: cat.color + '10',
                  color: cat.color,
                  border: `1px solid ${cat.color}22`,
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FAQItem({ item }: { item: typeof faqItems[0] }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="border-b border-border py-5 cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="flex justify-between items-center">
        <h3 className="m-0 text-base font-semibold">{item.q}</h3>
        <span className="text-[#6EE05A] text-xl flex-shrink-0 ml-4">{open ? '-' : '+'}</span>
      </div>
      {open && (
        <p className="mt-3 mb-0 text-[0.9375rem] text-white/60 leading-relaxed">
          {item.a}
        </p>
      )}
    </div>
  )
}

export default function CrmApiPage() {
  const totalTools = categories.reduce((sum, c) => sum + c.count, 0)

  return (
    <>
      {/* ── JSON-LD: SoftwareApplication ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: '0nMCP CRM API Integration',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Cross-platform',
        description: 'Unlock every CRM API endpoint through one platform. 245 tools across contacts, pipelines, conversations, invoices, social media, and more.',
        url: 'https://www.0nmcp.com/crm-api',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: 'Free tier includes 100 Sparks',
        },
        author: {
          '@type': 'Organization',
          name: 'RocketOpp, LLC',
          url: 'https://www.0nmcp.com',
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          ratingCount: '127',
          bestRating: '5',
        },
      }) }} />

      {/* ── JSON-LD: FAQPage ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      }) }} />

      {/* ── JSON-LD: BreadcrumbList ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '0nMCP', item: 'https://www.0nmcp.com' },
          { '@type': 'ListItem', position: 2, name: 'CRM API Integration', item: 'https://www.0nmcp.com/crm-api' },
        ],
      }) }} />

      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">

        {/* ════════════════════════════════════════════
            HERO SECTION
            ════════════════════════════════════════════ */}
        <section className="min-h-[85vh] flex flex-col items-center justify-center text-center px-6 pt-24 pb-12 relative overflow-hidden">
          {/* Subtle radial glow */}
          <div className="absolute pointer-events-none rounded-full"
            style={{
              top: '-20%', left: '50%', transform: 'translateX(-50%)',
              width: 800, height: 800,
              background: 'radial-gradient(circle, rgba(126,217,87,0.06) 0%, transparent 70%)',
            }}
          />

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[0.8125rem] font-semibold text-[#6EE05A] mb-8 relative"
            style={{ background: 'rgba(126,217,87,0.08)', border: '1px solid rgba(126,217,87,0.2)' }}>
            The #1 CRM API Integration Platform
          </div>

          <h1 className="text-[clamp(2.25rem,6vw,4.25rem)] font-extrabold tracking-[-0.03em] leading-[1.05] m-0 mb-5 max-w-[800px] relative">
            Every CRM API Endpoint.{' '}
            <span className="bg-gradient-to-br from-[#6EE05A] to-[#4CAF3D] bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              One Platform.
            </span>{' '}
            Zero Limitations.
          </h1>

          <p className="text-[clamp(1rem,2vw,1.25rem)] text-white/55 mb-10 max-w-[640px] leading-relaxed relative">
            Your CRM has {totalTools} API endpoints. Most users can access 10. 0nMCP unlocks all of
            them — contacts, pipelines, conversations, calendars, invoices, social posting, courses,
            and {totalTools - 10}+ more — through one natural language interface.
          </p>

          <div className="flex gap-4 flex-wrap justify-center relative">
            <Link href="/signup"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-[14px] text-[1.0625rem] font-bold no-underline transition-all duration-150 hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #6EE05A 0%, #4CAF3D 100%)', color: '#0B0F19', boxShadow: '0 0 40px rgba(126,217,87,0.25)' }}>
              Request Early Access
            </Link>
            <a href="#tools"
              className="inline-flex items-center gap-2 px-9 py-4 rounded-[14px] text-[1.0625rem] font-semibold no-underline transition-colors duration-200 hover:border-[var(--accent)]"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
              See All {totalTools} Tools
            </a>
          </div>

          {/* Stats Bar */}
          <div className="flex gap-8 flex-wrap justify-center mt-14 px-8 py-5 rounded-[14px] relative"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
            {[
              { val: `${totalTools}`, label: 'CRM Tools' },
              { val: '12', label: 'Categories' },
              { val: 'MCP', label: 'Protocol' },
              { val: '7+', label: 'AI Platforms' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-[1.375rem] font-extrabold text-[#6EE05A]">{s.val}</div>
                <div className="text-[0.75rem] text-white/40 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            PROBLEM SECTION
            ════════════════════════════════════════════ */}
        <section className="py-20 px-6 max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#ef4444] mb-3">
              The problem
            </p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold m-0">
              The CRM API Problem Everyone Knows
            </h2>
          </div>

          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {painPoints.map((p) => (
              <div key={p.title}
                className="p-6 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                <div
                  className="w-2 h-2 rounded-full mb-4"
                  style={{ background: p.color, boxShadow: `0 0 12px ${p.color}44` }}
                />
                <h3 className="text-[1.0625rem] font-bold m-0 mb-2">{p.title}</h3>
                <p className="text-[0.875rem] text-white/50 m-0 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            SOLUTION SECTION
            ════════════════════════════════════════════ */}
        <section className="py-20 px-6 max-w-[800px] mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6EE05A] mb-3">
            The solution
          </p>
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold m-0 mb-4">
            0nMCP: The Universal CRM API Layer
          </h2>
          <p className="text-lg text-white/50 mb-10 leading-relaxed">
            One command. Any CRM action. AI handles the rest.
          </p>

          {/* Code example */}
          <div className="text-left rounded-2xl overflow-hidden max-w-[640px] mx-auto"
            style={{ background: 'var(--bg-primary)', border: '1px solid rgba(126,217,87,0.15)' }}>
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
              <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
              <div className="w-2 h-2 rounded-full bg-[#fbbf24]" />
              <div className="w-2 h-2 rounded-full bg-[#6EE05A]" />
              <span className="text-[0.6875rem] text-white/30 ml-auto font-mono">
                natural language
              </span>
            </div>
            <div className="p-6">
              <p className="text-[0.9375rem] text-white/80 mb-6 leading-relaxed italic">
                &ldquo;Create a contact named Sarah Chen, add tag &apos;VIP&apos;,
                create an opportunity in the Sales pipeline,
                and send her a welcome email&rdquo;
              </p>
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-[10px]"
                style={{ background: 'rgba(126,217,87,0.06)', border: '1px solid rgba(126,217,87,0.12)' }}>
                <div className="w-2.5 h-2.5 rounded-full bg-[#6EE05A]" style={{ boxShadow: '0 0 8px rgba(126,217,87,0.5)' }} />
                <span className="text-[0.875rem] font-mono text-[#6EE05A]">
                  0nMCP executed 4 API calls in 2.1 seconds
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            THE 245 TOOLS SECTION
            ════════════════════════════════════════════ */}
        <section id="tools" className="py-20 px-6 max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6EE05A] mb-3">
              The showstopper
            </p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold m-0 mb-2">
              {totalTools} CRM Tools Across 12 Categories
            </h2>
            <p className="text-base text-white/45 m-0">
              Click any category to see every tool available
            </p>
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {categories.map((cat) => (
              <CategoryCard key={cat.name} cat={cat} />
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            HOW IT WORKS
            ════════════════════════════════════════════ */}
        <section className="py-20 px-6 max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#00d4ff] mb-3">
              Three integration methods
            </p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold m-0">
              Three Ways to Use 0nMCP with Your CRM
            </h2>
          </div>

          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {[
              {
                num: '01',
                title: 'Natural Language',
                desc: 'Describe what you want in English. 0nMCP plans and executes the API calls automatically — no code required.',
                color: '#6EE05A',
              },
              {
                num: '02',
                title: 'MCP Protocol',
                desc: 'Connect to Claude Desktop, Cursor, Windsurf, or any MCP client. Your CRM becomes a native AI tool.',
                color: '#00d4ff',
              },
              {
                num: '03',
                title: 'Direct API',
                desc: 'REST endpoints for every CRM action. Standard JSON, proper error handling, automatic token refresh.',
                color: '#a78bfa',
              },
            ].map((m) => (
              <div key={m.num}
                className="p-8 px-6 rounded-2xl relative overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                <div
                  className="absolute top-4 right-4 text-5xl font-black font-mono leading-none"
                  style={{ color: m.color + '08' }}
                >
                  {m.num}
                </div>
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center text-xs font-bold font-mono mb-4"
                  style={{ background: m.color + '15', color: m.color }}
                >
                  {m.num}
                </div>
                <h3 className="text-xl font-bold m-0 mb-2">{m.title}</h3>
                <p className="text-[0.9375rem] text-white/50 m-0 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            WHAT YOU CAN BUILD
            ════════════════════════════════════════════ */}
        <section className="py-20 px-6 max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#a78bfa] mb-3">
              Real use cases
            </p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold m-0">
              What CRM Users Are Building with 0nMCP
            </h2>
          </div>

          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {useCases.map((uc) => (
              <div key={uc.title}
                className="p-6 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                <div className="flex justify-between items-start mb-3">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5"
                    style={{ background: uc.color, boxShadow: `0 0 12px ${uc.color}44` }}
                  />
                  <span
                    className="text-[0.6875rem] font-semibold px-2.5 py-1 rounded-md"
                    style={{ color: uc.color, background: uc.color + '10', border: `1px solid ${uc.color}22` }}>
                    {uc.price}
                  </span>
                </div>
                <h3 className="text-[1.0625rem] font-bold m-0 mb-1.5">{uc.title}</h3>
                <p className="text-[0.875rem] text-white/50 m-0 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            COMPARISON TABLE
            ════════════════════════════════════════════ */}
        <section className="py-20 px-6 max-w-[700px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#fbbf24] mb-3">
              The comparison
            </p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold m-0">
              0nMCP vs Building It Yourself
            </h2>
          </div>

          <div className="rounded-2xl overflow-hidden border border-border">
            {/* Header */}
            <div className="grid grid-cols-3 px-5 py-4 bg-[var(--bg-card)] border-b border-border">
              <span className="text-xs font-bold text-white/40 uppercase tracking-[0.08em]">Feature</span>
              <span className="text-xs font-bold text-white/40 uppercase tracking-[0.08em] text-center">DIY</span>
              <span className="text-xs font-bold text-[#6EE05A] uppercase tracking-[0.08em] text-center">0nMCP</span>
            </div>
            {comparisonRows.map((row, i) => (
              <div key={row.label}
                className="grid grid-cols-3 px-5 py-4"
                style={{
                  background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                  borderBottom: i < comparisonRows.length - 1 ? '1px solid var(--bg-card)' : 'none',
                }}>
                <span className="text-[0.875rem] text-white/70">{row.label}</span>
                <span className="text-[0.875rem] text-white/35 text-center">{row.diy}</span>
                <span className="text-[0.875rem] text-[#6EE05A] text-center font-semibold">{row.onmcp}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            PRICING
            ════════════════════════════════════════════ */}
        <section className="py-20 px-6 max-w-[1000px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6EE05A] mb-3">
              Pricing
            </p>
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold m-0 mb-2">
              Simple Pricing. No Surprises.
            </h2>
            <p className="text-base text-white/45 m-0">
              1 Spark = 1 CRM API action = $0.01
            </p>
          </div>

          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {[
              {
                name: 'Free', price: '$0', period: 'forever',
                sparks: '100 Sparks', desc: 'Try everything — no credit card required',
                features: ['100 Sparks included', 'All 245 CRM tools', 'Natural language interface', 'Community support'],
                highlight: false,
              },
              {
                name: 'Supporter', price: '$9', period: '/mo',
                sparks: '1,000 Sparks', desc: 'For power users who automate daily',
                features: ['1,000 Sparks/month', 'All 245 CRM tools', 'MCP protocol access', 'Priority support', 'Usage dashboard'],
                highlight: false,
              },
              {
                name: 'Builder', price: '$29', period: '/mo',
                sparks: '5,000 Sparks', desc: 'For agencies and teams building at scale',
                features: ['5,000 Sparks/month', 'All 245 CRM tools', 'MCP + REST API access', 'Multi-location support', 'Dedicated support', 'Custom integrations'],
                highlight: true,
              },
            ].map((plan) => (
              <div key={plan.name}
                className="px-6 py-8 rounded-2xl relative"
                style={{
                  background: plan.highlight ? 'rgba(126,217,87,0.04)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${plan.highlight ? 'rgba(126,217,87,0.25)' : 'var(--border)'}`,
                }}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[0.6875rem] font-bold text-[#0B0F19] whitespace-nowrap"
                    style={{ background: 'linear-gradient(135deg, #6EE05A, #4CAF3D)' }}>
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold m-0 mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-[2.5rem] font-extrabold" style={{ color: plan.highlight ? '#6EE05A' : '#fff' }}>{plan.price}</span>
                  <span className="text-[0.875rem] text-white/40">{plan.period}</span>
                </div>
                <p className="text-[0.8125rem] text-white/40 mb-6">{plan.desc}</p>
                <ul className="list-none p-0 m-0 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="py-1.5 flex items-center gap-2 text-[0.875rem] text-white/60">
                      <span className="text-[#6EE05A] font-bold text-xs">+</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup"
                  className="block text-center py-3 rounded-[10px] text-[0.9375rem] font-bold no-underline"
                  style={{
                    background: plan.highlight ? 'linear-gradient(135deg, #6EE05A 0%, #4CAF3D 100%)' : 'var(--border)',
                    color: plan.highlight ? '#0B0F19' : '#fff',
                    border: plan.highlight ? 'none' : '1px solid var(--border)',
                  }}>
                  {plan.price === '$0' ? 'Start Free' : 'Get Started'}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            MCP PROTOCOL
            ════════════════════════════════════════════ */}
        <section className="py-20 px-6 max-w-[800px] mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#00d4ff] mb-3">
            Universal compatibility
          </p>
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-extrabold m-0 mb-4">
            Works with Every AI Platform
          </h2>
          <p className="text-[1.0625rem] text-white/50 mb-8 leading-relaxed">
            0nMCP speaks the Model Context Protocol. Any AI tool that supports MCP can access
            your CRM — Claude Desktop, Cursor, Windsurf, Gemini, Continue, Cline, and OpenAI.
          </p>

          {/* Platform pills */}
          <div className="flex flex-wrap gap-2.5 justify-center mb-10">
            {['Claude Desktop', 'Cursor', 'Windsurf', 'Gemini', 'Continue', 'Cline', 'OpenAI'].map((p) => (
              <span key={p}
                className="px-4 py-2 rounded-[10px] text-[0.875rem] font-semibold text-[#00d4ff]"
                style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}>
                {p}
              </span>
            ))}
          </div>

          {/* MCP config example */}
          <div className="text-left rounded-2xl overflow-hidden max-w-[480px] mx-auto"
            style={{ background: 'var(--bg-primary)', border: '1px solid rgba(0,212,255,0.15)' }}>
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
              <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
              <div className="w-2 h-2 rounded-full bg-[#fbbf24]" />
              <div className="w-2 h-2 rounded-full bg-[#6EE05A]" />
              <span className="text-[0.6875rem] text-white/30 ml-auto font-mono">
                mcp.json
              </span>
            </div>
            <pre className="px-5 py-5 m-0 text-[0.8125rem] leading-[1.7] font-mono text-white/70 overflow-auto">
{`{
  "0nMCP": {
    "command": "npx",
    "args": ["0nmcp"]
  }
}`}
            </pre>
          </div>
          <p className="text-[0.8125rem] text-white/30 mt-4">
            That is it. One config. {totalTools} CRM tools in your AI.
          </p>
        </section>

        {/* ════════════════════════════════════════════
            SSO / MARKETPLACE INSTALL
            ════════════════════════════════════════════ */}
        <section className="py-12 px-6 max-w-[700px] mx-auto text-center">
          <div className="p-8 rounded-2xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
            <h3 className="text-xl font-bold m-0 mb-2">
              Already use the CRM?
            </h3>
            <p className="text-[0.9375rem] text-white/50 mb-6 leading-relaxed">
              Sign in with your CRM account for instant setup. Or install directly from the CRM Marketplace
              for one-click activation across all your locations.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/login"
                className="px-6 py-3 rounded-[10px] text-[0.9375rem] font-semibold no-underline"
                style={{ background: 'var(--border)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                Sign in with CRM
              </Link>
              <Link href="/connect"
                className="px-6 py-3 rounded-[10px] text-[0.9375rem] font-semibold no-underline text-[#6EE05A]"
                style={{ background: 'rgba(126,217,87,0.08)', border: '1px solid rgba(126,217,87,0.2)' }}>
                CRM Marketplace Install
              </Link>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            FAQ
            ════════════════════════════════════════════ */}
        <section className="py-20 px-6 max-w-[700px] mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#6EE05A] mb-3">
              FAQ
            </p>
            <h2 className="text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold m-0">
              Common Questions
            </h2>
          </div>

          <div>
            {faqItems.map((item) => (
              <FAQItem key={item.q} item={item} />
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            FINAL CTA
            ════════════════════════════════════════════ */}
        <section className="py-24 px-6 text-center relative overflow-hidden">
          <div className="absolute pointer-events-none rounded-full"
            style={{
              bottom: '-30%', left: '50%', transform: 'translateX(-50%)',
              width: 600, height: 600,
              background: 'radial-gradient(circle, rgba(126,217,87,0.05) 0%, transparent 70%)',
            }}
          />
          <h2 className="text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold tracking-[-0.02em] m-0 mb-4 relative">
            Your CRM. Unlimited API Access.{' '}
            <span className="bg-gradient-to-br from-[#6EE05A] to-[#4CAF3D] bg-clip-text text-transparent" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Start Free.
            </span>
          </h2>
          <p className="text-[1.0625rem] text-white/50 mb-10 relative">
            100 Sparks. No credit card. No commitment.
          </p>
          <Link href="/signup"
            className="inline-flex items-center gap-2 px-12 py-4 rounded-[14px] text-lg font-bold no-underline relative"
            style={{ background: 'linear-gradient(135deg, #6EE05A 0%, #4CAF3D 100%)', color: '#0B0F19', boxShadow: '0 0 50px rgba(126,217,87,0.3)' }}>
            Request Early Access
          </Link>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 text-center border-t border-border">
          <p className="text-xs text-white/25 m-0">
            &copy; {new Date().getFullYear()} RocketOpp, LLC. All rights reserved. 0nMCP is a product of RocketOpp.
          </p>
        </footer>
      </div>
    </>
  )
}
