'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { STATS } from '@/data/stats'

// ─── TYPES ───────────────────────────────────────────────────────

type Step = 'name' | 'email' | 'company' | 'password' | 'confirm' | 'creating' | 'done' | 'error'

interface TerminalLine {
  type: 'system' | 'prompt' | 'input' | 'success' | 'error' | 'info'
  text: string
  masked?: boolean
}

// ─── PASSWORD STRENGTH ───────────────────────────────────────────

function getStrength(pw: string): { score: number; label: string; color: string } {
  let s = 0
  if (pw.length >= 8) s++
  if (pw.length >= 12) s++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
  if (/\d/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  const score = Math.min(s, 4)
  const labels = ['weak', 'fair', 'good', 'strong']
  const colors = ['#ef4444', '#f59e0b', '#00d4ff', '#7ed957']
  return {
    score,
    label: score === 0 ? 'too short' : labels[score - 1],
    color: score === 0 ? '#ef4444' : colors[score - 1],
  }
}

// ─── COMPONENT ───────────────────────────────────────────────────

export function TerminalSignup() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('name')
  const [inputValue, setInputValue] = useState('')
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [typing, setTyping] = useState(false)

  // Collected data
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [password, setPassword] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [lines, typing])

  // Focus input on click
  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  // Type a system message with animation
  const typeMessage = useCallback((text: string, type: TerminalLine['type'] = 'system'): Promise<void> => {
    return new Promise(resolve => {
      setTyping(true)
      let i = 0
      const speed = type === 'system' ? 18 : 12
      const tempId = Date.now()

      // Add empty line that we'll build up
      setLines(prev => [...prev, { type, text: '' }])

      const timer = setInterval(() => {
        i++
        setLines(prev => {
          const next = [...prev]
          const last = next[next.length - 1]
          if (last) last.text = text.slice(0, i)
          return next
        })
        if (i >= text.length) {
          clearInterval(timer)
          setTyping(false)
          resolve()
        }
      }, speed)
    })
  }, [])

  // Add line instantly
  const addLine = useCallback((text: string, type: TerminalLine['type'] = 'system', masked = false) => {
    setLines(prev => [...prev, { type, text, masked }])
  }, [])

  // Boot sequence
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    async function boot() {
      await typeMessage(`0nMCP v2.2.0 — ${STATS.tools} tools, ${STATS.services} services`)
      await new Promise(r => setTimeout(r, 300))
      await typeMessage('Initializing account creation...', 'info')
      await new Promise(r => setTimeout(r, 400))
      addLine('')
      await typeMessage('What should we call you?', 'system')
      setStep('name')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    boot()
  }, [typeMessage, addLine])

  // Handle enter
  const handleSubmit = useCallback(async () => {
    const val = inputValue.trim()
    if (!val || typing) return

    switch (step) {
      case 'name': {
        addLine(val, 'input')
        setName(val)
        setInputValue('')
        await new Promise(r => setTimeout(r, 200))
        await typeMessage(`Welcome, ${val}.`, 'success')
        await new Promise(r => setTimeout(r, 300))
        await typeMessage('Enter your email address:', 'system')
        setStep('email')
        break
      }

      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(val)) {
          addLine(val, 'input')
          setInputValue('')
          await typeMessage('Invalid email format. Try again:', 'error')
          return
        }
        addLine(val, 'input')
        setEmail(val)
        setInputValue('')
        await new Promise(r => setTimeout(r, 200))
        await typeMessage('Email verified.', 'success')
        await new Promise(r => setTimeout(r, 300))
        await typeMessage('Company or project name (optional — press Enter to skip):', 'system')
        setStep('company')
        break
      }

      case 'company': {
        addLine(val || '(skipped)', 'input')
        setCompany(val || '')
        setInputValue('')
        await new Promise(r => setTimeout(r, 200))
        if (val) await typeMessage(`Got it — ${val}.`, 'success')
        await new Promise(r => setTimeout(r, 300))
        await typeMessage('Create a secure password (min 8 chars):', 'system')
        setStep('password')
        break
      }

      case 'password': {
        const strength = getStrength(val)
        addLine('•'.repeat(val.length), 'input', true)
        setInputValue('')

        if (val.length < 8) {
          await typeMessage('Password must be at least 8 characters.', 'error')
          return
        }

        setPassword(val)
        await new Promise(r => setTimeout(r, 100))
        addLine(`  strength: [${('█').repeat(strength.score)}${'░'.repeat(4 - strength.score)}] ${strength.label}`, 'info')
        await new Promise(r => setTimeout(r, 400))
        await typeMessage('Confirm your password:', 'system')
        setStep('confirm')
        break
      }

      case 'confirm': {
        addLine('•'.repeat(val.length), 'input', true)
        setInputValue('')

        if (val !== password) {
          await typeMessage('Passwords do not match. Try again:', 'error')
          return
        }

        await new Promise(r => setTimeout(r, 200))
        await typeMessage('Passwords match.', 'success')
        setStep('creating')
        await new Promise(r => setTimeout(r, 400))

        // Create account
        addLine('')
        await typeMessage('Creating account...', 'info')

        const supabase = createSupabaseBrowser()
        if (!supabase) {
          await typeMessage('ERROR: Auth service unavailable.', 'error')
          setStep('error')
          return
        }

        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name, company },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://0nmcp.com'}/api/auth/callback?redirect=/0nboarding`,
          },
        })

        if (err) {
          await typeMessage(`ERROR: ${err.message}`, 'error')
          await new Promise(r => setTimeout(r, 500))
          await typeMessage('Type "retry" to try again.', 'system')
          setStep('error')
          return
        }

        await new Promise(r => setTimeout(r, 600))
        await typeMessage('Account created successfully.', 'success')
        await new Promise(r => setTimeout(r, 300))
        await typeMessage(`Confirmation email sent to ${email}`, 'success')
        await new Promise(r => setTimeout(r, 400))
        addLine('')
        await typeMessage(`${STATS.tools} tools are waiting for you.`, 'info')
        await typeMessage('Check your email to verify, then log in.', 'system')
        setStep('done')
        break
      }

      case 'error': {
        if (val.toLowerCase() === 'retry') {
          addLine(val, 'input')
          setInputValue('')
          setPassword('')
          setLines([])
          initialized.current = false
          setStep('name')
          // Re-trigger boot
          setTimeout(() => {
            initialized.current = false
            setStep('name')
            window.location.reload()
          }, 100)
        }
        break
      }
    }
  }, [step, inputValue, typing, name, email, company, password, typeMessage, addLine, router])

  // Handle company skip (empty enter)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (step === 'company' && !inputValue.trim()) {
        // Allow empty submit for company
        handleSubmit()
        return
      }
      handleSubmit()
    }
  }, [handleSubmit, step, inputValue])

  // Password strength indicator (live)
  const liveStrength = step === 'password' ? getStrength(inputValue) : null

  const isPasswordStep = step === 'password' || step === 'confirm'
  const isFinished = step === 'done' || step === 'creating'

  const prompts: Record<string, string> = {
    name: 'name',
    email: 'email',
    company: 'company',
    password: 'password',
    confirm: 'confirm',
    error: 'retry',
  }

  return (
    <div className="terminal-signup" onClick={focusInput}>
      {/* Terminal chrome */}
      <div className="terminal-signup-chrome">
        <div className="terminal-signup-dots">
          <span className="terminal-signup-dot" style={{ background: '#ff5f57' }} />
          <span className="terminal-signup-dot" style={{ background: '#ffbd2e' }} />
          <span className="terminal-signup-dot" style={{ background: '#28c840' }} />
        </div>
        <div className="terminal-signup-title">0nmcp — signup</div>
        <div className="terminal-signup-dots" style={{ visibility: 'hidden' }}>
          <span className="terminal-signup-dot" />
          <span className="terminal-signup-dot" />
          <span className="terminal-signup-dot" />
        </div>
      </div>

      {/* Terminal body */}
      <div className="terminal-signup-body" ref={scrollRef}>
        {/* Output lines */}
        {lines.map((line, i) => (
          <div key={i} className={`terminal-line terminal-line-${line.type}`}>
            {line.type === 'input' && (
              <span className="terminal-prompt-prefix">{'>'} </span>
            )}
            {line.text}
          </div>
        ))}

        {/* Typing cursor */}
        {typing && <span className="terminal-cursor">█</span>}

        {/* Active input line */}
        {!typing && !isFinished && (
          <div className="terminal-input-line">
            <span className="terminal-prompt-label">{prompts[step] || '>'}</span>
            <span className="terminal-prompt-arrow">{'>'}</span>
            <div className="terminal-input-wrap">
              <input
                ref={inputRef}
                type={isPasswordStep ? 'password' : 'text'}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="terminal-input"
                autoComplete={isPasswordStep ? 'new-password' : 'off'}
                spellCheck={false}
                autoFocus
              />
              {/* Password masking overlay */}
              {isPasswordStep && inputValue && (
                <div className="terminal-password-mask">
                  {'•'.repeat(inputValue.length)}
                  <span className="terminal-cursor-blink">█</span>
                </div>
              )}
              {!isPasswordStep && !inputValue && (
                <span className="terminal-cursor-blink">█</span>
              )}
            </div>
          </div>
        )}

        {/* Live password strength */}
        {step === 'password' && inputValue.length > 0 && liveStrength && (
          <div className="terminal-strength">
            <span className="terminal-strength-bar">
              {Array.from({ length: 4 }, (_, i) => (
                <span
                  key={i}
                  className="terminal-strength-seg"
                  style={{
                    background: i < liveStrength.score ? liveStrength.color : 'rgba(255,255,255,0.06)',
                  }}
                />
              ))}
            </span>
            <span style={{ color: liveStrength.color, fontSize: '0.65rem' }}>
              {liveStrength.label}
            </span>
          </div>
        )}

        {/* Done state */}
        {step === 'done' && (
          <div className="terminal-done-actions">
            <button
              onClick={() => router.push('/login')}
              className="terminal-done-btn"
            >
              Log in →
            </button>
          </div>
        )}
      </div>

      <style>{`
        .terminal-signup {
          width: 100%;
          max-width: 640px;
          border-radius: 1rem;
          overflow: hidden;
          border: 1px solid var(--border);
          background: #0d0d14;
          box-shadow:
            0 0 60px rgba(126,217,87,0.06),
            0 25px 50px rgba(0,0,0,0.5);
          cursor: text;
        }

        .terminal-signup-chrome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid var(--border);
        }

        .terminal-signup-dots {
          display: flex;
          gap: 6px;
        }

        .terminal-signup-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .terminal-signup-title {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
          letter-spacing: 0.05em;
        }

        .terminal-signup-body {
          padding: 1.25rem 1.25rem 1rem;
          min-height: 280px;
          max-height: 420px;
          overflow-y: auto;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          line-height: 1.7;
        }

        /* Scrollbar */
        .terminal-signup-body::-webkit-scrollbar { width: 4px; }
        .terminal-signup-body::-webkit-scrollbar-track { background: transparent; }
        .terminal-signup-body::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

        /* Lines */
        .terminal-line {
          white-space: pre-wrap;
          word-break: break-word;
        }

        .terminal-line-system { color: var(--text-secondary); }
        .terminal-line-info { color: var(--text-muted); }
        .terminal-line-success { color: #7ed957; }
        .terminal-line-error { color: #ef4444; }
        .terminal-line-input { color: #00d4ff; }
        .terminal-line-prompt { color: var(--text-primary); }

        .terminal-prompt-prefix {
          color: var(--accent);
          user-select: none;
        }

        .terminal-cursor {
          color: var(--accent);
          animation: termCursorBlink 0.8s step-end infinite;
          font-size: 0.75rem;
        }

        @keyframes termCursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        /* Input line */
        .terminal-input-line {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          margin-top: 0.125rem;
        }

        .terminal-prompt-label {
          color: var(--accent);
          font-weight: 600;
          font-size: 0.7rem;
          user-select: none;
          opacity: 0.7;
        }

        .terminal-prompt-arrow {
          color: var(--accent);
          user-select: none;
        }

        .terminal-input-wrap {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .terminal-input {
          width: 100%;
          background: none;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-family: var(--font-mono);
          font-size: 0.8rem;
          caret-color: transparent;
          padding: 0;
        }

        /* For password fields, make the actual text invisible since we show dots overlay */
        .terminal-input[type="password"] {
          color: transparent;
          position: relative;
          z-index: 2;
        }

        .terminal-password-mask {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-primary);
          pointer-events: none;
          font-family: var(--font-mono);
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          letter-spacing: 0.15em;
          z-index: 1;
        }

        .terminal-cursor-blink {
          color: var(--accent);
          animation: termCursorBlink 0.8s step-end infinite;
          font-size: 0.7rem;
          margin-left: 1px;
        }

        /* Strength bar */
        .terminal-strength {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.375rem;
          padding-left: 0.25rem;
        }

        .terminal-strength-bar {
          display: flex;
          gap: 3px;
        }

        .terminal-strength-seg {
          width: 24px;
          height: 3px;
          border-radius: 2px;
          transition: background 0.2s;
        }

        /* Done */
        .terminal-done-actions {
          margin-top: 1rem;
          display: flex;
          gap: 0.75rem;
        }

        .terminal-done-btn {
          padding: 0.5rem 1.25rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(126,217,87,0.3);
          background: rgba(126,217,87,0.1);
          color: var(--accent);
          font-family: var(--font-mono);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }

        .terminal-done-btn:hover {
          background: rgba(126,217,87,0.2);
          border-color: var(--accent);
          box-shadow: 0 0 20px rgba(126,217,87,0.15);
        }
      `}</style>
    </div>
  )
}
