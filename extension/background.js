// 0n for Chrome v3.0 — Background Service Worker
// Module-aware context menus with auth integration

const API_BASE = 'https://0nmcp.com/api/extension'

// ── Core Context Menus (always available) ────────────────────
function setupCoreMenus() {
  chrome.contextMenus.create({
    id: '0nmcp-parent',
    title: '0n for Chrome',
    contexts: ['selection', 'page', 'link', 'image']
  })

  chrome.contextMenus.create({
    id: '0nmcp-summarize',
    parentId: '0nmcp-parent',
    title: 'Summarize selected text',
    contexts: ['selection']
  })

  chrome.contextMenus.create({
    id: '0nmcp-reply',
    parentId: '0nmcp-parent',
    title: 'Draft a reply to this',
    contexts: ['selection']
  })

  chrome.contextMenus.create({
    id: '0nmcp-extract',
    parentId: '0nmcp-parent',
    title: 'Extract data from selection',
    contexts: ['selection']
  })

  chrome.contextMenus.create({
    id: '0nmcp-translate',
    parentId: '0nmcp-parent',
    title: 'Translate selected text',
    contexts: ['selection']
  })

  chrome.contextMenus.create({
    id: '0nmcp-sep1',
    parentId: '0nmcp-parent',
    type: 'separator',
    contexts: ['selection', 'page', 'link', 'image']
  })

  chrome.contextMenus.create({
    id: '0nmcp-scrape',
    parentId: '0nmcp-parent',
    title: 'Scrape this page',
    contexts: ['page']
  })

  chrome.contextMenus.create({
    id: '0nmcp-analyze',
    parentId: '0nmcp-parent',
    title: 'Analyze this page',
    contexts: ['page']
  })

  chrome.contextMenus.create({
    id: '0nmcp-describe-image',
    parentId: '0nmcp-parent',
    title: 'Describe this image',
    contexts: ['image']
  })

  chrome.contextMenus.create({
    id: '0nmcp-open-link',
    parentId: '0nmcp-parent',
    title: 'Analyze linked page',
    contexts: ['link']
  })
}

// ── Module Context Menus (added based on enabled modules) ────
async function setupModuleMenus() {
  const { authToken, enabledModules } = await chrome.storage.sync.get(['authToken', 'enabledModules'])
  if (!authToken || !enabledModules) return

  const modules = enabledModules || []

  // Separator before modules
  if (modules.length > 0) {
    chrome.contextMenus.create({
      id: '0nmcp-sep-modules',
      parentId: '0nmcp-parent',
      type: 'separator',
      contexts: ['selection', 'page']
    })
  }

  // Social Poster menus
  if (modules.includes('social-poster')) {
    chrome.contextMenus.create({
      id: '0nmcp-share-linkedin',
      parentId: '0nmcp-parent',
      title: 'Share to LinkedIn',
      contexts: ['selection', 'page']
    })
    chrome.contextMenus.create({
      id: '0nmcp-share-reddit',
      parentId: '0nmcp-parent',
      title: 'Share to Reddit',
      contexts: ['selection', 'page']
    })
    chrome.contextMenus.create({
      id: '0nmcp-share-devto',
      parentId: '0nmcp-parent',
      title: 'Share to Dev.to',
      contexts: ['selection', 'page']
    })
  }

  // Content Writer menus
  if (modules.includes('content-writer')) {
    chrome.contextMenus.create({
      id: '0nmcp-write-post',
      parentId: '0nmcp-parent',
      title: 'Generate post from this page',
      contexts: ['page']
    })
    chrome.contextMenus.create({
      id: '0nmcp-write-from-selection',
      parentId: '0nmcp-parent',
      title: 'Generate post from selection',
      contexts: ['selection']
    })
  }

  // CRM Bridge menus
  if (modules.includes('crm-bridge')) {
    chrome.contextMenus.create({
      id: '0nmcp-crm-contact',
      parentId: '0nmcp-parent',
      title: 'Create CRM contact from page',
      contexts: ['page']
    })
    chrome.contextMenus.create({
      id: '0nmcp-crm-note',
      parentId: '0nmcp-parent',
      title: 'Send to CRM as note',
      contexts: ['selection']
    })
  }

  // SEO Analyzer menus
  if (modules.includes('seo-analyzer')) {
    chrome.contextMenus.create({
      id: '0nmcp-seo-audit',
      parentId: '0nmcp-parent',
      title: 'SEO audit this page',
      contexts: ['page']
    })
  }
}

// ── Install / Update Handler ──────────────────────────────────
chrome.runtime.onInstalled.addListener(async () => {
  chrome.action.setBadgeBackgroundColor({ color: '#7ed957' })

  // Build menus
  await chrome.contextMenus.removeAll()
  setupCoreMenus()
  await setupModuleMenus()

  console.log('0n for Chrome v3.0 installed — context menus registered')
})

// ── Rebuild menus when modules change ─────────────────────────
chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === 'sync' && (changes.enabledModules || changes.authToken)) {
    await chrome.contextMenus.removeAll()
    setupCoreMenus()
    await setupModuleMenus()
  }
})

// ── Fetch modules on startup ──────────────────────────────────
async function refreshModules() {
  const { authToken } = await chrome.storage.sync.get('authToken')
  if (!authToken) return

  try {
    const res = await fetch(`${API_BASE}/modules`, {
      headers: { Authorization: `Bearer ${authToken}` }
    })

    if (!res.ok) {
      if (res.status === 401) {
        // Token invalid — clear auth
        await chrome.storage.sync.remove(['authToken', 'authUser', 'enabledModules', 'allModules'])
      }
      return
    }

    const data = await res.json()
    const enabled = (data.modules || []).filter(m => m.enabled).map(m => m.id)
    const all = data.modules || []

    await chrome.storage.sync.set({ enabledModules: enabled, allModules: all })
  } catch (err) {
    console.log('Failed to refresh modules:', err.message)
  }
}

// Refresh on startup
refreshModules()

// Refresh periodically (every 30 min)
setInterval(refreshModules, 30 * 60 * 1000)

// ── Context Menu Click Handler ────────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  // Core action prompts
  const coreActions = {
    '0nmcp-summarize': {
      prompt: `Summarize the following text concisely:\n\n${info.selectionText}`,
      label: 'Summarize'
    },
    '0nmcp-reply': {
      prompt: `Draft a professional reply to the following:\n\n${info.selectionText}`,
      label: 'Draft Reply'
    },
    '0nmcp-extract': {
      prompt: `Extract all structured data (names, emails, phones, addresses, dates, amounts) from the following text and return as JSON:\n\n${info.selectionText}`,
      label: 'Extract Data'
    },
    '0nmcp-translate': {
      prompt: `Translate the following text to English (or to Spanish if it's already in English):\n\n${info.selectionText}`,
      label: 'Translate'
    },
    '0nmcp-scrape': {
      prompt: `Scrape and summarize the content from this page: ${tab?.url}. Extract the key information, main points, and any contact details.`,
      label: 'Scrape Page'
    },
    '0nmcp-analyze': {
      prompt: `Analyze this webpage (${tab?.url}) titled "${tab?.title}". What is this page about? What are the key takeaways?`,
      label: 'Analyze Page'
    },
    '0nmcp-describe-image': {
      prompt: `The user right-clicked an image with src: ${info.srcUrl}. Describe what you can infer about this image from the URL and context of the page: ${tab?.url}`,
      label: 'Describe Image'
    },
    '0nmcp-open-link': {
      prompt: `Analyze the linked resource: ${info.linkUrl}. What can you tell about this link from the URL structure and context of the source page: ${tab?.url}?`,
      label: 'Analyze Link'
    }
  }

  // Module action mapping — these go to the execute API
  const moduleActions = {
    '0nmcp-share-linkedin': { module: 'social-poster', action: 'share', platform: 'linkedin' },
    '0nmcp-share-reddit': { module: 'social-poster', action: 'share', platform: 'reddit' },
    '0nmcp-share-devto': { module: 'social-poster', action: 'share', platform: 'dev_to' },
    '0nmcp-write-post': { module: 'content-writer', action: 'generate', platform: 'linkedin' },
    '0nmcp-write-from-selection': { module: 'content-writer', action: 'generate', platform: 'linkedin' },
    '0nmcp-crm-contact': { module: 'crm-bridge', action: 'create_contact' },
    '0nmcp-crm-note': { module: 'crm-bridge', action: 'add_note' },
    '0nmcp-seo-audit': { module: 'seo-analyzer', action: 'analyze' },
  }

  const coreAction = coreActions[info.menuItemId]
  if (coreAction) {
    await chrome.storage.local.set({
      pendingAction: {
        prompt: coreAction.prompt,
        label: coreAction.label,
        source: tab?.url || '',
        timestamp: Date.now()
      }
    })
    chrome.action.setBadgeText({ text: '1' })
    try {
      await chrome.sidePanel.open({ tabId: tab.id })
    } catch {
      console.log('Side panel not available, action stored for popup')
    }
    return
  }

  const modAction = moduleActions[info.menuItemId]
  if (modAction) {
    // For module actions, open side panel with module context
    await chrome.storage.local.set({
      pendingAction: {
        type: 'module',
        module: modAction.module,
        action: modAction.action,
        platform: modAction.platform,
        selectionText: info.selectionText || '',
        source: tab?.url || '',
        pageTitle: tab?.title || '',
        timestamp: Date.now()
      }
    })
    chrome.action.setBadgeText({ text: '1' })
    try {
      await chrome.sidePanel.open({ tabId: tab.id })
    } catch {
      console.log('Side panel not available')
    }
    return
  }
})

// ── Keyboard Shortcut Handler ─────────────────────────────────
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'open_side_panel') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab) {
      try {
        await chrome.sidePanel.open({ tabId: tab.id })
      } catch {
        console.log('Side panel not available')
      }
    }
  }
})

// ── Message Handler ───────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_PAGE_CONTENT') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs[0]) {
        sendResponse({ title: '', url: '', content: '' })
        return
      }

      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            const title = document.title
            const url = window.location.href
            const meta = document.querySelector('meta[name="description"]')?.content || ''
            const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent?.trim()).filter(Boolean).slice(0, 20)
            const body = document.body.innerText.slice(0, 3000)
            return { title, url, meta, headings, content: body }
          }
        })
        sendResponse(results[0]?.result || { title: '', url: '', content: '' })
      } catch {
        sendResponse({ title: tabs[0].title || '', url: tabs[0].url || '', content: '' })
      }
    })
    return true
  }

  if (message.type === 'CLEAR_BADGE') {
    chrome.action.setBadgeText({ text: '' })
    sendResponse({ ok: true })
  }

  if (message.type === 'UPDATE_BADGE') {
    chrome.action.setBadgeText({ text: message.text || '' })
    sendResponse({ ok: true })
  }

  if (message.type === 'OPEN_SIDE_PANEL') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        try {
          await chrome.sidePanel.open({ tabId: tabs[0].id })
        } catch {
          console.log('Side panel not available')
        }
      }
    })
    sendResponse({ ok: true })
    return true
  }

  if (message.type === 'REFRESH_MODULES') {
    refreshModules().then(() => sendResponse({ ok: true }))
    return true
  }
})
