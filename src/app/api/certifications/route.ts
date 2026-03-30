import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import {
  buildCertification,
  CERT_TEMPLATES,
  listCertTemplates,
} from '@/lib/linkedin-certification'

// ---------------------------------------------------------------------------
// POST — Issue a new certification
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userEmail, userName, courseSlug } = body as {
      userEmail?: string
      userName?: string
      courseSlug?: string
    }

    if (!userEmail || !courseSlug) {
      return NextResponse.json(
        { error: 'Missing required fields: userEmail, courseSlug' },
        { status: 400 }
      )
    }

    if (!CERT_TEMPLATES[courseSlug]) {
      return NextResponse.json(
        {
          error: `Unknown course: ${courseSlug}`,
          available: Object.keys(CERT_TEMPLATES),
        },
        { status: 400 }
      )
    }

    const certData = buildCertification({ userEmail, userName, courseSlug })

    const supabase = await createSupabaseServer()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Check for duplicate (same user + course)
    const { data: existing } = await supabase
      .from('certifications')
      .select('cert_id, linkedin_url, issued_at')
      .eq('user_email', userEmail)
      .eq('course_slug', courseSlug)
      .limit(1)
      .single()

    if (existing) {
      return NextResponse.json({
        message: 'Certification already issued',
        certification: existing,
        linkedinUrl: existing.linkedin_url,
        verifyUrl: `https://0nmcp.com/verify/${existing.cert_id}`,
      })
    }

    const { data, error } = await supabase
      .from('certifications')
      .insert(certData)
      .select()
      .single()

    if (error) {
      console.error('Certification insert error:', error)
      return NextResponse.json(
        { error: 'Failed to issue certification' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Certification issued successfully',
      certification: data,
      linkedinUrl: certData.linkedin_url,
      verifyUrl: `https://0nmcp.com/verify/${certData.cert_id}`,
    })
  } catch (err) {
    console.error('Certification POST error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ---------------------------------------------------------------------------
// GET — List user certs or verify a specific cert
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const certId = searchParams.get('id')
    const userEmail = searchParams.get('email')

    const supabase = await createSupabaseServer()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    // Public verification by cert ID
    if (certId) {
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('cert_id', certId)
        .single()

      if (error || !data) {
        return NextResponse.json(
          { verified: false, error: 'Certification not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        verified: data.verified,
        certification: {
          certId: data.cert_id,
          certName: data.cert_name,
          userName: data.user_name,
          courseSlug: data.course_slug,
          issuedAt: data.issued_at,
          linkedinUrl: data.linkedin_url,
        },
      })
    }

    // List certs for a specific user
    if (userEmail) {
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('user_email', userEmail)
        .order('issued_at', { ascending: false })

      if (error) {
        return NextResponse.json(
          { error: 'Failed to fetch certifications' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        certifications: data ?? [],
        templates: listCertTemplates(),
      })
    }

    // No params — return available templates
    return NextResponse.json({
      templates: listCertTemplates(),
    })
  } catch (err) {
    console.error('Certification GET error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
