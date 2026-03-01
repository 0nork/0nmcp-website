// 0n for Chrome v3.0 — Quick Action Launcher with Module Awareness

const quickForm = document.getElementById('quickForm')
const quickInput = document.getElementById('quickInput')
const pageTitle = document.getElementById('pageTitle')
const authBar = document.getElementById('authBar')
const authName = document.getElementById('authName')
const moduleGrid = document.getElementById('moduleGrid')

// ── Load auth status ──
chrome.storage.sync.get(['authToken', 'authUser', 'allModules', 'enabledModules'], (data) => {
  if (data.authToken && data.authUser) {
    authBar.classList.remove('hidden')
    authName.textContent = data.authUser.name || 'Connected'
  }

  // Show module quick actions if authed
  if (data.authToken && data.allModules?.length) {
    const enabled = new Set(data.enabledModules || [])
    moduleGrid.classList.remove('hidden')
    moduleGrid.innerHTML = data.allModules.map(mod => {
      const isEnabled = enabled.has(mod.id)
      return `
        <button class="module-card ${isEnabled ? '' : 'locked'}" data-module="${mod.id}" ${isEnabled ? '' : 'disabled'}>
          <span class="module-name">${mod.name}</span>
          <span class="module-status-badge">${isEnabled ? 'Active' : mod.free ? 'Active' : 'Locked'}</span>
        </button>
      `
    }).join('')
  }
})

// ── Load page context ──
chrome.runtime.sendMessage({ type: 'GET_PAGE_CONTENT' }, (response) => {
  if (chrome.runtime.lastError || !response?.title) {
    pageTitle.textContent = 'No page detected'
    return
  }
  pageTitle.textContent = response.title.slice(0, 50) + (response.title.length > 50 ? '...' : '')
  window._pageContext = response
})

// ── Quick form ──
quickForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const text = quickInput.value.trim()
  if (!text) return
  await sendToSidePanel(text, false)
})

// ── Action cards ──
document.querySelectorAll('.action-card').forEach(card => {
  card.addEventListener('click', async () => {
    const prompt = card.dataset.prompt
    const useContext = card.dataset.context === 'true'
    await sendToSidePanel(prompt, useContext)
  })
})

async function sendToSidePanel(prompt, includeContext) {
  let fullPrompt = prompt
  if (includeContext && window._pageContext) {
    const ctx = window._pageContext
    fullPrompt = `[Page: "${ctx.title}" — ${ctx.url}]\n${ctx.meta ? `Meta: ${ctx.meta}\n` : ''}${ctx.content ? `Content: ${ctx.content.slice(0, 2000)}\n` : ''}\n${prompt}`
  }

  await chrome.storage.local.set({
    pendingAction: {
      prompt: fullPrompt,
      label: prompt.slice(0, 40),
      source: window._pageContext?.url || '',
      timestamp: Date.now()
    }
  })

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  try {
    await chrome.sidePanel.open({ tabId: tab.id })
    window.close()
  } catch {
    quickInput.value = ''
    quickInput.placeholder = 'Side panel opened!'
    setTimeout(() => { quickInput.placeholder = 'Ask 0nMCP anything...' }, 2000)
  }
}

// ── Side panel button ──
document.getElementById('sidePanelBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  try {
    await chrome.sidePanel.open({ tabId: tab.id })
    window.close()
  } catch {}
})

// ── Settings button ──
document.getElementById('settingsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage?.() || window.open(chrome.runtime.getURL('settings.html'), '_blank')
})
