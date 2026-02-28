'use client'

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { OnTerminalCore } from './OnTerminalCore'
import { ON_TERMINAL_THEME } from './OnTerminalTheme'
import { terminalBus } from './OnTerminalEventBus'
import { initTerminalAnalytics } from './OnTerminalAnalytics'
import type { OnTerminalConfig } from './OnTerminalTypes'
import '@xterm/xterm/css/xterm.css'

interface OnTerminalProps extends OnTerminalConfig {
  className?: string
  style?: React.CSSProperties
}

export default function OnTerminal({
  className = '',
  style,
  height = 400,
  ...config
}: OnTerminalProps) {
  const termRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const coreRef = useRef<OnTerminalCore | null>(null)
  const fitRef = useRef<FitAddon | null>(null)
  const inputBuffer = useRef<string>('')
  const [status, setStatus] = useState<'loading' | 'booting' | 'ready' | 'error'>('loading')

  const PROMPT = '\x1b[38;2;0;255;102m0n\x1b[38;2;58;66;96m@\x1b[38;2;0;200;255mterminal\x1b[0m \x1b[38;2;58;66;96m$\x1b[0m '

  const writePrompt = useCallback(() => {
    xtermRef.current?.write(PROMPT)
  }, [])

  useEffect(() => {
    if (!termRef.current) return

    initTerminalAnalytics()

    const xterm = new Terminal({
      theme: ON_TERMINAL_THEME,
      fontFamily: "'Share Tech Mono', 'Fira Code', monospace",
      fontSize: 14,
      lineHeight: 1.4,
      cursorBlink: true,
      cursorStyle: 'bar',
      allowProposedApi: true,
      scrollback: 10000,
    })

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()
    xterm.loadAddon(fitAddon)
    xterm.loadAddon(webLinksAddon)

    const bodyEl = termRef.current.querySelector('.on-terminal-body')
    if (bodyEl) {
      xterm.open(bodyEl as HTMLElement)
      fitAddon.fit()
    }

    xtermRef.current = xterm
    fitRef.current = fitAddon

    setStatus('booting')
    const core = new OnTerminalCore(config)
    coreRef.current = core

    core.boot((text) => xterm.write(text)).then(() => {
      setStatus('ready')
      writePrompt()
    }).catch(() => {
      setStatus('error')
    })

    xterm.onKey(({ key, domEvent }) => {
      const ev = domEvent

      if (ev.key === 'Enter') {
        xterm.write('\r\n')
        const cmd = inputBuffer.current
        inputBuffer.current = ''
        if (cmd.trim()) {
          core.execute(cmd).then(() => writePrompt())
        } else {
          writePrompt()
        }
      } else if (ev.key === 'Backspace') {
        if (inputBuffer.current.length > 0) {
          inputBuffer.current = inputBuffer.current.slice(0, -1)
          xterm.write('\b \b')
        }
      } else if (ev.ctrlKey && ev.key === 'c') {
        inputBuffer.current = ''
        xterm.write('^C\r\n')
        writePrompt()
      } else if (ev.ctrlKey && ev.key === 'l') {
        xterm.write('\x1b[2J\x1b[H')
        writePrompt()
      } else if (!ev.ctrlKey && !ev.altKey && !ev.metaKey) {
        inputBuffer.current += key
        xterm.write(key)
      }
    })

    const unsubChat = terminalBus.on('execute', (event) => {
      if (event.source === 'chat' && event.payload.command) {
        xterm.write(event.payload.command + '\r\n')
        core.execute(event.payload.command).then(() => writePrompt())
      }
    })

    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit()
      terminalBus.emit('resize', { cols: xterm.cols, rows: xterm.rows })
    })
    if (termRef.current) resizeObserver.observe(termRef.current)

    return () => {
      unsubChat()
      resizeObserver.disconnect()
      xterm.dispose()
      core.destroy()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const heightVal = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`on-terminal-container ${className}`}
      style={{ height: heightVal, ...style }}
      ref={termRef}
    >
      <div className="on-terminal-header">
        <div className="on-terminal-header-dots">
          <div className="on-terminal-header-dot red" />
          <div className="on-terminal-header-dot yellow" />
          <div className="on-terminal-header-dot green" />
        </div>
        <div className="on-terminal-header-title">0n TERMINAL</div>
        <div style={{ fontSize: '10px', color: '#3a4260', fontFamily: 'Share Tech Mono, monospace', letterSpacing: '1px' }}>
          {status === 'booting' ? '\u21BB BOOTING' : status === 'ready' ? '\u25CF LIVE' : status === 'error' ? '\u2717 ERROR' : '...'}
        </div>
      </div>
      <div className="on-terminal-body" style={{ height: 'calc(100% - 60px)' }} />
      <div className="on-terminal-status">
        <span>
          {status === 'ready' && (
            <>
              <span className="on-terminal-status-runtime">NODE</span>
              {' \u00b7 '}
              <span className="on-terminal-status-runtime">PYTHON</span>
              {' \u00b7 '}
              <span className="on-terminal-status-runtime">SHELL</span>
            </>
          )}
        </span>
        <span>0nmcp.com</span>
      </div>
    </div>
  )
}
