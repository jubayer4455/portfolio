'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Wrench,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  Instagram,
  Facebook,
  Phone,
  Clock,
  ShieldAlert,
} from 'lucide-react'
import type { SiteSettingsData } from '@/lib/content-store'

interface MaintenanceScreenProps {
  settings: SiteSettingsData
}

export default function MaintenanceScreen({ settings }: MaintenanceScreenProps) {
  const avatarSrc =
    settings.avatar_url ||
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'

  const title =
    settings.maintenance_title?.trim() ||
    "We're Upgrading the Experience ✨"

  const message =
    settings.maintenance_message?.trim() ||
    'Our creative portfolio and visual diary is currently undergoing scheduled maintenance to bring you fresh content, smoother animations, and exciting new work. We will be back online shortly!'

  return (
    <div className="min-h-screen bg-[#070707] text-white flex flex-col justify-between relative overflow-hidden select-none">
      {/* Ambient background glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full opacity-[0.08] pointer-events-none blur-3xl"
        style={{
          background: 'radial-gradient(circle, #F97316 0%, #EA580C 50%, transparent 80%)',
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center font-display font-bold text-white text-base shadow-lg shadow-orange-500/30">
            AJ
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide">
              {settings.first_name || 'Abdul Al'} {settings.last_name || 'Jubayer'}
            </h1>
            <p className="text-white/40 text-[11px]">
              {settings.tagline || 'Visual Creator & Storyteller'}
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          <span>Under Maintenance</span>
        </div>
      </header>

      {/* Main Hero Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl mx-auto text-center space-y-7">
          {/* Avatar / Icon Stack */}
          <div className="relative inline-block mx-auto">
            <div className="relative w-24 h-24 rounded-3xl overflow-hidden border-2 border-orange-500/50 p-1 bg-black/40 shadow-2xl shadow-orange-500/20">
              <Image
                src={avatarSrc}
                alt="Creator Avatar"
                fill
                unoptimized
                className="object-cover rounded-2xl"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/40">
              <Wrench size={16} className="animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>

          {/* Heading & Notice */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-medium">
              <Sparkles size={12} className="text-orange-400" />
              <span>Coming Back Soon</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
              {title}
            </h2>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
              {message}
            </p>
          </div>

          {/* Pulse Progress Indicator */}
          <div className="p-4 rounded-2xl glass border border-white/10 max-w-md mx-auto space-y-2 bg-white/[0.02]">
            <div className="flex items-center justify-between text-xs text-white/50">
              <span className="flex items-center gap-1.5">
                <Clock size={12} className="text-orange-400" /> System Upgrade
              </span>
              <span className="text-orange-400 font-mono font-medium">95% Completed</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full w-[95%] animate-pulse" />
            </div>
          </div>

          {/* Contact / Inquiries quick links */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {settings.contact_email && (
              <a
                href={`mailto:${settings.contact_email}?subject=Urgent Inquiries During Maintenance`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-lg shadow-orange-500/20 transition-all active:scale-95 w-full sm:w-auto justify-center"
              >
                <Mail size={14} />
                <span>Email Creator Directly</span>
              </a>
            )}
            {settings.whatsapp_number && (
              <a
                href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-white/10 hover:border-emerald-500/50 text-white text-xs font-medium transition-all active:scale-95 w-full sm:w-auto justify-center hover:text-emerald-400"
              >
                <Phone size={14} className="text-emerald-400" />
                <span>WhatsApp Message</span>
              </a>
            )}
          </div>
        </div>
      </main>

      {/* Footer & Discreet Admin Login */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
        <p>© {new Date().getFullYear()} {settings.site_name || 'Abdul Al Jubayer'}. All rights reserved.</p>

        <div className="flex items-center gap-4">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-white/30 hover:text-orange-400 hover:bg-white/5 transition-all"
            title="Administrator Access"
          >
            <Lock size={12} />
            <span>Admin Portal</span>
          </Link>
        </div>
      </footer>
    </div>
  )
}
