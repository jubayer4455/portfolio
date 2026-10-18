'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ExternalLink,
  Share2,
  Check,
  X,
  Sparkles,
  ChevronRight,
  Maximize2,
  Heart,
  ShieldAlert,
  ArrowLeft,
  LayoutGrid,
  List,
  QrCode,
} from 'lucide-react'
import PlatformIcon from '@/components/common/PlatformIcon'
import Bio3DBackground from '@/components/bio/Bio3DBackground'
import BioFlippableCard from '@/components/bio/BioFlippableCard'
import UserAnonymousBox from '@/components/bio/UserAnonymousBox'
import BioMiniMusicPlayer from '@/components/bio/BioMiniMusicPlayer'
import BioWhatsAppDialog from '@/components/bio/BioWhatsAppDialog'
import BioQrModal from '@/components/bio/BioQrModal'
import type { UserBioData } from '@/lib/builder-store'

interface Props {
  bio: UserBioData
}

const THEME_ACCENTS: Record<string, { glow: string; border: string; text: string; bg: string; hoverText: string }> = {
  orange: {
    glow: 'rgba(249,115,22,0.18)',
    border: 'border-orange-500/30',
    text: 'text-orange-400',
    hoverText: 'group-hover:text-orange-400',
    bg: 'bg-orange-500',
  },
  purple: {
    glow: 'rgba(168,85,247,0.18)',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
    hoverText: 'group-hover:text-purple-400',
    bg: 'bg-purple-500',
  },
  cyan: {
    glow: 'rgba(6,182,212,0.18)',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    hoverText: 'group-hover:text-cyan-400',
    bg: 'bg-cyan-500',
  },
  emerald: {
    glow: 'rgba(16,185,129,0.18)',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    hoverText: 'group-hover:text-emerald-400',
    bg: 'bg-emerald-500',
  },
  rose: {
    glow: 'rgba(244,63,94,0.18)',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    hoverText: 'group-hover:text-rose-400',
    bg: 'bg-rose-500',
  },
}

export default function UserBioClientView({ bio }: Props) {
  const [activePhoto, setActivePhoto] = useState<{ url: string; caption?: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [likes, setLikes] = useState<Record<string, number>>({})
  const [savedContact, setSavedContact] = useState(false)

  const themeConfig = THEME_ACCENTS[bio.theme || 'orange'] || THEME_ACCENTS.orange

  // Track profile view
  useEffect(() => {
    try {
      fetch('/api/user/bio/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: bio.username, type: 'view' }),
      }).catch(() => {})
    } catch {}
  }, [bio.username])

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${bio.display_name} (@${bio.username})`,
          text: bio.tagline || `Check out ${bio.display_name}'s official 3D bio!`,
          url: window.location.href,
        })
        return
      } catch {}
    }
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLinkClick = (platform: string, url: string) => {
    try {
      fetch('/api/user/bio/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: bio.username, type: 'click', platform }),
      }).catch(() => {})
    } catch {}
  }

  const handleSaveContact = () => {
    const vCardLines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${bio.display_name}`,
      `N:;${bio.display_name};;;`,
      bio.tagline ? `TITLE:${bio.tagline}` : '',
      bio.phone ? `TEL;TYPE=CELL,VOICE:${bio.phone}` : '',
      bio.email ? `EMAIL;TYPE=INTERNET:${bio.email}` : '',
      bio.bio ? `NOTE:${bio.bio.replace(/\r?\n/g, ' ')}` : '',
      `URL:${typeof window !== 'undefined' ? window.location.href : ''}`,
      'END:VCARD',
    ].filter(Boolean)

    const blob = new Blob([vCardLines.join('\r\n')], { type: 'text/vcard;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${bio.username}-contact.vcf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setSavedContact(true)
    setTimeout(() => setSavedContact(false), 2500)
  }

  const handleLikePhoto = (photoId: string) => {
    setLikes((prev) => ({
      ...prev,
      [photoId]: (prev[photoId] || 0) + 1,
    }))
  }

  const fontClass =
    bio.font_family === 'serif' ? 'font-serif' : bio.font_family === 'mono' ? 'font-mono' : 'font-sans'

  // If user is suspended by Master Admin
  if (bio.is_suspended) {
    return (
      <div className="min-h-screen bg-[#070707] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full glass gradient-border rounded-3xl p-8 shadow-2xl relative">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-xl font-bold font-display text-white">Bio Profile Inactive</h1>
          <p className="text-white/50 text-xs mt-2 leading-relaxed">
            This bio page for <strong className="text-white">@{bio.username}</strong> is currently paused or suspended by site administration.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/" className="btn-primary text-xs w-full sm:w-auto inline-flex items-center justify-center gap-1.5">
              <ArrowLeft size={13} /> Back to Home
            </Link>
            <Link href="/signup" className="btn-glass text-xs w-full sm:w-auto">
              Create Your Bio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const isBento = bio.layout_style === 'bento'

  return (
    <div className={`min-h-screen bg-[#070707] text-white relative flex flex-col justify-between selection:bg-orange-500 selection:text-white ${fontClass}`}>
      {/* Dynamic 3D Interactive Canvas Background */}
      <Bio3DBackground style={bio.bg_3d_style || 'particles'} glowColor={themeConfig.glow} />

      {/* Background ambient lighting */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none blur-3xl opacity-20 z-0"
        style={{ background: themeConfig.glow }}
      />
      <div
        className="fixed bottom-0 right-1/4 w-[600px] h-[400px] rounded-full pointer-events-none blur-3xl opacity-10 z-0"
        style={{ background: themeConfig.glow }}
      />

      {/* Main Container */}
      <div className="w-full max-w-xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 md:py-10 safe-area-pt flex-1 flex flex-col relative z-10">
        {/* Top Actions Bar */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors glass px-3 py-1.5 rounded-full border border-white/10"
          >
            <span className="font-display font-bold text-orange-400">AJ</span>
            <span>Platform</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowQr(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/10 text-xs text-white/80 hover:text-white hover:border-white/20 transition-all active:scale-95 shadow-md"
              title="Show Digital QR Code"
            >
              <QrCode size={13} className="text-orange-400" />
              <span>QR Code</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/10 text-xs text-white/80 hover:text-white hover:border-white/20 transition-all active:scale-95 shadow-md"
              title="Share profile link"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={13} />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 1. Solid Tactile Master Profile Card */}
        <BioFlippableCard
          bio={bio}
          themeConfig={themeConfig}
          savedContact={savedContact}
          onSaveContact={handleSaveContact}
        />

        {/* 2. 4 Personal Photos Showcase */}
        {bio.photos && bio.photos.length > 0 && (
          <div className="mb-5 sm:mb-7">
            <div className="flex items-center justify-between mb-2.5 px-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Personal Showcase ({bio.photos.length})
              </span>
              <span className="text-[11px] text-white/30">Click to view in HD</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {bio.photos.map((photo, i) => (
                <div
                  key={photo.id || i}
                  onClick={() => setActivePhoto(photo)}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden glass border border-white/10 cursor-pointer shadow-lg hover:border-orange-500/40 transition-all"
                >
                  <Image
                    src={photo.url}
                    alt={photo.alt_text || `${bio.display_name} (@${bio.username}) — ${photo.caption || 'Featured Photo ' + (i + 1)} | Personal Visual Showcase`}
                    title={`${bio.display_name} — ${photo.caption || 'Showcase Photo'}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />

                  {/* Hover gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    {photo.caption && (
                      <p className="text-xs text-white font-medium truncate mb-1">{photo.caption}</p>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-white/70">
                      <span className="inline-flex items-center gap-1">
                        <Maximize2 size={11} /> View
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLikePhoto(photo.id || String(i))
                        }}
                        className="inline-flex items-center gap-1 hover:text-red-400"
                      >
                        <Heart size={11} className={likes[photo.id || String(i)] ? 'fill-red-500 text-red-500' : ''} />
                        <span>{likes[photo.id || String(i)] || 0}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Social Links (Classic List vs Modern Bento Grid) */}
        <div className="mb-5 sm:mb-7">
          <div className="flex items-center justify-between px-1.5 mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Social Links &amp; Connect
            </span>
            <span className="text-[10px] text-white/30 font-mono">
              {isBento ? 'Bento Grid Style' : 'Classic Style'}
            </span>
          </div>

          {bio.social_links && bio.social_links.length > 0 ? (
            isBento ? (
              /* BENTO GRID LAYOUT */
              <div className="grid grid-cols-2 gap-3">
                {bio.social_links.map((link, idx) => {
                  const isFeaturedTile = idx === 0 && bio.social_links.length >= 3
                  return (
                    <a
                      key={link.id}
                      href={link.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleLinkClick(link.platform, link.profile_url)}
                      className={`group p-4 rounded-2xl glass border border-white/10 hover:bg-white/[0.06] transition-all duration-300 shadow-md flex flex-col justify-between hover:scale-[1.02] active:scale-[0.98] ${
                        isFeaturedTile ? 'col-span-2 aspect-[3/1]' : 'aspect-square'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <PlatformIcon platform={link.platform} size={20} />
                        </div>
                        <ExternalLink size={14} className="text-white/30 group-hover:text-white transition-colors" />
                      </div>

                      <div>
                        <p className={`text-sm font-bold text-white ${themeConfig.hoverText} transition-colors truncate`}>
                          {link.display_label || link.platform}
                        </p>
                        <p className="text-[11px] text-white/40 font-mono truncate">{link.platform}</p>
                      </div>
                    </a>
                  )
                })}
              </div>
            ) : (
              /* CLASSIC VERTICAL LIST */
              <div className="space-y-3">
                {bio.social_links.map((link) => (
                  <a
                    key={link.id}
                    href={link.profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleLinkClick(link.platform, link.profile_url)}
                    className="group w-full flex items-center justify-between p-4 rounded-2xl glass border border-white/10 hover:border-white/25 hover:bg-white/[0.06] transition-all duration-300 shadow-md hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                        <PlatformIcon platform={link.platform} size={20} />
                      </div>
                      <div className="min-w-0 text-left">
                        <p className={`text-sm font-semibold text-white truncate ${themeConfig.hoverText} transition-colors`}>
                          {link.display_label || link.platform}
                        </p>
                        <p className="text-[11px] text-white/40 truncate">{link.platform}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-white/30 group-hover:text-white transition-colors">
                      <ExternalLink size={16} />
                    </div>
                  </a>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-6 glass rounded-2xl text-white/40 text-xs">
              No social links added yet.
            </div>
          )}
        </div>

        {/* 4. NGL-Style Secret Anonymous Message Box for this Creator */}
        <UserAnonymousBox
          username={bio.username}
          displayName={bio.display_name}
          themeColor={themeConfig.text}
        />

        {/* Lightbox Modal */}
        <AnimatePresence>
          {activePhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePhoto(null)}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            >
              <div
                className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setActivePhoto(null)}
                  className="absolute -top-12 right-0 p-2 text-white/70 hover:text-white glass rounded-full"
                >
                  <X size={20} />
                </button>
                <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/10">
                  <Image
                    src={activePhoto.url}
                    alt={activePhoto.caption ? `${bio.display_name} — ${activePhoto.caption} HD Visual View` : `${bio.display_name} Photo Showcase HD`}
                    title={activePhoto.caption || `${bio.display_name} Showcase Photo`}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
                {activePhoto.caption && (
                  <p className="text-white/80 text-sm mt-3 font-medium text-center">
                    {activePhoto.caption}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mini 3D Vinyl Music Player */}
      <BioMiniMusicPlayer
        enabled={bio.music_enabled}
        title={bio.music_title}
        audioUrl={bio.music_url}
        themeColor={themeConfig.text}
      />

      {/* 1-Tap Direct WhatsApp Instant Chat Dialog */}
      <BioWhatsAppDialog bio={bio} />

      {/* Digital Bio Profile QR Code Modal */}
      <BioQrModal
        isOpen={showQr}
        onClose={() => setShowQr(false)}
        profileUrl={typeof window !== 'undefined' ? window.location.href : `https://hellojubayer.online/u/${bio.username}`}
        displayName={bio.display_name}
        username={bio.username}
        avatarUrl={bio.avatar_url}
        accentColor={themeConfig.bg}
      />

      {/* Bio Builder Promo Footer */}
      <footer className="w-full border-t border-white/[0.06] py-6 pb-12 safe-area-pb px-4 text-center mt-auto bg-[#050505] relative z-10">
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 text-xs text-white/50 hover:text-white px-4 py-2 rounded-full glass border border-white/10 hover:border-orange-500/40 transition-all duration-200 group"
        >
          <Sparkles size={13} className="text-orange-400 group-hover:rotate-12 transition-transform" />
          <span>Made with <strong>AJ Bio Builder</strong> — Create Yours Free 🚀</span>
          <ChevronRight size={13} className="text-white/40 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </footer>
    </div>
  )
}
