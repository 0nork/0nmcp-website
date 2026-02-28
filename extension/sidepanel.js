// 0nMCP Side Panel v2.0 — Full AI Workspace

const SYSTEM_PROMPT = `You are 0nMCP, a universal AI API orchestrator with 819 tools across 48 services in 21 categories. You help users manage workflows, execute tasks, and connect services. You speak concisely and helpfully. When users describe tasks, suggest which 0nMCP tools and services could accomplish them. Keep responses focused and actionable. Format responses with markdown when helpful.`

// ── DOM Elements ────────────────────────────────────────────
const messagesEl = document.getElementById('messages')
const inputForm = document.getElementById('inputForm')
const messageInput = document.getElementById('messageInput')
const sendBtn = document.getElementById('sendBtn')
const contextBar = document.getElementById('contextBar')
const contextText = document.getElementById('contextText')
const contextUseBtn = document.getElementById('contextUseBtn')
const inputContextTag = document.getElementById('inputContextTag')
const removeContextBtn = document.getElementById('removeContext')
const historyBtn = document.getElementById('historyBtn')
const savedBtn = document.getElementById('savedBtn')
const settingsBtn = document.getElementById('settingsBtn')
const historyOverlay = document.getElementById('historyOverlay')
const savedOverlay = document.getElementById('savedOverlay')
const historyClose = document.getElementById('historyClose')
const savedClose = document.getElementById('savedClose')
const historyList = document.getElementById('historyList')
const savedList = document.getElementById('savedList')
const newPromptInput = document.getElementById('newPromptInput')
const addPromptBtn = document.getElementById('addPromptBtn')
const savePromptBtn = document.getElementById('savePromptBtn')

// ── State ───────────────────────────────────────────────────
let messages = []
let isStreaming = false
let pageContext = null
let usePageContext = false
let conversationId = Date.now().toString(36)

// ── Init ────────────────────────────────────────────────────
async function init() {
  // Load page context
  loadPageContext()

  // Check for pending action from context menu
  const { pendingAction } = await chrome.storage.local.get('pendingAction')
  if (pendingAction && Date.now() - pendingAction.timestamp < 30000) {
    await chrome.storage.local.remove('pendingAction')
    chrome.runtime.sendMessage({ type: 'CLEAR_BADGE' })
    // Auto-submit the pending action
    messageInput.value = pendingAction.prompt
    handleSubmit(pendingAction.prompt)
  }

  // Load conversation from storage
  const { currentConversation } = await chrome.storage.local.get('currentConversation')
  if (currentConversation && currentConversation.messages?.length > 0) {
    messages = currentConversation.messages
    conversationId = currentConversation.id || conversationId
    renderMessages()
  }
}

function loadPageContext() {
  chrome.runtime.sendMessage({ type: 'GET_PAGE_CONTENT' }, (response) => {
    if (chrome.runtime.lastError || !response) {
      contextText.textContent = 'No page context available'
      return
    }
    pageContext = response
    if (response.title) {
      contextText.textContent = response.title.slice(0, 60) + (response.title.length > 60 ? '...' : '')
      contextBar.classList.add('has-context')
    }
  })
}

// ── Page Context Toggle ─────────────────────────────────────
contextUseBtn.addEventListener('click', () => {
  if (!pageContext) return
  usePageContext = !usePageContext
  inputContextTag.classList.toggle('hidden', !usePageContext)
  contextUseBtn.textContent = usePageContext ? '- Remove' : '+ Use'
  contextUseBtn.classList.toggle('active', usePageContext)
})

removeContextBtn.addEventListener('click', () => {
  usePageContext = false
  inputContextTag.classList.add('hidden')
  contextUseBtn.textContent = '+ Use'
  contextUseBtn.classList.remove('active')
})

// ── Overlays ────────────────────────────────────────────────
historyBtn.addEventListener('click', () => { loadHistory(); historyOverlay.classList.remove('hidden') })
savedBtn.addEventListener('click', () => { loadSavedPrompts(); savedOverlay.classList.remove('hidden') })
historyClose.addEventListener('click', () => historyOverlay.classList.add('hidden'))
savedClose.addEventListener('click', () => savedOverlay.classList.add('hidden'))
settingsBtn.addEventListener('click', () => {
  chrome.runtime.openOptionsPage?.() || window.open(chrome.runtime.getURL('settings.html'), '_blank')
})

// ── History ─────────────────────────────────────────────────
async function loadHistory() {
  const { chatHistory = [] } = await chrome.storage.local.get('chatHistory')

  if (chatHistory.length === 0) {
    historyList.innerHTML = '<div class="overlay-empty">No conversation history yet</div>'
    return
  }

  historyList.innerHTML = chatHistory.slice().reverse().map(conv => {
    const preview = conv.messages?.[0]?.content?.slice(0, 80) || 'Empty conversation'
    const date = new Date(conv.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    return `
      <button class="history-item" data-id="${conv.id}">
        <div class="history-preview">${escapeHtml(preview)}${preview.length >= 80 ? '...' : ''}</div>
        <div class="history-meta">${conv.messages?.length || 0} messages &middot; ${date}</div>
      </button>
    `
  }).join('')

  // Click to restore
  historyList.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', async () => {
      const id = el.dataset.id
      const conv = chatHistory.find(c => c.id === id)
      if (conv) {
        messages = conv.messages || []
        conversationId = conv.id
        renderMessages()
        historyOverlay.classList.add('hidden')
      }
    })
  })
}

// ── Saved Prompts ───────────────────────────────────────────
async function loadSavedPrompts() {
  const { savedPrompts = [] } = await chrome.storage.sync.get('savedPrompts')

  if (savedPrompts.length === 0) {
    savedList.innerHTML = '<div class="overlay-empty">No saved prompts yet. Save prompts you use often.</div>'
    return
  }

  savedList.innerHTML = savedPrompts.map((p, i) => `
    <div class="saved-item">
      <button class="saved-text" data-prompt="${escapeAttr(p)}">${escapeHtml(p)}</button>
      <button class="saved-delete" data-index="${i}">&times;</button>
    </div>
  `).join('')

  savedList.querySelectorAll('.saved-text').forEach(el => {
    el.addEventListener('click', () => {
      messageInput.value = el.dataset.prompt
      messageInput.focus()
      savedOverlay.classList.add('hidden')
    })
  })

  savedList.querySelectorAll('.saved-delete').forEach(el => {
    el.addEventListener('click', async () => {
      const idx = parseInt(el.dataset.index)
      savedPrompts.splice(idx, 1)
      await chrome.storage.sync.set({ savedPrompts })
      loadSavedPrompts()
    })
  })
}

addPromptBtn.addEventListener('click', async () => {
  const text = newPromptInput.value.trim()
  if (!text) return
  const { savedPrompts = [] } = await chrome.storage.sync.get('savedPrompts')
  savedPrompts.push(text)
  await chrome.storage.sync.set({ savedPrompts })
  newPromptInput.value = ''
  loadSavedPrompts()
})

savePromptBtn.addEventListener('click', async () => {
  const text = messageInput.value.trim()
  if (!text) return
  const { savedPrompts = [] } = await chrome.storage.sync.get('savedPrompts')
  if (!savedPrompts.includes(text)) {
    savedPrompts.push(text)
    await chrome.storage.sync.set({ savedPrompts })
  }
  savePromptBtn.classList.add('saved')
  setTimeout(() => savePromptBtn.classList.remove('saved'), 1500)
})

// ── Quick Actions ───────────────────────────────────────────
document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const prompt = btn.dataset.prompt
    // Auto-include page context for quick actions
    usePageContext = true
    inputContextTag.classList.remove('hidden')
    contextUseBtn.textContent = '- Remove'
    contextUseBtn.classList.add('active')
    handleSubmit(prompt)
  })
})

// ── Message Submission ──────────────────────────────────────
inputForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const text = messageInput.value.trim()
  if (!text || isStreaming) return
  handleSubmit(text)
})

// Auto-resize textarea
messageInput.addEventListener('input', () => {
  messageInput.style.height = 'auto'
  messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px'
})

// Shift+Enter for new line, Enter to send
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    inputForm.dispatchEvent(new Event('submit'))
  }
})

async function handleSubmit(text) {
  // Build the full prompt with context
  let fullPrompt = text
  if (usePageContext && pageContext) {
    fullPrompt = `[Page Context: "${pageContext.title}" — ${pageContext.url}]\n${pageContext.meta ? `Meta: ${pageContext.meta}\n` : ''}${pageContext.content ? `Content preview: ${pageContext.content.slice(0, 2000)}\n` : ''}\n${text}`
  }

  messageInput.value = ''
  messageInput.style.height = 'auto'

  messages.push({ role: 'user', content: text, fullPrompt })
  renderMessages()

  isStreaming = true
  sendBtn.disabled = true

  const assistantMsg = { role: 'assistant', content: '' }
  messages.push(assistantMsg)
  renderMessages()

  try {
    const settings = await getSettings()

    if (settings.mode === 'local') {
      await executeLocal(settings, fullPrompt, assistantMsg)
    } else if (settings.mode === 'anthropic' && settings.apiKey) {
      await executeAnthropic(settings, assistantMsg)
    } else {
      await executeServer(assistantMsg)
    }
  } catch (err) {
    assistantMsg.content = `Error: ${err.message}`
    renderMessages()
  } finally {
    isStreaming = false
    sendBtn.disabled = false
    messageInput.focus()
    saveConversation()
  }
}

// ── Execution Modes ─────────────────────────────────────────
async function executeServer(assistantMsg) {
  const apiMessages = messages.slice(0, -1).map(m => ({
    role: m.role,
    content: m.fullPrompt || m.content
  }))

  const response = await fetch('https://0nmcp.com/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: apiMessages })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
    throw new Error(err.error || `Server error: ${response.status}`)
  }

  await processStream(response, assistantMsg)
}

async function executeAnthropic(settings, assistantMsg) {
  const apiMessages = messages.slice(0, -1).map(m => ({
    role: m.role,
    content: m.fullPrompt || m.content
  }))

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
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      stream: true,
      messages: apiMessages,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`API ${response.status}: ${error.slice(0, 200)}`)
  }

  await processStream(response, assistantMsg)
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

async function processStream(response, assistantMsg) {
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

// ── Rendering ───────────────────────────────────────────────
function renderMessages() {
  if (messages.length === 0) {
    messagesEl.innerHTML = getEmptyStateHTML()
    bindQuickActions()
    return
  }

  messagesEl.innerHTML = messages.map((m, i) => {
    const content = m.content || (isStreaming && i === messages.length - 1 ? '<span class="streaming-dot"></span>' : '')
    const rendered = m.role === 'assistant' ? renderMarkdown(content) : escapeHtml(content)

    return `
      <div class="message ${m.role}">
        <div class="message-content">${rendered}</div>
        ${m.role === 'assistant' && m.content ? `
          <div class="message-actions">
            <button class="msg-action" data-action="copy" data-index="${i}" title="Copy">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
          </div>
        ` : ''}
      </div>
    `
  }).join('')

  messagesEl.scrollTop = messagesEl.scrollHeight

  // Copy button handlers
  messagesEl.querySelectorAll('[data-action="copy"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index)
      navigator.clipboard.writeText(messages[idx]?.content || '')
      btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
      setTimeout(() => {
        btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>'
      }, 1500)
    })
  })
}

function getEmptyStateHTML() {
  return `
    <div class="empty-state">
      <div class="empty-logo">0n</div>
      <p class="empty-title">AI Command Center</p>
      <p class="empty-sub">819 tools &middot; 48 services &middot; 21 categories</p>
      <div class="quick-actions">
        <button class="quick-btn" data-prompt="Summarize the current page"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> Summarize page</button>
        <button class="quick-btn" data-prompt="Extract all contact information (emails, phones, names, companies) from this page"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> Extract contacts</button>
        <button class="quick-btn" data-prompt="Draft a professional email based on the current page context"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> Draft email</button>
        <button class="quick-btn" data-prompt="Generate a social media post about the current page. Include hashtags."><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5"/></svg> Social post</button>
        <button class="quick-btn" data-prompt="Analyze this page for SEO: title tags, meta description, headings, keyword density, and recommendations"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> SEO analysis</button>
        <button class="quick-btn" data-prompt="Create a CRM contact record from any information on this page. Format as JSON with fields: name, email, phone, company, notes"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> CRM contact</button>
        <button class="quick-btn" data-prompt="Extract all links from this page and categorize them (navigation, external, social media, resources)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Extract links</button>
        <button class="quick-btn" data-prompt="Generate a competitive analysis comparing this page/product to alternatives in the market"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> Competitive analysis</button>
      </div>
    </div>
  `
}

function bindQuickActions() {
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      usePageContext = true
      inputContextTag.classList.remove('hidden')
      contextUseBtn.textContent = '- Remove'
      contextUseBtn.classList.add('active')
      handleSubmit(btn.dataset.prompt)
    })
  })
}

// ── Persistence ─────────────────────────────────────────────
async function saveConversation() {
  // Save current conversation
  await chrome.storage.local.set({
    currentConversation: {
      id: conversationId,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      timestamp: Date.now()
    }
  })

  // Save to history
  const { chatHistory = [] } = await chrome.storage.local.get('chatHistory')
  const existingIdx = chatHistory.findIndex(c => c.id === conversationId)
  const entry = {
    id: conversationId,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    timestamp: Date.now()
  }

  if (existingIdx >= 0) {
    chatHistory[existingIdx] = entry
  } else {
    chatHistory.push(entry)
  }

  // Keep last 50 conversations
  while (chatHistory.length > 50) chatHistory.shift()
  await chrome.storage.local.set({ chatHistory })
}

// ── Utilities ───────────────────────────────────────────────
function getSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get(
      { mode: 'server', apiKey: '', serverUrl: 'http://localhost:3939' },
      resolve
    )
  })
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function renderMarkdown(text) {
  if (!text) return ''
  // Simple markdown rendering
  let html = escapeHtml(text)
  // Code blocks
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  // Line breaks
  html = html.replace(/\n/g, '<br>')
  return html
}

// ── Start ───────────────────────────────────────────────────
init()
