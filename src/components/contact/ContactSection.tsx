'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Send, Mail, CheckCircle, AlertCircle, Loader2, MapPin, MessageCircle, Sparkles, ExternalLink } from 'lucide-react'
import type { SiteSettingsData, SocialProfileData } from '@/lib/content-store'
import PlatformIcon from '@/components/common/PlatformIcon'

interface FormData {
  name: string
  email: string
  subject: string
  message: string
  website: string // honeypot
}

interface FormErrors {
  name?: string
  email?: string
  message?: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {}
  if (!data.name.trim()) errors.name = 'Please enter your name.'
  if (!data.email.trim()) {
    errors.email = 'Please enter your email.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address.'
  }
  if (!data.message.trim()) {
    errors.message = 'Please enter a message.'
  } else if (data.message.trim().length < 5) {
    errors.message = 'Message is a bit too short.'
  }
  return errors
}

interface ContactSectionProps {
  settings?: SiteSettingsData
  socials?: SocialProfileData[]
}

export default function ContactSection({ settings, socials }: ContactSectionProps) {
  const contactEmail = settings?.contact_email || 'hello@jubayer.me'
  const location = settings?.location || 'Dhaka, Bangladesh'
  const statusBadge = settings?.status_badge || 'Open to chats & new connections ✨'
  const whatsappNum = settings?.whatsapp_number || '+8801700000000'
  const cleanPhone = whatsappNum.replace(/[^\d+]/g, '')
  const whatsappUrl = `https://wa.me/${cleanPhone.replace('+', '')}?text=${encodeURIComponent(
    'Hi Abdul Al Jubayer! I visited your bio profile and wanted to connect.'
  )}`

  const activeSocials = (socials && socials.length > 0)
    ? socials.filter((s) => s.is_visible).slice(0, 5)
    : []

  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const [form, setForm] = useState<FormData>({
    name: '', email: '', subject: 'Personal Greeting', message: '', website: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setErrorMessage(data.error || 'Something went wrong. Please try again.')
      } else {
        setStatus('success')
        setForm({ name: '', email: '', subject: 'Personal Greeting', message: '', website: '' })
      }
    } catch {
      setStatus('error')
      setErrorMessage('Network error. Please check your connection and try again.')
    }
  }

  const inputClass = (field: keyof FormErrors) =>
    `w-full px-4 py-3 rounded-2xl glass border text-white placeholder-white/30 text-sm transition-all duration-300 focus:outline-none focus:border-orange-500/60 focus:bg-white/5 ${
      errors[field] ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'
    }`

  return (
    <section id="contact" className="section-padding bg-[#080808] relative overflow-hidden">
      {/* Background decoration */}
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.05] pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)' }}
      />

      <div className="container-max" ref={ref}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-1.5 h-6 rounded-full bg-orange-500" />
            <span className="text-orange-400 text-xs uppercase tracking-widest font-semibold">
              Say Hello
            </span>
            <div className="w-1.5 h-6 rounded-full bg-orange-500" />
          </div>
          <h2 className="heading-lg text-white mb-3">
            Direct <span className="text-gradient">Connect</span>
          </h2>
          <p className="text-white/50 max-w-md mx-auto text-sm">
            Whether you want to chat, collaborate, or simply say hi — reach out anytime!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Fast-Action Cards (WhatsApp, Email, Socials) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:col-span-5 space-y-4"
          >
            {/* Status card */}
            <div className="glass gradient-border rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  Live Status
                </span>
              </div>
              <p className="text-white font-medium text-base mb-1">{statusBadge}</p>
              <div className="flex items-center gap-2 text-white/50 text-xs">
                <MapPin size={13} className="text-orange-400" />
                <span>Based in {location}</span>
              </div>
            </div>

            {/* 1-Click WhatsApp Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group glass gradient-border rounded-3xl p-5 flex items-center justify-between hover:border-emerald-500/50 transition-all duration-300 block shadow-lg hover:scale-[1.01]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <MessageCircle size={24} />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm group-hover:text-emerald-300 transition-colors">
                    1-Click WhatsApp Chat
                  </h4>
                  <p className="text-white/40 text-xs mt-0.5">
                    Fastest way to get in touch with me
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-all">
                <ExternalLink size={15} />
              </div>
            </a>

            {/* Direct Email Card */}
            <a
              href={`mailto:${contactEmail}`}
              className="group glass gradient-border rounded-3xl p-5 flex items-center justify-between hover:border-orange-500/50 transition-all duration-300 block shadow-lg hover:scale-[1.01]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                  <Mail size={22} />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm group-hover:text-orange-300 transition-colors">
                    Direct Email
                  </h4>
                  <p className="text-white/40 text-xs mt-0.5 font-mono">
                    {contactEmail}
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:text-orange-400 group-hover:bg-orange-500/10 transition-all">
                <ExternalLink size={15} />
              </div>
            </a>

            {/* Quick Socials strip */}
            {activeSocials.length > 0 && (
              <div className="glass gradient-border rounded-3xl p-5 shadow-lg">
                <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-3">
                  Find me also on
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {activeSocials.map((s) => (
                    <a
                      key={s.id}
                      href={s.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 rounded-full glass border border-white/10 text-white/70 hover:text-white hover:border-orange-500/40 text-xs font-medium flex items-center gap-2 transition-all hover:scale-105"
                    >
                      <PlatformIcon name={s.icon_name || s.platform} size={13} style={{ color: s.color }} />
                      <span>{s.display_label || s.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column: Sleek Message Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-7"
          >
            {status === 'success' ? (
              <div className="glass gradient-border rounded-3xl p-10 text-center shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-emerald-400" />
                </div>
                <h3 className="text-white text-xl font-bold mb-2">Message Received!</h3>
                <p className="text-white/60 mb-6 text-sm max-w-sm mx-auto">
                  Thank you for reaching out! I&apos;ve received your note and will get back to you shortly.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="btn-primary text-sm px-6 py-2.5"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="glass gradient-border rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-orange-400" />
                  <h3 className="text-white font-semibold text-base">Drop a Quick Message</h3>
                </div>

                {/* Honeypot field */}
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="absolute opacity-0 pointer-events-none w-0 h-0"
                  autoComplete="off"
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                      Your Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      className={inputClass('name')}
                      autoComplete="name"
                    />
                    {errors.name && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                      Your Email *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="yourname@gmail.com"
                      className={inputClass('email')}
                      autoComplete="email"
                    />
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} /> {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                    Your Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Hey Jubayer! Just saw your profile and wanted to say hi..."
                    className={inputClass('message')}
                  />
                  {errors.message && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {errors.message}
                    </p>
                  )}
                </div>

                {status === 'error' && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn-primary w-full sm:w-auto px-8 py-3 text-sm justify-center disabled:opacity-50"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
