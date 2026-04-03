'use client'

import { useEffect } from 'react'

/**
 * 0nMCP Console — Copy Code Button Injector
 *
 * Injects a "Copy Code" button into every <pre> tag in .blog-article.
 * This is a client component that runs after hydration.
 * Part of the 0n brand standard — all code blocks get the console treatment.
 */
export default function CodeCopyInit() {
  useEffect(() => {
    const pres = document.querySelectorAll<HTMLPreElement>('.blog-article pre')
    pres.forEach((pre) => {
      if (pre.querySelector('.on-copy-code-btn')) return

      const btn = document.createElement('button')
      btn.className = 'on-copy-code-btn'
      btn.textContent = 'Copy Code'
      btn.setAttribute('aria-label', 'Copy code to clipboard')

      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const code = pre.querySelector('code')
        if (!code) return
        navigator.clipboard.writeText(code.textContent || '').then(() => {
          btn.textContent = 'Copied!'
          btn.classList.add('copied')
          setTimeout(() => {
            btn.textContent = 'Copy Code'
            btn.classList.remove('copied')
          }, 2000)
        })
      })

      pre.style.position = 'relative'
      pre.appendChild(btn)
    })
  }, [])

  return null
}
