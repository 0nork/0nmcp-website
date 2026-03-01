// 0n for Chrome — Page Scraper Module
// Extracts structured data from any page

const API_BASE = 'https://0nmcp.com/api/extension/execute'

export async function scrapePage(token, action, pageContext) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      module: 'page-scraper',
      action,
      data: {
        pageContent: pageContext?.content || '',
        pageTitle: pageContext?.title || '',
        pageUrl: pageContext?.url || '',
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || 'Scrape failed')
  }

  return res.json()
}

export function createScraperUI(container, token, pageContext) {
  container.innerHTML = `
    <div class="module-scraper">
      <h3 class="module-title">Page Scraper</h3>
      <p class="module-desc">Extract structured data from the current page.</p>

      <div class="scraper-actions">
        <button class="scraper-btn" data-action="contacts">
          <span class="scraper-icon">&#128100;</span>
          Contacts
        </button>
        <button class="scraper-btn" data-action="structured">
          <span class="scraper-icon">&#128196;</span>
          All Data
        </button>
        <button class="scraper-btn" data-action="prices">
          <span class="scraper-icon">&#128176;</span>
          Prices
        </button>
        <button class="scraper-btn" data-action="links">
          <span class="scraper-icon">&#128279;</span>
          Links
        </button>
      </div>

      <div id="scraperResult" class="module-result hidden">
        <div class="result-header">
          <span>Results</span>
          <button id="copyResult" class="copy-btn">Copy</button>
        </div>
        <pre id="scraperOutput" class="result-output"></pre>
      </div>

      <div id="scraperStatus" class="module-status hidden"></div>
    </div>
  `

  const resultEl = container.querySelector('#scraperResult')
  const outputEl = container.querySelector('#scraperOutput')
  const statusEl = container.querySelector('#scraperStatus')
  const copyBtn = container.querySelector('#copyResult')

  container.querySelectorAll('.scraper-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.action
      btn.disabled = true
      btn.textContent = 'Extracting...'
      statusEl.className = 'module-status hidden'
      resultEl.className = 'module-result hidden'

      try {
        const result = await scrapePage(token, action, pageContext)
        const display = result.data
          ? JSON.stringify(result.data, null, 2)
          : result.raw || 'No data extracted'

        outputEl.textContent = display
        resultEl.className = 'module-result'
      } catch (err) {
        statusEl.textContent = err.message
        statusEl.className = 'module-status error'
      } finally {
        btn.disabled = false
        btn.textContent = btn.querySelector('.scraper-icon')
          ? btn.innerHTML
          : action.charAt(0).toUpperCase() + action.slice(1)
        // Restore button content
        const labels = { contacts: 'Contacts', structured: 'All Data', prices: 'Prices', links: 'Links' }
        const icons = { contacts: '&#128100;', structured: '&#128196;', prices: '&#128176;', links: '&#128279;' }
        btn.innerHTML = `<span class="scraper-icon">${icons[action]}</span>${labels[action]}`
        btn.disabled = false
      }
    })
  })

  copyBtn?.addEventListener('click', () => {
    navigator.clipboard.writeText(outputEl.textContent)
    copyBtn.textContent = 'Copied!'
    setTimeout(() => { copyBtn.textContent = 'Copy' }, 1500)
  })
}
