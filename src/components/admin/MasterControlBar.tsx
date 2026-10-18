'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  RefreshCw,
  CheckCircle2,
  Sparkles,
  Images,
  Globe,
  Share2,
  Sliders,
  User,
  MessageSquareHeart,
  Star,
  ExternalLink,
  ShieldCheck,
  Check,
  AlertCircle,
  AlertTriangle,
  BellRing,
  Eye,
  EyeOff,
  QrCode,
} from 'lucide-react'
import type { SiteSettingsData } from '@/lib/content-store'
import MasterStoryCardModal from '@/components/admin/MasterStoryCardModal'

interface Props {
  imageCount: number
  socialCount: number
  projectsCount: number
  messagesCount: number
  reviewsCount: number
  settings: SiteSettingsData
}

export default function MasterControlBar({
  imageCount,
  socialCount,
  projectsCount,
  messagesCount,
  reviewsCount,
  settings,
}: Props) {
  const [syncing, setSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [storyModalOpen, setStoryModalOpen] = useState(false)

  const handleLiveSync = async () => {
    setSyncing(true)
    setSyncStatus('idle')

    try {
      const res = await fetch('/api/admin/purge-cache', { method: 'POST' })
      if (res.ok) {
        setSyncStatus('success')
        setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
        setTimeout(() => setSyncStatus('idle'), 5000)
      } else {
        setSyncStatus('error')
      }
    } catch {
      setSyncStatus('error')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="glass gradient-border rounded-3xl p-6 sm:p-7 space-y-6 shadow-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01]">
      {/* Header with 1-Click Sync Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-semibold mb-1.5">
            <ShieldCheck size={13} />
            <span>SUPER ADMIN MASTER CONTROLS</span>
          </div>
          <h2 className="text-white font-bold text-lg sm:text-xl font-display">
            Live Website Master Access Center
          </h2>
          <p className="text-white/40 text-xs mt-0.5">
            Full centralized control over photos, links, projects, and section visibility.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setStoryModalOpen(true)}
            className="btn-glass text-xs py-2.5 px-3.5 inline-flex items-center gap-1.5 shadow-md active:scale-95"
            title="Download Instagram Story / TikTok Card"
          >
            <QrCode size={13} className="text-orange-400" />
            <span>Story Card (PNG)</span>
          </button>

          <button
            onClick={handleLiveSync}
            disabled={syncing}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
              syncStatus === 'success'
                ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                : syncStatus === 'error'
                ? 'bg-red-500 text-white shadow-red-500/25'
                : 'btn-primary shadow-orange-500/20'
            }`}
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            <span>
              {syncing
                ? 'Syncing Live Site...'
                : syncStatus === 'success'
                ? 'Live Site Synced! ✓'
                : syncStatus === 'error'
                ? 'Sync Failed'
                : '⚡ Force Live Sync & Purge Cache'}
            </span>
          </button>
        </div>
      </div>

      {lastSyncTime && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 size={15} />
          <span>
            Cache purged and live routes revalidated at {lastSyncTime}. All changes are immediately visible to visitors.
          </span>
        </div>
      )}

      {/* Quick Access Tiles to Everything */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Photo Gallery */}
        <Link
          href="/admin/gallery"
          className="p-4 rounded-2xl glass border border-white/[0.08] hover:border-orange-500/40 hover:bg-white/[0.04] transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
              <Images size={18} />
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
              {imageCount} photos
            </span>
          </div>
          <div className="mt-3">
            <p className="text-white text-xs font-semibold group-hover:text-orange-400 transition-colors">
              Visual Diary Gallery
            </p>
            <p className="text-white/40 text-[10px] mt-0.5 truncate">Upload, delete &amp; edit photos</p>
          </div>
        </Link>

        {/* Web Projects */}
        <Link
          href="/admin/projects"
          className="p-4 rounded-2xl glass border border-white/[0.08] hover:border-blue-500/40 hover:bg-white/[0.04] transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
              <Globe size={18} />
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
              {projectsCount} web
            </span>
          </div>
          <div className="mt-3">
            <p className="text-white text-xs font-semibold group-hover:text-blue-400 transition-colors">
              Web Projects Showcase
            </p>
            <p className="text-white/40 text-[10px] mt-0.5 truncate">Featured sites &amp; logos</p>
          </div>
        </Link>

        {/* Social Links */}
        <Link
          href="/admin/social"
          className="p-4 rounded-2xl glass border border-white/[0.08] hover:border-pink-500/40 hover:bg-white/[0.04] transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
              <Share2 size={18} />
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
              {socialCount} links
            </span>
          </div>
          <div className="mt-3">
            <p className="text-white text-xs font-semibold group-hover:text-pink-400 transition-colors">
              Social Links Hub
            </p>
            <p className="text-white/40 text-[10px] mt-0.5 truncate">Add, order &amp; toggle platforms</p>
          </div>
        </Link>

        {/* Master Section Switches */}
        <Link
          href="/admin/settings"
          className="p-4 rounded-2xl glass border border-orange-500/30 bg-orange-500/[0.03] hover:border-orange-500 hover:bg-orange-500/[0.06] transition-all group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-orange-500/30">
              <Sliders size={18} />
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Master
            </span>
          </div>
          <div className="mt-3">
            <p className="text-white text-xs font-semibold group-hover:text-orange-400 transition-colors">
              Master Section Toggles
            </p>
            <p className="text-white/40 text-[10px] mt-0.5 truncate">Show/hide &amp; rename sections</p>
          </div>
        </Link>
      </div>

      {/* Live Site Section Visibility Status Strip */}
      <div className="pt-3 border-t border-white/[0.06] flex flex-wrap items-center gap-2 text-xs">
        <span className="text-white/40 text-[11px] font-medium mr-1">Live Status:</span>

        <span
          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 ${
            settings.maintenance_mode_enabled
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 font-bold'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}
        >
          <AlertTriangle size={11} className={settings.maintenance_mode_enabled ? 'animate-pulse' : ''} />
          {settings.maintenance_mode_enabled ? 'Maintenance Mode • Active' : 'Public Site • Live'}
        </span>

        <span
          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 ${
            settings.telegram_notifications_enabled
              ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
              : 'bg-white/5 border-white/10 text-white/40'
          }`}
        >
          <BellRing size={11} />
          Telegram Alerts {settings.telegram_notifications_enabled ? '• Enabled' : '• Off'}
        </span>

        <span
          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 ${
            settings.gallery_enabled !== false
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-white/5 border-white/10 text-white/40 line-through'
          }`}
        >
          <Images size={11} />
          Gallery {settings.gallery_enabled !== false ? '• Live' : '• Hidden'}
        </span>

        <span
          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 ${
            settings.projects_enabled !== false
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-white/5 border-white/10 text-white/40 line-through'
          }`}
        >
          <Globe size={11} />
          Projects {settings.projects_enabled !== false ? '• Live' : '• Hidden'}
        </span>

        <span
          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 ${
            settings.socials_enabled !== false
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-white/5 border-white/10 text-white/40 line-through'
          }`}
        >
          <Share2 size={11} />
          Socials {settings.socials_enabled !== false ? '• Live' : '• Hidden'}
        </span>

        <span
          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 ${
            settings.about_enabled !== false
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-white/5 border-white/10 text-white/40 line-through'
          }`}
        >
          <User size={11} />
          About {settings.about_enabled !== false ? '• Live' : '• Hidden'}
        </span>

        <span
          className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1.5 ${
            settings.music_enabled !== false
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-white/5 border-white/10 text-white/40'
          }`}
        >
          Music {settings.music_enabled !== false ? '• On' : '• Off'}
        </span>
      </div>

      {/* 1-Click Instagram Story Card Modal */}
      <MasterStoryCardModal
        isOpen={storyModalOpen}
        onClose={() => setStoryModalOpen(false)}
        settings={settings}
      />
    </div>
  )
}
