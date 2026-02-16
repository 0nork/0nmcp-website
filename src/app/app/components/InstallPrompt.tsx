'use client'

import { useState, useEffect, useRef } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [showBanner, setShowBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // Check if dismissed recently
    const dismissed = localStorage.getItem('0nmcp-install-dismissed')
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return

    // Detect iOS
    const ua = navigator.userAgent
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    setIsIOS(ios)

    if (ios) {
      // Show iOS manual install instructions
      setShowBanner(true)
      return
    }

    // Listen for beforeinstallprompt (Chrome/Edge/Samsung)
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e as BeforeInstallPromptEvent
      setShowBanner(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPromptRef.current) {
      await deferredPromptRef.current.prompt()
      const choice = await deferredPromptRef.current.userChoice
      if (choice.outcome === 'accepted') {
        setShowBanner(false)
      }
      deferredPromptRef.current = null
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    localStorage.setItem('0nmcp-install-dismissed', Date.now().toString())
  }

  if (!showBanner) return null

  return (
    <div className="install-banner">
      <p>
        {isIOS
          ? 'Tap Share \u2192 "Add to Home Screen" to install'
          : 'Install 0nMCP as an app'}
      </p>
      <div className="install-banner-actions">
        {!isIOS && (
          <button className="install-btn" onClick={handleInstall}>
            Install
          </button>
        )}
        <button className="dismiss-btn" onClick={handleDismiss}>
          {isIOS ? 'Got it' : 'Later'}
        </button>
      </div>
    </div>
  )
}
