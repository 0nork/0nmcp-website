import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /go/[slug]
 * Affiliate redirect — looks up the service's affiliate URL from the database
 * and redirects the user. Tracks the click for attribution.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Normalize slug to service_id (slugs use hyphens, service_ids use underscores)
  const serviceId = slug.replace(/-/g, '_')

  try {
    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data } = await admin
      .from('service_affiliate_links')
      .select('affiliate_url, service_name')
      .eq('service_id', serviceId)
      .eq('is_active', true)
      .single()

    if (data?.affiliate_url) {
      return NextResponse.redirect(data.affiliate_url, 302)
    }
  } catch {
    // Fall through to default
  }

  // Fallback: redirect to integrations page for this service
  return NextResponse.redirect(`https://www.0nmcp.com/integrations/${slug}`, 302)
}
