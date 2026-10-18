'use client'

import { useState } from 'react'
import { X, Download, Copy, Check, QrCode, Sparkles } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  profileUrl: string
  displayName: string
  username: string
  avatarUrl?: string
  accentColor?: string
}

export default function BioQrModal({
  isOpen,
  onClose,
  profileUrl,
  displayName,
  username,
  avatarUrl,
  accentColor = '#F97316',
}: Props) {
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  if (!isOpen) return null

  // High quality QR code URL using standard QR generator
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&format=png&color=000000&bgcolor=ffffff&margin=15&data=${encodeURIComponent(
    profileUrl
  )}`

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = async () => {
    try {
      setDownloading(true)
      const res = await fetch(qrImageUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${username}-qr-code.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      window.open(qrImageUrl, '_blank')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-sm rounded-3xl p-6 glass gradient-border shadow-2xl border-white/20 bg-[#0d0d0d]/95 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-orange-400 font-semibold mb-2">
          <Sparkles size={14} />
          <span>DIGITAL BIO QR CODE</span>
        </div>

        <h3 className="text-white text-lg font-bold font-display">{displayName}</h3>
        <p className="text-white/40 text-xs mb-5">@{username} • 3D Link in Bio</p>

        {/* QR Code Container */}
        <div className="relative mx-auto w-56 h-56 p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center group overflow-hidden">
          <img
            src={qrImageUrl}
            alt={`${displayName} QR Code`}
            className="w-full h-full object-contain"
          />

          {avatarUrl && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full p-1 bg-white shadow-lg overflow-hidden border-2 border-orange-500">
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
          )}
        </div>

        <p className="text-white/50 text-[11px] mt-4">
          Scan with your phone camera to instantly view this bio profile.
        </p>

        {/* Action Buttons */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn-primary text-xs justify-center py-2.5"
          >
            <Download size={14} />
            <span>{downloading ? 'Downloading...' : 'Download QR'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="btn-glass text-xs justify-center py-2.5 border-white/20"
          >
            {copied ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
