import Link from 'next/link'
import { STATS } from '@/data/stats'

export const metadata = {
  title: `0nMCP Installed! | ${STATS.tools} Tools Ready`,
}

export default function InstallSuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-3">0nMCP Installed!</h1>

        <p className="text-white/60 mb-6">
          {STATS.tools}+ tools across {STATS.services} services are now available in your CRM workflows.
          Go to your workflow builder and add an 0nMCP action to get started.
        </p>

        <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-5 mb-6 text-left">
          <h3 className="text-sm font-semibold mb-3">Quick Start:</h3>
          <ol className="text-xs text-white/50 space-y-2">
            <li className="flex gap-2">
              <span className="text-[#ff6b35] font-bold shrink-0">1.</span>
              Open any workflow in your CRM
            </li>
            <li className="flex gap-2">
              <span className="text-[#ff6b35] font-bold shrink-0">2.</span>
              Add an action → find &quot;0nMCP&quot; in the marketplace actions
            </li>
            <li className="flex gap-2">
              <span className="text-[#ff6b35] font-bold shrink-0">3.</span>
              Select a service and tool from the dropdowns
            </li>
            <li className="flex gap-2">
              <span className="text-[#ff6b35] font-bold shrink-0">4.</span>
              Map your contact fields and save
            </li>
          </ol>
        </div>

        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="px-5 py-2.5 text-sm font-medium bg-white/[0.06] border border-white/[0.1] rounded-lg hover:bg-white/[0.1] transition-colors"
          >
            Back to 0nMCP
          </Link>
          <Link
            href="/docs"
            className="px-5 py-2.5 text-sm font-medium bg-[#ff6b35] rounded-lg hover:bg-[#ff8555] transition-colors"
          >
            View Docs
          </Link>
        </div>
      </div>
    </div>
  )
}
