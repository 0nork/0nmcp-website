import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import ProfileClient from './ProfileClient'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function getAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null
  return createClient(supabaseUrl, serviceRoleKey)
}

function reputationColor(level?: string) {
  switch (level) {
    case 'legend': return '#ff69b4'
    case 'expert': return '#FFD700'
    case 'power_user': return '#ff6b35'
    case 'contributor': return '#9945ff'
    case 'member': return '#00d4ff'
    default: return '#55556a'
  }
}

function reputationLabel(level?: string) {
  switch (level) {
    case 'legend': return 'Legend'
    case 'expert': return 'Expert'
    case 'power_user': return 'Power User'
    case 'contributor': return 'Contributor'
    case 'member': return 'Member'
    default: return 'Newcomer'
  }
}

function roleLabel(role?: string) {
  switch (role) {
    case 'developer': return 'Developer'
    case 'founder': return 'Founder'
    case 'agency': return 'Agency'
    case 'enterprise': return 'Enterprise'
    case 'hobbyist': return 'Hobbyist'
    default: return null
  }
}

async function getProfile(id: string) {
  const admin = getAdmin()
  if (!admin) return null

  const { data: profile } = await admin
    .from('profiles')
    .select('id, full_name, bio, avatar_url, karma, reputation_level, role, interests, created_at, is_persona')
    .eq('id', id)
    .single()

  if (!profile) return null

  const [{ data: badges }, { data: threads }, { data: replies }] = await Promise.all([
    admin
      .from('community_user_badges')
      .select('earned_at, community_badges(name, slug, icon, description, color, tier)')
      .eq('user_id', id)
      .order('earned_at', { ascending: false }),
    admin
      .from('community_threads')
      .select('id, title, slug, score, reply_count, view_count, created_at, community_groups(name, slug, icon, color)')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
    admin
      .from('community_posts')
      .select('id, body, score, created_at, thread_id, community_threads(title, slug)')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return { profile, badges: badges || [], threads: threads || [], replies: replies || [] }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const data = await getProfile(id)

  if (!data) {
    return { title: 'Profile Not Found — 0nMCP' }
  }

  const { profile } = data
  const name = profile.full_name || 'Community Member'
  const role = roleLabel(profile.role)
  const description = profile.bio
    || `${name}${role ? ` is a ${role}` : ''} in the 0nMCP community with ${profile.karma || 0} karma.`

  return {
    title: `${name} — 0nMCP Community`,
    description: description.slice(0, 155),
    openGraph: {
      title: `${name} — 0nMCP Community`,
      description: description.slice(0, 155),
      url: `https://0nmcp.com/u/${id}`,
      type: 'profile',
      ...(profile.avatar_url ? { images: [{ url: profile.avatar_url }] } : {}),
    },
    alternates: { canonical: `https://0nmcp.com/u/${id}` },
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await getProfile(id)

  if (!data) notFound()

  const { profile, badges, threads, replies } = data
  const name = profile.full_name || 'Community Member'
  const role = roleLabel(profile.role)
  const repLevel = reputationLabel(profile.reputation_level)
  const repColor = reputationColor(profile.reputation_level)
  const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Person JSON-LD
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url: `https://0nmcp.com/u/${id}`,
    ...(profile.bio ? { description: profile.bio } : {}),
    ...(profile.avatar_url ? { image: profile.avatar_url } : {}),
  }

  return (
    <div className="pt-28 pb-24 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />

        {/* Profile Header */}
        <div
          className="rounded-xl p-6 mb-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-start gap-5">
            {/* Avatar */}
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={name}
                className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                style={{ border: `2px solid ${repColor}` }}
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black flex-shrink-0"
                style={{ background: repColor + '20', color: repColor, border: `2px solid ${repColor}` }}
              >
                {initials}
              </div>
            )}

            <div className="flex-1 min-w-0">
              {/* Name + badges */}
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-2xl font-bold">{name}</h1>
                {profile.is_persona && (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded" style={{ background: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>
                    AI Persona
                  </span>
                )}
              </div>

              {/* Role + Rep */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                {role && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                    {role}
                  </span>
                )}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: repColor + '15', color: repColor }}>
                  {repLevel}
                </span>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <div>
                  <span className="font-bold" style={{ color: '#ff6b35' }}>{profile.karma || 0}</span> karma
                </div>
                <div>
                  Member since <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{memberSince}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-4 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
              {profile.bio}
            </p>
          )}

          {/* Interest Chips */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {profile.interests.map((interest: string) => (
                <span
                  key={interest}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid rgba(126,217,87,0.2)' }}
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Client-side tabs for threads/replies + badges */}
        <ProfileClient badges={badges} threads={threads} replies={replies} />
      </div>
    </div>
  )
}
