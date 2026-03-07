/**
 * Sparks ⚡ — Pre-paid Credit System
 *
 * Every API call, workflow execution, and premium feature costs Sparks.
 * Users buy packs via Stripe. Low balance triggers purchase prompts.
 * Every 400/402 error is a $5 upsell opportunity.
 *
 * Packs:
 *   Starter   — $5  →  50 Sparks
 *   Builder   — $20 → 250 Sparks (25% bonus)
 *   Pro       — $50 → 750 Sparks (50% bonus)
 *   Unlimited — $100 → 2,000 Sparks (100% bonus)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe'

// ── Types ──

export interface SparkBalance {
  user_id: string
  balance: number
  lifetime_earned: number
  lifetime_spent: number
  last_purchase_at: string | null
  last_deduction_at: string | null
  stripe_customer_id: string | null
}

export interface SparkTransaction {
  id: string
  user_id: string
  type: 'purchase' | 'bonus' | 'deduction' | 'refund' | 'expiry' | 'grant'
  amount: number
  balance_after: number
  description: string
  metadata: Record<string, unknown>
  stripe_payment_intent_id: string | null
  created_at: string
}

export interface SparkPack {
  id: string
  name: string
  sparks: number
  price_cents: number
  bonus_pct: number
  stripe_price_id: string | null
  badge: string
  sort_order: number
  active: boolean
}

export interface SparkCost {
  action: string
  cost: number
}

export interface LowBalanceAlert {
  level: 'notice' | 'warning' | 'critical' | 'empty'
  balance: number
  message: string
  suggestedPack: string
  purchaseUrl?: string
}

// ── Cost Table ──

export const SPARK_COSTS: Record<string, number> = {
  // API calls
  'api.sxo.audit': 5,
  'api.sxo.generate': 10,
  'api.chat': 3,
  'api.execute': 5,
  'api.convert': 1,
  'api.feed.sxo': 2,

  // Console operations
  'console.workflow.run': 5,
  'console.workflow.create': 2,
  'console.export': 1,

  // Store operations
  'store.purchase': 0,  // free — paid via Stripe directly
  'store.download': 1,

  // Default
  'default': 1,
}

/** Get the Spark cost for an action */
export function getSparkCost(action: string): number {
  return SPARK_COSTS[action] ?? SPARK_COSTS['default']
}

// ── Low Balance Thresholds ──

const LOW_BALANCE_THRESHOLDS = [
  { level: 'empty' as const, threshold: 0, message: 'You\'re out of Sparks! Purchase more to continue.', pack: 'starter' },
  { level: 'critical' as const, threshold: 5, message: 'Almost out of Sparks — only {balance} left.', pack: 'starter' },
  { level: 'warning' as const, threshold: 20, message: 'Running low — {balance} Sparks remaining.', pack: 'builder' },
  { level: 'notice' as const, threshold: 50, message: 'Heads up — {balance} Sparks left. Top up to keep building.', pack: 'builder' },
]

// ── Owner bypass ──

const OWNER_EMAILS = new Set(['mike@rocketopp.com'])

export function isOwner(email: string): boolean {
  return OWNER_EMAILS.has(email)
}

// ── Admin client ──

let _admin: SupabaseClient | null = null
function getAdmin(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }
  return _admin
}

// ── Core Functions ──

/**
 * Get a user's current Spark balance.
 * Creates a balance row with 0 if none exists.
 */
export async function getBalance(userId: string): Promise<SparkBalance> {
  const { data, error } = await getAdmin()
    .from('spark_balances')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw new Error(`Failed to fetch balance: ${error.message}`)

  if (!data) {
    // Create balance row
    const { data: created, error: createErr } = await getAdmin()
      .from('spark_balances')
      .insert({ user_id: userId, balance: 0, lifetime_earned: 0, lifetime_spent: 0 })
      .select()
      .single()
    if (createErr) throw new Error(`Failed to create balance: ${createErr.message}`)
    return created
  }

  return data
}

/**
 * Check if user has enough Sparks for an action.
 * Returns { allowed, balance, cost, alert? }
 */
export async function checkBalance(userId: string, action: string, email?: string): Promise<{
  allowed: boolean
  balance: number
  cost: number
  alert?: LowBalanceAlert
}> {
  // Owner bypass — infinite sparks
  if (email && isOwner(email)) {
    return { allowed: true, balance: 999999, cost: 0 }
  }

  const bal = await getBalance(userId)
  const cost = getSparkCost(action)
  const allowed = bal.balance >= cost

  // Check for low balance alert
  const afterDeduction = bal.balance - cost
  const alert = getLowBalanceAlert(allowed ? afterDeduction : bal.balance)

  return { allowed, balance: bal.balance, cost, alert: alert || undefined }
}

/**
 * Deduct Sparks from a user's balance.
 * Returns the new balance. Throws if insufficient.
 */
export async function deductSparks(
  userId: string,
  action: string,
  description: string,
  metadata?: Record<string, unknown>
): Promise<{ balance: number; cost: number; transaction_id: string }> {
  const cost = getSparkCost(action)
  if (cost === 0) return { balance: 0, cost: 0, transaction_id: '' }

  const admin = getAdmin()

  // Atomic deduction via RPC or manual check
  const { data: bal } = await admin
    .from('spark_balances')
    .select('balance')
    .eq('user_id', userId)
    .single()

  if (!bal || bal.balance < cost) {
    throw new SparkInsufficientError(bal?.balance || 0, cost, action)
  }

  const newBalance = bal.balance - cost

  // Update balance
  await admin.from('spark_balances').update({
    balance: newBalance,
    lifetime_spent: bal.balance,  // will be recalculated
    last_deduction_at: new Date().toISOString(),
  }).eq('user_id', userId)

  // Recalculate lifetime_spent from transactions
  try {
    await admin.rpc('recalc_spark_lifetime', { p_user_id: userId })
  } catch {
    // RPC may not exist yet — non-critical
  }

  // Log transaction
  const { data: tx } = await admin.from('spark_transactions').insert({
    user_id: userId,
    type: 'deduction',
    amount: -cost,
    balance_after: newBalance,
    description,
    metadata: metadata || {},
  }).select('id').single()

  return { balance: newBalance, cost, transaction_id: tx?.id || '' }
}

/**
 * Credit Sparks to a user's balance (purchase, bonus, grant, refund).
 */
export async function creditSparks(
  userId: string,
  amount: number,
  type: 'purchase' | 'bonus' | 'grant' | 'refund',
  description: string,
  opts?: {
    stripePaymentIntentId?: string
    stripeCheckoutSessionId?: string
    stripeCustomerId?: string
    metadata?: Record<string, unknown>
  }
): Promise<{ balance: number }> {
  const admin = getAdmin()

  const { data: bal } = await admin
    .from('spark_balances')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle()

  const currentBalance = bal?.balance || 0
  const newBalance = currentBalance + amount

  // Upsert balance
  await admin.from('spark_balances').upsert({
    user_id: userId,
    balance: newBalance,
    lifetime_earned: currentBalance + amount,
    ...(type === 'purchase' ? { last_purchase_at: new Date().toISOString() } : {}),
    ...(opts?.stripeCustomerId ? { stripe_customer_id: opts.stripeCustomerId } : {}),
  }, { onConflict: 'user_id' })

  // Log transaction
  await admin.from('spark_transactions').insert({
    user_id: userId,
    type,
    amount,
    balance_after: newBalance,
    description,
    metadata: opts?.metadata || {},
    stripe_payment_intent_id: opts?.stripePaymentIntentId || null,
    stripe_checkout_session_id: opts?.stripeCheckoutSessionId || null,
  })

  return { balance: newBalance }
}

/**
 * Get transaction history for a user.
 */
export async function getHistory(
  userId: string,
  limit = 50,
  offset = 0
): Promise<{ transactions: SparkTransaction[]; total: number }> {
  const admin = getAdmin()

  const { data, count, error } = await admin
    .from('spark_transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw new Error(`Failed to fetch history: ${error.message}`)

  return { transactions: data || [], total: count || 0 }
}

/**
 * Get all available Spark packs.
 */
export async function getPacks(): Promise<SparkPack[]> {
  const { data, error } = await getAdmin()
    .from('spark_packs')
    .select('*')
    .eq('active', true)
    .order('sort_order')

  if (error) throw new Error(`Failed to fetch packs: ${error.message}`)
  return data || []
}

// ── Low Balance Detection ──

export function getLowBalanceAlert(balance: number): LowBalanceAlert | null {
  for (const t of LOW_BALANCE_THRESHOLDS) {
    if (balance <= t.threshold) {
      return {
        level: t.level,
        balance,
        message: t.message.replace('{balance}', String(balance)),
        suggestedPack: t.pack,
      }
    }
  }
  return null
}

// ── Stripe Integration ──

/**
 * Create a Stripe Checkout session for purchasing Sparks.
 */
export async function createSparkCheckout(
  userId: string,
  email: string,
  packId: string,
  returnUrl: string
): Promise<string> {
  // Get pack details
  const { data: pack } = await getAdmin()
    .from('spark_packs')
    .select('*')
    .eq('id', packId)
    .eq('active', true)
    .single()

  if (!pack) throw new Error(`Invalid pack: ${packId}`)

  // Check if pack has a Stripe price ID, otherwise use price_data
  const lineItems = pack.stripe_price_id
    ? [{ price: pack.stripe_price_id, quantity: 1 }]
    : [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${pack.sparks} Sparks ⚡ — ${pack.name} Pack`,
            description: pack.bonus_pct > 0
              ? `${pack.sparks} Sparks (includes ${pack.bonus_pct}% bonus)`
              : `${pack.sparks} Sparks`,
          },
          unit_amount: pack.price_cents,
        },
        quantity: 1,
      }]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = await (stripe.checkout.sessions.create as any)({
    mode: 'payment',
    line_items: lineItems,
    success_url: `${returnUrl}?sparks=purchased&pack=${packId}`,
    cancel_url: `${returnUrl}?sparks=canceled`,
    customer_email: email,
    metadata: {
      plan_type: 'sparks',
      pack_id: packId,
      sparks_amount: String(pack.sparks),
      user_id: userId,
      user_email: email,
    },
  })

  return session.url || ''
}

// ── Error Classes ──

export class SparkInsufficientError extends Error {
  balance: number
  cost: number
  action: string
  packs: Array<{ id: string; name: string; sparks: number; price: string }>

  constructor(balance: number, cost: number, action: string) {
    super(`Insufficient Sparks: need ${cost}, have ${balance}`)
    this.name = 'SparkInsufficientError'
    this.balance = balance
    this.cost = cost
    this.action = action
    this.packs = [
      { id: 'starter', name: 'Starter', sparks: 50, price: '$5' },
      { id: 'builder', name: 'Builder', sparks: 250, price: '$20' },
      { id: 'pro', name: 'Pro', sparks: 750, price: '$50' },
      { id: 'unlimited', name: 'Unlimited', sparks: 2000, price: '$100' },
    ]
  }

  toResponse() {
    return {
      error: 'insufficient_sparks',
      message: `This action costs ${this.cost} Sparks ⚡ — you have ${this.balance}. Purchase more to continue.`,
      balance: this.balance,
      cost: this.cost,
      action: this.action,
      purchase: {
        quick_buy: {
          pack: 'starter',
          sparks: 50,
          price: '$5',
          url: '/api/sparks/purchase?pack=starter',
        },
        all_packs: this.packs.map(p => ({
          ...p,
          url: `/api/sparks/purchase?pack=${p.id}`,
        })),
      },
    }
  }
}

// ── 402 Response Builder ──

/**
 * Build a 402 Payment Required response with Sparks purchase prompts.
 * Used by middleware and API routes when balance is insufficient.
 */
export function build402Response(balance: number, cost: number, action: string) {
  const err = new SparkInsufficientError(balance, cost, action)
  return err.toResponse()
}

/**
 * Build a purchase prompt to attach to any error response.
 * Every 400-level error is a chance to sell Sparks.
 */
export function buildPurchasePrompt(balance: number) {
  const alert = getLowBalanceAlert(balance)
  if (!alert) return null

  return {
    sparks_alert: {
      level: alert.level,
      message: alert.message,
      balance,
      buy_sparks: {
        recommended: alert.suggestedPack,
        url: `/api/sparks/purchase?pack=${alert.suggestedPack}`,
        packs: [
          { id: 'starter', sparks: 50, price: '$5' },
          { id: 'builder', sparks: 250, price: '$20' },
          { id: 'pro', sparks: 750, price: '$50' },
          { id: 'unlimited', sparks: 2000, price: '$100' },
        ],
      },
    },
  }
}
