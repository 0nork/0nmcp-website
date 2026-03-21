'use client'

import { useState, useEffect, useCallback, type ReactNode } from 'react'

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  tags: string[]
  dateAdded: string
  lastActivity: string
  company?: string
  address?: string
  source?: string
}

interface ContactsResponse {
  contacts: Contact[]
  total: number
  nextCursor?: string
}

const TAG_COLORS: Record<string, string> = {
  lead: '#7ed957',
  customer: '#00d4ff',
  vip: '#a78bfa',
  prospect: '#ff6b35',
  inactive: '#5f6672',
}

function getTagColor(tag: string): string {
  const lower = tag.toLowerCase()
  for (const [key, color] of Object.entries(TAG_COLORS)) {
    if (lower.includes(key)) return color
  }
  const hash = tag.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const palette = ['#7ed957', '#00d4ff', '#a78bfa', '#ff6b35', '#f472b6', '#fbbf24']
  return palette[hash % palette.length]
}

function isRecent(dateStr: string): boolean {
  if (!dateStr) return false
  const diff = Date.now() - new Date(dateStr).getTime()
  return diff < 7 * 24 * 60 * 60 * 1000 // 7 days
}

function Spinner(): ReactNode {
  return (
    <div style={{
      width: 20, height: 20, border: '2px solid rgba(255,255,255,0.1)',
      borderTopColor: '#7ed957', borderRadius: '50%',
      animation: 'crm-spin 0.6s linear infinite',
    }} />
  )
}

export default function ContactsView() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [total, setTotal] = useState(0)
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [newContact, setNewContact] = useState({ firstName: '', lastName: '', email: '', phone: '', tags: '' })

  const fetchContacts = useCallback(async (cursor?: string, searchQuery?: string) => {
    try {
      if (!cursor) setLoading(true)
      else setLoadingMore(true)
      setError(null)

      const params = new URLSearchParams()
      if (cursor) params.set('cursor', cursor)
      if (searchQuery) params.set('q', searchQuery)
      params.set('limit', '20')

      const res = await fetch(`/api/console/crm/contacts?${params}`)
      if (!res.ok) throw new Error(`Failed to fetch contacts (${res.status})`)
      const data: ContactsResponse = await res.json()

      if (cursor) {
        setContacts(prev => [...prev, ...data.contacts])
      } else {
        setContacts(data.contacts)
      }
      setTotal(data.total)
      setNextCursor(data.nextCursor)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const handleSearch = useCallback(() => {
    setNextCursor(undefined)
    fetchContacts(undefined, search)
  }, [fetchContacts, search])

  const handleAdd = useCallback(async () => {
    if (!newContact.firstName && !newContact.email) return
    try {
      setAddLoading(true)
      const res = await fetch('/api/console/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: newContact.firstName,
          lastName: newContact.lastName,
          email: newContact.email,
          phone: newContact.phone,
          tags: newContact.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })
      if (!res.ok) throw new Error('Failed to add contact')
      setNewContact({ firstName: '', lastName: '', email: '', phone: '', tags: '' })
      setShowAddForm(false)
      fetchContacts(undefined, search)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contact')
    } finally {
      setAddLoading(false)
    }
  }, [newContact, fetchContacts, search])

  return (
    <div style={{ padding: '2rem', maxWidth: 960, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#e8eaed', margin: '0 0 0.25rem', fontFamily: 'var(--font-display)' }}>
            Contacts
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#5f6672', margin: 0 }}>
            {total > 0 ? `${total} contact${total !== 1 ? 's' : ''}` : 'Manage your CRM contacts'}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(f => !f)}
          style={{
            padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid rgba(126,217,87,0.3)',
            background: 'rgba(126,217,87,0.08)', color: '#7ed957', fontSize: '0.8rem',
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(126,217,87,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(126,217,87,0.08)' }}
        >
          {showAddForm ? 'Cancel' : '+ Add Contact'}
        </button>
      </div>

      {/* Add Contact Form */}
      {showAddForm && (
        <div style={{
          padding: '1.25rem', borderRadius: 12, background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(126,217,87,0.15)', marginBottom: '1.25rem',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {[
              { key: 'firstName' as const, placeholder: 'First name' },
              { key: 'lastName' as const, placeholder: 'Last name' },
              { key: 'email' as const, placeholder: 'Email' },
              { key: 'phone' as const, placeholder: 'Phone' },
            ].map(field => (
              <input
                key={field.key}
                value={newContact[field.key]}
                onChange={e => setNewContact(prev => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                style={{
                  padding: '0.6rem 0.875rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)', color: '#e8eaed', fontSize: '0.8rem',
                  fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(126,217,87,0.3)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
            ))}
          </div>
          <input
            value={newContact.tags}
            onChange={e => setNewContact(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="Tags (comma-separated)"
            style={{
              padding: '0.6rem 0.875rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)', color: '#e8eaed', fontSize: '0.8rem',
              fontFamily: 'inherit', outline: 'none', width: '100%', boxSizing: 'border-box',
              marginBottom: '0.75rem',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(126,217,87,0.3)' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          />
          <button
            onClick={handleAdd}
            disabled={addLoading}
            style={{
              padding: '0.5rem 1.25rem', borderRadius: 8, border: 'none',
              background: '#7ed957', color: '#0f1419', fontSize: '0.8rem',
              fontWeight: 700, cursor: addLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', opacity: addLoading ? 0.6 : 1,
            }}
          >
            {addLoading ? 'Saving...' : 'Save Contact'}
          </button>
        </div>
      )}

      {/* Search */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
          placeholder="Search contacts by name, email, or phone..."
          style={{
            flex: 1, padding: '0.625rem 1rem', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
            color: '#e8eaed', fontSize: '0.8rem', fontFamily: 'inherit', outline: 'none',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = 'rgba(126,217,87,0.3)' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '0.625rem 1rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)', color: '#9aa0a8', fontSize: '0.8rem',
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
        >
          Search
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '1rem 1.25rem', borderRadius: 12, background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)', marginBottom: '1.25rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '0.8rem', color: '#ef4444' }}>{error}</span>
          <button
            onClick={() => fetchContacts(undefined, search)}
            style={{
              padding: '0.375rem 0.75rem', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)',
              background: 'transparent', color: '#ef4444', fontSize: '0.75rem',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              padding: '1.25rem', borderRadius: 12, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)', height: 72,
              animation: 'crm-pulse 1.5s ease-in-out infinite',
            }} />
          ))}
        </div>
      )}

      {/* Contact List */}
      {!loading && contacts.length === 0 && !error && (
        <div style={{
          padding: '3rem 1.5rem', textAlign: 'center', borderRadius: 12,
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>No contacts found</div>
          <p style={{ fontSize: '0.8rem', color: '#5f6672', margin: 0 }}>
            {search ? 'Try a different search term.' : 'Add your first contact to get started.'}
          </p>
        </div>
      )}

      {!loading && contacts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {contacts.map(contact => {
            const expanded = expandedId === contact.id
            const recent = isRecent(contact.lastActivity || contact.dateAdded)
            const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'Unknown'

            return (
              <div key={contact.id} style={{
                borderRadius: 12, background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${expanded ? 'rgba(126,217,87,0.15)' : 'rgba(255,255,255,0.06)'}`,
                overflow: 'hidden', transition: 'border-color 0.15s ease',
              }}>
                {/* Card header */}
                <button
                  onClick={() => setExpandedId(expanded ? null : contact.id)}
                  style={{
                    width: '100%', padding: '1rem 1.25rem', background: 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: '0.875rem', fontFamily: 'inherit',
                  }}
                >
                  {/* Status dot */}
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: recent ? '#7ed957' : '#3a3a4a',
                    boxShadow: recent ? '0 0 6px rgba(126,217,87,0.4)' : 'none',
                  }} />

                  {/* Name + email */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#e8eaed', marginBottom: 2 }}>
                      {name}
                    </div>
                    <div style={{
                      fontSize: '0.75rem', color: '#5f6672', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {contact.email || contact.phone || 'No contact info'}
                    </div>
                  </div>

                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: 200 }}>
                    {(contact.tags || []).slice(0, 3).map(tag => {
                      const color = getTagColor(tag)
                      return (
                        <span key={tag} style={{
                          fontSize: '0.65rem', fontWeight: 600, padding: '0.2rem 0.5rem',
                          borderRadius: 4, background: `${color}15`, color,
                          border: `1px solid ${color}25`, whiteSpace: 'nowrap',
                        }}>
                          {tag}
                        </span>
                      )
                    })}
                    {(contact.tags || []).length > 3 && (
                      <span style={{ fontSize: '0.65rem', color: '#5f6672', padding: '0.2rem 0.25rem' }}>
                        +{contact.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Chevron */}
                  <span style={{
                    fontSize: '0.75rem', color: '#5f6672', transition: 'transform 0.15s ease',
                    transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>
                    ▾
                  </span>
                </button>

                {/* Expanded details */}
                {expanded && (
                  <div style={{
                    padding: '0 1.25rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.04)',
                    paddingTop: '1rem',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                      {[
                        { label: 'Email', value: contact.email },
                        { label: 'Phone', value: contact.phone },
                        { label: 'Company', value: contact.company },
                        { label: 'Source', value: contact.source },
                        { label: 'Added', value: contact.dateAdded ? new Date(contact.dateAdded).toLocaleDateString() : null },
                        { label: 'Last Active', value: contact.lastActivity ? new Date(contact.lastActivity).toLocaleDateString() : null },
                      ].filter(f => f.value).map(field => (
                        <div key={field.label}>
                          <div style={{
                            fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase',
                            letterSpacing: '0.06em', color: '#5f6672', marginBottom: 4,
                          }}>
                            {field.label}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#9aa0a8' }}>
                            {field.value}
                          </div>
                        </div>
                      ))}
                    </div>
                    {contact.address && (
                      <div style={{ marginTop: '0.875rem' }}>
                        <div style={{
                          fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase',
                          letterSpacing: '0.06em', color: '#5f6672', marginBottom: 4,
                        }}>
                          Address
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#9aa0a8' }}>{contact.address}</div>
                      </div>
                    )}
                    {(contact.tags || []).length > 0 && (
                      <div style={{ marginTop: '0.875rem' }}>
                        <div style={{
                          fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase',
                          letterSpacing: '0.06em', color: '#5f6672', marginBottom: 6,
                        }}>
                          All Tags
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {contact.tags.map(tag => {
                            const color = getTagColor(tag)
                            return (
                              <span key={tag} style={{
                                fontSize: '0.65rem', fontWeight: 600, padding: '0.2rem 0.5rem',
                                borderRadius: 4, background: `${color}15`, color,
                                border: `1px solid ${color}25`,
                              }}>
                                {tag}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Load More */}
      {nextCursor && !loading && (
        <div style={{ textAlign: 'center', marginTop: '1.25rem' }}>
          <button
            onClick={() => fetchContacts(nextCursor, search)}
            disabled={loadingMore}
            style={{
              padding: '0.625rem 1.5rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)', color: '#9aa0a8', fontSize: '0.8rem',
              fontWeight: 600, cursor: loadingMore ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 8,
            }}
            onMouseEnter={e => { if (!loadingMore) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
          >
            {loadingMore ? <><Spinner /> Loading...</> : 'Load More'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes crm-spin { to { transform: rotate(360deg) } }
        @keyframes crm-pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.5 } }
      `}</style>
    </div>
  )
}
