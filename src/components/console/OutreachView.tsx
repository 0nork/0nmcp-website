'use client'

import { useState, useCallback, useRef } from 'react'
import {
  FIELD_PROMPTS,
  TEMPLATE_STYLES,
  PERSONALIZATION_WEAVE,
  REPLY_TEMPLATES,
} from '@/lib/outreach-enricher'
import type { FieldKey, CustomField, LeadRow } from '@/lib/outreach-enricher'

/* ── Types ── */

interface UploadResult {
  rows: LeadRow[]
  headers: string[]
  totalRows: number
  preview: LeadRow[]
}

interface EnrichResultRow {
  row: LeadRow
  qualified: boolean
  qualifierResult: string
}

type Tab = 'enrich' | 'sequence' | 'templates'
type EnrichPhase = 'idle' | 'uploaded' | 'running-sample' | 'sample-done' | 'running-all' | 'done'

/* ── Helper: Next Business Days ── */

function getNextBusinessDays(): { day1: string; day2: string } {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const now = new Date()
  let d1 = new Date(now)
  d1.setDate(d1.getDate() + 1)
  while (d1.getDay() === 0 || d1.getDay() === 6) d1.setDate(d1.getDate() + 1)
  let d2 = new Date(d1)
  d2.setDate(d2.getDate() + 1)
  while (d2.getDay() === 0 || d2.getDay() === 6) d2.setDate(d2.getDate() + 1)
  return { day1: days[d1.getDay()], day2: days[d2.getDay()] }
}

/* ── Field Keys ── */

const FIELD_KEYS: FieldKey[] = [
  'location_hook',
  'competitors',
  'bad_review',
  'recent_news',
  'pain_point',
  'lead_type',
]

/* ── Component ── */

export function OutreachView() {
  /* ── Tab state ── */
  const [activeTab, setActiveTab] = useState<Tab>('enrich')

  /* ── Enrich tab state ── */
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedFields, setSelectedFields] = useState<Set<FieldKey>>(new Set())
  const [customFields, setCustomFields] = useState<CustomField[]>([])
  const [enrichPhase, setEnrichPhase] = useState<EnrichPhase>('idle')
  const [enrichResults, setEnrichResults] = useState<EnrichResultRow[]>([])
  const [enrichProgress, setEnrichProgress] = useState({ current: 0, total: 0, company: '' })
  const [qualifiedCount, setQualifiedCount] = useState(0)
  const [skippedCount, setSkippedCount] = useState(0)
  const [sampleResults, setSampleResults] = useState<EnrichResultRow[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef(false)

  /* ── Sequence tab state ── */
  const [seqService, setSeqService] = useState('')
  const [seqCaseStudies, setSeqCaseStudies] = useState('')
  const [seqGuarantees, setSeqGuarantees] = useState('')
  const [seqCtas, setSeqCtas] = useState('')
  const [seqTemplates, setSeqTemplates] = useState<Set<string>>(new Set())
  const [seqPersonalizations, setSeqPersonalizations] = useState<Set<string>>(new Set())
  const [generatingSequence, setGeneratingSequence] = useState(false)
  const [generatedSequence, setGeneratedSequence] = useState<string | null>(null)
  const [seqCopied, setSeqCopied] = useState(false)

  /* ── Templates tab state ── */
  const [templateFirstName, setTemplateFirstName] = useState('')
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null)

  /* ──────────────────────────────────────────── */
  /*  Enrich Tab Logic                           */
  /* ──────────────────────────────────────────── */

  const handleFileUpload = useCallback(async (file: File) => {
    setUploading(true)
    setUploadError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/outreach/upload', { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Upload failed' }))
        throw new Error(err.error || 'Upload failed')
      }
      const data: UploadResult = await res.json()
      setUploadResult(data)
      setEnrichPhase('uploaded')
      setEnrichResults([])
      setSampleResults([])
      setQualifiedCount(0)
      setSkippedCount(0)
    } catch (e) {
      setUploadError((e as Error).message)
    } finally {
      setUploading(false)
    }
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files?.[0]
      if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
        handleFileUpload(file)
      } else {
        setUploadError('Please upload a CSV file.')
      }
    },
    [handleFileUpload]
  )

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFileUpload(file)
    },
    [handleFileUpload]
  )

  const toggleField = (key: FieldKey) => {
    setSelectedFields((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const addCustomField = () => {
    setCustomFields((prev) => [...prev, { name: '', prompt: '' }])
  }

  const updateCustomField = (idx: number, field: Partial<CustomField>) => {
    setCustomFields((prev) => prev.map((cf, i) => (i === idx ? { ...cf, ...field } : cf)))
  }

  const removeCustomField = (idx: number) => {
    setCustomFields((prev) => prev.filter((_, i) => i !== idx))
  }

  const enrichRows = useCallback(
    async (rows: LeadRow[], isSample: boolean) => {
      abortRef.current = false
      const phase = isSample ? 'running-sample' : 'running-all'
      setEnrichPhase(phase)
      let qualified = isSample ? 0 : qualifiedCount
      let skipped = isSample ? 0 : skippedCount
      const results: EnrichResultRow[] = isSample ? [] : [...enrichResults]
      const startIdx = results.length

      setEnrichProgress({ current: 0, total: rows.length, company: '' })

      for (let i = 0; i < rows.length; i++) {
        if (abortRef.current) break
        const row = rows[i]
        const company = row['Company Name'] || row['company_name'] || 'Unknown'
        setEnrichProgress({ current: i + 1, total: rows.length, company })

        try {
          const res = await fetch('/api/outreach/enrich', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              row,
              fields: Array.from(selectedFields),
              customFields: customFields.filter((cf) => cf.name && cf.prompt),
            }),
          })
          if (!res.ok) throw new Error('Enrichment failed')
          const result: EnrichResultRow = await res.json()
          results.push(result)
          if (result.qualified) qualified++
          else skipped++
        } catch {
          results.push({ row: { ...row, 'FL Qualified': 'Error' }, qualified: false, qualifierResult: 'Error' })
          skipped++
        }

        if (isSample) {
          setSampleResults([...results])
        } else {
          setEnrichResults([...results])
        }
        setQualifiedCount(qualified)
        setSkippedCount(skipped)
      }

      if (isSample) {
        setSampleResults(results)
        setEnrichPhase('sample-done')
      } else {
        setEnrichResults(results)
        setEnrichPhase('done')
      }
    },
    [selectedFields, customFields, enrichResults, qualifiedCount, skippedCount]
  )

  const runSample = useCallback(() => {
    if (!uploadResult) return
    const sampleRows = uploadResult.rows.slice(0, 3)
    setQualifiedCount(0)
    setSkippedCount(0)
    setSampleResults([])
    enrichRows(sampleRows, true)
  }, [uploadResult, enrichRows])

  const runAll = useCallback(() => {
    if (!uploadResult) return
    setEnrichResults([])
    setQualifiedCount(0)
    setSkippedCount(0)
    enrichRows(uploadResult.rows, false)
  }, [uploadResult, enrichRows])

  const runRemaining = useCallback(() => {
    if (!uploadResult) return
    const remaining = uploadResult.rows.slice(3)
    // Keep sample results as the starting point
    setEnrichResults([...sampleResults])
    setQualifiedCount(sampleResults.filter((r) => r.qualified).length)
    setSkippedCount(sampleResults.filter((r) => !r.qualified).length)
    enrichRows(remaining, false)
  }, [uploadResult, sampleResults, enrichRows])

  const downloadCsv = useCallback(async () => {
    const allResults = enrichPhase === 'done' ? enrichResults : sampleResults
    try {
      const res = await fetch('/api/outreach/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: allResults }),
      })
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'enriched-leads.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Download failed:', e)
    }
  }, [enrichPhase, enrichResults, sampleResults])

  /* ──────────────────────────────────────────── */
  /*  Sequence Tab Logic                         */
  /* ──────────────────────────────────────────── */

  const toggleSeqTemplate = (key: string) => {
    setSeqTemplates((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toggleSeqPersonalization = (key: string) => {
    setSeqPersonalizations((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const generateSequence = useCallback(async () => {
    setGeneratingSequence(true)
    setGeneratedSequence(null)
    try {
      const res = await fetch('/api/outreach/sequence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: seqService,
          caseStudies: seqCaseStudies,
          guarantees: seqGuarantees,
          ctas: seqCtas,
          templates: Array.from(seqTemplates),
          personalizations: Array.from(seqPersonalizations),
        }),
      })
      if (!res.ok) throw new Error('Sequence generation failed')
      const data = await res.json()
      setGeneratedSequence(data.sequence || data.text || JSON.stringify(data))
    } catch (e) {
      console.error('Sequence generation failed:', e)
    } finally {
      setGeneratingSequence(false)
    }
  }, [seqService, seqCaseStudies, seqGuarantees, seqCtas, seqTemplates, seqPersonalizations])

  const copySequence = useCallback(() => {
    if (!generatedSequence) return
    navigator.clipboard.writeText(generatedSequence)
    setSeqCopied(true)
    setTimeout(() => setSeqCopied(false), 2000)
  }, [generatedSequence])

  /* ──────────────────────────────────────────── */
  /*  Templates Tab Logic                        */
  /* ──────────────────────────────────────────── */

  const { day1, day2 } = getNextBusinessDays()

  const copyTemplate = (key: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedTemplate(key)
    setTimeout(() => setCopiedTemplate(null), 2000)
  }

  /* ──────────────────────────────────────────── */
  /*  Shared Helpers                             */
  /* ──────────────────────────────────────────── */

  const canRun = uploadResult && selectedFields.size > 0
  const isRunning = enrichPhase === 'running-sample' || enrichPhase === 'running-all'
  const hasEnrichResults = enrichResults.length > 0 || sampleResults.length > 0
  const enrichedFieldKeys = Array.from(selectedFields)

  // Determine which result columns to show
  const getResultColumns = (results: EnrichResultRow[]): string[] => {
    if (results.length === 0) return []
    const allKeys = new Set<string>()
    for (const r of results) {
      for (const k of Object.keys(r.row)) allKeys.add(k)
    }
    return Array.from(allKeys)
  }

  /* ──────────────────────────────────────────── */
  /*  Render                                     */
  /* ──────────────────────────────────────────── */

  return (
    <div
      style={{
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        animation: 'console-fade-in 0.3s ease',
      }}
    >
      {/* ── Header ── */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#ffffff',
            margin: 0,
          }}
        >
          Outreach Enricher
        </h1>
        <p
          style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.7)',
            margin: '4px 0 0 0',
          }}
        >
          AI-powered lead enrichment & cold email sequences
        </p>
      </div>

      {/* ── Tab Bar ── */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginBottom: '24px',
          backgroundColor: '#111111',
          border: '1px solid #222222',
          borderRadius: '12px',
          padding: '4px',
          width: 'fit-content',
        }}
      >
        {(
          [
            { key: 'enrich', label: 'Enrich' },
            { key: 'sequence', label: 'Sequence' },
            { key: 'templates', label: 'Templates' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              backgroundColor: activeTab === tab.key ? '#7ed957' : 'transparent',
              color: activeTab === tab.key ? '#0a0a0a' : 'rgba(255,255,255,0.45)',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: activeTab === tab.key ? 700 : 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════ */}
      {/*  TAB 1: ENRICH                            */}
      {/* ══════════════════════════════════════════ */}
      {activeTab === 'enrich' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* ── File Upload Zone ── */}
          <div
            style={{
              backgroundColor: '#111111',
              border: dragOver ? '2px dashed #7ed957' : '2px dashed #222222',
              borderRadius: '16px',
              padding: '40px 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={onFileSelect}
              style={{ display: 'none' }}
            />
            {uploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '3px solid #222222',
                    borderTopColor: '#7ed957',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Uploading...</span>
              </div>
            ) : uploadResult ? (
              <div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: 'rgba(126,217,87,0.1)',
                    border: '1px solid rgba(126,217,87,0.2)',
                    borderRadius: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7ed957" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span style={{ fontSize: '14px', color: '#7ed957', fontWeight: 600 }}>
                    {uploadResult.totalRows} leads loaded
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: '8px 0 0 0' }}>
                  Click or drag to upload a different file
                </p>
              </div>
            ) : (
              <div>
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={dragOver ? '#7ed957' : 'rgba(255,255,255,0.3)'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ margin: '0 auto 12px' }}
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p style={{ fontSize: '14px', color: '#ffffff', margin: '0 0 4px 0', fontWeight: 500 }}>
                  Drop your CSV here or click to browse
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: 0 }}>
                  Supports .csv files with company data
                </p>
              </div>
            )}
          </div>

          {uploadError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: 'rgba(255,59,48,0.1)',
                border: '1px solid rgba(255,59,48,0.2)',
                borderRadius: '12px',
                color: '#ff6b6b',
                fontSize: '13px',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {uploadError}
              <button
                onClick={() => setUploadError(null)}
                style={{
                  marginLeft: 'auto',
                  background: 'transparent',
                  border: 'none',
                  color: '#ff6b6b',
                  cursor: 'pointer',
                  fontSize: '12px',
                  textDecoration: 'underline',
                }}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ── Preview Table ── */}
          {uploadResult && enrichPhase === 'uploaded' && (
            <div
              style={{
                backgroundColor: '#111111',
                border: '1px solid #222222',
                borderRadius: '16px',
                padding: '20px',
                overflow: 'hidden',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: '0 0 12px 0' }}>
                Preview ({Math.min(5, uploadResult.preview.length)} of {uploadResult.totalRows} rows)
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr>
                      {uploadResult.headers.slice(0, 8).map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: '8px 12px',
                            textAlign: 'left',
                            color: 'rgba(255,255,255,0.45)',
                            fontWeight: 600,
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: '1px solid #222222',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uploadResult.preview.slice(0, 5).map((row, i) => (
                      <tr key={i}>
                        {uploadResult.headers.slice(0, 8).map((h) => (
                          <td
                            key={h}
                            style={{
                              padding: '8px 12px',
                              color: 'rgba(255,255,255,0.7)',
                              borderBottom: '1px solid rgba(34,34,34,0.5)',
                              whiteSpace: 'nowrap',
                              maxWidth: '200px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {row[h] || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Field Selection ── */}
          {uploadResult && (enrichPhase === 'uploaded' || enrichPhase === 'sample-done') && (
            <div
              style={{
                backgroundColor: '#111111',
                border: '1px solid #222222',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: '0 0 16px 0' }}>
                Enrichment Fields
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                {FIELD_KEYS.map((key) => {
                  const cfg = FIELD_PROMPTS[key]
                  const checked = selectedFields.has(key)
                  return (
                    <label
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '12px 14px',
                        backgroundColor: checked ? 'rgba(126,217,87,0.06)' : 'rgba(255,255,255,0.02)',
                        border: checked ? '1px solid rgba(126,217,87,0.2)' : '1px solid #222222',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleField(key)}
                        style={{
                          accentColor: '#7ed957',
                          marginTop: '2px',
                          cursor: 'pointer',
                          width: '16px',
                          height: '16px',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{cfg.label}</div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'rgba(255,255,255,0.45)',
                            marginTop: '2px',
                            lineHeight: 1.4,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {cfg.example}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>

              {/* ── Custom Fields ── */}
              <div style={{ marginTop: '16px' }}>
                {customFields.map((cf, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'flex-start',
                      marginBottom: '8px',
                    }}
                  >
                    <input
                      placeholder="Field name"
                      value={cf.name}
                      onChange={(e) => updateCustomField(idx, { name: e.target.value })}
                      style={{
                        flex: '0 0 160px',
                        padding: '8px 12px',
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        border: '1px solid #222222',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                    <input
                      placeholder="AI prompt for this field..."
                      value={cf.prompt}
                      onChange={(e) => updateCustomField(idx, { prompt: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        border: '1px solid #222222',
                        borderRadius: '8px',
                        color: '#ffffff',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => removeCustomField(idx)}
                      style={{
                        padding: '8px',
                        backgroundColor: 'rgba(255,59,48,0.1)',
                        border: '1px solid rgba(255,59,48,0.2)',
                        borderRadius: '8px',
                        color: '#ff6b6b',
                        cursor: 'pointer',
                        fontSize: '16px',
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >
                      x
                    </button>
                  </div>
                ))}
                <button
                  onClick={addCustomField}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px dashed #222222',
                    borderRadius: '8px',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  + Add Custom Field
                </button>
              </div>
            </div>
          )}

          {/* ── Run Controls ── */}
          {uploadResult && (enrichPhase === 'uploaded' || enrichPhase === 'sample-done') && (
            <div
              style={{
                backgroundColor: '#111111',
                border: '1px solid #222222',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {enrichPhase === 'uploaded' && (
                  <>
                    <button
                      onClick={runSample}
                      disabled={!canRun}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: canRun ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.04)',
                        border: canRun ? '1px solid rgba(0,212,255,0.3)' : '1px solid #222222',
                        borderRadius: '10px',
                        color: canRun ? '#00d4ff' : 'rgba(255,255,255,0.3)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: canRun ? 'pointer' : 'not-allowed',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Run Sample (3 leads)
                    </button>
                    <button
                      onClick={runAll}
                      disabled={!canRun}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: canRun ? 'rgba(126,217,87,0.1)' : 'rgba(255,255,255,0.04)',
                        border: canRun ? '1px solid rgba(126,217,87,0.3)' : '1px solid #222222',
                        borderRadius: '10px',
                        color: canRun ? '#7ed957' : 'rgba(255,255,255,0.3)',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: canRun ? 'pointer' : 'not-allowed',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Run All ({uploadResult.totalRows} leads)
                    </button>
                  </>
                )}
                {enrichPhase === 'sample-done' && (
                  <>
                    <button
                      onClick={runRemaining}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: 'rgba(126,217,87,0.1)',
                        border: '1px solid rgba(126,217,87,0.3)',
                        borderRadius: '10px',
                        color: '#7ed957',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Approve — Run All Remaining
                    </button>
                    <button
                      onClick={() => setEnrichPhase('uploaded')}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        border: '1px solid #222222',
                        borderRadius: '10px',
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      Adjust Fields
                    </button>
                  </>
                )}
                <span
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.45)',
                    marginLeft: 'auto',
                  }}
                >
                  {enrichPhase === 'sample-done'
                    ? `3 Sparks used`
                    : `${enrichPhase === 'uploaded' ? uploadResult.totalRows : uploadResult.totalRows - 3} Sparks`}{' '}
                  (1 Spark per lead)
                </span>
              </div>
            </div>
          )}

          {/* ── Progress Bar ── */}
          {isRunning && (
            <div
              style={{
                backgroundColor: '#111111',
                border: '1px solid #222222',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: 600 }}>
                  Processing lead {enrichProgress.current} of {enrichProgress.total}
                </span>
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                  {Math.round((enrichProgress.current / enrichProgress.total) * 100)}%
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#222222',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '10px',
                }}
              >
                <div
                  style={{
                    width: `${(enrichProgress.current / enrichProgress.total) * 100}%`,
                    height: '100%',
                    backgroundColor: '#7ed957',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                  Company: <span style={{ color: '#ffffff', fontWeight: 500 }}>{enrichProgress.company}</span>
                </span>
                <span style={{ color: '#7ed957' }}>Qualified: {qualifiedCount}</span>
                <span style={{ color: '#ff6b35' }}>Skipped: {skippedCount}</span>
              </div>
            </div>
          )}

          {/* ── Results Summary ── */}
          {(enrichPhase === 'done' || enrichPhase === 'sample-done') && (
            <div
              style={{
                backgroundColor: '#111111',
                border: '1px solid #222222',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                  {enrichPhase === 'sample-done' ? 'Sample Results' : 'Enrichment Complete'}
                </h3>
                <button
                  onClick={downloadCsv}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: 'rgba(126,217,87,0.1)',
                    border: '1px solid rgba(126,217,87,0.2)',
                    borderRadius: '8px',
                    color: '#7ed957',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download CSV
                </button>
              </div>

              {/* Summary stats */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(126,217,87,0.06)',
                    border: '1px solid rgba(126,217,87,0.15)',
                    borderRadius: '10px',
                    textAlign: 'center',
                    flex: 1,
                  }}
                >
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#7ed957', fontFamily: 'var(--font-mono)' }}>
                    {qualifiedCount}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Qualified
                  </div>
                </div>
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255,107,53,0.06)',
                    border: '1px solid rgba(255,107,53,0.15)',
                    borderRadius: '10px',
                    textAlign: 'center',
                    flex: 1,
                  }}
                >
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#ff6b35', fontFamily: 'var(--font-mono)' }}>
                    {skippedCount}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Skipped
                  </div>
                </div>
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    border: '1px solid #222222',
                    borderRadius: '10px',
                    textAlign: 'center',
                    flex: 1,
                  }}
                >
                  <div style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                    {qualifiedCount + skippedCount}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total
                  </div>
                </div>
              </div>

              {/* Results table */}
              {(() => {
                const results = enrichPhase === 'done' ? enrichResults : sampleResults
                const cols = getResultColumns(results)
                if (results.length === 0 || cols.length === 0) return null
                return (
                  <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #222222' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                      <thead>
                        <tr>
                          {cols.map((col) => (
                            <th
                              key={col}
                              style={{
                                padding: '10px 12px',
                                textAlign: 'left',
                                color: 'rgba(255,255,255,0.45)',
                                fontWeight: 600,
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                borderBottom: '1px solid #222222',
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((result, i) => (
                          <tr key={i}>
                            {cols.map((col) => {
                              const val = result.row[col] || ''
                              const isQualCol = col === 'FL Qualified'
                              const isQualified = val === 'Qualified'
                              return (
                                <td
                                  key={col}
                                  style={{
                                    padding: '8px 12px',
                                    color: isQualCol
                                      ? isQualified
                                        ? '#7ed957'
                                        : '#ff6b35'
                                      : 'rgba(255,255,255,0.7)',
                                    borderBottom: '1px solid rgba(34,34,34,0.5)',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '250px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    fontWeight: isQualCol ? 600 : 400,
                                  }}
                                  title={val}
                                >
                                  {val || '—'}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              })()}
            </div>
          )}

          {/* ── Running Results (live accumulation) ── */}
          {isRunning && (enrichResults.length > 0 || sampleResults.length > 0) && (() => {
            const results = enrichPhase === 'running-all' ? enrichResults : sampleResults
            const cols = getResultColumns(results)
            if (results.length === 0 || cols.length === 0) return null
            return (
              <div
                style={{
                  backgroundColor: '#111111',
                  border: '1px solid #222222',
                  borderRadius: '16px',
                  padding: '20px',
                }}
              >
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: '0 0 12px 0' }}>
                  Results ({results.length} processed)
                </h3>
                <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #222222' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                    <thead>
                      <tr>
                        {cols.map((col) => (
                          <th
                            key={col}
                            style={{
                              padding: '10px 12px',
                              textAlign: 'left',
                              color: 'rgba(255,255,255,0.45)',
                              fontWeight: 600,
                              fontSize: '10px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              borderBottom: '1px solid #222222',
                              backgroundColor: 'rgba(255,255,255,0.02)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((result, i) => (
                        <tr key={i}>
                          {cols.map((col) => {
                            const val = result.row[col] || ''
                            const isQualCol = col === 'FL Qualified'
                            const isQualified = val === 'Qualified'
                            return (
                              <td
                                key={col}
                                style={{
                                  padding: '8px 12px',
                                  color: isQualCol
                                    ? isQualified
                                      ? '#7ed957'
                                      : '#ff6b35'
                                    : 'rgba(255,255,255,0.7)',
                                  borderBottom: '1px solid rgba(34,34,34,0.5)',
                                  whiteSpace: 'nowrap',
                                  maxWidth: '250px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  fontWeight: isQualCol ? 600 : 400,
                                }}
                                title={val}
                              >
                                {val || '—'}
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })()}

          {/* Spinner keyframe for upload */}
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* ══════════════════════════════════════════ */}
      {/*  TAB 2: SEQUENCE                          */}
      {/* ══════════════════════════════════════════ */}
      {activeTab === 'sequence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* ── Input Form ── */}
          <div
            style={{
              backgroundColor: '#111111',
              border: '1px solid #222222',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: '0 0 16px 0' }}>
              Campaign Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>
                  Service being sold *
                </label>
                <input
                  value={seqService}
                  onChange={(e) => setSeqService(e.target.value)}
                  placeholder="e.g. Custom branded merchandise for corporate teams"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid #222222',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>
                  Case studies
                </label>
                <textarea
                  value={seqCaseStudies}
                  onChange={(e) => setSeqCaseStudies(e.target.value)}
                  placeholder="Used verbatim, never fabricated"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid #222222',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>
                  Guarantees
                </label>
                <textarea
                  value={seqGuarantees}
                  onChange={(e) => setSeqGuarantees(e.target.value)}
                  placeholder="e.g. Free mockup before you commit, 100% refund guarantee"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid #222222',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>
                  CTAs to test
                </label>
                <textarea
                  value={seqCtas}
                  onChange={(e) => setSeqCtas(e.target.value)}
                  placeholder="e.g. Share a video, send a catalog, book a 15-min call"
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid #222222',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── Template Style Selection ── */}
          <div
            style={{
              backgroundColor: '#111111',
              border: '1px solid #222222',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: '0 0 16px 0' }}>
              Template Styles
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
              {Object.entries(TEMPLATE_STYLES).map(([key, style]) => {
                const checked = seqTemplates.has(key)
                return (
                  <label
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '12px 14px',
                      backgroundColor: checked ? 'rgba(167,139,250,0.06)' : 'rgba(255,255,255,0.02)',
                      border: checked ? '1px solid rgba(167,139,250,0.2)' : '1px solid #222222',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSeqTemplate(key)}
                      style={{
                        accentColor: '#a78bfa',
                        marginTop: '2px',
                        cursor: 'pointer',
                        width: '16px',
                        height: '16px',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{style.label}</div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'rgba(255,255,255,0.45)',
                          marginTop: '2px',
                          lineHeight: 1.4,
                        }}
                      >
                        {style.example}
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* ── Personalization Weave ── */}
          {hasEnrichResults && (
            <div
              style={{
                backgroundColor: '#111111',
                border: '1px solid #222222',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: '0 0 16px 0' }}>
                Personalization Weave
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: '0 0 12px 0' }}>
                Select enriched fields to weave into your email sequence as merge tags.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
                {enrichedFieldKeys
                  .filter((key) => key in PERSONALIZATION_WEAVE)
                  .map((key) => {
                    const pw = PERSONALIZATION_WEAVE[key]
                    const checked = seqPersonalizations.has(key)
                    return (
                      <label
                        key={key}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          padding: '12px 14px',
                          backgroundColor: checked ? 'rgba(0,212,255,0.06)' : 'rgba(255,255,255,0.02)',
                          border: checked ? '1px solid rgba(0,212,255,0.2)' : '1px solid #222222',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSeqPersonalization(key)}
                          style={{
                            accentColor: '#00d4ff',
                            marginTop: '2px',
                            cursor: 'pointer',
                            width: '16px',
                            height: '16px',
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                            <span style={{ color: '#00d4ff', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                              {pw.tag}
                            </span>
                            {' '}{pw.label}
                          </div>
                          <div
                            style={{
                              fontSize: '11px',
                              color: 'rgba(255,255,255,0.45)',
                              marginTop: '2px',
                              lineHeight: 1.4,
                            }}
                          >
                            {pw.example}
                          </div>
                        </div>
                      </label>
                    )
                  })}
              </div>
            </div>
          )}

          {/* ── Generate Button ── */}
          <div
            style={{
              backgroundColor: '#111111',
              border: '1px solid #222222',
              borderRadius: '16px',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <button
              onClick={generateSequence}
              disabled={!seqService.trim() || generatingSequence}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor:
                  !seqService.trim() || generatingSequence
                    ? 'rgba(255,255,255,0.04)'
                    : '#7ed957',
                border: 'none',
                borderRadius: '10px',
                color:
                  !seqService.trim() || generatingSequence
                    ? 'rgba(255,255,255,0.3)'
                    : '#0a0a0a',
                fontSize: '14px',
                fontWeight: 700,
                cursor: !seqService.trim() || generatingSequence ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {generatingSequence ? (
                <>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.2)',
                      borderTopColor: 'rgba(255,255,255,0.6)',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  Generating...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Generate Sequence (5 Sparks)
                </>
              )}
            </button>
            {!seqService.trim() && (
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                Enter the service you sell to enable generation
              </span>
            )}
          </div>

          {/* ── Generated Sequence Output ── */}
          {generatedSequence && (
            <div
              style={{
                backgroundColor: '#111111',
                border: '1px solid #222222',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                  Generated Sequence
                </h3>
                <button
                  onClick={copySequence}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: seqCopied ? 'rgba(126,217,87,0.1)' : 'rgba(255,255,255,0.06)',
                    border: seqCopied ? '1px solid rgba(126,217,87,0.2)' : '1px solid #222222',
                    borderRadius: '8px',
                    color: seqCopied ? '#7ed957' : 'rgba(255,255,255,0.7)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {seqCopied ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  )}
                  {seqCopied ? 'Copied' : 'Copy to Clipboard'}
                </button>
              </div>
              <pre
                style={{
                  backgroundColor: '#0a0a0a',
                  border: '1px solid #222222',
                  borderRadius: '10px',
                  padding: '20px',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  margin: 0,
                  maxHeight: '600px',
                  overflowY: 'auto',
                }}
              >
                {generatedSequence}
              </pre>
            </div>
          )}

          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* ══════════════════════════════════════════ */}
      {/*  TAB 3: TEMPLATES                         */}
      {/* ══════════════════════════════════════════ */}
      {activeTab === 'templates' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* ── Pricing Inquiry ── */}
          <div
            style={{
              backgroundColor: '#111111',
              border: '1px solid #222222',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                  {REPLY_TEMPLATES.pricing_inquiry.label}
                </h3>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: '4px 0 0 0' }}>
                  Auto-fills {day1} and {day2} as next business days
                </p>
              </div>
              <button
                onClick={() =>
                  copyTemplate(
                    'pricing',
                    REPLY_TEMPLATES.pricing_inquiry.template
                      .replace(/{day1}/g, day1)
                      .replace(/{day2}/g, day2)
                  )
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor:
                    copiedTemplate === 'pricing' ? 'rgba(126,217,87,0.1)' : 'rgba(255,255,255,0.06)',
                  border:
                    copiedTemplate === 'pricing'
                      ? '1px solid rgba(126,217,87,0.2)'
                      : '1px solid #222222',
                  borderRadius: '8px',
                  color: copiedTemplate === 'pricing' ? '#7ed957' : 'rgba(255,255,255,0.7)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {copiedTemplate === 'pricing' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                )}
                {copiedTemplate === 'pricing' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #222222',
                borderRadius: '10px',
                padding: '16px',
                color: 'rgba(255,255,255,0.85)',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: 0,
              }}
            >
              {REPLY_TEMPLATES.pricing_inquiry.template
                .replace(/{day1}/g, day1)
                .replace(/{day2}/g, day2)}
            </pre>
          </div>

          {/* ── Video Request Follow-up ── */}
          <div
            style={{
              backgroundColor: '#111111',
              border: '1px solid #222222',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', margin: 0 }}>
                  {REPLY_TEMPLATES.video_request.label}
                </h3>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', margin: '4px 0 0 0' }}>
                  Auto-fills name, {day1}, and {day2}
                </p>
              </div>
              <button
                onClick={() =>
                  copyTemplate(
                    'video',
                    REPLY_TEMPLATES.video_request.template
                      .replace(/{firstName}/g, templateFirstName || '{firstName}')
                      .replace(/{day1}/g, day1)
                      .replace(/{day2}/g, day2)
                  )
                }
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor:
                    copiedTemplate === 'video' ? 'rgba(126,217,87,0.1)' : 'rgba(255,255,255,0.06)',
                  border:
                    copiedTemplate === 'video'
                      ? '1px solid rgba(126,217,87,0.2)'
                      : '1px solid #222222',
                  borderRadius: '8px',
                  color: copiedTemplate === 'video' ? '#7ed957' : 'rgba(255,255,255,0.7)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {copiedTemplate === 'video' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                )}
                {copiedTemplate === 'video' ? 'Copied' : 'Copy'}
              </button>
            </div>

            {/* First Name input */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '6px' }}>
                First Name
              </label>
              <input
                value={templateFirstName}
                onChange={(e) => setTemplateFirstName(e.target.value)}
                placeholder="Enter first name..."
                style={{
                  width: '240px',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid #222222',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <pre
              style={{
                backgroundColor: '#0a0a0a',
                border: '1px solid #222222',
                borderRadius: '10px',
                padding: '16px',
                color: 'rgba(255,255,255,0.85)',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                margin: 0,
              }}
            >
              {REPLY_TEMPLATES.video_request.template
                .replace(/{firstName}/g, templateFirstName || '{firstName}')
                .replace(/{day1}/g, day1)
                .replace(/{day2}/g, day2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
