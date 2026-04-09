// ============================================================================
// 0nMCP STORE - NEXT.JS API ROUTES
// app/api/store/[...path]/route.ts
// 
// REST API endpoints for the store (supplement to MCP tools)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { 
  processPurchase, 
  getUserSubscriptions, 
  cancelSubscription,
  handleStripeWebhook,
  getUsageSummary
} from '@/lib/store/stripe'
import { processQueue, getQueueStats, handleManualProvision } from '@/lib/store/provisioner'
import { executeStoreTool, getStoreToolManifest } from '@/lib/store/mcp-tools'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================================================================
// AUTH HELPER
// ============================================================================

async function getAuthContext(request: NextRequest) {
  // Check for Bearer token (from ChatGPT widget)
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    
    // Verify JWT against our JWKS
    // This would use the verifyBearerToken from apps-sdk/server/auth.ts
    try {
      // For now, decode and trust (in production, verify signature)
      const payload = JSON.parse(atob(token.split('.')[1]))
      return {
        userId: payload.sub,
        email: payload.email,
        isAuthenticated: true
      }
    } catch {
      return { userId: '', email: '', isAuthenticated: false }
    }
  }

  // Check for Supabase session
  const supabaseToken = request.cookies.get('sb-access-token')?.value
  if (supabaseToken) {
    const { data: { user } } = await supabase.auth.getUser(supabaseToken)
    if (user) {
      return {
        userId: user.id,
        email: user.email || '',
        isAuthenticated: true
      }
    }
  }

  return { userId: '', email: '', isAuthenticated: false }
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await context.params; const path = pathSegments.join('/')
  const auth = await getAuthContext(request)

  switch (path) {
    // GET /api/store/products - List all products
    case 'products': {
      const category = request.nextUrl.searchParams.get('category')
      
      let query = supabase
        .from('store_products')
        .select('*')
        .eq('is_active', true)
        .order('display_order')

      if (category) {
        query = query.eq('category', category)
      }

      const { data, error } = await query

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json({
        packages: data?.filter(p => p.category === 'package'),
        products: data?.filter(p => p.category !== 'package')
      })
    }

    // GET /api/store/subscriptions - Get user's subscriptions
    case 'subscriptions': {
      if (!auth.isAuthenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const subscriptions = await getUserSubscriptions(auth.userId)
      return NextResponse.json({ subscriptions })
    }

    // GET /api/store/usage - Get usage stats
    case 'usage': {
      if (!auth.isAuthenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const subscriptionId = request.nextUrl.searchParams.get('subscriptionId')
      if (!subscriptionId) {
        return NextResponse.json({ error: 'subscriptionId required' }, { status: 400 })
      }

      const usage = await getUsageSummary(subscriptionId, 'current')
      return NextResponse.json({ usage })
    }

    // GET /api/store/tools - Get MCP tool manifest
    case 'tools': {
      return NextResponse.json({ tools: getStoreToolManifest() })
    }

    // GET /api/store/queue/stats - Get provisioning queue stats (admin)
    case 'queue/stats': {
      // TODO: Add admin auth check
      const stats = await getQueueStats()
      return NextResponse.json(stats)
    }

    default:
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await context.params; const path = pathSegments.join('/')
  const auth = await getAuthContext(request)

  switch (path) {
    // POST /api/store/purchase - Process a purchase
    case 'purchase': {
      if (!auth.isAuthenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const body = await request.json()
      const result = await processPurchase({
        userId: auth.userId,
        productId: body.productId,
        productType: body.productType,
        billing: body.billing,
        paymentMethodId: body.paymentMethodId,
        businessInfo: body.businessInfo
      })

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      return NextResponse.json(result)
    }

    // POST /api/store/subscriptions/cancel - Cancel subscription
    case 'subscriptions/cancel': {
      if (!auth.isAuthenticated) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const body = await request.json()
      const result = await cancelSubscription(body.subscriptionId, body.immediately)

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      return NextResponse.json(result)
    }

    // POST /api/store/mcp - Execute MCP tool
    case 'mcp': {
      const body = await request.json()
      const result = await executeStoreTool(body, auth)
      return NextResponse.json(result)
    }

    // POST /api/store/webhook/stripe - Stripe webhook
    case 'webhook/stripe': {
      const payload = await request.text()
      const signature = request.headers.get('stripe-signature') || ''

      const result = await handleStripeWebhook(payload, signature)

      if (!result.received) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      return NextResponse.json({ received: true })
    }

    // POST /api/store/queue/process - Trigger queue processing (cron)
    case 'queue/process': {
      // Verify cron secret
      const cronSecret = request.headers.get('x-cron-secret')
      if (cronSecret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const processed = await processQueue()
      return NextResponse.json({ processed })
    }

    // POST /api/store/queue/retry - Retry failed provisioning (admin)
    case 'queue/retry': {
      // TODO: Add admin auth check
      const body = await request.json()
      const result = await handleManualProvision(body.subscriptionId)
      return NextResponse.json(result)
    }

    default:
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

// ============================================================================
// VERCEL CRON CONFIG
// ============================================================================

// Add to vercel.json:
// {
//   "crons": [{
//     "path": "/api/store/queue/process",
//     "schedule": "* * * * *"
//   }]
// }
