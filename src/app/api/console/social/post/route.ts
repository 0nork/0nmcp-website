import { NextRequest, NextResponse } from 'next/server'

// ─── Types ───────────────────────────────────────────────────────

interface SocialPost {
  id: string
  content: string
  platforms: string[]
  hashtags: string[]
  status: 'posted' | 'failed' | 'scheduled' | 'pending'
  createdAt: string
  results?: { platform: string; success: boolean; url?: string }[]
}

// ─── In-Memory Store (mock) ──────────────────────────────────────
// In production this would be backed by Supabase or another database.

const posts: SocialPost[] = [
  {
    id: '1',
    content: 'Just shipped 0nMCP v2.0 with the patent-pending 0nVault Container System. 558 tools across 26 services. Stop building workflows. Start describing outcomes.',
    platforms: ['linkedin', 'reddit'],
    hashtags: ['0nMCP', 'AI', 'MCP', 'automation', 'orchestration'],
    status: 'posted',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    results: [
      { platform: 'linkedin', success: true, url: 'https://linkedin.com/posts/example-1' },
      { platform: 'reddit', success: true, url: 'https://reddit.com/r/MCP/comments/example-1' },
    ],
  },
  {
    id: '2',
    content: 'The 0n Standard (.0n files) is now open source. A universal config format for AI workflow orchestration. Check it out on npm: 0n-spec',
    platforms: ['dev_to', 'x_twitter'],
    hashtags: ['opensource', 'developer', 'workflow', 'config'],
    status: 'posted',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    results: [
      { platform: 'dev_to', success: true, url: 'https://dev.to/0nork/0n-standard' },
      { platform: 'x_twitter', success: true, url: 'https://x.com/0nork/status/example-2' },
    ],
  },
  {
    id: '3',
    content: 'Working on multi-party escrow for the 0nVault — X25519 ECDH key exchange with per-layer access matrices. The future of secure AI credential management.',
    platforms: ['linkedin'],
    hashtags: ['security', 'encryption', 'vault', 'AI'],
    status: 'failed',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    results: [
      { platform: 'linkedin', success: false },
    ],
  },
]

// ─── GET: Return recent posts ────────────────────────────────────

export async function GET() {
  return NextResponse.json({ posts })
}

// ─── POST: Create and distribute a post ──────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, platforms, hashtags } = body as {
      content?: string
      platforms?: string[]
      hashtags?: string[]
    }

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: 'At least one platform is required' },
        { status: 400 }
      )
    }

    const safeHashtags = Array.isArray(hashtags) ? hashtags : []

    // Build the full post body with hashtags appended
    const fullContent =
      content.trim() +
      (safeHashtags.length > 0
        ? '\n\n' + safeHashtags.map((t: string) => `#${t}`).join(' ')
        : '')

    // Mock posting to each platform
    // In production, this would call real platform APIs via the poster lib
    const results = platforms.map((platform: string) => {
      // Simulate success for connected platforms, failure for unconnected ones
      const connectedPlatforms = ['linkedin', 'reddit', 'dev_to']
      const success = connectedPlatforms.includes(platform)

      return {
        platform,
        success,
        url: success
          ? `https://${platform === 'dev_to' ? 'dev.to' : platform === 'x_twitter' ? 'x.com' : `${platform}.com`}/0nork/post-${Date.now()}`
          : undefined,
      }
    })

    // Store the post
    const newPost: SocialPost = {
      id: Date.now().toString(),
      content: fullContent,
      platforms,
      hashtags: safeHashtags,
      status: results.every((r) => r.success) ? 'posted' : results.some((r) => r.success) ? 'posted' : 'failed',
      createdAt: new Date().toISOString(),
      results,
    }

    posts.unshift(newPost)

    // Keep only last 100 posts in memory
    if (posts.length > 100) {
      posts.length = 100
    }

    return NextResponse.json({ success: true, results })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
