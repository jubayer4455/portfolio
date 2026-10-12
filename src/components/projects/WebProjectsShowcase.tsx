'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  ExternalLink,
  Sparkles,
  MousePointerClick,
  Layers,
  Code2,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react'
import type { FeaturedProject } from '@/lib/projects-store'

interface Props {
  projects: FeaturedProject[]
  title?: string
  subtitle?: string
}

export default function WebProjectsShowcase({ projects, title, subtitle }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [clickedMap, setClickedMap] = useState<Record<string, number>>({})

  const featuredList = projects.filter((p) => p.is_featured !== false)
  const categories = ['All', ...Array.from(new Set(featuredList.map((p) => p.category).filter(Boolean)))]

  const filtered = selectedCategory === 'All'
    ? featuredList
    : featuredList.filter((p) => p.category === selectedCategory)

  const handleVisit = (project: FeaturedProject) => {
    try {
      fetch('/api/projects/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: project.id }),
      }).catch(() => {})
      setClickedMap((prev) => ({
        ...prev,
        [project.id]: (prev[project.id] || project.clicks || 0) + 1,
      }))
    } catch {}
  }

  if (featuredList.length === 0) return null

  return (
    <section id="projects" className="py-20 md:py-32 relative overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none blur-3xl opacity-10 -z-10"
        style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-semibold uppercase tracking-wider mb-4 shadow-lg shadow-orange-500/10">
            <Globe size={13} />
            <span>{subtitle || 'Live Web Portfolio'}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-white tracking-tight">
            {title ? (
              title
            ) : (
              <>
                Featured <span className="text-gradient">Web Projects</span>
              </>
            )}
          </h2>

          <p className="text-white/60 text-sm md:text-base mt-4 leading-relaxed">
            Real-world websites, applications, and digital platforms I have crafted.
            Explore each live project directly with 1-click preview and original website branding.
          </p>

          {/* Category Filter Pills */}
          {categories.length > 2 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
              {categories.map((cat) => (
                <button
                  key={cat as string}
                  type="button"
                  onClick={() => setSelectedCategory(cat as string)}
                  className={`text-xs px-4 py-2 rounded-xl transition-all duration-200 border ${
                    selectedCategory === cat
                      ? 'bg-orange-500 border-orange-500 text-white font-semibold shadow-lg shadow-orange-500/25 scale-105'
                      : 'glass border-white/10 text-white/60 hover:text-white hover:border-white/20'
                  }`}
                >
                  {cat as string}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map((project, idx) => {
              const domain = (() => {
                try {
                  return new URL(project.url).hostname.replace(/^www\./, '')
                } catch {
                  return project.url
                }
              })()

              const currentClicks = clickedMap[project.id] ?? (project.clicks || 0)

              return (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className="group relative flex flex-col justify-between rounded-3xl glass gradient-border p-6 md:p-7 shadow-2xl hover:border-orange-500/50 hover:shadow-orange-500/10 transition-all duration-300"
                >
                  {/* Card Content Top */}
                  <div>
                    {/* Header Row: Official Logo + Live Badge */}
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className="flex items-center gap-3.5">
                        {/* Authentic Brand Logo */}
                        <div className="w-13 h-13 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 p-2.5 flex items-center justify-center relative overflow-hidden shrink-0 group-hover:scale-110 group-hover:border-orange-500/40 transition-all duration-300 shadow-xl shadow-black/40">
                          {project.logo_url ? (
                            <Image
                              src={project.logo_url}
                              alt={`${project.title} logo`}
                              width={36}
                              height={36}
                              className="object-contain"
                              unoptimized
                            />
                          ) : (
                            <Globe size={22} className="text-orange-400" />
                          )}
                        </div>

                        <div>
                          {/* Live Domain Badge with Pulse */}
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                            <span className="truncate max-w-[140px] sm:max-w-[180px]">{domain}</span>
                          </div>

                          <h3 className="font-bold text-white text-base md:text-lg mt-1 group-hover:text-orange-400 transition-colors line-clamp-1">
                            {project.title}
                          </h3>
                        </div>
                      </div>

                      {project.category && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-white/50 shrink-0">
                          {project.category}
                        </span>
                      )}
                    </div>

                    {/* Preview Image / Screenshot (if available) */}
                    {project.preview_image && (
                      <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-4 border border-white/10 group-hover:border-orange-500/30 transition-colors shadow-lg">
                        <Image
                          src={project.preview_image}
                          alt={project.title}
                          fill
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-white/60 text-xs md:text-sm line-clamp-3 leading-relaxed mb-5">
                      {project.description || 'Interactive website built with modern web standards and responsive layout.'}
                    </p>

                    {/* Tech Stack Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {project.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/5 text-white/60 group-hover:border-orange-500/20 transition-colors"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA Bar */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-white/40 text-xs">
                      <MousePointerClick size={13} className="text-emerald-400" />
                      <span>{currentClicks} visits</span>
                    </div>

                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleVisit(project)}
                      className="btn-primary text-xs py-2 px-4 rounded-xl inline-flex items-center gap-1.5 shadow-lg shadow-orange-500/20 group/btn"
                    >
                      <span>Visit Live Website</span>
                      <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </a>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
