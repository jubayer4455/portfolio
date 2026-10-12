'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Check,
  QrCode,
  Copy,
  X,
  Cpu,
  Share2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { UserBioData } from '@/lib/builder-store'

interface Props {
  bio: UserBioData
  themeConfig: { glow: string; border: string; text: string; bg: string }
  savedContact: boolean
  onSaveContact: () => void
}

export default function BioFlippableCard({
  bio,
  themeConfig,
  savedContact,
  onSaveContact,
}: Props) {
  const [showQrModal, setShowQrModal] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0, glareX: 50, glareY: 50 })
  const cardRef = useRef<HTMLDivElement | null>(null)

  // Gentle 3D tactile parallax (solid, realistic, no flipping)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) return
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * -3.5 // Max 3.5 deg for natural tactile depth
    const rotateY = ((x - centerX) / centerX) * 3.5

    const glareX = (x / rect.width) * 100
    const glareY = (y / rect.height) * 100

    setTilt({ x: rotateX, y: rotateY, glareX, glareY })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, glareX: 50, glareY: 50 })
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const currentUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://portfolio.com/u/${bio.username}`

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    currentUrl
  )}&color=ffffff&bgcolor=000000`

  const vipId = `VIP-${(bio.username || 'USR').toUpperCase().slice(0, 6)}`

  return (
    <>
      <div
        className="relative mb-5 sm:mb-7 perspective-[1000px] select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={cardRef}
          className="w-full relative transition-transform duration-300 ease-out"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          }}
        >
          {/* Subtle realistic glass reflection glare */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none z-30 opacity-25 mix-blend-overlay transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.8) 0%, rgba(249,115,22,0.2) 30%, transparent 70%)`,
            }}
          />

          {/* ── SOLID MASTER PROFILE HERO CARD ─────────────────────── */}
          <div
            className="glass gradient-border rounded-3xl overflow-hidden text-center relative shadow-2xl bg-[#090909]/90 border border-white/10"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85), 0 0 30px rgba(249,115,22,0.1)',
            }}
          >
            {/* 1. Panoramic Wide Cover Banner */}
            <div className="relative w-full h-32 sm:h-40 md:h-44 overflow-hidden bg-white/5 border-b border-white/10">
              {bio.cover_url ? (
                <Image
                  src={bio.cover_url}
                  alt={`${bio.display_name} cover banner`}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(135deg, ${themeConfig.glow}, rgba(255,255,255,0.06), #0c0c0c)`,
                  }}
                />
              )}
              {/* Vignette gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-black/40 pointer-events-none" />

              {/* Top Banner Action: Digital VIP Pass Modal Trigger */}
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="absolute top-3 right-3 z-20 glass px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold text-white hover:text-white border border-white/20 hover:border-orange-500/60 inline-flex items-center gap-1.5 transition-all shadow-xl hover:scale-105 active:scale-95 bg-black/50 backdrop-blur-md"
                title="Open Official Digital VIP Pass & QR Code"
              >
                <QrCode size={13} className="text-orange-400" />
                <span>VIP Pass &amp; QR</span>
              </button>
            </div>

            {/* 2. Main Profile Identity */}
            <div className="p-4 sm:p-6 pt-0 relative">
              {/* User Avatar with Glowing Bezel */}
              <div className="relative inline-block -mt-12 sm:-mt-16 mb-2.5 z-10">
                <div
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 mx-auto relative group overflow-hidden shadow-2xl ring-4 ring-[#090909]"
                  style={{
                    background: `linear-gradient(135deg, ${themeConfig.glow}, rgba(255,255,255,0.25))`,
                  }}
                >
                  <div className="relative w-full h-full rounded-[20px] overflow-hidden bg-black">
                    {bio.avatar_url ? (
                      <Image
                        src={bio.avatar_url}
                        alt={bio.display_name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        priority
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-display font-bold text-2xl text-white/40">
                        {bio.display_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Verified Star Badge */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-500 border-2 border-[#090909] flex items-center justify-center shadow-lg">
                  <Sparkles size={11} className="text-white" />
                </div>
              </div>

              {/* Status Badge */}
              {bio.status_badge && (
                <div className="mb-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] text-white/85 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                    <span>{bio.status_badge}</span>
                  </div>
                </div>
              )}

              {/* Full Name & Verification */}
              <div className="flex items-center justify-center gap-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
                  {bio.display_name}
                </h1>
                {bio.is_verified && (
                  <span
                    title="Verified Creator Profile"
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-black shadow-lg shadow-orange-500/30 shrink-0"
                  >
                    <ShieldCheck size={12} className="stroke-[2.5]" />
                  </span>
                )}
              </div>
              <p className={`font-mono text-xs mt-0.5 ${themeConfig.text}`}>@{bio.username}</p>

              {/* Tagline */}
              {bio.tagline && (
                <p className="text-xs sm:text-sm font-medium text-white/85 mt-2 max-w-md mx-auto leading-snug">
                  {bio.tagline}
                </p>
              )}

              {/* Location */}
              {bio.location && (
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/5 text-[11px] text-white/50 mt-2">
                  <MapPin size={11} className={themeConfig.text} />
                  <span>{bio.location}</span>
                </div>
              )}

              {/* Bio Story */}
              {bio.bio && (
                <p className="text-xs sm:text-sm text-white/60 mt-3 max-w-md mx-auto leading-relaxed">
                  {bio.bio}
                </p>
              )}

              {/* 3. Quick Action Dock: Call, Email, Save Contact & VIP Pass */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
                {bio.phone && (
                  <a
                    href={`tel:${bio.phone}`}
                    className="btn-glass text-xs py-2 px-3.5 rounded-full inline-flex items-center gap-1.5 hover:border-emerald-500/40 text-emerald-400 transition-all shadow-md active:scale-95"
                    title={`Call ${bio.phone}`}
                  >
                    <Phone size={13} />
                    <span>Call</span>
                  </a>
                )}

                {bio.email && (
                  <a
                    href={`mailto:${bio.email}`}
                    className="btn-glass text-xs py-2 px-3.5 rounded-full inline-flex items-center gap-1.5 hover:border-cyan-500/40 text-cyan-400 transition-all shadow-md active:scale-95"
                    title={`Email ${bio.email}`}
                  >
                    <Mail size={13} />
                    <span>Email</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={onSaveContact}
                  className="btn-primary text-xs py-2 px-4 rounded-full inline-flex items-center gap-1.5 shadow-lg shadow-orange-500/20 text-white font-medium hover:scale-[1.02] active:scale-95 transition-all"
                  title="Save Contact to Phone Address Book (.vcf)"
                >
                  {savedContact ? (
                    <>
                      <Check size={14} className="text-white" />
                      <span className="text-white font-medium">Saved! 📇</span>
                    </>
                  ) : (
                    <>
                      <UserCheck size={14} className="text-white" />
                      <span>Save Contact</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="btn-glass text-xs py-2 px-3.5 rounded-full inline-flex items-center gap-1.5 hover:border-orange-500/40 text-white/80 hover:text-white transition-all shadow-md active:scale-95"
                  title="View Digital QR Code"
                >
                  <QrCode size={13} className="text-orange-400" />
                  <span>QR Code</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── DIGITAL VIP PASS & QR CODE MODAL (CLEAN & CENTERED) ──────── */}
      <AnimatePresence>
        {showQrModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowQrModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-sm rounded-3xl overflow-hidden glass gradient-border border border-orange-500/30 p-6 text-center shadow-2xl bg-gradient-to-br from-[#141414] via-[#0a0a0a] to-[#120a05] relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-5 rounded bg-gradient-to-tr from-amber-500 to-yellow-300 border border-yellow-200/50 flex items-center justify-center text-black shadow-md">
                    <Cpu size={12} className="stroke-[2]" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-orange-400 block">
                      OFFICIAL VIP PASS
                    </span>
                    <span className="text-[9px] font-mono text-white/40 block">
                      {vipId}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQrModal(false)}
                  className="p-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* QR Code Center */}
              <div className="my-2 space-y-3">
                <div className="p-3 bg-black rounded-2xl border-2 border-orange-500/40 inline-block shadow-2xl ring-4 ring-orange-500/10">
                  <div className="relative w-44 h-44 mx-auto">
                    <Image
                      src={qrUrl}
                      alt={`QR code for ${bio.username}`}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-bold text-lg flex items-center justify-center gap-1.5">
                    <span>{bio.display_name}</span>
                    {bio.is_verified && <ShieldCheck size={14} className="text-amber-400" />}
                  </h3>
                  <p className="text-orange-400 font-mono text-xs mt-0.5">@{bio.username}</p>
                  <p className="text-white/50 text-xs mt-1">
                    Scan with any phone camera to open official 3D profile
                  </p>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 mt-3 border-t border-white/10 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="btn-glass text-xs py-2 px-4 rounded-full inline-flex items-center gap-1.5 active:scale-95"
                >
                  {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={onSaveContact}
                  className="btn-primary text-xs py-2 px-4 rounded-full inline-flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95"
                >
                  <UserCheck size={13} />
                  <span>Save Contact</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
