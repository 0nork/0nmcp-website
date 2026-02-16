'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════
// 0NORK MINI — Desktop Buddy / Embeddable Command Widget
// ═══════════════════════════════════════════════════════════════

const PIN_CODE = '412724'

const B = {
  bg: '#08081a', surface: '#0d0f24', card: '#12143a',
  border: '#1e2258', borderHi: '#2d3580',
  p1: '#7c3aed', p2: '#6366f1', p3: '#818cf8',
  b1: '#3b82f6', b2: '#60a5fa',
  grad: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
  gradSoft: 'linear-gradient(135deg, #7c3aed22, #3b82f622)',
  glow: '#7c3aed44',
  green: '#34d399', red: '#f87171', amber: '#fbbf24',
  text: '#f0f0ff', textDim: '#a0a8d0', textMuted: '#505880',
}

const LOGO_SVG = `<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<defs><linearGradient id="ork" x1="0" y1="0" x2="40" y2="40"><stop offset="0" stop-color="#7c3aed"/><stop offset=".5" stop-color="#6366f1"/><stop offset="1" stop-color="#3b82f6"/></linearGradient>
<linearGradient id="orki" x1="10" y1="10" x2="30" y2="30"><stop offset="0" stop-color="#a78bfa"/><stop offset="1" stop-color="#60a5fa"/></linearGradient></defs>
<rect width="40" height="40" rx="12" fill="url(#ork)"/>
<path d="M20 8 L28 14 L28 26 L20 32 L12 26 L12 14 Z" fill="none" stroke="url(#orki)" stroke-width="1.8" opacity=".6"/>
<path d="M20 12 L25 15.5 L25 24.5 L20 28 L15 24.5 L15 15.5 Z" fill="none" stroke="#fff" stroke-width="1.5" opacity=".9"/>
<circle cx="20" cy="20" r="3.5" fill="#fff" opacity=".95"/>
<circle cx="20" cy="20" r="1.5" fill="url(#ork)"/>
<line x1="20" y1="8" x2="20" y2="12" stroke="#a78bfa" stroke-width="1" opacity=".5"/>
<line x1="28" y1="14" x2="25" y2="15.5" stroke="#a78bfa" stroke-width="1" opacity=".5"/>
<line x1="28" y1="26" x2="25" y2="24.5" stroke="#a78bfa" stroke-width="1" opacity=".5"/>
<line x1="20" y1="32" x2="20" y2="28" stroke="#a78bfa" stroke-width="1" opacity=".5"/>
<line x1="12" y1="26" x2="15" y2="24.5" stroke="#a78bfa" stroke-width="1" opacity=".5"/>
<line x1="12" y1="14" x2="15" y2="15.5" stroke="#a78bfa" stroke-width="1" opacity=".5"/>
</svg>`

const L: Record<string, string> = {
  onork: LOGO_SVG,
  stripe: `<svg viewBox="0 0 32 32"><rect rx="6" width="32" height="32" fill="#635bff"/><path d="M14.5 13.3c0-.8.7-1.1 1.8-1.1 1.6 0 3.6.5 5.2 1.4V9.1c-1.7-.7-3.5-1-5.2-1C13 8.1 11 9.7 11 12.5c0 4.4 6 3.7 6 5.6 0 .9-.8 1.2-1.9 1.2-1.6 0-3.8-.7-5.5-1.6v4.6c1.9.8 3.7 1.2 5.5 1.2 3.5 0 5.9-1.7 5.9-4.6C21 14.2 14.5 15 14.5 13.3z" fill="#fff"/></svg>`,
  supabase: `<svg viewBox="0 0 32 32"><defs><linearGradient id="sg2m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3ecf8e"/><stop offset="1" stop-color="#1a9f68"/></linearGradient></defs><rect rx="6" width="32" height="32" fill="#1c1c1c"/><path d="M17.5 26.3c-.4.5-1.3.2-1.3-.5V18h8.3c.9 0 1.4 1.1.8 1.8L17.5 26.3z" fill="url(#sg2m)" opacity=".8"/><path d="M14.5 5.7c.4-.5 1.3-.2 1.3.5V14H7.5c-.9 0-1.4-1.1-.8-1.8L14.5 5.7z" fill="#3ecf8e"/></svg>`,
  openai: `<svg viewBox="0 0 32 32"><rect rx="6" width="32" height="32" fill="#0a0a0a"/><path d="M23.9 14.3a5.1 5.1 0 00-.4-4.2 5.2 5.2 0 00-5.6-2.5 5.1 5.1 0 00-3.8-1.7 5.2 5.2 0 00-5 3.6 5.1 5.1 0 00-3.4 2.5 5.2 5.2 0 00.6 5.9 5.1 5.1 0 00.4 4.2 5.2 5.2 0 005.6 2.5A5.1 5.1 0 0016.1 26a5.2 5.2 0 005-3.6 5.1 5.1 0 003.4-2.5 5.2 5.2 0 00-.6-5.6z" fill="none" stroke="#10a37f" stroke-width="1.5"/></svg>`,
  anthropic: `<svg viewBox="0 0 32 32"><rect rx="6" width="32" height="32" fill="#1a1309"/><path d="M18.2 8H21l-5 16h-2.8L18.2 8zm-7.4 0H8l5 16h2.8L10.8 8z" fill="#d4a574"/></svg>`,
  rocket: `<svg viewBox="0 0 32 32" fill="none"><path d="M16 3C16 3 26 8 26 18C26 22 24 25 22 27L20 24C20 24 19 22 16 22C13 22 12 24 12 24L10 27C8 25 6 22 6 18C6 8 16 3 16 3Z" fill="#7c3aed"/><circle cx="16" cy="14" r="3" fill="#fff"/><path d="M12 24L10 30H14L13 26" fill="#a78bfa"/><path d="M20 24L22 30H18L19 26" fill="#a78bfa"/></svg>`,
  gmail: `<svg viewBox="0 0 32 32"><rect rx="6" width="32" height="32" fill="#fff"/><path d="M6 10l10 7 10-7v14H6V10z" fill="#f2f2f2" stroke="#d93025" stroke-width=".5"/><path d="M6 10l10 7 10-7" fill="none" stroke="#d93025" stroke-width="2"/></svg>`,
  slack: `<svg viewBox="0 0 32 32"><rect rx="6" width="32" height="32" fill="#2d1638"/><path d="M11 18.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm1 0v4a1.5 1.5 0 003 0v-4a1.5 1.5 0 00-3 0z" fill="#e01e5a"/><path d="M13.5 11a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 1h-4a1.5 1.5 0 000 3h4a1.5 1.5 0 000-3z" fill="#36c5f0"/><path d="M21 13.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm-1 0v-4a1.5 1.5 0 00-3 0v4a1.5 1.5 0 003 0z" fill="#2eb67d"/><path d="M18.5 21a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0-1h4a1.5 1.5 0 000-3h-4a1.5 1.5 0 000 3z" fill="#ecb22e"/></svg>`,
  github: `<svg viewBox="0 0 32 32"><rect rx="6" width="32" height="32" fill="#161b22"/><path d="M16 6a10 10 0 00-3.16 19.49c.5.09.68-.22.68-.48v-1.7C10.73 24 10.14 22 10.14 22a2.7 2.7 0 00-1.13-1.49c-.92-.63.07-.62.07-.62a2.14 2.14 0 011.56 1.05 2.17 2.17 0 002.97.85 2.16 2.16 0 01.64-1.36c-2.24-.25-4.6-1.12-4.6-5a3.9 3.9 0 011.04-2.71 3.63 3.63 0 01.1-2.67s.84-.27 2.77 1.03a9.56 9.56 0 015.04 0c1.92-1.3 2.76-1.03 2.76-1.03a3.63 3.63 0 01.1 2.67 3.89 3.89 0 011.03 2.71c0 3.88-2.36 4.74-4.61 5a2.42 2.42 0 01.69 1.88v2.79c0 .27.18.58.69.48A10 10 0 0016 6z" fill="#fff"/></svg>`,
  vercel: `<svg viewBox="0 0 32 32"><rect rx="6" width="32" height="32" fill="#000"/><path d="M16 8L26 24H6L16 8z" fill="#fff"/></svg>`,
  n8n: `<svg viewBox="0 0 32 32"><rect rx="6" width="32" height="32" fill="#1a0a08"/><circle cx="11" cy="16" r="4" fill="none" stroke="#ff6d5a" stroke-width="2"/><circle cx="21" cy="16" r="4" fill="none" stroke="#ff6d5a" stroke-width="2"/><line x1="15" y1="16" x2="17" y2="16" stroke="#ff6d5a" stroke-width="2"/></svg>`,
}

interface SvcField { k: string; lb: string; ph: string; s?: number; h: string; lk: string; ll: string }
interface SvcDef { l: string; logo: string; c: string; d: string; cap: string[]; f: SvcField[] }

const SVC: Record<string, SvcDef> = {
  crm:{l:'CRM',logo:'rocket',c:'#7c3aed',d:'All-in-one CRM for contacts, pipelines, workflows, calendars, invoicing, and automation.',cap:['Contacts','Pipelines','Workflows','Calendar','Invoicing','SMS/Email','Opportunities','Webhooks'],f:[{k:'client_id',lb:'Client ID',ph:'690ffe...',h:'Marketplace app ID',lk:'#',ll:'Marketplace → My Apps'},{k:'client_secret',lb:'Client Secret',ph:'xxxx-xxxx',s:1,h:'OAuth secret',lk:'#',ll:'My Apps → Settings → Secret'}]},
  stripe:{l:'Stripe',logo:'stripe',c:'#635bff',d:'Payments, subscriptions, invoices, disputes, and revenue tracking.',cap:['Payments','Subscriptions','Invoices','Customers','Coupons','Payment Links','Refunds','Webhooks'],f:[{k:'secret_key',lb:'Secret Key',ph:'sk_live_...',s:1,h:'Server-side API key',lk:'https://dashboard.stripe.com/apikeys',ll:'Developers → API Keys'}]},
  anthropic:{l:'Anthropic',logo:'anthropic',c:'#d4a574',d:'Claude AI — advanced reasoning, analysis, coding, 200K context, tool use.',cap:['Claude Opus/Sonnet','200K Context','Code Gen','Vision','Tool Use','JSON Output','Batch API','Analysis'],f:[{k:'api_key',lb:'API Key',ph:'sk-ant-api03-...',s:1,h:'Per-token billing',lk:'https://console.anthropic.com/settings/keys',ll:'Console → Settings → API Keys'}]},
  openai:{l:'OpenAI',logo:'openai',c:'#10a37f',d:'GPT-4o, DALL-E, Whisper, Embeddings — versatile AI for generation and analysis.',cap:['GPT-4o','DALL-E','Whisper','Embeddings','Functions','JSON Mode','Vision','Fine-tuning'],f:[{k:'api_key',lb:'API Key',ph:'sk-proj-...',s:1,h:'Project-scoped key',lk:'https://platform.openai.com/api-keys',ll:'Platform → API Keys'}]},
  supabase:{l:'Supabase',logo:'supabase',c:'#3ecf8e',d:'Open-source PostgreSQL database, auth, real-time, edge functions, and storage.',cap:['Database','Auth','Real-time','Storage','Edge Functions','REST API','RLS','Webhooks'],f:[{k:'url',lb:'Project URL',ph:'https://xxx.supabase.co',h:'Unique project URL',lk:'https://supabase.com/dashboard',ll:'Dashboard → Project → Settings'},{k:'service_role',lb:'Service Role',ph:'eyJhbG...',s:1,h:'Bypasses RLS — server only',lk:'https://supabase.com/dashboard',ll:'Settings → API → service_role'}]},
  vercel:{l:'Vercel',logo:'vercel',c:'#e2e2e2',d:'Frontend deployment — instant deploys, previews, edge functions, analytics.',cap:['Git Deploys','Previews','Edge Functions','Serverless','Analytics','Domains','Env Vars','Rollback'],f:[{k:'token',lb:'Access Token',ph:'vercel_...',s:1,h:'Deployment token',lk:'https://vercel.com/account/tokens',ll:'Account → Tokens'}]},
  github:{l:'GitHub',logo:'github',c:'#e2e2e2',d:'Code hosting, PRs, CI/CD, issues, actions, releases, and collaboration.',cap:['Repos','Pull Requests','Actions','Issues','Releases','Branch Rules','Webhooks','Pages'],f:[{k:'token',lb:'PAT',ph:'ghp_...',s:1,h:'Fine-grained recommended',lk:'https://github.com/settings/tokens?type=beta',ll:'Settings → Tokens'}]},
  gmail:{l:'Gmail',logo:'gmail',c:'#d93025',d:'Send and manage email via Google API — compose, read, labels, and search.',cap:['Send Email','Read Inbox','Labels','Search','Attachments','Drafts','Threads','Filters'],f:[{k:'client_id',lb:'OAuth Client ID',ph:'xxxxx.apps.googleusercontent.com',h:'Google Cloud Console OAuth',lk:'https://console.cloud.google.com/apis/credentials',ll:'Cloud Console → Credentials'}]},
  slack:{l:'Slack',logo:'slack',c:'#e01e5a',d:'Team messaging — send messages, manage channels, post notifications.',cap:['Send Messages','Channels','Threads','Reactions','File Upload','Blocks','Webhooks','Bot Users'],f:[{k:'bot_token',lb:'Bot Token',ph:'xoxb-...',s:1,h:'Bot user OAuth token',lk:'https://api.slack.com/apps',ll:'Apps → OAuth → Bot Token'}]},
  n8n:{l:'n8n',logo:'n8n',c:'#ff6d5a',d:'Open-source workflow automation — 400+ integrations, visual builder.',cap:['Visual Builder','400+ Integrations','Webhooks','Code Nodes','AI Agents','Error Handling','Sub-workflows','Credentials'],f:[{k:'url',lb:'Instance URL',ph:'https://xxx.app.n8n.cloud',h:'Cloud or self-hosted',lk:'https://app.n8n.cloud',ll:'n8n Cloud → Manage'},{k:'api_key',lb:'API Key',ph:'n8n_api_...',s:1,h:'Enable API first',lk:'https://docs.n8n.io/api/',ll:'Settings → API'}]},
}

const IDEAS: Record<string, string[]> = {
  'crm+stripe':['Stripe payment → auto-create CRM contact','Subscription cancelled → win-back email','CRM deal closed → generate Stripe invoice'],
  'crm+anthropic':['New contact → Claude scores lead quality','Auto-draft personalized follow-ups with AI'],
  'stripe+anthropic':['Dispute opened → AI drafts response','Monthly revenue → AI summary report'],
  'github+vercel':['PR opened → auto preview deploy','Release → production deploy'],
  'slack+crm':['New CRM contact → Slack notification','Deal stage change → alert team channel'],
  _base:['Connect services to unlock smart workflow ideas','Each connection adds triggers, actions, and AI combos','Try Stripe + CRM for payment-to-contact automation'],
}

const F = "'Inter', sans-serif"
const FM = "'JetBrains Mono', monospace"

// Hooks
function useVault() {
  const [c, sC] = useState<Record<string, Record<string, string>>>({})
  useEffect(() => {
    try { sC(JSON.parse(localStorage.getItem('0nork_v') || '{}')) } catch { /* empty */ }
  }, [])
  useEffect(() => { localStorage.setItem('0nork_v', JSON.stringify(c)) }, [c])
  const set = (s: string, k: string, v: string) => sC(p => ({ ...p, [s]: { ...(p[s] || {}), [k]: v } }))
  const get = (s: string, k: string) => c?.[s]?.[k] || ''
  const isC = (s: string) => { const sv = SVC[s]; if (!sv) return false; const r = sv.f.filter(f => f.s || f.k === 'url' || f.k === 'client_id'); return r.length > 0 && r.every(f => !!c?.[s]?.[f.k]) }
  const n = Object.keys(SVC).filter(isC).length
  return { c, set, get, isC, n }
}

interface Flow { id: string; name: string; trigger: string; actions: string[]; on: boolean; ts: string }
function useFlows() {
  const [f, sF] = useState<Flow[]>([])
  useEffect(() => { try { sF(JSON.parse(localStorage.getItem('0nork_f') || '[]')) } catch { /* empty */ } }, [])
  useEffect(() => { localStorage.setItem('0nork_f', JSON.stringify(f)) }, [f])
  return {
    f,
    add: (w: Omit<Flow, 'id' | 'ts'>) => sF(p => [...p, { ...w, id: Date.now() + '', ts: new Date().toISOString() }]),
    rm: (id: string) => sF(p => p.filter(x => x.id !== id)),
    tog: (id: string) => sF(p => p.map(x => x.id === id ? { ...x, on: !x.on } : x)),
  }
}

interface HistEntry { id: string; ts: string; type: string; detail: string }
function useHistory() {
  const [h, sH] = useState<HistEntry[]>([])
  useEffect(() => { try { sH(JSON.parse(localStorage.getItem('0nork_h') || '[]')) } catch { /* empty */ } }, [])
  useEffect(() => { localStorage.setItem('0nork_h', JSON.stringify(h)) }, [h])
  const add = (type: string, detail: string) => sH(p => [{ id: Date.now() + '', ts: new Date().toISOString(), type, detail }, ...p].slice(0, 200))
  const clear = () => sH([])
  return { h, add, clear }
}

// AI respond
function respond(t: string, v: ReturnType<typeof useVault>, fl: ReturnType<typeof useFlows>) {
  const lo = t.toLowerCase().trim()
  const conn = Object.keys(SVC).filter(k => v.isC(k))
  const nm = conn.map(k => SVC[k].l)
  if (/^(hi|hey|hello|yo|sup)/.test(lo)) return conn.length === 0 ? 'Hey! Welcome to 0nork. No services connected yet — tap the vault icon to get started.' : `Hey! ${conn.length} service${conn.length > 1 ? 's' : ''} online — ${nm.join(', ')}. Ask me to deploy, check payments, pull contacts, or build workflows.`
  if (/status|connected|online/.test(lo)) { const ls = Object.entries(SVC).map(([k, s]) => `${v.isC(k) ? '\u{1F7E2}' : '\u26AB'} ${s.l}`); return ls.join('\n') + `\n\n${conn.length}/${Object.keys(SVC).length} connected` }
  if (/help|command|what can/.test(lo)) return 'I understand plain English. Try:\n\n\u2022 "Check my Stripe balance"\n\u2022 "Pull CRM contacts"\n\u2022 "Deploy to production"\n\u2022 "What\'s connected?"\n\u2022 "Build a workflow"'
  if (/vault|credential|key|connect|setup/.test(lo)) return `Vault has ${v.n}/${Object.keys(SVC).length} services. Tap the vault icon to manage.`
  if (/workflow|flow|automat|trigger/.test(lo)) return fl.f.length ? `${fl.f.length} workflow${fl.f.length > 1 ? 's' : ''} (${fl.f.filter(x => x.on).length} active).` : 'No workflows yet. Use the workflows panel to create your first.'
  for (const [k, s] of Object.entries(SVC)) {
    if (new RegExp(k === 'crm' ? 'contact|lead|pipeline|crm\\b' : s.l.toLowerCase()).test(lo)) {
      return v.isC(k) ? `${s.l} connected. Ready to work with ${s.cap.slice(0, 3).join(', ')}.` : `${s.l} not connected — add your credentials in the Vault.`
    }
  }
  return conn.length ? `With ${nm.slice(0, 3).join(', ')}${conn.length > 3 ? ` + ${conn.length - 3} more` : ''} connected, I can do a lot. Try "help".` : 'Connect at least one service in the Vault first so I know what tools are available.'
}

// Small components
function Ico({ name, sz = 26 }: { name: string; sz?: number }) {
  return <span dangerouslySetInnerHTML={{ __html: L[name] || L.onork }} style={{ width: sz, height: sz, display: 'inline-flex', flexShrink: 0 }} />
}

function Dot({ on }: { on: boolean }) {
  return <span style={{ width: 6, height: 6, borderRadius: '50%', display: 'inline-block', background: on ? B.green : B.red, boxShadow: `0 0 6px ${on ? B.green : B.red}55` }} />
}

function Ticker({ vault }: { vault: ReturnType<typeof useVault> }) {
  const conn = Object.keys(SVC).filter(k => vault.isC(k))
  const ideas = useMemo(() => {
    const r: string[] = []
    for (const key of Object.keys(IDEAS)) { if (key === '_base') continue; const p = key.split('+'); if (p.every(x => conn.includes(x))) r.push(...IDEAS[key]) }
    if (r.length < 3) r.push(...IDEAS._base); return r
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conn.join(',')])
  const d = [...ideas, ...ideas]
  return (
    <div style={{ overflow: 'hidden', borderBottom: `1px solid ${B.border}`, padding: '6px 0', flexShrink: 0, position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 24, zIndex: 2, background: `linear-gradient(90deg,${B.bg},transparent)` }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 24, zIndex: 2, background: `linear-gradient(90deg,transparent,${B.bg})` }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 12, marginBottom: 2 }}>
        <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: B.p3 }}>IDEAS</span>
      </div>
      <div className="onork-ticker-scroll" style={{ display: 'flex', whiteSpace: 'nowrap' }}>
        {d.map((x, i) => <span key={i} style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 14px', fontSize: 11, color: B.textDim, flexShrink: 0 }}>
          <span style={{ color: B.p3, marginRight: 8, fontSize: 7 }}>{'\u25CF'}</span>{x}<span style={{ margin: '0 16px', color: B.textMuted }}>{'\u00B7'}</span>
        </span>)}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORTED COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function OnorkMini() {
  const [unlocked, setU] = useState(false)
  const [view, setV] = useState('home')
  const [activeSvc, setAS] = useState<string | null>(null)
  const vault = useVault()
  const flows = useFlows()
  const hist = useHistory()
  const [msgs, setMsgs] = useState([{ r: 'sys', t: 'Welcome to 0nork. Open the Vault to connect services, or just ask me anything.' }])
  const [inp, setInp] = useState('')
  const [showCmd, setSC] = useState(false)
  const [show, setShow] = useState<Record<string, boolean>>({})
  const chatEnd = useRef<HTMLDivElement>(null)
  const iRef = useRef<HTMLInputElement>(null)

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const addM = useCallback((r: string, t: string) => setMsgs(p => [...p, { r, t }]), [])
  const send = useCallback(() => {
    const t = inp.trim(); if (!t) return; setInp(''); setSC(false); addM('user', t); hist.add('chat', t)
    if (t === '/vault') { setV('vault'); setAS(null); return }
    if (t === '/flows') { setV('flows'); return }
    if (t === '/history') { setV('history'); return }
    addM('sys', respond(t, vault, flows))
  }, [inp, addM, hist, vault, flows])

  if (!unlocked) {
    return <PinScreen onUnlock={() => setU(true)} />
  }

  return (
    <div className="onork-mini-root">
      <style>{`
        .onork-mini-root { width:100%; height:100%; display:flex; flex-direction:column; position:relative; overflow:hidden; background:radial-gradient(ellipse at 50% 0%,${B.glow},transparent 60%),${B.bg}; font-family:${F}; color:${B.text}; }
        .onork-mini-root *{box-sizing:border-box;margin:0;padding:0}
        .onork-mini-root ::-webkit-scrollbar{width:3px} .onork-mini-root ::-webkit-scrollbar-thumb{background:${B.border};border-radius:3px}
        @keyframes onork-su{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes onork-br{0%,100%{filter:drop-shadow(0 0 4px #7c3aed00)}50%{filter:drop-shadow(0 0 12px #7c3aed66)}}
        @keyframes onork-sh{0%{background-position:-200% center}100%{background-position:200% center}}
        .onork-ticker-scroll{animation:onork-si 60s linear infinite}
        @keyframes onork-si{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes onork-pk{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
      `}</style>

      {/* HEADER */}
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${B.border}`, background: 'rgba(8,8,26,0.9)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ animation: 'onork-br 3s ease infinite' }}><Ico name="onork" sz={30} /></div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '-0.03em', background: `linear-gradient(90deg,${B.p3},${B.b2})`, backgroundSize: '200% auto', animation: 'onork-sh 3s linear infinite', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>0nork</div>
            <div style={{ fontSize: 9, color: B.textMuted, display: 'flex', alignItems: 'center', gap: 4 }}><Dot on={vault.n > 0} /> {vault.n}/{Object.keys(SVC).length}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {([['history', '\u{1F4CB}', B.p3], ['flows', '\u26A1', B.b2], ['vault', '\u{1F510}', B.p1]] as const).map(([v, ic, c]) => (
            <button key={v} onClick={() => { setV(view === v ? 'home' : v); if (v === 'vault') setAS(null) }} style={{
              background: view === v ? c + '22' : 'transparent', border: `1px solid ${view === v ? c + '44' : B.border}`,
              borderRadius: 8, padding: '5px 8px', color: B.text, fontSize: 12, cursor: 'pointer', fontFamily: F
            }}>{ic}</button>
          ))}
        </div>
      </div>

      <Ticker vault={vault} />

      {/* VAULT OVERLAY */}
      {view === 'vault' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(8,8,26,0.97)', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', animation: 'onork-su 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: `1px solid ${B.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontSize: 15, fontWeight: 700, color: B.text }}>{'\u{1F510}'} Vault</span><span style={{ fontSize: 11, color: B.textMuted }}>{vault.n}/{Object.keys(SVC).length}</span></div>
            <button onClick={() => setV('home')} style={{ background: 'none', border: 'none', color: B.textDim, fontSize: 18, cursor: 'pointer' }}>{'\u2715'}</button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 14 }}>
            {activeSvc ? (
              <VaultDetail svcKey={activeSvc} vault={vault} hist={hist} onBack={() => setAS(null)} show={show} setShow={setShow} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {Object.entries(SVC).map(([k, s]) => {
                  const cn = vault.isC(k)
                  return (
                    <button key={k} onClick={() => setAS(k)} style={{ background: B.card, border: `1px solid ${cn ? s.c + '30' : B.border}`, borderRadius: 10, padding: '12px 10px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}><Ico name={s.logo} sz={22} /><span style={{ fontWeight: 600, fontSize: 12, color: B.text }}>{s.l}</span></div>
                      <div style={{ fontSize: 10, color: B.textDim, lineHeight: 1.35, marginBottom: 5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.d.split('.')[0]}.</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: B.textDim }}><Dot on={cn} />{cn ? 'Live' : 'Setup'}</span>
                        <span style={{ fontSize: 8, color: s.c === '#e2e2e2' ? B.b2 : s.c, fontWeight: 700 }}>{s.cap.length} tools</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          <div style={{ padding: '8px 14px', borderTop: `1px solid ${B.border}`, fontSize: 8, color: B.textMuted, textAlign: 'center' }}>{'\u{1F512}'} Encrypted in browser</div>
        </div>
      )}

      {/* FLOWS OVERLAY */}
      {view === 'flows' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(8,8,26,0.97)', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', animation: 'onork-su 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: `1px solid ${B.border}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: B.text }}>{'\u26A1'} Workflows <span style={{ fontSize: 11, color: B.textMuted }}>{flows.f.length}</span></div>
            <button onClick={() => setV('home')} style={{ background: 'none', border: 'none', color: B.textDim, fontSize: 18, cursor: 'pointer' }}>{'\u2715'}</button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 14 }}>
            {flows.f.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 36, color: B.textDim }}><div style={{ fontSize: 36, marginBottom: 6 }}>{'\u26A1'}</div><div style={{ fontSize: 14, fontWeight: 600, color: B.text }}>No workflows yet</div><div style={{ fontSize: 12, marginTop: 4 }}>Build your first automation</div></div>
            ) : flows.f.map(f => (
              <div key={f.id} style={{ background: B.card, border: `1px solid ${f.on ? B.b2 + '30' : B.border}`, borderRadius: 10, padding: 12, marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: B.text }}>{f.name}</span>
                  <button onClick={() => { flows.tog(f.id); hist.add('workflow', `Toggled "${f.name}"`) }} style={{ padding: '2px 8px', borderRadius: 14, border: 'none', fontSize: 9, fontWeight: 700, cursor: 'pointer', background: f.on ? B.green + '22' : B.card, color: f.on ? B.green : B.textMuted }}>{f.on ? 'ON' : 'OFF'}</button>
                </div>
                <div style={{ fontSize: 11, color: B.b2 }}>{'\u26A1'} {f.trigger}</div>
                {f.actions.map((a, i) => <div key={i} style={{ fontSize: 11, color: B.textDim, paddingLeft: 10, marginTop: 1 }}>{'\u2192'} {a}</div>)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HISTORY OVERLAY */}
      {view === 'history' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(8,8,26,0.97)', backdropFilter: 'blur(16px)', display: 'flex', flexDirection: 'column', animation: 'onork-su 0.2s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: `1px solid ${B.border}` }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: B.text }}>{'\u{1F4CB}'} History <span style={{ fontSize: 11, color: B.textMuted }}>{hist.h.length}</span></div>
            <button onClick={() => setV('home')} style={{ background: 'none', border: 'none', color: B.textDim, fontSize: 18, cursor: 'pointer' }}>{'\u2715'}</button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 14 }}>
            {hist.h.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 36, color: B.textDim }}><div style={{ fontSize: 14, fontWeight: 600, color: B.text }}>No activity yet</div></div>
            ) : hist.h.map(e => (
              <div key={e.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: `1px solid ${B.border}22` }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: e.type === 'connect' ? B.green + '18' : e.type === 'workflow' ? B.b2 + '18' : B.p1 + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>
                  {e.type === 'connect' ? '\u{1F517}' : e.type === 'workflow' ? '\u26A1' : '\u{1F4AC}'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: B.text, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.detail}</div>
                  <div style={{ fontSize: 9, color: B.textMuted, marginTop: 2 }}>{new Date(e.ts).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SERVICE QUICK GRID */}
      <div style={{ padding: '10px 12px 6px', borderBottom: `1px solid ${B.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 8, color: B.textMuted, marginBottom: 6, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Services</div>
        <div style={{ display: 'flex', gap: 4, overflow: 'auto', paddingBottom: 4 }}>
          {Object.entries(SVC).map(([k, s]) => (
            <button key={k} onClick={() => { setAS(k); setV('vault') }} style={{
              background: vault.isC(k) ? `${s.c === '#e2e2e2' ? B.p2 : s.c}12` : B.card,
              border: `1px solid ${vault.isC(k) ? (s.c === '#e2e2e2' ? B.p2 : s.c) + '25' : B.border}`,
              borderRadius: 8, padding: '8px 4px 6px', cursor: 'pointer', textAlign: 'center', minWidth: 48, flexShrink: 0
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}><Ico name={s.logo} sz={20} /></div>
              <div style={{ fontSize: 8, color: B.text, fontWeight: 600, lineHeight: 1.1, whiteSpace: 'nowrap' }}>{s.l}</div>
            </button>
          ))}
        </div>
      </div>

      {/* CHAT */}
      <div style={{ flex: 1, overflow: 'auto', padding: '10px 8px' }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.r === 'user' ? 'flex-end' : 'flex-start', marginBottom: 6, padding: '0 2px', animation: 'onork-su 0.15s ease', alignItems: 'flex-start' }}>
            {m.r === 'sys' && <div style={{ width: 18, height: 18, flexShrink: 0, marginRight: 5, marginTop: 4 }}><Ico name="onork" sz={18} /></div>}
            <div style={{
              maxWidth: '82%', padding: '9px 12px', fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap',
              borderRadius: m.r === 'user' ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
              background: m.r === 'user' ? B.grad : B.card, border: m.r === 'user' ? 'none' : `1px solid ${B.border}`, color: B.text
            }}>{m.t}</div>
          </div>
        ))}
        <div ref={chatEnd} />
      </div>

      {/* CMD PALETTE */}
      {showCmd && (
        <div style={{ position: 'absolute', bottom: 64, left: 8, right: 8, zIndex: 50, background: B.surface, border: `1px solid ${B.border}`, borderRadius: 12, padding: 5, animation: 'onork-su 0.1s ease' }}>
          {['/help', '/status', '/vault', '/flows', '/history'].map(cmd => (
            <button key={cmd} onClick={() => { setInp(cmd + ' '); setSC(false); iRef.current?.focus() }} style={{ display: 'block', width: '100%', background: 'none', border: 'none', padding: '7px 8px', borderRadius: 6, color: B.text, fontSize: 12, cursor: 'pointer', fontFamily: F, textAlign: 'left' }}>
              <span style={{ fontFamily: FM, color: B.p3 }}>{cmd}</span>
            </button>
          ))}
        </div>
      )}

      {/* INPUT */}
      <div style={{ padding: '8px 12px 12px', borderTop: `1px solid ${B.border}`, background: 'rgba(8,8,26,0.92)', backdropFilter: 'blur(12px)', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <input ref={iRef} value={inp}
            onChange={e => { setInp(e.target.value); setSC(e.target.value === '/') }}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask anything or type / ..."
            style={{ flex: 1, background: B.surface, border: `1px solid ${B.border}`, borderRadius: 10, padding: '9px 12px', color: B.text, fontSize: 13, outline: 'none', fontFamily: F }}
          />
          <button onClick={send} style={{ background: B.grad, border: 'none', borderRadius: 10, padding: '0 16px', color: '#fff', fontSize: 15, cursor: 'pointer', fontWeight: 800 }}>{'\u2191'}</button>
        </div>
        <div style={{ textAlign: 'center', fontSize: 7, color: B.textMuted, marginTop: 5, letterSpacing: '0.15em', textTransform: 'uppercase' }}>0nork {'\u2219'} 0nMCP</div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// VAULT DETAIL
// ═══════════════════════════════════════════════════════════════
function VaultDetail({ svcKey, vault, hist, onBack, show, setShow }: {
  svcKey: string; vault: ReturnType<typeof useVault>; hist: ReturnType<typeof useHistory>
  onBack: () => void; show: Record<string, boolean>; setShow: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
}) {
  const s = SVC[svcKey]; const conn = vault.isC(svcKey)
  return (
    <div style={{ animation: 'onork-su 0.2s ease' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: B.b2, fontSize: 12, cursor: 'pointer', marginBottom: 14, padding: 0, fontFamily: F }}>{'\u2190'} Back</button>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <Ico name={s.logo} sz={34} />
        <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 17, color: B.text }}>{s.l}</div>
          <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}><Dot on={conn} /><span style={{ color: conn ? B.green : B.red }}>{conn ? 'Connected' : 'Not connected'}</span></div></div>
      </div>
      <div style={{ fontSize: 12, color: B.textDim, lineHeight: 1.6, marginBottom: 16, padding: '10px 12px', background: B.card, borderRadius: 10, border: `1px solid ${B.border}` }}>{s.d}</div>
      <div style={{ marginBottom: 18 }}><div style={{ fontSize: 9, color: B.textMuted, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Capabilities ({s.cap.length})</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{s.cap.map(c => <span key={c} style={{ fontSize: 10, padding: '3px 10px', borderRadius: 16, background: `${s.c}14`, border: `1px solid ${s.c}30`, color: s.c === '#e2e2e2' ? B.text : s.c, fontWeight: 500 }}>{c}</span>)}</div></div>
      <div style={{ fontSize: 9, color: B.textMuted, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Credentials ({s.f.length})</div>
      {s.f.map(f => (
        <div key={f.k} style={{ marginBottom: 12, padding: '12px 14px', background: B.card, borderRadius: 12, border: `1px solid ${vault.get(svcKey, f.k) ? s.c + '30' : B.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ fontSize: 11, color: B.text, fontWeight: 600 }}>{f.lb}</label>
            {f.s ? <button onClick={() => setShow(p => ({ ...p, [f.k]: !p[f.k] }))} style={{ background: 'none', border: 'none', color: B.textDim, fontSize: 10, cursor: 'pointer', fontFamily: F }}>{show[f.k] ? 'Hide' : 'Show'}</button> : null}
          </div>
          <input type={f.s && !show[f.k] ? 'password' : 'text'} value={vault.get(svcKey, f.k)}
            onChange={e => { vault.set(svcKey, f.k, e.target.value); if (e.target.value && f.s) hist.add('connect', `Updated ${f.lb} for ${s.l}`) }}
            placeholder={f.ph} style={{ width: '100%', background: B.bg, border: `1px solid ${B.border}`, borderRadius: 8, padding: '8px 10px', color: B.text, fontSize: 12, fontFamily: FM, outline: 'none' }} />
          <div style={{ fontSize: 10, color: B.textMuted, marginTop: 5 }}>{f.h}</div>
          <a href={f.lk} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: s.c === '#e2e2e2' ? B.b2 : s.c, textDecoration: 'none', marginTop: 4, fontWeight: 500 }}>{'\u2197'} {f.ll}</a>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// PIN SCREEN
// ═══════════════════════════════════════════════════════════════
function PinScreen({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState('')
  const [err, setErr] = useState(false)
  const [shk, setShk] = useState(false)

  const d = (n: string) => {
    if (pin.length >= 6) return
    const nx = pin + n; setPin(nx); setErr(false)
    if (nx.length === 6) {
      if (nx === PIN_CODE) setTimeout(() => onUnlock(), 200)
      else { setShk(true); setErr(true); setTimeout(() => { setPin(''); setShk(false) }, 600) }
    }
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse at 50% 30%,${B.glow},transparent 70%),${B.bg}`, fontFamily: F }}>
      <style>{`
        @keyframes onork-su{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes onork-pk{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
      `}</style>
      <div style={{ animation: 'onork-su 0.5s ease', textAlign: 'center' }}>
        <span dangerouslySetInnerHTML={{ __html: LOGO_SVG }} style={{ width: 52, height: 52, display: 'inline-flex' }} />
        <div style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.03em', background: `linear-gradient(135deg,${B.p3},${B.b2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginTop: 4 }}>0nork</div>
        <div style={{ fontSize: 11, color: B.textDim, marginTop: 4, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Enter Access Code</div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '24px 0', animation: shk ? 'onork-pk 0.35s ease' : 'none' }}>
          {[0, 1, 2, 3, 4, 5].map(i => <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${err ? B.red : i < pin.length ? B.p2 : B.border}`, background: i < pin.length ? (err ? B.red : B.p2) : 'transparent', transition: 'all 0.12s', boxShadow: i < pin.length && !err ? `0 0 8px ${B.p2}44` : 'none' }} />)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, maxWidth: 230, margin: '0 auto' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, '\u232B'].map((n, i) => n === null ? <div key={i} /> :
            <button key={i} onClick={() => n === '\u232B' ? setPin(p => p.slice(0, -1)) : d(String(n))} style={{
              width: 60, height: 52, borderRadius: 12, background: n === '\u232B' ? 'transparent' : B.card, border: n === '\u232B' ? 'none' : `1px solid ${B.border}`,
              color: B.text, fontSize: n === '\u232B' ? 18 : 20, fontWeight: 600, fontFamily: F, cursor: 'pointer'
            }}>{n}</button>)}
        </div>
      </div>
    </div>
  )
}
