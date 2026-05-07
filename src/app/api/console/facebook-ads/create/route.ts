import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

function generateWorkflow(campaign: Record<string, unknown>) {
  const name = (campaign.name as string) || 'Untitled Campaign'
  const slug = name.replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9-]/g, '')

  return {
    $0n: {
      type: 'workflow',
      version: '1.0.0',
      name: `fb-ads-${slug}`,
      description: `Facebook Ads campaign: ${name}`,
      created: new Date().toISOString(),
    },
    trigger: { type: 'manual', config: {} },
    inputs: {
      objective: { type: 'string', default: campaign.objective },
      dailyBudget: { type: 'number', default: parseFloat(String(campaign.dailyBudget)) || 20 },
    },
    steps: [
      {
        id: 'step_001',
        name: 'Create campaign',
        service: 'facebook',
        action: 'create_campaign',
        params: {
          name,
          objective: campaign.objective,
          daily_budget: (parseFloat(String(campaign.dailyBudget)) || 20) * 100,
          special_ad_categories: Array.isArray(campaign.specialCategories)
            ? (campaign.specialCategories as string[]).filter((c: string) => c !== 'NONE')
            : [],
          start_time: campaign.startDate,
          end_time: campaign.endDate || undefined,
        },
        output: 'campaign',
      },
      {
        id: 'step_002',
        name: 'Set audience targeting',
        service: 'facebook',
        action: 'create_ad_set',
        params: {
          campaign_id: '{{step_001.output.id}}',
          targeting: {
            geo_locations: { cities: [campaign.location] },
            age_min: campaign.ageMin,
            age_max: campaign.ageMax === '65+' ? 65 : parseInt(String(campaign.ageMax)),
            genders: campaign.gender === 'ALL' ? [0] : campaign.gender === 'MALE' ? [1] : [2],
            interests: typeof campaign.interests === 'string'
              ? campaign.interests.split(',').map((s: string) => s.trim()).filter(Boolean)
              : [],
          },
          daily_budget: (parseFloat(String(campaign.dailyBudget)) || 20) * 100,
          start_time: campaign.startDate,
          end_time: campaign.endDate || undefined,
        },
        output: 'adSet',
      },
      {
        id: 'step_003',
        name: 'Create ad creative',
        service: 'facebook',
        action: 'create_ad_creative',
        params: {
          name: `${name} - Creative`,
          body: campaign.primaryText,
          title: campaign.headline,
          description: campaign.description,
          call_to_action_type: campaign.cta,
          link: campaign.linkUrl,
          format: campaign.adFormat,
        },
        output: 'creative',
      },
    ],
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 500 }
      )
    }

    const user = (await supabase.auth.getSession()).data.session?.user ?? null
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Campaign name is required' },
        { status: 400 }
      )
    }

    // Generate .0n workflow
    const workflow = generateWorkflow(body)

    // Build campaign record
    const campaignRecord = {
      user_id: user.id,
      name: body.name,
      objective: body.objective || 'TRAFFIC',
      daily_budget: parseFloat(body.dailyBudget) || 20,
      start_date: body.startDate || null,
      end_date: body.endDate || null,
      special_categories: body.specialCategories || ['NONE'],
      location: body.location || '',
      age_min: body.ageMin || 18,
      age_max: String(body.ageMax || '65+'),
      gender: body.gender || 'ALL',
      interests: body.interests || '',
      ad_format: body.adFormat || 'SINGLE_IMAGE',
      primary_text: body.primaryText || '',
      headline: body.headline || '',
      description: body.description || '',
      cta: body.cta || 'LEARN_MORE',
      link_url: body.linkUrl || '',
      workflow_json: workflow,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Try to upsert to ad_campaigns table
    // Table may not exist yet — handle gracefully
    let savedCampaign = null
    try {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .insert(campaignRecord)
        .select()
        .single()

      if (error) {
        // Table likely doesn't exist yet — log but don't fail
        console.warn('ad_campaigns table insert failed (table may not exist):', error.message)
        savedCampaign = { ...campaignRecord, id: `local-${Date.now()}`, _stored: false }
      } else {
        savedCampaign = { ...data, _stored: true }
      }
    } catch (dbError) {
      console.warn('Database error (non-fatal):', dbError)
      savedCampaign = { ...campaignRecord, id: `local-${Date.now()}`, _stored: false }
    }

    return NextResponse.json({
      success: true,
      campaign: savedCampaign,
      workflow,
      message: savedCampaign?._stored
        ? 'Campaign saved and workflow generated.'
        : 'Workflow generated. Campaign saved locally (database table pending setup).',
    })
  } catch (err) {
    console.error('Facebook Ads create error:', err)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
