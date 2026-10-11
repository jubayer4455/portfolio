'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Sparkles, CheckCircle2, Lock, Loader2, MessageSquareHeart } from 'lucide-react'

const emojis = ['💭', '🔥', '❤️', '☕', '🤫', '✨', '🚀']

export default function AnonymousMessageBox() {
  const [message, setMessage] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('💭')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || message.trim().length < 2) {
      setErrorMsg('Please write something before sending!')
      setStatus('error')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/messages/anonymous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          emoji: selectedEmoji,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setStatus('success')
      setMessage('')
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <section className="section-padding bg-[#090909] relative overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full opacity-[0.05] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)' }}
      />

      <div className="container-max px-4">
        <div className="max-w-xl mx-auto">
          {/* Outer glowing card */}
          <div className="relative group glass gradient-border rounded-3xl p-6 sm:p-8 shadow-2xl bg-gradient-to-b from-orange-500/[0.04] to-transparent">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-semibold mb-3">
                <Lock size={12} />
                <span>100% Anonymous &amp; Private</span>
              </div>
              <h3 className="heading-md text-white flex items-center justify-center gap-2">
                <span>Drop a Secret Note</span>
                <span className="text-xl">{selectedEmoji}</span>
              </h3>
              <p className="text-white/50 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
                Ask a question, share a secret thought, or send a warm note. No name or login required!
              </p>
            </div>

            {status === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 size={30} />
                </div>
                <h4 className="text-white font-bold text-lg">Secret Note Sent! 🎉</h4>
                <p className="text-white/60 text-xs sm:text-sm max-w-xs mx-auto">
                  Abdul Al Jubayer will read your secret message privately in his admin dashboard.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="btn-secondary text-xs px-5 py-2 mt-2"
                >
                  Send Another Note
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Emoji Pill Selector */}
                <div>
                  <label className="block text-white/50 text-[11px] font-medium uppercase tracking-wider mb-2 text-center">
                    Pick a Vibe / Emoji
                  </label>
                  <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setSelectedEmoji(emoji)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all ${
                          selectedEmoji === emoji
                            ? 'bg-orange-500/25 border-2 border-orange-500 scale-110 shadow-md shadow-orange-500/20'
                            : 'glass border border-white/10 opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea */}
                <div className="relative">
                  <textarea
                    rows={4}
                    value={message}
                    maxLength={300}
                    onChange={(e) => {
                      setMessage(e.target.value)
                      if (status === 'error') setStatus('idle')
                    }}
                    placeholder="Write anything you want to say to Jubayer..."
                    className="w-full px-4 py-3 rounded-2xl glass border border-white/15 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/60 focus:bg-white/[0.04] transition-all duration-300 resize-none"
                  />
                  <span className="absolute bottom-3 right-3 text-[10px] text-white/30 font-mono">
                    {message.length}/300
                  </span>
                </div>

                {status === 'error' && (
                  <p className="text-red-400 text-xs text-center">{errorMsg}</p>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary w-full justify-center text-sm py-3 disabled:opacity-50"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending Secretly...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Send Anonymously</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
