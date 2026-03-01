// 0n for Chrome — Content Writer Module
// AI-generates platform-specific posts from page content

const API_BASE = 'https://0nmcp.com/api/extension/execute'

export async function generateContent(token, platform, pageContext) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      module: 'content-writer',
      action: 'generate',
      data: {
        platform,
        pageContent: pageContext?.content || '',
        pageTitle: pageContext?.title || '',
        pageUrl: pageContext?.url || '',
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    if (err.upgrade) throw new Error('MODULE_LOCKED')
    throw new Error(err.error || 'Generation failed')
  }

  return res.json()
}

export function createWriterUI(container, token, pageContext) {
  container.innerHTML = `
    <div class="module-writer">
      <h3 class="module-title">Content Writer</h3>
      <p class="module-desc">AI-generate a post from the current page.</p>

      <div class="writer-platforms">
        <button class="writer-platform-btn active" data-platform="linkedin">LinkedIn</button>
        <button class="writer-platform-btn" data-platform="reddit">Reddit</button>
        <button class="writer-platform-btn" data-platform="dev_to">Dev.to</button>
        <button class="writer-platform-btn" data-platform="twitter">Twitter</button>
      </div>

      <button id="generateBtn" class="module-btn">Generate Post</button>

      <div id="writerResult" class="module-result hidden">
        <div class="result-header">
          <span>Generated Content</span>
          <button id="copyGenerated" class="copy-btn">Copy</button>
        </div>
        <div id="writerOutput" class="result-output writer-output"></div>
      </div>

      <div id="writerStatus" class="module-status hidden"></div>
    </div>
  `

  let selectedPlatform = 'linkedin'

  container.querySelectorAll('.writer-platform-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.writer-platform-btn').forEach((b) => b.classList.remove('active'))
      btn.classList.add('active')
      selectedPlatform = btn.dataset.platform
    })
  })

  const generateBtn = container.querySelector('#generateBtn')
  const resultEl = container.querySelector('#writerResult')
  const outputEl = container.querySelector('#writerOutput')
  const statusEl = container.querySelector('#writerStatus')
  const copyBtn = container.querySelector('#copyGenerated')

  generateBtn.addEventListener('click', async () => {
    generateBtn.disabled = true
    generateBtn.textContent = 'Generating...'
    statusEl.className = 'module-status hidden'
    resultEl.className = 'module-result hidden'

    try {
      const result = await generateContent(token, selectedPlatform, pageContext)
      outputEl.textContent = result.content || 'No content generated'
      resultEl.className = 'module-result'
    } catch (err) {
      if (err.message === 'MODULE_LOCKED') {
        statusEl.textContent = 'Content Writer requires a subscription. Get it in the Store.'
        statusEl.className = 'module-status locked'
      } else {
        statusEl.textContent = err.message
        statusEl.className = 'module-status error'
      }
    } finally {
      generateBtn.disabled = false
      generateBtn.textContent = 'Generate Post'
    }
  })

  copyBtn?.addEventListener('click', () => {
    navigator.clipboard.writeText(outputEl.textContent)
    copyBtn.textContent = 'Copied!'
    setTimeout(() => { copyBtn.textContent = 'Copy' }, 1500)
  })
}
