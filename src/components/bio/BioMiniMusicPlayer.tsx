'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Disc3, Volume2, VolumeX } from 'lucide-react'

interface Props {
  enabled?: boolean
  title?: string
  audioUrl?: string
  themeColor?: string
}

export default function BioMiniMusicPlayer({
  enabled = false,
  title = 'Lofi Chill Vibes 🎧',
  audioUrl = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
  themeColor = '#F97316',
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  if (!enabled || !audioUrl) return null

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false))
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    audioRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  return (
    <div className="fixed bottom-5 left-5 z-40">
      <audio ref={audioRef} src={audioUrl} loop preload="none" />

      <div className="glass gradient-border rounded-full p-2 pl-3 flex items-center gap-3 shadow-2xl backdrop-blur-xl border border-white/10 hover:border-orange-500/40 transition-all group">
        {/* Spinning Vinyl Record Icon */}
        <div
          className={`w-8 h-8 rounded-full bg-gradient-to-tr from-black via-zinc-900 to-zinc-700 flex items-center justify-center border border-white/20 shadow-md ${
            isPlaying ? 'animate-spin' : ''
          }`}
          style={{ animationDuration: '4s' }}
        >
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-black" />
        </div>

        <div className="max-w-[130px] sm:max-w-[160px] min-w-0">
          <p className="text-white text-[11px] font-bold truncate leading-tight">{title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
            <span className="text-[10px] text-white/40 font-mono">
              {isPlaying ? 'Playing' : 'Audio Track'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-transform hover:scale-105 shadow-md shadow-orange-500/30"
          title={isPlaying ? 'Pause Track' : 'Play Track'}
        >
          {isPlaying ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
        </button>

        {isPlaying && (
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 text-white/40 hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
        )}
      </div>
    </div>
  )
}
