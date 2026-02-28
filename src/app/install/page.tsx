import Link from 'next/link'
import { ACTIONS, TRIGGERS, SERVICE_CATALOG } from '@/lib/marketplace'

export const metadata = {
  title: '0nMCP — Install for CRM | 819 Tools in Your Workflows',
  description: 'Add 819+ tools across 48 services to your CRM workflows. Stripe, SendGrid, Slack, Google Sheets, AI, and more — all as workflow actions.',
}

export default function InstallPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; location?: string }>
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#ff6b35]/10 border border-[#ff6b35]/20 rounded-full text-sm text-[#ff6b35] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#ff6b35] animate-pulse" />
          CRM Marketplace App
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          819+ Tools.{' '}
          <span className="text-[#ff6b35]">One Action.</span>
        </h1>

        <p className="text-lg text-white/60 max-w-2xl mx-auto mb-8">
          Add 0nMCP to your CRM workflows and instantly access Stripe, SendGrid, Slack,
          Google Sheets, AI content generation, and 20+ more services — all as drag-and-drop
          workflow actions with dynamic dropdowns.
        </p>

        <Link
          href="/api/marketplace/oauth/install"
          className="inline-flex items-center gap-2 px-8 py-4 bg-[#ff6b35] text-white font-semibold rounded-xl hover:bg-[#ff8555] transition-all text-lg shadow-lg shadow-[#ff6b35]/20"
        >
          Install 0nMCP
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        <p className="text-xs text-white/30 mt-3">Free to install. Pay-per-execution pricing.</p>
      </div>

      {/* Actions */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-bold mb-6 text-center">Workflow Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(ACTIONS).map((action) => (
            <div key={action.key} className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-[#ff6b35]/10 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-sm mb-1">{action.name}</h3>
              <p className="text-xs text-white/50">{action.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Triggers */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-xl font-bold mb-6 text-center">Workflow Triggers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(TRIGGERS).map((trigger) => (
            <div key={trigger.key} className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5">
              <div className="w-10 h-10 rounded-lg bg-[#ff6b35]/10 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-[#ff6b35]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="font-semibold text-sm mb-1">{trigger.name}</h3>
              <p className="text-xs text-white/50">{trigger.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Services grid */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-xl font-bold mb-2 text-center">48 Services. 819+ Tools.</h2>
        <p className="text-sm text-white/40 text-center mb-8">Every service becomes a workflow action with dynamic dropdown selection.</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {SERVICE_CATALOG.map((service) => (
            <div
              key={service.key}
              className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 text-center hover:bg-white/[0.06] transition-colors"
            >
              <p className="text-xs font-medium text-white/80">{service.label}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{service.tools.length} tools</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.06] py-8 text-center">
        <p className="text-xs text-white/20">
          Powered by <Link href="/" className="text-[#ff6b35]/60 hover:text-[#ff6b35]">0nMCP</Link> — Stop building workflows. Start describing outcomes.
        </p>
      </div>
    </div>
  )
}
