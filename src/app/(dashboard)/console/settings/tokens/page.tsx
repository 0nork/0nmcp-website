'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Key, Plus, Copy, Check, Trash2, Clock, Shield, ExternalLink } from 'lucide-react'

interface Token {
  id: string; name: string; token_prefix: string; scopes: string[]
  last_used_at: string | null; expires_at: string | null; revoked: boolean; created_at: string
}

const CONNECTED_APPS = [
  { name: '0n for Slack', description: 'Execute 0nMCP tools from any Slack channel', icon: 'Sl', color: '#4A154B', url: 'https://slack.com/apps', status: 'available' },
  { name: '0nGPT', description: 'Use 0nMCP tools inside ChatGPT via MCP', icon: 'GP', color: '#10a37f', url: 'https://chatgpt.com', status: 'available' },
  { name: '0nPress', description: 'WordPress plugin — AI content + SEO automation', icon: 'WP', color: '#21759B', url: '/console/store', status: 'available' },
  { name: '0n Chrome Extension', description: 'Quick-access to 0nMCP tools from any browser tab', icon: 'Cr', color: '#4285F4', url: '/console/store', status: 'coming_soon' },
  { name: '0n for Claude', description: 'MCP server config for Claude Desktop', icon: 'Cl', color: '#D4A574', url: 'https://0nmcp.com/install', status: 'available' },
  { name: '0n for Cursor', description: 'MCP server config for Cursor IDE', icon: 'Cu', color: '#000000', url: 'https://0nmcp.com/install', status: 'available' },
]

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newToken, setNewToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [revoking, setRevoking] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/tokens').then(r => r.json()).then(d => { setTokens(d.tokens || []); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    const res = await fetch('/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), scopes: ['read', 'write', 'execute'] }),
    })
    const data = await res.json()
    if (data.token) {
      setNewToken(data.token)
      setNewName('')
      // Refresh list
      const listRes = await fetch('/api/tokens')
      const listData = await listRes.json()
      setTokens(listData.tokens || [])
    }
    setCreating(false)
  }

  async function handleRevoke(id: string) {
    setRevoking(id)
    await fetch('/api/tokens', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token_id: id }),
    })
    setTokens(prev => prev.map(t => t.id === id ? { ...t, revoked: true } : t))
    setRevoking(null)
  }

  function copyToken() {
    if (newToken) { navigator.clipboard.writeText(newToken); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><div className="w-8 h-8 border-2 border-white/10 border-t-[#487fff] rounded-full animate-spin" /></div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#fafafa] mb-1">API Tokens</h1>
        <p className="text-sm text-[#b4b4b4]">
          Generate tokens to connect external apps to your 0nMCP account. Each token grants access to your tools, workflows, and integrations.
        </p>
      </div>

      {/* Create Token */}
      <Card className="bg-[#273142] border-white/10">
        <CardContent className="p-5">
          <h3 className="text-sm font-bold text-[#fafafa] mb-3 flex items-center gap-2"><Plus className="w-4 h-4" /> Create New Token</h3>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Token name (e.g. Slack Bot, Chrome Extension)" className="bg-[#1a1a1a] border-white/10 text-[#fafafa] placeholder:text-[#b4b4b4]" onKeyDown={e => e.key === 'Enter' && handleCreate()} />
            </div>
            <Button onClick={handleCreate} disabled={creating || !newName.trim()} className="bg-[#487fff] text-white hover:bg-[#487fff]/80">
              {creating ? 'Creating...' : 'Generate Token'}
            </Button>
          </div>

          {/* New token display — shown ONCE */}
          {newToken && (
            <div className="mt-4 rounded-lg bg-[#22D3A5]/10 border border-[#22D3A5]/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-[#22D3A5]" />
                <span className="text-sm font-bold text-[#22D3A5]">Token created — copy it now</span>
              </div>
              <div className="flex gap-2">
                <code className="flex-1 bg-[#1a1a1a] rounded-lg px-3 py-2 text-xs font-mono text-[#fafafa] overflow-x-auto">{newToken}</code>
                <Button size="sm" onClick={copyToken} className="bg-[#22D3A5] text-[#141414] hover:bg-[#22D3A5]/80 shrink-0">
                  {copied ? <><Check className="w-3.5 h-3.5 mr-1" /> Copied</> : <><Copy className="w-3.5 h-3.5 mr-1" /> Copy</>}
                </Button>
              </div>
              <p className="text-[10px] text-[#b4b4b4] mt-2">This token will not be shown again. Store it securely.</p>
              <Button size="sm" variant="ghost" className="mt-2 text-[#b4b4b4] hover:text-[#fafafa]" onClick={() => setNewToken(null)}>Dismiss</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Tokens */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#b4b4b4] mb-3">Active Tokens</h2>
        {tokens.filter(t => !t.revoked).length === 0 ? (
          <Card className="bg-[#273142] border-white/10">
            <CardContent className="p-8 text-center">
              <Key className="w-8 h-8 text-[#b4b4b4] mx-auto mb-2" />
              <p className="text-sm text-[#b4b4b4]">No active tokens. Create one above to connect external apps.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {tokens.filter(t => !t.revoked).map(token => (
              <Card key={token.id} className="bg-[#273142] border-white/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#487fff]/10 flex items-center justify-center shrink-0">
                    <Key className="w-4 h-4 text-[#487fff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#fafafa]">{token.name}</div>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-[#b4b4b4] font-mono">
                      <span>{token.token_prefix}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(token.created_at).toLocaleDateString()}</span>
                      {token.last_used_at && <span>Last used: {new Date(token.last_used_at).toLocaleDateString()}</span>}
                    </div>
                    <div className="flex gap-1 mt-1">
                      {token.scopes.map(s => <Badge key={s} className="bg-white/5 text-[#b4b4b4] border-0 text-[8px]">{s}</Badge>)}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" disabled={revoking === token.id} onClick={() => handleRevoke(token.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 shrink-0">
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> {revoking === token.id ? 'Revoking...' : 'Revoke'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Revoked Tokens */}
      {tokens.filter(t => t.revoked).length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#b4b4b4] mb-3">Revoked</h2>
          <div className="space-y-2">
            {tokens.filter(t => t.revoked).map(token => (
              <Card key={token.id} className="bg-[#273142] border-white/10 opacity-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <Key className="w-4 h-4 text-[#b4b4b4]" />
                  <span className="text-sm text-[#b4b4b4] line-through">{token.name}</span>
                  <span className="text-[10px] text-[#b4b4b4] font-mono ml-auto">{token.token_prefix}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Connected Apps */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#b4b4b4] mb-3">Connect Your Apps</h2>
        <p className="text-xs text-[#b4b4b4] mb-3">Use your API token to connect these apps to your 0nMCP account.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CONNECTED_APPS.map(app => (
            <Card key={app.name} className="bg-[#273142] border-white/10">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: `${app.color}20`, color: app.color }}>
                  {app.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#fafafa]">{app.name}</div>
                  <p className="text-[10px] text-[#b4b4b4]">{app.description}</p>
                </div>
                {app.status === 'coming_soon' ? (
                  <Badge className="bg-white/5 text-[#b4b4b4] border-0 text-[9px] shrink-0">Coming Soon</Badge>
                ) : (
                  <Button size="sm" variant="outline" className="border-white/10 text-[#fafafa] hover:bg-white/5 shrink-0" asChild>
                    <a href={app.url} target={app.url.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" /> Connect
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
