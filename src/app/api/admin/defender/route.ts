import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'

const ADMIN_EMAILS = ['mike@rocketopp.com']
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
const DEFENDER_REPO = 'Crypto-Goatz/0nDefender'

async function requireAdmin() {
  const supabase = await createSupabaseServer()
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Check email whitelist OR is_admin in DB
  if (ADMIN_EMAILS.includes(user.email || '')) return user

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (profile?.is_admin) return user
  return null
}

/**
 * GET /api/admin/defender — Fetch latest scan results from GitHub
 */
export async function GET() {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Fetch last-scan.json from the defender repo
    const res = await fetch(
      `https://api.github.com/repos/${DEFENDER_REPO}/contents/logs/last-scan.json`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': '0nmcp-admin/1.0',
        },
        next: { revalidate: 300 },
      }
    )

    if (!res.ok) {
      return NextResponse.json({ scan: null, message: 'No scan data found' })
    }

    const data = await res.json()
    const content = Buffer.from(data.content, 'base64').toString('utf-8')
    const scan = JSON.parse(content)

    return NextResponse.json({ scan })
  } catch (err) {
    console.error('Defender API error:', err)
    return NextResponse.json({ scan: null, message: 'Failed to fetch scan data' })
  }
}

/**
 * POST /api/admin/defender — Trigger scan or email report
 * Body: { action: 'scan' | 'email' }
 */
export async function POST(request: NextRequest) {
  const user = await requireAdmin()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { action } = await request.json()

  if (action === 'scan') {
    // Trigger GitHub Actions workflow dispatch
    try {
      const res = await fetch(
        `https://api.github.com/repos/${DEFENDER_REPO}/actions/workflows/defender-scan.yml/dispatches`,
        {
          method: 'POST',
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': '0nmcp-admin/1.0',
          },
          body: JSON.stringify({ ref: 'main' }),
        }
      )

      if (res.ok || res.status === 204) {
        return NextResponse.json({ message: 'Scan triggered via GitHub Actions. Results will update in ~2 minutes.' })
      }

      const error = await res.text()
      return NextResponse.json({ message: `Failed to trigger scan: ${res.status}`, error }, { status: 500 })
    } catch (err) {
      return NextResponse.json({ message: `Scan trigger failed: ${err instanceof Error ? err.message : 'unknown'}` }, { status: 500 })
    }
  }

  if (action === 'email') {
    // Fetch scan results and format email
    try {
      const scanRes = await fetch(
        `https://api.github.com/repos/${DEFENDER_REPO}/contents/logs/last-scan.json`,
        {
          headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
            'User-Agent': '0nmcp-admin/1.0',
          },
        }
      )

      if (!scanRes.ok) {
        return NextResponse.json({ message: 'No scan data to email' }, { status: 404 })
      }

      const data = await scanRes.json()
      const content = Buffer.from(data.content, 'base64').toString('utf-8')
      const scan = JSON.parse(content)

      const threats = (scan.results || []).filter((r: { level: string }) => r.level !== 'CLEAN')
      const subject = `0nDefender Report — ${threats.length} threat${threats.length === 1 ? '' : 's'} detected`
      const body = [
        `0nDefender Scan Report`,
        `Date: ${scan.timestamp}`,
        `Total Scanned: ${scan.results?.length || 0}`,
        '',
        ...threats.map((t: { level: string; repo: string; score: number }) =>
          `[${t.level}] ${t.repo} — Score: ${t.score}/100\n  https://github.com/${t.repo}`
        ),
        '',
        threats.length === 0 ? 'No active threats. Brand is clean.' : 'Action required for HIGH/CRITICAL threats.',
        '',
        '— 0nDefender v1.0.0',
      ].join('\n')

      // Try SendGrid if available
      const sendgridKey = process.env.SENDGRID_API_KEY
      const notifyEmail = process.env.NOTIFY_EMAIL || 'mike@rocketopp.com'

      if (sendgridKey) {
        const emailRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sendgridKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: notifyEmail }] }],
            from: { email: 'defender@0nmcp.com', name: '0nDefender' },
            subject,
            content: [{ type: 'text/plain', value: body }],
          }),
        })

        if (emailRes.ok || emailRes.status === 202) {
          return NextResponse.json({ message: `Report emailed to ${notifyEmail}` })
        }
      }

      // Fallback — return the report content
      return NextResponse.json({ message: 'SendGrid not configured. Report generated.', subject, body })
    } catch (err) {
      return NextResponse.json({ message: `Email failed: ${err instanceof Error ? err.message : 'unknown'}` }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
