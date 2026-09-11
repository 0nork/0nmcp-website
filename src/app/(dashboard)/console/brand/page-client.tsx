'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Globe, Upload, Palette, Sparkles, Loader2, CheckCircle2,
  AlertCircle, ExternalLink, Image, Type, Volume2, ChevronRight
} from 'lucide-react'

type GenerationMode = 'url' | 'logo' | 'colors' | 'random'
type PipelineStage = 'idle' | 'extract' | 'voice' | 'assemble' | 'sync' | 'done' | 'error'

interface BrandResult {
  business: { name: string; tagline: string; description: string }
  identity: {
    colors: { primary: string; secondary: string; accent: string; background: string; text_color: string }
    fonts: { display: { family: string }; body: { family: string } }
    logos: { primary: { url: string }; icon: { url: string } }
  }
  voice?: {
    tone: string
    personality_traits: string[]
    tagline_options: string[]
    sample_headline: string
    sample_cta: string
  }
  canva_assets?: Array<{ type: string; thumbnail_url: string; edit_url: string }>
}

const STAGES: Array<{ key: PipelineStage; label: string; icon: typeof Globe }> = [
  { key: 'extract', label: 'Extracting Brand', icon: Globe },
  { key: 'voice', label: 'Generating Voice', icon: Volume2 },
  { key: 'assemble', label: 'Assembling Profile', icon: Type },
  { key: 'sync', label: 'Syncing to CRM', icon: CheckCircle2 },
]

export default function BrandPage() {
  const [mode, setMode] = useState<GenerationMode>('url')
  const [subLocationId, setSubLocationId] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#6EE05A')
  const [secondaryColor, setSecondaryColor] = useState('#111111')
  const [accentColor, setAccentColor] = useState('#FFFFFF')
  const [industry, setIndustry] = useState('')
  const [vibe, setVibe] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [stage, setStage] = useState<PipelineStage>('idle')
  const [result, setResult] = useState<BrandResult | null>(null)
  const [error, setError] = useState('')

  async function handleGenerate() {
    if (!subLocationId.trim()) {
      setError('Sub-location ID is required')
      return
    }

    setStage('extract')
    setError('')
    setResult(null)

    const body: Record<string, string | undefined> = {
      mode,
      sub_location_id: subLocationId.trim(),
      business_name: businessName || undefined,
    }

    if (mode === 'url') body.source_url = sourceUrl
    if (mode === 'logo') body.logo_url = logoUrl
    if (mode === 'colors') {
      body.primary_color = primaryColor
      body.secondary_color = secondaryColor
      body.accent_color = accentColor
    }
    if (mode === 'random') {
      body.industry = industry
      body.vibe = vibe
    }

    try {
      // Simulate stage progression
      const stageOrder: PipelineStage[] = ['extract', 'voice', 'assemble', 'sync']
      let currentIdx = 0
      const interval = setInterval(() => {
        currentIdx++
        if (currentIdx < stageOrder.length) setStage(stageOrder[currentIdx])
      }, 3000)

      const res = await fetch('/api/brand/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      clearInterval(interval)

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Generation failed' }))
        setError(data.error || data.details?.join(', ') || 'Generation failed')
        setStage('error')
        return
      }

      const data = await res.json()
      setResult(data.brand)
      setStage('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
      setStage('error')
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground mb-1">0nBrand</h1>
        <p className="text-sm text-muted-foreground">
          Generate a complete brand identity for any sub-location. Colors, voice, assets — synced to CRM automatically.
        </p>
      </div>

      {/* Sub-location ID */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-foreground text-xs font-bold uppercase tracking-wider">CRM Sub-Location ID</Label>
            <Input
              value={subLocationId}
              onChange={e => setSubLocationId(e.target.value)}
              placeholder="e.g. F76MNKOMQCMruMrumtdf"
              className="bg-secondary border-border text-foreground font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground text-xs font-bold uppercase tracking-wider">Business Name (optional)</Label>
            <Input
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              placeholder="e.g. The Spa In Ligonier"
              className="bg-secondary border-border text-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Mode Selector */}
      <Tabs value={mode} onValueChange={v => setMode(v as GenerationMode)}>
        <TabsList className="bg-secondary border border-border">
          <TabsTrigger value="url" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
            <Globe className="w-3.5 h-3.5" /> URL
          </TabsTrigger>
          <TabsTrigger value="logo" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
            <Upload className="w-3.5 h-3.5" /> Logo
          </TabsTrigger>
          <TabsTrigger value="colors" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
            <Palette className="w-3.5 h-3.5" /> Colors
          </TabsTrigger>
          <TabsTrigger value="random" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Random
          </TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-foreground">Extract from Website</CardTitle>
              <CardDescription>We&apos;ll analyze the website and extract colors, fonts, logo, and business info.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Input
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                placeholder="https://spaligonier.com"
                className="bg-secondary border-border text-foreground"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logo" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-foreground">Analyze Existing Logo</CardTitle>
              <CardDescription>Provide a public URL to your logo. We&apos;ll extract the color palette and style.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <Input
                value={logoUrl}
                onChange={e => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="bg-secondary border-border text-foreground"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="colors" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-foreground">Start from Colors</CardTitle>
              <CardDescription>Pick your brand colors and we&apos;ll generate everything else.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Primary</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded border-0 cursor-pointer bg-transparent" />
                  <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="bg-secondary border-border text-foreground font-mono text-xs flex-1" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Secondary</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="w-10 h-10 rounded border-0 cursor-pointer bg-transparent" />
                  <Input value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="bg-secondary border-border text-foreground font-mono text-xs flex-1" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Accent</Label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-10 h-10 rounded border-0 cursor-pointer bg-transparent" />
                  <Input value={accentColor} onChange={e => setAccentColor(e.target.value)} className="bg-secondary border-border text-foreground font-mono text-xs flex-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="random" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-foreground">Generate from Scratch</CardTitle>
              <CardDescription>AI creates a complete original brand based on industry and style.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Industry</Label>
                <Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. dental, spa, restaurant" className="bg-secondary border-border text-foreground" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Vibe</Label>
                <Input value={vibe} onChange={e => setVibe(e.target.value)} placeholder="e.g. bold, luxury, playful" className="bg-secondary border-border text-foreground" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={stage !== 'idle' && stage !== 'done' && stage !== 'error'}
        className="w-full bg-primary text-primary-foreground hover:opacity-90 text-sm font-bold py-6"
      >
        {stage !== 'idle' && stage !== 'done' && stage !== 'error' ? (
          <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating Brand...</>
        ) : (
          <>Generate Brand Profile</>
        )}
      </Button>

      {/* Canva requirement */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Image className="w-3.5 h-3.5" />
        <span>Canva API key required for asset generation.</span>
        <a href="/console/integrations" className="text-primary hover:underline inline-flex items-center gap-1">
          Connect Canva <ChevronRight className="w-3 h-3" />
        </a>
      </div>

      {/* Pipeline Progress */}
      {stage !== 'idle' && (
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {STAGES.map((s, i) => {
                const stageOrder: PipelineStage[] = ['extract', 'voice', 'assemble', 'sync']
                const currentIdx = stageOrder.indexOf(stage === 'done' ? 'sync' : stage === 'error' ? 'extract' : stage)
                const thisIdx = stageOrder.indexOf(s.key)
                const isComplete = stage === 'done' || thisIdx < currentIdx
                const isActive = thisIdx === currentIdx && stage !== 'done' && stage !== 'error'

                return (
                  <div key={s.key} className="flex items-center gap-2 flex-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isComplete ? 'bg-primary/15 text-primary'
                        : isActive ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {isComplete ? <CheckCircle2 className="w-4 h-4" /> :
                       isActive ? <Loader2 className="w-4 h-4 animate-spin" /> :
                       <s.icon className="w-4 h-4" />}
                    </div>
                    <span className={`text-xs font-medium ${isComplete || isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {s.label}
                    </span>
                    {i < STAGES.length - 1 && <div className="flex-1 h-px bg-border" />}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 border-l-4 border-l-destructive bg-destructive/10 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-destructive">Generation Failed</p>
            <p className="text-xs text-foreground mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Brand Profile — {result.business.name}</h2>

          {/* Colors */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground">Color Palette</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-3">
                {Object.entries(result.identity.colors).map(([key, hex]) => (
                  <div key={key} className="text-center">
                    <div className="w-14 h-14 rounded-lg border border-border mb-1.5" style={{ background: hex }} />
                    <div className="text-[10px] text-muted-foreground capitalize">{key.replace('_', ' ')}</div>
                    <div className="text-[10px] text-foreground font-mono">{hex}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground">Typography</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 flex gap-6">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Display</p>
                <p className="text-lg font-bold text-foreground">{result.identity.fonts.display.family || 'System'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Body</p>
                <p className="text-sm text-foreground">{result.identity.fonts.body.family || 'System'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Voice */}
          {result.voice && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-foreground">Brand Voice</CardTitle>
                <CardDescription>Tone: {result.voice.tone}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {result.voice.personality_traits.map(t => (
                    <Badge key={t} variant="outline" className="text-xs border-primary/30 text-primary">{t}</Badge>
                  ))}
                </div>
                {result.voice.tagline_options.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Tagline Options</p>
                    {result.voice.tagline_options.map((t, i) => (
                      <p key={i} className="text-sm text-foreground">{t}</p>
                    ))}
                  </div>
                )}
                <div className="rounded-lg bg-secondary p-3 border border-border">
                  <p className="text-sm font-bold text-foreground mb-1">{result.voice.sample_headline}</p>
                  <Button size="sm" className="bg-primary text-primary-foreground mt-2">{result.voice.sample_cta}</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Info */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-foreground">Business</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              <p className="text-sm text-foreground font-semibold">{result.business.name}</p>
              {result.business.tagline && <p className="text-xs text-primary">{result.business.tagline}</p>}
              {result.business.description && <p className="text-xs text-muted-foreground">{result.business.description}</p>}
            </CardContent>
          </Card>

          {/* CRM Sync */}
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-primary/10 border border-primary/20">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span className="text-sm text-foreground font-medium">Brand profile saved and synced to CRM sub-location</span>
          </div>

          {/* Re-sync button */}
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-secondary"
            onClick={async () => {
              await fetch('/api/brand/sync-crm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sub_location_id: subLocationId }),
              })
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" /> Re-sync to CRM
          </Button>
        </div>
      )}
    </div>
  )
}
