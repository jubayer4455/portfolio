'use client'

import { useState } from 'react'
import { MessageSquareHeart, Send, Sparkles, Check, Loader2 } from 'lucide-react'

interface Props {
  username: string
  displayName: string
  themeColor?: string
}

export default function UserAnonymousBox({ username, displayName, themeColor = '#F97316' }: Props) {
  const [message, setMessage] = useState('')
  const [emoji, setEmoji] = useState('💭')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const emojis = ['💭', '✨', '🔥', '💖', '👀', '🤫', '☕', '🎉']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || sending) return

    setSending(true)
    try {
      const res = await fetch('/api/user/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          message: message.trim(),
          emoji,
        }),
      })

      if (res.ok) {
        setSent(true)
        setMessage('')
        setTimeout(() => setSent(false), 5000)
      } else {
        alert('Could not send note. Please try again.')
      }
    } catch {
      alert('Network error.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="glass gradient-border rounded-3xl p-6 md:p-7 relative overflow-hidden shadow-2xl mb-8">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
          <MessageSquareHeart size={16} />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">Send a Secret Note to @{username}</h3>
          <p className="text-white/40 text-[11px]">100% anonymous • No signup required</p>
        </div>
      </div>

      {sent ? (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2 mt-4 animate-in fade-in duration-300">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Check size={20} />
          </div>
          <p className="text-white font-bold text-xs">Secret Note Sent! 💌</p>
          <p className="text-white/50 text-[11px]">
            {displayName} will see your message in their private creator dashboard.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 space-y-3">
          {/* Emoji Picker */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[10px] text-white/40 uppercase font-mono mr-1">Mood:</span>
            {emojis.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setEmoji(em)}
                className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                  emoji === em ? 'bg-white/20 scale-110 ring-1 ring-white/40' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {em}
              </button>
            ))}
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Write something honest or ask @${username} a question...`}
              maxLength={300}
              required
              className="w-full px-3.5 py-2.5 rounded-2xl glass border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-pink-500/50 resize-none leading-relaxed"
            />
            <span className="absolute bottom-2.5 right-3 text-[10px] text-white/30 font-mono">
              {message.length}/300
            </span>
          </div>

          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 shadow-lg shadow-pink-500/20 hover:opacity-95 transition-opacity disabled:opacity-50"
          >
            {sending ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Sending Secretly...</span>
              </>
            ) : (
              <>
                <Send size={13} />
                <span>Send Secret Note {emoji}</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
