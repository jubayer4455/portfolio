'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  User,
  Flame,
  MessageCircle,
  MapPin,
  CheckCircle2,
  Quote,
  Globe,
  Music,
} from 'lucide-react'
import type { SiteSettingsData } from '@/lib/content-store'

const defaultSettings: SiteSettingsData = {
  site_name: 'Abdul Al Jubayer',
  first_name: 'Abdul Al',
  last_name: 'Jubayer',
  tagline: 'Visual Creator & Life Storyteller',
  bio_intro: 'Welcome to my official social hub! Connect with me across all my platforms and explore my visual diary.',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  verified: true,
  location: 'Dhaka, Bangladesh',
  quote_or_motto: 'Living passionately, capturing moments, and connecting with inspiring minds.',
  spotlight_title: 'Check out my latest Instagram Reels & Photos 📸',
  spotlight_url: 'https://instagram.com',
  spotlight_enabled: true,
  whatsapp_number: '+8801700000000',
  status_badge: 'Open to chats & new connections ✨',
  contact_email: 'hello@jubayer.me',
  bio_full_p1: "Hey there! I'm Abdul Al Jubayer, a passionate visual creator and lifestyle storyteller based in Dhaka, Bangladesh.",
  bio_full_p2: 'I believe every day holds a story waiting to be told. Whether I explore new places, capture aesthetic moments, or meet fascinating people, this space is where I share my personal journey.',
  seo_title: 'Abdul Al Jubayer — Official Bio & Social Hub',
  seo_description: 'Official link-in-bio and personal social hub of Abdul Al Jubayer. Connect on Instagram, Facebook, YouTube, TikTok, and explore photos.',
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettingsData>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings')
        const json = await res.json()
        if (json.data) {
          setSettings((prev) => ({ ...prev, ...json.data }))
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const handleChange = (field: keyof SiteSettingsData, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
    setStatus('idle')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setStatus('idle')

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to save')
      }

      setStatus('success')
      setMessage('All changes saved! The live website is updated immediately.')
    } catch {
      setStatus('error')
      setMessage('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full px-4 py-3 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/60 transition-colors'

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-white/40">
        <Loader2 className="animate-spin mr-3" size={20} />
        Loading settings...
      </div>
    )
  }

  const avatarSrc = settings.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-white text-2xl font-bold font-display">Personal Bio Settings</h1>
        <p className="text-white/40 mt-1 text-sm">
          Everything you edit here immediately updates your live Link-in-Bio profile on the web.
        </p>
      </div>

      {/* Live Profile Header Preview */}
      <div className="glass gradient-border rounded-2xl p-5 flex items-center gap-4 bg-orange-500/[0.03]">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-orange-500/50 flex-shrink-0">
          <Image
            src={avatarSrc}
            alt="Avatar preview"
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-white font-bold text-base truncate">
              {settings.first_name} {settings.last_name}
            </h3>
            {settings.verified && (
              <CheckCircle2 size={16} className="text-blue-400 fill-blue-500/20 flex-shrink-0" />
            )}
          </div>
          <p className="text-orange-400 text-xs font-medium truncate">{settings.tagline}</p>
          <div className="flex items-center gap-2 text-white/40 text-xs mt-1">
            <MapPin size={12} className="text-orange-400" />
            <span>{settings.location}</span>
            <span>•</span>
            <span className="text-emerald-400">{settings.status_badge}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Identity & Avatar */}
        <div className="glass gradient-border rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <User size={16} className="text-orange-400" /> Profile Identity &amp; Photo
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                First Name
              </label>
              <input
                type="text"
                value={settings.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                className={inputClass}
                placeholder="Abdul Al"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                Last Name (Orange Highlight)
              </label>
              <input
                type="text"
                value={settings.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                className={inputClass}
                placeholder="Jubayer"
              />
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
              Profile Photo / Avatar Image URL
            </label>
            <input
              type="text"
              value={settings.avatar_url || ''}
              onChange={(e) => handleChange('avatar_url', e.target.value)}
              className={inputClass}
              placeholder="https://images.unsplash.com/... or your photo URL"
            />
            <p className="text-white/30 text-xs mt-1">
              Paste any public image link (Unsplash, Imgur, Supabase, etc.)
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                Tagline / Bio Subtitle
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className={inputClass}
                placeholder="Visual Creator & Life Storyteller"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                Location
              </label>
              <input
                type="text"
                value={settings.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className={inputClass}
                placeholder="Dhaka, Bangladesh"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              id="verified-toggle"
              type="checkbox"
              checked={!!settings.verified}
              onChange={(e) => handleChange('verified', e.target.checked)}
              className="w-4 h-4 rounded text-orange-500 bg-white/10 border-white/20 focus:ring-orange-500"
            />
            <label htmlFor="verified-toggle" className="text-white text-sm cursor-pointer flex items-center gap-1.5">
              <span>Show Verified Creator Checkmark Badge</span>
              <CheckCircle2 size={16} className="text-blue-400" />
            </label>
          </div>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
              Live Status Badge
            </label>
            <input
              type="text"
              value={settings.status_badge || ''}
              onChange={(e) => handleChange('status_badge', e.target.value)}
              className={inputClass}
              placeholder="Open to chats & new connections ✨"
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
              Hero Introduction
            </label>
            <textarea
              rows={2}
              value={settings.bio_intro}
              onChange={(e) => handleChange('bio_intro', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* 2. Spotlight / Pinned Featured Link */}
        <div className="glass gradient-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-base flex items-center gap-2">
              <Flame size={18} className="text-amber-400" /> Pinned Spotlight Link
            </h2>
            <div className="flex items-center gap-2">
              <input
                id="spotlight-toggle"
                type="checkbox"
                checked={!!settings.spotlight_enabled}
                onChange={(e) => handleChange('spotlight_enabled', e.target.checked)}
                className="w-4 h-4 rounded text-orange-500 bg-white/10 border-white/20 focus:ring-orange-500"
              />
              <label htmlFor="spotlight-toggle" className="text-white/80 text-xs cursor-pointer font-medium">
                Enable Banner
              </label>
            </div>
          </div>

          <p className="text-white/40 text-xs">
            A pulsing banner at the top of your social links pointing visitors directly to your featured post or channel.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                Spotlight Banner Title
              </label>
              <input
                type="text"
                value={settings.spotlight_title || ''}
                onChange={(e) => handleChange('spotlight_title', e.target.value)}
                className={inputClass}
                placeholder="Check out my latest Instagram Reels 📸"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                Spotlight Destination URL
              </label>
              <input
                type="text"
                value={settings.spotlight_url || ''}
                onChange={(e) => handleChange('spotlight_url', e.target.value)}
                className={inputClass}
                placeholder="https://instagram.com/your-username"
              />
            </div>
          </div>
        </div>

        {/* 2.5 Ambient Background Music */}
        <div className="glass gradient-border rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-base flex items-center gap-2">
              <Music size={18} className="text-orange-400" /> Background Ambient Music
            </h2>
            <div className="flex items-center gap-2">
              <input
                id="music-toggle"
                type="checkbox"
                checked={settings.music_enabled !== false}
                onChange={(e) => handleChange('music_enabled', e.target.checked)}
                className="w-4 h-4 rounded text-orange-500 bg-white/10 border-white/20 focus:ring-orange-500"
              />
              <label htmlFor="music-toggle" className="text-white/80 text-xs cursor-pointer font-medium">
                Enable Music Capsule
              </label>
            </div>
          </div>

          <p className="text-white/40 text-xs">
            A floating sound pill at the bottom of the screen playing aesthetic lofi ambient vibes for visitors.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                Sound Track Title
              </label>
              <input
                type="text"
                value={settings.music_title || ''}
                onChange={(e) => handleChange('music_title', e.target.value)}
                className={inputClass}
                placeholder="Lofi Sunset Chill 🎧"
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                Audio Stream MP3 URL
              </label>
              <input
                type="text"
                value={settings.music_url || ''}
                onChange={(e) => handleChange('music_url', e.target.value)}
                className={inputClass}
                placeholder="https://cdn.pixabay.com/.../audio.mp3"
              />
            </div>
          </div>
        </div>

        {/* 3. Direct WhatsApp & Contact */}
        <div className="glass gradient-border rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <MessageCircle size={16} className="text-emerald-400" /> Direct Messaging &amp; Connect
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                WhatsApp Phone Number (with Country Code)
              </label>
              <input
                type="text"
                value={settings.whatsapp_number || ''}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
                className={inputClass}
                placeholder="+8801700000000"
              />
              <p className="text-white/30 text-xs mt-1">
                Enables 1-click WhatsApp chat button on your bio profile
              </p>
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className={inputClass}
                placeholder="hello@jubayer.me"
              />
            </div>
          </div>
        </div>

        {/* 4. Bio Story & Personal Motto */}
        <div className="glass gradient-border rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <Quote size={16} className="text-orange-400" /> Life Motto &amp; Bio Story
          </h2>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
              Favorite Quote / Life Motto
            </label>
            <input
              type="text"
              value={settings.quote_or_motto || ''}
              onChange={(e) => handleChange('quote_or_motto', e.target.value)}
              className={inputClass}
              placeholder="Living passionately, capturing moments, and connecting with inspiring minds."
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
              About Story Paragraph 1 (Main Intro)
            </label>
            <textarea
              rows={3}
              value={settings.bio_full_p1 || ''}
              onChange={(e) => handleChange('bio_full_p1', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
              About Story Paragraph 2 (Details &amp; Philosophy)
            </label>
            <textarea
              rows={3}
              value={settings.bio_full_p2 || ''}
              onChange={(e) => handleChange('bio_full_p2', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* 5. SEO & Social Sharing */}
        <div className="glass gradient-border rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <Globe size={16} className="text-blue-400" /> Link-in-Bio SEO Preview
          </h2>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
              Page Title (Shown when link is shared)
            </label>
            <input
              type="text"
              value={settings.seo_title}
              onChange={(e) => handleChange('seo_title', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-2 uppercase tracking-wider">
              Page Description
            </label>
            <textarea
              rows={2}
              value={settings.seo_description}
              onChange={(e) => handleChange('seo_description', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* Feedback message */}
        {status !== 'idle' && (
          <div
            className={`flex items-center gap-3 p-4 rounded-xl text-sm ${
              status === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {status === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{message}</span>
          </div>
        )}

        {/* Save button */}
        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full sm:w-auto justify-center disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes to Live Site
            </>
          )}
        </button>
      </form>
    </div>
  )
}
