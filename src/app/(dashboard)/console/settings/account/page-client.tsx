'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { User, Building2, Mail, Globe, Key } from 'lucide-react'

export default function AccountPage() {
  const [account, setAccount] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/console/account').then(r => r.json()).then(d => { setAccount(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-2 border-white/10 border-t-[#487fff] rounded-full animate-spin" /></div>

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-[#fafafa]">Account Settings</h1>

      <Card className="bg-[#273142] border-white/10">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 rounded-xl bg-[#487fff]/10 flex items-center justify-center">
              <User className="w-6 h-6 text-[#487fff]" />
            </div>
            <div>
              <div className="text-lg font-bold text-[#fafafa]">{account.name || account.full_name || 'User'}</div>
              <div className="text-sm text-[#b4b4b4]">{account.email}</div>
              <Badge className="bg-[#487fff]/15 text-[#487fff] border-0 text-[9px] mt-1">{(account.plan || 'free').toUpperCase()}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label className="text-[#b4b4b4] text-xs">Full Name</Label><Input defaultValue={account.name || account.full_name || ''} className="bg-[#1a1a1a] border-white/10 text-[#fafafa] mt-1" /></div>
            <div><Label className="text-[#b4b4b4] text-xs">Email</Label><Input defaultValue={account.email || ''} disabled className="bg-[#1a1a1a] border-white/10 text-[#b4b4b4] mt-1" /></div>
            <div><Label className="text-[#b4b4b4] text-xs">Company</Label><Input defaultValue={account.company || ''} className="bg-[#1a1a1a] border-white/10 text-[#fafafa] mt-1" /></div>
            <div><Label className="text-[#b4b4b4] text-xs">Website</Label><Input defaultValue={account.website || ''} className="bg-[#1a1a1a] border-white/10 text-[#fafafa] mt-1" /></div>
          </div>

          {account.location_id && (
            <div className="pt-3 border-t border-white/10">
              <Label className="text-[#b4b4b4] text-xs">Sub-Location ID</Label>
              <code className="block mt-1 bg-[#1a1a1a] rounded-lg px-3 py-2 text-xs font-mono text-[#fafafa]">{account.location_id}</code>
            </div>
          )}

          <Button className="bg-[#487fff] text-white hover:bg-[#487fff]/80">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  )
}
