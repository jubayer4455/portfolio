'use client'

import { useState, useEffect } from 'react'
import { BarChart3, Check, Sparkles, Users } from 'lucide-react'
import { sounds } from '@/lib/sound-effects'

export interface PollOption {
  id: string
  text: string
  votes: number
}

interface Props {
  enabled?: boolean
  question?: string
  options?: PollOption[]
  pollId?: string
  className?: string
}

const DEFAULT_OPTIONS: PollOption[] = [
  { id: '1', text: 'More 3D Creative Web Experiments 🚀', votes: 42 },
  { id: '2', text: 'Behind-the-scenes Vlog & Photography 📸', votes: 28 },
  { id: '3', text: 'Interactive Digital Design Tutorials 💡', votes: 35 },
  { id: '4', text: 'Open-Source Next.js Starters & Templates ⚡', votes: 51 },
]

export default function InteractivePollCard({
  enabled = true,
  question = 'What project or content should I build next? 📊',
  options = DEFAULT_OPTIONS,
  pollId = 'master_poll_2026',
  className = '',
}: Props) {
  const [pollOptions, setPollOptions] = useState<PollOption[]>(options)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [votingLoading, setVotingLoading] = useState(false)

  useEffect(() => {
    setPollOptions(options.length > 0 ? options : DEFAULT_OPTIONS)
  }, [options])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const votedId = localStorage.getItem(`aj_poll_voted_${pollId}`)
    if (votedId) {
      setSelectedOption(votedId)
      setHasVoted(true)
    }
  }, [pollId])

  const totalVotes = pollOptions.reduce((acc, opt) => acc + (opt.votes || 0), 0)

  const handleVote = async (optionId: string) => {
    if (hasVoted || votingLoading) return
    setVotingLoading(true)
    sounds.playSuccess()

    // Optimistic update
    setSelectedOption(optionId)
    setHasVoted(true)
    setPollOptions((prev) =>
      prev.map((opt) => (opt.id === optionId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt))
    )

    if (typeof window !== 'undefined') {
      localStorage.setItem(`aj_poll_voted_${pollId}`, optionId)
    }

    try {
      await fetch('/api/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, optionId }),
      })
    } catch {} finally {
      setVotingLoading(false)
    }
  }

  if (!enabled) return null

  return (
    <div
      className={`glass gradient-border rounded-3xl p-5 sm:p-6 shadow-2xl border border-white/10 relative overflow-hidden transition-all duration-300 hover:border-orange-500/40 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
          <BarChart3 size={12} />
          <span>COMMUNITY POLL</span>
        </div>
        <span className="text-white/40 text-[11px] font-mono flex items-center gap-1">
          <Users size={12} />
          {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
        </span>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-white mb-4 leading-snug">
        {question}
      </h3>

      {/* Options List */}
      <div className="space-y-2.5">
        {pollOptions.map((opt) => {
          const count = opt.votes || 0
          const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
          const isSelected = selectedOption === opt.id

          return (
            <button
              key={opt.id}
              type="button"
              disabled={hasVoted}
              onClick={() => handleVote(opt.id)}
              className={`w-full relative overflow-hidden rounded-2xl p-3.5 text-left transition-all duration-300 border ${
                isSelected
                  ? 'border-orange-500 bg-orange-500/10'
                  : hasVoted
                  ? 'border-white/10 bg-white/[0.03]'
                  : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-orange-500/40 active:scale-[0.99] cursor-pointer'
              }`}
            >
              {/* Animated Progress Fill (only when voted) */}
              {hasVoted && (
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500/20 to-orange-500/10 rounded-2xl transition-all duration-700 ease-out pointer-events-none"
                  style={{ width: `${Math.max(percentage, 4)}%` }}
                />
              )}

              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500 text-white'
                        : 'border-white/30 text-transparent'
                    }`}
                  >
                    <Check size={11} className={isSelected ? 'block' : 'hidden'} />
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-medium truncate ${
                      isSelected ? 'text-white font-semibold' : 'text-white/80'
                    }`}
                  >
                    {opt.text}
                  </span>
                </div>

                {hasVoted && (
                  <span className="text-xs font-mono font-bold text-orange-400 shrink-0">
                    {percentage}%
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {hasVoted && (
        <p className="text-[11px] text-white/40 font-mono mt-3 text-center">
          ✓ Your vote has been recorded! Thank you for participating.
        </p>
      )}
    </div>
  )
}
