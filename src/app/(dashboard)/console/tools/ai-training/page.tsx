'use client'

import { useState, useRef } from 'react'

/* ─────────────────────────────────────────────
   DESIGN TOKENS  (Onork: black / green / white)
───────────────────────────────────────────── */
const T = {
  bg:    '#000000',
  surf:  '#0C0C0C',
  elev:  '#141414',
  bord:  '#1E1E1E',
  bord2: '#2A2A2A',
  txt:   '#FFFFFF',
  mut:   '#555555',
  dim:   '#888888',
  green: '#5DC721',
  greenD:'#3E8A16',
  greenL:'#78E03A',
}

/* ─────────────────────────────────────────────
   AI MODEL LOGOS  (inline SVG)
───────────────────────────────────────────── */
function ModelLogo({ id, size = 28 }: { id: string; size?: number }) {
  const s = { width: size, height: size, flexShrink: 0 as const }
  if (id === 'claude') return (
    <svg style={s} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" fill="#CC7B45"/>
      <path d="M9 19L14 9L19 19" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M10.5 16H17.5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
  if (id === 'gpt') return (
    <svg style={s} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" fill="#10A37F"/>
      <path d="M14 7.5C10.4 7.5 7.5 10.4 7.5 14C7.5 17.6 10.4 20.5 14 20.5C17.6 20.5 20.5 17.6 20.5 14C20.5 10.4 17.6 7.5 14 7.5Z" stroke="#fff" strokeWidth="1.5"/>
      <path d="M14 7.5V20.5M7.5 14H20.5M9.5 9.5L18.5 18.5M18.5 9.5L9.5 18.5" stroke="#fff" strokeWidth="1.2" opacity=".5"/>
    </svg>
  )
  if (id === 'gemini') return (
    <svg style={s} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" fill="#1A73E8"/>
      <path d="M14 7C14 11 17 14 21 14C17 14 14 17 14 21C14 17 11 14 7 14C11 14 14 11 14 7Z" fill="#fff"/>
    </svg>
  )
  if (id === 'grok') return (
    <svg style={s} viewBox="0 0 28 28" fill="none">
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
      <rect rx="6" width="72" height="58" y="3" fill={T.green}/>
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
    <div onClick={() => ans && onExpand()} style={{
      background: active ? `${p.color}0C` : T.surf,
      border: `1px solid ${active ? p.color+'88' : r ? rankColors[r]+'55' : T.bord}`,
      borderRadius: 8, padding: '12px 14px', cursor: ans ? 'pointer' : 'default',
      transition: 'all .22s', boxShadow: active ? `0 0 16px ${p.color}20` : 'none',
    }}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
        <div style={{display:'flex',gap:7,alignItems:'center'}}>
          <span style={{color:p.color,fontSize:13}}>{p.sym}</span>
          <span style={{color:p.color,fontSize:9,fontWeight:800,letterSpacing:'.12em'}}>{p.name.toUpperCase()}</span>
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          {model && <span style={{color:T.mut,fontFamily:"'JetBrains Mono',monospace",fontSize:8}}>{model}</span>}
          {r && <span style={{background:`${rankColors[r]}18`,border:`1px solid ${rankColors[r]}55`,borderRadius:4,padding:'2px 6px',fontSize:8,color:rankColors[r],fontWeight:800}}>{rankLabels[r]}</span>}
          {active && !ans && <span style={{width:5,height:5,borderRadius:'50%',background:p.color,display:'inline-block',animation:'pulse .8s infinite'}}/>}
        </div>
      </div>
      <div style={{color:T.mut,fontSize:8,letterSpacing:'.12em',marginBottom:7}}>{p.role.toUpperCase()}</div>
      {active && !ans && <div style={{color:p.color,fontFamily:"'JetBrains Mono',monospace",fontSize:10,animation:'pulse 1s infinite'}}>thinking...</div>}
      {!ans && !active && <div style={{color:T.mut,fontFamily:"'JetBrains Mono',monospace",fontSize:10}}>awaiting...</div>}
      {ans && (
        <>
          <div style={{color:'#BBBBC8',fontSize:10,fontFamily:"'JetBrains Mono',monospace",lineHeight:1.6,maxHeight:expanded?'none':60,overflow:'hidden'}}>
            {ans}
          </div>
          {!expanded && ans.length > 160 && <div style={{color:p.color,fontSize:8,marginTop:3}}>&#9660; expand</div>}
        </>
      )}
      {showRank && ans && (
        <div style={{display:'flex',gap:5,marginTop:9}} onClick={e=>e.stopPropagation()}>
          {(['p1','p2','p3'] as RankKey[]).map((rk, i) => (
            <button key={rk} onClick={()=>onRankClick?.(rk)} style={{
              padding:'3px 8px',borderRadius:4,fontSize:8,cursor:'pointer',fontFamily:"'Barlow',sans-serif",
              fontWeight:700,letterSpacing:'.06em',
              background:rank===rk?`${rankColors[rk]}20`:T.elev,
              border:`1px solid ${rank===rk?rankColors[rk]:T.bord}`,
              color:rank===rk?rankColors[rk]:T.mut,transition:'all .13s'
            }}>{['1ST','2ND','3RD'][i]}</button>
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
    <div style={{minHeight:'100%',background:T.bg,color:T.txt,fontFamily:"'Barlow',sans-serif",overflowX:'hidden'}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes slideIn{from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
        @keyframes modalIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}
      `}</style>

      {/* HEADER */}
      <div style={{background:T.surf,borderBottom:`1px solid ${T.bord}`,padding:'0 24px',display:'flex',justifyContent:'space-between',alignItems:'stretch',position:'sticky',top:0,zIndex:99,height:52}}>
        <div style={{display:'flex',alignItems:'center',gap:28}}>
          <div style={{display:'flex',alignItems:'center',height:'100%',paddingRight:24,borderRight:`1px solid ${T.bord}`}}>
            <OnorkLogo size={26}/>
          </div>
          {([['arena','⬡ COUNCIL'],['analytics','◈ ANALYTICS'],['settings','◆ SETTINGS']] as [TabType, string][]).map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              height:'100%',padding:'0 4px',
              background:'transparent',border:'none',
              borderBottom:`2px solid ${tab===t?T.green:'transparent'}`,
              color:tab===t?T.green:T.mut,
              cursor:'pointer',fontFamily:"'Barlow',sans-serif",
              fontWeight:700,fontSize:11,letterSpacing:'.12em',transition:'all .15s'
            }}>{l}</button>
          ))}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          {totalSessions > 0 && <span style={{fontSize:10,color:T.mut,letterSpacing:'.08em'}}>{totalSessions} SESSION{totalSessions!==1?'S':''}</span>}
          <div style={{display:'flex',gap:4}}>
            {activeModels.map(m=>(
              <div key={m.id} title={m.name} style={{display:'flex',alignItems:'center'}}>
                <ModelLogo id={m.id} size={22}/>
              </div>
            ))}
          </div>
          {phase!=='input' && tab==='arena' && (
            <div style={{background:'#111',border:`1px solid ${T.bord2}`,borderRadius:4,padding:'3px 10px',fontSize:9,color:T.green,letterSpacing:'.14em',fontWeight:800}}>
              {phase.toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{maxWidth:1160,margin:'0 auto',padding:'22px 20px'}}>

        {/* ARENA TAB */}
        {tab==='arena' && (
          <>
            {phase==='input' && (
              <div style={{animation:'fadeUp .35s ease'}}>
                {totalSessions > 0 && (
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:24}}>
                    <div style={{background:T.surf,border:`1px solid ${T.bord}`,borderRadius:10,padding:'16px 20px'}}>
                      <div style={{fontSize:9,color:T.mut,letterSpacing:'.16em',marginBottom:12}}>PERSONA STANDINGS</div>
                      {sortedPersonas.map((p,i)=>(
                        <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                          <div style={{display:'flex',gap:8,alignItems:'center'}}>
                            <span style={{color:T.mut,fontSize:8,fontFamily:"'JetBrains Mono',monospace",width:16}}>#{i+1}</span>
                            <span style={{color:p.color}}>{p.sym}</span>
                            <span style={{fontSize:11,color:p.pts>0?T.txt:T.mut}}>{p.name}</span>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:7}}>
                            {p.pts>0&&<div style={{height:2,width:p.pts*13,background:p.color,borderRadius:2,opacity:.5,maxWidth:70}}/>}
                            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:p.pts>0?p.color:T.mut}}>{p.pts}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{background:T.surf,border:`1px solid ${T.bord}`,borderRadius:10,padding:'16px 20px'}}>
                      <div style={{fontSize:9,color:T.mut,letterSpacing:'.16em',marginBottom:12}}>LAST SESSION SYNTHESIS</div>
                      <div style={{color:'#AAAABC',fontSize:10,fontFamily:"'JetBrains Mono',monospace",lineHeight:1.65,maxHeight:130,overflow:'hidden'}}>
                        {sessions[sessions.length-1]?.synth || <span style={{color:T.mut}}>No sessions yet.</span>}
                      </div>
                    </div>
                  </div>
                )}
                <div style={{background:T.surf,border:`1px solid ${T.bord}`,borderRadius:12,padding:'24px 28px'}}>
                  <div style={{fontSize:9,color:T.mut,letterSpacing:'.18em',marginBottom:20}}>NEW SESSION &mdash; COUNCIL REASONS INDEPENDENTLY, THEN SYNTHESIZES</div>
                  <div style={{marginBottom:14}}>
                    <label style={{display:'block',fontSize:9,color:T.mut,letterSpacing:'.12em',marginBottom:7}}>QUESTION FOR THE COUNCIL</label>
                    <textarea value={q} onChange={e=>setQ(e.target.value)}
                      placeholder="What question should the council reason about?..."
                      style={{width:'100%',background:T.elev,border:`1px solid ${T.bord}`,borderRadius:6,color:T.txt,fontFamily:"'Barlow',sans-serif",fontSize:13,padding:'12px 14px',minHeight:72,lineHeight:1.5,outline:'none',resize:'none'}}
                    />
                  </div>
                  <div style={{marginBottom:22}}>
                    <label style={{display:'block',fontSize:9,color:T.mut,letterSpacing:'.12em',marginBottom:7}}>DESIRED OUTCOME / GOAL</label>
                    <textarea value={goal} onChange={e=>setGoal(e.target.value)}
                      placeholder="What outcome are you trying to achieve?..."
                      style={{width:'100%',background:T.elev,border:`1px solid ${T.bord}`,borderRadius:6,color:T.txt,fontFamily:"'Barlow',sans-serif",fontSize:13,padding:'12px 14px',minHeight:52,lineHeight:1.5,outline:'none',resize:'none'}}
                    />
                  </div>
                  <div style={{display:'flex',gap:10,alignItems:'center'}}>
                    <button onClick={()=>run()} disabled={!q.trim()||!goal.trim()} style={{
                      background:q.trim()&&goal.trim()?T.green:'#1a1a1a',
                      border:`1px solid ${q.trim()&&goal.trim()?T.green:T.bord}`,
                      color:q.trim()&&goal.trim()?'#000':T.mut,
                      padding:'12px 28px',borderRadius:6,cursor:q.trim()&&goal.trim()?'pointer':'not-allowed',
                      fontFamily:"'Barlow',sans-serif",fontWeight:800,fontSize:12,letterSpacing:'.12em',transition:'all .18s'
                    }}>CONVENE THE COUNCIL &rarr;</button>
                    <div style={{fontSize:10,color:T.mut,letterSpacing:'.06em'}}>
                      {activeModels.length} model{activeModels.length!==1?'s':''} active
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(phase==='answering'||phase==='collaborating') && (
              <div style={{animation:'fadeUp .3s ease'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18}}>
                  <div style={{flex:1,marginRight:20}}>
                    <div style={{fontSize:9,color:T.mut,letterSpacing:'.14em',marginBottom:5}}>DELIBERATING INDEPENDENTLY</div>
                    <div style={{fontSize:14,color:T.txt,lineHeight:1.5}}>{lastQ}</div>
                  </div>
                  <div style={{textAlign:'right',minWidth:160}}>
                    <div style={{fontSize:9,color:T.mut,letterSpacing:'.1em',marginBottom:4}}>GOAL</div>
                    <div style={{fontSize:11,color:T.green,lineHeight:1.4}}>{lastGoal}</div>
                  </div>
                </div>
                <div style={{fontSize:9,color:T.mut,marginBottom:12,letterSpacing:'.08em'}}>
                  {Object.keys(ans).length}/7 ANSWERED <span style={{marginLeft:10,color:'#2A6A2A'}}>{'█'.repeat(Object.keys(ans).length)}{'░'.repeat(7-Object.keys(ans).length)}</span>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:10,marginBottom:16}}>
                  {PERSONAS.map(p=>(
                    <PersonaCard key={p.id} p={p} ans={ans[p.id]} active={active===p.id}
                      model={activeModels.length>1?asgn[p.id]:null} rank={null} showRank={false}
                      expanded={expanded===p.id} onExpand={()=>setExpanded(expanded===p.id?null:p.id)}
                    />
                  ))}
                </div>
                {phase==='collaborating' && (
                  <div style={{background:'#0A1A04',border:`1px solid ${T.greenD}`,borderRadius:10,padding:'22px',textAlign:'center'}}>
                    <div style={{color:T.green,fontSize:11,letterSpacing:'.2em',fontWeight:700,marginBottom:12}}>⬡ SYNTHESIZING COUNCIL</div>
                    <div style={{display:'flex',justifyContent:'center',gap:7}}>
                      {[0,1,2,3,4].map(i=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:T.greenD,animation:`pulse 1.4s ease ${i*.17}s infinite`}}/>)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {phase==='judging' && (
              <div style={{animation:'fadeUp .35s ease'}}>
                <div style={{fontSize:9,color:T.mut,letterSpacing:'.14em',marginBottom:16}}>SESSION COMPLETE &mdash; RANK THE MOST ACCURATE PERSONAS</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1.1fr',gap:18}}>
                  <div>
                    <div style={{fontSize:9,color:T.mut,letterSpacing:'.1em',marginBottom:9}}>INDEPENDENT PERSPECTIVES &mdash; RANK TOP 3</div>
                    <div style={{display:'flex',flexDirection:'column',gap:9}}>
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
                  <div style={{display:'flex',flexDirection:'column',gap:14}}>
                    <div>
                      <div style={{fontSize:9,color:T.mut,letterSpacing:'.1em',marginBottom:9}}>COUNCIL SYNTHESIS</div>
                      <div style={{background:'#0A1A04',border:`1px solid ${T.greenD}`,borderRadius:10,padding:'18px 20px',color:'#BDDCAA',fontSize:11,fontFamily:"'JetBrains Mono',monospace",lineHeight:1.75}}>
                        {synth}
                      </div>
                    </div>
                    <div style={{background:T.surf,border:`1px solid ${T.bord}`,borderRadius:10,padding:'16px 18px'}}>
                      <div style={{fontSize:9,color:T.mut,letterSpacing:'.12em',marginBottom:12}}>SCORING</div>
                      {(['p1','p2','p3'] as RankKey[]).map((r,ri)=>{
                        const pid=ranks[r]; if(!pid) return (
                          <div key={r} style={{display:'flex',gap:8,alignItems:'center',marginBottom:7,opacity:.3}}>
                            <span style={{fontSize:9,color:T.mut,fontFamily:"'JetBrains Mono',monospace",width:26}}>{['1ST','2ND','3RD'][ri]}</span>
                            <span style={{color:T.mut,fontSize:10}}>unassigned</span>
                          </div>
                        )
                        const p=PERSONAS.find(x=>x.id===pid)!
                        return (
                          <div key={r} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7,padding:'7px 9px',background:T.elev,borderRadius:6,border:`1px solid ${p.color}25`}}>
                            <div style={{display:'flex',gap:7,alignItems:'center'}}>
                              <span style={{fontSize:8,color:T.mut,fontFamily:"'JetBrains Mono',monospace",width:26}}>{['1ST','2ND','3RD'][ri]}</span>
                              <span style={{color:p.color,fontSize:11}}>{p.sym}</span>
                              <span style={{fontSize:11}}>{p.name}</span>
                            </div>
                            <div style={{display:'flex',gap:7}}>
                              {ri<2&&<span style={{color:'#FBBF24',fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>+{2-ri}p</span>}
                            </div>
                          </div>
                        )
                      })}
                      <div style={{display:'flex',gap:9,marginTop:14}}>
                        <button onClick={autoJudge} disabled={autoLoad} style={{flex:1,padding:'10px',background:T.elev,border:`1px solid ${T.bord2}`,borderRadius:6,color:autoLoad?T.mut:T.dim,cursor:autoLoad?'wait':'pointer',fontFamily:"'Barlow',sans-serif",fontWeight:700,fontSize:10,letterSpacing:'.1em'}}>
                          {autoLoad?'JUDGING...':'AUTO-JUDGE ⬡'}
                        </button>
                        <button onClick={lockScores} disabled={!ranks.p1} style={{flex:1,padding:'10px',background:ranks.p1?T.green:'#111',border:`1px solid ${ranks.p1?T.green:T.bord}`,color:ranks.p1?'#000':T.mut,cursor:ranks.p1?'pointer':'not-allowed',fontFamily:"'Barlow',sans-serif",fontWeight:800,fontSize:10,letterSpacing:'.1em',transition:'all .18s'}}>
                          LOCK SCORES &rarr;
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {phase==='scored' && (
              <div style={{animation:'fadeUp .4s ease'}}>
                <div style={{textAlign:'center',marginBottom:28}}>
                  <div style={{fontSize:28,fontWeight:900,color:T.green,letterSpacing:'.1em',marginBottom:4}}>SESSION {totalSessions} COMPLETE</div>
                  <div style={{color:T.mut,fontSize:11}}>Points logged &middot; Leaderboard updated</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:22}}>
                  <div style={{background:T.surf,border:`1px solid ${T.bord}`,borderRadius:10,padding:'18px 22px'}}>
                    <div style={{fontSize:9,color:T.mut,letterSpacing:'.16em',marginBottom:14}}>PERSONA LEADERBOARD</div>
                    {sortedPersonas.map((p,i)=>(
                      <div key={p.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:7,padding:'7px 9px',background:p.pts>0?`${p.color}07`:T.elev,border:`1px solid ${p.pts>0?p.color+'25':T.bord}`,borderRadius:6}}>
                        <div style={{display:'flex',gap:8,alignItems:'center'}}>
                          <span style={{color:T.mut,fontSize:8,fontFamily:"'JetBrains Mono',monospace",width:18}}>#{i+1}</span>
                          <span style={{color:p.color,fontSize:12}}>{p.sym}</span>
                          <span style={{fontSize:11,color:p.pts>0?T.txt:T.mut}}>{p.name}</span>
                        </div>
                        <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:p.pts>0?p.color:T.mut}}>{p.pts}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{background:T.surf,border:`1px solid ${T.bord}`,borderRadius:10,padding:'18px 22px'}}>
                    <div style={{fontSize:9,color:T.mut,letterSpacing:'.16em',marginBottom:14}}>LAST SYNTHESIS</div>
                    <div style={{color:'#AAAABC',fontSize:11,fontFamily:"'JetBrains Mono',monospace",lineHeight:1.7,maxHeight:180,overflow:'auto'}}>{synth}</div>
                  </div>
                </div>
                <div style={{textAlign:'center'}}>
                  <button onClick={newRound} style={{background:T.green,border:'none',color:'#000',padding:'13px 34px',borderRadius:6,cursor:'pointer',fontFamily:"'Barlow',sans-serif",fontWeight:800,fontSize:12,letterSpacing:'.12em'}}>
                    NEW ROUND &rarr;
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ANALYTICS TAB */}
        {tab==='analytics' && (
          <div style={{animation:'slideIn .3s ease'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
              <div>
                <div style={{fontSize:9,color:T.mut,letterSpacing:'.18em',marginBottom:4}}>COUNCIL INTELLIGENCE</div>
                <div style={{fontSize:22,fontWeight:900,letterSpacing:'.06em'}}>Analytics <span style={{color:T.green}}>Overview</span></div>
              </div>
              <div style={{display:'flex',gap:10}}>
                <button onClick={exportData} style={{padding:'9px 18px',background:T.elev,border:`1px solid ${T.bord2}`,borderRadius:6,color:T.dim,cursor:'pointer',fontFamily:"'Barlow',sans-serif",fontWeight:700,fontSize:10,letterSpacing:'.1em'}}>↓ EXPORT</button>
                <button onClick={()=>fileRef.current?.click()} style={{padding:'9px 18px',background:T.elev,border:`1px solid ${T.bord2}`,borderRadius:6,color:T.dim,cursor:'pointer',fontFamily:"'Barlow',sans-serif",fontWeight:700,fontSize:10,letterSpacing:'.1em'}}>↑ IMPORT</button>
                <input ref={fileRef} type="file" accept=".json" onChange={importData} style={{display:'none'}}/>
              </div>
            </div>
            {totalSessions===0 ? (
              <div style={{background:T.surf,border:`1px solid ${T.bord}`,borderRadius:12,padding:'50px',textAlign:'center'}}>
                <div style={{fontSize:36,marginBottom:12,opacity:.3}}>◈</div>
                <div style={{color:T.mut,fontSize:13}}>No sessions recorded yet.</div>
                <div style={{color:T.mut,fontSize:11,marginTop:6}}>Run sessions in the Council tab to generate analytics.</div>
              </div>
            ) : (
              <>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:18}}>
                  {[
                    {label:'TOTAL SESSIONS',val:String(totalSessions),color:T.green},
                    {label:'PERSONAS SCORED',val:`${Object.values(pScores).filter(v=>v>0).length}/7`,color:'#A78BFA'},
                    {label:'TOP PERSONA',val:sortedPersonas[0]?.pts>0?sortedPersonas[0].name:'—',color:'#FB923C'},
                    {label:'MODELS ACTIVE',val:String(activeModels.length),color:'#38BDF8'},
                  ].map(s=>(
                    <div key={s.label} style={{background:T.surf,border:`1px solid ${T.bord}`,borderRadius:10,padding:'16px 18px'}}>
                      <div style={{fontSize:8,color:T.mut,letterSpacing:'.14em',marginBottom:8}}>{s.label}</div>
                      <div style={{fontSize:22,fontWeight:900,color:s.color}}>{s.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                  <div style={{background:T.surf,border:`1px solid ${T.bord}`,borderRadius:10,padding:'18px 20px'}}>
                    <div style={{fontSize:9,color:T.mut,letterSpacing:'.14em',marginBottom:14}}>PERSONA WIN RATE</div>
                    {sortedPersonas.map(p=>{
                      const pct = totalSessions>0 ? (p.pts/(totalSessions*2)*100) : 0
                      return (
                        <div key={p.id} style={{marginBottom:10}}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                            <div style={{display:'flex',gap:7,alignItems:'center'}}>
                              <span style={{color:p.color,fontSize:11}}>{p.sym}</span>
                              <span style={{fontSize:10}}>{p.name}</span>
                            </div>
                            <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:p.pts>0?p.color:T.mut}}>{p.pts}pt</span>
                          </div>
                          <div style={{height:4,background:T.elev,borderRadius:3,overflow:'hidden'}}>
                            <div style={{height:'100%',width:`${Math.min(pct,100)}%`,background:p.color,borderRadius:3,transition:'width .5s ease',opacity:.8}}/>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{background:T.surf,border:`1px solid ${T.bord}`,borderRadius:10,padding:'18px 20px'}}>
                    <div style={{fontSize:9,color:T.mut,letterSpacing:'.14em',marginBottom:14}}>RECENT SESSIONS</div>
                    <div style={{maxHeight:260,overflowY:'auto',display:'flex',flexDirection:'column',gap:9}}>
                      {[...sessions].reverse().slice(0,6).map((s,i)=>(
                        <div key={i} style={{background:T.elev,borderRadius:7,padding:'10px 12px',border:`1px solid ${T.bord}`}}>
                          <div style={{fontSize:10,color:T.txt,marginBottom:4,lineHeight:1.4}}>{s.q.slice(0,70)}{s.q.length>70?'...':''}</div>
                          <div style={{display:'flex',gap:8}}>
                            {(['p1','p2','p3'] as RankKey[]).map((r)=>{
                              const p=PERSONAS.find(x=>x.id===s.ranks[r])
                              return p ? <span key={r} style={{fontSize:8,color:p.color,background:`${p.color}12`,borderRadius:3,padding:'2px 6px'}}>{p.sym}{p.name.slice(0,6)}</span> : null
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
          <div style={{animation:'slideIn .3s ease'}}>
            <div style={{marginBottom:22}}>
              <div style={{fontSize:9,color:T.mut,letterSpacing:'.18em',marginBottom:4}}>ECOSYSTEM CONFIGURATION</div>
              <div style={{fontSize:22,fontWeight:900,letterSpacing:'.06em'}}>Settings</div>
            </div>
            <div style={{background:T.surf,border:`1px solid ${T.bord}`,borderRadius:12,padding:'22px 26px',marginBottom:16}}>
              <div style={{fontSize:9,color:T.mut,letterSpacing:'.16em',marginBottom:16}}>CONNECTED AI MODELS</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12,marginBottom:14}}>
                {MODELS_LIST.map(m=>{
                  const isActive = activeModels.some(a=>a.id===m.id)
                  return (
                    <div key={m.id} onClick={()=>{
                      if(isActive && activeModels.length===1) return
                      setActiveModels(prev=>isActive?prev.filter(a=>a.id!==m.id):[...prev,m])
                    }} style={{
                      display:'flex',gap:14,alignItems:'center',padding:'14px 16px',
                      background:isActive?'#0D1A05':T.elev,
                      border:`1px solid ${isActive?T.green:T.bord}`,
                      borderRadius:10,cursor:'pointer',transition:'all .18s',
                      boxShadow:isActive?`0 0 14px ${T.green}18`:'none'
                    }}>
                      <ModelLogo id={m.id} size={34}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:isActive?T.txt:T.mut}}>{m.name}</div>
                        <div style={{fontSize:9,color:T.mut,letterSpacing:'.08em'}}>{m.maker}</div>
                      </div>
                      <div style={{width:10,height:10,borderRadius:'50%',background:isActive?T.green:T.bord,border:`2px solid ${isActive?T.greenL:T.mut}`,transition:'all .18s'}}/>
                    </div>
                  )
                })}
              </div>
              <div style={{fontSize:10,color:T.mut,letterSpacing:'.06em',background:T.elev,borderRadius:6,padding:'9px 12px'}}>
                {activeModels.length===1?'Single model plays all 7 persona roles.':
                `${activeModels.length} models active — personas distributed across models.`}
              </div>
            </div>

            <div style={{background:T.surf,border:`1px solid ${T.bord}`,borderRadius:12,padding:'22px 26px',marginBottom:16}}>
              <div style={{fontSize:9,color:T.mut,letterSpacing:'.16em',marginBottom:6}}>TRAINING CONTRIBUTION</div>
              <div style={{fontSize:13,color:T.txt,lineHeight:1.6,marginBottom:16}}>
                Help improve the Council Arena reasoning system by contributing anonymous session data.
              </div>
              {trainingOptIn===null ? (
                <div style={{display:'flex',gap:10}}>
                  <button onClick={()=>{setTrainingOptIn(true);setShowTrainingModal(true)}} style={{padding:'11px 24px',background:T.green,border:'none',borderRadius:6,color:'#000',cursor:'pointer',fontFamily:"'Barlow',sans-serif",fontWeight:800,fontSize:11,letterSpacing:'.1em'}}>
                    YES, I&apos;M IN &rarr;
                  </button>
                  <button onClick={()=>setTrainingOptIn(false)} style={{padding:'11px 24px',background:T.elev,border:`1px solid ${T.bord2}`,borderRadius:6,color:T.mut,cursor:'pointer',fontFamily:"'Barlow',sans-serif",fontWeight:700,fontSize:11,letterSpacing:'.1em'}}>
                    NOT NOW
                  </button>
                </div>
              ) : trainingOptIn ? (
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:T.green}}/>
                  <span style={{fontSize:11,color:T.green,fontWeight:700}}>TRAINING ACTIVE</span>
                  <button onClick={()=>setShowTrainingModal(true)} style={{padding:'8px 16px',background:T.elev,border:`1px solid ${T.bord2}`,borderRadius:5,color:T.dim,cursor:'pointer',fontFamily:"'Barlow',sans-serif",fontWeight:700,fontSize:10,letterSpacing:'.08em'}}>
                    LAUNCH TRAINING SESSION
                  </button>
                </div>
              ) : (
                <div style={{display:'flex',gap:10,alignItems:'center'}}>
                  <span style={{fontSize:11,color:T.mut}}>Not participating.</span>
                  <button onClick={()=>setTrainingOptIn(null)} style={{fontSize:10,color:T.mut,background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>Change</button>
                </div>
              )}
            </div>

            <div style={{background:T.surf,border:`1px solid ${T.bord}`,borderRadius:12,padding:'22px 26px'}}>
              <div style={{fontSize:9,color:T.mut,letterSpacing:'.16em',marginBottom:14}}>DATA PORTABILITY</div>
              <div style={{display:'flex',gap:12}}>
                <button onClick={exportData} style={{padding:'12px 24px',background:T.elev,border:`1px solid ${T.bord2}`,borderRadius:7,color:T.dim,cursor:'pointer',fontFamily:"'Barlow',sans-serif",fontWeight:700,fontSize:11,letterSpacing:'.1em'}}>↓ EXPORT ALL DATA</button>
                <button onClick={()=>fileRef.current?.click()} style={{padding:'12px 24px',background:T.elev,border:`1px solid ${T.bord2}`,borderRadius:7,color:T.dim,cursor:'pointer',fontFamily:"'Barlow',sans-serif",fontWeight:700,fontSize:11,letterSpacing:'.1em'}}>↑ IMPORT DATA</button>
                <input ref={fileRef} type="file" accept=".json" onChange={importData} style={{display:'none'}}/>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TRAINING MODAL */}
      {showTrainingModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.88)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:200,padding:20}}>
          <div style={{background:T.surf,border:`1px solid ${T.green}44`,borderRadius:14,padding:'30px 32px',maxWidth:720,width:'100%',maxHeight:'85vh',overflowY:'auto',animation:'modalIn .3s ease'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div>
                <div style={{fontSize:9,color:T.greenD,letterSpacing:'.2em',marginBottom:4}}>TRAINING SESSION {trainingIdx+1}/{TRAINING_QS.length}</div>
                <div style={{fontSize:18,fontWeight:900,color:T.green}}>Council Training Mode</div>
              </div>
              <button onClick={()=>setShowTrainingModal(false)} style={{background:'none',border:`1px solid ${T.bord2}`,borderRadius:6,color:T.mut,cursor:'pointer',padding:'6px 12px',fontFamily:"'Barlow',sans-serif",fontWeight:700,fontSize:11}}>CLOSE ✕</button>
            </div>

            <div style={{background:'#0A1A04',border:`1px solid ${T.greenD}`,borderRadius:10,padding:'16px 18px',marginBottom:18}}>
              <div style={{fontSize:9,color:T.greenD,letterSpacing:'.1em',marginBottom:7}}>TRAINING QUESTION</div>
              <div style={{fontSize:14,color:T.txt,fontWeight:700,marginBottom:7}}>{TRAINING_QS[trainingIdx].q}</div>
              <div style={{fontSize:10,color:T.mut}}>Goal: {TRAINING_QS[trainingIdx].goal}</div>
            </div>

            {!trainingRunning && Object.keys(trainingAns).length===0 && (
              <button onClick={runTraining} style={{padding:'12px 28px',background:T.green,border:'none',borderRadius:7,color:'#000',cursor:'pointer',fontFamily:"'Barlow',sans-serif",fontWeight:800,fontSize:12,letterSpacing:'.1em',marginBottom:18,display:'block'}}>
                START TRAINING RUN &rarr;
              </button>
            )}

            {(trainingRunning || Object.keys(trainingAns).length>0) && (
              <>
                <div style={{fontSize:9,color:T.mut,letterSpacing:'.1em',marginBottom:10}}>
                  {Object.keys(trainingAns).length}/7 RESPONSES
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
                  {PERSONAS.map(p=>(
                    <div key={p.id} style={{background:T.elev,border:`1px solid ${trainingActive===p.id?p.color+'80':T.bord}`,borderRadius:7,padding:'10px 12px'}}>
                      <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:5}}>
                        <span style={{color:p.color,fontSize:11}}>{p.sym}</span>
                        <span style={{fontSize:9,fontWeight:700,color:p.color,letterSpacing:'.1em'}}>{p.name.toUpperCase()}</span>
                        {trainingActive===p.id&&<span style={{width:5,height:5,borderRadius:'50%',background:p.color,animation:'pulse .7s infinite'}}/>}
                      </div>
                      <div style={{color:'#AAAABB',fontSize:9,fontFamily:"'JetBrains Mono',monospace",lineHeight:1.55,maxHeight:50,overflow:'hidden'}}>
                        {trainingAns[p.id] || <span style={{color:T.mut}}>{trainingActive===p.id?'thinking...':'waiting...'}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                {trainingSynth && (
                  <div style={{background:'#0A1A04',border:`1px solid ${T.greenD}`,borderRadius:9,padding:'14px 16px',marginBottom:16}}>
                    <div style={{fontSize:9,color:T.greenD,letterSpacing:'.1em',marginBottom:6}}>TRAINING SYNTHESIS</div>
                    <div style={{color:'#BDDCAA',fontSize:11,fontFamily:"'JetBrains Mono',monospace",lineHeight:1.7}}>{trainingSynth}</div>
                  </div>
                )}
                {trainingSynth && !trainingRunning && (
                  <div style={{display:'flex',gap:10}}>
                    {trainingIdx < TRAINING_QS.length-1 && (
                      <button onClick={()=>{setTrainingIdx(i=>i+1);setTrainingAns({});setTrainingSynth('')}} style={{padding:'11px 22px',background:T.green,border:'none',borderRadius:6,color:'#000',cursor:'pointer',fontFamily:"'Barlow',sans-serif",fontWeight:800,fontSize:11,letterSpacing:'.08em'}}>
                        NEXT QUESTION &rarr;
                      </button>
                    )}
                    {trainingIdx===TRAINING_QS.length-1 && (
                      <button onClick={()=>setShowTrainingModal(false)} style={{padding:'11px 22px',background:T.green,border:'none',borderRadius:6,color:'#000',cursor:'pointer',fontFamily:"'Barlow',sans-serif",fontWeight:800,fontSize:11,letterSpacing:'.08em'}}>
                        COMPLETE SESSION ✓
                      </button>
                    )}
                    <button onClick={()=>{setTrainingAns({});setTrainingSynth('');runTraining()}} style={{padding:'11px 22px',background:T.elev,border:`1px solid ${T.bord2}`,borderRadius:6,color:T.mut,cursor:'pointer',fontFamily:"'Barlow',sans-serif",fontWeight:700,fontSize:11}}>
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
