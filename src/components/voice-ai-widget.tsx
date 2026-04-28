'use client'

import { useState } from 'react'
import { Mic, X } from 'lucide-react'

// Jaxx — CRM Voice AI Agent embedded as a floating mic button on public pages.
// Same widget that runs on 0ncore.com.
//   Agent ID:  69c89918fd413b64c2d6a053
//   Location:  nphConTwfHcVE1oA0uep

const AGENT_ID = '69c89918fd413b64c2d6a053'

export function VoiceAIWidget() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Floating mic button — bottom right */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[9998] w-14 h-14 rounded-full bg-[#7ed957] shadow-[0_4px_20px_rgba(126,217,87,0.3)] flex items-center justify-center cursor-pointer border-none hover:scale-105 transition-transform group"
          aria-label="Talk to Jaxx"
        >
          <Mic className="w-6 h-6 text-[#020810]" />
          <span className="absolute -top-8 right-0 px-2.5 py-1 rounded-lg bg-[#0d1117] border border-white/[0.08] text-[11px] text-white/70 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Talk to Jaxx
          </span>
        </button>
      )}

      {/* Voice AI panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-[9999] w-[380px] h-[520px] rounded-2xl bg-[#0d1117] border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col animate-[voiceIn_0.25s_ease-out]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#7ed957]/15 flex items-center justify-center">
                <Mic className="w-4 h-4 text-[#7ed957]" />
              </div>
              <div>
                <h3 className="text-[13px] font-bold text-white flex items-center gap-1.5">
                  Jaxx <span className="w-[5px] h-[5px] rounded-full bg-[#7ed957] shadow-[0_0_6px_#7ed957]" />
                </h3>
                <p className="text-[10px] text-white/25">AI Voice Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/[0.06] transition-all bg-transparent border-none cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* CRM Voice AI widget — loaded via script injection */}
          <div className="flex-1 relative overflow-hidden">
            <div
              ref={(el) => {
                if (!el || el.dataset.loaded) return
                el.dataset.loaded = 'true'
                const script = document.createElement('script')
                script.src = 'https://widgets.leadconnectorhq.com/loader.js'
                script.setAttribute(
                  'data-resources-url',
                  'https://widgets.leadconnectorhq.com/chat-widget/loader.js',
                )
                script.setAttribute('data-widget-id', AGENT_ID)
                script.async = true
                el.appendChild(script)
              }}
              className="w-full h-full"
            />
          </div>

          <style>{`
            @keyframes voiceIn {
              from { opacity: 0; transform: translateY(20px) scale(0.95); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
        </div>
      )}
    </>
  )
}
