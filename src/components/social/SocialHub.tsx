'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Sparkles, ExternalLink, Flame } from 'lucide-react'
import type { SocialProfileData, SiteSettingsData } from '@/lib/content-store'
import PlatformIcon from '@/components/common/PlatformIcon'

interface DisplaySocial {
  id: string
  name: string
  handle: string
  href: string
  icon_name?: string
  color: string
}

const defaultPlatforms: DisplaySocial[] = [
  { id: '1', name: 'Instagram', handle: '@jubayer', href: 'https://instagram.com', icon_name: 'Instagram', color: '#E1306C' },
  { id: '2', name: 'Facebook', handle: 'Abdul Al Jubayer', href: 'https://facebook.com', icon_name: 'Facebook', color: '#1877F2' },
  { id: '3', name: 'YouTube', handle: 'Abdul Al Jubayer', href: 'https://youtube.com', icon_name: 'Youtube', color: '#FF0000' },
  { id: '4', name: 'TikTok', handle: '@jubayer', href: 'https://tiktok.com', icon_name: 'Music', color: '#69C9D0' },
  { id: '5', name: 'WhatsApp', handle: '+880 1700-000000', href: 'https://wa.me', icon_name: 'MessageCircle', color: '#25D366' },
  { id: '6', name: 'Telegram', handle: '@jubayer', href: 'https://t.me', icon_name: 'Send', color: '#229ED9' },
  { id: '7', name: 'X / Twitter', handle: '@jubayer', href: 'https://x.com', icon_name: 'Twitter', color: '#1DA1F2' },
  { id: '8', name: 'Email', handle: 'hello@jubayer.me', href: 'mailto:hello@jubayer.me', icon_name: 'Mail', color: '#F97316' },
]

function ensureAbsoluteUrl(url: string) {
  if (!url) return '#'
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')) {
    return url
  }
  return `https://${url}`
}

function SocialCard({
  platform,
  index,
}: {
  platform: DisplaySocial
  index: number
}) {
  const { name, handle, href, icon_name, color } = platform
  const safeUrl = ensureAbsoluteUrl(href)

  const handleClick = () => {
    try {
      fetch('/api/analytics/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: platform.id, platform: name }),
      })
    } catch {}
  }

  return (
    <motion.a
      href={safeUrl}
      onClick={handleClick}
      target={safeUrl.startsWith('mailto') ? undefined : '_blank'}
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="relative group glass gradient-border rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 cursor-pointer overflow-hidden shadow-lg"
      style={
        {
          '--platform-color': color,
        } as React.CSSProperties
      }
    >
      {/* Background glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
        style={{
          background: `radial-gradient(ellipse at center, ${color}20 0%, transparent 70%)`,
          boxShadow: `inset 0 0 30px ${color}15`,
        }}
      />

      {/* Top row: Icon & Arrow */}
      <div className="flex items-center justify-between">
        <div
          className="relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md"
          style={{ backgroundColor: `${color}18`, border: `1px solid ${color}35` }}
        >
          <PlatformIcon name={icon_name || name} size={22} style={{ color }} />
        </div>

        <div
          className="w-8 h-8 rounded-full glass border border-white/5 flex items-center justify-center text-xs opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          style={{ color }}
        >
          <ExternalLink size={14} />
        </div>
      </div>

      {/* Text Info */}
      <div className="relative mt-1">
        <h3 className="text-white font-semibold text-sm group-hover:text-white transition-colors">
          {name}
        </h3>
        <p className="text-white/40 text-xs mt-0.5 truncate font-light">
          {handle}
        </p>
      </div>

      {/* Bottom border glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-2xl"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
    </motion.a>
  )
}

interface SocialHubProps {
  socials?: SocialProfileData[]
  settings?: SiteSettingsData
}

export default function SocialHub({ socials, settings }: SocialHubProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const displayList: DisplaySocial[] = (socials && socials.length > 0)
    ? socials
        .filter((s) => s.is_visible)
        .map((s) => ({
          id: s.id,
          name: s.display_label || s.platform,
          handle: s.handle || s.display_label,
          href: s.profile_url,
          icon_name: s.icon_name || s.platform,
          color: s.color || '#F97316',
        }))
    : defaultPlatforms

  const spotlightEnabled = settings?.spotlight_enabled && settings?.spotlight_title && settings?.spotlight_url
  const spotlightUrl = settings?.spotlight_url ? ensureAbsoluteUrl(settings.spotlight_url) : '#'

  return (
    <section id="social" className="section-padding bg-[#0a0a0a] relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute top-1/2 right-0 w-[450px] h-[450px] rounded-full opacity-[0.05] -translate-y-1/2 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)' }}
      />

      <div className="container-max" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-1.5 h-6 rounded-full bg-orange-500" />
            <span className="text-orange-400 text-xs uppercase tracking-widest font-semibold">
              Official Links
            </span>
            <div className="w-1.5 h-6 rounded-full bg-orange-500" />
          </div>
          <h2 className="heading-lg text-white mb-3">
            Connect <span className="text-gradient">With Me</span>
          </h2>
          <p className="text-white/50 max-w-md mx-auto text-sm">
            All my official social accounts in one place. Click any card to visit my profile directly.
          </p>
        </motion.div>

        {/* Spotlight Featured Link Banner */}
        {spotlightEnabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 max-w-2xl mx-auto"
          >
            <a
              href={spotlightUrl}
              onClick={() => {
                try {
                  fetch('/api/analytics/click', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: 'spotlight', platform: 'Spotlight Featured' }),
                  })
                } catch {}
              }}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block p-5 sm:p-6 rounded-2xl glass border border-orange-500/40 bg-gradient-to-r from-orange-500/15 via-black/40 to-orange-600/15 hover:border-orange-500 transition-all duration-300 shadow-xl hover:shadow-orange-500/20 active:scale-[0.99] overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0 animate-bounce">
                    <Flame size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        Featured Highlight
                      </span>
                    </div>
                    <p className="text-white font-semibold text-sm sm:text-base mt-1 truncate group-hover:text-orange-400 transition-colors">
                      {settings?.spotlight_title}
                    </p>
                  </div>
                </div>

                <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all flex-shrink-0">
                  <ExternalLink size={16} />
                </div>
              </div>
            </a>
          </motion.div>
        )}

        {/* Social Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3.5 sm:gap-4 max-w-5xl mx-auto">
          {displayList.map((platform, i) => (
            <SocialCard key={platform.id || platform.name} platform={platform} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
