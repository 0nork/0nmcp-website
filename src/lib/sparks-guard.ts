/**
 * Sparks Guard ⚡ — API Route Protection
 *
 * Wraps API route handlers to:
 * 1. Check Spark balance before execution
 * 2. Deduct Sparks on success
 * 3. Return 402 with purchase prompt on insufficient balance
 * 4. Attach purchase prompts to ALL error responses (400, 401, 403, 500)
 *
 * Usage:
 *   import { withSparks } from '@/lib/sparks-guard'
 *
 *   export const POST = withSparks('api.sxo.audit', async (req, { user, balance }) => {
 *     // Your handler logic — Sparks already checked
 *     return NextResponse.json(result)
 *   })
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import {
  checkBalance,
  deductSparks,
  build402Response,
  buildPurchasePrompt,
  getBalance,
  isOwner,
} from '@/lib/sparks'

interface SparkContext {
  user: { id: string; email: string }
  balance: number
  cost: number
  isOwner: boolean
  byokActive: boolean
}

type SparkHandler = (
  req: NextRequest,
  ctx: SparkContext
) => Promise<NextResponse>

/**
 * Wrap an API route handler with Spark balance checking.
 *
 * - Checks balance BEFORE the handler runs
 * - Returns 402 if insufficient
 * - Deducts Sparks AFTER successful execution
 * - Enriches error responses with purchase prompts
 */
export function withSparks(action: string, handler: SparkHandler) {
  return async (req: NextRequest) => {
    try {
      // Get user
      const supabase = await createSupabaseServer()
      const { data: { user } } = await supabase!.auth.getUser()

      if (!user) {
        return NextResponse.json({
          error: 'Authentication required',
          buy_sparks: {
            message: 'Sign up for 10 free Sparks ⚡',
            signup_url: '/signup',
          },
        }, { status: 401 })
      }

      const email = user.email || ''
      const ownerAccount = isOwner(email)

      // Check balance (includes BYOK detection — if user has own AI key, AI actions cost 0)
      const { allowed, balance, cost, alert, byokActive } = await checkBalance(user.id, action, email)

      if (!allowed) {
        return NextResponse.json(build402Response(balance, cost, action), { status: 402 })
      }

      // Run the handler
      const ctx: SparkContext = {
        user: { id: user.id, email },
        balance,
        cost,
        isOwner: ownerAccount,
        byokActive: byokActive || false,
      }

      const response = await handler(req, ctx)

      // Deduct Sparks on success (2xx responses)
      // Skip deduction for: owners, BYOK users (on exempt actions), zero-cost actions
      if (response.status >= 200 && response.status < 300 && !ownerAccount && cost > 0) {
        try {
          await deductSparks(user.id, action, `${action} execution`)
        } catch {
          // Deduction failed — log but don't fail the response
          console.error(`Spark deduction failed for ${user.id}:${action}`)
        }
      }

      // If response is an error (4xx/5xx), enrich with purchase prompt
      if (response.status >= 400) {
        return enrichErrorResponse(response, user.id)
      }

      // Add Spark balance header to successful responses
      if (alert) {
        const body = await response.json()
        return NextResponse.json({
          ...body,
          _sparks: {
            balance: balance - cost,
            alert: {
              level: alert.level,
              message: alert.message,
              purchase_url: `/api/sparks/purchase?pack=${alert.suggestedPack}`,
            },
          },
        }, { status: response.status })
      }

      return response
    } catch (err) {
      return NextResponse.json({
        error: err instanceof Error ? err.message : 'Internal error',
        buy_sparks: {
          message: 'Need more Sparks? Grab a pack.',
          url: '/api/sparks/packs',
        },
      }, { status: 500 })
    }
  }
}

/**
 * Enrich any error response with a Sparks purchase prompt.
 * Every error is a sales opportunity.
 */
async function enrichErrorResponse(response: NextResponse, userId: string): Promise<NextResponse> {
  try {
    const body = await response.json()
    const bal = await getBalance(userId)
    const prompt = buildPurchasePrompt(bal.balance)

    return NextResponse.json(
      { ...body, ...(prompt || {}) },
      { status: response.status }
    )
  } catch {
    return response
  }
}

/**
 * Light version — just checks balance and returns alert.
 * For routes that don't want full deduction wrapping.
 */
export async function sparkBalanceCheck(userId: string, email: string): Promise<{
  balance: number
  alert: ReturnType<typeof buildPurchasePrompt>
}> {
  if (isOwner(email)) {
    return { balance: 999999, alert: null }
  }
  const bal = await getBalance(userId)
  return { balance: bal.balance, alert: buildPurchasePrompt(bal.balance) }
}
