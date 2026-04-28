'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Lead capture form on the 0nmcp.com homepage.
 * Posts to /api/request-access which creates a tagged CRM contact
 * (waitlist · pre-launch · 0nmcp-request) and writes to the Supabase
 * waitlist table. CRM workflows trigger off those tags downstream.
 */
export default function RequestAccessForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string>('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'loading') return
    setError('')
    setStatus('loading')

    try {
      const res = await fetch('/api/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error ?? 'Something went wrong. Please try again.')
        setStatus('error')
        return
      }
      setStatus('success')
    } catch {
      setError('Network error. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-[#6EE05A]/30 bg-[#6EE05A]/5 p-8 text-center backdrop-blur">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-[#6EE05A]" />
        <p className="text-lg font-bold text-white">You&rsquo;re on the list.</p>
        <p className="mt-2 text-sm text-white/70">
          We&rsquo;ll reach out from <span className="font-mono text-[#6EE05A]">noreply@0nmcp.com</span>{' '}
          when your spot opens. In the meantime, the npm package is live —
          <code className="ml-1 rounded bg-[#6EE05A]/10 px-1.5 py-0.5 font-mono text-xs text-[#6EE05A]">
            npx 0nmcp@latest
          </code>
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border/60 bg-card/60 p-6 backdrop-blur sm:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 bg-background"
          />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="company" className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
          Company <span className="text-white/40 normal-case tracking-normal">(optional)</span>
        </Label>
        <Input
          id="company"
          name="company"
          type="text"
          autoComplete="organization"
          placeholder="Acme Inc."
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="h-11 bg-background"
        />
      </div>

      {error && (
        <p className="mt-4 rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={status === 'loading'}
        className="mt-6 h-12 w-full text-base font-bold"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Reserving your spot…
          </>
        ) : (
          <>
            Request Access
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        No spam. We&rsquo;ll only email you when your access is ready.
      </p>
    </form>
  )
}
