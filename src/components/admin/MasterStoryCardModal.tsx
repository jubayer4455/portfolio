'use client'

import { useState } from 'react'
import { X, Download, Sparkles, QrCode, Check, Loader2 } from 'lucide-react'
import type { SiteSettingsData } from '@/lib/content-store'
import { sounds } from '@/lib/sound-effects'

interface Props {
  isOpen: boolean
  onClose: () => void
  settings: SiteSettingsData
}

export default function MasterStoryCardModal({ isOpen, onClose, settings }: Props) {
  const [downloading, setDownloading] = useState(false)

  if (!isOpen) return null

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://hellojubayer.online'
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(origin)}&color=f97316&bgcolor=0a0a0a`

  const handleDownloadStoryImage = async () => {
    setDownloading(true)
    sounds.playClick()
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1080
      canvas.height = 1920
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas context not available')

      // 1. Draw Deep Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920)
      bgGrad.addColorStop(0, '#070709')
      bgGrad.addColorStop(0.35, '#120b06')
      bgGrad.addColorStop(0.75, '#070707')
      bgGrad.addColorStop(1, '#0e0906')
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, 1080, 1920)

      // Ambient Orange Glow Spheres
      const glowGrad = ctx.createRadialGradient(540, 500, 50, 540, 500, 500)
      glowGrad.addColorStop(0, 'rgba(249, 115, 22, 0.28)')
      glowGrad.addColorStop(1, 'rgba(249, 115, 22, 0)')
      ctx.fillStyle = glowGrad
      ctx.fillRect(0, 0, 1080, 1920)

      // 2. Top Pill
      ctx.save()
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.45)'
      ctx.lineWidth = 2
      const pillW = 480
      const pillH = 70
      const pillX = (1080 - pillW) / 2
      const pillY = 130
      ctx.beginPath()
      ctx.roundRect(pillX, pillY, pillW, pillH, 35)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#f97316'
      ctx.font = 'bold 28px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('✨ OFFICIAL PORTFOLIO & BIO ✨', 540, 175)
      ctx.restore()

      // 3. Avatar Ring
      const avatarSize = 260
      const avatarX = 540
      const avatarY = 400

      ctx.save()
      ctx.beginPath()
      ctx.arc(avatarX, avatarY, avatarSize / 2 + 10, 0, Math.PI * 2)
      ctx.strokeStyle = '#f97316'
      ctx.lineWidth = 6
      ctx.shadowColor = 'rgba(249, 115, 22, 0.9)'
      ctx.shadowBlur = 35
      ctx.stroke()
      ctx.restore()

      const avatarImg = document.createElement('img')
      avatarImg.crossOrigin = 'anonymous'
      await new Promise<void>((resolve) => {
        avatarImg.onload = () => resolve()
        avatarImg.onerror = () => resolve()
        avatarImg.src = settings.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
      })

      ctx.save()
      ctx.beginPath()
      ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      try {
        ctx.drawImage(avatarImg, avatarX - avatarSize / 2, avatarY - avatarSize / 2, avatarSize, avatarSize)
      } catch {
        ctx.fillStyle = '#1a1a1a'
        ctx.fill()
      }
      ctx.restore()

      // 4. Name & Tagline
      ctx.save()
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 64px sans-serif'
      ctx.textAlign = 'center'
      const fullName = settings.first_name ? `${settings.first_name} ${settings.last_name || ''}`.trim() : 'Abdul Al Jubayer'
      ctx.fillText(fullName, 540, 600)

      ctx.fillStyle = '#f97316'
      ctx.font = '32px sans-serif'
      ctx.fillText(settings.tagline || 'Visual Creator & Life Storyteller', 540, 660)

      // Verified Badge Pill
      ctx.fillStyle = 'rgba(249, 115, 22, 0.15)'
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.5)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.roundRect(390, 700, 300, 52, 26)
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 22px sans-serif'
      ctx.fillText('✓ VERIFIED CREATOR', 540, 734)
      ctx.restore()

      // 5. Quote Box
      if (settings.quote_or_motto) {
        ctx.save()
        ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(140, 800, 800, 120, 24)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = '#e2e8f0'
        ctx.font = 'italic 28px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`“${settings.quote_or_motto}”`, 540, 870)
        ctx.restore()
      }

      // 6. QR Code Card
      const qrBoxW = 440
      const qrBoxH = 480
      const qrBoxX = (1080 - qrBoxW) / 2
      const qrBoxY = 1000

      ctx.save()
      ctx.fillStyle = 'rgba(15, 15, 17, 0.95)'
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)'
      ctx.lineWidth = 2
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)'
      ctx.shadowBlur = 30
      ctx.beginPath()
      ctx.roundRect(qrBoxX, qrBoxY, qrBoxW, qrBoxH, 36)
      ctx.fill()
      ctx.stroke()
      ctx.restore()

      const qrImg = document.createElement('img')
      qrImg.crossOrigin = 'anonymous'
      await new Promise<void>((resolve) => {
        qrImg.onload = () => resolve()
        qrImg.onerror = () => resolve()
        qrImg.src = qrCodeUrl
      })

      const qrSize = 300
      const qrX = (1080 - qrSize) / 2
      const qrY = qrBoxY + 50
      ctx.save()
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)
      ctx.restore()

      // QR Text
      ctx.save()
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 26px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Scan with Camera to Visit', 540, qrBoxY + 400)
      ctx.fillStyle = '#f97316'
      ctx.font = '22px monospace'
      ctx.fillText(origin.replace('https://', ''), 540, qrBoxY + 438)
      ctx.restore()

      // 7. Footer Call to Action
      ctx.save()
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      ctx.font = '26px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('Tap sticker or scan above to connect 🚀', 540, 1750)
      ctx.restore()

      // Download Trigger
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `jubayer-instagram-story-card.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      sounds.playSuccess()
    } catch (err) {
      console.error(err)
      alert('Failed to generate story image. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md glass gradient-border rounded-3xl p-6 shadow-2xl text-center space-y-4 max-h-[95vh] overflow-y-auto no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full glass"
          title="Close"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto">
          <Sparkles size={24} />
        </div>

        <div>
          <h3 className="text-xl font-bold font-display text-white">Instagram Story Card Generator</h3>
          <p className="text-white/50 text-xs mt-1">
            Download a 9:16 high-resolution story card with your avatar, verified badge, and QR code!
          </p>
        </div>

        {/* 9:16 Mini Story Preview */}
        <div className="relative w-52 aspect-[9/16] rounded-2xl overflow-hidden mx-auto bg-[#09090b] border border-orange-500/30 p-3 shadow-2xl flex flex-col justify-between items-center text-center">
          <div className="w-full">
            <span className="text-[8px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full inline-block">
              ✨ LINK IN BIO ✨
            </span>
            <div className="relative w-14 h-14 rounded-full overflow-hidden mx-auto mt-2 border-2 border-orange-500 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={settings.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-[11px] font-bold text-white mt-1.5 truncate">
              {settings.first_name ? `${settings.first_name} ${settings.last_name || ''}`.trim() : 'Abdul Al Jubayer'}
            </p>
            <p className="text-[9px] text-orange-400 truncate">{settings.tagline}</p>
          </div>

          <div className="p-2 bg-black/60 rounded-xl border border-white/10 w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20 mx-auto rounded-lg" />
            <p className="text-[8px] text-white/60 mt-1">Scan with camera</p>
          </div>

          <p className="text-[8px] text-white/40">Tap sticker to connect 🚀</p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleDownloadStoryImage}
            disabled={downloading}
            className="btn-primary w-full justify-center text-xs py-3 inline-flex items-center gap-2 shadow-lg shadow-orange-500/20"
          >
            {downloading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Generating High-Res Story (1080x1920)...</span>
              </>
            ) : (
              <>
                <Download size={15} />
                <span>Download Story Card (PNG)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
