// ============================================================================
// 0nMCP STORE - MCP TOOL DEFINITIONS
// server/mcp-tools.ts
// 
// Tool handlers for ChatGPT Apps SDK / MCP protocol
// These are called by the model when users interact with the store
// ============================================================================

import { createClient } from '@supabase/supabase-js'
import { processPurchase, getUserSubscriptions, cancelSubscription, getUsageSummary } from './stripe'
import { handleManualProvision, retryFailedTasks } from './provisioner'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================================================================
// TYPES
// ============================================================================

interface MCPToolCall {
  name: string
  arguments: Record<string, any>
}

interface MCPToolResult {
  content: Array<{
    type: 'text' | 'resource'
    text?: string
    resource?: any
  }>
  structuredContent?: Record<string, any>
  isError?: boolean
  _meta?: {
    ui?: {
      view?: string
    }
  }
}

interface AuthContext {
  userId: string
  email: string
  isAuthenticated: boolean
}

// ============================================================================
// TOOL HANDLERS
// ============================================================================

/**
 * Browse store products and packages
 */
async function browseStore(
  args: { category?: string; priceRange?: string },
  auth: AuthContext
): Promise<MCPToolResult> {
  // Get packages
  const { data: packages } = await supabase
    .from('store_products')
    .select('*')
    .eq('category', 'package')
    .eq('is_active', true)
    .order('display_order')

  // Get à la carte products
  let productsQuery = supabase
    .from('store_products')
    .select('*')
    .neq('category', 'package')
    .eq('is_active', true)
    .order('display_order')

  if (args.category) {
    productsQuery = productsQuery.eq('category', args.category)
  }

  const { data: products } = await productsQuery

  // Apply price range filter if specified
  let filteredProducts = products || []
  if (args.priceRange) {
    const ranges: Record<string, [number, number]> = {
      budget: [0, 50],
      standard: [50, 150],
      premium: [150, Infinity]
    }
    const [min, max] = ranges[args.priceRange] || [0, Infinity]
    filteredProducts = filteredProducts.filter(
      p => p.price_monthly >= min && p.price_monthly < max
    )
  }

  return {
    content: [{
      type: 'text',
      text: `Found ${packages?.length || 0} packages and ${filteredProducts.length} products`
    }],
    structuredContent: {
      packages: packages?.map(p => ({
        id: p.id,
        name: p.name,
        tagline: p.tagline,
        icon: p.icon,
        priceMonthly: p.price_monthly,
        priceAnnual: p.price_annual,
        features: p.features,
        featured: p.is_featured
      })),
      products: filteredProducts.map(p => ({
        id: p.id,
        name: p.name,
        desc: p.tagline,
        icon: p.icon,
        price: p.price_monthly,
        category: p.category
      }))
    },
    _meta: { ui: { view: 'store' } }
  }
}

/**
 * Get detailed pricing for a product
 */
async function getPricing(
  args: { product: string; billing?: string },
  auth: AuthContext
): Promise<MCPToolResult> {
  const { data: product } = await supabase
    .from('store_products')
    .select('*')
    .or(`id.eq.${args.product},slug.eq.${args.product},name.ilike.%${args.product}%`)
    .eq('is_active', true)
    .single()

  if (!product) {
    return {
      content: [{ type: 'text', text: `Product "${args.product}" not found` }],
      structuredContent: { error: 'Product not found' },
      isError: true
    }
  }

  const monthlyPrice = product.price_monthly
  const annualPrice = product.price_annual || monthlyPrice * 10
  const savings = (monthlyPrice * 12) - annualPrice

  return {
    content: [{
      type: 'text',
      text: `${product.name}: $${monthlyPrice}/month or $${annualPrice}/year (save $${savings})`
    }],
    structuredContent: {
      product: {
        id: product.id,
        name: product.name,
        slug: product.slug,
        icon: product.icon,
        description: product.tagline,
        features: product.features
      },
      pricing: {
        monthly: monthlyPrice,
        annual: annualPrice,
        annualSavings: savings,
        currency: 'USD'
      }
    }
  }
}

/**
 * Compare multiple packages
 */
async function comparePackages(
  args: { packages: string[] },
  auth: AuthContext
): Promise<MCPToolResult> {
  const { data: packages } = await supabase
    .from('store_products')
    .select('*')
    .eq('category', 'package')
    .in('slug', args.packages)
    .eq('is_active', true)
    .order('price_monthly')

  if (!packages?.length) {
    return {
      content: [{ type: 'text', text: 'No packages found for comparison' }],
      structuredContent: { error: 'No packages found' },
      isError: true
    }
  }

  const comparison = packages.map(p => ({
    name: p.name,
    price: `$${p.price_monthly}/mo`,
    features: p.features,
    featured: p.is_featured
  }))

  return {
    content: [{
      type: 'text',
      text: `Comparing ${packages.length} packages: ${packages.map(p => p.name).join(', ')}`
    }],
    structuredContent: {
      comparison,
      recommendation: packages.find(p => p.is_featured)?.name || packages[1]?.name
    }
  }
}

/**
 * Purchase a product
 */
async function purchaseProduct(
  args: {
    productId: string
    productType: 'package' | 'product'
    billing: 'monthly' | 'annual'
    paymentMethodId: string
    businessInfo: {
      businessName: string
      email: string
      address?: string
      city?: string
      state?: string
      zip?: string
      phone?: string
    }
  },
  auth: AuthContext
): Promise<MCPToolResult> {
  if (!auth.isAuthenticated) {
    return {
      content: [{ type: 'text', text: 'Please log in to make a purchase' }],
      structuredContent: { error: 'Authentication required' },
      isError: true,
      _meta: { ui: { view: 'connect' } }
    }
  }

  const result = await processPurchase({
    userId: auth.userId,
    productId: args.productId,
    productType: args.productType,
    billing: args.billing,
    paymentMethodId: args.paymentMethodId,
    businessInfo: args.businessInfo
  })

  if (!result.success) {
    return {
      content: [{ type: 'text', text: `Purchase failed: ${result.error}` }],
      structuredContent: { error: result.error },
      isError: true
    }
  }

  return {
    content: [{
      type: 'text',
      text: `Purchase successful! Subscription ID: ${result.subscriptionId}`
    }],
    structuredContent: {
      subscriptionId: result.subscriptionId,
      stripeSubscriptionId: result.stripeSubscriptionId,
      status: result.status
    },
    _meta: { ui: { view: 'success' } }
  }
}

/**
 * Set up Yext for a business (convenience wrapper)
 */
async function setupYext(
  args: {
    tier: 'essential' | 'standard' | 'premium'
    businessInfo: {
      name: string
      address: string
      city: string
      state: string
      zip: string
      phone: string
      categories?: string[]
      hours?: Record<string, any>
      description?: string
    }
  },
  auth: AuthContext
): Promise<MCPToolResult> {
  // Map tier to product slug
  const tierMap: Record<string, string> = {
    essential: 'yext-essential',
    standard: 'yext-standard',
    premium: 'yext-premium'
  }

  const { data: product } = await supabase
    .from('store_products')
    .select('id, name, price_monthly, price_annual')
    .eq('slug', tierMap[args.tier])
    .single()

  if (!product) {
    return {
      content: [{ type: 'text', text: `Yext ${args.tier} plan not found` }],
      structuredContent: { error: 'Product not found' },
      isError: true
    }
  }

  return {
    content: [{
      type: 'text',
      text: `Ready to set up Yext ${args.tier} for ${args.businessInfo.name} at $${product.price_monthly}/month. Please confirm payment to proceed.`
    }],
    structuredContent: {
      action: 'confirm_purchase',
      product: {
        id: product.id,
        name: product.name,
        price: product.price_monthly,
        tier: args.tier
      },
      businessInfo: args.businessInfo,
      features: args.tier === 'essential' 
        ? ['40+ directories', 'Google Business Profile', 'Facebook', 'Yelp', 'Apple Maps']
        : args.tier === 'standard'
        ? ['60+ directories', 'Industry directories', 'Review monitoring', 'Analytics']
        : ['80+ directories', 'Premium directories', 'Enhanced analytics', 'Priority support']
    },
    _meta: { ui: { view: 'checkout' } }
  }
}

/**
 * Set up WordPress hosting (convenience wrapper)
 */
async function setupWordpress(
  args: {
    domain: string
    plan: 'standard' | 'pro'
    template?: string
  },
  auth: AuthContext
): Promise<MCPToolResult> {
  const slug = args.plan === 'pro' ? 'wp-hosting-pro' : 'wp-hosting'

  const { data: product } = await supabase
    .from('store_products')
    .select('id, name, price_monthly')
    .eq('slug', slug)
    .single()

  if (!product) {
    return {
      content: [{ type: 'text', text: `WordPress ${args.plan} plan not found` }],
      structuredContent: { error: 'Product not found' },
      isError: true
    }
  }

  return {
    content: [{
      type: 'text',
      text: `Ready to set up WordPress ${args.plan} hosting for ${args.domain} at $${product.price_monthly}/month.`
    }],
    structuredContent: {
      action: 'confirm_purchase',
      product: {
        id: product.id,
        name: product.name,
        price: product.price_monthly,
        plan: args.plan
      },
      domain: args.domain,
      template: args.template
    },
    _meta: { ui: { view: 'checkout' } }
  }
}

/**
 * Set up WhatsApp integration (convenience wrapper)
 */
async function setupWhatsapp(
  args: {
    phoneNumber: string
    businessName: string
    welcomeMessage?: string
  },
  auth: AuthContext
): Promise<MCPToolResult> {
  const { data: product } = await supabase
    .from('store_products')
    .select('id, name, price_monthly')
    .eq('slug', 'whatsapp')
    .single()

  if (!product) {
    return {
      content: [{ type: 'text', text: 'WhatsApp product not found' }],
      structuredContent: { error: 'Product not found' },
      isError: true
    }
  }

  return {
    content: [{
      type: 'text',
      text: `Ready to set up WhatsApp Business for ${args.businessName} (${args.phoneNumber}) at $${product.price_monthly}/month.`
    }],
    structuredContent: {
      action: 'confirm_purchase',
      product: {
        id: product.id,
        name: product.name,
        price: product.price_monthly
      },
      phoneNumber: args.phoneNumber,
      businessName: args.businessName,
      welcomeMessage: args.welcomeMessage
    },
    _meta: { ui: { view: 'checkout' } }
  }
}

/**
 * Manage subscriptions (view, upgrade, downgrade, cancel)
 */
async function manageSubscription(
  args: {
    action: 'view' | 'upgrade' | 'downgrade' | 'cancel' | 'retry'
    subscriptionId?: string
  },
  auth: AuthContext
): Promise<MCPToolResult> {
  if (!auth.isAuthenticated) {
    return {
      content: [{ type: 'text', text: 'Please log in to view subscriptions' }],
      structuredContent: { error: 'Authentication required' },
      isError: true,
      _meta: { ui: { view: 'connect' } }
    }
  }

  switch (args.action) {
    case 'view': {
      const subscriptions = await getUserSubscriptions(auth.userId)
      return {
        content: [{
          type: 'text',
          text: subscriptions.length 
            ? `You have ${subscriptions.length} active subscription(s)`
            : 'You have no active subscriptions'
        }],
        structuredContent: { subscriptions },
        _meta: { ui: { view: 'subscriptions' } }
      }
    }

    case 'cancel': {
      if (!args.subscriptionId) {
        return {
          content: [{ type: 'text', text: 'Please specify which subscription to cancel' }],
          structuredContent: { error: 'subscriptionId required' },
          isError: true
        }
      }

      const result = await cancelSubscription(args.subscriptionId, false)
      return {
        content: [{
          type: 'text',
          text: result.success 
            ? 'Subscription cancelled. It will remain active until the end of the billing period.'
            : `Failed to cancel: ${result.error}`
        }],
        structuredContent: result
      }
    }

    case 'retry': {
      // Retry failed provisioning
      if (!args.subscriptionId) {
        return {
          content: [{ type: 'text', text: 'Please specify which subscription to retry' }],
          structuredContent: { error: 'subscriptionId required' },
          isError: true
        }
      }

      const result = await handleManualProvision(args.subscriptionId)
      return {
        content: [{
          type: 'text',
          text: result.success 
            ? 'Provisioning retry queued successfully'
            : `Failed to retry: ${result.error}`
        }],
        structuredContent: result
      }
    }

    default:
      return {
        content: [{ type: 'text', text: `Action "${args.action}" not yet implemented` }],
        structuredContent: { error: 'Not implemented' },
        isError: true
      }
  }
}

/**
 * Get usage statistics
 */
async function getUsage(
  args: {
    service: 'sms' | 'email' | 'ai' | 'workflows' | 'all'
    period: 'today' | 'week' | 'month' | 'year'
  },
  auth: AuthContext
): Promise<MCPToolResult> {
  if (!auth.isAuthenticated) {
    return {
      content: [{ type: 'text', text: 'Please log in to view usage' }],
      structuredContent: { error: 'Authentication required' },
      isError: true,
      _meta: { ui: { view: 'connect' } }
    }
  }

  // Get active subscriptions
  const { data: subscriptions } = await supabase
    .from('store_active_subscriptions')
    .select('id')
    .eq('user_id', auth.userId)

  if (!subscriptions?.length) {
    return {
      content: [{ type: 'text', text: 'No active subscriptions found' }],
      structuredContent: { usage: {} }
    }
  }

  // Aggregate usage across all subscriptions
  const allUsage: Record<string, { quantity: number; cost: number }> = {}

  for (const sub of subscriptions) {
    const summary = await getUsageSummary(sub.id, 'current')
    if (summary) {
      for (const [service, data] of Object.entries(summary)) {
        if (args.service !== 'all' && service !== args.service) continue
        if (!allUsage[service]) {
          allUsage[service] = { quantity: 0, cost: 0 }
        }
        allUsage[service].quantity += data.quantity
        allUsage[service].cost += data.cost
      }
    }
  }

  return {
    content: [{
      type: 'text',
      text: Object.keys(allUsage).length
        ? `Usage summary: ${Object.entries(allUsage).map(([s, d]) => `${s}: ${d.quantity}`).join(', ')}`
        : 'No usage recorded for this period'
    }],
    structuredContent: { usage: allUsage, period: args.period }
  }
}

// ============================================================================
// TOOL REGISTRY
// ============================================================================

export const storeTools = {
  browse_store: {
    name: 'browse_store',
    description: 'Browse available products and packages in the 0nMCP Store',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Filter by category: listings, hosting, communication, ai, packages',
          enum: ['listings', 'hosting', 'communication', 'ai', 'packages']
        },
        priceRange: {
          type: 'string',
          description: 'Filter by price range',
          enum: ['budget', 'standard', 'premium']
        }
      }
    },
    handler: browseStore
  },

  get_pricing: {
    name: 'get_pricing',
    description: 'Get detailed pricing for a specific product or package',
    inputSchema: {
      type: 'object',
      properties: {
        product: {
          type: 'string',
          description: 'Product name, ID, or slug'
        },
        billing: {
          type: 'string',
          enum: ['monthly', 'annual'],
          description: 'Billing cycle to show pricing for'
        }
      },
      required: ['product']
    },
    handler: getPricing
  },

  compare_packages: {
    name: 'compare_packages',
    description: 'Compare features and pricing across packages',
    inputSchema: {
      type: 'object',
      properties: {
        packages: {
          type: 'array',
          items: { type: 'string' },
          description: 'Package slugs to compare (e.g., ["local-starter", "growth-engine"])'
        }
      },
      required: ['packages']
    },
    handler: comparePackages
  },

  purchase_product: {
    name: 'purchase_product',
    description: 'Purchase a product or package from the store',
    inputSchema: {
      type: 'object',
      properties: {
        productId: { type: 'string', description: 'Product ID to purchase' },
        productType: { type: 'string', enum: ['package', 'product'] },
        billing: { type: 'string', enum: ['monthly', 'annual'] },
        paymentMethodId: { type: 'string', description: 'Stripe payment method ID' },
        businessInfo: {
          type: 'object',
          properties: {
            businessName: { type: 'string' },
            email: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zip: { type: 'string' },
            phone: { type: 'string' }
          },
          required: ['businessName', 'email']
        }
      },
      required: ['productId', 'productType', 'billing', 'paymentMethodId', 'businessInfo']
    },
    handler: purchaseProduct
  },

  setup_yext: {
    name: 'setup_yext',
    description: 'Set up Yext/Listings for a business',
    inputSchema: {
      type: 'object',
      properties: {
        tier: {
          type: 'string',
          enum: ['essential', 'standard', 'premium'],
          description: 'Yext tier: essential (40+ dirs), standard (60+ dirs), premium (80+ dirs)'
        },
        businessInfo: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            address: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zip: { type: 'string' },
            phone: { type: 'string' },
            categories: { type: 'array', items: { type: 'string' } },
            description: { type: 'string' }
          },
          required: ['name', 'address', 'city', 'state', 'zip', 'phone']
        }
      },
      required: ['tier', 'businessInfo']
    },
    handler: setupYext
  },

  setup_wordpress: {
    name: 'setup_wordpress',
    description: 'Set up WordPress hosting for a website',
    inputSchema: {
      type: 'object',
      properties: {
        domain: { type: 'string', description: 'Domain name for the WordPress site' },
        plan: { type: 'string', enum: ['standard', 'pro'] },
        template: { type: 'string', description: 'Optional template to install' }
      },
      required: ['domain', 'plan']
    },
    handler: setupWordpress
  },

  setup_whatsapp: {
    name: 'setup_whatsapp',
    description: 'Set up WhatsApp Business integration',
    inputSchema: {
      type: 'object',
      properties: {
        phoneNumber: { type: 'string', description: 'WhatsApp business phone number' },
        businessName: { type: 'string' },
        welcomeMessage: { type: 'string', description: 'Optional welcome message for new conversations' }
      },
      required: ['phoneNumber', 'businessName']
    },
    handler: setupWhatsapp
  },

  manage_subscription: {
    name: 'manage_subscription',
    description: 'View or modify active subscriptions',
    inputSchema: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['view', 'upgrade', 'downgrade', 'cancel', 'retry'],
          description: 'Action to perform'
        },
        subscriptionId: {
          type: 'string',
          description: 'Subscription ID (required for cancel/upgrade/downgrade)'
        }
      },
      required: ['action']
    },
    handler: manageSubscription
  },

  get_usage: {
    name: 'get_usage',
    description: 'Get usage statistics for active services',
    inputSchema: {
      type: 'object',
      properties: {
        service: {
          type: 'string',
          enum: ['sms', 'email', 'ai', 'workflows', 'all'],
          description: 'Service to get usage for'
        },
        period: {
          type: 'string',
          enum: ['today', 'week', 'month', 'year'],
          description: 'Time period for usage'
        }
      },
      required: ['service', 'period']
    },
    handler: getUsage
  }
}

// ============================================================================
// TOOL EXECUTOR
// ============================================================================

/**
 * Execute an MCP tool call
 */
export async function executeStoreTool(
  toolCall: MCPToolCall,
  auth: AuthContext
): Promise<MCPToolResult> {
  const tool = storeTools[toolCall.name as keyof typeof storeTools]

  if (!tool) {
    return {
      content: [{ type: 'text', text: `Unknown tool: ${toolCall.name}` }],
      structuredContent: { error: 'Unknown tool' },
      isError: true
    }
  }

  try {
    return await tool.handler(toolCall.arguments as never, auth)
  } catch (error: any) {
    console.error(`Tool ${toolCall.name} failed:`, error)
    return {
      content: [{ type: 'text', text: `Tool error: ${error.message}` }],
      structuredContent: { error: error.message },
      isError: true
    }
  }
}

/**
 * Get all tool definitions for MCP manifest
 */
export function getStoreToolManifest() {
  return Object.values(storeTools).map(tool => ({
    name: tool.name,
    description: tool.description,
    inputSchema: tool.inputSchema
  }))
}
