'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Users, Mail, Phone, Tag, ChevronRight, X, RefreshCw, Building2 } from 'lucide-react'

interface Contact {
  id: string; name: string; firstName: string; lastName: string
  email: string; phone: string; tags: string[]; source: string
  dateAdded: string; companyName: string
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchTimer, setSearchTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState<Contact | null>(null)
  const [locationId, setLocationId] = useState('')
  const [locationName, setLocationName] = useState('')

  // Get active location
  useEffect(() => {
    fetch('/api/console/locations')
      .then(r => r.json())
      .then(data => {
        const active = data.activeId || 'nphConTwfHcVE1oA0uep'
        setLocationId(active)
        const loc = (data.locations || []).find((l: { id: string }) => l.id === active)
        setLocationName(loc?.name || 'CRM')
      })
      .catch(() => setLocationId('nphConTwfHcVE1oA0uep'))
  }, [])

  // Fetch contacts when location or search changes
  useEffect(() => {
    if (!locationId) return
    setLoading(true)
    const url = `/api/console/contacts?locationId=${locationId}&limit=50${search ? `&search=${encodeURIComponent(search)}` : ''}`
    fetch(url)
      .then(r => r.json())
      .then(data => {
        setContacts(data.contacts || [])
        setTotal(data.total || data.count || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [locationId, search])

  function handleSearch(value: string) {
    if (searchTimer) clearTimeout(searchTimer)
    const timer = setTimeout(() => setSearch(value), 400)
    setSearchTimer(timer)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#fafafa] mb-1">Contacts</h1>
          <p className="text-sm text-[#b4b4b4] flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" /> {locationName} — {total} contacts
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setSearch(''); setLoading(true); fetch(`/api/console/contacts?locationId=${locationId}&limit=50`).then(r => r.json()).then(d => { setContacts(d.contacts || []); setTotal(d.total || 0); setLoading(false) }) }} className="border-white/10 text-[#fafafa] gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b4b4b4]" />
        <Input
          defaultValue={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search contacts by name, email, or phone..."
          className="pl-9 bg-[#273142] border-white/10 text-[#fafafa] placeholder:text-[#b4b4b4]"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: total, icon: Users, color: '#487fff' },
          { label: 'With Email', value: contacts.filter(c => c.email).length, icon: Mail, color: '#22D3A5' },
          { label: 'With Phone', value: contacts.filter(c => c.phone).length, icon: Phone, color: '#F5C518' },
          { label: 'Tagged', value: contacts.filter(c => c.tags?.length > 0).length, icon: Tag, color: '#F97316' },
        ].map(s => (
          <Card key={s.label} className="bg-[#273142] border-white/10">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                <s.icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-lg font-bold text-[#fafafa]">{s.value}</div>
                <div className="text-[10px] text-[#b4b4b4]">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
        </div>
      ) : contacts.length === 0 ? (
        <Card className="bg-[#273142] border-white/10">
          <CardContent className="p-12 text-center">
            <Users className="w-10 h-10 text-[#b4b4b4] mx-auto mb-3" />
            <h3 className="text-lg font-bold text-[#fafafa] mb-2">{search ? 'No Results' : 'No Contacts'}</h3>
            <p className="text-sm text-[#b4b4b4]">{search ? `No contacts match "${search}"` : 'Contacts from your CRM will appear here.'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1.5">
          {contacts.map(contact => (
            <Card key={contact.id} className="bg-[#273142] border-white/10 hover:border-primary/30 cursor-pointer transition-all duration-200 hover:translate-x-0.5 group" onClick={() => setSelected(contact)}>
              <CardContent className="p-3.5 flex items-center gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                  {contact.firstName?.charAt(0) || contact.name?.charAt(0) || '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#fafafa] truncate">{contact.name || 'No Name'}</div>
                  <div className="text-[10px] text-[#b4b4b4] truncate">{contact.email || contact.phone || 'No contact info'}</div>
                </div>

                {/* Tags */}
                <div className="hidden md:flex gap-1 shrink-0">
                  {contact.tags?.slice(0, 2).map(tag => (
                    <Badge key={tag} className="bg-white/5 text-[#b4b4b4] border-0 text-[8px]">{tag}</Badge>
                  ))}
                  {(contact.tags?.length || 0) > 2 && <Badge className="bg-white/5 text-[#b4b4b4] border-0 text-[8px]">+{contact.tags.length - 2}</Badge>}
                </div>

                {/* Source */}
                {contact.source && <span className="hidden lg:inline text-[9px] text-[#b4b4b4] font-mono">{contact.source}</span>}

                <ChevronRight className="w-4 h-4 text-[#b4b4b4] shrink-0 group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contact Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <Card className="relative bg-[#273142] border-white/10 max-w-md w-full z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300" onClick={e => e.stopPropagation()}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                    {selected.firstName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#fafafa]">{selected.name || 'No Name'}</h2>
                    {selected.companyName && <p className="text-xs text-[#b4b4b4]">{selected.companyName}</p>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelected(null)} className="text-[#b4b4b4] hover:text-[#fafafa]"><X className="w-4 h-4" /></Button>
              </div>

              <div className="space-y-2">
                {selected.email && (
                  <div className="flex items-center gap-3 rounded-lg bg-[#1a1a1a] p-3">
                    <Mail className="w-4 h-4 text-primary" />
                    <div><div className="text-[10px] text-[#b4b4b4]">Email</div><div className="text-sm text-[#fafafa]">{selected.email}</div></div>
                  </div>
                )}
                {selected.phone && (
                  <div className="flex items-center gap-3 rounded-lg bg-[#1a1a1a] p-3">
                    <Phone className="w-4 h-4 text-[#22D3A5]" />
                    <div><div className="text-[10px] text-[#b4b4b4]">Phone</div><div className="text-sm text-[#fafafa]">{selected.phone}</div></div>
                  </div>
                )}
                <div className="flex items-center gap-3 rounded-lg bg-[#1a1a1a] p-3">
                  <Tag className="w-4 h-4 text-[#F97316]" />
                  <div>
                    <div className="text-[10px] text-[#b4b4b4]">Tags</div>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {selected.tags?.length ? selected.tags.map(t => <Badge key={t} className="bg-white/5 text-[#fafafa] border-0 text-[9px]">{t}</Badge>) : <span className="text-xs text-[#b4b4b4]">No tags</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-[#b4b4b4]">
                <span>Source: {selected.source || 'unknown'}</span>
                <span>·</span>
                <span>Added: {selected.dateAdded ? new Date(selected.dateAdded).toLocaleDateString() : 'unknown'}</span>
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="bg-primary text-white flex-1" onClick={() => window.open(`mailto:${selected.email}`)}>
                  <Mail className="w-3.5 h-3.5 mr-1" /> Email
                </Button>
                {selected.phone && (
                  <Button size="sm" variant="outline" className="border-white/10 text-[#fafafa] flex-1" onClick={() => window.open(`tel:${selected.phone}`)}>
                    <Phone className="w-3.5 h-3.5 mr-1" /> Call
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
