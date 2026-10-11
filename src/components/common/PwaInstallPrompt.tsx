'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Download, X, Smartphone, Sparkles, Share2 } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // 1. Check if already installed / running in standalone mode
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true

    if (standalone) {
      setIsStandalone(true)
      return
    }

    // 2. Check if dismissed recently in this session
    const dismissed = sessionStorage.getItem('pwa_prompt_dismissed')
    if (dismissed === 'true') {
      return
    }

    // 3. Detect iOS Safari
    const ua = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(ua)
    const isSafari = /safari/.test(ua) && !/chrome|crios|fxios/.test(ua)
    if (isIosDevice && isSafari) {
      setIsIOS(true)
      // Show prompt after a slight delay
      const timer = setTimeout(() => setShowPrompt(true), 3500)
      return () => clearTimeout(timer)
    }

    // 4. Android / Chrome / Edge beforeinstallprompt handler
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Reveal prompt after 3 seconds for friendly UX
      setTimeout(() => setShowPrompt(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        setShowPrompt(false)
        setDeferredPrompt(null)
      }
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    sessionStorage.setItem('pwa_prompt_dismissed', 'true')
  }

  if (isStandalone || !showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-50 max-w-sm mx-auto md:mx-0 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="glass gradient-border rounded-2xl p-4 shadow-2xl border border-orange-500/30 bg-[#0d0d0f]/95 backdrop-blur-xl relative">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          title="Dismiss"
        >
          <X size={15} />
        </button>

        <div className="flex items-start gap-3.5 pr-6">
          {/* App Icon */}
          <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center font-display font-black text-white text-base shadow-lg shadow-orange-500/30 flex-shrink-0">
            AJ
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-white text-sm">Install AJ Bio App</h4>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-orange-500/20 text-orange-400 font-medium">
                PWA
              </span>
            </div>
            <p className="text-white/60 text-xs mt-0.5 leading-snug">
              {isIOS
                ? 'Tap Share ⎋ and then "Add to Home Screen" ⊞ for native app feel!'
                : 'Install to your phone home screen for offline access and native app speed!'}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-3.5 flex items-center gap-2">
          {isIOS ? (
            <div className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white/80 font-medium text-center">
              <Share2 size={13} className="text-orange-400" />
              <span>Tap Share ➔ Add to Home Screen</span>
            </div>
          ) : (
            <>
              <button
                onClick={handleInstallClick}
                className="flex-1 btn-primary text-xs py-2 px-3 justify-center shadow-lg shadow-orange-500/20 inline-flex items-center gap-1.5"
              >
                <Download size={13} />
                <span>Install App</span>
              </button>
              <button
                onClick={handleDismiss}
                className="btn-glass text-xs py-2 px-3 text-white/60 hover:text-white"
              >
                Not Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
