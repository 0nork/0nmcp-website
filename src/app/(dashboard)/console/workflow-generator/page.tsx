'use client'

import { useState, useCallback } from 'react'

const CHATGPT_PROMPT_URL = '/chatgpt-0n-builder.md'

const EXAMPLE_WORKFLOWS = [
  {
    label: 'New Lead Follow-Up',
    description: 'Tag new contacts, create opportunity, send welcome email',
    workflow: {
      "$0n": { "type": "workflow", "version": "1.0.0", "name": "New Lead Follow-Up", "description": "Auto-follow up when a new lead arrives" },
      "trigger": { "type": "event", "config": { "event": "contact.created" } },
      "inputs": { "contactId": { "type": "string", "required": true } },
      "steps": [
        { "id": "step_001", "name": "Tag as new lead", "service": "crm", "action": "add_contact_tags", "params": { "contactId": "{{inputs.contactId}}", "tags": ["new-lead", "auto-follow-up"] } },
        { "id": "step_002", "name": "Create opportunity", "service": "crm", "action": "create_opportunity", "params": { "name": "New Lead", "pipelineId": "{{inputs.pipelineId}}", "stageId": "{{inputs.firstStageId}}", "contactId": "{{inputs.contactId}}" }, "output": "opportunity" },
        { "id": "step_003", "name": "Send welcome email", "service": "crm", "action": "send_email", "params": { "contactId": "{{inputs.contactId}}", "subject": "Welcome!", "htmlBody": "<h2>Thanks for reaching out!</h2><p>We'll be in touch within 24 hours.</p>" } },
      ]
    }
  },
  {
    label: 'Appointment Reminder',
    description: 'Send SMS reminder 1 hour before appointment',
    workflow: {
      "$0n": { "type": "workflow", "version": "1.0.0", "name": "Appointment Reminder", "description": "SMS reminder before appointments" },
      "trigger": { "type": "schedule", "config": { "cron": "0 * * * *" } },
      "inputs": {},
      "steps": [
        { "id": "step_001", "name": "Get upcoming appointments", "service": "crm", "action": "get_appointments", "params": { "startTime": "{{system.timestamp}}", "endTime": "{{system.timestamp_plus_2h}}" }, "output": "appointments" },
        { "id": "step_002", "name": "Send SMS reminders", "service": "crm", "action": "send_message", "params": { "contactId": "{{step_001.output.events[0].contactId}}", "type": "SMS", "message": "Reminder: Your appointment is in 1 hour!" } },
      ]
    }
  },
  {
    label: 'Pipeline Stage Notification',
    description: 'Notify Slack when deal moves to Negotiation stage',
    workflow: {
      "$0n": { "type": "workflow", "version": "1.0.0", "name": "Deal Stage Alert", "description": "Slack notification on stage change" },
      "trigger": { "type": "event", "config": { "event": "opportunity.stageChanged" } },
      "inputs": { "opportunityId": { "type": "string", "required": true } },
      "steps": [
        { "id": "step_001", "name": "Post to Slack", "service": "slack", "action": "send_message", "params": { "channel": "#sales", "text": "Deal moved to Negotiation! Opportunity: {{inputs.opportunityId}}" } },
      ]
    }
  },
]

export default function WorkflowGeneratorPage() {
  const [prompt, setPrompt] = useState('')
  const [generatedJson, setGeneratedJson] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/console/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Generate a .0n workflow file for this: ${prompt.trim()}. Return ONLY the JSON, no explanation. Follow the .0n standard: $0n header with type "workflow", trigger, inputs, steps array. Each step has id, name, service, action, params. Use CRM tools: search_contacts, create_contact, add_contact_tags, send_email, create_opportunity, send_message, get_appointments, etc.`,
          mode: 'workflow-generator',
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const text = data.response || data.message || ''
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0])
            setGeneratedJson(JSON.stringify(parsed, null, 2))
          } catch {
            setGeneratedJson(jsonMatch[0])
          }
        } else {
          setGeneratedJson(text)
        }
      }
    } catch {
      setGeneratedJson('// Error generating workflow. Try again.')
    } finally {
      setLoading(false)
    }
  }, [prompt])

  const handleCopy = useCallback((text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setter(true)
    setTimeout(() => setter(false), 2000)
  }, [])

  const handleImportToBuilder = useCallback(() => {
    if (!generatedJson) return
    try {
      const data = JSON.parse(generatedJson)
      localStorage.setItem('0n-import-workflow', JSON.stringify(data))
      window.location.href = '/builder'
    } catch {
      alert('Invalid JSON — cannot import to builder')
    }
  }, [generatedJson])

  const handleLoadExample = useCallback((workflow: object) => {
    setGeneratedJson(JSON.stringify(workflow, null, 2))
  }, [])

  return (
    <div style={{ padding: '24px 28px 96px', maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: '#e8eaed', letterSpacing: '-0.02em', margin: 0 }}>
        Workflow Generator
      </h1>
      <p style={{ fontSize: 14, color: '#7a8290', marginTop: 6, marginBottom: 24 }}>
        Describe what you want to automate and get a .0n workflow file you can import into the builder.
      </p>

      {/* ChatGPT Prompt Section */}
      <div style={{
        padding: '20px', borderRadius: 14, marginBottom: 20,
        background: 'linear-gradient(135deg, rgba(126,217,87,0.06), rgba(0,212,255,0.03))',
        border: '1px solid rgba(126,217,87,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#e8eaed' }}>
              Use with ChatGPT
            </div>
            <div style={{ fontSize: 12, color: '#7A8290', marginTop: 2 }}>
              Copy our system prompt into any ChatGPT conversation to generate .0n workflows
            </div>
          </div>
          <button
            onClick={async () => {
              const res = await fetch(CHATGPT_PROMPT_URL)
              const text = await res.text()
              const promptSection = text.split('---')[1] || text
              handleCopy(promptSection.trim(), setCopiedPrompt)
            }}
            style={{
              padding: '10px 20px', borderRadius: 8, border: 'none',
              background: copiedPrompt ? 'rgba(126,217,87,0.2)' : '#6EE05A',
              color: copiedPrompt ? '#6EE05A' : '#080B0F',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s', fontFamily: 'inherit',
            }}
          >
            {copiedPrompt ? 'Copied!' : 'Copy ChatGPT Prompt'}
          </button>
        </div>
        <div style={{ fontSize: 11, color: '#5f6672', lineHeight: 1.5 }}>
          Paste the prompt as a system message in ChatGPT, then describe your workflow.
          ChatGPT will generate a valid .0n file you can import here.
        </div>
      </div>

      {/* AI Generator */}
      <div style={{
        padding: '20px', borderRadius: 14, marginBottom: 20,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#e8eaed', marginBottom: 12 }}>
          Or generate here
        </div>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g. When a new contact is created, tag them as 'new-lead', create an opportunity in the sales pipeline, and send a welcome email"
          rows={3}
          style={{
            width: '100%', padding: '12px 16px', borderRadius: 10,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#e8eaed', fontSize: 14, fontFamily: 'inherit', outline: 'none',
            resize: 'vertical', lineHeight: 1.5,
          }}
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          style={{
            marginTop: 10, padding: '12px 24px', borderRadius: 8, border: 'none',
            background: loading ? 'rgba(126,217,87,0.3)' : '#6EE05A',
            color: '#080B0F', fontSize: 14, fontWeight: 700,
            cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit',
          }}
        >
          {loading ? 'Generating...' : 'Generate .0n Workflow'}
        </button>
      </div>

      {/* Example Workflows */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#7A8290', marginBottom: 10 }}>
          Or start with an example:
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {EXAMPLE_WORKFLOWS.map(ex => (
            <button
              key={ex.label}
              onClick={() => handleLoadExample(ex.workflow)}
              style={{
                padding: '10px 16px', borderRadius: 10,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                color: '#e8eaed', fontSize: 12, fontWeight: 500,
                cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                transition: 'all 0.15s', flex: '1 1 200px',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(126,217,87,0.3)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.06)' }}
            >
              <div style={{ fontWeight: 700 }}>{ex.label}</div>
              <div style={{ fontSize: 11, color: '#5f6672', marginTop: 2 }}>{ex.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generated Output */}
      {generatedJson && (
        <div style={{
          padding: '20px', borderRadius: 14,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e8eaed' }}>
              Generated .0n Workflow
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleCopy(generatedJson, setCopied)}
                style={{
                  padding: '6px 14px', borderRadius: 6,
                  background: copied ? 'rgba(126,217,87,0.15)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: copied ? '#6EE05A' : '#7A8290',
                  fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                {copied ? 'Copied!' : 'Copy JSON'}
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([generatedJson], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'workflow.0n'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                style={{
                  padding: '6px 14px', borderRadius: 6,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#7A8290', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Download .0n
              </button>
              <button
                onClick={handleImportToBuilder}
                style={{
                  padding: '6px 14px', borderRadius: 6,
                  background: '#6EE05A', border: 'none',
                  color: '#080B0F', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Open in Builder
              </button>
            </div>
          </div>
          <pre style={{
            padding: '16px', borderRadius: 10,
            background: '#0B0F19', border: '1px solid rgba(255,255,255,0.04)',
            color: '#6EE05A', fontSize: 12, lineHeight: 1.6,
            overflow: 'auto', maxHeight: 400,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            {generatedJson}
          </pre>
        </div>
      )}
    </div>
  )
}
