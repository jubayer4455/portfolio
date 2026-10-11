'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Star,
  Check,
  X,
  Trash2,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Loader2,
  RefreshCw,
  Clock,
  ShieldCheck,
  Filter
} from 'lucide-react'
import type { SiteReviewData } from '@/lib/builder-store'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<SiteReviewData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const loadReviews = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/reviews')
      const json = await res.json()
      if (res.ok && json.data) {
        setReviews(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    setActionLoading(id)
    setMessage('')
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_approved: !currentStatus }),
      })
      const data = await res.json()
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, is_approved: !currentStatus } : r))
        )
        setMessage(!currentStatus ? 'Review approved! Now showing on public site.' : 'Review hidden from site.')
        setTimeout(() => setMessage(''), 3000)
      } else {
        alert(data.error || 'Failed to update approval status.')
      }
    } catch {
      alert('Error updating review.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return

    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id))
        setMessage('Review deleted.')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch {
      alert('Failed to delete review.')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredReviews = reviews.filter((r) => {
    if (filter === 'pending') return !r.is_approved
    if (filter === 'approved') return r.is_approved
    return true
  })

  const pendingCount = reviews.filter((r) => !r.is_approved).length
  const approvedCount = reviews.filter((r) => r.is_approved).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Reviews Moderation</h1>
          <p className="text-white/40 text-xs mt-1">
            Review user submissions and approve which feedback cards appear on the homepage
          </p>
        </div>

        <button
          onClick={loadReviews}
          disabled={loading}
          className="btn-glass text-xs py-2 px-3 self-start sm:self-auto inline-flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status banner */}
      {message && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <Check size={14} />
          <span>{message}</span>
        </div>
      )}

      {/* Counters & Filter Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass gradient-border rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Total Submitted</p>
            <p className="text-2xl font-bold text-white mt-1">{reviews.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50">
            <MessageSquare size={18} />
          </div>
        </div>

        <div className="glass gradient-border rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-amber-400/80 text-xs font-medium uppercase tracking-wider">Pending Moderation</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Clock size={18} />
          </div>
        </div>

        <div className="glass gradient-border rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-emerald-400/80 text-xs font-medium uppercase tracking-wider">Approved on Site</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{approvedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={18} />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            filter === 'all'
              ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
              : 'text-white/50 hover:text-white'
          }`}
        >
          All Reviews ({reviews.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            filter === 'pending'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            filter === 'approved'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'text-white/50 hover:text-white'
          }`}
        >
          Approved on Site ({approvedCount})
        </button>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 size={24} className="animate-spin text-orange-400 mx-auto mb-2" />
          <p className="text-white/40 text-xs">Loading reviews...</p>
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map((rev) => {
            const isProcessing = actionLoading === rev.id

            return (
              <div
                key={rev.id}
                className={`glass gradient-border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all ${
                  rev.is_approved ? 'border-emerald-500/20' : 'border-amber-500/20'
                }`}
              >
                {/* Left: Review Info */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Photo */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                    {rev.user_photo ? (
                      <Image
                        src={rev.user_photo}
                        alt={rev.user_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30 text-xs font-bold">
                        {rev.user_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white text-sm">{rev.user_name}</span>

                      {rev.social_link && (
                        <a
                          href={rev.social_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-orange-400/80 hover:text-orange-300 font-mono"
                        >
                          <span>Profile</span>
                          <ExternalLink size={10} />
                        </a>
                      )}

                      {/* Status Tag */}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          rev.is_approved
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {rev.is_approved ? '✓ Approved on Site' : '⏳ Pending Approval'}
                      </span>
                    </div>

                    {/* Star Rating */}
                    <div className="flex text-amber-400 items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < (rev.rating || 5) ? 'fill-amber-400' : 'text-white/10'}
                        />
                      ))}
                      <span className="text-[10px] text-white/40 ml-1.5">
                        {new Date(rev.created_at).toLocaleString()}
                      </span>
                    </div>

                    {/* Comment */}
                    <p className="text-white/80 text-xs mt-1 leading-relaxed italic bg-white/[0.02] p-2.5 rounded-xl border border-white/5">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Right: Moderation Actions */}
                <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                  {rev.is_approved ? (
                    <button
                      onClick={() => handleToggleApproval(rev.id, true)}
                      disabled={isProcessing}
                      className="btn-glass text-xs py-1.5 px-3 text-white/60 hover:text-amber-400"
                      title="Hide review from site"
                    >
                      Hide from Site
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleApproval(rev.id, false)}
                      disabled={isProcessing}
                      className="btn-primary text-xs py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5"
                    >
                      <Check size={13} />
                      <span>Approve for Site</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(rev.id)}
                    disabled={isProcessing}
                    className="p-2 rounded-xl text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors"
                    title="Delete review"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 glass rounded-2xl border border-white/10">
          <MessageSquare size={32} className="mx-auto text-white/20 mb-2" />
          <p className="text-white/40 text-xs">No reviews found in this filter.</p>
        </div>
      )}
    </div>
  )
}
