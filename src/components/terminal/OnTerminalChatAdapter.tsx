'use client'

import React, { useEffect, useRef, useState } from 'react'
import OnTerminal from './OnTerminal'
import { terminalBus } from './OnTerminalEventBus'
import type { OnTerminalConfig } from './OnTerminalTypes'

interface ChatAdapterProps extends OnTerminalConfig {
  mode?: 'embedded' | 'split' | 'popout' | 'tab'
  chatInputSelector?: string
  chatMessagesSelector?: string
  autoExecute?: boolean
  terminalHeight?: number
  initiallyOpen?: boolean
  onToggle?: (isOpen: boolean) => void
}

export default function OnTerminalChatAdapter({
  mode = 'split',
  chatInputSelector,
  chatMessagesSelector,
  autoExecute = false,
  terminalHeight = 300,
  initiallyOpen = true,
  onToggle,
  ...terminalConfig
}: ChatAdapterProps) {
  const [isOpen, setIsOpen] = useState(initiallyOpen)
  const observerRef = useRef<MutationObserver | null>(null)

  const toggle = () => {
    const next = !isOpen
    setIsOpen(next)
    onToggle?.(next)
  }

  useEffect(() => {
    if (!chatMessagesSelector) return

    const addRunButtons = () => {
      const container = document.querySelector(chatMessagesSelector)
      if (!container) return

      const codeBlocks = container.querySelectorAll('pre:not([data-on-terminal])')
      codeBlocks.forEach((pre) => {
        pre.setAttribute('data-on-terminal', 'true')
        const runBtn = document.createElement('button')
        runBtn.textContent = '\u25B6 Run in Terminal'
        runBtn.style.cssText = `
          position: absolute; top: 4px; right: 4px;
          background: rgba(0,255,102,0.1); border: 1px solid rgba(0,255,102,0.3);
          color: #00ff66; padding: 2px 8px; font-size: 10px;
          font-family: 'Share Tech Mono', monospace; cursor: pointer;
          border-radius: 3px; letter-spacing: 1px; z-index: 10;
        `
        runBtn.addEventListener('click', () => {
          const code = pre.querySelector('code')?.textContent || pre.textContent || ''
          terminalBus.executeFromChat(code.trim())
          if (!isOpen) { setIsOpen(true); onToggle?.(true) }
        })
        ;(pre as HTMLElement).style.position = 'relative'
        pre.appendChild(runBtn)
      })
    }

    addRunButtons()
    const chatContainer = document.querySelector(chatMessagesSelector)
    if (chatContainer) {
      observerRef.current = new MutationObserver(addRunButtons)
      observerRef.current.observe(chatContainer, { childList: true, subtree: true })
    }

    return () => { observerRef.current?.disconnect() }
  }, [chatMessagesSelector, isOpen, onToggle])

  if (mode === 'embedded') {
    return isOpen ? (
      <div style={{ width: '100%' }}>
        <button onClick={toggle} className="on-terminal-toggle-btn">
          &#9660; TERMINAL
        </button>
        <OnTerminal height={terminalHeight} {...terminalConfig} />
      </div>
    ) : (
      <button onClick={toggle} className="on-terminal-toggle-btn on-terminal-toggle-closed">
        &#9654; OPEN TERMINAL
      </button>
    )
  }

  if (mode === 'split') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1, overflow: 'auto' }} />
        {isOpen && (
          <div style={{ borderTop: '1px solid rgba(0,255,102,0.15)', flexShrink: 0 }}>
            <OnTerminal height={terminalHeight} {...terminalConfig} />
          </div>
        )}
        <button onClick={toggle} className="on-terminal-toggle-btn">
          {isOpen ? '&#9660; HIDE TERMINAL' : '&#9650; SHOW TERMINAL'}
        </button>
      </div>
    )
  }

  if (mode === 'popout') {
    return isOpen ? (
      <div style={{
        position: 'fixed', bottom: 20, right: 20, width: 600, zIndex: 9999,
        boxShadow: '0 0 40px rgba(0,255,102,0.15), 0 0 100px rgba(0,0,0,0.5)',
        borderRadius: 8,
      }}>
        <OnTerminal height={terminalHeight} {...terminalConfig} />
        <button onClick={toggle} style={{
          position: 'absolute', top: 8, right: 8, zIndex: 10,
          background: 'transparent', border: 'none', color: '#ff4466',
          cursor: 'pointer', fontSize: 16,
        }}>&times;</button>
      </div>
    ) : null
  }

  return isOpen ? <OnTerminal height={terminalHeight} {...terminalConfig} /> : null
}
