'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Users,
  Eye,
  MousePointerClick,
  ArrowRight,
} from 'lucide-react'
import type { UserBioData } from '@/lib/builder-store'

interface Props {
  featuredUsers: UserBioData[]
}

export default function FeaturedCreatorsSection({ featuredUsers }: Props) {
  if (!featuredUsers || featuredUsers.length === 0) return null

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto relative">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-3">
          <Sparkles size={12} />
          <span>OFFICIAL CREATOR SPOTLIGHT</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
          Trending Creators on <span className="text-gradient">AJ Bio</span>
        </h2>
        <p className="text-white/50 text-sm mt-3">
          Explore aesthetics, visual portfolios, and social hubs created by verified creators using our 3D platform.
        </p>
      </div>

      {/* Grid of Featured Creators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {featuredUsers.map((user) => {
          const liveUrl = `/u/${user.username}`
          const views = user.views || 0
          const clicks = user.clicks || 0

          return (
            <div
              key={user.id || user.username}
              className="glass gradient-border rounded-3xl overflow-hidden hover:border-orange-500/40 transition-all duration-300 group flex flex-col justify-between shadow-xl"
            >
              {/* Header Cover Banner */}
              <div className="relative w-full h-28 bg-gradient-to-r from-orange-950/40 via-purple-950/20 to-black overflow-hidden border-b border-white/5">
                {user.cover_url ? (
                  <Image
                    src={user.cover_url}
                    alt={user.display_name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-orange-500/20 to-purple-500/10" />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70" />
              </div>

              {/* Creator Card Content */}
              <div className="p-6 pt-0 relative flex-1 flex flex-col justify-between">
                <div>
                  {/* Avatar overlapping banner */}
                  <div className="relative -mt-10 mb-3 flex items-center justify-between">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr from-orange-500 to-amber-300 shadow-xl ring-2 ring-black">
                      <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-black">
                        {user.avatar_url ? (
                          <Image
                            src={user.avatar_url}
                            alt={user.display_name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-white text-base">
                            {user.display_name.slice(0, 2)}
                          </div>
                        )}
                      </div>
                    </div>

                    {user.is_verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-semibold">
                        <ShieldCheck size={12} />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>

                  {/* Name & Handle */}
                  <h3 className="text-white font-bold text-base group-hover:text-orange-400 transition-colors">
                    {user.display_name}
                  </h3>
                  <p className="text-orange-400/90 font-mono text-xs mt-0.5">@{user.username}</p>

                  <p className="text-white/60 text-xs mt-2 line-clamp-2 leading-relaxed">
                    {user.tagline || user.bio || 'Creative visual enthusiast sharing life moments & projects.'}
                  </p>

                  {/* Photos sneak peek if available */}
                  {user.photos && user.photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-1.5 mt-4">
                      {user.photos.slice(0, 4).map((p, idx) => (
                        <div
                          key={p.id || idx}
                          className="relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/5"
                        >
                          <Image src={p.url} alt="Photo" fill className="object-cover" unoptimized />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer with Views & Visit Bio CTA */}
                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px] font-mono text-white/40">
                    <span className="flex items-center gap-1">
                      <Eye size={11} className="text-orange-400" /> {views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <MousePointerClick size={11} className="text-emerald-400" /> {clicks} clicks
                    </span>
                  </div>

                  <Link
                    href={liveUrl}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-white group-hover:text-orange-400 group-hover:translate-x-1 transition-all"
                  >
                    <span>Visit Bio</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* CTA to Create Their Own Bio */}
      <div className="text-center mt-12 relative z-10">
        <Link
          href="/signup"
          className="btn-primary text-xs py-3 px-6 rounded-full inline-flex items-center gap-2 shadow-lg shadow-orange-500/20"
        >
          <Sparkles size={14} />
          <span>Build Your Own 3D Bio Profile Free 🚀</span>
        </Link>
      </div>
    </section>
  )
}
