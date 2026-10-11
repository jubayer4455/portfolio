'use client'

import { useState } from 'react'
import { Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react'

interface ShareBarProps {
  title: string
  pageUrl: string
}

export default function ShareBar({ title, pageUrl }: ShareBarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <div className="flex gap-3">
      <a
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(pageUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl glass text-white/60 hover:text-blue-400 hover:border-blue-500/30 transition-all text-xs"
      >
        <Twitter size={14} /> Twitter
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl glass text-white/60 hover:text-blue-600 hover:border-blue-600/30 transition-all text-xs"
      >
        <Linkedin size={14} /> LinkedIn
      </a>
      <button
        onClick={handleCopy}
        title={copied ? 'Link copied!' : 'Copy link'}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass text-white/60 hover:text-orange-400 hover:border-orange-500/30 transition-all text-xs"
      >
        {copied ? <Check size={14} className="text-green-400" /> : <LinkIcon size={14} />}
      </button>
    </div>
  )
}
