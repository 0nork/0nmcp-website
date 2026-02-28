import { NextRequest, NextResponse } from 'next/server'
import { QA_DISTRIBUTION_TEMPLATE } from '@/data/premium-templates/qa-distribution.0n'

const TEMPLATES_REGISTRY: Record<string, typeof QA_DISTRIBUTION_TEMPLATE> = {
  'qa-distribution': QA_DISTRIBUTION_TEMPLATE,
}

export async function GET() {
  const templates = Object.entries(TEMPLATES_REGISTRY).map(([id, tmpl]) => ({
    id,
    name: tmpl.name,
    description: tmpl.description,
    icon: tmpl.icon,
    category: tmpl.category,
    premium: tmpl.premium,
  }))

  return NextResponse.json({ templates })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateId, config } = body

    if (!templateId || typeof templateId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid templateId' }, { status: 400 })
    }

    if (!config || typeof config !== 'object') {
      return NextResponse.json({ error: 'Missing or invalid config' }, { status: 400 })
    }

    const template = TEMPLATES_REGISTRY[templateId]
    if (!template) {
      return NextResponse.json(
        { error: `Template "${templateId}" not found` },
        { status: 404 }
      )
    }

    const operationId = crypto.randomUUID()

    return NextResponse.json({
      success: true,
      activated: true,
      operationId,
      template: {
        id: templateId,
        name: template.name,
        category: template.category,
      },
    })
  } catch (error) {
    console.error('Premium template activation error:', error)
    return NextResponse.json(
      { error: 'Failed to activate template' },
      { status: 500 }
    )
  }
}
