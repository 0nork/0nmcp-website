import blogData from '@/data/blog-posts.json'

const CATEGORIES = [
  { id: 'all', label: 'All Posts', color: '#2dd4bf' },
  { id: 'release', label: 'Releases', color: '#34d399' },
  { id: 'tutorial', label: 'Tutorials', color: '#3b82f6' },
  { id: 'security', label: 'Security', color: '#ef4444' },
  { id: 'comparison', label: 'Comparisons', color: '#8b5cf6' },
  { id: 'integration', label: 'Integrations', color: '#f97316' },
  { id: 'deep-dive', label: 'Deep Dives', color: '#fbbf24' },
]

const EXTERNAL_FEEDS = [
  {
    name: 'Rocket Articles',
    description: 'Raw and uncut articles about marketing and AI. All the things your "guru" doesn\'t want you to know.',
    url: 'https://rocketarticles.com',
    feedUrl: 'https://rocketarticles.com/feed',
    status: 'coming-soon' as const,
    color: '#f97316',
  },
  {
    name: 'CRM Changelog',
    description: 'Latest CRM platform updates, new features, and API changes.',
    url: 'https://ideas.gohighlevel.com/changelog',
    feedUrl: 'https://ideas.gohighlevel.com/api/changelog/feed.rss',
    status: 'live' as const,
    color: '#3b82f6',
  },
]

export default function FeedsPage() {
  const posts = blogData.posts || []
  const categoryCount = (cat: string) => cat === 'all' ? posts.length : posts.filter((p: any) => p.category === cat).length

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, color: '#f0f0f0', marginBottom: 8 }}>
        RSS <span style={{ color: '#2dd4bf' }}>Feeds</span>
      </h1>
      <p style={{ color: '#666', fontSize: 16, marginBottom: 40, lineHeight: 1.6 }}>
        Subscribe to any feed. Filter by category. Never miss a post.
      </p>

      {/* Main RSS Feed */}
      <div style={{
        background: '#111', border: '1px solid #222',
        borderRadius: 16, padding: 28, marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#f0f0f0', margin: '0 0 4px' }}>0nMCP Blog</h2>
            <p style={{ color: '#666', fontSize: 13 }}>{posts.length} articles — releases, tutorials, security, comparisons</p>
          </div>
          <a href="/rss" style={{
            padding: '8px 16px', background: 'rgba(45,212,191,0.1)',
            border: '1px solid rgba(45,212,191,0.2)', borderRadius: 8,
            color: '#2dd4bf', fontSize: 13, fontWeight: 600, textDecoration: 'none',
          }}>Subscribe RSS</a>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <a key={cat.id} href={cat.id === 'all' ? '/rss' : `/rss?category=${cat.id}`} style={{
              padding: '6px 14px', borderRadius: 8,
              background: `${cat.color}10`, border: `1px solid ${cat.color}25`,
              color: cat.color, fontSize: 12, fontWeight: 600,
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {cat.label}
              <span style={{ fontSize: 10, opacity: 0.7 }}>({categoryCount(cat.id)})</span>
            </a>
          ))}
        </div>
      </div>

      {/* External Feeds */}
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#666', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Partner Feeds
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
        {EXTERNAL_FEEDS.map(feed => (
          <div key={feed.name} style={{
            background: '#111', border: '1px solid #222',
            borderRadius: 14, padding: 22,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', margin: 0 }}>{feed.name}</h4>
              {feed.status === 'coming-soon' ? (
                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>SOON</span>
              ) : (
                <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 700, background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>LIVE</span>
              )}
            </div>
            <p style={{ color: '#666', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>{feed.description}</p>
            {feed.status === 'live' ? (
              <a href={feed.feedUrl} style={{
                padding: '6px 14px', background: `${feed.color}10`,
                border: `1px solid ${feed.color}25`, borderRadius: 6,
                color: feed.color, fontSize: 12, fontWeight: 600, textDecoration: 'none',
              }}>Subscribe RSS →</a>
            ) : (
              <span style={{ fontSize: 12, color: '#444' }}>Feed launching soon</span>
            )}
          </div>
        ))}
      </div>

      {/* Recent Posts Preview */}
      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#666', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Latest Posts
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {posts.slice(0, 6).map((post: any) => {
          const cat = CATEGORIES.find(c => c.id === post.category)
          return (
            <a key={post.slug} href={`/blog/${post.slug}`} style={{
              background: '#111', border: '1px solid #222',
              borderRadius: 10, padding: '16px 20px', textDecoration: 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              transition: 'border-color 0.15s',
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f0', marginBottom: 4 }}>{post.title}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{post.date} · {post.author}</div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: 6, fontSize: 10, fontWeight: 600,
                background: `${cat?.color || '#666'}10`, color: cat?.color || '#666',
              }}>{post.category}</span>
            </a>
          )
        })}
      </div>

      {/* How to Subscribe */}
      <div style={{
        background: '#111', border: '1px solid #222',
        borderRadius: 14, padding: 24, marginTop: 32, textAlign: 'center',
      }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f0', marginBottom: 8 }}>How to Subscribe</h3>
        <p style={{ color: '#666', fontSize: 13, lineHeight: 1.7, maxWidth: 500, margin: '0 auto 16px' }}>
          Copy the RSS URL below and paste it into your feed reader — Feedly, Inoreader, NetNewsWire, or any RSS app.
        </p>
        <code style={{
          display: 'inline-block', padding: '10px 20px',
          background: '#0a0a0a', border: '1px solid #222', borderRadius: 8,
          color: '#2dd4bf', fontSize: 14,
        }}>https://0nmcp.com/rss</code>
      </div>
    </div>
  )
}
