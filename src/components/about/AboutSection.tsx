'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import {
  Camera,
  Music,
  Plane,
  Coffee,
  Sparkles,
  MapPin,
  CheckCircle2,
  Quote,
  Heart,
  Compass,
} from 'lucide-react'
import type { SiteSettingsData } from '@/lib/content-store'

const passions = [
  { icon: Camera, label: 'Photography', desc: 'Chasing golden hours & street frames' },
  { icon: Plane, label: 'Wanderlust', desc: 'Exploring cities & nature escapes' },
  { icon: Coffee, label: 'Coffee Culture', desc: 'Aesthetic cafe vibes & quiet moments' },
  { icon: Music, label: 'Soundtracks', desc: 'Curating playlists & sonic moods' },
  { icon: Compass, label: 'Discovery', desc: 'Trying new foods, ideas & perspectives' },
  { icon: Heart, label: 'Connecting', desc: 'Meeting inspiring minds across the globe' },
]

export default function AboutSection({ settings }: { settings?: SiteSettingsData }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const firstName = settings?.first_name || 'Abdul Al'
  const lastName = settings?.last_name || 'Jubayer'
  const fullName = `${firstName} ${lastName}`.trim()
  const location = settings?.location || 'Dhaka, Bangladesh'
  const quote = settings?.quote_or_motto || 'Living passionately, capturing moments, and connecting with inspiring minds.'
  const avatarUrl = settings?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
  const bioP1 = settings?.bio_full_p1 || `Hey! I'm ${fullName}, a visual storyteller and lifestyle enthusiast based in ${location}.`
  const bioP2 = settings?.bio_full_p2 || "I believe life is a collection of fleeting moments waiting to be felt and preserved. Whether I'm discovering cozy aesthetic corners, traveling to scenic horizons, or meeting inspiring individuals, this platform is my personal space to stay connected."

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <section id="about" className="section-padding bg-[#0a0a0a] relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute top-1/3 left-0 w-[500px] h-[500px] rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)' }}
      />

      <div className="container-max" ref={ref}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Section heading */}
          <motion.div variants={itemVariants} className="text-center mb-14">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-1.5 h-6 rounded-full bg-orange-500" />
              <span className="text-orange-400 text-xs uppercase tracking-widest font-semibold">
                Personal Story
              </span>
              <div className="w-1.5 h-6 rounded-full bg-orange-500" />
            </div>
            <h2 className="heading-lg text-white mb-3">
              About <span className="text-gradient">Me</span>
            </h2>
            <p className="text-white/50 max-w-md mx-auto text-sm">
              Get to know the person behind the lens, the feeds, and the stories.
            </p>
          </motion.div>

          {/* Main 2-column feature card */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
            {/* Left Column: Portrait & Personal Motto */}
            <motion.div variants={itemVariants} className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden glass gradient-border shadow-2xl p-3 sm:p-4">
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-900">
                    <Image
                      src={avatarUrl}
                      alt={fullName}
                      fill
                      unoptimized
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover transition-transform duration-700 hover:scale-105"
                    />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  {/* Top verified badge */}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-white/10 backdrop-blur-md">
                    <CheckCircle2 size={15} className="text-blue-400 fill-blue-500/20" />
                    <span className="text-white text-xs font-medium">Verified Profile</span>
                  </div>

                  {/* Bottom location & name pill */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-bold text-lg">{fullName}</p>
                    <div className="flex items-center gap-1.5 text-white/70 text-xs mt-0.5">
                      <MapPin size={13} className="text-orange-400" />
                      <span>{location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Quote Card */}
              <div className="mt-4 glass gradient-border p-4 sm:p-5 rounded-2xl shadow-xl relative overflow-hidden">
                <Quote size={24} className="text-orange-500/30 absolute top-3 right-3" />
                <p className="text-white/80 text-sm italic font-serif leading-relaxed">
                  &ldquo;{quote}&rdquo;
                </p>
              </div>
            </motion.div>

            {/* Right Column: Bio Narrative & Direct Quick Links */}
            <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
              <div className="glass gradient-border rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-orange-400" />
                  <h3 className="text-white text-xl sm:text-2xl font-bold font-display">
                    Welcome to My World
                  </h3>
                </div>

                <p className="text-white/80 text-base sm:text-lg leading-relaxed font-light">
                  {bioP1}
                </p>

                <p className="text-white/60 text-sm sm:text-base leading-relaxed">
                  {bioP2}
                </p>

                <div className="pt-2 flex flex-wrap gap-3">
                  <a
                    href="#social"
                    className="btn-primary text-sm px-6 py-2.5"
                  >
                    View Social Media
                  </a>
                  <a
                    href="#contact"
                    className="px-6 py-2.5 rounded-full glass border border-white/15 text-white/80 hover:text-white hover:border-orange-500/40 text-sm font-medium transition-all"
                  >
                    Send Direct Message
                  </a>
                </div>
              </div>

              {/* Lifestyle Passions Grid */}
              <div>
                <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  What Moves Me &amp; What I Love
                </h4>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  {passions.map(({ icon: Icon, label, desc }) => (
                    <div
                      key={label}
                      className="glass gradient-border rounded-2xl p-4 flex items-start gap-3.5 group hover:border-orange-500/30 transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Icon size={18} className="text-orange-400" />
                      </div>
                      <div>
                        <h5 className="text-white font-semibold text-sm group-hover:text-orange-300 transition-colors">
                          {label}
                        </h5>
                        <p className="text-white/40 text-xs mt-0.5 leading-snug">
                          {desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
