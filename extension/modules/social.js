// 0n for Chrome — Social Poster Module
// Posts to LinkedIn, Reddit, Dev.to from the extension

const API_BASE = 'https://0nmcp.com/api/extension/execute'

export async function postToSocial(token, { content, platforms, hashtags }) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      module: 'social-poster',
      action: 'post',
      data: { content, platforms, hashtags },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || 'Post failed')
  }

  return res.json()
}

export function createSocialPostUI(container, token, pageContext) {
  container.innerHTML = `
    <div class="module-social">
      <h3 class="module-title">Share to Social</h3>
      <textarea id="socialContent" class="module-textarea" placeholder="Write your post..." rows="4">${pageContext?.title ? `Check out: ${pageContext.title}\n${pageContext.url || ''}` : ''}</textarea>

      <div class="platform-toggles">
        <label class="platform-toggle">
          <input type="checkbox" value="linkedin" checked>
          <span class="platform-name">LinkedIn</span>
        </label>
        <label class="platform-toggle">
          <input type="checkbox" value="reddit">
          <span class="platform-name">Reddit</span>
        </label>
        <label class="platform-toggle">
          <input type="checkbox" value="dev_to">
          <span class="platform-name">Dev.to</span>
        </label>
      </div>

      <input type="text" id="socialHashtags" class="module-input" placeholder="Hashtags (comma-separated)">

      <button id="socialPostBtn" class="module-btn">Post Now</button>
      <div id="socialStatus" class="module-status hidden"></div>
    </div>
  `

  const postBtn = container.querySelector('#socialPostBtn')
  const statusEl = container.querySelector('#socialStatus')

  postBtn.addEventListener('click', async () => {
    const content = container.querySelector('#socialContent').value.trim()
    if (!content) return

    const platforms = Array.from(container.querySelectorAll('.platform-toggle input:checked')).map(
      (el) => el.value
    )
    if (platforms.length === 0) {
      statusEl.textContent = 'Select at least one platform'
      statusEl.className = 'module-status error'
      return
    }

    const hashtags = container
      .querySelector('#socialHashtags')
      .value.split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    postBtn.disabled = true
    postBtn.textContent = 'Posting...'
    statusEl.className = 'module-status hidden'

    try {
      const result = await postToSocial(token, { content, platforms, hashtags })
      const successes = result.results?.filter((r) => r.success) || []
      const failures = result.results?.filter((r) => !r.success) || []

      let msg = ''
      if (successes.length) msg += `Posted to ${successes.map((r) => r.platform).join(', ')}`
      if (failures.length) msg += `${msg ? '. ' : ''}Failed: ${failures.map((r) => `${r.platform} (${r.error})`).join(', ')}`

      statusEl.textContent = msg
      statusEl.className = `module-status ${successes.length ? 'success' : 'error'}`
    } catch (err) {
      statusEl.textContent = err.message
      statusEl.className = 'module-status error'
    } finally {
      postBtn.disabled = false
      postBtn.textContent = 'Post Now'
    }
  })
}
