'use client'

import { useState } from 'react'
import { Play, Music, Video, ExternalLink } from 'lucide-react'
import { sounds } from '@/lib/sound-effects'

interface Props {
  enabled?: boolean
  type?: 'youtube' | 'spotify'
  url?: string
  title?: string
  className?: string
}

function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}

function formatSpotifyEmbedUrl(url: string): string {
  if (!url) return ''
  if (url.includes('/embed/')) return url
  return url.replace('open.spotify.com/', 'open.spotify.com/embed/')
}

export default function MediaEmbedCard({
  enabled = true,
  type = 'youtube',
  url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  title = 'Featured Video / Music 📺',
  className = '',
}: Props) {
  const [isPlaying, setIsPlaying] = useState(false)

  if (!enabled || !url) return null

  const isYouTube = type === 'youtube' || url.includes('youtube.com') || url.includes('youtu.be')
  const ytId = isYouTube ? extractYouTubeId(url) : null
  const spotifyEmbedUrl = !isYouTube ? formatSpotifyEmbedUrl(url) : ''

  return (
    <div
      className={`glass gradient-border rounded-3xl p-4 sm:p-5 shadow-2xl border border-white/10 relative overflow-hidden transition-all duration-300 hover:border-orange-500/40 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          {isYouTube ? (
            <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-500">
              <Video size={14} />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Music size={14} />
            </div>
          )}
          <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => sounds.playClick()}
          className="text-white/40 hover:text-white transition-colors p-1"
          title="Open in new tab"
        >
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Media Player Container */}
      <div className="rounded-2xl overflow-hidden bg-black/60 border border-white/10 relative aspect-video w-full shadow-inner flex items-center justify-center">
        {isYouTube && ytId ? (
          isPlaying ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
              title={title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div
              className="relative w-full h-full cursor-pointer group"
              onClick={() => {
                sounds.playPop()
                setIsPlaying(true)
              }}
            >
              {/* YouTube Thumbnail */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-red-600/90 group-hover:bg-red-600 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play size={24} className="translate-x-0.5 fill-white" />
                </div>
              </div>
            </div>
          )
        ) : !isYouTube && spotifyEmbedUrl ? (
          <iframe
            src={spotifyEmbedUrl}
            title={title}
            className="w-full h-full border-0 rounded-2xl"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        ) : (
          <div className="text-white/40 text-xs font-mono p-4 text-center">
            Invalid media URL provided.
          </div>
        )}
      </div>
    </div>
  )
}
