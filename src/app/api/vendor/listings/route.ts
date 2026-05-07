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

/** GET — List vendor's own listings */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    const user = (await supabase.auth.getSession()).data.session?.user ?? null
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get vendor profile
    const { data: vendor } = await getAdmin()
      .from('vendor_profiles')
      .select('id, is_approved')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!vendor) return NextResponse.json({ listings: [] })

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    let query = getAdmin()
      .from('store_listings')
      .select('*')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ listings: data || [] })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}

/** POST — Create a new listing */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    const user = (await supabase.auth.getSession()).data.session?.user ?? null
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: vendor } = await getAdmin()
      .from('vendor_profiles')
      .select('id, is_approved, charges_enabled')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!vendor?.is_approved) {
      return NextResponse.json({ error: 'Vendor account not approved' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, longDescription, category, price, tags, services, coverImageUrl, workflowData, assetType, stepCount } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'title and description are required' }, { status: 400 })
    }

    // Generate slug
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    const suffix = Math.random().toString(36).slice(2, 6)
    const slug = `${baseSlug}-${suffix}`

    // Create Stripe product + price for paid listings
    let stripeProductId: string | null = null
    let stripePriceId: string | null = null

    if (price && price > 0) {
      if (!vendor.charges_enabled) {
        return NextResponse.json({ error: 'Complete Stripe onboarding before creating paid listings' }, { status: 403 })
      }

      const product = await stripe.products.create({
        name: title,
        description: description?.slice(0, 500),
        metadata: { vendor_id: vendor.id, platform: '0nmcp' },
      })

      const stripePrice = await stripe.prices.create({
        product: product.id,
        unit_amount: price,
        currency: 'usd',
      })

      stripeProductId = product.id
      stripePriceId = stripePrice.id
    }

    const { data: listing, error } = await getAdmin()
      .from('store_listings')
      .insert({
        title,
        slug,
        description,
        long_description: longDescription || null,
        category: category || 'custom',
        tags: tags || [],
        price: price || 0,
        currency: 'usd',
        cover_image_url: coverImageUrl || null,
        stripe_product_id: stripeProductId,
        stripe_price_id: stripePriceId,
        workflow_data: workflowData || null,
        services: services || [],
        step_count: stepCount || 0,
        asset_type: assetType || 'workflow',
        status: 'draft',
        vendor_id: vendor.id,
      })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: `Failed to create listing: ${error.message}` }, { status: 500 })

    return NextResponse.json({ listing })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create listing'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
