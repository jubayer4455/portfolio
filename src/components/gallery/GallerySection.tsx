'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import {
  X,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Camera,
  Sparkles,
  Compass,
  Coffee,
  Sun,
  Heart,
} from 'lucide-react'

import type { GalleryImageData } from '@/lib/content-store'

export interface GalleryItem {
  id: string
  title: string
  category: string
  src: string
  width: number
  height: number
  slug: string
  description: string
  likes_count?: number
}

const fallbackItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Golden Hour Portrait',
    category: 'Portraits',
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    width: 800,
    height: 1000,
    slug: 'golden-hour-portrait',
    description: 'Caught under the soft rays of evening golden hour.',
    likes_count: 46,
  },
  {
    id: '2',
    title: 'Morning Brew & Cafe Reads',
    category: 'Lifestyle',
    src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
    width: 800,
    height: 600,
    slug: 'morning-brew-lifestyle',
    description: 'Slow morning coffee rituals and peaceful vibes.',
    likes_count: 31,
  },
  {
    id: '3',
    title: 'Kyoto Wanderlust',
    category: 'Travel',
    src: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
    width: 800,
    height: 550,
    slug: 'kyoto-wanderlust',
    description: 'Walking through ancient streets surrounded by bamboo and lanterns.',
    likes_count: 58,
  },
  {
    id: '4',
    title: 'Rooftop Sunset Horizon',
    category: 'Vibes',
    src: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=800&q=80',
    width: 800,
    height: 600,
    slug: 'rooftop-sunset-horizon',
    description: 'Chilling at dusk watching the cityscape turn into glowing lights.',
    likes_count: 27,
  },
  {
    id: '5',
    title: 'Minimal Studio Portrait',
    category: 'Portraits',
    src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    width: 800,
    height: 950,
    slug: 'minimal-studio-portrait',
    description: 'High contrast black and white portrait study.',
    likes_count: 39,
  },
  {
    id: '6',
    title: 'Mountain Serenity',
    category: 'Travel',
    src: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    width: 800,
    height: 600,
    slug: 'mountain-serenity',
    description: 'High altitude breathing and mirror-calm mountain lake.',
    likes_count: 64,
  },
  {
    id: '7',
    title: 'Neon Night Walk',
    category: 'Vibes',
    src: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
    width: 800,
    height: 700,
    slug: 'neon-night-walk',
    description: 'Rain-slicked asphalt reflecting vivid neon glow.',
    likes_count: 33,
  },
  {
    id: '8',
    title: 'Creative Aesthetic Corner',
    category: 'Lifestyle',
    src: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80',
    width: 800,
    height: 550,
    slug: 'creative-aesthetic-corner',
    description: 'Warm ambient lighting, journal, camera, and everyday essentials.',
    likes_count: 22,
  },
]

// Story highlights categories mapping
const highlightTabs = [
  { label: 'All', icon: Sparkles, emoji: '✨' },
  { label: 'Portraits', icon: Camera, emoji: '📸' },
  { label: 'Travel', icon: Compass, emoji: '✈️' },
  { label: 'Lifestyle', icon: Coffee, emoji: '☕' },
  { label: 'Vibes', icon: Sun, emoji: '🌅' },
]

// ── Like Button ──────────────────────────────────────────────────────────────
function LikeButton({
  itemId,
  initialLikes = 0,
  size = 'sm',
}: {
  itemId: string
  initialLikes?: number
  size?: 'sm' | 'md'
}) {
  const [likes, setLikes] = useState(initialLikes)
  const [liked, setLiked] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`liked_${itemId}`)
      if (saved === 'true') setLiked(true)
    } catch {}
  }, [itemId])

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    const nextLiked = !liked
    setLiked(nextLiked)
    setLikes((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)))
    setAnimating(true)
    setTimeout(() => setAnimating(false), 600)

    try {
      localStorage.setItem(`liked_${itemId}`, String(nextLiked))
      if (nextLiked) {
        fetch(`/api/gallery/${itemId}/like`, { method: 'POST' }).catch(() => {})
      }
    } catch {}
  }

  return (
    <button
      onClick={handleLike}
      className={`relative inline-flex items-center gap-1.5 rounded-full glass border transition-all duration-300 ${
        liked
          ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
          : 'border-white/10 text-white/70 hover:text-white hover:border-white/30'
      } ${size === 'md' ? 'px-3.5 py-1.5 text-xs' : 'px-2.5 py-1 text-[11px]'}`}
      title={liked ? 'Liked!' : 'Like this photo'}
    >
      <Heart
        size={size === 'md' ? 15 : 13}
        className={`transition-transform duration-300 ${
          liked ? 'fill-rose-500 text-rose-500' : ''
        } ${animating ? 'scale-125' : ''}`}
      />
      <span className="font-semibold">{likes}</span>
    </button>
  )
}

function GalleryCard({
  item,
  onClick,
}: {
  item: GalleryItem
  onClick: (item: GalleryItem) => void
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const rafRef = useRef<number | null>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) return
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      if (card) {
        card.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) scale(1.02)`
      }
    })
  }

  const handleMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)'
    }
  }

  return (
    <div
      ref={cardRef}
      onClick={() => onClick(item)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative group cursor-pointer rounded-2xl overflow-hidden glass gradient-border transition-all duration-300"
      style={{ transition: 'transform 0.15s ease' }}
      role="button"
      tabIndex={0}
      aria-label={`View ${item.title}`}
      onKeyDown={(e) => e.key === 'Enter' && onClick(item)}
    >
      <div
        className="relative w-full overflow-hidden bg-neutral-900"
        style={{ paddingBottom: `${((item.height || 600) / (item.width || 800)) * 100}%` }}
      >
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 bg-white/[0.04] animate-pulse" />
        )}

        {imgError ? (
          <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center p-4 text-center">
            <Camera size={26} className="text-orange-400 mb-2 opacity-60" />
            <p className="text-white font-medium text-xs line-clamp-1">{item.title}</p>
            <span className="text-[10px] text-white/40 mt-1">{item.category}</span>
          </div>
        ) : (
          <Image
            src={item.src}
            alt={`${item.title} — ${item.category} Photography by Abdul Al Jubayer | Visual Diary`}
            title={`${item.title} | Abdul Al Jubayer Visual Diary`}
            fill
            unoptimized
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`object-cover transition-all duration-700 group-hover:scale-105 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Floating Like Badge on Top-Right */}
        <div className="absolute top-3 right-3 z-10">
          <LikeButton itemId={item.id} initialLikes={item.likes_count || 12} />
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-[11px] font-medium mb-1">
              {item.category}
            </span>
            <p className="text-white font-semibold text-sm line-clamp-1">{item.title}</p>
            {item.description && (
              <p className="text-white/60 text-xs mt-0.5 line-clamp-1">{item.description}</p>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-500/90 shadow-lg shadow-orange-500/30 flex items-center justify-center flex-shrink-0 ml-2">
            <ZoomIn size={18} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({
  item,
  items,
  onClose,
  onPrev,
  onNext,
}: {
  item: GalleryItem
  items: GalleryItem[]
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const currentIndex = items.findIndex((i) => i.id === item.id)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [item.id])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onClose, onPrev, onNext])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 backdrop-blur-md p-4 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative max-w-4xl max-h-[92vh] w-full glass rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex-1 min-h-[300px] sm:min-h-[480px] bg-black/60 flex items-center justify-center">
          {imgError ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-white/50">
              <Camera size={36} className="text-orange-400 mb-2 opacity-60" />
              <p className="text-white text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-white/40 mt-1">Image preview not available</p>
            </div>
          ) : (
            <Image
              src={item.src}
              alt={`${item.title} — Full HD ${item.category} capture by Abdul Al Jubayer | Visual Diary`}
              title={`${item.title} | ${item.category}`}
              fill
              unoptimized
              className="object-contain"
              priority
              onError={() => setImgError(true)}
            />
          )}
        </div>
        <div className="p-5 sm:p-6 border-t border-white/10 bg-neutral-950/70 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-medium">
                {item.category}
              </span>
              <span className="text-white/40 text-xs">
                {currentIndex + 1} of {items.length}
              </span>
            </div>
            <h3 className="text-white font-semibold text-lg">{item.title}</h3>
            {item.description && (
              <p className="text-white/60 text-sm mt-1">{item.description}</p>
            )}
          </div>

          {/* Like button in lightbox */}
          <div className="flex-shrink-0">
            <LikeButton itemId={item.id} initialLikes={item.likes_count || 12} size="md" />
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:text-orange-400 transition-colors z-10"
          aria-label="Close lightbox"
        >
          <X size={20} />
        </button>

        {/* Previous Button */}
        {currentIndex > 0 && (
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:text-orange-400 transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={22} />
          </button>
        )}

        {/* Next Button */}
        {currentIndex < items.length - 1 && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white hover:text-orange-400 transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}

// ── Main section ─────────────────────────────────────────────────────────────
interface GallerySectionProps {
  items?: GalleryImageData[]
  title?: string
  subtitle?: string
}

export default function GallerySection({ items, title, subtitle }: GallerySectionProps) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const displayItems: GalleryItem[] = Array.isArray(items)
    ? items
        .filter((i) => i.is_public !== false)
        .map((i) => ({
          id: i.id,
          title: i.title,
          category: i.category || 'Lifestyle',
          src: i.public_url || `https://picsum.photos/seed/${i.slug || i.id}/800/600`,
          width: i.width || 800,
          height: i.height || 600,
          slug: i.slug,
          description: i.description || '',
          likes_count: i.likes_count || 12,
        }))
    : fallbackItems

  // Filter items
  const filtered = activeCategory === 'All'
    ? displayItems
    : displayItems.filter((i) => i.category.toLowerCase() === activeCategory.toLowerCase())

  const handleNext = useCallback(() => {
    if (!lightboxItem) return
    const idx = filtered.findIndex((i) => i.id === lightboxItem.id)
    if (idx < filtered.length - 1) setLightboxItem(filtered[idx + 1])
  }, [lightboxItem, filtered])

  const handlePrev = useCallback(() => {
    if (!lightboxItem) return
    const idx = filtered.findIndex((i) => i.id === lightboxItem.id)
    if (idx > 0) setLightboxItem(filtered[idx - 1])
  }, [lightboxItem, filtered])

  return (
    <section id="gallery" className="section-padding bg-[#080808] relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.04] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)' }}
      />

      <div className="container-max" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-1.5 h-6 rounded-full bg-orange-500" />
            <span className="text-orange-400 text-xs uppercase tracking-widest font-semibold">
              {subtitle || 'Visual Diary'}
            </span>
            <div className="w-1.5 h-6 rounded-full bg-orange-500" />
          </div>
          <h2 className="heading-lg text-white mb-3">
            {title ? (
              title
            ) : (
              <>
                Captured <span className="text-gradient">Moments</span>
              </>
            )}
          </h2>
          <p className="text-white/50 max-w-md mx-auto text-sm">
            A personal visual journal of travels, portraits, everyday aesthetics, and memorable vibes.
          </p>
        </motion.div>

        {/* ── Instagram Story-Style Highlight Circles ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-start sm:justify-center gap-4 sm:gap-6 overflow-x-auto pb-4 mb-10 no-scrollbar px-2"
        >
          {highlightTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeCategory === tab.label

            return (
              <button
                key={tab.label}
                onClick={() => setActiveCategory(tab.label)}
                className="flex flex-col items-center gap-2 group flex-shrink-0 transition-transform active:scale-95"
              >
                {/* Story Ring */}
                <div
                  className={`relative p-[2.5px] rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-tr from-orange-500 via-amber-500 to-rose-500 shadow-lg shadow-orange-500/25 scale-105'
                      : 'bg-white/10 group-hover:bg-white/25'
                  }`}
                >
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#121212] p-1 flex items-center justify-center relative overflow-hidden">
                    <div
                      className={`w-full h-full rounded-full flex flex-col items-center justify-center transition-all ${
                        isActive
                          ? 'bg-gradient-to-b from-orange-500/20 to-amber-500/10 text-orange-400'
                          : 'bg-white/5 text-white/60 group-hover:text-white'
                      }`}
                    >
                      <Icon size={20} className={isActive ? 'text-orange-400' : 'text-white/70'} />
                      <span className="text-[11px] mt-0.5">{tab.emoji}</span>
                    </div>
                  </div>

                  {isActive && (
                    <motion.div
                      layoutId="active-story-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-orange-400 shadow-sm shadow-orange-400"
                    />
                  )}
                </div>

                {/* Story Label */}
                <span
                  className={`text-xs font-medium tracking-wide transition-colors ${
                    isActive ? 'text-orange-400 font-semibold' : 'text-white/60 group-hover:text-white'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </motion.div>

        {/* Masonry Grid */}
        <motion.div
          layout
          className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="break-inside-avoid mb-5"
              >
                <GalleryCard item={item} onClick={setLightboxItem} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-white/30 text-sm">
            No photos in this category yet.
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxItem && (
          <Lightbox
            item={lightboxItem}
            items={filtered}
            onClose={() => setLightboxItem(null)}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
