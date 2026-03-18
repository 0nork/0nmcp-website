'use client'

import { useState, useEffect, type ReactNode } from 'react'

interface Contact {
  id: string
  firstName?: string
  lastName?: string
  name?: string
  email?: string
  phone?: string
  tags?: string[]
  dateAdded?: string
  source?: string
  company?: string
}

interface Conversation {
  id: string
  contactId?: string
  contactName?: string
  lastMessageBody?: string
  lastMessageDate?: string
  unreadCount?: number
  type?: string
}

interface Pipeline {
  id: string
  name: string
  stages?: { id: string; name: string; position?: number }[]
}

interface Appointment {
  id: string
  title?: string
  contactId?: string
  startTime?: string
  endTime?: string
  status?: string
}

interface CRMData {
  contacts: Contact[]
  totalContacts: number
  conversations: Conversation[]
  pipelines: Pipeline[]
  appointments: Appointment[]
  tags: string[]
}

const COLORS = {
  bg: '#0a0a0f',
  card: 'rgba(255,255,255,0.03)',
  cardHover: 'rgba(255,255,255,0.055)',
  border: 'rgba(255,255,255,0.06)',
  borderLight: 'rgba(255,255,255,0.1)',
  accent: '#7ed957',
  accentDim: 'rgba(126,217,87,0.12)',
  cyan: '#00d4ff',
  cyanDim: 'rgba(0,212,255,0.12)',
  purple: '#a78bfa',
  purpleDim: 'rgba(167,139,250,0.12)',
  orange: '#ff6b35',
  orangeDim: 'rgba(255,107,53,0.12)',
  textPrimary: '#e8eaed',
  textSecondary: '#9aa0a8',
  textMuted: '#5f6672',
}

const STAGE_COLORS = [
  '#7ed957', '#00d4ff', '#a78bfa', '#ff6b35', '#f472b6',
  '#fbbf24', '#34d399', '#60a5fa', '#e879f9', '#fb923c',
]

const AVATAR_COLORS = [
  '#7ed957', '#00d4ff', '#a78bfa', '#ff6b35', '#f472b6',
  '#fbbf24', '#34d399', '#60a5fa', '#818cf8', '#fb923c',
]

function getInitial(contact: Contact): string {
  const name = contact.firstName || contact.name || contact.email || '?'
  return name.charAt(0).toUpperCase()
}

function getDisplayName(contact: Contact): string {
  if (contact.firstName && contact.lastName) return `${contact.firstName} ${contact.lastName}`
  if (contact.name) return contact.name
  if (contact.firstName) return contact.firstName
  return contact.email || 'Unknown'
}

function getAvatarColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function timeAgo(dateStr: string | undefined): string {
  if (!dateStr) return ''
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

interface CrmLocation {
  id: string
  name: string
  isActive: boolean
}

export default function CRMPage() {
  const [data, setData] = useState<CRMData>({
    contacts: [],
    totalContacts: 0,
    conversations: [],
    pipelines: [],
    appointments: [],
    tags: [],
  })
  const [loading, setLoading] = useState(true)
  const [expandedContact, setExpandedContact] = useState<string | null>(null)
  const [locations, setLocations] = useState<CrmLocation[]>([])
  const [activeLocation, setActiveLocation] = useState<string>('')
  const [switchingLocation, setSwitchingLocation] = useState(false)

  // Proof of Life state
  const [proofRunning, setProofRunning] = useState(false)
  const [proofResult, setProofResult] = useState<{
    success: boolean
    contactId?: string
    steps: Array<{ step: string; status: string; data?: unknown; error?: string }>
    message?: string
  } | null>(null)

  const runProof = async () => {
    setProofRunning(true)
    setProofResult(null)
    try {
      const res = await fetch('/api/console/crm/proof', { method: 'POST' })
      const data = await res.json()
      setProofResult(data)
      // Refresh contacts list after successful proof
      if (data.success) {
        setTimeout(() => window.location.reload(), 2000)
      }
    } catch (err) {
      setProofResult({
        success: false,
        steps: [{ step: 'request', status: 'failed', error: err instanceof Error ? err.message : 'Network error' }],
        message: 'Request failed',
      })
    } finally {
      setProofRunning(false)
    }
  }

  // Load available locations
  useEffect(() => {
    fetch('/api/console/crm/locations')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.locations) {
          setLocations(d.locations)
          setActiveLocation(d.activeLocationId || d.locations[0]?.id || '')
        }
      })
      .catch(() => {})
  }, [])

  // Switch location handler
  const handleSwitchLocation = async (locId: string) => {
    setSwitchingLocation(true)
    setActiveLocation(locId)
    try {
      await fetch('/api/console/crm/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId: locId }),
      })
      // Reload CRM data for new location
      window.location.reload()
    } catch {
      setSwitchingLocation(false)
    }
  }

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      try {
        const [contactsRes, convoRes, pipeRes, calRes] = await Promise.allSettled([
          fetch('/api/console/crm/contacts?limit=20'),
          fetch('/api/console/crm/conversations?limit=10'),
          fetch('/api/console/crm/pipelines'),
          fetch('/api/console/crm/calendar'),
        ])

        const contacts: Contact[] = []
        let totalContacts = 0
        const allTags: Set<string> = new Set()

        if (contactsRes.status === 'fulfilled' && contactsRes.value.ok) {
          const d = await contactsRes.value.json()
          contacts.push(...(d.contacts || []))
          totalContacts = d.total || contacts.length
          contacts.forEach((c: Contact) => c.tags?.forEach((t: string) => allTags.add(t)))
        }

        let conversations: Conversation[] = []
        if (convoRes.status === 'fulfilled' && convoRes.value.ok) {
          const d = await convoRes.value.json()
          conversations = d.conversations || []
        }

        let pipelines: Pipeline[] = []
        if (pipeRes.status === 'fulfilled' && pipeRes.value.ok) {
          const d = await pipeRes.value.json()
          pipelines = d.pipelines || []
        }

        let appointments: Appointment[] = []
        if (calRes.status === 'fulfilled' && calRes.value.ok) {
          const d = await calRes.value.json()
          appointments = d.appointments || []
        }

        if (!cancelled) {
          setData({
            contacts,
            totalContacts,
            conversations,
            pipelines,
            appointments,
            tags: Array.from(allTags),
          })
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAll()
    return () => { cancelled = true }
  }, [])

  const statCards = [
    { label: 'Contacts', value: data.totalContacts, color: COLORS.accent, dimColor: COLORS.accentDim, icon: contactsIcon() },
    { label: 'Conversations', value: data.conversations.length, color: COLORS.cyan, dimColor: COLORS.cyanDim, icon: conversationsIcon() },
    { label: 'Pipelines', value: data.pipelines.length, color: COLORS.purple, dimColor: COLORS.purpleDim, icon: pipelinesIcon() },
    { label: 'Tags', value: data.tags.length, color: COLORS.orange, dimColor: COLORS.orangeDim, icon: tagsIcon() },
  ]

  if (loading) {
    return (
      <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.accentDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.textPrimary, margin: 0, fontFamily: 'var(--font-display)' }}>CRM</h1>
            <p style={{ fontSize: '0.8rem', color: COLORS.textMuted, margin: 0 }}>Loading your CRM data...</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12,
              padding: '1.25rem', height: 100,
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
        <style>{`@keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.7; } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: 1200, margin: '0 auto', width: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
        <div style={{
          width: 42, height: 42, borderRadius: 11,
          background: `linear-gradient(135deg, ${COLORS.accentDim}, rgba(0,212,255,0.08))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `1px solid ${COLORS.border}`,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: COLORS.textPrimary, margin: 0, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            CRM
          </h1>
          <p style={{ fontSize: '0.78rem', color: COLORS.textMuted, margin: 0 }}>
            {data.totalContacts} contacts &middot; {data.pipelines.length} pipeline{data.pipelines.length !== 1 ? 's' : ''} &middot; {data.tags.length} tags
          </p>
        </div>

        {/* Location Switcher */}
        {locations.length > 0 && (
          <select
            value={activeLocation}
            onChange={e => handleSwitchLocation(e.target.value)}
            disabled={switchingLocation}
            style={{
              padding: '8px 32px 8px 14px',
              borderRadius: 10,
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              color: COLORS.textPrimary,
              fontSize: '0.8rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              outline: 'none',
              cursor: switchingLocation ? 'wait' : 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2364748b' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              minWidth: 180,
            }}
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name || loc.id.slice(0, 12) + '...'}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '1.5rem' }}>
        {statCards.map(s => (
          <div key={s.label} style={{
            background: COLORS.card,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 12,
            padding: '1.125rem 1.25rem',
            position: 'relative',
            overflow: 'hidden',
            transition: 'border-color 0.2s, background 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${s.color}33`; e.currentTarget.style.background = COLORS.cardHover }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.background = COLORS.card }}
          >
            {/* Subtle glow */}
            <div style={{
              position: 'absolute', top: -20, right: -20, width: 80, height: 80,
              borderRadius: '50%', background: s.dimColor, filter: 'blur(30px)', opacity: 0.5,
            }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {s.label}
                </div>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 9,
                background: s.dimColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {s.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.875rem', alignItems: 'start' }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

          {/* Recent Contacts */}
          <div style={{
            background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12,
            padding: '1.25rem', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: COLORS.textPrimary }}>Recent Contacts</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                  background: COLORS.accentDim, color: COLORS.accent,
                }}>{data.contacts.length}</span>
              </div>
              <span style={{ fontSize: 11, color: COLORS.textMuted }}>Last 24h</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data.contacts.slice(0, 10).map((contact) => {
                const name = getDisplayName(contact)
                const initial = getInitial(contact)
                const avatarBg = getAvatarColor(contact.id || name)
                const isExpanded = expandedContact === contact.id

                return (
                  <div key={contact.id}>
                    <div
                      onClick={() => setExpandedContact(isExpanded ? null : contact.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.6rem 0.625rem', borderRadius: 8,
                        cursor: 'pointer',
                        background: isExpanded ? 'rgba(255,255,255,0.04)' : 'transparent',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'rgba(255,255,255,0.025)' }}
                      onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent' }}
                    >
                      {/* Avatar */}
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: `${avatarBg}20`,
                        border: `1.5px solid ${avatarBg}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: avatarBg,
                        flexShrink: 0,
                      }}>
                        {initial}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {name}
                        </div>
                        <div style={{ fontSize: 11, color: COLORS.textMuted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {contact.email || 'No email'}
                        </div>
                      </div>

                      {/* Tags */}
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 200 }}>
                        {(contact.tags || []).slice(0, 3).map(tag => (
                          <span key={tag} style={{
                            fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                            background: COLORS.accentDim, color: COLORS.accent,
                            whiteSpace: 'nowrap',
                          }}>{tag}</span>
                        ))}
                        {(contact.tags || []).length > 3 && (
                          <span style={{ fontSize: 9, color: COLORS.textMuted }}>+{(contact.tags || []).length - 3}</span>
                        )}
                      </div>

                      {/* Chevron */}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s', flexShrink: 0 }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div style={{
                        padding: '0.75rem 0.625rem 0.75rem 3.5rem',
                        background: 'rgba(255,255,255,0.02)', borderRadius: '0 0 8px 8px',
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.5rem',
                        fontSize: 11,
                      }}>
                        {contact.phone && (
                          <div>
                            <span style={{ color: COLORS.textMuted }}>Phone: </span>
                            <span style={{ color: COLORS.textSecondary }}>{contact.phone}</span>
                          </div>
                        )}
                        {contact.company && (
                          <div>
                            <span style={{ color: COLORS.textMuted }}>Company: </span>
                            <span style={{ color: COLORS.textSecondary }}>{contact.company}</span>
                          </div>
                        )}
                        {contact.source && (
                          <div>
                            <span style={{ color: COLORS.textMuted }}>Source: </span>
                            <span style={{ color: COLORS.textSecondary }}>{contact.source}</span>
                          </div>
                        )}
                        {contact.dateAdded && (
                          <div>
                            <span style={{ color: COLORS.textMuted }}>Added: </span>
                            <span style={{ color: COLORS.textSecondary }}>{timeAgo(contact.dateAdded)}</span>
                          </div>
                        )}
                        {(contact.tags || []).length > 0 && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <span style={{ color: COLORS.textMuted }}>All tags: </span>
                            <span style={{ color: COLORS.textSecondary }}>{(contact.tags || []).join(', ')}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {data.contacts.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', color: COLORS.textMuted, fontSize: 12 }}>
                  No contacts found. Connect your CRM to get started.
                </div>
              )}
            </div>
          </div>

          {/* Pipeline View */}
          <div style={{
            background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12,
            padding: '1.25rem', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: COLORS.textPrimary }}>Pipelines</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                background: COLORS.purpleDim, color: COLORS.purple,
              }}>{data.pipelines.length}</span>
            </div>

            {data.pipelines.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: COLORS.textMuted, fontSize: 12 }}>
                No pipelines configured.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.pipelines.map((pipeline) => (
                  <div key={pipeline.id}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 8 }}>
                      {pipeline.name}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(pipeline.stages || [])
                        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                        .map((stage, idx) => {
                          const stageColor = STAGE_COLORS[idx % STAGE_COLORS.length]
                          return (
                            <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{
                                fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                                background: `${stageColor}18`, color: stageColor,
                                border: `1px solid ${stageColor}30`,
                                whiteSpace: 'nowrap',
                              }}>{stage.name}</span>
                              {idx < (pipeline.stages || []).length - 1 && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={COLORS.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                                  <polyline points="9 18 15 12 9 6" />
                                </svg>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

          {/* Recent Messages */}
          <div style={{
            background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12,
            padding: '1.25rem', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: COLORS.textPrimary }}>Recent Messages</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                background: COLORS.cyanDim, color: COLORS.cyan,
              }}>{data.conversations.length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data.conversations.slice(0, 8).map((convo) => {
                const isUnread = (convo.unreadCount || 0) > 0
                return (
                  <div key={convo.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.5rem 0.5rem', borderRadius: 8,
                    transition: 'background 0.15s', cursor: 'pointer',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    {/* Unread dot */}
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                      background: isUnread ? COLORS.accent : 'transparent',
                      boxShadow: isUnread ? `0 0 6px ${COLORS.accent}60` : 'none',
                    }} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12, fontWeight: isUnread ? 700 : 500,
                        color: isUnread ? COLORS.textPrimary : COLORS.textSecondary,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {convo.contactName || 'Unknown Contact'}
                      </div>
                      <div style={{
                        fontSize: 11, color: COLORS.textMuted,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {convo.lastMessageBody || 'No messages yet'}
                      </div>
                    </div>

                    <span style={{ fontSize: 10, color: COLORS.textMuted, flexShrink: 0, whiteSpace: 'nowrap' }}>
                      {timeAgo(convo.lastMessageDate)}
                    </span>
                  </div>
                )
              })}

              {data.conversations.length === 0 && (
                <div style={{ padding: '1.5rem', textAlign: 'center', color: COLORS.textMuted, fontSize: 12 }}>
                  No conversations yet.
                </div>
              )}
            </div>
          </div>

          {/* Proof of Life */}
          <div style={{
            background: proofResult?.success ? 'rgba(126,217,87,0.06)' : COLORS.card,
            border: `1px solid ${proofResult?.success ? 'rgba(126,217,87,0.3)' : COLORS.border}`,
            borderRadius: 12, padding: '1.25rem', overflow: 'hidden',
            transition: 'all 0.3s',
          }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: COLORS.textPrimary, display: 'block', marginBottom: '0.5rem' }}>
              Console → CRM Proof
            </span>
            <p style={{ fontSize: 11, color: COLORS.textMuted, margin: '0 0 0.875rem 0', lineHeight: 1.5 }}>
              Creates a real contact in CRM with tags + note. Check your CRM after clicking.
            </p>

            <button
              onClick={runProof}
              disabled={proofRunning}
              style={{
                width: '100%', padding: '0.75rem', borderRadius: 10,
                background: proofRunning
                  ? COLORS.card
                  : `linear-gradient(135deg, ${COLORS.accent}, #5cb83a)`,
                border: 'none', color: proofRunning ? COLORS.textMuted : '#000',
                fontSize: 13, fontWeight: 700, cursor: proofRunning ? 'wait' : 'pointer',
                fontFamily: 'inherit', letterSpacing: '-0.01em',
                boxShadow: proofRunning ? 'none' : `0 2px 12px rgba(126,217,87,0.3)`,
                transition: 'all 0.2s',
              }}
            >
              {proofRunning ? 'Running proof...' : 'Run Proof of Life'}
            </button>

            {/* Step-by-step results */}
            {proofResult && (
              <div style={{ marginTop: '0.875rem' }}>
                {proofResult.steps.map((step, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.375rem 0', fontSize: 11,
                  }}>
                    <span style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 700,
                      background: step.status === 'success' ? 'rgba(126,217,87,0.2)' : 'rgba(255,107,53,0.2)',
                      color: step.status === 'success' ? COLORS.accent : COLORS.orange,
                    }}>
                      {step.status === 'success' ? '✓' : '✗'}
                    </span>
                    <span style={{ color: COLORS.textSecondary, fontFamily: 'var(--font-mono)' }}>
                      {step.step}
                    </span>
                    <span style={{
                      marginLeft: 'auto', fontSize: 10, fontWeight: 600,
                      color: step.status === 'success' ? COLORS.accent : COLORS.orange,
                    }}>
                      {step.status}
                    </span>
                  </div>
                ))}

                {proofResult.success && proofResult.contactId && (
                  <div style={{
                    marginTop: '0.625rem', padding: '0.625rem', borderRadius: 8,
                    background: 'rgba(126,217,87,0.08)',
                    border: '1px solid rgba(126,217,87,0.2)',
                    fontSize: 11, color: COLORS.accent, fontWeight: 600, lineHeight: 1.5,
                  }}>
                    Contact created. Open CRM → search &quot;0n-proof-of-life&quot; tag.
                    <br />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, opacity: 0.8 }}>
                      ID: {proofResult.contactId}
                    </span>
                  </div>
                )}

                {!proofResult.success && proofResult.message && (
                  <div style={{
                    marginTop: '0.625rem', padding: '0.625rem', borderRadius: 8,
                    background: 'rgba(255,107,53,0.08)',
                    border: '1px solid rgba(255,107,53,0.2)',
                    fontSize: 11, color: COLORS.orange, lineHeight: 1.5,
                  }}>
                    {proofResult.message}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div style={{
            background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12,
            padding: '1.25rem', overflow: 'hidden',
          }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: COLORS.textPrimary, display: 'block', marginBottom: '0.875rem' }}>
              Quick Actions
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {[
                { label: 'Add Contact', gradient: `linear-gradient(135deg, ${COLORS.accent}, #5cb83a)`, icon: addContactIcon() },
                { label: 'Send Message', gradient: `linear-gradient(135deg, ${COLORS.cyan}, #0099cc)`, icon: sendMessageIcon() },
                { label: 'View Calendar', gradient: `linear-gradient(135deg, ${COLORS.purple}, #7c3aed)`, icon: calendarIcon() },
                { label: 'View Pipeline', gradient: `linear-gradient(135deg, ${COLORS.orange}, #e85d2a)`, icon: pipelineIcon() },
              ].map(action => (
                <div key={action.label} style={{
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  padding: '0.75rem', borderRadius: 10,
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${COLORS.border}`,
                  cursor: 'pointer',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = COLORS.borderLight }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = COLORS.border }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: action.gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}>
                    {action.icon}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSecondary }}>
                    {action.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Appointments mini */}
          {data.appointments.length > 0 && (
            <div style={{
              background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12,
              padding: '1.25rem', overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: COLORS.textPrimary }}>Upcoming</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                  background: COLORS.orangeDim, color: COLORS.orange,
                }}>{data.appointments.length}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {data.appointments.slice(0, 5).map((appt) => (
                  <div key={appt.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.375rem 0.5rem', borderRadius: 6,
                    fontSize: 11,
                  }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: appt.status === 'confirmed' ? COLORS.accent : COLORS.orange,
                    }} />
                    <span style={{ flex: 1, color: COLORS.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {appt.title || 'Appointment'}
                    </span>
                    <span style={{ color: COLORS.textMuted, fontSize: 10, flexShrink: 0 }}>
                      {appt.startTime ? new Date(appt.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Responsive override for small screens */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: '1.5fr 1fr'"],
          div[style*="gridTemplateColumns: repeat(4"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}


/* ─── SVG Icon Helpers ─── */

function contactsIcon(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function conversationsIcon(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.cyan} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function pipelinesIcon(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.purple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function tagsIcon(): ReactNode {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  )
}

function addContactIcon(): ReactNode {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  )
}

function sendMessageIcon(): ReactNode {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function calendarIcon(): ReactNode {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function pipelineIcon(): ReactNode {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}
