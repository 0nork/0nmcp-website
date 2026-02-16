const modeAnthropic = document.getElementById('modeAnthropic')
const modeLocal = document.getElementById('modeLocal')
const anthropicSection = document.getElementById('anthropicSection')
const localSection = document.getElementById('localSection')
const apiKeyInput = document.getElementById('apiKey')
const serverUrlInput = document.getElementById('serverUrl')
const testBtn = document.getElementById('testBtn')
const saveBtn = document.getElementById('saveBtn')
const statusSection = document.getElementById('statusSection')
const statusMsg = document.getElementById('statusMsg')

let currentMode = 'anthropic'

// Load saved settings
chrome.storage.sync.get(
  { mode: 'anthropic', apiKey: '', serverUrl: 'http://localhost:3939' },
  (settings) => {
    currentMode = settings.mode
    apiKeyInput.value = settings.apiKey
    serverUrlInput.value = settings.serverUrl
    updateModeUI()
  }
)

// Mode switching
modeAnthropic.addEventListener('click', () => {
  currentMode = 'anthropic'
  updateModeUI()
})

modeLocal.addEventListener('click', () => {
  currentMode = 'local'
  updateModeUI()
})

function updateModeUI() {
  modeAnthropic.classList.toggle('active', currentMode === 'anthropic')
  modeLocal.classList.toggle('active', currentMode === 'local')
  anthropicSection.classList.toggle('hidden', currentMode !== 'anthropic')
  localSection.classList.toggle('hidden', currentMode !== 'local')
}

// Save
saveBtn.addEventListener('click', () => {
  chrome.storage.sync.set({
    mode: currentMode,
    apiKey: apiKeyInput.value,
    serverUrl: serverUrlInput.value || 'http://localhost:3939',
  }, () => {
    showStatus('ok', 'Settings saved')
  })
})

// Test connection
testBtn.addEventListener('click', async () => {
  testBtn.textContent = 'Testing...'
  testBtn.disabled = true

  try {
    if (currentMode === 'anthropic') {
      const key = apiKeyInput.value
      if (!key) {
        showStatus('error', 'No API key entered')
        return
      }

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

      if (response.ok) {
        showStatus('ok', 'Connected to Anthropic API')
      } else {
        showStatus('error', `API returned ${response.status}`)
      }
    } else {
      const url = serverUrlInput.value || 'http://localhost:3939'
      const response = await fetch(`${url}/health`)

      if (response.ok) {
        showStatus('ok', `Connected to ${url}`)
      } else {
        showStatus('error', `Server returned ${response.status}`)
      }
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
