'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Star,
  Upload,
  User,
  Link as LinkIcon,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import Image from 'next/image'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function ReviewModal({ isOpen, onClose, onSuccess }: ReviewModalProps) {
  const [userName, setUserName] = useState('')
  const [userPhoto, setUserPhoto] = useState('')
  const [socialLink, setSocialLink] = useState('')
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')

  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (res.ok && data.publicUrl) {
        setUserPhoto(data.publicUrl)
      } else {
        setError(data.error || 'Failed to upload image.')
      }
    } catch {
      setError('Upload failed. Try entering an image URL instead.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!userName.trim()) {
      setError('Please provide your name.')
      return
    }

    if (!comment.trim()) {
      setError('Please write a short review.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: userName.trim(),
          user_photo: userPhoto.trim() || undefined,
          social_link: socialLink.trim() || undefined,
          rating,
          comment: comment.trim(),
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setSubmitted(true)
        if (onSuccess) onSuccess()
      } else {
        setError(data.error || 'Could not submit review.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetAndClose = () => {
    setSubmitted(false)
    setError('')
    setUserName('')
    setUserPhoto('')
    setSocialLink('')
    setComment('')
    setRating(5)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleResetAndClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg glass gradient-border rounded-3xl p-6 md:p-8 shadow-2xl z-10 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleResetAndClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-white/50 hover:text-white glass border border-white/10 transition-colors"
            >
              <X size={18} />
            </button>

            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold font-display text-white">Thank You for Your Review!</h3>
                <p className="text-white/60 text-xs max-w-sm mx-auto leading-relaxed">
                  Your feedback has been received and added to the admin review queue. Abdul will verify and feature it on the site.
                </p>
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="btn-primary text-xs py-2 px-6 mt-2"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-2">
                    <Star size={13} className="fill-orange-400" />
                    <span>Share Your Feedback</span>
                  </div>
                  <h2 className="text-2xl font-bold font-display text-white">Leave a Review</h2>
                  <p className="text-white/50 text-xs mt-1">
                    Your name, photo, and social link will be displayed on the site once approved.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                      Your Name *
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="text"
                        required
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="e.g. Rahim Ahmed"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/60"
                      />
                    </div>
                  </div>

                  {/* Photo (Upload or URL) */}
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                      Your Photo (Upload or URL)
                    </label>
                    <div className="flex items-center gap-3">
                      {userPhoto ? (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                          <Image src={userPhoto} alt="Reviewer" fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 flex-shrink-0">
                          <User size={20} />
                        </div>
                      )}

                      <div className="flex-1 flex gap-2">
                        <label className="btn-glass text-xs py-2 px-3 cursor-pointer inline-flex items-center gap-1.5 flex-shrink-0">
                          {uploadingPhoto ? (
                            <Loader2 size={13} className="animate-spin text-orange-400" />
                          ) : (
                            <Upload size={13} />
                          )}
                          <span>{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUpload}
                            disabled={uploadingPhoto}
                          />
                        </label>
                        <input
                          type="url"
                          value={userPhoto}
                          onChange={(e) => setUserPhoto(e.target.value)}
                          placeholder="Or paste photo URL"
                          className="flex-1 px-3 py-2 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-orange-500/60 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Profile Link */}
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                      Social Media Link (Instagram, FB, Twitter, etc.)
                    </label>
                    <div className="relative">
                      <LinkIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="url"
                        value={socialLink}
                        onChange={(e) => setSocialLink(e.target.value)}
                        placeholder="https://instagram.com/yourhandle"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/60 font-mono"
                      />
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                      Rating
                    </label>
                    <div className="flex items-center gap-2 py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            size={24}
                            className={`${
                              (hoverRating || rating) >= star
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-white/20'
                            } transition-colors`}
                          />
                        </button>
                      ))}
                      <span className="text-xs text-white/50 ml-2 font-medium">
                        {rating} out of 5 stars
                      </span>
                    </div>
                  </div>

                  {/* Review Comment */}
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                      Your Review *
                    </label>
                    <div className="relative">
                      <MessageSquare size={16} className="absolute left-3.5 top-3 text-white/30" />
                      <textarea
                        required
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What did you love about the site or bio experience?"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/60 resize-none"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                      <AlertCircle size={15} className="flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full justify-center py-3 mt-1 disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Submitting Review...</span>
                      </>
                    ) : (
                      <span>Submit Review ⭐</span>
                    )}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
