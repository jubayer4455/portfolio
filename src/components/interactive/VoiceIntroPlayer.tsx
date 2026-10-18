'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Play, Pause, Volume2, Sparkles } from 'lucide-react'
import { sounds } from '@/lib/sound-effects'

interface Props {
  enabled?: boolean
  title?: string
  audioUrl?: string
  authorName?: string
  className?: string
}

const DEFAULT_AUDIO = 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3'

export default function VoiceIntroPlayer({
  enabled = true,
  title = 'Listen to my Voice Greeting 🎙️',
  audioUrl,
  authorName = 'Abdul Al Jubayer',
  className = '',
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const finalUrl = audioUrl && audioUrl.trim().length > 5 ? audioUrl : DEFAULT_AUDIO

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 15)
    }

    const handleTimeUpdate = () => {
      if (!audio.duration) return
      setCurrentTime(audio.currentTime)
      setProgress((audio.currentTime / audio.duration) * 100)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
      setCurrentTime(0)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [finalUrl])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    sounds.playClick()

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        setIsPlaying(false)
      })
    }
  }

  if (!enabled) return null

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s < 10 ? '0' : ''}${s}`
  }

  return (
    <div
      className={`glass gradient-border rounded-2xl p-3.5 sm:p-4 shadow-xl border border-white/10 relative overflow-hidden group transition-all duration-300 hover:border-orange-500/40 ${className}`}
    >
      <audio ref={audioRef} src={finalUrl} preload="metadata" />

      {/* Ambient background glow while playing */}
      {isPlaying && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-orange-500/10 animate-pulse pointer-events-none" />
      )}

      <div className="relative z-10 flex items-center gap-3">
        {/* Play/Pause Tactile Circle Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-11 h-11 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 transition-all duration-200 flex-shrink-0"
          title={isPlaying ? 'Pause voice intro' : 'Play voice intro'}
          aria-label="Toggle voice intro playback"
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="translate-x-0.5" />}
        </button>

        {/* Info & Soundwave */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <Mic size={13} className="text-orange-400 flex-shrink-0" />
              <p className="text-xs font-semibold text-white truncate">{title}</p>
            </div>
            <span className="text-[10px] font-mono text-white/50 shrink-0">
              {formatTime(currentTime)} / {formatTime(duration || 15)}
            </span>
          </div>

          {/* Equalizer Waveform Bars / Progress Bar */}
          <div className="mt-2 flex items-center gap-1">
            {[40, 75, 55, 90, 60, 100, 70, 85, 45, 95, 65, 80, 50, 70, 60].map((h, i) => {
              const active = isPlaying && (i / 15) * 100 <= progress
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-150 ${
                    active ? 'bg-orange-400 shadow-sm shadow-orange-400/50' : 'bg-white/15'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(6, (h * Math.random()) * 0.22)}px` : `${h * 0.18}px`,
                  }}
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
