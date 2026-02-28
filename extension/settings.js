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

let currentMode = 'server'
let showFab = true

// Load saved settings
chrome.storage.sync.get(
  { mode: 'server', apiKey: '', serverUrl: 'http://localhost:3939', showFab: true },
  (settings) => {
    currentMode = settings.mode
    apiKeyInput.value = settings.apiKey
    serverUrlInput.value = settings.serverUrl
    showFab = settings.showFab
    fabToggle.classList.toggle('active', showFab)
    updateModeUI()
  }
)

// Mode switching
modeServer.addEventListener('click', () => { currentMode = 'server'; updateModeUI() })
modeAnthropic.addEventListener('click', () => { currentMode = 'anthropic'; updateModeUI() })
modeLocal.addEventListener('click', () => { currentMode = 'local'; updateModeUI() })

// Fab toggle
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

// Save
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

// Test connection
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
