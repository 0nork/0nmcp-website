"use client"

import { useState } from "react"
import { Search, Download, Loader2 } from "lucide-react"

interface ScanResult {
  url: string
  domain: string
  pageTitle: string
  combinedScore: number
  combinedGrade: string
  sxoScore: number
  sxoGrade: string
  sxoBreakdown: { seo: number; ux: number; cro: number; geo: number }
  aeoScore: number
  aeoGrade: string
  aeoFactors: Record<string, number>
  markdown: string
}

const AEO_LABELS: Record<string, string> = {
  bluf: "BLUF", definition: "Definition", procedure: "Procedure",
  comparison: "Comparison", faq: "FAQ", authorEEAT: "E-E-A-T",
  freshness: "Freshness", schema: "Schema", informationGain: "Info Gain",
  specificity: "Specificity",
}

function gradeColor(score: number) {
  if (score >= 90) return "text-emerald-400"
  if (score >= 80) return "text-blue-400"
  if (score >= 70) return "text-cyan-400"
  if (score >= 60) return "text-amber-400"
  return "text-rose-400"
}

function Bar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
      <div className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400" style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function SxoAeoLanding() {
  const [url, setUrl] = useState("")
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runScan = async () => {
    if (!url.trim()) return
    setScanning(true)
    setError(null)
    try {
      const res = await fetch("/api/sxo-aeo/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.error || "Scan failed")
      }
      setResult(await res.json())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setScanning(false)
    }
  }

  const downloadMd = () => {
    if (!result?.markdown) return
    const blob = new Blob([result.markdown], { type: "text/markdown" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `sxo-aeo-${result.domain.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <main className="min-h-screen bg-[#0d1117] text-white">
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-mono text-violet-400 mb-3">FREE PUBLIC SCANNER</p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-violet-400 via-cyan-300 to-emerald-300 bg-clip-text text-transparent">
            SXO + AEO Scanner
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Two scores on one page. SXO grades whether your page surfaces in search.
            AEO grades whether ChatGPT, Claude, Perplexity, and Google AI Overview will cite it.
          </p>
          <p className="mt-3 text-sm text-white/50">
            Same engine running inside the 0nMCP citation stack. The markup pack downloads as a real markdown file.
          </p>
        </div>
      </section>

      <section className="px-4 pb-10">
        <div className="max-w-2xl mx-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur p-5">
          <div className="flex gap-2">
            <input
              placeholder="https://yourdomain.com/page"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runScan()}
              className="flex-1 h-12 rounded-lg bg-black/40 border border-white/10 px-4 text-white placeholder-white/30 focus:outline-none focus:border-violet-500/60"
            />
            <button
              onClick={runScan}
              disabled={scanning || !url.trim()}
              className="h-12 px-6 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-white flex items-center gap-2 disabled:opacity-50"
            >
              {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {scanning ? "Scanning…" : "Scan"}
            </button>
          </div>
          {error && <p className="text-sm text-rose-400 mt-3">{error}</p>}
        </div>
      </section>

      {result && (
        <section className="max-w-5xl mx-auto px-4 pb-24 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-violet-500/40 bg-violet-500/10 p-5">
              <p className="text-xs uppercase text-white/60">Combined</p>
              <p className={`text-5xl font-bold ${gradeColor(result.combinedScore)}`}>{result.combinedScore}</p>
              <Bar value={result.combinedScore} />
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase text-white/60">SXO</p>
              <p className={`text-5xl font-bold ${gradeColor(result.sxoScore)}`}>{result.sxoScore}</p>
              <Bar value={result.sxoScore} />
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase text-white/60">AEO</p>
              <p className={`text-5xl font-bold ${gradeColor(result.aeoScore)}`}>{result.aeoScore}</p>
              <Bar value={result.aeoScore} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-3">
              <h2 className="font-semibold">SXO pillars</h2>
              {(["seo", "ux", "cro", "geo"] as const).map((k) => (
                <div key={k} className="flex items-center gap-3">
                  <span className="w-12 text-xs uppercase text-white/50">{k}</span>
                  <div className="flex-1"><Bar value={result.sxoBreakdown[k]} /></div>
                  <span className={`w-10 text-right text-sm font-mono ${gradeColor(result.sxoBreakdown[k])}`}>{result.sxoBreakdown[k]}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-5 space-y-2">
              <h2 className="font-semibold">AEO dimensions</h2>
              {Object.entries(result.aeoFactors).map(([k, v]) => {
                const score100 = Math.round((v as number) * 100)
                return (
                  <div key={k} className="flex items-center gap-3">
                    <span className="w-24 text-xs text-white/60">{AEO_LABELS[k] || k}</span>
                    <div className="flex-1"><Bar value={score100} /></div>
                    <span className={`w-10 text-right text-sm font-mono ${gradeColor(score100)}`}>{score100}</span>
                  </div>
                )
              })}
            </div>
          </div>
          <button
            onClick={downloadMd}
            className="inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-white font-medium"
          >
            <Download className="h-4 w-4" /> Download full markup pack (.md)
          </button>
        </section>
      )}
    </main>
  )
}
