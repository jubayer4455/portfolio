'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, MessageSquare, ExternalLink, Sparkles, User, Plus } from 'lucide-react'
import ReviewModal from './ReviewModal'
import type { SiteReviewData } from '@/lib/builder-store'

interface ReviewsSectionProps {
  initialReviews?: SiteReviewData[]
}

export default function ReviewsSection({ initialReviews = [] }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<SiteReviewData[]>(initialReviews)
  const [modalOpen, setModalOpen] = useState(false)

  const handleRefresh = async () => {
    try {
      const res = await fetch('/api/reviews')
      const json = await res.json()
      if (res.ok && json.data) {
        setReviews(json.data)
      }
    } catch {}
  }

  // Calculate average rating
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
      : '5.0'

  return (
    <section id="reviews" className="py-24 relative overflow-hidden bg-[#080808]/50">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full pointer-events-none blur-3xl opacity-10"
        style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)' }}
      />

      <div className="container-max px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-3">
              <Sparkles size={13} />
              <span>Community Feedback</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold font-display text-white tracking-tight">
              What People Are Saying
            </h2>
            <p className="text-white/50 text-sm mt-2 max-w-lg">
              Honest impressions, reviews, and feedback from visitors and bio site builders.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Avg Rating Pill */}
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-2xl border border-white/10">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className="fill-amber-400" />
                ))}
              </div>
              <span className="text-white font-bold text-sm">{avgRating}</span>
              <span className="text-white/40 text-xs">({reviews.length} reviews)</span>
            </div>

            {/* Write Review Button */}
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary text-xs py-2.5 px-4 shadow-lg shadow-orange-500/20"
            >
              <Plus size={14} />
              <span>Leave a Review</span>
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((rev, index) => (
              <motion.div
                key={rev.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="glass gradient-border rounded-3xl p-6 flex flex-col justify-between hover:border-orange-500/30 transition-all duration-300 group"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mb-4 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={15}
                        className={i < (rev.rating || 5) ? 'fill-amber-400' : 'text-white/15'}
                      />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="text-white/80 text-sm leading-relaxed mb-6 italic">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                </div>

                {/* Reviewer Details */}
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                      {rev.user_photo ? (
                        <Image
                          src={rev.user_photo}
                          alt={rev.user_name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/40">
                          <User size={18} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-xs">{rev.user_name}</p>
                      <p className="text-white/40 text-[10px]">
                        {new Date(rev.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Reviewer Social Link */}
                  {rev.social_link && (
                    <a
                      href={rev.social_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl glass border border-white/10 text-white/40 hover:text-orange-400 hover:border-orange-500/30 transition-all text-xs"
                      title="Visit reviewer social profile"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 glass rounded-3xl border border-white/10 max-w-lg mx-auto p-8">
            <MessageSquare size={36} className="mx-auto text-white/20 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Reviews Yet</h3>
            <p className="text-white/40 text-xs mb-5">
              Be the very first visitor to review this site and leave your thoughts!
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-2"
            >
              <Plus size={14} />
              <span>Write the First Review</span>
            </button>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleRefresh}
      />
    </section>
  )
}
