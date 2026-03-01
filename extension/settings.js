// 0n for Chrome v3.0 — Settings with Account Management

const API_BASE = 'https://0nmcp.com/api/extension'

const modeServer = document.getElementById('modeServer')
const modeAnthropic = document.getElementById('modeAnthropic')
const modeLocal = document.getElementById('modeLocal')
const serverSection = document.getElementById('serverSection')
const anthropicSection = document.getElementById('anthropicSection')
const localSection = document.getElementById('localSection')
const apiKeyInput = document.getElementById('apiKey')
const serverUrlInput = document.getElementById('serverUrl')
const testBtn = document.getElementById('testBtn')
const saveBtn = document.getElementById('saveBtn')
const statusSection = document.getElementById('statusSection')
const statusMsg = document.getElementById('statusMsg')
const fabToggle = document.getElementById('fabToggle')

// Account elements
const accountDisconnected = document.getElementById('accountDisconnected')
const accountConnected = document.getElementById('accountConnected')
const accountName = document.getElementById('accountName')
const accountModules = document.getElementById('accountModules')
const tokenInput = document.getElementById('tokenInput')
const connectBtn = document.getElementById('connectBtn')
const disconnectBtn = document.getElementById('disconnectBtn')

let currentMode = 'server'
let showFab = true

// ── Load saved settings ──
chrome.storage.sync.get(
  { mode: 'server', apiKey: '', serverUrl: 'http://localhost:3939', showFab: true, authToken: null, authUser: null, enabledModules: [], allModules: [] },
  (settings) => {
    currentMode = settings.mode
    apiKeyInput.value = settings.apiKey
    serverUrlInput.value = settings.serverUrl
    showFab = settings.showFab
    fabToggle.classList.toggle('active', showFab)
    updateModeUI()

    // Account state
    if (settings.authToken && settings.authUser) {
      showConnected(settings.authUser, settings.enabledModules || [], settings.allModules || [])
    }
  }
)

// ── Account: Connect ──
connectBtn.addEventListener('click', async () => {
  const token = tokenInput.value.trim()
  if (!token) {
    showStatus('error', 'Paste your auth token first')
    return
  }

  connectBtn.textContent = 'Connecting...'
  connectBtn.disabled = true

  try {
    const res = await fetch(`${API_BASE}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    const data = await res.json()

    if (!res.ok || !data.valid) {
      showStatus('error', data.error || 'Invalid token')
      return
    }

    // Token valid — store it
    const authUser = { name: data.name || 'Connected', avatar: data.avatar, user_id: data.user_id }
    await chrome.storage.sync.set({ authToken: token, authUser })

    // Fetch modules
    const modulesRes = await fetch(`${API_BASE}/modules`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (modulesRes.ok) {
      const modulesData = await modulesRes.json()
      const enabled = (modulesData.modules || []).filter(m => m.enabled).map(m => m.id)
      await chrome.storage.sync.set({ enabledModules: enabled, allModules: modulesData.modules || [] })
      showConnected(authUser, enabled, modulesData.modules || [])
    } else {
      showConnected(authUser, [], [])
    }

    // Refresh background menus
    chrome.runtime.sendMessage({ type: 'REFRESH_MODULES' })
    showStatus('ok', 'Account connected!')
    tokenInput.value = ''
  } catch (err) {
    showStatus('error', `Connection failed: ${err.message}`)
  } finally {
    connectBtn.textContent = 'Connect'
    connectBtn.disabled = false
  }
})

// ── Account: Disconnect ──
disconnectBtn.addEventListener('click', async () => {
  await chrome.storage.sync.remove(['authToken', 'authUser', 'enabledModules', 'allModules'])
  accountDisconnected.classList.remove('hidden')
  accountConnected.classList.add('hidden')
  chrome.runtime.sendMessage({ type: 'REFRESH_MODULES' })
  showStatus('ok', 'Account disconnected')
})

function showConnected(user, enabledIds, allModules) {
  accountDisconnected.classList.add('hidden')
  accountConnected.classList.remove('hidden')
  accountName.textContent = user.name || 'Connected'

  if (allModules.length > 0) {
    accountModules.innerHTML = allModules.map(mod => {
      const isEnabled = enabledIds.includes(mod.id)
      return `<span class="module-pill ${isEnabled ? 'enabled' : 'disabled'}">${mod.name}</span>`
    }).join('')
  } else {
    accountModules.innerHTML = '<span class="module-pill disabled">No modules</span>'
  }
}

// ── Mode switching ──
modeServer.addEventListener('click', () => { currentMode = 'server'; updateModeUI() })
modeAnthropic.addEventListener('click', () => { currentMode = 'anthropic'; updateModeUI() })
modeLocal.addEventListener('click', () => { currentMode = 'local'; updateModeUI() })

fabToggle.addEventListener('click', () => {
  showFab = !showFab
  fabToggle.classList.toggle('active', showFab)
})

function updateModeUI() {
  modeServer.classList.toggle('active', currentMode === 'server')
  modeAnthropic.classList.toggle('active', currentMode === 'anthropic')
  modeLocal.classList.toggle('active', currentMode === 'local')
  serverSection.classList.toggle('hidden', currentMode !== 'server')
  anthropicSection.classList.toggle('hidden', currentMode !== 'anthropic')
  localSection.classList.toggle('hidden', currentMode !== 'local')
}

// ── Save ──
saveBtn.addEventListener('click', () => {
  chrome.storage.sync.set({
    mode: currentMode,
    apiKey: apiKeyInput.value,
    serverUrl: serverUrlInput.value || 'http://localhost:3939',
    showFab,
  }, () => {
    showStatus('ok', 'Settings saved')
  })
})

// ── Test connection ──
testBtn.addEventListener('click', async () => {
  testBtn.textContent = 'Testing...'
  testBtn.disabled = true

  try {
    if (currentMode === 'server') {
      const response = await fetch('https://0nmcp.com/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'ping' }]
        })
      })
      showStatus(response.ok ? 'ok' : 'error',
        response.ok ? 'Connected to 0nMCP server' : `Server returned ${response.status}`)
    } else if (currentMode === 'anthropic') {
      const key = apiKeyInput.value
      if (!key) { showStatus('error', 'No API key entered'); return }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'ping' }],
        }),
      })
      showStatus(response.ok ? 'ok' : 'error',
        response.ok ? 'Connected to Anthropic API' : `API returned ${response.status}`)
    } else {
      const url = serverUrlInput.value || 'http://localhost:3939'
      const response = await fetch(`${url}/health`)
      showStatus(response.ok ? 'ok' : 'error',
        response.ok ? `Connected to ${url}` : `Server returned ${response.status}`)
    }
  } catch (err) {
    showStatus('error', `Connection failed: ${err.message}`)
  } finally {
    testBtn.textContent = 'Test Connection'
    testBtn.disabled = false
  }
})

function showStatus(type, message) {
  statusSection.classList.remove('hidden')
  statusMsg.className = `status ${type}`
  statusMsg.textContent = `${type === 'ok' ? '\u2713' : '\u2717'} ${message}`
}
