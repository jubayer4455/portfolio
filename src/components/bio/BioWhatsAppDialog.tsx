'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Send,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  CheckCheck,
  Zap,
} from 'lucide-react'
import type { UserBioData } from '@/lib/builder-store'

interface Props {
  bio: UserBioData
}

export default function BioWhatsAppDialog({ bio }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const rawNumber = bio.whatsapp_number || bio.phone || ''
  const cleanNumber = rawNumber.replace(/[^0-9]/g, '')

  // Default initial message
  const defaultInitialMsg =
    bio.whatsapp_message ||
    `Hi ${bio.display_name}, I just saw your 3D bio page and wanted to connect with you!`

  const [message, setMessage] = useState(defaultInitialMsg)

  // If WhatsApp is disabled or no phone number is provided, don't show
  if (bio.whatsapp_enabled === false || !cleanNumber) {
    return null
  }

  const quickPrompts = [
    '💼 Discuss a Project / Collaboration',
    '👋 Just saying Hi & wanted to connect!',
    '🔥 Loved your 3D Bio Profile!',
  ]

  const handleStartChat = () => {
    const textParam = encodeURIComponent(message.trim())
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${textParam}`
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    setIsOpen(false)
  }

  return (
    <>
      {/* ── FLOATING TRIGGER BUTTON ──────────────────────────── */}
      <div className="fixed bottom-6 right-5 sm:right-7 z-40 select-none">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.5 }}
          className="relative"
        >
          {/* Pulsing online glow */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#0a0a0a]" />
          </span>

          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-tr from-[#128C7E] to-[#25D366] text-white font-medium text-xs sm:text-sm shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
            title="Chat directly on WhatsApp (No contact saving required)"
          >
            {/* WhatsApp SVG Logo */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.585 1.961.948 2.801.948h.005c3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.735-5.778-5.735zm3.364 8.21c-.143.402-.828.775-1.144.821-.299.043-.687.068-2.029-.488-1.716-.71-2.822-2.456-2.908-2.57-.085-.114-.694-.925-.694-1.764s.437-1.252.592-1.424c.156-.172.341-.215.455-.215.114 0 .228.001.328.006.105.006.246-.04.385.293.143.344.488 1.192.531 1.279.043.086.071.187.014.301-.057.115-.086.187-.171.287-.086.1-.18.223-.257.3-.086.086-.176.18-.076.352.1.171.444.733.953 1.186.656.584 1.209.765 1.38.851.172.086.272.072.373-.043.101-.115.429-.501.544-.673.114-.172.229-.143.386-.086.157.057 1.001.472 1.172.558.172.086.286.129.329.2.043.072.043.416-.1.818zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
            </svg>
            <span className="hidden xs:inline sm:inline">WhatsApp Chat</span>
          </button>
        </motion.div>
      </div>

      {/* ── INTERACTIVE 1-TAP CHAT MODAL / DIALOG ────────────── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-full max-w-sm rounded-3xl overflow-hidden glass gradient-border border border-emerald-500/40 shadow-2xl shadow-emerald-500/20 bg-[#0c120e] relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* WhatsApp Header Bar */}
              <div className="bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366] p-4 text-white flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  {/* User Avatar */}
                  <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/30 bg-black">
                    {bio.avatar_url ? (
                      <Image
                        src={bio.avatar_url}
                        alt={bio.display_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold font-display">
                        {bio.display_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm tracking-tight text-white leading-tight">
                        {bio.display_name}
                      </h4>
                      {bio.is_verified && <ShieldCheck size={13} className="text-amber-300" />}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                      <span>{bio.whatsapp_status || 'Online • Direct Chat'}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Chat Message Window (Simulated WhatsApp Conversation) */}
              <div className="p-4 space-y-3.5 bg-[#090e0b]/95 max-h-[70vh] overflow-y-auto">
                {/* Greeting Bubble from User */}
                <div className="flex flex-col items-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm p-3 bg-white/[0.07] border border-white/10 text-white text-xs leading-relaxed shadow-md">
                    <p>
                      Hey there! 👋 Thanks for visiting my 3D bio. Click below to message me directly on WhatsApp without having to save my number to your phone!
                    </p>
                    <div className="flex items-center justify-end gap-1 text-[9px] text-white/40 mt-1">
                      <span>Just now</span>
                      <CheckCheck size={11} className="text-cyan-400" />
                    </div>
                  </div>
                </div>

                {/* Quick Prompts */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40 block">
                    Quick Suggestion Prompts:
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {quickPrompts.map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setMessage(prompt)}
                        className={`text-left text-[11px] px-3 py-1.5 rounded-xl border transition-all ${
                          message === prompt
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-medium'
                            : 'bg-white/[0.03] border-white/5 text-white/70 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Input Area */}
                <div className="pt-2">
                  <label className="block text-white/50 text-[10px] uppercase tracking-wider font-semibold mb-1">
                    Your Message to {bio.display_name}:
                  </label>
                  <textarea
                    rows={2}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full p-2.5 rounded-xl glass border border-white/10 text-white text-xs placeholder-white/30 focus:outline-none focus:border-emerald-500/60 resize-none transition-colors"
                  />
                </div>

                {/* Direct Action Button */}
                <button
                  type="button"
                  onClick={handleStartChat}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#128C7E] to-[#25D366] hover:from-[#0e7468] hover:to-[#20ba59] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all"
                >
                  <MessageCircle size={15} />
                  <span>Open WhatsApp &amp; Send 🚀</span>
                </button>

                <p className="text-[10px] text-white/40 text-center flex items-center justify-center gap-1">
                  <Zap size={10} className="text-emerald-400" />
                  <span>Instant 1-Click Connect • No Number Saving</span>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
