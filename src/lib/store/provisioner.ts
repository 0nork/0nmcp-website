// ============================================================================
// 0nMCP STORE - PROVISIONING QUEUE SYSTEM
// server/provisioner.ts
// 
// Handles async provisioning of services via GHL reselling APIs
// ============================================================================

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================================================================
// TYPES
// ============================================================================

interface ProvisioningTask {
  id: string
  subscription_id: string
  task_type: 'provision' | 'deprovision' | 'update' | 'sync'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  priority: number
  attempts: number
  max_attempts: number
  config: ProvisioningConfig
  result?: Record<string, any>
  last_error?: string
}

interface ProvisioningConfig {
  product_slug: string
  provisioning_type: 'ghl' | 'direct' | 'hybrid' | 'package'
  provisioning_config: {
    service?: string
    tier?: string
    plan?: string
    quantity?: number
    includes?: string[]
    via?: string
  }
}

interface GHLTokens {
  access_token: string
  refresh_token: string
  expires_at: number
}

interface SubscriptionDetails {
  id: string
  customer_id: string
  product_id: string
  provisioning_data: Record<string, any>
  customer: {
    business_name: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
    ghl_location_id: string
  }
}

// ============================================================================
// GHL API CLIENT
// ============================================================================

class GHLClient {
  private baseUrl = 'https://services.leadconnectorhq.com'
  private agencyId: string
  private tokens: GHLTokens | null = null

  constructor() {
    this.agencyId = process.env.GHL_AGENCY_ID!
  }

  /**
   * Get valid access token (refresh if needed)
   */
  private async getAccessToken(): Promise<string> {
    // In production, store tokens in DB and refresh as needed
    // For now, use the stored tokens
    if (!this.tokens || Date.now() > this.tokens.expires_at - 300000) {
      await this.refreshTokens()
    }
    return this.tokens!.access_token
  }

  private async refreshTokens(): Promise<void> {
    const response = await fetch('https://services.leadconnectorhq.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.GHL_CLIENT_ID!,
        client_secret: process.env.GHL_CLIENT_SECRET!,
        refresh_token: process.env.GHL_REFRESH_TOKEN!
      })
    })

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`)
    }

    const data = await response.json()
    this.tokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in * 1000)
    }
  }

  /**
   * Create a new GHL location (sub-account) for a customer
   */
  async createLocation(businessInfo: {
    name: string
    address: string
    city: string
    state: string
    zip: string
    phone: string
    email: string
  }): Promise<string> {
    const token = await this.getAccessToken()

    const response = await fetch(`${this.baseUrl}/locations/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28'
      },
      body: JSON.stringify({
        companyId: this.agencyId,
        name: businessInfo.name,
        address: businessInfo.address,
        city: businessInfo.city,
        state: businessInfo.state,
        postalCode: businessInfo.zip,
        phone: businessInfo.phone,
        email: businessInfo.email,
        country: 'US',
        timezone: 'America/New_York'
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create location: ${error}`)
    }

    const data = await response.json()
    return data.location.id
  }

  /**
   * Enable Yext/Listings for a location
   */
  async enableYext(
    locationId: string,
    tier: 'essential' | 'standard' | 'premium',
    businessData: Record<string, any>
  ): Promise<{ success: boolean; yextAccountId?: string }> {
    const token = await this.getAccessToken()

    // GHL Yext reselling endpoint
    const response = await fetch(
      `${this.baseUrl}/locations/${locationId}/yext/activate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          tier: tier,
          businessInfo: {
            name: businessData.name,
            address: businessData.address,
            city: businessData.city,
            state: businessData.state,
            zip: businessData.zip,
            phone: businessData.phone,
            categories: businessData.categories || ['General'],
            description: businessData.description || ''
          }
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Yext activation failed:', error)
      return { success: false }
    }

    const data = await response.json()
    return {
      success: true,
      yextAccountId: data.yextAccountId
    }
  }

  /**
   * Enable WordPress hosting for a location
   */
  async enableWordPress(
    locationId: string,
    plan: 'standard' | 'pro',
    domain?: string
  ): Promise<{ success: boolean; siteId?: string; adminUrl?: string }> {
    const token = await this.getAccessToken()

    const response = await fetch(
      `${this.baseUrl}/locations/${locationId}/wordpress/activate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          plan: plan,
          domain: domain
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('WordPress activation failed:', error)
      return { success: false }
    }

    const data = await response.json()
    return {
      success: true,
      siteId: data.siteId,
      adminUrl: data.adminUrl
    }
  }

  /**
   * Enable WhatsApp for a location
   */
  async enableWhatsApp(
    locationId: string,
    phoneNumber: string
  ): Promise<{ success: boolean; wabaId?: string }> {
    const token = await this.getAccessToken()

    const response = await fetch(
      `${this.baseUrl}/locations/${locationId}/whatsapp/activate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('WhatsApp activation failed:', error)
      return { success: false }
    }

    const data = await response.json()
    return {
      success: true,
      wabaId: data.wabaId
    }
  }

  /**
   * Enable AI Employee for a location
   */
  async enableAIEmployee(
    locationId: string,
    plan: 'usage' | 'unlimited'
  ): Promise<{ success: boolean }> {
    const token = await this.getAccessToken()

    const response = await fetch(
      `${this.baseUrl}/locations/${locationId}/ai-employee/activate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        },
        body: JSON.stringify({
          plan: plan
        })
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('AI Employee activation failed:', error)
      return { success: false }
    }

    return { success: true }
  }

  /**
   * Disable a service for a location
   */
  async disableService(
    locationId: string,
    service: 'yext' | 'wordpress' | 'whatsapp' | 'ai-employee'
  ): Promise<{ success: boolean }> {
    const token = await this.getAccessToken()

    const response = await fetch(
      `${this.baseUrl}/locations/${locationId}/${service}/deactivate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28'
        }
      }
    )

    return { success: response.ok }
  }
}

const ghlClient = new GHLClient()

// ============================================================================
// PROVISIONING HANDLERS
// ============================================================================

/**
 * Get subscription details including customer info
 */
async function getSubscriptionDetails(subscriptionId: string): Promise<SubscriptionDetails | null> {
  const { data, error } = await supabase
    .from('store_subscriptions')
    .select(`
      id,
      customer_id,
      product_id,
      provisioning_data,
      customer:store_customers (
        business_name,
        address,
        city,
        state,
        zip,
        phone,
        ghl_location_id
      )
    `)
    .eq('id', subscriptionId)
    .single()

  if (error || !data) {
    console.error('Failed to get subscription details:', error)
    return null
  }

  return data as unknown as SubscriptionDetails
}

/**
 * Ensure customer has a GHL location
 */
async function ensureGHLLocation(sub: SubscriptionDetails): Promise<string> {
  if (sub.customer.ghl_location_id) {
    return sub.customer.ghl_location_id
  }

  // Create new location
  const locationId = await ghlClient.createLocation({
    name: sub.customer.business_name,
    address: sub.customer.address,
    city: sub.customer.city,
    state: sub.customer.state,
    zip: sub.customer.zip,
    phone: sub.customer.phone,
    email: '' // Get from user record
  })

  // Update customer with location ID
  await supabase
    .from('store_customers')
    .update({ ghl_location_id: locationId })
    .eq('id', sub.customer_id)

  return locationId
}

/**
 * Provision Yext service
 */
async function provisionYext(
  task: ProvisioningTask,
  sub: SubscriptionDetails,
  locationId: string
): Promise<Record<string, any>> {
  const tier = task.config.provisioning_config.tier as 'essential' | 'standard' | 'premium'

  const result = await ghlClient.enableYext(locationId, tier, {
    name: sub.customer.business_name,
    address: sub.customer.address,
    city: sub.customer.city,
    state: sub.customer.state,
    zip: sub.customer.zip,
    phone: sub.customer.phone
  })

  if (!result.success) {
    throw new Error('Failed to enable Yext')
  }

  // Create Yext account record
  await supabase.from('store_yext_accounts').insert({
    subscription_id: sub.id,
    ghl_location_id: locationId,
    tier: tier,
    business_data: {
      name: sub.customer.business_name,
      address: sub.customer.address,
      city: sub.customer.city,
      state: sub.customer.state,
      zip: sub.customer.zip,
      phone: sub.customer.phone
    },
    sync_status: 'syncing'
  })

  return {
    service: 'yext',
    tier: tier,
    yextAccountId: result.yextAccountId,
    ghl_location_id: locationId
  }
}

/**
 * Provision WordPress hosting
 */
async function provisionWordPress(
  task: ProvisioningTask,
  sub: SubscriptionDetails,
  locationId: string
): Promise<Record<string, any>> {
  const plan = task.config.provisioning_config.plan as 'standard' | 'pro'

  const result = await ghlClient.enableWordPress(locationId, plan)

  if (!result.success) {
    throw new Error('Failed to enable WordPress')
  }

  // Create WordPress site record
  await supabase.from('store_wordpress_sites').insert({
    subscription_id: sub.id,
    ghl_location_id: locationId,
    ghl_website_id: result.siteId,
    plan: plan,
    wp_admin_url: result.adminUrl,
    status: 'provisioning'
  })

  return {
    service: 'wordpress',
    plan: plan,
    siteId: result.siteId,
    adminUrl: result.adminUrl,
    ghl_location_id: locationId
  }
}

/**
 * Provision WhatsApp
 */
async function provisionWhatsApp(
  task: ProvisioningTask,
  sub: SubscriptionDetails,
  locationId: string
): Promise<Record<string, any>> {
  const phoneNumber = sub.customer.phone

  const result = await ghlClient.enableWhatsApp(locationId, phoneNumber)

  if (!result.success) {
    throw new Error('Failed to enable WhatsApp')
  }

  // Create WhatsApp connection record
  await supabase.from('store_whatsapp_connections').insert({
    subscription_id: sub.id,
    ghl_location_id: locationId,
    phone_number: phoneNumber,
    display_name: sub.customer.business_name,
    status: 'connecting'
  })

  return {
    service: 'whatsapp',
    wabaId: result.wabaId,
    phoneNumber: phoneNumber,
    ghl_location_id: locationId
  }
}

/**
 * Provision AI Employee
 */
async function provisionAIEmployee(
  task: ProvisioningTask,
  sub: SubscriptionDetails,
  locationId: string
): Promise<Record<string, any>> {
  const result = await ghlClient.enableAIEmployee(locationId, 'unlimited')

  if (!result.success) {
    throw new Error('Failed to enable AI Employee')
  }

  return {
    service: 'ai_employee',
    plan: 'unlimited',
    ghl_location_id: locationId
  }
}

/**
 * Provision a package (multiple services)
 */
async function provisionPackage(
  task: ProvisioningTask,
  sub: SubscriptionDetails,
  locationId: string
): Promise<Record<string, any>> {
  const includes = task.config.provisioning_config.includes || []
  const results: Record<string, any> = {
    service: 'package',
    ghl_location_id: locationId,
    services: {}
  }

  for (const productSlug of includes) {
    try {
      // Get product config
      const { data: product } = await supabase
        .from('store_products')
        .select('provisioning_config')
        .eq('slug', productSlug)
        .single()

      if (!product) continue

      const config = product.provisioning_config as Record<string, any>
      const service = config.service

      switch (service) {
        case 'yext':
          const yextResult = await ghlClient.enableYext(
            locationId,
            config.tier,
            {
              name: sub.customer.business_name,
              address: sub.customer.address,
              city: sub.customer.city,
              state: sub.customer.state,
              zip: sub.customer.zip,
              phone: sub.customer.phone
            }
          )
          results.services.yext = { success: yextResult.success, tier: config.tier }
          break

        case 'wordpress':
          const wpResult = await ghlClient.enableWordPress(locationId, config.plan || 'standard')
          results.services.wordpress = { success: wpResult.success, plan: config.plan }
          break

        case 'whatsapp':
          const waResult = await ghlClient.enableWhatsApp(locationId, sub.customer.phone)
          results.services.whatsapp = { success: waResult.success }
          break

        case 'ai_employee':
          const aiResult = await ghlClient.enableAIEmployee(locationId, config.plan || 'unlimited')
          results.services.ai_employee = { success: aiResult.success }
          break

        // SMS and email are usage-based, no provisioning needed
        case 'sms':
        case 'email':
          results.services[service] = { success: true, quantity: config.quantity }
          break
      }
    } catch (err) {
      console.error(`Failed to provision ${productSlug}:`, err)
      results.services[productSlug] = { success: false, error: (err as Error).message }
    }
  }

  return results
}

/**
 * Main provisioning handler
 */
async function processProvisioningTask(task: ProvisioningTask): Promise<void> {
  console.log(`Processing task ${task.id}: ${task.task_type} for ${task.config.product_slug}`)

  // Mark as processing
  await supabase
    .from('store_provisioning_queue')
    .update({
      status: 'processing',
      started_at: new Date().toISOString(),
      attempts: task.attempts + 1
    })
    .eq('id', task.id)

  try {
    // Get subscription details
    const sub = await getSubscriptionDetails(task.subscription_id)
    if (!sub) {
      throw new Error('Subscription not found')
    }

    let result: Record<string, any>

    if (task.task_type === 'provision') {
      // Ensure GHL location exists
      const locationId = await ensureGHLLocation(sub)

      // Route to appropriate handler based on provisioning type
      const provType = task.config.provisioning_type
      const service = task.config.provisioning_config.service

      if (provType === 'package') {
        result = await provisionPackage(task, sub, locationId)
      } else if (provType === 'ghl') {
        switch (service) {
          case 'yext':
            result = await provisionYext(task, sub, locationId)
            break
          case 'wordpress':
            result = await provisionWordPress(task, sub, locationId)
            break
          case 'whatsapp':
            result = await provisionWhatsApp(task, sub, locationId)
            break
          case 'ai_employee':
            result = await provisionAIEmployee(task, sub, locationId)
            break
          default:
            // For SMS, email packs - just mark as provisioned (usage-based)
            result = {
              service: service,
              ghl_location_id: locationId,
              note: 'Usage-based service, no activation required'
            }
        }
      } else {
        throw new Error(`Unknown provisioning type: ${provType}`)
      }

      // Update subscription with provisioning data
      await supabase
        .from('store_subscriptions')
        .update({
          provisioning_status: 'completed',
          provisioning_data: result
        })
        .eq('id', task.subscription_id)

    } else if (task.task_type === 'deprovision') {
      // Handle deprovisioning
      const provData = sub.provisioning_data
      const locationId = provData?.ghl_location_id

      if (locationId) {
        const service = task.config.provisioning_config.service
        if (service) {
          await ghlClient.disableService(locationId, service as any)
        }
      }

      result = { deprovisioned: true }

      await supabase
        .from('store_subscriptions')
        .update({ provisioning_status: 'deprovisioning' })
        .eq('id', task.subscription_id)
    } else {
      result = { task_type: task.task_type, note: 'Not implemented' }
    }

    // Mark task as completed
    await supabase
      .from('store_provisioning_queue')
      .update({
        status: 'completed',
        result: result,
        completed_at: new Date().toISOString()
      })
      .eq('id', task.id)

    console.log(`Task ${task.id} completed successfully`)

  } catch (error: any) {
    console.error(`Task ${task.id} failed:`, error)

    const newStatus = task.attempts + 1 >= task.max_attempts ? 'failed' : 'pending'

    await supabase
      .from('store_provisioning_queue')
      .update({
        status: newStatus,
        last_error: error.message,
        // Retry with exponential backoff
        scheduled_at: newStatus === 'pending'
          ? new Date(Date.now() + Math.pow(2, task.attempts) * 60000).toISOString()
          : undefined
      })
      .eq('id', task.id)

    // If final failure, update subscription status
    if (newStatus === 'failed') {
      await supabase
        .from('store_subscriptions')
        .update({ provisioning_status: 'failed' })
        .eq('id', task.subscription_id)

      // TODO: Send failure notification to customer
    }
  }
}

// ============================================================================
// QUEUE WORKER
// ============================================================================

/**
 * Process pending tasks from the queue
 * Run this on a schedule (e.g., every minute via cron)
 */
export async function processQueue(batchSize: number = 10): Promise<number> {
  // Get pending tasks ordered by priority and schedule time
  const { data: tasks, error } = await supabase
    .from('store_provisioning_queue')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_at', new Date().toISOString())
    .order('priority', { ascending: true })
    .order('scheduled_at', { ascending: true })
    .limit(batchSize)

  if (error || !tasks?.length) {
    return 0
  }

  console.log(`Processing ${tasks.length} provisioning tasks`)

  // Process tasks (could be parallelized with Promise.all for independent tasks)
  for (const task of tasks) {
    await processProvisioningTask(task as ProvisioningTask)
  }

  return tasks.length
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  pending: number
  processing: number
  completed: number
  failed: number
}> {
  const { data, error } = await supabase
    .from('store_provisioning_queue')
    .select('status')

  if (error || !data) {
    return { pending: 0, processing: 0, completed: 0, failed: 0 }
  }

  return {
    pending: data.filter(t => t.status === 'pending').length,
    processing: data.filter(t => t.status === 'processing').length,
    completed: data.filter(t => t.status === 'completed').length,
    failed: data.filter(t => t.status === 'failed').length
  }
}

/**
 * Retry failed tasks
 */
export async function retryFailedTasks(subscriptionId?: string): Promise<number> {
  let query = supabase
    .from('store_provisioning_queue')
    .update({
      status: 'pending',
      attempts: 0,
      last_error: null,
      scheduled_at: new Date().toISOString()
    })
    .eq('status', 'failed')

  if (subscriptionId) {
    query = query.eq('subscription_id', subscriptionId)
  }

  const { data, error } = await query.select('id')

  if (error) {
    console.error('Failed to retry tasks:', error)
    return 0
  }

  return data?.length || 0
}

// ============================================================================
// API ROUTE HANDLERS (for Next.js)
// ============================================================================

/**
 * Cron endpoint to process queue
 * Call via: GET /api/cron/provision
 */
export async function handleCronProvision(req: Request): Promise<Response> {
  // Verify cron secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const processed = await processQueue()
  return Response.json({ processed })
}

/**
 * Manual provision endpoint (for admin)
 * POST /api/admin/provision
 */
export async function handleManualProvision(
  subscriptionId: string
): Promise<{ success: boolean; error?: string }> {
  // Queue a new provision task
  const { data: sub } = await supabase
    .from('store_subscriptions')
    .select('product_id')
    .eq('id', subscriptionId)
    .single()

  if (!sub) {
    return { success: false, error: 'Subscription not found' }
  }

  const { data: product } = await supabase
    .from('store_products')
    .select('slug, provisioning_type, provisioning_config')
    .eq('id', sub.product_id)
    .single()

  if (!product) {
    return { success: false, error: 'Product not found' }
  }

  await supabase.from('store_provisioning_queue').insert({
    subscription_id: subscriptionId,
    task_type: 'provision',
    status: 'pending',
    priority: 1, // High priority for manual
    config: {
      product_slug: product.slug,
      provisioning_type: product.provisioning_type,
      provisioning_config: product.provisioning_config
    }
  })

  return { success: true }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  ghlClient,
  processProvisioningTask,
  getSubscriptionDetails
}
