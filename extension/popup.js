// 0nMCP Popup v2.0 — Quick Action Launcher

const quickForm = document.getElementById('quickForm')
const quickInput = document.getElementById('quickInput')
const pageTitle = document.getElementById('pageTitle')

// Load page context
chrome.runtime.sendMessage({ type: 'GET_PAGE_CONTENT' }, (response) => {
  if (chrome.runtime.lastError || !response?.title) {
    pageTitle.textContent = 'No page detected'
    return
  }
  pageTitle.textContent = response.title.slice(0, 50) + (response.title.length > 50 ? '...' : '')
  window._pageContext = response
})

// Quick form — opens side panel with the prompt
quickForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const text = quickInput.value.trim()
  if (!text) return
  await sendToSidePanel(text, false)
})

// Action cards
document.querySelectorAll('.action-card').forEach(card => {
  card.addEventListener('click', async () => {
    const prompt = card.dataset.prompt
    const useContext = card.dataset.context === 'true'
    await sendToSidePanel(prompt, useContext)
  })
})

async function sendToSidePanel(prompt, includeContext) {
  // Build full prompt with context if requested
  let fullPrompt = prompt
  if (includeContext && window._pageContext) {
    const ctx = window._pageContext
    fullPrompt = `[Page: "${ctx.title}" — ${ctx.url}]\n${ctx.meta ? `Meta: ${ctx.meta}\n` : ''}${ctx.content ? `Content: ${ctx.content.slice(0, 2000)}\n` : ''}\n${prompt}`
  }

  // Store as pending action
  await chrome.storage.local.set({
    pendingAction: {
      prompt: fullPrompt,
      label: prompt.slice(0, 40),
      source: window._pageContext?.url || '',
      timestamp: Date.now()
    }
  })

  // Open side panel
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  try {
    await chrome.sidePanel.open({ tabId: tab.id })
    window.close() // Close popup after opening side panel
  } catch {
    // Side panel not available — show feedback
    quickInput.value = ''
    quickInput.placeholder = 'Side panel opened!'
    setTimeout(() => { quickInput.placeholder = 'Ask 0nMCP anything...' }, 2000)
  }
}

// Side panel button
document.getElementById('sidePanelBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  try {
    await chrome.sidePanel.open({ tabId: tab.id })
    window.close()
  } catch {}
})

// Settings button
document.getElementById('settingsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage?.() || window.open(chrome.runtime.getURL('settings.html'), '_blank')
})
