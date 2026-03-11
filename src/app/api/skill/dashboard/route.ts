import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/skill/dashboard — Returns a standalone interactive HTML dashboard
 *
 * A single-file HTML app that:
 *   - Authenticates with 0nmcp.com
 *   - Shows Vault services, Spark balance, Brain status
 *   - Manages credentials (2-way sync)
 *   - All API calls go to 0nmcp.com endpoints
 */
export async function GET() {
  const html = getDashboardHtml()

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': 'attachment; filename="dashboard.html"',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

function getDashboardHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>0nMCP Dashboard</title>
<style>
  :root {
    --bg: #0a0a0f;
    --bg-card: rgba(255,255,255,0.02);
    --border: rgba(255,255,255,0.06);
    --text: #e2e2e8;
    --text-dim: #78788c;
    --text-muted: #4a4a5a;
    --green: #7ed957;
    --orange: #ff6b35;
    --cyan: #00d4ff;
    --purple: #a78bfa;
    --red: #ef4444;
    --mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', monospace;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: var(--bg);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    min-height: 100vh;
  }
  .container { max-width: 820px; margin: 0 auto; padding: 48px 24px; }
  .header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 40px; padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
  }
  .logo { display: flex; align-items: center; gap: 10px; }
  .logo-text { font-size: 22px; font-weight: 800; color: var(--text); letter-spacing: -0.5px; }
  .logo-text span { color: var(--orange); }
  .badge {
    font-size: 10px; font-weight: 700; padding: 3px 10px;
    border-radius: 6px; text-transform: uppercase; letter-spacing: 0.06em;
    font-family: var(--mono);
  }
  .badge-green { background: rgba(126,217,87,0.1); color: var(--green); border: 1px solid rgba(126,217,87,0.2); }
  .badge-red { background: rgba(239,68,68,0.1); color: var(--red); border: 1px solid rgba(239,68,68,0.2); }

  /* Login */
  .login-wrap {
    max-width: 380px; margin: 80px auto; text-align: center;
  }
  .login-wrap h2 { font-size: 24px; margin-bottom: 8px; }
  .login-wrap p { color: var(--text-dim); margin-bottom: 28px; font-size: 14px; }
  .input-group { margin-bottom: 12px; }
  .input-group input {
    width: 100%; padding: 12px 16px; border-radius: 10px;
    background: rgba(255,255,255,0.04); border: 1px solid var(--border);
    color: var(--text); font-size: 14px; outline: none;
    font-family: inherit; transition: border-color 0.2s;
  }
  .input-group input:focus { border-color: rgba(255,107,53,0.4); }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    padding: 12px 28px; border-radius: 10px; font-weight: 700;
    font-size: 14px; border: none; cursor: pointer; transition: all 0.15s;
    font-family: inherit; width: 100%;
  }
  .btn-primary { background: linear-gradient(135deg, var(--orange), #e55a2b); color: white; }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(255,107,53,0.25); }
  .btn-primary:disabled { opacity: 0.5; cursor: wait; transform: none; box-shadow: none; }
  .btn-ghost {
    background: rgba(255,255,255,0.04); border: 1px solid var(--border);
    color: var(--text-dim); margin-top: 8px;
  }
  .btn-ghost:hover { border-color: rgba(255,255,255,0.12); color: var(--text); }
  .error { color: var(--red); font-size: 13px; margin-top: 8px; }

  /* Stats */
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
  .stat {
    padding: 18px 20px; border-radius: 12px;
    background: var(--bg-card); border: 1px solid var(--border);
  }
  .stat-label {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.08em; color: var(--text-muted); margin-bottom: 8px;
  }
  .stat-value {
    font-size: 22px; font-weight: 700; font-family: var(--mono); line-height: 1;
  }
  .stat-dot {
    display: inline-block; width: 8px; height: 8px; border-radius: 50%;
    margin-right: 6px; vertical-align: middle;
  }

  /* Sections */
  .section { margin-bottom: 32px; }
  .section-title {
    font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 12px;
  }
  .card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 12px; overflow: hidden;
  }
  .card-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 18px; border-bottom: 1px solid rgba(255,255,255,0.03);
  }
  .card-row:last-child { border-bottom: none; }
  .card-row-name { font-size: 13px; font-weight: 600; color: var(--text); }
  .card-row-meta { font-size: 11px; color: var(--text-muted); font-family: var(--mono); }
  .empty { padding: 32px; text-align: center; color: var(--text-muted); font-size: 13px; }
  .empty a { color: var(--orange); text-decoration: none; }

  /* Brain */
  .tier-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 10px; font-weight: 700;
    font-size: 14px; margin-bottom: 16px;
  }
  .progress-bar {
    height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px;
    overflow: hidden; margin: 8px 0;
  }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }

  /* Actions */
  .actions { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .action-btn {
    padding: 16px; border-radius: 12px; background: var(--bg-card);
    border: 1px solid var(--border); cursor: pointer; text-align: left;
    transition: all 0.15s; font-family: inherit;
  }
  .action-btn:hover { border-color: rgba(255,255,255,0.12); transform: translateY(-1px); }
  .action-btn h4 { font-size: 13px; color: var(--text); margin-bottom: 4px; }
  .action-btn p { font-size: 11px; color: var(--text-dim); line-height: 1.4; }

  /* Footer */
  .footer {
    text-align: center; padding-top: 24px; margin-top: 20px;
    border-top: 1px solid var(--border);
  }
  .footer a { color: var(--orange); text-decoration: none; font-size: 13px; }

  /* Responsive */
  @media (max-width: 640px) {
    .stats { grid-template-columns: repeat(2, 1fr); }
    .actions { grid-template-columns: 1fr; }
  }

  /* Loading spinner */
  .spinner {
    width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.1);
    border-top-color: var(--orange); border-radius: 50%;
    animation: spin 0.6s linear infinite; display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeIn 0.3s ease; }
</style>
</head>
<body>

<div class="container" id="app">
  <!-- Login Screen -->
  <div id="login-screen" class="login-wrap">
    <h2>0n<span style="color:var(--orange)">MCP</span> Dashboard</h2>
    <p>Sign in with your 0nmcp.com account</p>
    <form id="login-form">
      <div class="input-group">
        <input type="email" id="email" placeholder="Email" required autocomplete="email" />
      </div>
      <div class="input-group">
        <input type="password" id="password" placeholder="Password" required autocomplete="current-password" />
      </div>
      <button type="submit" class="btn btn-primary" id="login-btn">Sign In</button>
      <button type="button" class="btn btn-ghost" onclick="window.open('https://www.0nmcp.com/signup','_blank')">
        Create Account
      </button>
      <div class="error" id="login-error" style="display:none"></div>
    </form>
  </div>

  <!-- Dashboard Screen -->
  <div id="dashboard-screen" style="display:none" class="fade-in">
    <div class="header">
      <div class="logo">
        <div class="logo-text">0n<span>MCP</span></div>
        <span class="badge badge-green" id="status-badge">Connected</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <span style="font-size:12px;color:var(--text-dim)" id="user-email"></span>
        <button class="btn btn-ghost" style="width:auto;padding:6px 14px;font-size:12px" onclick="signOut()">
          Sign Out
        </button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats" id="stats-grid">
      <div class="stat">
        <div class="stat-label">Status</div>
        <div class="stat-value" style="color:var(--green)" id="stat-status">
          <span class="stat-dot" style="background:var(--green)"></span>Online
        </div>
      </div>
      <div class="stat">
        <div class="stat-label">Vault Keys</div>
        <div class="stat-value" style="color:var(--green)" id="stat-vault">—</div>
      </div>
      <div class="stat">
        <div class="stat-label">Sparks</div>
        <div class="stat-value" style="color:var(--orange)" id="stat-sparks">—</div>
      </div>
      <div class="stat">
        <div class="stat-label">Brain Tier</div>
        <div class="stat-value" style="color:var(--purple)" id="stat-brain">—</div>
      </div>
    </div>

    <!-- Vault -->
    <div class="section">
      <div class="section-title">Vault — Connected Services</div>
      <div class="card" id="vault-list">
        <div class="empty">Loading...</div>
      </div>
    </div>

    <!-- Brain -->
    <div class="section">
      <div class="section-title">Council Brain</div>
      <div class="card" style="padding:20px" id="brain-card">
        <div class="empty">Loading...</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="section">
      <div class="section-title">Quick Actions</div>
      <div class="actions">
        <button class="action-btn" onclick="window.open('https://www.0nmcp.com/console','_blank')">
          <h4>Open Console</h4>
          <p>Full dashboard on the web</p>
        </button>
        <button class="action-btn" onclick="window.open('https://www.0nmcp.com/store','_blank')">
          <h4>Browse Store</h4>
          <p>Automation templates</p>
        </button>
        <button class="action-btn" onclick="refreshAll()">
          <h4>Refresh</h4>
          <p>Reload all data</p>
        </button>
      </div>
    </div>

    <div class="footer">
      <a href="https://www.0nmcp.com" target="_blank">0nmcp.com</a>
      <span style="color:var(--text-muted);margin:0 8px">·</span>
      <a href="https://www.0nmcp.com/forum" target="_blank">Forum</a>
      <span style="color:var(--text-muted);margin:0 8px">·</span>
      <a href="https://github.com/0nork/0nMCP" target="_blank">GitHub</a>
    </div>
  </div>
</div>

<script>
const API = 'https://www.0nmcp.com/api/skill'
let token = localStorage.getItem('0nmcp_token') || null
let userEmail = localStorage.getItem('0nmcp_email') || ''

// Check for existing session
if (token) {
  showDashboard()
  refreshAll()
}

// Login form
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const btn = document.getElementById('login-btn')
  const errEl = document.getElementById('login-error')
  errEl.style.display = 'none'
  btn.disabled = true
  btn.innerHTML = '<span class="spinner"></span> Signing in...'

  try {
    const res = await fetch(API + '/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
      }),
    })
    const data = await res.json()

    if (!res.ok) {
      errEl.textContent = data.error || 'Sign in failed'
      errEl.style.display = 'block'
      btn.disabled = false
      btn.textContent = 'Sign In'
      return
    }

    token = data.access_token
    userEmail = data.user?.email || document.getElementById('email').value
    localStorage.setItem('0nmcp_token', token)
    localStorage.setItem('0nmcp_email', userEmail)
    showDashboard()
    refreshAll()
  } catch (err) {
    errEl.textContent = 'Network error — check your connection'
    errEl.style.display = 'block'
    btn.disabled = false
    btn.textContent = 'Sign In'
  }
})

function showDashboard() {
  document.getElementById('login-screen').style.display = 'none'
  document.getElementById('dashboard-screen').style.display = 'block'
  document.getElementById('user-email').textContent = userEmail
}

function signOut() {
  token = null
  userEmail = ''
  localStorage.removeItem('0nmcp_token')
  localStorage.removeItem('0nmcp_email')
  document.getElementById('login-screen').style.display = 'block'
  document.getElementById('dashboard-screen').style.display = 'none'
}

async function apiFetch(path) {
  const res = await fetch(API + path, {
    headers: { Authorization: 'Bearer ' + token },
  })
  if (res.status === 401) { signOut(); return null }
  return res.json()
}

async function refreshAll() {
  await Promise.all([loadVault(), loadSparks(), loadBrain()])
}

async function loadVault() {
  try {
    const data = await apiFetch('/vault')
    if (!data) return
    document.getElementById('stat-vault').textContent = String(data.count)
    const el = document.getElementById('vault-list')
    if (data.count === 0) {
      el.innerHTML = '<div class="empty">No keys yet. <a href="https://www.0nmcp.com/console" target="_blank">Add keys in the Console</a></div>'
    } else {
      el.innerHTML = data.services.map(s =>
        '<div class="card-row">' +
          '<span class="card-row-name">' + esc(s.service_name) + '</span>' +
          '<span class="card-row-meta">' + new Date(s.created_at).toLocaleDateString() + '</span>' +
        '</div>'
      ).join('')
    }
  } catch { document.getElementById('vault-list').innerHTML = '<div class="empty">Failed to load</div>' }
}

async function loadSparks() {
  try {
    const data = await apiFetch('/sparks')
    if (!data) return
    document.getElementById('stat-sparks').textContent = data.is_owner ? '∞' : String(data.balance)
  } catch { document.getElementById('stat-sparks').textContent = '—' }
}

async function loadBrain() {
  try {
    const res = await fetch('https://www.0nmcp.com/api/training/leaderboard')
    const data = await res.json()
    if (!data) return

    const tier = data.currentTier || 0
    const tierNames = ['Seed', 'Sprout', 'Growth', 'Canopy', 'Neural']
    const tierColors = ['#64748b', '#7ed957', '#00d4ff', '#a78bfa', '#ff6b35']
    const name = tierNames[tier] || 'Seed'
    const color = tierColors[tier] || '#64748b'

    document.getElementById('stat-brain').innerHTML =
      '<span style="color:' + color + '">' + name + '</span>'

    const total = data.totalKnowledge || 0
    const avg = data.avgScore ? (data.avgScore * 100).toFixed(0) + '%' : '—'
    const nextTier = tier < 4 ? tierNames[tier + 1] : 'MAX'
    const progress = Math.min(total / (tier < 1 ? 20 : tier < 2 ? 50 : tier < 3 ? 150 : tier < 4 ? 500 : 1000) * 100, 100)

    document.getElementById('brain-card').innerHTML =
      '<div class="tier-badge" style="background:' + color + '18;color:' + color + ';border:1px solid ' + color + '33">' +
        'Tier ' + tier + ' — ' + name +
      '</div>' +
      '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px">' +
        '<div><div class="stat-label">Knowledge</div><div style="font-size:18px;font-weight:700;font-family:var(--mono);color:' + color + '">' + total + '</div></div>' +
        '<div><div class="stat-label">Avg Score</div><div style="font-size:18px;font-weight:700;font-family:var(--mono);color:' + color + '">' + avg + '</div></div>' +
        '<div><div class="stat-label">Next Tier</div><div style="font-size:18px;font-weight:700;font-family:var(--mono);color:var(--text-dim)">' + nextTier + '</div></div>' +
      '</div>' +
      '<div class="progress-bar"><div class="progress-fill" style="width:' + progress + '%;background:' + color + '"></div></div>' +
      '<div style="font-size:11px;color:var(--text-muted);margin-top:4px">Progress to ' + nextTier + '</div>'
  } catch {
    document.getElementById('brain-card').innerHTML = '<div class="empty">Brain data unavailable</div>'
    document.getElementById('stat-brain').textContent = '—'
  }
}

function esc(s) {
  const d = document.createElement('div')
  d.textContent = s
  return d.innerHTML
}
</script>
</body>
</html>`
}
