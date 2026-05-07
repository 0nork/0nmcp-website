import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const INITIAL_SPARKS = 100

function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { persistSession: false } })
}

/**
 * GET /api/sparks/balance
 * Returns the authenticated user's Sparks (Runs) balance.
 * Creates a balance row with 100 initial Sparks if none exists.
 */
export async function GET() {
  const supabase = await createSupabaseServer()
  if (!supabase) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 })
  }

  const user = (await supabase.auth.getSession()).data.session?.user ?? null
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Service not configured' }, { status: 500 })
  }

  // Try to fetch existing balance
  const { data, error } = await admin
    .from('run_balances')
    .select('balance, lifetime_earned, lifetime_spent')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 })
  }

  if (data) {
    return NextResponse.json({
      balance: data.balance,
      lifetime_earned: data.lifetime_earned,
      lifetime_spent: data.lifetime_spent,
    })
  }

  // No balance row — create one with initial Sparks
  const { data: created, error: createErr } = await admin
    .from('run_balances')
    .insert({
      user_id: user.id,
      balance: INITIAL_SPARKS,
      lifetime_earned: INITIAL_SPARKS,
      lifetime_spent: 0,
    })
    .select('balance, lifetime_earned, lifetime_spent')
    .single()

  if (createErr) {
    // Might be a race condition — try fetching again
    const { data: retry } = await admin
      .from('run_balances')
      .select('balance, lifetime_earned, lifetime_spent')
      .eq('user_id', user.id)
      .maybeSingle()

    if (retry) {
      return NextResponse.json({
        balance: retry.balance,
        lifetime_earned: retry.lifetime_earned,
        lifetime_spent: retry.lifetime_spent,
      })
    }

    return NextResponse.json({ error: 'Failed to create balance' }, { status: 500 })
  }

  // Also log the grant transaction (non-critical, ignore errors)
  try {
    await admin.from('run_transactions').insert({
      user_id: user.id,
      type: 'grant',
      amount: INITIAL_SPARKS,
      balance_after: INITIAL_SPARKS,
      description: 'Welcome bonus: 100 free Sparks',
      metadata: { source: 'signup_bonus' },
    })
  } catch { /* non-critical */ }

  return NextResponse.json({
    balance: created.balance,
    lifetime_earned: created.lifetime_earned,
    lifetime_spent: created.lifetime_spent,
  })
}
