#!/usr/bin/env node
/**
 * Seed 6 Chrome extension module listings into the store.
 * Run: node scripts/seed-extension-modules.mjs
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// Load .env.local manually
const envFile = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

const modules = [
  {
    title: 'Social Poster',
    slug: 'social-poster',
    description: 'Post to LinkedIn, Reddit, and Dev.to from any page. Right-click any text to share instantly across your connected platforms.',
    price: 500, // $5.00 in cents
    tags: ['social', 'linkedin', 'reddit', 'devto', 'sharing'],
    workflow_data: {
      $0n: {
        type: 'extension',
        module_id: 'social-poster',
        version: '1.0.0',
        permissions: ['social_post', 'page_context'],
      },
      features: ['linkedin_post', 'reddit_post', 'devto_post'],
      context_menu_items: [
        { id: '0nmcp-share-linkedin', title: 'Share to LinkedIn', contexts: ['selection', 'page'] },
        { id: '0nmcp-share-reddit', title: 'Share to Reddit', contexts: ['selection', 'page'] },
        { id: '0nmcp-share-devto', title: 'Share to Dev.to', contexts: ['selection', 'page'] },
      ],
      side_panel_actions: ['compose_post', 'select_platforms', 'preview_post'],
    },
  },
  {
    title: 'Content Writer',
    slug: 'content-writer',
    description: 'AI-generate platform-specific posts from any page content. Turn articles, products, and web pages into ready-to-publish social content.',
    price: 500, // $5.00
    tags: ['ai', 'writing', 'content', 'social', 'generation'],
    workflow_data: {
      $0n: {
        type: 'extension',
        module_id: 'content-writer',
        version: '1.0.0',
        permissions: ['ai_generate', 'page_context'],
      },
      features: ['generate_linkedin', 'generate_reddit', 'generate_devto', 'generate_twitter'],
      context_menu_items: [
        { id: '0nmcp-write-post', title: 'Generate post from this page', contexts: ['page'] },
        { id: '0nmcp-write-from-selection', title: 'Generate post from selection', contexts: ['selection'] },
      ],
      side_panel_actions: ['generate_content', 'select_platform', 'edit_draft'],
    },
  },
  {
    title: 'CRM Bridge',
    slug: 'crm-bridge',
    description: 'Send contacts, notes, and data to your CRM from any page. Extract contact info and push it directly to your CRM with one click.',
    price: 1000, // $10.00
    tags: ['crm', 'contacts', 'lead', 'data', 'integration'],
    workflow_data: {
      $0n: {
        type: 'extension',
        module_id: 'crm-bridge',
        version: '1.0.0',
        permissions: ['crm_write', 'page_context', 'contacts'],
      },
      features: ['create_contact', 'add_note', 'extract_contact'],
      context_menu_items: [
        { id: '0nmcp-crm-contact', title: 'Create CRM contact from page', contexts: ['page'] },
        { id: '0nmcp-crm-note', title: 'Send to CRM as note', contexts: ['selection'] },
      ],
      side_panel_actions: ['create_contact', 'add_note', 'search_contacts'],
    },
  },
  {
    title: 'Page Scraper',
    slug: 'page-scraper',
    description: 'Extract structured data from any page — contacts, emails, prices, links. Get clean JSON output from messy web pages.',
    price: 0, // Free
    tags: ['scraper', 'data', 'extraction', 'contacts', 'emails'],
    workflow_data: {
      $0n: {
        type: 'extension',
        module_id: 'page-scraper',
        version: '1.0.0',
        permissions: ['page_context', 'data_extraction'],
      },
      features: ['extract_contacts', 'extract_structured', 'extract_prices', 'extract_links'],
      context_menu_items: [
        { id: '0nmcp-scrape-contacts', title: 'Extract contacts from page', contexts: ['page'] },
        { id: '0nmcp-scrape-data', title: 'Extract structured data', contexts: ['page'] },
      ],
      side_panel_actions: ['scrape_contacts', 'scrape_structured', 'scrape_prices'],
    },
  },
  {
    title: 'Workflow Runner',
    slug: 'workflow-runner',
    description: 'Trigger your .0n workflows from the browser toolbar. Connect to your local 0nMCP server and execute automations from any page.',
    price: 0, // Free
    tags: ['workflow', 'automation', '0n', 'runner', 'local'],
    workflow_data: {
      $0n: {
        type: 'extension',
        module_id: 'workflow-runner',
        version: '1.0.0',
        permissions: ['workflow_execute', 'local_server'],
      },
      features: ['list_workflows', 'run_workflow', 'workflow_status'],
      context_menu_items: [
        { id: '0nmcp-run-workflow', title: 'Run workflow...', contexts: ['page'] },
      ],
      side_panel_actions: ['list_workflows', 'run_workflow', 'view_results'],
    },
  },
  {
    title: 'SEO Analyzer',
    slug: 'seo-analyzer',
    description: 'Instant SEO audit of any page with actionable recommendations. Check title tags, meta descriptions, headings, and content quality.',
    price: 0, // Free
    tags: ['seo', 'analysis', 'audit', 'marketing', 'optimization'],
    workflow_data: {
      $0n: {
        type: 'extension',
        module_id: 'seo-analyzer',
        version: '1.0.0',
        permissions: ['page_context', 'seo_analysis'],
      },
      features: ['full_audit', 'title_check', 'meta_check', 'heading_analysis', 'content_score'],
      context_menu_items: [
        { id: '0nmcp-seo-audit', title: 'SEO audit this page', contexts: ['page'] },
      ],
      side_panel_actions: ['run_audit', 'view_report', 'export_report'],
    },
  },
]

async function seed() {
  console.log('Seeding 6 extension module listings...\n')

  for (const mod of modules) {
    // Check if already exists
    const { data: existing } = await supabase
      .from('store_listings')
      .select('id')
      .eq('slug', mod.slug)
      .maybeSingle()

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('store_listings')
        .update({
          title: mod.title,
          description: mod.description,
          category: 'extensions',
          tags: mod.tags,
          price: mod.price,
          currency: 'usd',
          workflow_data: mod.workflow_data,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)

      if (error) {
        console.error(`  FAIL updating "${mod.title}":`, error.message)
      } else {
        console.log(`  Updated: ${mod.title} (${mod.slug}) — $${(mod.price / 100).toFixed(2)}`)
      }
    } else {
      // Insert new
      const { error } = await supabase.from('store_listings').insert({
        title: mod.title,
        slug: mod.slug,
        description: mod.description,
        category: 'extensions',
        tags: mod.tags,
        price: mod.price,
        currency: 'usd',
        workflow_data: mod.workflow_data,
        status: 'active',
        total_purchases: 0,
      })

      if (error) {
        console.error(`  FAIL inserting "${mod.title}":`, error.message)
      } else {
        console.log(`  Created: ${mod.title} (${mod.slug}) — $${(mod.price / 100).toFixed(2)}`)
      }
    }
  }

  console.log('\nDone! Extension modules seeded.')
}

seed().catch(console.error)
