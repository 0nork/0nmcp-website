const SYSTEM_PROMPT = `You are 0nMCP, a universal AI API orchestrator with 545 tools across 26 services in 13 categories. You help users manage workflows, execute tasks, and connect services. You speak concisely and helpfully. When users describe tasks, suggest which 0nMCP tools and services could accomplish them.`

const messagesEl = document.getElementById('messages')
const inputForm = document.getElementById('inputForm')
const messageInput = document.getElementById('messageInput')
const sendBtn = document.getElementById('sendBtn')

let messages = []
let isStreaming = false

// Settings button
document.getElementById('settingsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage?.() ||
    window.open(chrome.runtime.getURL('settings.html'), '_blank')
})

inputForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const text = messageInput.value.trim()
  if (!text || isStreaming) return

  messageInput.value = ''
  messages.push({ role: 'user', content: text })
  renderMessages()

  isStreaming = true
  sendBtn.textContent = '...'
  sendBtn.disabled = true

  const assistantMsg = { role: 'assistant', content: '' }
  messages.push(assistantMsg)
  renderMessages()

  try {
    const settings = await getSettings()

    if (settings.mode === 'local') {
      await executeLocal(settings, text, assistantMsg)
    } else {
      await executeAnthropic(settings, assistantMsg)
    }
  } catch (err) {
    assistantMsg.content = `Error: ${err.message}`
    renderMessages()
  } finally {
    isStreaming = false
    sendBtn.textContent = 'Send'
    sendBtn.disabled = false
    messageInput.focus()
  }
})

async function executeAnthropic(settings, assistantMsg) {
  if (!settings.apiKey) {
    throw new Error('No API key. Click the gear icon to configure.')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      stream: true,
      messages: messages.slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API ${response.status}: ${error.slice(0, 200)}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6)
      if (data === '[DONE]') return

      try {
        const event = JSON.parse(data)
        if (event.type === 'content_block_delta' && event.delta?.text) {
          assistantMsg.content += event.delta.text
          renderMessages()
        }
      } catch {}
    }
  }
}

async function executeLocal(settings, text, assistantMsg) {
  const url = settings.serverUrl || 'http://localhost:3939'

  const response = await fetch(`${url}/api/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: text }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Server ${response.status}: ${error.slice(0, 200)}`)
  }

  const result = await response.json()
  assistantMsg.content = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
  renderMessages()
}

function renderMessages() {
  if (messages.length === 0) {
    messagesEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-logo">0n</div>
        <p>Describe a task to execute</p>
        <p class="sub">545 tools &middot; 26 services</p>
      </div>
    `
    return
  }

  messagesEl.innerHTML = messages
    .map((m) => {
      const escaped = m.content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      return `<div class="message ${m.role}">${escaped || '...'}</div>`
    })
    .join('')

  messagesEl.scrollTop = messagesEl.scrollHeight
}

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      { mode: 'anthropic', apiKey: '', serverUrl: 'http://localhost:3939' },
      resolve
    )
  })
}
