import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getVendorId(userId: string): Promise<string | null> {
  const { data } = await getAdmin()
    .from('vendor_profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  return data?.id || null
}

/** PUT — Update a listing */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServer()
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    const user = (await supabase.auth.getSession()).data.session?.user ?? null
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const vendorId = await getVendorId(user.id)
    if (!vendorId) return NextResponse.json({ error: 'Not a vendor' }, { status: 403 })

    // Verify ownership
    const { data: existing } = await getAdmin()
      .from('store_listings')
      .select('id, vendor_id, stripe_product_id, stripe_price_id, price')
      .eq('id', id)
      .single()

    if (!existing || existing.vendor_id !== vendorId) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const body = await req.json()
    const updates: Record<string, unknown> = {}

    const fields = ['title', 'description', 'long_description', 'category', 'tags', 'services', 'cover_image_url', 'workflow_data', 'step_count', 'asset_type']
    for (const f of fields) {
      if (body[f] !== undefined) updates[f] = body[f]
    }

    // Handle price change — create new Stripe price
    if (body.price !== undefined && body.price !== existing.price) {
      updates.price = body.price

      if (body.price > 0 && existing.stripe_product_id) {
        // Archive old price, create new one
        if (existing.stripe_price_id) {
          await stripe.prices.update(existing.stripe_price_id, { active: false }).catch(() => {})
        }
        const newPrice = await stripe.prices.create({
          product: existing.stripe_product_id,
          unit_amount: body.price,
          currency: 'usd',
        })
        updates.stripe_price_id = newPrice.id
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { data, error } = await getAdmin()
      .from('store_listings')
      .update(updates)
      .eq('id', id)
      .eq('vendor_id', vendorId)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ listing: data })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/** PATCH — Publish/unpublish a listing */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServer()
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    const user = (await supabase.auth.getSession()).data.session?.user ?? null
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const vendorId = await getVendorId(user.id)
    if (!vendorId) return NextResponse.json({ error: 'Not a vendor' }, { status: 403 })

    const body = await req.json()
    const { action } = body

    if (!['publish', 'unpublish'].includes(action)) {
      return NextResponse.json({ error: 'action must be "publish" or "unpublish"' }, { status: 400 })
    }

    const newStatus = action === 'publish' ? 'active' : 'draft'

    const { data, error } = await getAdmin()
      .from('store_listings')
      .update({ status: newStatus })
      .eq('id', id)
      .eq('vendor_id', vendorId)
      .select('id, status')
      .single()

    if (error || !data) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

    return NextResponse.json({ listing: data })
  } catch {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
  }
}

/** DELETE — Archive a listing */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createSupabaseServer()
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    const user = (await supabase.auth.getSession()).data.session?.user ?? null
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const vendorId = await getVendorId(user.id)
    if (!vendorId) return NextResponse.json({ error: 'Not a vendor' }, { status: 403 })

    // Get listing to archive Stripe product
    const { data: listing } = await getAdmin()
      .from('store_listings')
      .select('stripe_product_id')
      .eq('id', id)
      .eq('vendor_id', vendorId)
      .single()

    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

    // Archive Stripe product
    if (listing.stripe_product_id) {
      await stripe.products.update(listing.stripe_product_id, { active: false }).catch(() => {})
    }

    // Soft delete
    const { error } = await getAdmin()
      .from('store_listings')
      .update({ status: 'archived' })
      .eq('id', id)
      .eq('vendor_id', vendorId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ deleted: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })
  }
}
