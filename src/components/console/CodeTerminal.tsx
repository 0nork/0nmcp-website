'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { SendHorizontal, Terminal, User, Play, Copy, Check, Loader2, ChevronRight } from 'lucide-react'
import { OnTerminalCore } from '@/components/terminal/OnTerminalCore'

// ─── Types ─────────────────────────────────────────────────────

type MsgRole = 'user' | 'assistant' | 'command' | 'output' | 'system'

interface Message {
  id: string
  role: MsgRole
  text: string
  timestamp: number
  runtime?: string
  codeBlocks?: CodeBlock[]
  streaming?: boolean
}

interface CodeBlock {
  lang: string
  code: string
  ran?: boolean
}

// ─── Command detection ─────────────────────────────────────────

const SHELL_CMDS = new Set([
  'ls', 'cd', 'pwd', 'cat', 'mkdir', 'touch', 'rm', 'cp', 'mv', 'echo',
  'clear', 'help', 'whoami', 'env', 'exit', 'which', 'grep', 'find',
])

const NODE_CMDS = new Set(['node', 'npm', 'npx', '0nmcp'])
const PYTHON_CMDS = new Set(['python', 'python3', 'pip', 'micropip'])

function isCommand(input: string): boolean {
  if (input.startsWith('$ ') || input.startsWith('> ')) return true
  const first = input.split(/\s+/)[0]?.toLowerCase()
  if (SHELL_CMDS.has(first) || NODE_CMDS.has(first) || PYTHON_CMDS.has(first)) return true
  return false
}

function stripPrefix(input: string): string {
  if (input.startsWith('$ ') || input.startsWith('> ')) return input.slice(2)
  return input
}

// ─── Markdown helpers ──────────────────────────────────────────

function extractCodeBlocks(text: string): { html: string; blocks: CodeBlock[] } {
  const blocks: CodeBlock[] = []
  let idx = 0
  const html = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    blocks.push({ lang: lang || 'shell', code: code.trim() })
    const placeholder = `<div data-codeblock="${idx}"></div>`
    idx++
    return placeholder
  })
  return { html, blocks }
}

function renderInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code class="ct-inline-code">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" class="ct-link">$1</a>')
    .replace(/\n/g, '<br/>')
}

// ─── Main Component ────────────────────────────────────────────

export function CodeTerminal() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [termReady, setTermReady] = useState(false)
  const [termBooting, setTermBooting] = useState(true)
  const [bootLog, setBootLog] = useState<string[]>([])

  const coreRef = useRef<OnTerminalCore | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const msgIdCounter = useRef(0)

  const nextId = () => `msg-${++msgIdCounter.current}`

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, bootLog])

  // ─── Boot terminal runtime ────────────────────────────────────
  useEffect(() => {
    const core = new OnTerminalCore({
      enableNode: true,
      enablePython: true,
      packages: ['0nmcp'],
    })
    coreRef.current = core

    // Capture boot output as log lines
    const lines: string[] = []
    core.boot((text) => {
      // Strip ANSI codes for display
      const clean = text.replace(/\x1b\[[0-9;]*m/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '')
      if (clean.trim()) {
        lines.push(clean.trim())
        setBootLog([...lines])
      }
    }).then(() => {
      setTermReady(true)
      setTermBooting(false)
    }).catch(() => {
      setTermBooting(false)
    })

    return () => { core.destroy() }
  }, [])

  // ─── Execute a terminal command ───────────────────────────────
  const runCommand = useCallback(async (cmd: string, silent = false) => {
    const core = coreRef.current
    if (!core) return

    if (!silent) {
      setMessages(prev => [...prev, {
        id: nextId(),
        role: 'command',
        text: cmd,
        timestamp: Date.now(),
      }])
    }

    // Capture output
    let outputBuf = ''
    const origWrite = (core as any).writeCallback;
    (core as any).writeCallback = (text: string) => {
      const clean = text.replace(/\x1b\[[0-9;]*m/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '')
      outputBuf += clean
    }

    await core.execute(cmd);

    // Restore
    (core as any).writeCallback = origWrite

    if (outputBuf.trim()) {
      setMessages(prev => [...prev, {
        id: nextId(),
        role: 'output',
        text: outputBuf.trim(),
        timestamp: Date.now(),
      }])
    }
  }, [])

  // ─── Send to AI chat ──────────────────────────────────────────
  const sendToAI = useCallback(async (text: string) => {
    setMessages(prev => [...prev, {
      id: nextId(),
      role: 'user',
      text,
      timestamp: Date.now(),
    }])
    setLoading(true)

    // Add streaming placeholder
    const assistantId = nextId()
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      text: '',
      timestamp: Date.now(),
      streaming: true,
    }])

    try {
      const res = await fetch('/api/console/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      const data = await res.json()
      const responseText = data.text || data.error || 'No response.'
      const { html, blocks } = extractCodeBlocks(responseText)

      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, text: blocks.length > 0 ? html : responseText, codeBlocks: blocks, streaming: false }
          : m
      ))
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, text: 'Failed to reach server.', streaming: false }
          : m
      ))
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Handle send ──────────────────────────────────────────────
  const handleSend = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed || loading) return
    setInput('')
    if (inputRef.current) inputRef.current.style.height = '44px'

    if (trimmed === 'clear') {
      setMessages([])
      return
    }

    if (isCommand(trimmed)) {
      runCommand(stripPrefix(trimmed))
    } else {
      sendToAI(trimmed)
    }
  }, [input, loading, runCommand, sendToAI])

  // ─── Run a code block from AI response ────────────────────────
  const handleRunBlock = useCallback((msgId: string, blockIdx: number) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId || !m.codeBlocks) return m
      const blocks = [...m.codeBlocks]
      blocks[blockIdx] = { ...blocks[blockIdx], ran: true }
      return { ...m, codeBlocks: blocks }
    }))

    const msg = messages.find(m => m.id === msgId)
    if (msg?.codeBlocks?.[blockIdx]) {
      runCommand(msg.codeBlocks[blockIdx].code)
    }
  }, [messages, runCommand])

  // ─── Keyboard ─────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 h-10 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'rgba(10,10,15,0.9)' }}
      >
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
        </div>
        <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
          0n Code
        </span>
        <span className="text-[10px] tracking-wider uppercase ml-auto" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {termBooting ? 'BOOTING...' : termReady ? 'LIVE' : 'OFFLINE'}
        </span>
      </div>

      {/* Message Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: 'thin' }}>
        {/* Boot log */}
        {bootLog.length > 0 && (
          <div className="mb-4 ct-boot-log">
            {bootLog.map((line, i) => (
              <div key={i} className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {line}
              </div>
            ))}
            {termReady && (
              <div className="text-[11px] mt-1 font-bold" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                Ready — type a command or ask anything in natural language
              </div>
            )}
            <div className="my-3" style={{ borderBottom: '1px solid var(--border)' }} />
          </div>
        )}

        {/* Messages */}
        {messages.map(msg => (
          <MessageBubble
            key={msg.id}
            msg={msg}
            onRunBlock={(idx) => handleRunBlock(msg.id, idx)}
          />
        ))}

        {/* Streaming indicator */}
        {loading && !messages.some(m => m.streaming) && (
          <div className="flex items-center gap-2 py-2">
            <Loader2 size={14} className="animate-spin" style={{ color: 'var(--accent)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Thinking...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 pb-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold"
              style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', pointerEvents: 'none' }}
            >
              {input.startsWith('$') || input.startsWith('>') ? '$' : isCommand(input.trim()) ? '$' : '>'}
            </span>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                if (inputRef.current) {
                  inputRef.current.style.height = '44px'
                  inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px'
                }
              }}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Chat or run commands... ($ prefix for commands)"
              rows={1}
              className="w-full pl-8 pr-3 py-3 rounded-xl text-sm outline-none resize-none"
              style={{
                height: '44px',
                maxHeight: '120px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="h-11 w-11 shrink-0 rounded-xl flex items-center justify-center transition-all cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
              color: 'var(--bg-primary)',
              border: 'none',
              opacity: loading || !input.trim() ? 0.4 : 1,
            }}
          >
            <SendHorizontal size={16} />
          </button>
        </div>
        <div className="flex items-center justify-center gap-3 text-[10px] mt-2 tracking-wider uppercase" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          <span><kbd className="ct-kbd">$</kbd> command</span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span>natural language = AI</span>
          <span style={{ color: 'var(--border)' }}>|</span>
          <span><kbd className="ct-kbd">Enter</kbd> send</span>
        </div>
      </div>

      <style>{`
        .ct-inline-code {
          background: rgba(255,255,255,0.06);
          padding: 1px 5px;
          border-radius: 3px;
          font-family: var(--font-mono);
          font-size: 12px;
        }
        .ct-link { color: var(--accent); text-decoration: underline; }
        .ct-kbd {
          display: inline-block;
          padding: 0 4px;
          border-radius: 3px;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--border);
          font-family: var(--font-mono);
          font-size: 9px;
          line-height: 1.6;
        }
      `}</style>
    </div>
  )
}

// ─── Message Bubble ─────────────────────────────────────────────

function MessageBubble({ msg, onRunBlock }: { msg: Message; onRunBlock: (idx: number) => void }) {
  switch (msg.role) {
    case 'user':
      return (
        <div className="flex items-start gap-2.5 mb-3" style={{ flexDirection: 'row-reverse' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <User size={13} style={{ color: 'var(--text-secondary)' }} />
          </div>
          <div
            className="max-w-[75%] text-[13px] leading-relaxed px-3.5 py-2.5 rounded-xl rounded-tr-sm break-words"
            style={{
              background: 'linear-gradient(135deg, rgba(126,217,87,0.12), rgba(0,212,255,0.08))',
              border: '1px solid rgba(126,217,87,0.15)',
              color: 'var(--text-primary)',
            }}
          >
            {msg.text}
          </div>
        </div>
      )

    case 'assistant':
      return (
        <div className="flex items-start gap-2.5 mb-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))' }}
          >
            {msg.streaming ? (
              <Loader2 size={12} className="animate-spin" style={{ color: 'var(--bg-primary)' }} />
            ) : (
              <span className="text-[9px] font-black" style={{ color: 'var(--bg-primary)' }}>0n</span>
            )}
          </div>
          <div className="max-w-[80%] min-w-0">
            {msg.streaming && !msg.text ? (
              <div className="flex gap-1 px-3 py-2">
                {[0, 1, 2].map(d => (
                  <span key={d} className="w-1.5 h-1.5 rounded-full" style={{
                    backgroundColor: 'var(--accent)',
                    animation: 'ct-dot 1.2s ease infinite',
                    animationDelay: `${d * 0.2}s`,
                  }} />
                ))}
              </div>
            ) : (
              <AssistantContent msg={msg} onRunBlock={onRunBlock} />
            )}
          </div>
          <style>{`@keyframes ct-dot { 0%,60%,100% { opacity: 0.3; } 30% { opacity: 1; } }`}</style>
        </div>
      )

    case 'command':
      return (
        <div className="flex items-center gap-2 mb-1 ml-1">
          <ChevronRight size={12} style={{ color: 'var(--accent)' }} />
          <pre
            className="text-[12px] font-bold"
            style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', margin: 0 }}
          >
            {msg.text}
          </pre>
        </div>
      )

    case 'output':
      return (
        <div className="mb-3 ml-5">
          <pre
            className="text-[12px] leading-relaxed px-3 py-2 rounded-lg overflow-x-auto whitespace-pre-wrap"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              margin: 0,
            }}
          >
            {msg.text}
          </pre>
        </div>
      )

    case 'system':
      return (
        <div className="text-center text-[11px] py-2 mb-2" style={{ color: 'var(--text-muted)' }}>
          {msg.text}
        </div>
      )

    default:
      return null
  }
}

// ─── Assistant content with runnable code blocks ────────────────

function AssistantContent({ msg, onRunBlock }: { msg: Message; onRunBlock: (idx: number) => void }) {
  const hasBlocks = msg.codeBlocks && msg.codeBlocks.length > 0

  if (!hasBlocks) {
    return (
      <div
        className="text-[13px] leading-relaxed px-3.5 py-2.5 rounded-xl rounded-tl-sm break-words"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
        dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(msg.text) }}
      />
    )
  }

  // Split text around code block placeholders
  const parts = msg.text.split(/<div data-codeblock="(\d+)"><\/div>/)

  return (
    <div
      className="rounded-xl rounded-tl-sm overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {parts.map((part, i) => {
        if (i % 2 === 1) {
          // Code block index
          const blockIdx = parseInt(part, 10)
          const block = msg.codeBlocks![blockIdx]
          if (!block) return null
          return <RunnableCodeBlock key={i} block={block} index={blockIdx} onRun={onRunBlock} />
        }
        // Text content
        if (!part.trim()) return null
        return (
          <div
            key={i}
            className="text-[13px] leading-relaxed px-3.5 py-2.5"
            style={{ color: 'var(--text-primary)' }}
            dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(part.trim()) }}
          />
        )
      })}
    </div>
  )
}

// ─── Runnable Code Block ────────────────────────────────────────

function RunnableCodeBlock({ block, index, onRun }: { block: CodeBlock; index: number; onRun: (idx: number) => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(block.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      {/* Code block header */}
      <div className="flex items-center justify-between px-3 py-1.5" style={{ background: 'rgba(0,0,0,0.2)' }}>
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {block.lang || 'code'}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all border-none cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}
          >
            {copied ? <Check size={10} /> : <Copy size={10} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          {!block.ran && (
            <button
              onClick={() => onRun(index)}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-all border-none cursor-pointer"
              style={{ background: 'rgba(126,217,87,0.12)', color: 'var(--accent)' }}
            >
              <Play size={10} />
              Run
            </button>
          )}
          {block.ran && (
            <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold" style={{ color: 'var(--accent)' }}>
              <Check size={10} /> Ran
            </span>
          )}
        </div>
      </div>
      {/* Code */}
      <pre
        className="text-[12px] leading-relaxed px-3 py-2.5 overflow-x-auto"
        style={{
          background: 'rgba(0,0,0,0.15)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
          margin: 0,
          whiteSpace: 'pre-wrap',
        }}
      >
        {block.code}
      </pre>
    </div>
  )
}
