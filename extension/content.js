// 0nMCP Content Script — Floating action button + text selection

;(function() {
  // Don't run on extension pages or chrome:// pages
  if (window.location.protocol === 'chrome-extension:' || window.location.protocol === 'chrome:') return

  // Create floating button
  const fab = document.createElement('div')
  fab.id = '0nmcp-fab'
  fab.innerHTML = `<span class="fab-text">0n</span>`
  fab.title = 'Open 0nMCP Side Panel'
  document.body.appendChild(fab)

  // Click to open side panel
  fab.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' })
  })

  // Draggable
  let isDragging = false
  let dragOffsetX = 0
  let dragOffsetY = 0
  let hasMoved = false

  fab.addEventListener('mousedown', (e) => {
    isDragging = true
    hasMoved = false
    dragOffsetX = e.clientX - fab.getBoundingClientRect().left
    dragOffsetY = e.clientY - fab.getBoundingClientRect().top
    fab.style.transition = 'none'
    e.preventDefault()
  })

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    hasMoved = true
    const x = e.clientX - dragOffsetX
    const y = e.clientY - dragOffsetY
    fab.style.right = 'auto'
    fab.style.bottom = 'auto'
    fab.style.left = Math.max(0, Math.min(x, window.innerWidth - 44)) + 'px'
    fab.style.top = Math.max(0, Math.min(y, window.innerHeight - 44)) + 'px'
  })

  document.addEventListener('mouseup', () => {
    if (!isDragging) return
    isDragging = false
    fab.style.transition = 'all 0.2s'
    if (hasMoved) {
      // Save position
      chrome.storage.local.set({
        fabPosition: {
          left: fab.style.left,
          top: fab.style.top
        }
      })
    }
  })

  // Restore position
  chrome.storage.local.get('fabPosition', ({ fabPosition }) => {
    if (fabPosition) {
      fab.style.right = 'auto'
      fab.style.bottom = 'auto'
      fab.style.left = fabPosition.left
      fab.style.top = fabPosition.top
    }
  })

  // Text selection — show mini action bar
  let selectionBar = null

  document.addEventListener('mouseup', (e) => {
    // Ignore if we're dragging the fab
    if (hasMoved) return

    const selection = window.getSelection()
    const text = selection?.toString().trim()

    if (selectionBar) {
      selectionBar.remove()
      selectionBar = null
    }

    if (!text || text.length < 10) return

    // Don't show on our own elements
    if (e.target.closest('#0nmcp-fab, #0nmcp-selection-bar')) return

    selectionBar = document.createElement('div')
    selectionBar.id = '0nmcp-selection-bar'
    selectionBar.innerHTML = `
      <button data-action="summarize" title="Summarize">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      </button>
      <button data-action="reply" title="Draft reply">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
      </button>
      <button data-action="extract" title="Extract data">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
      </button>
      <button data-action="translate" title="Translate">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      </button>
    `

    // Position near selection
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    selectionBar.style.position = 'fixed'
    selectionBar.style.left = Math.min(rect.left, window.innerWidth - 180) + 'px'
    selectionBar.style.top = (rect.top - 44) + 'px'
    selectionBar.style.zIndex = '2147483647'
    document.body.appendChild(selectionBar)

    // Handle clicks
    selectionBar.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation()
        const action = btn.dataset.action
        const prompts = {
          summarize: `Summarize the following text concisely:\n\n${text}`,
          reply: `Draft a professional reply to the following:\n\n${text}`,
          extract: `Extract all structured data (names, emails, phones, addresses, dates, amounts) from the following text and return as JSON:\n\n${text}`,
          translate: `Translate the following text to English (or to Spanish if it's already English):\n\n${text}`
        }

        await chrome.storage.local.set({
          pendingAction: {
            prompt: prompts[action],
            label: action,
            source: window.location.href,
            timestamp: Date.now()
          }
        })

        chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' })
        if (selectionBar) { selectionBar.remove(); selectionBar = null }
      })
    })
  })

  // Click elsewhere to dismiss selection bar
  document.addEventListener('mousedown', (e) => {
    if (selectionBar && !e.target.closest('#0nmcp-selection-bar')) {
      selectionBar.remove()
      selectionBar = null
    }
  })

  // Listen for messages from background
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'TOGGLE_FAB') {
      fab.style.display = fab.style.display === 'none' ? 'flex' : 'none'
    }
  })
})()
