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
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: `1px solid ${open ? cat.color + '44' : 'var(--border)'}`,
        borderRadius: 16,
        padding: '1.5rem',
        cursor: 'pointer',
        transition: 'border-color 0.25s, box-shadow 0.25s',
        boxShadow: open ? `0 0 30px ${cat.color}11` : 'none',
      }}
      onClick={() => setOpen(!open)}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: open ? '1rem' : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: cat.color + '15',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, color: cat.color,
            fontFamily: 'var(--font-mono)',
          }}>
            {cat.icon}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700 }}>{cat.name}</h3>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)' }}>{cat.count} tools</p>
          </div>
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          border: `1px solid ${cat.color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.875rem', color: cat.color,
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s',
        }}>
          v
        </div>
      </div>
      {!open && (
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
          {cat.desc}
        </p>
      )}
      {open && (
        <div>
          <p style={{ margin: '0 0 1rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
            {cat.desc}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
            {cat.tools.map((t) => (
              <span key={t} style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                padding: '0.25rem 0.625rem',
                borderRadius: 6,
                background: cat.color + '10',
                color: cat.color,
                border: `1px solid ${cat.color}22`,
                whiteSpace: 'nowrap',
              }}>
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
      style={{
        borderBottom: '1px solid var(--border)',
        padding: '1.25rem 0',
        cursor: 'pointer',
      }}
      onClick={() => setOpen(!open)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{item.q}</h3>
        <span style={{ color: '#6EE05A', fontSize: '1.25rem', flexShrink: 0, marginLeft: '1rem' }}>{open ? '-' : '+'}</span>
      </div>
      {open && (
        <p style={{ margin: '0.75rem 0 0', fontSize: '0.9375rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
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

      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "var(--font-display, 'Instrument Sans', system-ui, sans-serif)" }}>

        {/* ════════════════════════════════════════════
            HERO SECTION
            ════════════════════════════════════════════ */}
        <section style={{
          minHeight: '85vh',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '6rem 1.5rem 3rem',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Subtle radial glow */}
          <div style={{
            position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
            width: '800px', height: '800px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(126,217,87,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem', borderRadius: 100,
            background: 'rgba(126,217,87,0.08)', border: '1px solid rgba(126,217,87,0.2)',
            fontSize: '0.8125rem', fontWeight: 600, color: '#6EE05A',
            marginBottom: '2rem', position: 'relative',
          }}>
            The #1 CRM API Integration Platform
          </div>

          <h1 style={{
            fontSize: 'clamp(2.25rem, 6vw, 4.25rem)',
            fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05,
            margin: '0 0 1.25rem', maxWidth: '800px', position: 'relative',
          }}>
            Every CRM API Endpoint.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #6EE05A 0%, #4CAF3D 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              One Platform.
            </span>{' '}
            Zero Limitations.
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'rgba(255,255,255,0.55)', margin: '0 0 2.5rem',
            maxWidth: '640px', lineHeight: 1.6, position: 'relative',
          }}>
            Your CRM has {totalTools} API endpoints. Most users can access 10. 0nMCP unlocks all of
            them — contacts, pipelines, conversations, calendars, invoices, social posting, courses,
            and {totalTools - 10}+ more — through one natural language interface.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
            <Link href="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '1rem 2.25rem', borderRadius: 14,
              background: 'linear-gradient(135deg, #6EE05A 0%, #4CAF3D 100%)',
              color: '#0B0F19', fontSize: '1.0625rem', fontWeight: 700,
              textDecoration: 'none', boxShadow: '0 0 40px rgba(126,217,87,0.25)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}>
              Request Early Access
            </Link>
            <a href="#tools" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '1rem 2.25rem', borderRadius: 14,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-primary)', fontSize: '1.0625rem', fontWeight: 600,
              textDecoration: 'none', transition: 'border-color 0.2s',
            }}>
              See All {totalTools} Tools
            </a>
          </div>

          {/* Stats Bar */}
          <div style={{
            display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center',
            marginTop: '3.5rem', padding: '1.25rem 2rem',
            borderRadius: 14, background: 'rgba(255,255,255,0.02)',
            border: '1px solid var(--border)', position: 'relative',
          }}>
            {[
              { val: `${totalTools}`, label: 'CRM Tools' },
              { val: '12', label: 'Categories' },
              { val: 'MCP', label: 'Protocol' },
              { val: '7+', label: 'AI Platforms' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.375rem', fontWeight: 800, color: '#6EE05A' }}>{s.val}</div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.125rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            PROBLEM SECTION
            ════════════════════════════════════════════ */}
        <section style={{ padding: '5rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{
              fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: '#ef4444', marginBottom: '0.75rem',
            }}>
              The problem
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, margin: 0 }}>
              The CRM API Problem Everyone Knows
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
          }}>
            {painPoints.map((p) => (
              <div key={p.title} style={{
                padding: '1.5rem', borderRadius: 16,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: p.color, marginBottom: '1rem',
                  boxShadow: `0 0 12px ${p.color}44`,
                }} />
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: '0 0 0.5rem' }}>{p.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            SOLUTION SECTION
            ════════════════════════════════════════════ */}
        <section style={{ padding: '5rem 1.5rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: '#6EE05A', marginBottom: '0.75rem',
          }}>
            The solution
          </p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, margin: '0 0 1rem' }}>
            0nMCP: The Universal CRM API Layer
          </h2>
          <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.5)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
            One command. Any CRM action. AI handles the rest.
          </p>

          {/* Code example */}
          <div style={{
            textAlign: 'left', borderRadius: 16,
            background: 'var(--bg-primary)', border: '1px solid rgba(126,217,87,0.15)',
            overflow: 'hidden', maxWidth: '640px', margin: '0 auto',
          }}>
            <div style={{
              padding: '0.75rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6EE05A' }} />
              <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.3)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
                natural language
              </span>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{
                fontSize: '0.9375rem', color: 'rgba(255,255,255,0.8)',
                margin: '0 0 1.5rem', lineHeight: 1.6, fontStyle: 'italic',
              }}>
                &ldquo;Create a contact named Sarah Chen, add tag &apos;VIP&apos;,
                create an opportunity in the Sales pipeline,
                and send her a welcome email&rdquo;
              </p>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.875rem 1rem', borderRadius: 10,
                background: 'rgba(126,217,87,0.06)', border: '1px solid rgba(126,217,87,0.12)',
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: '#6EE05A', boxShadow: '0 0 8px rgba(126,217,87,0.5)',
                }} />
                <span style={{ fontSize: '0.875rem', fontFamily: 'var(--font-mono)', color: '#6EE05A' }}>
                  0nMCP executed 4 API calls in 2.1 seconds
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            THE 245 TOOLS SECTION
            ════════════════════════════════════════════ */}
        <section id="tools" style={{ padding: '5rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{
              fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: '#6EE05A', marginBottom: '0.75rem',
            }}>
              The showstopper
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, margin: '0 0 0.5rem' }}>
              {totalTools} CRM Tools Across 12 Categories
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              Click any category to see every tool available
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem',
          }}>
            {categories.map((cat) => (
              <CategoryCard key={cat.name} cat={cat} />
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            HOW IT WORKS
            ════════════════════════════════════════════ */}
        <section style={{ padding: '5rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{
              fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: '#00d4ff', marginBottom: '0.75rem',
            }}>
              Three integration methods
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, margin: 0 }}>
              Three Ways to Use 0nMCP with Your CRM
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}>
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
              <div key={m.num} style={{
                padding: '2rem 1.5rem', borderRadius: 16,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: '1rem', right: '1rem',
                  fontSize: '3rem', fontWeight: 900, color: m.color + '08',
                  fontFamily: 'var(--font-mono)', lineHeight: 1,
                }}>
                  {m.num}
                </div>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: m.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, color: m.color, fontFamily: 'var(--font-mono)',
                  marginBottom: '1rem',
                }}>
                  {m.num}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>{m.title}</h3>
                <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            WHAT YOU CAN BUILD
            ════════════════════════════════════════════ */}
        <section style={{ padding: '5rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{
              fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: '#a78bfa', marginBottom: '0.75rem',
            }}>
              Real use cases
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, margin: 0 }}>
              What CRM Users Are Building with 0nMCP
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
          }}>
            {useCases.map((uc) => (
              <div key={uc.title} style={{
                padding: '1.5rem', borderRadius: 16,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border)',
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  marginBottom: '0.75rem',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: uc.color, boxShadow: `0 0 12px ${uc.color}44`,
                    marginTop: '0.375rem',
                  }} />
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 600, color: uc.color,
                    padding: '0.25rem 0.625rem', borderRadius: 6,
                    background: uc.color + '10', border: `1px solid ${uc.color}22`,
                  }}>
                    {uc.price}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: '0 0 0.375rem' }}>{uc.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>{uc.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            COMPARISON TABLE
            ════════════════════════════════════════════ */}
        <section style={{ padding: '5rem 1.5rem', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{
              fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: '#fbbf24', marginBottom: '0.75rem',
            }}>
              The comparison
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, margin: 0 }}>
              0nMCP vs Building It Yourself
            </h2>
          </div>

          <div style={{
            borderRadius: 16, overflow: 'hidden',
            border: '1px solid var(--border)',
          }}>
            {/* Header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
              padding: '1rem 1.25rem', background: 'var(--bg-card)',
              borderBottom: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Feature</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>DIY</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6EE05A', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center' }}>0nMCP</span>
            </div>
            {comparisonRows.map((row, i) => (
              <div key={row.label} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                padding: '1rem 1.25rem',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                borderBottom: i < comparisonRows.length - 1 ? '1px solid var(--bg-card)' : 'none',
              }}>
                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>{row.label}</span>
                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>{row.diy}</span>
                <span style={{ fontSize: '0.875rem', color: '#6EE05A', textAlign: 'center', fontWeight: 600 }}>{row.onmcp}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════
            PRICING
            ════════════════════════════════════════════ */}
        <section style={{ padding: '5rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{
              fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: '#6EE05A', marginBottom: '0.75rem',
            }}>
              Pricing
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, margin: '0 0 0.5rem' }}>
              Simple Pricing. No Surprises.
            </h2>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
              1 Spark = 1 CRM API action = $0.01
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
          }}>
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
              <div key={plan.name} style={{
                padding: '2rem 1.5rem', borderRadius: 16,
                background: plan.highlight ? 'rgba(126,217,87,0.04)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${plan.highlight ? 'rgba(126,217,87,0.25)' : 'var(--border)'}`,
                position: 'relative',
              }}>
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: '-0.75rem', left: '50%', transform: 'translateX(-50%)',
                    padding: '0.25rem 1rem', borderRadius: 100,
                    background: 'linear-gradient(135deg, #6EE05A, #4CAF3D)',
                    fontSize: '0.6875rem', fontWeight: 700, color: '#0B0F19',
                    whiteSpace: 'nowrap',
                  }}>
                    Most Popular
                  </div>
                )}
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 0.25rem' }}>{plan.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', margin: '0 0 0.25rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: plan.highlight ? '#6EE05A' : '#fff' }}>{plan.price}</span>
                  <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)' }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 1.5rem' }}>{plan.desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem' }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{
                      fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)',
                      padding: '0.375rem 0',
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}>
                      <span style={{ color: '#6EE05A', fontWeight: 700, fontSize: '0.75rem' }}>+</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" style={{
                  display: 'block', textAlign: 'center',
                  padding: '0.75rem', borderRadius: 10,
                  background: plan.highlight ? 'linear-gradient(135deg, #6EE05A 0%, #4CAF3D 100%)' : 'var(--border)',
                  color: plan.highlight ? '#0B0F19' : '#fff',
                  fontSize: '0.9375rem', fontWeight: 700,
                  textDecoration: 'none', border: plan.highlight ? 'none' : '1px solid var(--border)',
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
        <section style={{ padding: '5rem 1.5rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{
            fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: '#00d4ff', marginBottom: '0.75rem',
          }}>
            Universal compatibility
          </p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, margin: '0 0 1rem' }}>
            Works with Every AI Platform
          </h2>
          <p style={{ fontSize: '1.0625rem', color: 'rgba(255,255,255,0.5)', marginBottom: '2rem', lineHeight: 1.6 }}>
            0nMCP speaks the Model Context Protocol. Any AI tool that supports MCP can access
            your CRM — Claude Desktop, Cursor, Windsurf, Gemini, Continue, Cline, and OpenAI.
          </p>

          {/* Platform pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
            {['Claude Desktop', 'Cursor', 'Windsurf', 'Gemini', 'Continue', 'Cline', 'OpenAI'].map((p) => (
              <span key={p} style={{
                padding: '0.5rem 1.125rem', borderRadius: 10,
                background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)',
                fontSize: '0.875rem', fontWeight: 600, color: '#00d4ff',
              }}>
                {p}
              </span>
            ))}
          </div>

          {/* MCP config example */}
          <div style={{
            textAlign: 'left', borderRadius: 16,
            background: 'var(--bg-primary)', border: '1px solid rgba(0,212,255,0.15)',
            overflow: 'hidden', maxWidth: '480px', margin: '0 auto',
          }}>
            <div style={{
              padding: '0.75rem 1.25rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fbbf24' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6EE05A' }} />
              <span style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.3)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
                mcp.json
              </span>
            </div>
            <pre style={{
              padding: '1.25rem', margin: 0,
              fontSize: '0.8125rem', lineHeight: 1.7,
              fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.7)',
              overflow: 'auto',
            }}>
{`{
  "0nMCP": {
    "command": "npx",
    "args": ["0nmcp"]
  }
}`}
            </pre>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.3)', marginTop: '1rem' }}>
            That is it. One config. {totalTools} CRM tools in your AI.
          </p>
        </section>

        {/* ════════════════════════════════════════════
            SSO / MARKETPLACE INSTALL
            ════════════════════════════════════════════ */}
        <section style={{
          padding: '3rem 1.5rem', maxWidth: '700px', margin: '0 auto', textAlign: 'center',
        }}>
          <div style={{
            padding: '2rem', borderRadius: 16,
            background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)',
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
              Already use the CRM?
            </h3>
            <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
              Sign in with your CRM account for instant setup. Or install directly from the CRM Marketplace
              for one-click activation across all your locations.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login" style={{
                padding: '0.75rem 1.5rem', borderRadius: 10,
                background: 'var(--border)', border: '1px solid var(--border)',
                color: 'var(--text-primary)', fontSize: '0.9375rem', fontWeight: 600,
                textDecoration: 'none',
              }}>
                Sign in with CRM
              </Link>
              <Link href="/connect" style={{
                padding: '0.75rem 1.5rem', borderRadius: 10,
                background: 'rgba(126,217,87,0.08)', border: '1px solid rgba(126,217,87,0.2)',
                color: '#6EE05A', fontSize: '0.9375rem', fontWeight: 600,
                textDecoration: 'none',
              }}>
                CRM Marketplace Install
              </Link>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            FAQ
            ════════════════════════════════════════════ */}
        <section style={{ padding: '5rem 1.5rem', maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <p style={{
              fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: '#6EE05A', marginBottom: '0.75rem',
            }}>
              FAQ
            </p>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, margin: 0 }}>
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
        <section style={{
          padding: '6rem 1.5rem', textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', bottom: '-30%', left: '50%', transform: 'translateX(-50%)',
            width: '600px', height: '600px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(126,217,87,0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <h2 style={{
            fontSize: 'clamp(1.75rem, 5vw, 2.75rem)',
            fontWeight: 800, letterSpacing: '-0.02em',
            margin: '0 0 1rem', position: 'relative',
          }}>
            Your CRM. Unlimited API Access.{' '}
            <span style={{
              background: 'linear-gradient(135deg, #6EE05A 0%, #4CAF3D 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Start Free.
            </span>
          </h2>
          <p style={{
            fontSize: '1.0625rem', color: 'rgba(255,255,255,0.5)',
            margin: '0 0 2.5rem', position: 'relative',
          }}>
            100 Sparks. No credit card. No commitment.
          </p>
          <Link href="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '1rem 3rem', borderRadius: 14,
            background: 'linear-gradient(135deg, #6EE05A 0%, #4CAF3D 100%)',
            color: '#0B0F19', fontSize: '1.125rem', fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 0 50px rgba(126,217,87,0.3)',
            position: 'relative',
          }}>
            Request Early Access
          </Link>
        </section>

        {/* ── Footer ── */}
        <footer style={{
          padding: '2rem 1.5rem', textAlign: 'center',
          borderTop: '1px solid var(--border)',
        }}>
          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', margin: 0 }}>
            &copy; {new Date().getFullYear()} RocketOpp, LLC. All rights reserved. 0nMCP is a product of RocketOpp.
          </p>
        </footer>
      </div>
    </>
  )
}
