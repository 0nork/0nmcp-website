import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured', text: '[error: no API key]' }, { status: 500 })
  }

  try {
    const { system, user } = await request.json()

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system,
        messages: [{ role: 'user', content: user }],
      }),
    })

    const data = await res.json()

    // Surface actual API errors instead of silent [no response]
    if (!res.ok || data.type === 'error') {
      const errMsg = data.error?.message || data.message || JSON.stringify(data)
      console.error('Anthropic API error:', res.status, errMsg)
      return NextResponse.json({
        text: `[error: ${errMsg}]`,
        error: errMsg,
        status: res.status,
      })
    }

    const text = data.content?.[0]?.text || '[no response]'
    return NextResponse.json({ text })
  } catch (error) {
    console.error('Council API error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to call AI',
      text: `[error: ${error instanceof Error ? error.message : 'network failure'}]`,
    }, { status: 500 })
  }
}
