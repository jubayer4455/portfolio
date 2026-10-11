'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, CheckCircle2, Shield, Eye, Smartphone, Palette } from 'lucide-react'

export default function BuilderFeatureBanner() {
  const highlights = [
    'Custom Personal URL (e.g. /u/yourname)',
    'Upload 4 Personal HD Photos Showcase',
    'Instagram, FB, TikTok, YouTube & WhatsApp Links',
    'Dedicated Personal User Dashboard to Edit Anytime',
    'Real-time Mobile Phone Preview',
    'Sleek 3D Ambient Lighting & Glow Themes',
  ]

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container-max px-4 md:px-8">
        <div className="relative rounded-3xl glass gradient-border p-8 md:p-14 overflow-hidden shadow-2xl">
          {/* Ambient Glows */}
          <div
            className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full pointer-events-none blur-3xl opacity-15"
            style={{ background: 'radial-gradient(circle, #EA580C 0%, transparent 70%)' }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold">
                <Sparkles size={13} />
                <span>Bio Site Builder SaaS</span>
              </div>

              <h2 className="text-3xl md:text-5xl font-bold font-display text-white tracking-tight leading-tight">
                Create Your Own <br className="hidden sm:inline" />
                <span className="text-gradient">3D Link-in-Bio Site</span>
              </h2>

              <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-xl">
                Ready to elevate your Instagram, TikTok, and Facebook bio? Create your personalized,
                ultra-fast 3D bio page in under 60 seconds with your personal photos and direct social links.
              </p>

              {/* Feature Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {highlights.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-white/80">
                    <CheckCircle2 size={16} className="text-orange-400 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <Link
                  href="/signup"
                  className="btn-primary text-xs py-3 px-6 shadow-xl shadow-orange-500/20 inline-flex items-center gap-2"
                >
                  <span>Build Your Free Bio Now 🚀</span>
                  <ArrowRight size={14} />
                </Link>

                <Link
                  href="/u/sarah"
                  target="_blank"
                  className="btn-glass text-xs py-3 px-5 inline-flex items-center gap-2 text-white/80 hover:text-white"
                >
                  <Eye size={14} className="text-orange-400" />
                  <span>See Live Example (@sarah)</span>
                </Link>
              </div>
            </div>

            {/* Right Graphic Card (5 cols) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-sm rounded-3xl bg-[#0d0d0d] border border-white/10 p-5 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-white/40 font-mono text-[11px]">yourname.bio</span>
                </div>

                <div className="pt-5 space-y-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500 mx-auto flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-orange-500/30">
                    YOU
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">Your Personal Brand</p>
                    <p className="text-orange-400 font-mono text-xs">/u/yourusername</p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white/70 flex items-center justify-between">
                      <span>📸 4 Personal Photos Showcase</span>
                      <span className="text-emerald-400 text-[10px]">Active</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white/70 flex items-center justify-between">
                      <span>🔗 Unlimited Social Media Links</span>
                      <span className="text-emerald-400 text-[10px]">Active</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white/70 flex items-center justify-between">
                      <span>⚡ 100% Free Supabase Backend</span>
                      <span className="text-emerald-400 text-[10px]">Connected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
