'use client'

import { useState, useEffect } from 'react'

const FEEDBACK_KEY = '0nmcp-feedback-last'
const FEEDBACK_INTERVAL = 3 * 24 * 60 * 60 * 1000 // 3 days

const QUESTIONS = [
  'How has your experience been with the 0n Console so far?',
  'What feature would make 0nMCP more useful for you?',
  'Is there a service or integration you wish we supported?',
  'How would you rate the terminal experience? Any issues?',
  'What workflow do you run most often?',
]

export default function FeedbackAgent() {
  const [visible, setVisible] = useState(false)
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const last = localStorage.getItem(FEEDBACK_KEY)
    const lastTime = last ? parseInt(last, 10) : 0
    if (Date.now() - lastTime > FEEDBACK_INTERVAL) {
      const timer = setTimeout(() => {
        setQuestion(QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)])
        setVisible(true)
      }, 60000) // show after 1 min of session
      return () => clearTimeout(timer)
    }
  }, [])

  const handleSubmit = async () => {
    if (!response.trim()) return
    localStorage.setItem(FEEDBACK_KEY, String(Date.now()))

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, response: response.trim(), timestamp: Date.now() }),
      })
    } catch {}

    setSubmitted(true)
    setTimeout(() => setVisible(false), 2000)
  }

  const handleDismiss = () => {
    localStorage.setItem(FEEDBACK_KEY, String(Date.now()))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: 340,
      zIndex: 9000,
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 20,
      boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      animation: 'console-scale-in 0.25s ease',
    }}>
      {submitted ? (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 8 }}>&#10003;</div>
          <p style={{ color: 'var(--accent)', fontSize: 14, margin: 0 }}>Thanks for the feedback!</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--accent)',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              0n Feedback
            </span>
            <button
              onClick={handleDismiss}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 16,
                padding: 0,
              }}
            >
              &times;
            </button>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-primary)', margin: '0 0 12px', lineHeight: 1.5 }}>
            {question}
          </p>
          <textarea
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Your thoughts..."
            rows={3}
            style={{
              width: '100%',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '8px 12px',
              color: 'var(--text-primary)',
              fontSize: 13,
              resize: 'none',
              fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              onClick={handleDismiss}
              style={{
                flex: 1,
                padding: '8px',
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: 'inherit',
              }}
            >
              Later
            </button>
            <button
              onClick={handleSubmit}
              disabled={!response.trim()}
              style={{
                flex: 1,
                padding: '8px',
                background: response.trim() ? 'var(--accent)' : 'var(--border)',
                border: 'none',
                borderRadius: 8,
                color: response.trim() ? 'var(--bg-primary)' : 'var(--text-muted)',
                cursor: response.trim() ? 'pointer' : 'not-allowed',
                fontSize: 12,
                fontWeight: 600,
                fontFamily: 'inherit',
              }}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  )
}
