// 0nMCP Chrome Extension v2.0 — Background Service Worker

// ── Context Menu Setup ──────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  // Parent menu
  chrome.contextMenus.create({
    id: '0nmcp-parent',
    title: '0nMCP',
    contexts: ['selection', 'page', 'link', 'image']
  })

  // Selection actions
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
    id: '0nmcp-send-crm',
    parentId: '0nmcp-parent',
    title: 'Send to CRM as note',
    contexts: ['selection']
  })

  // Separator
  chrome.contextMenus.create({
    id: '0nmcp-sep1',
    parentId: '0nmcp-parent',
    type: 'separator',
    contexts: ['selection', 'page', 'link', 'image']
  })

  // Page actions
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

  // Image
  chrome.contextMenus.create({
    id: '0nmcp-describe-image',
    parentId: '0nmcp-parent',
    title: 'Describe this image',
    contexts: ['image']
  })

  // Link
  chrome.contextMenus.create({
    id: '0nmcp-open-link',
    parentId: '0nmcp-parent',
    title: 'Analyze linked page',
    contexts: ['link']
  })

  // Initialize badge
  chrome.action.setBadgeBackgroundColor({ color: '#00ff88' })

  console.log('0nMCP v2.0 installed — context menus registered')
})

// ── Context Menu Click Handler ──────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const actionMap = {
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
    '0nmcp-send-crm': {
      prompt: `Format the following as a CRM contact note with key details highlighted:\n\n${info.selectionText}`,
      label: 'CRM Note'
    },
    '0nmcp-scrape': {
      prompt: `Scrape and summarize the content from this page: ${tab?.url}. Extract the key information, main points, and any contact details.`,
      label: 'Scrape Page'
    },
    '0nmcp-analyze': {
      prompt: `Analyze this webpage (${tab?.url}) titled "${tab?.title}". What is this page about? What are the key takeaways? Is there anything notable about the structure or content?`,
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

  const action = actionMap[info.menuItemId]
  if (!action) return

  // Store the pending action and open side panel
  await chrome.storage.local.set({
    pendingAction: {
      prompt: action.prompt,
      label: action.label,
      source: tab?.url || '',
      timestamp: Date.now()
    }
  })

  // Update badge to show pending action
  chrome.action.setBadgeText({ text: '1' })

  // Open side panel
  try {
    await chrome.sidePanel.open({ tabId: tab.id })
  } catch {
    // Side panel might not be supported, fall back to notification
    console.log('Side panel not available, action stored for popup')
  }
})

// ── Keyboard Shortcut Handler ───────────────────────────────
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

// ── Message Handler (from popup/sidepanel/content) ──────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_PAGE_CONTENT') {
    // Get content from active tab
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
            // Get visible text, limited to ~3000 chars
            const body = document.body.innerText.slice(0, 3000)
            return { title, url, meta, content: body }
          }
        })
        sendResponse(results[0]?.result || { title: '', url: '', content: '' })
      } catch {
        sendResponse({ title: tabs[0].title || '', url: tabs[0].url || '', content: '' })
      }
    })
    return true // async response
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
})
