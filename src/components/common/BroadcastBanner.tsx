'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, X, ArrowRight, Bell } from 'lucide-react'

export interface BroadcastData {
  enabled: boolean
  message: string
  badge_text: string
  badge_color: 'orange' | 'emerald' | 'cyan' | 'purple' | 'pink'
  link_url?: string
  link_label?: string
  dismissible: boolean
}

export default function BroadcastBanner() {
  const [data, setData] = useState<BroadcastData | null>(null)
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    // Check if dismissed in this session
    try {
      const isDismissed = sessionStorage.getItem('aj_broadcast_dismissed')
      if (isDismissed) return
    } catch {}

    fetch('/api/admin/broadcast')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data && json.data.enabled) {
          setData(json.data)
          setDismissed(false)
        }
      })
      .catch(() => {})
  }, [])

  if (!data || !data.enabled || dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    try {
      sessionStorage.setItem('aj_broadcast_dismissed', 'true')
    } catch {}
  }

  const badgeColors: Record<string, string> = {
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  }

  const badgeClass = badgeColors[data.badge_color] || badgeColors.orange

  return (
    <div className="relative w-full bg-gradient-to-r from-orange-950/40 via-[#0c0c0c] to-black border-b border-orange-500/20 px-4 py-2 z-50 text-white backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${badgeClass} shrink-0`}
          >
            <Sparkles size={10} />
            <span>{data.badge_text || 'NOTICE'}</span>
          </span>

          <p className="font-medium text-white/90 truncate text-xs sm:text-[13px]">
            {data.message}
          </p>

          {data.link_url && (
            <Link
              href={data.link_url}
              className="hidden sm:inline-flex items-center gap-1 text-orange-400 font-semibold hover:underline shrink-0 ml-1"
            >
              <span>{data.link_label || 'Learn more'}</span>
              <ArrowRight size={12} />
            </Link>
          )}
        </div>

        {data.dismissible && (
          <button
            onClick={handleDismiss}
            className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
            title="Dismiss notice"
            aria-label="Dismiss notice"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
