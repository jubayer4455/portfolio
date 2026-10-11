'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react'

interface MusicPlayerProps {
  enabled?: boolean
  title?: string
  audioUrl?: string
}

export default function MusicPlayer({
  enabled = true,
  title = 'Lofi Sunset Chill 🎧',
  audioUrl = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (!audioRef.current && audioUrl) {
      const audio = new Audio(audioUrl)
      audio.loop = true
      audio.volume = 0.4
      audioRef.current = audio

      audio.onended = () => setIsPlaying(false)
      audio.onpause = () => setIsPlaying(false)
      audio.onplay = () => setIsPlaying(true)
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [audioUrl])

  const togglePlay = () => {
    setHasInteracted(true)
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Audio playback error:', err)
          setIsPlaying(false)
        })
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !isMuted
    setIsMuted(!isMuted)
  }

  if (!enabled) return null

  return (
    <div className="fixed bottom-5 left-5 z-40 select-none">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="group relative flex items-center gap-3 px-3.5 py-2.5 rounded-full glass border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl hover:border-orange-500/40 transition-all duration-300"
      >
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-orange-500/30 hover:scale-105 active:scale-95 transition-transform"
          aria-label={isPlaying ? 'Pause ambient music' : 'Play ambient music'}
          title={isPlaying ? 'Pause' : 'Play ambient sound'}
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>

        {/* Title and Animated Visualizer Bars */}
        <div className="flex items-center gap-2.5 cursor-pointer pr-1" onClick={togglePlay}>
          {/* Animated sound wave bars */}
          <div className="flex items-end gap-[2px] h-3.5 w-4">
            <span
              className={`w-[2.5px] rounded-full bg-orange-400 transition-all ${
                isPlaying ? 'animate-[bounce_0.8s_ease-in-out_infinite] h-3.5' : 'h-1'
              }`}
            />
            <span
              className={`w-[2.5px] rounded-full bg-orange-500 transition-all ${
                isPlaying ? 'animate-[bounce_1.2s_ease-in-out_infinite] h-2.5' : 'h-1'
              }`}
            />
            <span
              className={`w-[2.5px] rounded-full bg-amber-400 transition-all ${
                isPlaying ? 'animate-[bounce_0.6s_ease-in-out_infinite] h-3' : 'h-1'
              }`}
            />
            <span
              className={`w-[2.5px] rounded-full bg-orange-400 transition-all ${
                isPlaying ? 'animate-[bounce_1s_ease-in-out_infinite] h-2' : 'h-1'
              }`}
            />
          </div>

          <span className="text-white/80 text-xs font-medium tracking-wide max-w-[120px] sm:max-w-[160px] truncate">
            {title}
          </span>
        </div>

        {/* Mute button */}
        {isPlaying && (
          <button
            onClick={toggleMute}
            className="w-6 h-6 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
        )}

        {/* Pulse dot when active */}
        {isPlaying && (
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
        )}
      </motion.div>
    </div>
  )
}
