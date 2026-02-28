'use client'

import { useState, useRef, useEffect } from 'react'
import { executeTask, type Message } from '@/lib/pwa-api'

export default function Terminal() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || isStreaming) return

    const userMessage: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsStreaming(true)

    const assistantMessage: Message = { role: 'assistant', content: '' }
    setMessages([...newMessages, assistantMessage])

    abortRef.current = new AbortController()

    try {
      await executeTask(
        newMessages,
        (chunk) => {
          assistantMessage.content += chunk
          setMessages((prev) => [...prev.slice(0, -1), { ...assistantMessage }])
        },
        abortRef.current.signal
      )
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        assistantMessage.content = `Error: ${err.message}`
        setMessages((prev) => [...prev.slice(0, -1), { ...assistantMessage }])
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  return (
    <div className="terminal-container">
      <div className="terminal-messages">
        {messages.length === 0 && (
          <div className="terminal-empty">
            <div className="logo">0n</div>
            <p>Describe a task to execute</p>
            <p style={{ fontSize: 12 }}>564 tools across 26 services</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`terminal-message ${msg.role}`}>
            {msg.content || (isStreaming && i === messages.length - 1 ? '...' : '')}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="terminal-input-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe a task..."
          disabled={isStreaming}
          autoFocus
        />
        <button type="submit" disabled={isStreaming || !input.trim()}>
          {isStreaming ? 'Stop' : 'Send'}
        </button>
      </form>
    </div>
  )
}
