import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase/server'

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/** GET — Reviews for a listing */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const listingId = searchParams.get('listingId')

    if (!listingId) return NextResponse.json({ error: 'listingId required' }, { status: 400 })

    const { data: reviews, error } = await getAdmin()
      .from('store_reviews')
      .select(`
        id, rating, review_text, is_verified_purchase, created_at,
        buyer:profiles!store_reviews_buyer_id_fkey(full_name, avatar_url)
      `)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false })

    if (error) {
      // Fallback without join if FK name doesn't match
      const { data: fallback } = await getAdmin()
        .from('store_reviews')
        .select('*')
        .eq('listing_id', listingId)
        .order('created_at', { ascending: false })

      return NextResponse.json({ reviews: fallback || [] })
    }

    return NextResponse.json({ reviews: reviews || [] })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

/** POST — Create a review (must have purchased) */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 })
    const user = (await supabase.auth.getSession()).data.session?.user ?? null
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { listingId, rating, reviewText } = body

    if (!listingId || !rating) {
      return NextResponse.json({ error: 'listingId and rating are required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 })
    }

    const admin = getAdmin()

    // Verify purchase exists
    const { data: purchase } = await admin
      .from('store_purchases')
      .select('id')
      .eq('buyer_id', user.id)
      .eq('listing_id', listingId)
      .maybeSingle()

    if (!purchase) {
      return NextResponse.json({ error: 'You must purchase this listing before reviewing' }, { status: 403 })
    }

    // Create review
    const { data: review, error } = await admin
      .from('store_reviews')
      .upsert({
        buyer_id: user.id,
        listing_id: listingId,
        rating,
        review_text: reviewText || null,
        is_verified_purchase: true,
      }, { onConflict: 'buyer_id,listing_id' })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Recalculate average rating
    const { data: stats } = await admin
      .from('store_reviews')
      .select('rating')
      .eq('listing_id', listingId)

    if (stats && stats.length > 0) {
      const avg = stats.reduce((sum, r) => sum + r.rating, 0) / stats.length
      await admin
        .from('store_listings')
        .update({
          average_rating: Math.round(avg * 100) / 100,
          review_count: stats.length,
        })
        .eq('id', listingId)
    }

    return NextResponse.json({ review })
  } catch {
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
