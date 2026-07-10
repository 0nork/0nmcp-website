'use client'

import { useState, useEffect } from 'react'
import { IntegrationOrbit } from '@/components/console/IntegrationOrbit'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertCircle, CheckCircle2, Info, XCircle, Zap, Shield, Link2, Mail, Users, Layers,
  ChevronRight, Bell, Settings, BarChart3, ArrowUpRight, ArrowDownRight, TrendingUp,
  Search, Plus, Download, MoreHorizontal, Eye, Pencil, Trash2, Star
} from 'lucide-react'

const ADMIN_EMAIL = 'mike@rocketopp.com'

// ── Section wrapper ──
function Section({ id, title, description, children }: {
  id: string; title: string; description: string; children: React.ReactNode
}) {
  return (
    <section id={id} className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
      {children}
    </section>
  )
}

// ── Demo card wrapper ──
function Demo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-700/30 bg-[#0F1419] p-5 space-y-3">
      <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{label}</div>
      {children}
    </div>
  )
}

export default function StyleDocsPage() {
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/console/account')
      .then(r => r.json())
      .then(data => {
        if (data?.email === ADMIN_EMAIL) setAuthorized(true)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-[#6EE05A] rounded-full animate-spin" />
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-neutral-500 text-sm">
        Admin access required.
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">0nMCP Style Docs</h1>
        <p className="text-sm text-neutral-400 mb-4">
          Live component library. Every element below is rendered natively in our dark theme.
          Screenshot any section and share it with Claude Code to request that exact style.
        </p>
        {/* Jump nav */}
        <div className="flex flex-wrap gap-1.5">
          {['colors', 'typography', 'buttons', 'badges', 'cards', 'stat-cards', 'alerts', 'tables', 'forms', 'tabs', 'loading', 'lists'].map(s => (
            <a key={s} href={`#${s}`} className="px-2.5 py-1 rounded-md bg-[#0F1419] border border-neutral-700/30 text-xs text-neutral-400 hover:text-[#6EE05A] hover:border-[#6EE05A]/30 transition-colors font-mono">
              {s}
            </a>
          ))}
        </div>
      </div>

      {/* ═══════ COLORS ═══════ */}
      <Section id="colors" title="Colors" description="Brand tokens — these drive every component. Change the token, everything follows.">
        <Demo label="Brand Palette">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Primary', value: '#6EE05A', tw: 'bg-[#6EE05A]' },
              { name: 'Background', value: '#080B0F', tw: 'bg-[#080B0F]' },
              { name: 'Card', value: '#0F1419', tw: 'bg-[#0F1419]' },
              { name: 'Sidebar', value: '#0A0D12', tw: 'bg-[#0A0D12]' },
              { name: 'Border', value: '#1A2030', tw: 'bg-[#1A2030]' },
              { name: 'Muted Text', value: '#6B7280', tw: 'bg-[#6B7280]' },
            ].map(c => (
              <div key={c.name} className="space-y-2">
                <div className={`h-16 rounded-lg border border-neutral-700/50 ${c.tw}`} />
                <div className="text-xs font-medium text-neutral-300">{c.name}</div>
                <div className="text-[10px] font-mono text-neutral-500">{c.value}</div>
              </div>
            ))}
          </div>
        </Demo>
        <Demo label="Status Colors">
          <div className="flex flex-wrap gap-3">
            {[
              { name: 'Success', value: '#10B981', tw: 'bg-emerald-500' },
              { name: 'Warning', value: '#F59E0B', tw: 'bg-amber-500' },
              { name: 'Error', value: '#EF4444', tw: 'bg-red-500' },
              { name: 'Info', value: '#3B82F6', tw: 'bg-blue-500' },
              { name: 'Purple', value: '#8B5CF6', tw: 'bg-violet-500' },
              { name: 'Cyan', value: '#06B6D4', tw: 'bg-cyan-500' },
            ].map(c => (
              <div key={c.name} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-md ${c.tw}`} />
                <div>
                  <div className="text-xs text-neutral-300">{c.name}</div>
                  <div className="text-[10px] font-mono text-neutral-500">{c.value}</div>
                </div>
              </div>
            ))}
          </div>
        </Demo>
      </Section>

      {/* ═══════ TYPOGRAPHY ═══════ */}
      <Section id="typography" title="Typography" description="Font scale and weights used across the console.">
        <Demo label="Headings">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-white">Heading 1 — 2.25rem Bold</h1>
            <h2 className="text-3xl font-bold text-white">Heading 2 — 1.875rem Bold</h2>
            <h3 className="text-2xl font-semibold text-white">Heading 3 — 1.5rem Semibold</h3>
            <h4 className="text-xl font-semibold text-white">Heading 4 — 1.25rem Semibold</h4>
            <h5 className="text-lg font-medium text-white">Heading 5 — 1.125rem Medium</h5>
            <h6 className="text-base font-medium text-white">Heading 6 — 1rem Medium</h6>
          </div>
        </Demo>
        <Demo label="Body Text">
          <p className="text-sm text-neutral-300 leading-relaxed">Body text — 0.875rem. This is how most content reads. The quick brown fox jumps over the lazy dog. Your 9 workflows are built and ready.</p>
          <p className="text-xs text-neutral-400 leading-relaxed">Small text — 0.75rem. Used for labels, timestamps, secondary info.</p>
          <p className="text-[10px] text-neutral-500 font-mono leading-relaxed">Mono caption — 0.625rem. Used for status bars, counts, technical labels.</p>
        </Demo>
      </Section>

      {/* ═══════ BUTTONS ═══════ */}
      <Section id="buttons" title="Buttons" description="All button variants from shadcn/ui — rendered in our dark theme.">
        <Demo label="Variants">
          <div className="flex flex-wrap gap-3">
            <Button className="bg-[#6EE05A] text-[#080B0F] hover:bg-[#7FF06A]">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost" className="underline">Link</Button>
          </div>
        </Demo>
        <Demo label="Sizes">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg" className="bg-[#6EE05A] text-[#080B0F]">Large</Button>
            <Button size="default" className="bg-[#6EE05A] text-[#080B0F]">Default</Button>
            <Button size="sm" className="bg-[#6EE05A] text-[#080B0F]">Small</Button>
            <Button size="icon" className="bg-[#6EE05A] text-[#080B0F]"><Plus className="w-4 h-4" /></Button>
          </div>
        </Demo>
        <Demo label="With Icons">
          <div className="flex flex-wrap gap-3">
            <Button className="bg-[#6EE05A] text-[#080B0F] gap-2"><Zap className="w-4 h-4" /> Run Workflow</Button>
            <Button variant="outline" className="gap-2"><Download className="w-4 h-4" /> Export</Button>
            <Button variant="ghost" className="gap-2"><Settings className="w-4 h-4" /> Settings</Button>
            <Button variant="destructive" className="gap-2"><Trash2 className="w-4 h-4" /> Delete</Button>
          </div>
        </Demo>
        <Demo label="States">
          <div className="flex flex-wrap gap-3">
            <Button className="bg-[#6EE05A] text-[#080B0F]">Active</Button>
            <Button disabled className="bg-[#6EE05A] text-[#080B0F]">Disabled</Button>
            <Button className="bg-[#6EE05A] text-[#080B0F] opacity-70 cursor-wait gap-2">
              <div className="w-3.5 h-3.5 border-2 border-[#080B0F]/30 border-t-[#080B0F] rounded-full animate-spin" />
              Loading
            </Button>
          </div>
        </Demo>
      </Section>

      {/* ═══════ BADGES ═══════ */}
      <Section id="badges" title="Badges" description="Status indicators, tags, and label pills.">
        <Demo label="Variants">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-[#6EE05A]/15 text-[#6EE05A] border-[#6EE05A]/30">Active</Badge>
            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30">Pending</Badge>
            <Badge className="bg-red-500/15 text-red-400 border-red-500/30">Error</Badge>
            <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30">Info</Badge>
            <Badge className="bg-violet-500/15 text-violet-400 border-violet-500/30">AI</Badge>
            <Badge className="bg-cyan-500/15 text-cyan-400 border-cyan-500/30">New</Badge>
            <Badge variant="outline">Default</Badge>
            <Badge variant="destructive">Critical</Badge>
          </div>
        </Demo>
        <Demo label="Service Badges (use these for workflow tags)">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-[#6EE05A]/12 text-[#6EE05A] border-0 text-[10px] font-bold font-mono uppercase">CRM</Badge>
            <Badge className="bg-[#3ECF8E]/12 text-[#3ECF8E] border-0 text-[10px] font-bold font-mono uppercase">SUPABASE</Badge>
            <Badge className="bg-[#635BFF]/12 text-[#635BFF] border-0 text-[10px] font-bold font-mono uppercase">STRIPE</Badge>
            <Badge className="bg-[#4A154B]/30 text-[#E0B3E6] border-0 text-[10px] font-bold font-mono uppercase">SLACK</Badge>
            <Badge className="bg-amber-500/12 text-amber-400 border-0 text-[10px] font-bold font-mono uppercase">SPA LIGONIER</Badge>
          </div>
        </Demo>
        <Demo label="Dot Badges">
          <div className="flex flex-wrap gap-4">
            {[
              { label: 'Online', color: 'bg-[#6EE05A]', pulse: true },
              { label: 'Pending', color: 'bg-amber-500', pulse: true },
              { label: 'Offline', color: 'bg-neutral-600', pulse: false },
              { label: 'Error', color: 'bg-red-500', pulse: false },
            ].map(d => (
              <div key={d.label} className="flex items-center gap-2 text-xs text-neutral-300">
                <span className={`w-2 h-2 rounded-full ${d.color} ${d.pulse ? 'animate-pulse' : ''}`} />
                {d.label}
              </div>
            ))}
          </div>
        </Demo>
      </Section>

      {/* ═══════ CARDS ═══════ */}
      <Section id="cards" title="Cards" description="Card containers — the primary content wrapper for console pages.">
        <Demo label="Basic Cards">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-[#0F1419] border-neutral-700/30">
              <CardHeader>
                <CardTitle className="text-white text-sm">Basic Card</CardTitle>
                <CardDescription className="text-neutral-500">With header and description</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-neutral-400">Card content goes here. Use for any grouped content block.</p>
              </CardContent>
            </Card>
            <Card className="bg-[#0F1419] border-neutral-700/30 border-l-4 border-l-[#6EE05A]">
              <CardHeader>
                <CardTitle className="text-white text-sm">Accent Border</CardTitle>
                <CardDescription className="text-neutral-500">Left border accent</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-neutral-400">Use border-l-4 with brand color for emphasis.</p>
              </CardContent>
            </Card>
            <Card className="bg-[#6EE05A]/5 border-[#6EE05A]/20">
              <CardHeader>
                <CardTitle className="text-[#6EE05A] text-sm">Highlight Card</CardTitle>
                <CardDescription className="text-neutral-400">Green tinted background</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-neutral-400">Use for featured or active items.</p>
              </CardContent>
            </Card>
          </div>
        </Demo>
      </Section>

      {/* ═══════ STAT CARDS ═══════ */}
      <Section id="stat-cards" title="Stat Cards" description="Dashboard metric cards — numbers, trends, sparklines.">
        <Demo label="Metric Cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Total Tools', value: '1,640+', change: '+47', trend: 'up', icon: Zap, color: '#6EE05A' },
              { title: 'Services', value: '111', change: '+6', trend: 'up', icon: Link2, color: '#06B6D4' },
              { title: 'Workflows', value: '26', change: '0', trend: 'neutral', icon: BarChart3, color: '#8B5CF6' },
              { title: 'Vault Keys', value: '49', change: '-2', trend: 'down', icon: Shield, color: '#F59E0B' },
            ].map(s => (
              <Card key={s.title} className="bg-[#0F1419] border-neutral-700/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-neutral-500">{s.title}</span>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                      <s.icon className="w-4 h-4" style={{ color: s.color }} />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
                  <div className="flex items-center gap-1 text-xs">
                    {s.trend === 'up' && <ArrowUpRight className="w-3 h-3 text-emerald-400" />}
                    {s.trend === 'down' && <ArrowDownRight className="w-3 h-3 text-red-400" />}
                    {s.trend === 'neutral' && <TrendingUp className="w-3 h-3 text-neutral-500" />}
                    <span className={s.trend === 'up' ? 'text-emerald-400' : s.trend === 'down' ? 'text-red-400' : 'text-neutral-500'}>
                      {s.change}
                    </span>
                    <span className="text-neutral-600">this week</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Demo>
      </Section>

      {/* ═══════ ALERTS ═══════ */}
      <Section id="alerts" title="Alerts & Callouts" description="Notification banners — info, warning, error, success.">
        <Demo label="Alert Variants">
          <div className="space-y-3">
            {[
              { icon: CheckCircle2, title: 'Success', desc: 'Webhook registered successfully. 9 workflows now active.', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', borderL: 'border-l-emerald-500', iconColor: 'text-emerald-400', titleColor: 'text-emerald-300' },
              { icon: AlertCircle, title: 'Warning', desc: 'CRM webhooks not connected. Workflows built but not firing.', bg: 'bg-amber-500/10', border: 'border-amber-500/30', borderL: 'border-l-amber-500', iconColor: 'text-amber-400', titleColor: 'text-amber-300' },
              { icon: XCircle, title: 'Error', desc: 'ONMCP_URL unreachable. Console limited to 15 tools.', bg: 'bg-red-500/10', border: 'border-red-500/30', borderL: 'border-l-red-500', iconColor: 'text-red-400', titleColor: 'text-red-300' },
              { icon: Info, title: 'Info', desc: 'New npm version available. 0nmcp v3.2.3 adds 12 tools.', bg: 'bg-blue-500/10', border: 'border-blue-500/30', borderL: 'border-l-blue-500', iconColor: 'text-blue-400', titleColor: 'text-blue-300' },
            ].map(a => (
              <div key={a.title} className={`rounded-lg border ${a.border} border-l-4 ${a.borderL} ${a.bg} p-4 flex items-start gap-3`}>
                <a.icon className={`w-5 h-5 ${a.iconColor} shrink-0 mt-0.5`} />
                <div>
                  <div className={`text-sm font-bold ${a.titleColor} mb-0.5`}>{a.title}</div>
                  <p className="text-xs text-neutral-400 m-0">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Demo>
      </Section>

      {/* ═══════ TABLES ═══════ */}
      <Section id="tables" title="Tables" description="Data tables for workflows, contacts, sessions.">
        <Demo label="Basic Table">
          <div className="rounded-lg border border-neutral-700/30 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-neutral-700/30 hover:bg-transparent">
                  <TableHead className="text-neutral-400 text-xs">Name</TableHead>
                  <TableHead className="text-neutral-400 text-xs">Status</TableHead>
                  <TableHead className="text-neutral-400 text-xs">Services</TableHead>
                  <TableHead className="text-neutral-400 text-xs">Executions</TableHead>
                  <TableHead className="text-neutral-400 text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: '0nspa-retention-system', status: 'active', services: ['CRM', 'SUPABASE'], execs: 142 },
                  { name: '0nspa-birthday-campaign', status: 'active', services: ['CRM', 'SLACK'], execs: 38 },
                  { name: '0nspa-korean-facial-launch', status: 'draft', services: ['CRM'], execs: 0 },
                ].map(row => (
                  <TableRow key={row.name} className="border-neutral-700/30 hover:bg-white/[0.02]">
                    <TableCell className="text-sm text-white font-medium">{row.name}</TableCell>
                    <TableCell>
                      <Badge className={row.status === 'active' ? 'bg-emerald-500/15 text-emerald-400 border-0' : 'bg-amber-500/15 text-amber-400 border-0'}>
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {row.services.map(s => (
                          <Badge key={s} className="bg-neutral-700/50 text-neutral-300 border-0 text-[10px] font-mono">{s}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-neutral-400 font-mono">{row.execs}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="w-3.5 h-3.5 text-neutral-400" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="w-3.5 h-3.5 text-neutral-400" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Demo>
      </Section>

      {/* ═══════ FORMS ═══════ */}
      <Section id="forms" title="Forms" description="Input fields, selects, checkboxes, switches.">
        <Demo label="Text Inputs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div className="space-y-2">
              <Label className="text-neutral-300 text-xs">Workflow Name</Label>
              <Input placeholder="e.g. Lead Nurture Sequence" className="bg-[#080B0F] border-neutral-700/50 text-white placeholder:text-neutral-600 focus:border-[#6EE05A]/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-neutral-300 text-xs">API Key</Label>
              <Input type="password" placeholder="sk-..." className="bg-[#080B0F] border-neutral-700/50 text-white placeholder:text-neutral-600 focus:border-[#6EE05A]/50 font-mono" />
            </div>
            <div className="space-y-2 col-span-full">
              <Label className="text-neutral-300 text-xs">Description</Label>
              <Textarea placeholder="Describe what this workflow does..." className="bg-[#080B0F] border-neutral-700/50 text-white placeholder:text-neutral-600 focus:border-[#6EE05A]/50 min-h-[80px]" />
            </div>
          </div>
        </Demo>
        <Demo label="Checkboxes & Switches">
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Checkbox id="c1" className="border-neutral-600 data-[state=checked]:bg-[#6EE05A] data-[state=checked]:border-[#6EE05A]" />
              <Label htmlFor="c1" className="text-sm text-neutral-300">Auto-deploy on save</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="c2" defaultChecked className="border-neutral-600 data-[state=checked]:bg-[#6EE05A] data-[state=checked]:border-[#6EE05A]" />
              <Label htmlFor="c2" className="text-sm text-neutral-300">Enable notifications</Label>
            </div>
            <Separator orientation="vertical" className="h-6 bg-neutral-700/50" />
            <div className="flex items-center gap-2">
              <Switch className="data-[state=checked]:bg-[#6EE05A]" />
              <Label className="text-sm text-neutral-300">Dark mode</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch defaultChecked className="data-[state=checked]:bg-[#6EE05A]" />
              <Label className="text-sm text-neutral-300">MCP Server</Label>
            </div>
          </div>
        </Demo>
      </Section>

      {/* ═══════ TABS ═══════ */}
      <Section id="tabs" title="Tabs" description="Tab navigation for multi-section content.">
        <Demo label="Default Tabs">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-[#080B0F] border border-neutral-700/30">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#6EE05A] data-[state=active]:text-[#080B0F]">All (26)</TabsTrigger>
              <TabsTrigger value="spa" className="data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400">Spa (9)</TabsTrigger>
              <TabsTrigger value="platform" className="data-[state=active]:bg-[#6EE05A]/15 data-[state=active]:text-[#6EE05A]">Platform (17)</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="text-sm text-neutral-400 mt-3">Showing all 26 workflows</TabsContent>
            <TabsContent value="spa" className="text-sm text-neutral-400 mt-3">Showing 9 Spa Ligonier workflows</TabsContent>
            <TabsContent value="platform" className="text-sm text-neutral-400 mt-3">Showing 17 platform workflows</TabsContent>
          </Tabs>
        </Demo>
      </Section>

      {/* ═══════ LOADING ═══════ */}
      <Section id="loading" title="Loading States" description="Skeletons and spinners for async content.">
        <Demo label="Skeleton Cards">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="bg-[#0F1419] border-neutral-700/30">
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-4 w-3/4 bg-neutral-800" />
                  <Skeleton className="h-8 w-1/2 bg-neutral-800" />
                  <Skeleton className="h-3 w-full bg-neutral-800" />
                </CardContent>
              </Card>
            ))}
          </div>
        </Demo>
        <Demo label="Spinners">
          <div className="flex items-center gap-6">
            <div className="w-6 h-6 border-2 border-neutral-700 border-t-[#6EE05A] rounded-full animate-spin" />
            <div className="w-8 h-8 border-2 border-neutral-700 border-t-[#6EE05A] rounded-full animate-spin" />
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <div className="w-4 h-4 border-2 border-neutral-700 border-t-[#6EE05A] rounded-full animate-spin" />
              Loading workflows...
            </div>
          </div>
        </Demo>
      </Section>

      {/* ═══════ LISTS ═══════ */}
      <Section id="lists" title="List Items" description="Conversation lists, action items, navigation entries.">
        <Demo label="Conversation List (Context Panel Style)">
          <div className="max-w-xs space-y-1">
            {[
              { title: 'Create a CRM workflow...', msgs: 12, time: '2m ago', active: true },
              { title: 'Deploy vault keys to...', msgs: 8, time: '1h ago', active: false },
              { title: 'Build landing page for...', msgs: 23, time: 'Yesterday', active: false },
            ].map(c => (
              <div key={c.title} className={`px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${c.active ? 'bg-[#6EE05A]/8 border border-[#6EE05A]/15' : 'hover:bg-white/[0.03]'}`}>
                <div className={`text-xs font-medium truncate ${c.active ? 'text-white' : 'text-neutral-400'}`}>{c.title}</div>
                <div className={`text-[10px] mt-1 font-mono ${c.active ? 'text-[#6EE05A]' : 'text-neutral-600'}`}>
                  {c.msgs} msgs · {c.time}
                </div>
              </div>
            ))}
          </div>
        </Demo>
        <Demo label="Action List (Suggested Next Style)">
          <div className="max-w-sm space-y-2">
            {[
              { icon: Shield, title: 'Open Vault', desc: 'Decrypt and manage API keys', color: '#F59E0B' },
              { icon: Zap, title: 'Run Workflow', desc: 'Execute 0nspa-retention-system', color: '#6EE05A' },
              { icon: Mail, title: 'Send Campaign', desc: 'Korean Facial to 5,117 contacts', color: '#3B82F6' },
            ].map(a => (
              <div key={a.title} className="flex items-center gap-3 px-3 py-3 rounded-lg border border-neutral-700/30 bg-[#0F1419] hover:border-[#6EE05A]/20 cursor-pointer transition-colors group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${a.color}15` }}>
                  <a.icon className="w-4 h-4" style={{ color: a.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-neutral-300 truncate">{a.title}</div>
                  <div className="text-[10px] text-neutral-500 truncate">{a.desc}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 shrink-0" />
              </div>
            ))}
          </div>
        </Demo>
      </Section>

      {/* ═══════ ORBIT WIDGET ═══════ */}
      <Section id="orbit" title="Integration Orbit" description="Rotating service icons around a central counter. Use on dashboards and landing pages.">
        <Demo label="Default (1,640+ Tools)">
          <div className="py-8">
            <IntegrationOrbit />
          </div>
        </Demo>
        <Demo label="Custom (111 Services)">
          <div className="py-8">
            <IntegrationOrbit count="111" label="Services" size={300} />
          </div>
        </Demo>
      </Section>

      {/* ═══════ USAGE GUIDE ═══════ */}
      <div className="rounded-lg border border-[#6EE05A]/20 bg-[#6EE05A]/5 p-5 space-y-2">
        <h2 className="text-sm font-bold text-[#6EE05A]">How To Use This Page</h2>
        <ol className="text-xs text-neutral-400 space-y-1.5 list-decimal list-inside">
          <li>Scroll through the components above — everything is live in our dark theme</li>
          <li>Screenshot the specific component or pattern you want</li>
          <li>Share it with Claude Code: &quot;Make the chat bubbles look like the alert cards&quot;</li>
          <li>Claude adapts the exact component — no guessing, no custom builds</li>
        </ol>
      </div>
    </div>
  )
}
