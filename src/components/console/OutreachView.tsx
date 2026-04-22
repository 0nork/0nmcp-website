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

type Tab = 'enrich' | 'sequence' | 'templates' | 'listkit'
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

export function OutreachView({ initialTab }: { initialTab?: Tab } = {}) {
  /* ── Tab state ── */
  const [activeTab, setActiveTab] = useState<Tab>(initialTab || 'enrich')

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
    <div className="p-6 max-w-[1200px] mx-auto w-full animate-[console-fade-in_0.3s_ease]">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] m-0">
          Outreach Enricher
        </h1>
        <p className="text-[13px] text-white/70 mt-1 mb-0">
          AI-powered lead enrichment &amp; cold email sequences
        </p>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex gap-1.5 mb-6 bg-[var(--bg-card)] border border-[#222222] rounded-xl p-1 w-fit">
        {(
          [
            { key: 'enrich', label: 'Enrich' },
            { key: 'sequence', label: 'Sequence' },
            { key: 'templates', label: 'Templates' },
            { key: 'listkit', label: 'ListKit' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={[
              'border-none rounded-lg px-5 py-2 text-[13px] cursor-pointer transition-all duration-200',
              activeTab === tab.key
                ? 'bg-[#6EE05A] text-[#0B0F19] font-bold'
                : 'bg-transparent text-white/45 font-medium',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════ */}
      {/*  TAB 1: ENRICH                            */}
      {/* ══════════════════════════════════════════ */}
      {activeTab === 'enrich' && (
        <div className="flex flex-col gap-5">
          {/* ── File Upload Zone ── */}
          <div
            className={[
              'bg-[var(--bg-card)] rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 relative',
              dragOver ? 'border-2 border-dashed border-[#6EE05A]' : 'border-2 border-dashed border-[#222222]',
            ].join(' ')}
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
              className="hidden"
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-[3px] border-[#222222] border-t-[#6EE05A] rounded-full animate-spin" />
                <span className="text-[14px] text-white/70">Uploading...</span>
              </div>
            ) : uploadResult ? (
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(126,217,87,0.1)] border border-[rgba(126,217,87,0.2)] rounded-lg mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6EE05A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span className="text-[14px] text-[#6EE05A] font-semibold">
                    {uploadResult.totalRows} leads loaded
                  </span>
                </div>
                <p className="text-[12px] text-white/45 mt-2 mb-0">
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
                  stroke={dragOver ? '#6EE05A' : 'rgba(255,255,255,0.3)'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto mb-3"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <p className="text-[14px] text-[var(--text-primary)] mb-1 font-medium">
                  Drop your CSV here or click to browse
                </p>
                <p className="text-[12px] text-white/45 m-0">
                  Supports .csv files with company data
                </p>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-[rgba(255,59,48,0.1)] border border-[rgba(255,59,48,0.2)] rounded-xl text-[#ff6b6b] text-[13px]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {uploadError}
              <button
                onClick={() => setUploadError(null)}
                className="ml-auto bg-transparent border-none text-[#ff6b6b] cursor-pointer text-[12px] underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ── Preview Table ── */}
          {uploadResult && enrichPhase === 'uploaded' && (
            <div className="bg-[var(--bg-card)] border border-[#222222] rounded-2xl p-5 overflow-hidden">
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mt-0 mb-3">
                Preview ({Math.min(5, uploadResult.preview.length)} of {uploadResult.totalRows} rows)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[12px]">
                  <thead>
                    <tr>
                      {uploadResult.headers.slice(0, 8).map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-white/45 font-semibold text-[11px] uppercase tracking-wide border-b border-[#222222] whitespace-nowrap"
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
                            className="px-3 py-2 text-white/70 border-b border-[rgba(34,34,34,0.5)] whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis"
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
            <div className="bg-[var(--bg-card)] border border-[#222222] rounded-2xl p-5">
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mt-0 mb-4">
                Enrichment Fields
              </h3>
              <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {FIELD_KEYS.map((key) => {
                  const cfg = FIELD_PROMPTS[key]
                  const checked = selectedFields.has(key)
                  return (
                    <label
                      key={key}
                      className={[
                        'flex items-start gap-2.5 px-3.5 py-3 rounded-[10px] cursor-pointer transition-all duration-150',
                        checked
                          ? 'bg-[rgba(126,217,87,0.06)] border border-[rgba(126,217,87,0.2)]'
                          : 'bg-[rgba(255,255,255,0.02)] border border-[#222222]',
                      ].join(' ')}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleField(key)}
                        className="mt-0.5 cursor-pointer w-4 h-4 shrink-0 accent-[#6EE05A]"
                      />
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-[var(--text-primary)]">{cfg.label}</div>
                        <div className="text-[11px] text-white/45 mt-0.5 leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap">
                          {cfg.example}
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>

              {/* ── Custom Fields ── */}
              <div className="mt-4">
                {customFields.map((cf, idx) => (
                  <div key={idx} className="flex gap-2 items-start mb-2">
                    <input
                      placeholder="Field name"
                      value={cf.name}
                      onChange={(e) => updateCustomField(idx, { name: e.target.value })}
                      className="shrink-0 basis-[160px] px-3 py-2 bg-[var(--bg-card)] border border-[#222222] rounded-lg text-[var(--text-primary)] text-[13px] outline-none"
                    />
                    <input
                      placeholder="AI prompt for this field..."
                      value={cf.prompt}
                      onChange={(e) => updateCustomField(idx, { prompt: e.target.value })}
                      className="flex-1 px-3 py-2 bg-[var(--bg-card)] border border-[#222222] rounded-lg text-[var(--text-primary)] text-[13px] outline-none"
                    />
                    <button
                      onClick={() => removeCustomField(idx)}
                      className="p-2 bg-[rgba(255,59,48,0.1)] border border-[rgba(255,59,48,0.2)] rounded-lg text-[#ff6b6b] cursor-pointer text-[16px] leading-none shrink-0"
                    >
                      x
                    </button>
                  </div>
                ))}
                <button
                  onClick={addCustomField}
                  className="px-4 py-2 bg-[var(--bg-card)] border border-dashed border-[#222222] rounded-lg text-white/70 text-[13px] cursor-pointer transition-all duration-150"
                >
                  + Add Custom Field
                </button>
              </div>
            </div>
          )}

          {/* ── Run Controls ── */}
          {uploadResult && (enrichPhase === 'uploaded' || enrichPhase === 'sample-done') && (
            <div className="bg-[var(--bg-card)] border border-[#222222] rounded-2xl p-5">
              <div className="flex items-center gap-3 flex-wrap">
                {enrichPhase === 'uploaded' && (
                  <>
                    <button
                      onClick={runSample}
                      disabled={!canRun}
                      className={[
                        'px-5 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all duration-150',
                        canRun
                          ? 'bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] text-[#00d4ff] cursor-pointer'
                          : 'bg-[var(--bg-card)] border border-[#222222] text-white/30 cursor-not-allowed',
                      ].join(' ')}
                    >
                      Run Sample (3 leads)
                    </button>
                    <button
                      onClick={runAll}
                      disabled={!canRun}
                      className={[
                        'px-5 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all duration-150',
                        canRun
                          ? 'bg-[rgba(126,217,87,0.1)] border border-[rgba(126,217,87,0.3)] text-[#6EE05A] cursor-pointer'
                          : 'bg-[var(--bg-card)] border border-[#222222] text-white/30 cursor-not-allowed',
                      ].join(' ')}
                    >
                      Run All ({uploadResult.totalRows} leads)
                    </button>
                  </>
                )}
                {enrichPhase === 'sample-done' && (
                  <>
                    <button
                      onClick={runRemaining}
                      className="px-5 py-2.5 bg-[rgba(126,217,87,0.1)] border border-[rgba(126,217,87,0.3)] rounded-[10px] text-[#6EE05A] text-[13px] font-semibold cursor-pointer transition-all duration-150"
                    >
                      Approve — Run All Remaining
                    </button>
                    <button
                      onClick={() => setEnrichPhase('uploaded')}
                      className="px-5 py-2.5 bg-[var(--bg-card)] border border-[#222222] rounded-[10px] text-white/70 text-[13px] font-medium cursor-pointer transition-all duration-150"
                    >
                      Adjust Fields
                    </button>
                  </>
                )}
                <span className="text-[12px] text-white/45 ml-auto">
                  {enrichPhase === 'sample-done'
                    ? `3 Runs used`
                    : `${enrichPhase === 'uploaded' ? uploadResult.totalRows : uploadResult.totalRows - 3} Runs`}{' '}
                  (1 Spark per lead)
                </span>
              </div>
            </div>
          )}

          {/* ── Progress Bar ── */}
          {isRunning && (
            <div className="bg-[var(--bg-card)] border border-[#222222] rounded-2xl p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[13px] text-[var(--text-primary)] font-semibold">
                  Processing lead {enrichProgress.current} of {enrichProgress.total}
                </span>
                <span className="text-[12px] text-white/45">
                  {Math.round((enrichProgress.current / enrichProgress.total) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 bg-[#222222] rounded overflow-hidden mb-2.5">
                <div
                  className="h-full bg-[#6EE05A] rounded transition-[width] duration-300"
                  style={{ width: `${(enrichProgress.current / enrichProgress.total) * 100}%` }}
                />
              </div>
              <div className="flex gap-4 text-[12px]">
                <span className="text-white/70">
                  Company: <span className="text-[var(--text-primary)] font-medium">{enrichProgress.company}</span>
                </span>
                <span className="text-[#6EE05A]">Qualified: {qualifiedCount}</span>
                <span className="text-[#ff6b35]">Skipped: {skippedCount}</span>
              </div>
            </div>
          )}

          {/* ── Results Summary ── */}
          {(enrichPhase === 'done' || enrichPhase === 'sample-done') && (
            <div className="bg-[var(--bg-card)] border border-[#222222] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)] m-0">
                  {enrichPhase === 'sample-done' ? 'Sample Results' : 'Enrichment Complete'}
                </h3>
                <button
                  onClick={downloadCsv}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[rgba(126,217,87,0.1)] border border-[rgba(126,217,87,0.2)] rounded-lg text-[#6EE05A] text-[13px] font-semibold cursor-pointer transition-all duration-150"
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
              <div className="flex gap-4 mb-4">
                <div className="flex-1 p-3 px-4 bg-[rgba(126,217,87,0.06)] border border-[rgba(126,217,87,0.15)] rounded-[10px] text-center">
                  <div className="text-[22px] font-bold text-[#6EE05A] font-mono">
                    {qualifiedCount}
                  </div>
                  <div className="text-[11px] text-white/45 uppercase tracking-wide">
                    Qualified
                  </div>
                </div>
                <div className="flex-1 p-3 px-4 bg-[rgba(255,107,53,0.06)] border border-[rgba(255,107,53,0.15)] rounded-[10px] text-center">
                  <div className="text-[22px] font-bold text-[#ff6b35] font-mono">
                    {skippedCount}
                  </div>
                  <div className="text-[11px] text-white/45 uppercase tracking-wide">
                    Skipped
                  </div>
                </div>
                <div className="flex-1 p-3 px-4 bg-[rgba(255,255,255,0.02)] border border-[#222222] rounded-[10px] text-center">
                  <div className="text-[22px] font-bold text-[var(--text-primary)] font-mono">
                    {qualifiedCount + skippedCount}
                  </div>
                  <div className="text-[11px] text-white/45 uppercase tracking-wide">
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
                  <div className="overflow-x-auto rounded-[10px] border border-[#222222]">
                    <table className="w-full border-collapse text-[12px]">
                      <thead>
                        <tr>
                          {cols.map((col) => (
                            <th
                              key={col}
                              className="px-3 py-2.5 text-left text-white/45 font-semibold text-[10px] uppercase tracking-wide border-b border-[#222222] bg-[rgba(255,255,255,0.02)] whitespace-nowrap"
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
                                  className={[
                                    'px-3 py-2 border-b border-[rgba(34,34,34,0.5)] whitespace-nowrap max-w-[250px] overflow-hidden text-ellipsis',
                                    isQualCol
                                      ? isQualified
                                        ? 'text-[#6EE05A] font-semibold'
                                        : 'text-[#ff6b35] font-semibold'
                                      : 'text-white/70 font-normal',
                                  ].join(' ')}
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
              <div className="bg-[var(--bg-card)] border border-[#222222] rounded-2xl p-5">
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mt-0 mb-3">
                  Results ({results.length} processed)
                </h3>
                <div className="overflow-x-auto rounded-[10px] border border-[#222222]">
                  <table className="w-full border-collapse text-[12px]">
                    <thead>
                      <tr>
                        {cols.map((col) => (
                          <th
                            key={col}
                            className="px-3 py-2.5 text-left text-white/45 font-semibold text-[10px] uppercase tracking-wide border-b border-[#222222] bg-[rgba(255,255,255,0.02)] whitespace-nowrap"
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
                                className={[
                                  'px-3 py-2 border-b border-[rgba(34,34,34,0.5)] whitespace-nowrap max-w-[250px] overflow-hidden text-ellipsis',
                                  isQualCol
                                    ? isQualified
                                      ? 'text-[#6EE05A] font-semibold'
                                      : 'text-[#ff6b35] font-semibold'
                                    : 'text-white/70 font-normal',
                                ].join(' ')}
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
        </div>
      )}

      {/* ══════════════════════════════════════════ */}
      {/*  TAB 2: SEQUENCE                          */}
      {/* ══════════════════════════════════════════ */}
      {activeTab === 'sequence' && (
        <div className="flex flex-col gap-5">
          {/* ── Input Form ── */}
          <div className="bg-[var(--bg-card)] border border-[#222222] rounded-2xl p-5">
            <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mt-0 mb-4">
              Campaign Details
            </h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[12px] font-semibold text-white/70 block mb-1.5">
                  Service being sold *
                </label>
                <input
                  value={seqService}
                  onChange={(e) => setSeqService(e.target.value)}
                  placeholder="e.g. Custom branded merchandise for corporate teams"
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-card)] border border-[#222222] rounded-[10px] text-[var(--text-primary)] text-[13px] outline-none box-border"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-white/70 block mb-1.5">
                  Case studies
                </label>
                <textarea
                  value={seqCaseStudies}
                  onChange={(e) => setSeqCaseStudies(e.target.value)}
                  placeholder="Used verbatim, never fabricated"
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-card)] border border-[#222222] rounded-[10px] text-[var(--text-primary)] text-[13px] outline-none resize-y font-[inherit] box-border"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-white/70 block mb-1.5">
                  Guarantees
                </label>
                <textarea
                  value={seqGuarantees}
                  onChange={(e) => setSeqGuarantees(e.target.value)}
                  placeholder="e.g. Free mockup before you commit, 100% refund guarantee"
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-card)] border border-[#222222] rounded-[10px] text-[var(--text-primary)] text-[13px] outline-none resize-y font-[inherit] box-border"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-white/70 block mb-1.5">
                  CTAs to test
                </label>
                <textarea
                  value={seqCtas}
                  onChange={(e) => setSeqCtas(e.target.value)}
                  placeholder="e.g. Share a video, send a catalog, book a 15-min call"
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-card)] border border-[#222222] rounded-[10px] text-[var(--text-primary)] text-[13px] outline-none resize-y font-[inherit] box-border"
                />
              </div>
            </div>
          </div>

          {/* ── Template Style Selection ── */}
          <div className="bg-[var(--bg-card)] border border-[#222222] rounded-2xl p-5">
            <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mt-0 mb-4">
              Template Styles
            </h3>
            <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {Object.entries(TEMPLATE_STYLES).map(([key, style]) => {
                const checked = seqTemplates.has(key)
                return (
                  <label
                    key={key}
                    className={[
                      'flex items-start gap-2.5 px-3.5 py-3 rounded-[10px] cursor-pointer transition-all duration-150',
                      checked
                        ? 'bg-[rgba(167,139,250,0.06)] border border-[rgba(167,139,250,0.2)]'
                        : 'bg-[rgba(255,255,255,0.02)] border border-[#222222]',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleSeqTemplate(key)}
                      className="mt-0.5 cursor-pointer w-4 h-4 shrink-0 accent-[#a78bfa]"
                    />
                    <div className="min-w-0">
                      <div className="text-[13px] font-semibold text-[var(--text-primary)]">{style.label}</div>
                      <div className="text-[11px] text-white/45 mt-0.5 leading-[1.4]">
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
            <div className="bg-[var(--bg-card)] border border-[#222222] rounded-2xl p-5">
              <h3 className="text-[15px] font-semibold text-[var(--text-primary)] mt-0 mb-4">
                Personalization Weave
              </h3>
              <p className="text-[12px] text-white/45 mt-0 mb-3">
                Select enriched fields to weave into your email sequence as merge tags.
              </p>
              <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
                {enrichedFieldKeys
                  .filter((key) => key in PERSONALIZATION_WEAVE)
                  .map((key) => {
                    const pw = PERSONALIZATION_WEAVE[key]
                    const checked = seqPersonalizations.has(key)
                    return (
                      <label
                        key={key}
                        className={[
                          'flex items-start gap-2.5 px-3.5 py-3 rounded-[10px] cursor-pointer transition-all duration-150',
                          checked
                            ? 'bg-[rgba(0,212,255,0.06)] border border-[rgba(0,212,255,0.2)]'
                            : 'bg-[rgba(255,255,255,0.02)] border border-[#222222]',
                        ].join(' ')}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSeqPersonalization(key)}
                          className="mt-0.5 cursor-pointer w-4 h-4 shrink-0 accent-[#00d4ff]"
                        />
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-[var(--text-primary)]">
                            <span className="text-[#00d4ff] font-mono text-[12px]">
                              {pw.tag}
                            </span>
                            {' '}{pw.label}
                          </div>
                          <div className="text-[11px] text-white/45 mt-0.5 leading-[1.4]">
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
          <div className="bg-[var(--bg-card)] border border-[#222222] rounded-2xl p-5 flex items-center gap-3">
            <button
              onClick={generateSequence}
              disabled={!seqService.trim() || generatingSequence}
              className={[
                'flex items-center gap-2 px-6 py-3 rounded-[10px] border-none text-[14px] font-bold transition-all duration-150',
                !seqService.trim() || generatingSequence
                  ? 'bg-[var(--bg-card)] text-white/30 cursor-not-allowed'
                  : 'bg-[#6EE05A] text-[#0B0F19] cursor-pointer',
              ].join(' ')}
            >
              {generatingSequence ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Generate Sequence (5 Runs)
                </>
              )}
            </button>
            {!seqService.trim() && (
              <span className="text-[12px] text-white/45">
                Enter the service you sell to enable generation
              </span>
            )}
          </div>

          {/* ── Generated Sequence Output ── */}
          {generatedSequence && (
            <div className="bg-[var(--bg-card)] border border-[#222222] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)] m-0">
                  Generated Sequence
                </h3>
                <button
                  onClick={copySequence}
                  className={[
                    'flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150',
                    seqCopied
                      ? 'bg-[rgba(126,217,87,0.1)] border border-[rgba(126,217,87,0.2)] text-[#6EE05A]'
                      : 'bg-[var(--border)] border border-[#222222] text-white/70',
                  ].join(' ')}
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
              <pre className="bg-[var(--bg-primary)] border border-[#222222] rounded-[10px] p-5 text-white/85 text-[13px] font-mono leading-[1.7] whitespace-pre-wrap break-words m-0 max-h-[600px] overflow-y-auto">
                {generatedSequence}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════ */}
      {/*  TAB 4: LISTKIT                            */}
      {/* ══════════════════════════════════════════ */}
      {activeTab === 'listkit' && <ListKitTab onSwitchTab={setActiveTab} />}

      {/* ══════════════════════════════════════════ */}
      {/*  TAB 3: TEMPLATES                         */}
      {/* ══════════════════════════════════════════ */}
      {activeTab === 'templates' && (
        <div className="flex flex-col gap-5">
          {/* ── Pricing Inquiry ── */}
          <div className="bg-[var(--bg-card)] border border-[#222222] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)] m-0">
                  {REPLY_TEMPLATES.pricing_inquiry.label}
                </h3>
                <p className="text-[12px] text-white/45 mt-1 mb-0">
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
                className={[
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150',
                  copiedTemplate === 'pricing'
                    ? 'bg-[rgba(126,217,87,0.1)] border border-[rgba(126,217,87,0.2)] text-[#6EE05A]'
                    : 'bg-[var(--border)] border border-[#222222] text-white/70',
                ].join(' ')}
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
            <pre className="bg-[var(--bg-primary)] border border-[#222222] rounded-[10px] p-4 text-white/85 text-[13px] font-mono leading-[1.6] whitespace-pre-wrap break-words m-0">
              {REPLY_TEMPLATES.pricing_inquiry.template
                .replace(/{day1}/g, day1)
                .replace(/{day2}/g, day2)}
            </pre>
          </div>

          {/* ── Video Request Follow-up ── */}
          <div className="bg-[var(--bg-card)] border border-[#222222] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)] m-0">
                  {REPLY_TEMPLATES.video_request.label}
                </h3>
                <p className="text-[12px] text-white/45 mt-1 mb-0">
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
                className={[
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150',
                  copiedTemplate === 'video'
                    ? 'bg-[rgba(126,217,87,0.1)] border border-[rgba(126,217,87,0.2)] text-[#6EE05A]'
                    : 'bg-[var(--border)] border border-[#222222] text-white/70',
                ].join(' ')}
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
            <div className="mb-3">
              <label className="text-[12px] font-semibold text-white/70 block mb-1.5">
                First Name
              </label>
              <input
                value={templateFirstName}
                onChange={(e) => setTemplateFirstName(e.target.value)}
                placeholder="Enter first name..."
                className="w-[240px] px-3 py-2 bg-[var(--bg-card)] border border-[#222222] rounded-lg text-[var(--text-primary)] text-[13px] outline-none"
              />
            </div>

            <pre className="bg-[var(--bg-primary)] border border-[#222222] rounded-[10px] p-4 text-white/85 text-[13px] font-mono leading-[1.6] whitespace-pre-wrap break-words m-0">
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

/* ──────────────────────────────────────────── */
/*  ListKit Integration Tab                    */
/* ──────────────────────────────────────────── */

const LISTKIT_CYAN = '#00d4ff'

const LISTKIT_COLUMNS = [
  'First Name', 'Last Name', 'Business Email', 'Personal Email',
  'Job Title', 'Company Name', 'Industry', 'Employee Count',
  'Location', 'LinkedIn URL', 'Phone', 'Personalized First Line 1',
  'Personalized First Line 2',
]

const INTEGRATION_WORKFLOWS = [
  {
    title: 'ListKit CSV → Enrich → Sequence',
    desc: 'Export from ListKit, drop CSV here, AI qualifies + enriches all leads, then generate personalized email sequences.',
    steps: ['Export CSV from ListKit', 'Upload to Enrich tab', 'Select enrichment fields', 'Run enrichment', 'Switch to Sequence tab', 'Generate emails'],
    color: '#6EE05A',
    ready: true,
  },
  {
    title: 'ListKit → Zapier → Auto-Enrich',
    desc: 'ListKit\'s "Email Order Completed" Zapier trigger sends leads to a webhook. Auto-enriched and routed to your CRM pipeline.',
    steps: ['Set up Zapier trigger in ListKit', 'Connect to 0n webhook', 'Leads auto-enriched', 'Contacts created in CRM'],
    color: '#ff6b35',
    ready: false,
  },
  {
    title: 'ListKit Data Stream → Daily Pipeline',
    desc: 'ListKit refreshes intent-based leads daily. Combined with Zapier, creates a fully automated prospecting machine.',
    steps: ['Configure Data Stream in ListKit', 'Set intent topics', 'Zapier auto-exports daily', 'Enriched leads flow to CRM'],
    color: '#a78bfa',
    ready: false,
  },
  {
    title: 'ListKit → CRM Bridge',
    desc: 'Sync ListKit leads to HubSpot/Salesforce, then bridge to CRM via 0nMCP\'s 245 CRM tools.',
    steps: ['ListKit syncs to HubSpot/SF', 'Webhook fires on new contact', '0nMCP creates CRM contact', 'Auto-assigns to pipeline'],
    color: '#f472b6',
    ready: false,
  },
]

function ListKitTab({ onSwitchTab }: { onSwitchTab: (tab: Tab) => void }) {
  return (
    <div className="flex flex-col gap-5">
      {/* Hero */}
      <div className="bg-[linear-gradient(135deg,rgba(0,212,255,0.08),rgba(167,139,250,0.06))] border border-[rgba(0,212,255,0.2)] rounded-2xl p-7 flex items-center gap-5">
        <div className="w-14 h-14 rounded-[14px] bg-[linear-gradient(135deg,#00d4ff,#0099cc)] flex items-center justify-center shrink-0 shadow-[0_4px_20px_rgba(0,212,255,0.25)]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
            <line x1="9" y1="12" x2="15" y2="12" />
            <line x1="9" y1="16" x2="13" y2="16" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="text-[18px] font-bold text-[var(--text-primary)] m-0">
            ListKit Integration
          </h2>
          <p className="text-[13px] text-white/60 mt-1 mb-0">
            731M+ B2B contacts with triple-verified emails. Export from ListKit → Enrich with AI → Generate cold sequences.
          </p>
        </div>
        <a
          href="https://listkit.io"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] rounded-lg text-[#00d4ff] text-[12px] font-semibold no-underline whitespace-nowrap"
        >
          Open ListKit
        </a>
      </div>

      {/* Quick Start */}
      <div className="bg-[var(--bg-card)] border border-[#222222] rounded-2xl p-6">
        <h3 className="text-[15px] font-bold text-[var(--text-primary)] mt-0 mb-4">
          Quick Start — Works Right Now
        </h3>
        <div className="flex gap-3 items-stretch">
          {[
            { step: '1', title: 'Build List in ListKit', desc: 'Use AI Company Search or Data Stream to find leads. Triple-verified emails included.', color: LISTKIT_CYAN },
            { step: '2', title: 'Export CSV', desc: 'Download your lead list as CSV. ListKit includes Company Name, URL, Industry, and more.', color: '#6EE05A' },
            { step: '3', title: 'Drop in Enricher', desc: 'Upload CSV to the Enrich tab. AI qualifies leads, adds location hooks, bad reviews, news, and more.', color: '#ff6b35' },
            { step: '4', title: 'Generate Sequences', desc: 'Switch to Sequence tab. Generate personalized 3-email cold sequences with merge tags.', color: '#a78bfa' },
          ].map((s) => (
            <div
              key={s.step}
              className="flex-1 p-4 bg-[rgba(255,255,255,0.02)] border border-[#222222] rounded-xl"
              style={{ borderTop: `3px solid ${s.color}` }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold mb-2.5"
                style={{ background: `${s.color}20`, color: s.color }}
              >
                {s.step}
              </div>
              <h4 className="text-[13px] font-semibold text-[var(--text-primary)] mt-0 mb-1">
                {s.title}
              </h4>
              <p className="text-[11px] text-white/50 m-0 leading-[1.5]">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
        <button
          onClick={() => onSwitchTab('enrich')}
          className="mt-4 px-6 py-2.5 bg-[linear-gradient(135deg,#6EE05A,#4CAF3D)] border-none rounded-[10px] text-[#0B0F19] text-[13px] font-bold cursor-pointer transition-all duration-150"
        >
          Start Enriching →
        </button>
      </div>

      {/* Integration Workflows */}
      <div>
        <h3 className="text-[15px] font-bold text-[var(--text-primary)] mt-0 mb-3.5">
          Integration Workflows
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {INTEGRATION_WORKFLOWS.map((wf, i) => (
            <div
              key={i}
              className="bg-[var(--bg-card)] border border-[#222222] rounded-[14px] p-5"
              style={{
                borderLeft: `3px solid ${wf.color}`,
                opacity: wf.ready ? 1 : 0.7,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-[14px] font-semibold text-[var(--text-primary)] m-0 flex-1">
                  {wf.title}
                </h4>
                <span
                  className={[
                    'px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide',
                    wf.ready
                      ? 'bg-[rgba(126,217,87,0.1)] text-[#6EE05A] border border-[rgba(126,217,87,0.2)]'
                      : 'bg-[var(--bg-card)] text-white/35 border border-[#222222]',
                  ].join(' ')}
                >
                  {wf.ready ? 'Ready' : 'Coming'}
                </span>
              </div>
              <p className="text-[12px] text-white/50 mt-0 mb-3 leading-[1.5]">
                {wf.desc}
              </p>
              <div className="flex flex-col gap-1">
                {wf.steps.map((step, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div
                      className="w-[5px] h-[5px] rounded-full shrink-0 opacity-60"
                      style={{ background: wf.color }}
                    />
                    <span className="text-[11px] text-white/40">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column Mapping */}
      <div className="bg-[var(--bg-card)] border border-[#222222] rounded-2xl p-6">
        <h3 className="text-[15px] font-bold text-[var(--text-primary)] mt-0 mb-1">
          ListKit Column Mapping
        </h3>
        <p className="text-[12px] text-white/45 mt-0 mb-4">
          These ListKit CSV columns are auto-detected by the Enricher
        </p>
        <div className="flex flex-wrap gap-1.5">
          {LISTKIT_COLUMNS.map((col) => (
            <span
              key={col}
              className="px-3 py-1 rounded-md text-[11px] font-medium bg-[var(--bg-card)] border border-[#222222] text-white/60 font-mono"
            >
              {col}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'B2B Contacts', value: '731M+', color: LISTKIT_CYAN },
          { label: 'Email Deliverability', value: '~98%', color: '#6EE05A' },
          { label: 'Intent Topics', value: '21,000+', color: '#a78bfa' },
          { label: 'Enrichment Cost', value: '1 Spark/lead', color: '#ff6b35' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--bg-card)] border border-[#222222] rounded-xl p-4 text-center"
          >
            <div className="text-[22px] font-extrabold mb-1" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-[11px] text-white/40 font-medium">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
