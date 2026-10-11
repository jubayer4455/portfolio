'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Check, Share2, QrCode } from 'lucide-react'

interface ShareProfileModalProps {
  isOpen: boolean
  onClose: () => void
  name: string
  tagline?: string
}

export default function ShareProfileModal({
  isOpen,
  onClose,
  name,
  tagline,
}: ShareProfileModalProps) {
  const [copied, setCopied] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.origin)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl || window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} — Official Social Hub`,
          text: tagline || `Connect with ${name} across all social media accounts`,
          url: currentUrl || window.location.href,
        })
      } catch {
        // user dismissed
      }
    } else {
      handleCopy()
    }
  }

  // Generate dynamic QR code image URL via clean public QR service
  const qrUrl = currentUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
        currentUrl
      )}&color=f97316&bgcolor=111111`
    : ''

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm glass gradient-border rounded-3xl p-6 sm:p-8 text-center z-10 shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full glass flex items-center justify-center text-white/50 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>

            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mx-auto mb-4">
              <QrCode size={24} />
            </div>

            <h3 className="text-xl font-bold font-display text-white mb-1">
              Share Profile
            </h3>
            <p className="text-white/40 text-xs mb-6 max-w-[260px] mx-auto">
              Scan with phone camera or copy link to add to your Instagram/TikTok bio.
            </p>

            {/* QR Code Container */}
            <div className="relative aspect-square w-48 mx-auto rounded-2xl overflow-hidden glass p-3 border border-orange-500/20 mb-6 flex items-center justify-center">
              {qrUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={qrUrl}
                  alt={`QR Code for ${name}`}
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="text-white/30 text-xs">Generating QR...</div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleCopy}
                className="w-full py-3 px-4 rounded-xl glass border border-white/10 hover:border-orange-500/40 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:bg-white/5 active:scale-95"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-green-400" />
                    <span className="text-green-400">Bio Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} className="text-orange-400" />
                    <span>Copy Bio Link</span>
                  </>
                )}
              </button>

              <button
                onClick={handleNativeShare}
                className="btn-primary w-full justify-center text-xs py-3"
              >
                <Share2 size={16} />
                <span>Share with Friends</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
