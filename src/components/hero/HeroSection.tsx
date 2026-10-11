'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useReducedMotion, motion } from 'framer-motion'
import { ArrowDown, Share2, Sparkles, CheckCircle2, MapPin, Compass, Image as ImageIcon, UserCheck } from 'lucide-react'
import type { SiteSettingsData, SocialProfileData } from '@/lib/content-store'
import PlatformIcon from '@/components/common/PlatformIcon'
import ShareProfileModal from '@/components/common/ShareProfileModal'

const Scene3D = dynamic(() => import('./Scene3D'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gradient-radial from-orange-900/20 via-transparent to-transparent" />
  ),
})

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] },
  },
}

interface HeroSectionProps {
  settings?: SiteSettingsData
  socials?: SocialProfileData[]
}

export default function HeroSection({ settings, socials }: HeroSectionProps) {
  const prefersReducedMotion = useReducedMotion()
  const [shareOpen, setShareOpen] = useState(false)

  const firstName = settings?.first_name || 'Abdul Al'
  const lastName = settings?.last_name || 'Jubayer'
  const fullName = `${firstName} ${lastName}`.trim()
  const tagline = settings?.tagline || 'Visual Creator & Lifestyle Storyteller'
  const bioIntro = settings?.bio_intro || 'Welcome to my official social hub! Connect with me across all my platforms and explore my visual diary.'
  const location = settings?.location || 'Dhaka, Bangladesh'
  const avatarUrl = settings?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
  const isVerified = settings?.verified !== false

  const activeSocials = (socials && socials.length > 0)
    ? socials.filter((s) => s.is_visible).slice(0, 6)
    : [
        { id: '1', platform: 'Instagram', profile_url: 'https://instagram.com', display_label: 'Instagram', icon_name: 'Instagram' },
        { id: '2', platform: 'Facebook', profile_url: 'https://facebook.com', display_label: 'Facebook', icon_name: 'Facebook' },
        { id: '3', platform: 'YouTube', profile_url: 'https://youtube.com', display_label: 'YouTube', icon_name: 'Youtube' },
        { id: '4', platform: 'TikTok', profile_url: 'https://tiktok.com', display_label: 'TikTok', icon_name: 'Music' },
      ]

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <section
        id="hero"
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#0a0a0a] pt-24 pb-16"
        aria-label="Hero profile section"
      >
        {/* 3D Scene background */}
        <div className="absolute inset-0 z-0">
          <Scene3D />
        </div>

        {/* Gradient overlays with pointer-events-none */}
        <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-[#0a0a0a]/60 via-transparent to-[#0a0a0a]" />
        <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-r from-[#0a0a0a]/40 via-transparent to-[#0a0a0a]/40" />

        {/* Orange radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] z-[1] pointer-events-none rounded-full"
          style={{ background: 'radial-gradient(ellipse at center, rgba(249,115,22,0.1) 0%, transparent 70%)' }}
        />

        {/* Content */}
        <div className="relative z-10 container-max px-4 md:px-8 text-center flex flex-col items-center">
          <motion.div
            variants={prefersReducedMotion ? {} : containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl flex flex-col items-center"
          >
            {/* Holographic Avatar with 3D Ring */}
            <motion.div
              variants={prefersReducedMotion ? {} : itemVariants}
              className="relative mb-6 group cursor-pointer"
              onClick={() => setShareOpen(true)}
            >
              {/* Outer Glowing Ring */}
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-orange-500 via-amber-400 to-orange-600 opacity-75 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-500 animate-pulse" />

              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-black/80 backdrop-blur-xl border-2 border-orange-500/40 shadow-2xl">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-neutral-900">
                  <Image
                    src={avatarUrl}
                    alt={fullName}
                    fill
                    unoptimized
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Verified Badge */}
              {isVerified && (
                <div
                  className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-orange-500 border-2 border-[#0a0a0a] flex items-center justify-center text-white shadow-lg orange-glow-sm"
                  title="Official Verified Profile"
                >
                  <CheckCircle2 size={16} />
                </div>
              )}
            </motion.div>

            {/* Location & Official Badge */}
            <motion.div
              variants={prefersReducedMotion ? {} : itemVariants}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-orange-500/20 text-orange-400 text-xs font-semibold mb-4"
            >
              <MapPin size={13} className="text-orange-400" />
              <span>{location}</span>
            </motion.div>

            {/* Main Name Heading */}
            <motion.h1
              variants={prefersReducedMotion ? {} : itemVariants}
              className="heading-xl mb-3"
            >
              <span className="text-white">{firstName} </span>
              <span className="text-gradient">{lastName}</span>
            </motion.h1>

            {/* Tagline */}
            <motion.p
              variants={prefersReducedMotion ? {} : itemVariants}
              className="text-lg sm:text-xl text-white/70 font-light mb-4 tracking-wide"
            >
              {tagline}
            </motion.p>

            {/* Bio quote */}
            <motion.p
              variants={prefersReducedMotion ? {} : itemVariants}
              className="text-sm sm:text-base text-white/50 leading-relaxed mb-8 max-w-lg"
            >
              {bioIntro}
            </motion.p>

            {/* Primary Action Buttons */}
            <motion.div
              variants={prefersReducedMotion ? {} : itemVariants}
              className="flex flex-wrap gap-3 justify-center mb-10 w-full sm:w-auto"
            >
              <button
                onClick={() => scrollToSection('social')}
                className="btn-primary flex-1 sm:flex-initial justify-center"
              >
                <Compass size={16} />
                <span>My Social Links</span>
              </button>

              <button
                onClick={() => scrollToSection('gallery')}
                className="btn-secondary flex-1 sm:flex-initial justify-center"
              >
                <ImageIcon size={16} />
                <span>Photo Diary</span>
              </button>

              <button
                onClick={() => setShareOpen(true)}
                className="w-11 h-11 rounded-full glass flex items-center justify-center text-white/60 hover:text-orange-400 hover:border-orange-500/40 transition-all hover:scale-110 flex-shrink-0"
                title="Share Profile & QR Code"
              >
                <Share2 size={16} />
              </button>

              <a
                href="/api/contact/vcard"
                download="Abdul_Al_Jubayer.vcf"
                className="w-11 h-11 rounded-full glass flex items-center justify-center text-white/60 hover:text-orange-400 hover:border-orange-500/40 transition-all hover:scale-110 flex-shrink-0"
                title="Save Contact to Phone (vCard)"
              >
                <UserCheck size={16} />
              </a>
            </motion.div>

            {/* Social shortcut icon pills */}
            <motion.div
              variants={prefersReducedMotion ? {} : itemVariants}
              className="flex items-center gap-3 justify-center flex-wrap"
            >
              <span className="text-white/30 text-[11px] uppercase tracking-widest font-medium mr-1">
                Accounts
              </span>
              <div className="w-6 h-px bg-white/10 hidden sm:block" />
              {activeSocials.map((item) => (
                <a
                  key={item.id}
                  href={item.profile_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.display_label || item.platform}
                  className="w-10 h-10 rounded-xl glass flex items-center justify-center text-white/60 hover:text-orange-400 hover:border-orange-500/40 hover:bg-orange-500/5 transition-all duration-300 hover:scale-110 shadow-sm"
                >
                  <PlatformIcon name={item.icon_name || item.platform} size={18} />
                </a>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.button
          onClick={() => scrollToSection('social')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-white/30 hover:text-orange-400 transition-colors group"
          aria-label="Scroll to social accounts"
        >
          <span className="text-[10px] uppercase tracking-widest">Connect</span>
          <motion.div
            animate={{ y: prefersReducedMotion ? 0 : [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          >
            <ArrowDown size={16} />
          </motion.div>
        </motion.button>
      </section>

      {/* Share / QR Modal */}
      <ShareProfileModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        name={fullName}
        tagline={tagline}
      />
    </>
  )
}
