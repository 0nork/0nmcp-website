'use client'

import { useState, useRef } from 'react'

/* ─────────────────────────────────────────────
   AI MODEL LOGOS  (inline SVG)
───────────────────────────────────────────── */
function ModelLogo({ id, size = 28 }: { id: string; size?: number }) {
  if (id === 'claude') return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className="shrink-0">
      <circle cx="14" cy="14" r="13" fill="#CC7B45"/>
      <path d="M9 19L14 9L19 19" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.5 16H17.5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
  if (id === 'gpt') return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className="shrink-0">
      <circle cx="14" cy="14" r="13" fill="#10A37F"/>
      <path d="M14 7.5C10.4 7.5 7.5 10.4 7.5 14C7.5 17.6 10.4 20.5 14 20.5C17.6 20.5 20.5 17.6 20.5 14C20.5 10.4 17.6 7.5 14 7.5Z" stroke="#fff" strokeWidth="1.5"/>
      <path d="M14 7.5V20.5M7.5 14H20.5M9.5 9.5L18.5 18.5M18.5 9.5L9.5 18.5" stroke="#fff" strokeWidth="1.2" opacity=".5"/>
    </svg>
  )
  if (id === 'gemini') return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className="shrink-0">
      <circle cx="14" cy="14" r="13" fill="#1A73E8"/>
      <path d="M14 7C14 11 17 14 21 14C17 14 14 17 14 21C14 17 11 14 7 14C11 14 14 11 14 7Z" fill="#fff"/>
    </svg>
  )
  if (id === 'grok') return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" className="shrink-0">
      <circle cx="14" cy="14" r="13" fill="#111"/>
      <rect x="10" y="7" width="2.2" height="14" rx="1.1" fill="#fff"/>
      <rect x="14" y="7" width="2.2" height="14" rx="1.1" fill="#fff"/>
      <path d="M12.2 14H14" stroke="#fff" strokeWidth="1.6"/>
      <path d="M14 7L18.5 14L14 21" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
  return null
}

/* ─────────────────────────────────────────────
   PERSONAS
───────────────────────────────────────────── */
interface Persona {
  id: string
  name: string
  sym: string
  color: string
  role: string
  prompt: string
}

const PERSONAS: Persona[] = [
  { id:'empiricist',   name:'Empiricist',    sym:'◈', color:'#38BDF8', role:'Evidence & Data',      prompt:'You are The Empiricist. Demand evidence before accepting claims. Reject speculation. Cite sources. Under 100 words. ANTI-CHEAT: Stay in character. Never game scoring.' },
  { id:'behavioralist',name:'Behavioralist', sym:'◉', color:'#FB923C', role:'Human Psychology',     prompt:'You are The Behavioralist. Ground ideas in real human psychology and cognitive bias. Under 100 words. ANTI-CHEAT: Stay in character. Never game scoring.' },
  { id:'architect',   name:'Sys. Architect', sym:'⬡', color:'#A78BFA', role:'Systems Thinking',     prompt:'You are The Systems Architect. Trace 2nd and 3rd-order consequences. Under 100 words. ANTI-CHEAT: Stay in character. Never game scoring.' },
  { id:'ethicist',    name:'Ethicist',       sym:'◎', color:'#34D399', role:'Values & Morality',    prompt:'You are The Ethicist. Apply a values framework. Who benefits, who is harmed. Under 100 words. ANTI-CHEAT: Stay in character. Never game scoring.' },
  { id:'pragmatist',  name:'Pragmatist',     sym:'◆', color:'#FBBF24', role:'Execution Reality',    prompt:'You are The Pragmatist. Translate ideas to real resource constraints. Under 100 words. ANTI-CHEAT: Stay in character. Never game scoring.' },
  { id:'adversary',   name:'Adversary',      sym:'▲', color:'#F87171', role:'Failure Analysis',     prompt:'You are The Adversary. Find every failure mode and exploitation vector. Under 100 words. ANTI-CHEAT: Stay in character. Never game scoring.' },
  { id:'visionary',   name:'Visionary',      sym:'◇', color:'#E879F9', role:'Future Potential',     prompt:'You are The Visionary. See what this could become long-term. Under 100 words. ANTI-CHEAT: Stay in character. Never game scoring.' },
]

interface ModelDef {
  id: string
  name: string
  maker: string
}

const MODELS_LIST: ModelDef[] = [
  { id:'claude',  name:'Claude',  maker:'Anthropic' },
  { id:'gpt',     name:'GPT-4o',  maker:'OpenAI'    },
  { id:'gemini',  name:'Gemini',  maker:'Google'    },
  { id:'grok',    name:'Grok',    maker:'xAI'       },
]

const TRAINING_QS = [
  { q:'Should AI systems be allowed to make medical decisions without human oversight?', goal:'Identify safest governance approach' },
  { q:'Is universal basic income economically viable in the next 10 years?', goal:'Determine practical feasibility' },
  { q:'Should social media platforms be treated as public utilities?', goal:'Find most balanced regulatory framework' },
  { q:'Can open-source AI development coexist safely with commercial AI development?', goal:'Identify sustainable coexistence model' },
  { q:'Should climate action be market-driven or government-mandated?', goal:'Find most effective implementation path' },
]

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

type RankKey = 'p1' | 'p2' | 'p3'
type Ranks = Record<RankKey, string | null>

function assignModels(activeModels: ModelDef[]) {
  const cnt = Math.max(1, activeModels.length)
  const shuffled = [...PERSONAS].sort(() => Math.random() - 0.5)
  const out: Record<string, string> = {}
  shuffled.forEach((p, i) => {
    out[p.id] = activeModels[i % cnt]?.id || 'claude'
  })
  return out
}

async function callClaude(system: string, user: string) {
  const r = await fetch('/api/council', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ system, user }),
  })
  const d = await r.json()
  return d.text || '[no response]'
}

/* ─────────────────────────────────────────────
   ONORK LOGO SVG
───────────────────────────────────────────── */
function OnorkLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size * 3.5} height={size} viewBox="0 0 224 64" fill="none">
      <rect rx="6" width="72" height="58" y="3" fill="#5DC721"/>
      <text x="36" y="46" textAnchor="middle" fontFamily="Barlow,sans-serif" fontWeight="900" fontSize="42" fill="#000">On</text>
      <text x="148" y="46" textAnchor="middle" fontFamily="Barlow,sans-serif" fontWeight="900" fontSize="42" fill="#fff">ork</text>
    </svg>
  )
}

/* ─────────────────────────────────────────────
   PERSONA CARD
───────────────────────────────────────────── */
function PersonaCard({ p, ans, active, model, rank, showRank, onRankClick, expanded, onExpand }: {
  p: Persona; ans?: string; active: boolean; model?: string | null; rank: RankKey | null
  showRank: boolean; onRankClick?: (rk: RankKey) => void; expanded: boolean; onExpand: () => void
}) {
  const rankColors: Record<string, string> = { p1:'#FBBF24', p2:'#A78BFA', p3:'#888' }
  const rankLabels: Record<string, string> = { p1:'1ST +2p', p2:'2ND +1p', p3:'3RD' }
  const r = rank
  return (
    <div
      onClick={() => ans && onExpand()}
      className="rounded-lg transition-all duration-200"
      style={{
        background: active ? `${p.color}0C` : '#0C0C0C',
        border: `1px solid ${active ? p.color+'88' : r ? rankColors[r]+'55' : '#1E1E1E'}`,
        padding: '12px 14px',
        cursor: ans ? 'pointer' : 'default',
        boxShadow: active ? `0 0 16px ${p.color}20` : 'none',
      }}
    >
      <div className="flex justify-between items-center mb-1.5">
        <div className="flex gap-1.5 items-center">
          <span style={{ color: p.color, fontSize: 13 }}>{p.sym}</span>
          <span className="font-extrabold tracking-widest" style={{ color: p.color, fontSize: 9 }}>{p.name.toUpperCase()}</span>
        </div>
        <div className="flex gap-1.5 items-center">
          {model && <span className="font-mono" style={{ color: '#555555', fontSize: 8 }}>{model}</span>}
          {r && (
            <span
              className="font-extrabold rounded"
              style={{
                background: `${rankColors[r]}18`,
                border: `1px solid ${rankColors[r]}55`,
                padding: '2px 6px',
                fontSize: 8,
                color: rankColors[r],
              }}
            >
              {rankLabels[r]}
            </span>
          )}
          {active && !ans && (
            <span className="inline-block rounded-full animate-pulse" style={{ width: 5, height: 5, background: p.color }} />
          )}
        </div>
      </div>
      <div className="tracking-widest mb-1.5 uppercase" style={{ color: '#555555', fontSize: 8 }}>{p.role}</div>
      {active && !ans && (
        <div className="font-mono animate-pulse" style={{ color: p.color, fontSize: 10 }}>thinking...</div>
      )}
      {!ans && !active && (
        <div className="font-mono" style={{ color: '#555555', fontSize: 10 }}>awaiting...</div>
      )}
      {ans && (
        <>
          <div
            className="font-mono leading-relaxed"
            style={{
              color: '#BBBBC8',
              fontSize: 10,
              maxHeight: expanded ? 'none' : 60,
              overflow: 'hidden',
            }}
          >
            {ans}
          </div>
          {!expanded && ans.length > 160 && (
            <div style={{ color: p.color, fontSize: 8, marginTop: 3 }}>&#9660; expand</div>
          )}
        </>
      )}
      {showRank && ans && (
        <div className="flex gap-1.5 mt-2.5" onClick={e => e.stopPropagation()}>
          {(['p1','p2','p3'] as RankKey[]).map((rk, i) => (
            <button
              key={rk}
              onClick={() => onRankClick?.(rk)}
              className="rounded font-bold tracking-wide transition-all duration-150 cursor-pointer font-sans"
              style={{
                padding: '3px 8px',
                fontSize: 8,
                background: rank === rk ? `${rankColors[rk]}20` : '#111827',
                border: `1px solid ${rank === rk ? rankColors[rk] : '#1E1E1E'}`,
                color: rank === rk ? rankColors[rk] : '#555555',
              }}
            >
              {['1ST','2ND','3RD'][i]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
type TabType = 'arena' | 'analytics' | 'settings'
type PhaseType = 'input' | 'answering' | 'collaborating' | 'judging' | 'scored'

interface Session {
  q: string
  goal: string
  ranks: Ranks
  asgn: Record<string, string>
  synth: string
}

export default function CouncilArenaPage() {
  const [tab, setTab] = useState<TabType>('arena')
  const [phase, setPhase] = useState<PhaseType>('input')
  const [q, setQ] = useState('')
  const [goal, setGoal] = useState('')
  const [asgn, setAsgn] = useState<Record<string, string>>({})
  const [ans, setAns] = useState<Record<string, string>>({})
  const [active, setActive] = useState<string | null>(null)
  const [synth, setSynth] = useState('')
  const [synthLoad, setSynthLoad] = useState(false)
  const [ranks, setRanks] = useState<Ranks>({p1:null,p2:null,p3:null})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [autoLoad, setAutoLoad] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [lastQ, setLastQ] = useState('')
  const [lastGoal, setLastGoal] = useState('')

  const [activeModels, setActiveModels] = useState<ModelDef[]>([MODELS_LIST[0]])
  const [trainingOptIn, setTrainingOptIn] = useState<boolean | null>(null)
  const [showTrainingModal, setShowTrainingModal] = useState(false)
  const [trainingIdx, setTrainingIdx] = useState(0)
  const [trainingRunning, setTrainingRunning] = useState(false)
  const [trainingAns, setTrainingAns] = useState<Record<string, string>>({})
  const [trainingSynth, setTrainingSynth] = useState('')
  const [trainingActive, setTrainingActive] = useState<string | null>(null)

  const pScores: Record<string, number> = {}
  const mScores: Record<string, number> = {}
  PERSONAS.forEach(p => pScores[p.id] = 0)
  sessions.forEach(s => {
    if (s.ranks.p1) pScores[s.ranks.p1] = (pScores[s.ranks.p1]||0)+2
    if (s.ranks.p2) pScores[s.ranks.p2] = (pScores[s.ranks.p2]||0)+1
    ;(['p1','p2','p3'] as RankKey[]).forEach((r,ri) => {
      const pid = s.ranks[r]; if(!pid||!s.asgn[pid]) return
      const mid = s.asgn[pid]
      mScores[mid] = (mScores[mid]||0) + [3,2,1][ri]
    })
  })

  const getRank = (pid: string): RankKey | null => { for(const [k,v] of Object.entries(ranks)){if(v===pid)return k as RankKey} return null }
  const setRankFn = (pid: string, rk: RankKey) => setRanks(prev=>{
    const n={...prev}
    ;(Object.keys(n) as RankKey[]).forEach(k=>{if(n[k]===pid)n[k]=null})
    n[rk] = prev[rk]===pid ? null : pid
    return n
  })

  const run = async (overrideQ?: string, overrideGoal?: string) => {
    const qq = overrideQ || q; const gg = overrideGoal || goal
    if(!qq.trim()||!gg.trim()) return
    const a = assignModels(activeModels)
    setAsgn(a); setAns({}); setSynth('')
    setRanks({p1:null,p2:null,p3:null}); setExpanded(null)
    setLastQ(qq); setLastGoal(gg)
    setPhase('answering')
    const newAns: Record<string, string> = {}
    for(const p of PERSONAS){
      setActive(p.id); await sleep(200)
      try {
        const r = await callClaude(`${p.prompt}\n\nDesired goal: "${gg}"`, qq)
        newAns[p.id]=r; setAns(prev=>({...prev,[p.id]:r}))
      } catch { newAns[p.id]='[unavailable]'; setAns(prev=>({...prev,[p.id]:'[unavailable]'})) }
    }
    setActive(null)
    setPhase('collaborating')
    setSynthLoad(true)
    const block = PERSONAS.map(p=>`${p.name}: ${newAns[p.id]}`).join('\n\n')
    try {
      const s = await callClaude(
        `You are the Synthesis Engine for a 7-persona reasoning council. Produce the most accurate, actionable answer under 180 words. Goal: "${gg}"`,
        `QUESTION: ${qq}\n\nPERSPECTIVES:\n${block}\n\nSynthesize optimal response.`
      )
      setSynth(s)
    } catch { setSynth('[unavailable]') }
    setSynthLoad(false)
    setPhase('judging')
  }

  const autoJudge = async () => {
    setAutoLoad(true)
    const block = PERSONAS.map(p=>`${p.id}: ${ans[p.id]}`).join('\n\n')
    try {
      const r = await callClaude(
        'Judge which persona answers best aligned with synthesis. Return ONLY JSON: {"p1":"id","p2":"id","p3":"id"}. Valid IDs: empiricist,behavioralist,architect,ethicist,pragmatist,adversary,visionary',
        `SYNTHESIS:\n${synth}\n\nANSWERS:\n${block}`
      )
      const p = JSON.parse(r.replace(/```json|```/g,'').trim())
      if(p.p1) setRanks(p)
    } catch { /* ignore parse errors */ }
    setAutoLoad(false)
  }

  const lockScores = () => {
    if(!ranks.p1) return
    setSessions(prev=>[...prev,{q:lastQ,goal:lastGoal,ranks:{...ranks},asgn:{...asgn},synth}])
    setPhase('scored')
  }

  const runTraining = async () => {
    const tq = TRAINING_QS[trainingIdx]
    setTrainingAns({}); setTrainingSynth(''); setTrainingRunning(true); setTrainingActive(null)
    const newAns: Record<string, string> = {}
    for(const p of PERSONAS){
      setTrainingActive(p.id); await sleep(150)
      try {
        const r = await callClaude(`${p.prompt}\n\nGoal: "${tq.goal}"`, tq.q)
        newAns[p.id]=r; setTrainingAns(prev=>({...prev,[p.id]:r}))
      } catch { newAns[p.id]='[unavailable]'; setTrainingAns(prev=>({...prev,[p.id]:'[unavailable]'})) }
    }
    setTrainingActive(null)
    const block = PERSONAS.map(p=>`${p.name}: ${newAns[p.id]}`).join('\n\n')
    try {
      const s = await callClaude(
        `Synthesis Engine. Best answer under 150 words. Goal: "${tq.goal}"`,
        `QUESTION: ${tq.q}\n\nPERSPECTIVES:\n${block}`
      )
      setTrainingSynth(s)
    } catch { /* ignore */ }
    setTrainingRunning(false)
  }

  const exportData = () => {
    const d = JSON.stringify({ sessions, pScores, mScores, activeModels: activeModels.map(m=>m.id) }, null, 2)
    const b = new Blob([d], {type:'application/json'})
    const u = URL.createObjectURL(b)
    const a = document.createElement('a'); a.href=u; a.download='council-arena-data.json'; a.click()
  }
  const fileRef = useRef<HTMLInputElement>(null)
  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return
    const r = new FileReader()
    r.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target?.result as string)
        if(d.sessions) setSessions(d.sessions)
      } catch { /* ignore */ }
    }
    r.readAsText(file)
  }

  const newRound = () => {
    setPhase('input'); setQ(''); setGoal('')
    setAns({}); setActive(null); setSynth('')
    setRanks({p1:null,p2:null,p3:null}); setExpanded(null)
  }

  const sortedPersonas = [...PERSONAS].map(p=>({...p,pts:pScores[p.id]||0})).sort((a,b)=>b.pts-a.pts)
  const totalSessions = sessions.length

  return (
    <div className="min-h-full overflow-x-hidden font-sans" style={{ background: '#000000', color: '#FFFFFF' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes slideIn{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
        @keyframes modalIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
      `}</style>

      {/* HEADER */}
      <div
        className="flex justify-between items-stretch sticky top-0 z-[99] px-6"
        style={{ background: '#0C0C0C', borderBottom: '1px solid #1E1E1E', height: 52 }}
      >
        <div className="flex items-center gap-7">
          <div className="flex items-center h-full pr-6" style={{ borderRight: '1px solid #1E1E1E' }}>
            <OnorkLogo size={26}/>
          </div>
          {([['arena','⬡ COUNCIL'],['analytics','◈ ANALYTICS'],['settings','◆ SETTINGS']] as [TabType, string][]).map(([t,l])=>(
            <button
              key={t}
              onClick={()=>setTab(t)}
              className="h-full px-1 bg-transparent border-none cursor-pointer font-bold tracking-widest transition-all duration-150"
              style={{
                borderBottom: `2px solid ${tab===t ? '#5DC721' : 'transparent'}`,
                color: tab===t ? '#5DC721' : '#555555',
                fontSize: 11,
                fontFamily: "'Barlow',sans-serif",
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {totalSessions > 0 && (
            <span className="tracking-wide" style={{ fontSize: 10, color: '#555555' }}>
              {totalSessions} SESSION{totalSessions!==1?'S':''}
            </span>
          )}
          <div className="flex gap-1">
            {activeModels.map(m=>(
              <div key={m.id} title={m.name} className="flex items-center">
                <ModelLogo id={m.id} size={22}/>
              </div>
            ))}
          </div>
          {phase!=='input' && tab==='arena' && (
            <div
              className="rounded font-extrabold tracking-widest"
              style={{ background: '#111', border: '1px solid #2A2A2A', padding: '3px 10px', fontSize: 9, color: '#5DC721' }}
            >
              {phase.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="mx-auto px-5 py-[22px]" style={{ maxWidth: 1160 }}>

        {/* ARENA TAB */}
        {tab==='arena' && (
          <>
            {phase==='input' && (
              <div style={{ animation: 'fadeUp .35s ease' }}>
                {totalSessions > 0 && (
                  <div className="grid gap-3.5 mb-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="rounded-[10px] p-4" style={{ background: '#0C0C0C', border: '1px solid #1E1E1E' }}>
                      <div className="tracking-[.16em] mb-3 uppercase" style={{ fontSize: 9, color: '#555555' }}>PERSONA STANDINGS</div>
                      {sortedPersonas.map((p,i)=>(
                        <div key={p.id} className="flex justify-between items-center mb-1.5">
                          <div className="flex gap-2 items-center">
                            <span className="font-mono w-4" style={{ color: '#555555', fontSize: 8 }}>#{i+1}</span>
                            <span style={{ color: p.color }}>{p.sym}</span>
                            <span style={{ fontSize: 11, color: p.pts>0 ? '#FFFFFF' : '#555555' }}>{p.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {p.pts>0 && (
                              <div
                                className="rounded-sm opacity-50"
                                style={{ height: 2, width: Math.min(p.pts*13, 70), background: p.color }}
                              />
                            )}
                            <span className="font-mono" style={{ fontSize: 11, color: p.pts>0 ? p.color : '#555555' }}>{p.pts}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-[10px] p-4" style={{ background: '#0C0C0C', border: '1px solid #1E1E1E' }}>
                      <div className="tracking-[.16em] mb-3 uppercase" style={{ fontSize: 9, color: '#555555' }}>LAST SESSION SYNTHESIS</div>
                      <div className="font-mono leading-relaxed overflow-hidden" style={{ color: '#AAAABC', fontSize: 10, maxHeight: 130 }}>
                        {sessions[sessions.length-1]?.synth || <span style={{ color: '#555555' }}>No sessions yet.</span>}
                      </div>
                    </div>
                  </div>
                )}
                <div className="rounded-xl p-6" style={{ background: '#0C0C0C', border: '1px solid #1E1E1E' }}>
                  <div className="tracking-[.18em] mb-5 uppercase" style={{ fontSize: 9, color: '#555555' }}>
                    NEW SESSION &mdash; COUNCIL REASONS INDEPENDENTLY, THEN SYNTHESIZES
                  </div>
                  <div className="mb-3.5">
                    <label className="block tracking-[.12em] mb-1.5 uppercase" style={{ fontSize: 9, color: '#555555' }}>QUESTION FOR THE COUNCIL</label>
                    <textarea
                      value={q}
                      onChange={e=>setQ(e.target.value)}
                      placeholder="What question should the council reason about?..."
                      className="w-full rounded leading-relaxed outline-none resize-none font-sans"
                      style={{
                        background: '#111827',
                        border: '1px solid #1E1E1E',
                        color: '#FFFFFF',
                        fontSize: 13,
                        padding: '12px 14px',
                        minHeight: 72,
                      }}
                    />
                  </div>
                  <div className="mb-5">
                    <label className="block tracking-[.12em] mb-1.5 uppercase" style={{ fontSize: 9, color: '#555555' }}>DESIRED OUTCOME / GOAL</label>
                    <textarea
                      value={goal}
                      onChange={e=>setGoal(e.target.value)}
                      placeholder="What outcome are you trying to achieve?..."
                      className="w-full rounded leading-relaxed outline-none resize-none font-sans"
                      style={{
                        background: '#111827',
                        border: '1px solid #1E1E1E',
                        color: '#FFFFFF',
                        fontSize: 13,
                        padding: '12px 14px',
                        minHeight: 52,
                      }}
                    />
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <button
                      onClick={()=>run()}
                      disabled={!q.trim()||!goal.trim()}
                      className="rounded font-extrabold tracking-[.12em] transition-all duration-150 cursor-pointer"
                      style={{
                        background: q.trim()&&goal.trim() ? '#5DC721' : '#1a1a1a',
                        border: `1px solid ${q.trim()&&goal.trim() ? '#5DC721' : '#1E1E1E'}`,
                        color: q.trim()&&goal.trim() ? '#000' : '#555555',
                        padding: '12px 28px',
                        fontFamily: "'Barlow',sans-serif",
                        fontSize: 12,
                        cursor: q.trim()&&goal.trim() ? 'pointer' : 'not-allowed',
                      }}
                    >
                      CONVENE THE COUNCIL &rarr;
                    </button>
                    <div className="tracking-wide" style={{ fontSize: 10, color: '#555555' }}>
                      {activeModels.length} model{activeModels.length!==1?'s':''} active
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(phase==='answering'||phase==='collaborating') && (
              <div style={{ animation: 'fadeUp .3s ease' }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 mr-5">
                    <div className="tracking-[.14em] mb-1 uppercase" style={{ fontSize: 9, color: '#555555' }}>DELIBERATING INDEPENDENTLY</div>
                    <div className="leading-relaxed" style={{ fontSize: 14, color: '#FFFFFF' }}>{lastQ}</div>
                  </div>
                  <div className="text-right" style={{ minWidth: 160 }}>
                    <div className="tracking-[.1em] mb-1 uppercase" style={{ fontSize: 9, color: '#555555' }}>GOAL</div>
                    <div className="leading-snug" style={{ fontSize: 11, color: '#5DC721' }}>{lastGoal}</div>
                  </div>
                </div>
                <div className="mb-3 tracking-[.08em]" style={{ fontSize: 9, color: '#555555' }}>
                  {Object.keys(ans).length}/7 ANSWERED{' '}
                  <span className="ml-2.5" style={{ color: '#2A6A2A' }}>
                    {'█'.repeat(Object.keys(ans).length)}{'░'.repeat(7-Object.keys(ans).length)}
                  </span>
                </div>
                <div className="grid gap-2.5 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))' }}>
                  {PERSONAS.map(p=>(
                    <PersonaCard key={p.id} p={p} ans={ans[p.id]} active={active===p.id}
                      model={activeModels.length>1?asgn[p.id]:null} rank={null} showRank={false}
                      expanded={expanded===p.id} onExpand={()=>setExpanded(expanded===p.id?null:p.id)}
                    />
                  ))}
                </div>
                {phase==='collaborating' && (
                  <div className="rounded-[10px] p-5 text-center" style={{ background: '#0A1A04', border: '1px solid #3E8A16' }}>
                    <div className="font-bold tracking-[.2em] mb-3" style={{ color: '#5DC721', fontSize: 11 }}>⬡ SYNTHESIZING COUNCIL</div>
                    <div className="flex justify-center gap-1.5">
                      {[0,1,2,3,4].map(i=>(
                        <div
                          key={i}
                          className="rounded-full animate-pulse"
                          style={{ width: 6, height: 6, background: '#3E8A16', animationDelay: `${i*.17}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {phase==='judging' && (
              <div style={{ animation: 'fadeUp .35s ease' }}>
                <div className="tracking-[.14em] mb-4 uppercase" style={{ fontSize: 9, color: '#555555' }}>
                  SESSION COMPLETE &mdash; RANK THE MOST ACCURATE PERSONAS
                </div>
                <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 1.1fr' }}>
                  <div>
                    <div className="tracking-[.1em] mb-2 uppercase" style={{ fontSize: 9, color: '#555555' }}>INDEPENDENT PERSPECTIVES &mdash; RANK TOP 3</div>
                    <div className="flex flex-col gap-2">
                      {PERSONAS.map(p=>(
                        <PersonaCard key={p.id} p={p} ans={ans[p.id]} active={false}
                          model={activeModels.length>1?asgn[p.id]:null}
                          rank={getRank(p.id)} showRank={true}
                          onRankClick={r=>setRankFn(p.id,r)}
                          expanded={expanded===p.id} onExpand={()=>setExpanded(expanded===p.id?null:p.id)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3.5">
                    <div>
                      <div className="tracking-[.1em] mb-2 uppercase" style={{ fontSize: 9, color: '#555555' }}>COUNCIL SYNTHESIS</div>
                      <div
                        className="rounded-[10px] font-mono leading-[1.75]"
                        style={{
                          background: '#0A1A04',
                          border: '1px solid #3E8A16',
                          padding: '18px 20px',
                          color: '#BDDCAA',
                          fontSize: 11,
                        }}
                      >
                        {synth}
                      </div>
                    </div>
                    <div className="rounded-[10px] p-4" style={{ background: '#0C0C0C', border: '1px solid #1E1E1E' }}>
                      <div className="tracking-[.12em] mb-3 uppercase" style={{ fontSize: 9, color: '#555555' }}>SCORING</div>
                      {(['p1','p2','p3'] as RankKey[]).map((r,ri)=>{
                        const pid=ranks[r]; if(!pid) return (
                          <div key={r} className="flex gap-2 items-center mb-1.5 opacity-30">
                            <span className="font-mono w-6" style={{ fontSize: 9, color: '#555555' }}>{['1ST','2ND','3RD'][ri]}</span>
                            <span style={{ color: '#555555', fontSize: 10 }}>unassigned</span>
                          </div>
                        )
                        const p=PERSONAS.find(x=>x.id===pid)!
                        return (
                          <div
                            key={r}
                            className="flex justify-between items-center mb-1.5 rounded"
                            style={{
                              padding: '7px 9px',
                              background: '#111827',
                              border: `1px solid ${p.color}25`,
                            }}
                          >
                            <div className="flex gap-1.5 items-center">
                              <span className="font-mono w-6" style={{ fontSize: 8, color: '#555555' }}>{['1ST','2ND','3RD'][ri]}</span>
                              <span style={{ color: p.color, fontSize: 11 }}>{p.sym}</span>
                              <span style={{ fontSize: 11 }}>{p.name}</span>
                            </div>
                            <div className="flex gap-1.5">
                              {ri<2 && <span className="font-mono" style={{ color: '#FBBF24', fontSize: 11 }}>+{2-ri}p</span>}
                            </div>
                          </div>
                        )
                      })}
                      <div className="flex gap-2 mt-3.5">
                        <button
                          onClick={autoJudge}
                          disabled={autoLoad}
                          className="flex-1 rounded font-bold tracking-[.1em] cursor-pointer"
                          style={{
                            padding: 10,
                            background: '#111827',
                            border: '1px solid #2A2A2A',
                            color: autoLoad ? '#555555' : '#888888',
                            fontFamily: "'Barlow',sans-serif",
                            fontSize: 10,
                            cursor: autoLoad ? 'wait' : 'pointer',
                          }}
                        >
                          {autoLoad ? 'JUDGING...' : 'AUTO-JUDGE ⬡'}
                        </button>
                        <button
                          onClick={lockScores}
                          disabled={!ranks.p1}
                          className="flex-1 rounded font-extrabold tracking-[.1em] transition-all duration-150"
                          style={{
                            padding: 10,
                            background: ranks.p1 ? '#5DC721' : '#111',
                            border: `1px solid ${ranks.p1 ? '#5DC721' : '#1E1E1E'}`,
                            color: ranks.p1 ? '#000' : '#555555',
                            cursor: ranks.p1 ? 'pointer' : 'not-allowed',
                            fontFamily: "'Barlow',sans-serif",
                            fontSize: 10,
                          }}
                        >
                          LOCK SCORES &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {phase==='scored' && (
              <div style={{ animation: 'fadeUp .4s ease' }}>
                <div className="text-center mb-7">
                  <div className="font-black tracking-[.1em] mb-1" style={{ fontSize: 28, color: '#5DC721' }}>
                    SESSION {totalSessions} COMPLETE
                  </div>
                  <div style={{ color: '#555555', fontSize: 11 }}>Points logged &middot; Leaderboard updated</div>
                </div>
                <div className="grid gap-3.5 mb-5" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="rounded-[10px] p-4" style={{ background: '#0C0C0C', border: '1px solid #1E1E1E' }}>
                    <div className="tracking-[.16em] mb-3.5 uppercase" style={{ fontSize: 9, color: '#555555' }}>PERSONA LEADERBOARD</div>
                    {sortedPersonas.map((p,i)=>(
                      <div
                        key={p.id}
                        className="flex justify-between items-center mb-1.5 rounded"
                        style={{
                          padding: '7px 9px',
                          background: p.pts>0 ? `${p.color}07` : '#111827',
                          border: `1px solid ${p.pts>0 ? p.color+'25' : '#1E1E1E'}`,
                        }}
                      >
                        <div className="flex gap-2 items-center">
                          <span className="font-mono w-4" style={{ color: '#555555', fontSize: 8 }}>#{i+1}</span>
                          <span style={{ color: p.color, fontSize: 12 }}>{p.sym}</span>
                          <span style={{ fontSize: 11, color: p.pts>0 ? '#FFFFFF' : '#555555' }}>{p.name}</span>
                        </div>
                        <span className="font-mono" style={{ fontSize: 12, color: p.pts>0 ? p.color : '#555555' }}>{p.pts}</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-[10px] p-4" style={{ background: '#0C0C0C', border: '1px solid #1E1E1E' }}>
                    <div className="tracking-[.16em] mb-3.5 uppercase" style={{ fontSize: 9, color: '#555555' }}>LAST SYNTHESIS</div>
                    <div
                      className="font-mono leading-[1.7] overflow-auto"
                      style={{ color: '#AAAABC', fontSize: 11, maxHeight: 180 }}
                    >
                      {synth}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    onClick={newRound}
                    className="rounded font-extrabold tracking-[.12em] cursor-pointer border-none"
                    style={{
                      background: '#5DC721',
                      color: '#000',
                      padding: '13px 34px',
                      fontFamily: "'Barlow',sans-serif",
                      fontSize: 12,
                    }}
                  >
                    NEW ROUND &rarr;
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ANALYTICS TAB */}
        {tab==='analytics' && (
          <div style={{ animation: 'slideIn .3s ease' }}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <div className="tracking-[.18em] mb-1 uppercase" style={{ fontSize: 9, color: '#555555' }}>COUNCIL INTELLIGENCE</div>
                <div className="font-black tracking-[.06em]" style={{ fontSize: 22 }}>
                  Analytics <span style={{ color: '#5DC721' }}>Overview</span>
                </div>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={exportData}
                  className="rounded font-bold tracking-[.1em] cursor-pointer"
                  style={{
                    padding: '9px 18px',
                    background: '#111827',
                    border: '1px solid #2A2A2A',
                    color: '#888888',
                    fontFamily: "'Barlow',sans-serif",
                    fontSize: 10,
                  }}
                >
                  ↓ EXPORT
                </button>
                <button
                  onClick={()=>fileRef.current?.click()}
                  className="rounded font-bold tracking-[.1em] cursor-pointer"
                  style={{
                    padding: '9px 18px',
                    background: '#111827',
                    border: '1px solid #2A2A2A',
                    color: '#888888',
                    fontFamily: "'Barlow',sans-serif",
                    fontSize: 10,
                  }}
                >
                  ↑ IMPORT
                </button>
                <input ref={fileRef} type="file" accept=".json" onChange={importData} className="hidden"/>
              </div>
            </div>
            {totalSessions===0 ? (
              <div className="rounded-xl p-12 text-center" style={{ background: '#0C0C0C', border: '1px solid #1E1E1E' }}>
                <div className="mb-3 opacity-30" style={{ fontSize: 36 }}>◈</div>
                <div style={{ color: '#555555', fontSize: 13 }}>No sessions recorded yet.</div>
                <div className="mt-1.5" style={{ color: '#555555', fontSize: 11 }}>Run sessions in the Council tab to generate analytics.</div>
              </div>
            ) : (
              <>
                <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
                  {[
                    {label:'TOTAL SESSIONS',val:String(totalSessions),color:'#5DC721'},
                    {label:'PERSONAS SCORED',val:`${Object.values(pScores).filter(v=>v>0).length}/7`,color:'#A78BFA'},
                    {label:'TOP PERSONA',val:sortedPersonas[0]?.pts>0?sortedPersonas[0].name:'—',color:'#FB923C'},
                    {label:'MODELS ACTIVE',val:String(activeModels.length),color:'#38BDF8'},
                  ].map(s=>(
                    <div key={s.label} className="rounded-[10px] p-4" style={{ background: '#0C0C0C', border: '1px solid #1E1E1E' }}>
                      <div className="tracking-[.14em] mb-2 uppercase" style={{ fontSize: 8, color: '#555555' }}>{s.label}</div>
                      <div className="font-black" style={{ fontSize: 22, color: s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-3.5" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className="rounded-[10px] p-4" style={{ background: '#0C0C0C', border: '1px solid #1E1E1E' }}>
                    <div className="tracking-[.14em] mb-3.5 uppercase" style={{ fontSize: 9, color: '#555555' }}>PERSONA WIN RATE</div>
                    {sortedPersonas.map(p=>{
                      const pct = totalSessions>0 ? (p.pts/(totalSessions*2)*100) : 0
                      return (
                        <div key={p.id} className="mb-2.5">
                          <div className="flex justify-between mb-1">
                            <div className="flex gap-1.5 items-center">
                              <span style={{ color: p.color, fontSize: 11 }}>{p.sym}</span>
                              <span style={{ fontSize: 10 }}>{p.name}</span>
                            </div>
                            <span className="font-mono" style={{ fontSize: 10, color: p.pts>0 ? p.color : '#555555' }}>{p.pts}pt</span>
                          </div>
                          <div className="rounded-sm overflow-hidden" style={{ height: 4, background: '#111827' }}>
                            <div
                              className="h-full rounded-sm transition-all duration-500 opacity-80"
                              style={{ width: `${Math.min(pct,100)}%`, background: p.color }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="rounded-[10px] p-4" style={{ background: '#0C0C0C', border: '1px solid #1E1E1E' }}>
                    <div className="tracking-[.14em] mb-3.5 uppercase" style={{ fontSize: 9, color: '#555555' }}>RECENT SESSIONS</div>
                    <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 260 }}>
                      {[...sessions].reverse().slice(0,6).map((s,i)=>(
                        <div key={i} className="rounded-[7px] p-2.5" style={{ background: '#111827', border: '1px solid #1E1E1E' }}>
                          <div className="leading-snug mb-1" style={{ fontSize: 10, color: '#FFFFFF' }}>
                            {s.q.slice(0,70)}{s.q.length>70?'...':''}
                          </div>
                          <div className="flex gap-2">
                            {(['p1','p2','p3'] as RankKey[]).map((r)=>{
                              const p=PERSONAS.find(x=>x.id===s.ranks[r])
                              return p ? (
                                <span
                                  key={r}
                                  className="rounded"
                                  style={{ fontSize: 8, color: p.color, background: `${p.color}12`, padding: '2px 6px' }}
                                >
                                  {p.sym}{p.name.slice(0,6)}
                                </span>
                              ) : null
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab==='settings' && (
          <div style={{ animation: 'slideIn .3s ease' }}>
            <div className="mb-5">
              <div className="tracking-[.18em] mb-1 uppercase" style={{ fontSize: 9, color: '#555555' }}>ECOSYSTEM CONFIGURATION</div>
              <div className="font-black tracking-[.06em]" style={{ fontSize: 22 }}>Settings</div>
            </div>
            <div className="rounded-xl p-5 mb-4" style={{ background: '#0C0C0C', border: '1px solid #1E1E1E' }}>
              <div className="tracking-[.16em] mb-4 uppercase" style={{ fontSize: 9, color: '#555555' }}>CONNECTED AI MODELS</div>
              <div className="grid gap-3 mb-3.5" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
                {MODELS_LIST.map(m=>{
                  const isActive = activeModels.some(a=>a.id===m.id)
                  return (
                    <div
                      key={m.id}
                      onClick={()=>{
                        if(isActive && activeModels.length===1) return
                        setActiveModels(prev=>isActive?prev.filter(a=>a.id!==m.id):[...prev,m])
                      }}
                      className="flex gap-3.5 items-center rounded-[10px] cursor-pointer transition-all duration-150"
                      style={{
                        padding: '14px 16px',
                        background: isActive ? '#0D1A05' : '#111827',
                        border: `1px solid ${isActive ? '#5DC721' : '#1E1E1E'}`,
                        boxShadow: isActive ? `0 0 14px #5DC72118` : 'none',
                      }}
                    >
                      <ModelLogo id={m.id} size={34}/>
                      <div className="flex-1">
                        <div className="font-bold" style={{ fontSize: 13, color: isActive ? '#FFFFFF' : '#555555' }}>{m.name}</div>
                        <div className="tracking-[.08em]" style={{ fontSize: 9, color: '#555555' }}>{m.maker}</div>
                      </div>
                      <div
                        className="rounded-full transition-all duration-150"
                        style={{
                          width: 10,
                          height: 10,
                          background: isActive ? '#5DC721' : '#1E1E1E',
                          border: `2px solid ${isActive ? '#78E03A' : '#555555'}`,
                        }}
                      />
                    </div>
                  )
                })}
              </div>
              <div className="rounded tracking-[.06em] p-2.5" style={{ fontSize: 10, color: '#555555', background: '#111827' }}>
                {activeModels.length===1 ? 'Single model plays all 7 persona roles.' :
                  `${activeModels.length} models active — personas distributed across models.`}
              </div>
            </div>

            <div className="rounded-xl p-5 mb-4" style={{ background: '#0C0C0C', border: '1px solid #1E1E1E' }}>
              <div className="tracking-[.16em] mb-1.5 uppercase" style={{ fontSize: 9, color: '#555555' }}>TRAINING CONTRIBUTION</div>
              <div className="leading-relaxed mb-4" style={{ fontSize: 13, color: '#FFFFFF' }}>
                Help improve the Council Arena reasoning system by contributing anonymous session data.
              </div>
              {trainingOptIn===null ? (
                <div className="flex gap-2.5">
                  <button
                    onClick={()=>{setTrainingOptIn(true);setShowTrainingModal(true)}}
                    className="rounded font-extrabold tracking-[.1em] border-none cursor-pointer"
                    style={{
                      padding: '11px 24px',
                      background: '#5DC721',
                      color: '#000',
                      fontFamily: "'Barlow',sans-serif",
                      fontSize: 11,
                    }}
                  >
                    YES, I&apos;M IN &rarr;
                  </button>
                  <button
                    onClick={()=>setTrainingOptIn(false)}
                    className="rounded font-bold tracking-[.1em] cursor-pointer"
                    style={{
                      padding: '11px 24px',
                      background: '#111827',
                      border: '1px solid #2A2A2A',
                      color: '#555555',
                      fontFamily: "'Barlow',sans-serif",
                      fontSize: 11,
                    }}
                  >
                    NOT NOW
                  </button>
                </div>
              ) : trainingOptIn ? (
                <div className="flex gap-3 items-center">
                  <div className="rounded-full" style={{ width: 8, height: 8, background: '#5DC721' }} />
                  <span className="font-bold" style={{ fontSize: 11, color: '#5DC721' }}>TRAINING ACTIVE</span>
                  <button
                    onClick={()=>setShowTrainingModal(true)}
                    className="rounded font-bold tracking-[.08em] cursor-pointer"
                    style={{
                      padding: '8px 16px',
                      background: '#111827',
                      border: '1px solid #2A2A2A',
                      color: '#888888',
                      fontFamily: "'Barlow',sans-serif",
                      fontSize: 10,
                    }}
                  >
                    LAUNCH TRAINING SESSION
                  </button>
                </div>
              ) : (
                <div className="flex gap-2.5 items-center">
                  <span style={{ fontSize: 11, color: '#555555' }}>Not participating.</span>
                  <button
                    onClick={()=>setTrainingOptIn(null)}
                    className="text-[#555555] bg-none border-none cursor-pointer underline"
                    style={{ fontSize: 10 }}
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-xl p-5" style={{ background: '#0C0C0C', border: '1px solid #1E1E1E' }}>
              <div className="tracking-[.16em] mb-3.5 uppercase" style={{ fontSize: 9, color: '#555555' }}>DATA PORTABILITY</div>
              <div className="flex gap-3">
                <button
                  onClick={exportData}
                  className="rounded font-bold tracking-[.1em] cursor-pointer"
                  style={{
                    padding: '12px 24px',
                    background: '#111827',
                    border: '1px solid #2A2A2A',
                    color: '#888888',
                    fontFamily: "'Barlow',sans-serif",
                    fontSize: 11,
                  }}
                >
                  ↓ EXPORT ALL DATA
                </button>
                <button
                  onClick={()=>fileRef.current?.click()}
                  className="rounded font-bold tracking-[.1em] cursor-pointer"
                  style={{
                    padding: '12px 24px',
                    background: '#111827',
                    border: '1px solid #2A2A2A',
                    color: '#888888',
                    fontFamily: "'Barlow',sans-serif",
                    fontSize: 11,
                  }}
                >
                  ↑ IMPORT DATA
                </button>
                <input ref={fileRef} type="file" accept=".json" onChange={importData} className="hidden"/>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TRAINING MODAL */}
      {showTrainingModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] p-5" style={{ background: 'rgba(0,0,0,.88)' }}>
          <div
            className="rounded-[14px] overflow-y-auto w-full"
            style={{
              background: '#0C0C0C',
              border: '1px solid #5DC72144',
              padding: '30px 32px',
              maxWidth: 720,
              maxHeight: '85vh',
              animation: 'modalIn .3s ease',
            }}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <div className="tracking-[.2em] mb-1 uppercase" style={{ fontSize: 9, color: '#3E8A16' }}>
                  TRAINING SESSION {trainingIdx+1}/{TRAINING_QS.length}
                </div>
                <div className="font-black" style={{ fontSize: 18, color: '#5DC721' }}>Council Training Mode</div>
              </div>
              <button
                onClick={()=>setShowTrainingModal(false)}
                className="rounded font-bold cursor-pointer"
                style={{
                  background: 'none',
                  border: '1px solid #2A2A2A',
                  color: '#555555',
                  padding: '6px 12px',
                  fontFamily: "'Barlow',sans-serif",
                  fontSize: 11,
                }}
              >
                CLOSE ✕
              </button>
            </div>

            <div className="rounded-[10px] mb-4" style={{ background: '#0A1A04', border: '1px solid #3E8A16', padding: '16px 18px' }}>
              <div className="tracking-[.1em] mb-1.5 uppercase" style={{ fontSize: 9, color: '#3E8A16' }}>TRAINING QUESTION</div>
              <div className="font-bold mb-1.5" style={{ fontSize: 14, color: '#FFFFFF' }}>{TRAINING_QS[trainingIdx].q}</div>
              <div style={{ fontSize: 10, color: '#555555' }}>Goal: {TRAINING_QS[trainingIdx].goal}</div>
            </div>

            {!trainingRunning && Object.keys(trainingAns).length===0 && (
              <button
                onClick={runTraining}
                className="block rounded font-extrabold tracking-[.1em] border-none cursor-pointer mb-4"
                style={{
                  padding: '12px 28px',
                  background: '#5DC721',
                  color: '#000',
                  fontFamily: "'Barlow',sans-serif",
                  fontSize: 12,
                }}
              >
                START TRAINING RUN &rarr;
              </button>
            )}

            {(trainingRunning || Object.keys(trainingAns).length>0) && (
              <>
                <div className="tracking-[.1em] mb-2.5 uppercase" style={{ fontSize: 9, color: '#555555' }}>
                  {Object.keys(trainingAns).length}/7 RESPONSES
                </div>
                <div className="grid gap-2 mb-3.5" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  {PERSONAS.map(p=>(
                    <div
                      key={p.id}
                      className="rounded-[7px] p-2.5"
                      style={{
                        background: '#111827',
                        border: `1px solid ${trainingActive===p.id ? p.color+'80' : '#1E1E1E'}`,
                      }}
                    >
                      <div className="flex gap-1.5 items-center mb-1">
                        <span style={{ color: p.color, fontSize: 11 }}>{p.sym}</span>
                        <span className="font-bold tracking-[.1em]" style={{ fontSize: 9, color: p.color }}>{p.name.toUpperCase()}</span>
                        {trainingActive===p.id && (
                          <span className="inline-block rounded-full animate-pulse" style={{ width: 5, height: 5, background: p.color }} />
                        )}
                      </div>
                      <div className="font-mono leading-[1.55] overflow-hidden" style={{ color: '#AAAABB', fontSize: 9, maxHeight: 50 }}>
                        {trainingAns[p.id] || (
                          <span style={{ color: '#555555' }}>{trainingActive===p.id ? 'thinking...' : 'waiting...'}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {trainingSynth && (
                  <div className="rounded-[9px] mb-4" style={{ background: '#0A1A04', border: '1px solid #3E8A16', padding: '14px 16px' }}>
                    <div className="tracking-[.1em] mb-1.5 uppercase" style={{ fontSize: 9, color: '#3E8A16' }}>TRAINING SYNTHESIS</div>
                    <div className="font-mono leading-[1.7]" style={{ color: '#BDDCAA', fontSize: 11 }}>{trainingSynth}</div>
                  </div>
                )}
                {trainingSynth && !trainingRunning && (
                  <div className="flex gap-2.5">
                    {trainingIdx < TRAINING_QS.length-1 && (
                      <button
                        onClick={()=>{setTrainingIdx(i=>i+1);setTrainingAns({});setTrainingSynth('')}}
                        className="rounded font-extrabold tracking-[.08em] border-none cursor-pointer"
                        style={{
                          padding: '11px 22px',
                          background: '#5DC721',
                          color: '#000',
                          fontFamily: "'Barlow',sans-serif",
                          fontSize: 11,
                        }}
                      >
                        NEXT QUESTION &rarr;
                      </button>
                    )}
                    {trainingIdx===TRAINING_QS.length-1 && (
                      <button
                        onClick={()=>setShowTrainingModal(false)}
                        className="rounded font-extrabold tracking-[.08em] border-none cursor-pointer"
                        style={{
                          padding: '11px 22px',
                          background: '#5DC721',
                          color: '#000',
                          fontFamily: "'Barlow',sans-serif",
                          fontSize: 11,
                        }}
                      >
                        COMPLETE SESSION ✓
                      </button>
                    )}
                    <button
                      onClick={()=>{setTrainingAns({});setTrainingSynth('');runTraining()}}
                      className="rounded font-bold cursor-pointer"
                      style={{
                        padding: '11px 22px',
                        background: '#111827',
                        border: '1px solid #2A2A2A',
                        color: '#555555',
                        fontFamily: "'Barlow',sans-serif",
                        fontSize: 11,
                      }}
                    >
                      RERUN
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
