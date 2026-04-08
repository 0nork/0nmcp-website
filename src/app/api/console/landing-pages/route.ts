/**
 * POST /api/console/landing-pages — Generate + deploy landing pages
 *
 * Uses AI to generate a landing page from a description, then deploys
 * it to the CRM funnel builder for the user's sub-location.
 * CRO9 analytics auto-embedded.
 *
 * Body: {
 *   prompt: string,        — "Korean Facial launch page with booking CTA"
 *   locationId?: string,   — CRM location (auto-resolved if not provided)
 *   brandColors?: object,  — override brand colors
 *   includeForm?: boolean, — include lead capture form
 *   includeBooking?: boolean, — include booking CTA
 *   bookingUrl?: string,   — MassageBook or calendar URL
 * }
 *
 * Returns: { html, pageId, funnelUrl, cro9Embedded }
 */

import { NextRequest, NextResponse } from 'next/server'
import { resolveAuth } from '@/lib/token-auth'
import { createClient } from '@supabase/supabase-js'

const CRM_API = 'https://services.leadconnectorhq.com'

function getAdmin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

const LOCATION_PITS: Record<string, string> = {
  'F76MNKOMQCMruMrumtdf': process.env.CRM_SPA_PIT || 'pit-bafea751-0228-4db1-a9f7-3d426b33713c',
  'nphConTwfHcVE1oA0uep': process.env.CRM_PIT || 'pit-0317b406-8a47-478e-ac28-a88763a9bb3f',
}

const CRO9_SCRIPT = `
<!-- CRO9 Analytics -->
<script>
(function(){
  var s=document.createElement('script');
  s.src='https://0nmcp.com/api/cro9/tracker.js';
  s.async=true;
  s.dataset.locationId='{{LOCATION_ID}}';
  s.dataset.pageType='landing';
  document.head.appendChild(s);
})();
</script>
<!-- /CRO9 -->
`

const LANDING_PAGE_PROMPT = `You are an expert landing page designer and copywriter. Generate a complete, self-contained HTML landing page based on the user's description.

RULES:
- Output ONLY raw HTML. No markdown fencing, no explanations.
- Include ALL CSS inline in a <style> tag.
- Mobile-responsive by default.
- Include a clear hero section with headline + subheadline.
- Include social proof section if relevant.
- Include clear CTA button(s) with the provided booking/action URL.
- If a lead capture form is requested, include Name + Email + Phone fields with a submit button.
- Use the provided brand colors throughout.
- Include smooth scroll, subtle animations, and professional typography.
- CTA buttons should be prominent and above the fold.
- Include proper meta tags for SEO.
- The page should feel premium and conversion-optimized.
- Include CRO9 analytics script placeholder: <!-- CRO9_INJECT -->

Brand color tokens to use:
- Primary: {{PRIMARY}}
- Accent: {{ACCENT}}
- Light/cream: {{LIGHT}}
- Dark/text: {{DARK}}
- Font: Georgia for headings, Arial for body (unless overridden)
`

async function generateLandingPage(prompt: string, brandColors: Record<string, string>, bookingUrl?: string): Promise<string> {
  const systemPrompt = LANDING_PAGE_PROMPT
    .replace('{{PRIMARY}}', brandColors.primary || '#570301')
    .replace('{{ACCENT}}', brandColors.accent || '#C8792D')
    .replace('{{LIGHT}}', brandColors.light || '#F4DCD0')
    .replace('{{DARK}}', brandColors.dark || '#272727')

  const userPrompt = `${prompt}\n\n${bookingUrl ? `Booking/CTA URL: ${bookingUrl}` : ''}`

  // Try Gemini first (fast + creative), fallback to OpenAI
  const geminiKey = process.env.GEMINI_API_KEY
  if (geminiKey) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 16384 },
        }),
        signal: AbortSignal.timeout(60000),
      })
      if (res.ok) {
        const data = await res.json()
        let html = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        html = html.replace(/^```(?:html)?\n?/gm, '').replace(/\n?```$/gm, '').trim()
        return html
      }
    } catch { /* fallback */ }
  }

  // Fallback: OpenAI
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 16384,
        temperature: 0.9,
      }),
      signal: AbortSignal.timeout(60000),
    })
    if (res.ok) {
      const data = await res.json()
      let html = data.choices?.[0]?.message?.content || ''
      html = html.replace(/^```(?:html)?\n?/gm, '').replace(/\n?```$/gm, '').trim()
      return html
    }
  }

  throw new Error('No AI provider available (GEMINI_API_KEY or OPENAI_API_KEY)')
}

export async function POST(request: NextRequest) {
  const auth = await resolveAuth(request)
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { prompt, brandColors, includeForm, includeBooking, bookingUrl } = body

  if (!prompt) return NextResponse.json({ error: 'prompt required' }, { status: 400 })

  const admin = getAdmin()

  // Resolve location
  let locationId = body.locationId
  if (!locationId) {
    const { data: account } = await admin
      .from('user_crm_accounts')
      .select('location_id')
      .eq('user_id', auth.userId)
      .maybeSingle()
    locationId = account?.location_id
  }

  // Load location branding if no colors provided
  let colors = brandColors || {}
  if (!colors.primary && locationId) {
    const { data: brand } = await admin
      .from('location_branding')
      .select('primary_color, secondary_color, accent_color, background_color, text_color')
      .eq('location_id', locationId)
      .maybeSingle()
    if (brand) {
      colors = {
        primary: brand.primary_color || '#570301',
        accent: brand.secondary_color || brand.accent_color || '#C8792D',
        light: '#F4DCD0',
        dark: brand.text_color || '#272727',
      }
    }
  }

  // Enhance prompt with form/booking requests
  let fullPrompt = prompt
  if (includeForm) fullPrompt += '\n\nInclude a lead capture form with Name, Email, and Phone fields. Form submits to a placeholder action URL.'
  if (includeBooking && bookingUrl) fullPrompt += `\n\nInclude a prominent booking CTA button linking to: ${bookingUrl}`

  try {
    // Generate the landing page
    let html = await generateLandingPage(fullPrompt, colors, bookingUrl)

    // Inject CRO9 analytics
    const cro9Script = CRO9_SCRIPT.replace('{{LOCATION_ID}}', locationId || '')
    if (html.includes('<!-- CRO9_INJECT -->')) {
      html = html.replace('<!-- CRO9_INJECT -->', cro9Script)
    } else if (html.includes('</head>')) {
      html = html.replace('</head>', `${cro9Script}\n</head>`)
    } else {
      html = html + cro9Script
    }

    // Save to database
    const { data: saved } = await admin
      .from('web0n_projects')
      .insert({
        user_id: auth.userId,
        name: prompt.slice(0, 80),
        html,
        type: 'landing-page',
        location_id: locationId,
        status: 'draft',
      })
      .select('id')
      .single()

    // Optionally deploy to CRM funnel (if location has PIT)
    let funnelUrl: string | null = null
    if (locationId && LOCATION_PITS[locationId]) {
      // CRM funnel deployment would go here
      // For now, we save and let the user deploy from the console
    }

    return NextResponse.json({
      success: true,
      html,
      pageId: saved?.id,
      locationId,
      funnelUrl,
      cro9Embedded: true,
      message: 'Landing page generated with CRO9 analytics embedded. Deploy from console when ready.',
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
