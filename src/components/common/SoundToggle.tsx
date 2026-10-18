'use client'

import { useState, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { sounds } from '@/lib/sound-effects'

interface Props {
  className?: string
}

export default function SoundToggle({ className = '' }: Props) {
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    setEnabled(sounds.isEnabled())
  }, [])

  const handleToggle = () => {
    const newState = sounds.toggle()
    setEnabled(newState)
    if (newState) {
      sounds.playPop()
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass border border-white/10 hover:border-orange-500/40 text-xs text-white/70 hover:text-white transition-all shadow-md active:scale-95 group ${className}`}
      title={enabled ? 'Mute sound effects' : 'Unmute sound effects'}
      aria-label="Toggle sound effects"
    >
      {enabled ? (
        <>
          <Volume2 size={13} className="text-orange-400 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline text-[11px] font-mono">Sound ON</span>
        </>
      ) : (
        <>
          <VolumeX size={13} className="text-white/40" />
          <span className="hidden sm:inline text-[11px] font-mono text-white/40">Muted</span>
        </>
      )}
    </button>
  )
}
