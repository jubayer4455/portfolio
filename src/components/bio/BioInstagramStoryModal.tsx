'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { X, Download, Sparkles, Copy, Check, Loader2, QrCode } from 'lucide-react'
import type { UserBioData } from '@/lib/builder-store'

interface BioInstagramStoryModalProps {
  isOpen: boolean
  onClose: () => void
  bioData: UserBioData
}

export default function BioInstagramStoryModal({
  isOpen,
  onClose,
  bioData,
}: BioInstagramStoryModalProps) {
  const [downloading, setDownloading] = useState(false)
  const [copiedQuote, setCopiedQuote] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://portfolio.com'
  const publicUrl = `${origin}/u/${bioData.username}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(publicUrl)}&color=f97316&bgcolor=0a0a0a`

  const handleDownloadStoryImage = async () => {
    setDownloading(true)
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1920
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Canvas context not available')
      }

      // 1. Draw Deep Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920)
      bgGrad.addColorStop(0, '#0a0a0a')
      bgGrad.addColorStop(0.3, '#120d08')
      bgGrad.addColorStop(0.7, '#070707')
      bgGrad.addColorStop(1, '#0f0b07')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, 1080, 1920)

      // Ambient Orange Glow Spheres
      const glowGrad = ctx.createRadialGradient(540, 480, 50, 540, 480, 450)
      glowGrad.addColorStop(0, 'rgba(249, 115, 22, 0.22)')
      glowGrad.addColorStop(1, 'rgba(249, 115, 22, 0)')
      ctx.fillStyle = glowGrad
      ctx.fillRect(0, 0, 1080, 1920)

      // 2. Draw Decorative Top Border & Header Pill
      ctx.save()
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.35)'
      ctx.lineWidth = 2
      const pillW = 440
      const pillH = 64
      const pillX = (1080 - pillW) / 2
      const pillY = 120
      ctx.beginPath()
      ctx.roundRect(pillX, pillY, pillW, pillH, 32)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#f97316'
      ctx.font = 'bold 26px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('✨ LINK IN BIO ✨', 540, 162)
      ctx.restore()

      // 3. Draw Avatar (Circle with Ring)
      const avatarSize = 240
      const avatarX = 540
      const avatarY = 380

      // Glowing outer ring
      ctx.save()
      ctx.beginPath()
      ctx.arc(avatarX, avatarY, avatarSize / 2 + 10, 0, Math.PI * 2)
      ctx.strokeStyle = '#f97316'
      ctx.lineWidth = 6
      ctx.shadowColor = 'rgba(249, 115, 22, 0.8)'
      ctx.shadowBlur = 30
      ctx.stroke()
      ctx.restore()

      // Load avatar image or fallback
      const avatarImg = document.createElement('img')
      avatarImg.crossOrigin = 'anonymous'
      await new Promise<void>((resolve) => {
        avatarImg.onload = () => resolve()
        avatarImg.onerror = () => resolve()
        avatarImg.src = bioData.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      })

      ctx.save()
      ctx.beginPath()
      ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2)
      ctx.clip()
      try {
        ctx.drawImage(avatarImg, avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize)
      } catch {
        ctx.fillStyle = '#1f1f1f'
        ctx.fillRect(avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize)
      }
      ctx.restore()

      // 4. Draw User Name & Handle
      ctx.save()
      ctx.textAlign = 'center'
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 64px sans-serif'
      ctx.fillText(bioData.display_name || 'Creator', 540, 570)

      ctx.fillStyle = '#f97316'
      ctx.font = 'bold 36px monospace'
      ctx.fillText(`@${bioData.username}`, 540, 630)

      // Status Badge if present
      if (bioData.status_badge) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)'
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'
        ctx.lineWidth = 1.5
        const badgeW = Math.min(600, ctx.measureText(bioData.status_badge).width + 60)
        ctx.beginPath()
        ctx.roundRect((1080 - badgeW) / 2, 670, badgeW, 52, 26)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = '#e2e8f0'
        ctx.font = '24px sans-serif'
        ctx.fillText(bioData.status_badge, 540, 705)
      }

      // Tagline
      if (bioData.tagline) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
        ctx.font = '32px sans-serif'
        ctx.fillText(bioData.tagline.slice(0, 60), 540, 775)
      }
      ctx.restore()

      // 5. Card with QR Code
      const qrCardW = 680
      const qrCardH = 720
      const qrCardX = (1080 - qrCardW) / 2
      const qrCardY = 860

      ctx.save()
      ctx.fillStyle = 'rgba(18, 18, 20, 0.95)'
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)'
      ctx.lineWidth = 3
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      ctx.shadowBlur = 40
      ctx.beginPath()
      ctx.roundRect(qrCardX, qrCardY, qrCardW, qrCardH, 48)
      ctx.fill()
      ctx.stroke()

      // QR Code title
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 36px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('SCAN TO CONNECT', 540, qrCardY + 70)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
      ctx.font = '22px sans-serif'
      ctx.fillText('Point your camera to open my personal hub', 540, qrCardY + 110)

      // Load QR Code Image
      const qrImg = document.createElement('img')
      qrImg.crossOrigin = 'anonymous'
      await new Promise<void>((resolve) => {
        qrImg.onload = () => resolve()
        qrImg.onerror = () => resolve()
        qrImg.src = qrCodeUrl
      })

      const qrRenderSize = 420
      const qrRenderX = (1080 - qrRenderSize) / 2
      const qrRenderY = qrCardY + 150

      // Inner white card for QR
      ctx.fillStyle = '#0a0a0a'
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(qrRenderX - 16, qrRenderY - 16, qrRenderSize + 32, qrRenderSize + 32, 28)
      ctx.fill()
      ctx.stroke()

      try {
        ctx.drawImage(qrImg, qrRenderX, qrRenderY, qrRenderSize, qrRenderSize)
      } catch {}

      // URL Pill at bottom of card
      ctx.fillStyle = 'rgba(249, 115, 22, 0.15)'
      ctx.strokeStyle = '#f97316'
      ctx.lineWidth = 1.5
      const urlPillW = 520
      const urlPillH = 56
      ctx.beginPath()
      ctx.roundRect((1080 - urlPillW) / 2, qrCardY + qrCardH - 90, urlPillW, urlPillH, 28)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#f97316'
      ctx.font = 'bold 24px monospace'
      ctx.fillText(`/u/${bioData.username}`, 540, qrCardY + qrCardH - 54)
      ctx.restore()

      // 6. Story Footer Call To Action
      ctx.save()
      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.font = '26px sans-serif'
      ctx.fillText('👆 Swipe up or scan code to explore my world', 540, 1720)

      ctx.fillStyle = 'rgba(249, 115, 22, 0.8)'
      ctx.font = 'bold 22px sans-serif'
      ctx.fillText('⚡ Built with AJ Creator Bio Hub', 540, 1780)
      ctx.restore()

      // Convert canvas to downloadable blob
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${bioData.username}-instagram-story-9x16.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setDownloading(false)
      }, 'image/png')
    } catch (err) {
      console.error('Failed to export story card:', err)
      setDownloading(false)
    }
  }

  const handleCopyStoryCaption = () => {
    const caption = `🔥 Check out my official 3D Link-in-Bio profile! Link in bio 👉 ${publicUrl}`
    navigator.clipboard.writeText(caption)
    setCopiedQuote(true)
    setTimeout(() => setCopiedQuote(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg glass gradient-border rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-xl glass hover:bg-white/10 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Instagram Story Card (9:16)</h3>
            <p className="text-white/40 text-xs">
              HD 1080x1920 ready to post directly to your Instagram & TikTok stories
            </p>
          </div>
        </div>

        {/* Story Card Live Preview (9:16 Frame) */}
        <div
          ref={previewRef}
          className="relative w-full max-w-[280px] aspect-[9/16] mx-auto rounded-3xl overflow-hidden border-2 border-orange-500/40 shadow-2xl bg-gradient-to-b from-[#140f09] via-[#090909] to-[#120e09] p-4 flex flex-col justify-between text-center select-none"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-orange-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Top Pill */}
          <div className="relative z-10 pt-2">
            <span className="inline-block px-3 py-1 rounded-full bg-white/[0.06] border border-orange-500/30 text-[10px] font-bold text-orange-400 tracking-wider">
              ✨ LINK IN BIO ✨
            </span>
          </div>

          {/* Center Info + QR */}
          <div className="relative z-10 space-y-2 py-2">
            {/* Avatar */}
            <div className="relative w-16 h-16 rounded-full mx-auto p-0.5 bg-gradient-to-tr from-orange-500 to-amber-300 ring-2 ring-orange-500/40 shadow-lg">
              <div className="relative w-full h-full rounded-full overflow-hidden bg-black">
                {bioData.avatar_url ? (
                  <Image
                    src={bioData.avatar_url}
                    alt={bioData.display_name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-orange-500/30" />
                )}
              </div>
            </div>

            <div>
              <p className="font-bold text-white text-sm tracking-tight">{bioData.display_name}</p>
              <p className="text-[10px] font-mono text-orange-400">@{bioData.username}</p>
            </div>

            {bioData.status_badge && (
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[9px] text-white/80 border border-white/10">
                {bioData.status_badge}
              </span>
            )}

            {/* QR Code Container */}
            <div className="p-2.5 rounded-2xl bg-[#09090b] border border-orange-500/30 shadow-inner inline-block mx-auto mt-1">
              <p className="text-[8px] font-semibold text-white/60 mb-1 uppercase tracking-wider">
                Scan to Connect
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-24 h-24 rounded-lg object-contain mx-auto"
              />
              <p className="text-[8px] font-mono text-orange-400 mt-1">/u/{bioData.username}</p>
            </div>
          </div>

          {/* Bottom Story Hint */}
          <div className="relative z-10 pb-1">
            <p className="text-[9px] text-white/40">👆 Point camera to visit my bio</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            type="button"
            onClick={handleDownloadStoryImage}
            disabled={downloading}
            className="btn-primary w-full justify-center text-xs py-3 inline-flex items-center gap-2 shadow-lg shadow-orange-500/20"
          >
            {downloading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Generating High-Res Story (1080x1920)...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download Story Card (1080x1920 PNG)</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCopyStoryCaption}
            className="btn-glass w-full justify-center text-xs py-2.5 inline-flex items-center gap-2"
          >
            {copiedQuote ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copiedQuote ? 'Story Caption Copied!' : 'Copy Instagram Story Caption'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
