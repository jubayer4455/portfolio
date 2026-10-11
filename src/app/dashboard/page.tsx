'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import {
  User,
  Share2,
  Image as ImageIcon,
  ExternalLink,
  Copy,
  Check,
  Plus,
  Trash2,
  Upload,
  Loader2,
  LogOut,
  Save,
  Sparkles,
  Palette,
  MapPin,
  Eye,
  QrCode,
  Download,
  BarChart3,
  MousePointerClick,
  TrendingUp,
  Type,
  X,
  AlertCircle,
  Phone,
  Mail,
  UserCheck,
  Inbox,
  Music,
  Radio,
  Sliders,
  Layers,
  MessageSquare,
  Smartphone,
} from 'lucide-react'
import PlatformIcon from '@/components/common/PlatformIcon'
import BioInstagramStoryModal from '@/components/bio/BioInstagramStoryModal'
import type { UserBioData, UserSecretMessage } from '@/lib/builder-store'

const AVAILABLE_PLATFORMS = [
  'Instagram',
  'Facebook',
  'YouTube',
  'TikTok',
  'WhatsApp',
  'X',
  'LinkedIn',
  'GitHub',
  'Telegram',
  'Spotify',
  'Website',
  'Blog',
  'Online Store',
  'Custom Link',
]

const THEMES = [
  { id: 'orange', name: 'Electric Orange', color: '#F97316' },
  { id: 'purple', name: 'Cyber Purple', color: '#A855F7' },
  { id: 'cyan', name: 'Neon Cyan', color: '#06B6D4' },
  { id: 'emerald', name: 'Emerald Glow', color: '#10B981' },
  { id: 'rose', name: 'Rose Gold', color: '#F43F5E' },
]

const FONTS = [
  { id: 'sans', name: 'Modern Sans', style: 'font-sans', desc: 'Clean, modern Inter style' },
  { id: 'serif', name: 'Aesthetic Serif', style: 'font-display', desc: 'Luxury editorial style' },
  { id: 'mono', name: 'Cyber Mono', style: 'font-mono', desc: 'Tech & code inspired' },
]

const BG_3D_STYLES = [
  { id: 'particles', name: '3D Neon Dust', desc: 'Floating cosmic particles with mouse tilt parallax', icon: '✨' },
  { id: 'orbit', name: 'Cosmic Gyro Rings', desc: 'Orbital rings rotating around glowing planetary core', icon: '🪐' },
  { id: 'sculpture', name: '3D Wireframe Sculpture', desc: 'Rotating 3D cyber polygon sculpture', icon: '💎' },
  { id: 'waves', name: 'Neon Wave Horizon', desc: 'Futuristic ambient wave ripples', icon: '🌊' },
  { id: 'none', name: 'Pure Dark Glass', desc: 'Minimalist clean dark backdrop without 3D canvas', icon: '⬛' },
]

const LAYOUT_STYLES = [
  { id: 'classic', name: 'Classic Flow', desc: 'Clean stacked vertical links (Linktree style)', icon: '📱' },
  { id: 'bento', name: 'Aesthetic Bento Grid', desc: 'Modern 2-column aesthetic bento tiles (Instagram ready)', icon: '🍱' },
]

const STATUS_PRESETS = [
  '🟢 Open for projects',
  '☕ Vibing & creating',
  '🚀 Shipping new work',
  '🎧 In the zone',
  '🌴 On vacation',
  '💡 Open for collaborations',
]

const MUSIC_PRESETS = [
  { title: 'Chill Lofi Beats 🎧', url: 'https://assets.mixkit.co/music/preview/mixkit-chill-bro-494.mp3' },
  { title: 'Ambient Dreamscape ✨', url: 'https://assets.mixkit.co/music/preview/mixkit-ambient-dreamscape-lofi-645.mp3' },
  { title: 'Synthwave Breeze 🌊', url: 'https://assets.mixkit.co/music/preview/mixkit-synthwave-breeze-642.mp3' },
]

const PRESET_COVERS = [
  { name: 'Cosmic Glow', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Cyber Neon', url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Mountain Sunset', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Aesthetic Waves', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' },
]

export default function UserDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'photos' | 'socials' | 'theme' | 'inbox' | 'analytics'>('profile')
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [storyModalOpen, setStoryModalOpen] = useState(false)
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('editor')

  // Secret Messages inbox state
  const [userMessages, setUserMessages] = useState<UserSecretMessage[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread'>('all')

  // Bio state
  const [bioData, setBioData] = useState<UserBioData>({
    id: '',
    user_id: '',
    username: '',
    display_name: '',
    tagline: '',
    bio: '',
    avatar_url: '',
    cover_url: '',
    location: '',
    phone: '',
    email: '',
    whatsapp_enabled: true,
    whatsapp_number: '',
    whatsapp_message: '',
    whatsapp_status: 'Online • Direct Chat',
    social_links: [],
    photos: [],
    theme: 'orange',
    font_family: 'sans',
    bg_3d_style: 'particles',
    status_badge: '🟢 Open for projects',
    music_enabled: false,
    music_title: 'Chill Lofi Beats 🎧',
    music_url: 'https://assets.mixkit.co/music/preview/mixkit-chill-bro-494.mp3',
    layout_style: 'bento',
    views: 0,
    clicks: 0,
    clicks_by_platform: {},
    created_at: '',
    updated_at: '',
  })

  // Photo upload states (4 slots)
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  const loadMessages = async (uname: string) => {
    if (!uname) return
    setLoadingMessages(true)
    try {
      const res = await fetch(`/api/user/messages?username=${encodeURIComponent(uname)}`)
      const json = await res.json()
      if (res.ok && json.data) {
        setUserMessages(json.data)
      }
    } catch (err) {
      console.error('Failed to load user messages:', err)
    } finally {
      setLoadingMessages(false)
    }
  }

  // Load user bio
  useEffect(() => {
    async function loadBio() {
      try {
        const res = await fetch('/api/user/bio')
        const json = await res.json()

        if (res.ok && json.data) {
          setBioData(json.data)
          if (json.data.username) {
            loadMessages(json.data.username)
          }
        } else {
          router.push('/login?redirectTo=/dashboard')
          return
        }
      } catch (err) {
        console.error('Failed to load bio:', err)
        setError('Failed to load profile data.')
      } finally {
        setLoading(false)
      }
    }
    loadBio()
  }, [router])

  const handleMarkMessageRead = async (id: string) => {
    try {
      await fetch('/api/user/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setUserMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: true } : m)))
    } catch {}
  }

  const handleDeleteMessage = async (id: string) => {
    try {
      await fetch(`/api/user/messages?id=${id}`, { method: 'DELETE' })
      setUserMessages((prev) => prev.filter((m) => m.id !== id))
    } catch {}
  }

  const handleShareMessage = (msg: UserSecretMessage) => {
    const shareText = `"${msg.message}" ${msg.emoji}\n\n👉 Send me anonymous notes at: ${publicUrl}`
    navigator.clipboard.writeText(shareText)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/u/${bioData.username}` : `https://portfolio.com/u/${bioData.username}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(publicUrl)}&color=f97316&bgcolor=0a0a0a`

  const handleCopyBioLink = () => {
    if (typeof window === 'undefined') return
    navigator.clipboard.writeText(publicUrl)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (res.ok && data.publicUrl) {
        setBioData((prev) => ({ ...prev, avatar_url: data.publicUrl }))
      } else {
        setError(data.error || 'Failed to upload avatar.')
      }
    } catch {
      setError('Upload error. Check network or file size.')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (res.ok && data.publicUrl) {
        setBioData((prev) => ({ ...prev, cover_url: data.publicUrl }))
      } else {
        setError(data.error || 'Failed to upload cover banner.')
      }
    } catch {
      setError('Cover upload error. Max 10MB.')
    } finally {
      setUploadingCover(false)
    }
  }

  const handlePhotoUpload = async (slotIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingSlot(slotIndex)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (res.ok && data.publicUrl) {
        setBioData((prev) => {
          const newPhotos = [...(prev.photos || [])]
          const newPhotoItem = {
            id: `pic-${Date.now()}-${slotIndex}`,
            url: data.publicUrl,
            caption: newPhotos[slotIndex]?.caption || `Photo ${slotIndex + 1}`,
          }
          newPhotos[slotIndex] = newPhotoItem
          return { ...prev, photos: newPhotos.slice(0, 4) }
        })
      } else {
        setError(data.error || 'Failed to upload photo.')
      }
    } catch {
      setError('Upload error. Max 10MB JPG/PNG/WEBP.')
    } finally {
      setUploadingSlot(null)
    }
  }

  const handleRemovePhoto = (slotIndex: number) => {
    setBioData((prev) => {
      const newPhotos = [...(prev.photos || [])]
      newPhotos.splice(slotIndex, 1)
      return { ...prev, photos: newPhotos }
    })
  }

  const handlePhotoCaptionChange = (slotIndex: number, caption: string) => {
    setBioData((prev) => {
      const newPhotos = [...(prev.photos || [])]
      if (newPhotos[slotIndex]) {
        newPhotos[slotIndex] = { ...newPhotos[slotIndex], caption }
      }
      return { ...prev, photos: newPhotos }
    })
  }

  const handleAddSocialLink = () => {
    setBioData((prev) => ({
      ...prev,
      social_links: [
        ...prev.social_links,
        {
          id: `link-${Date.now()}`,
          platform: 'Instagram',
          display_label: '@yourhandle',
          profile_url: 'https://instagram.com',
        },
      ],
    }))
  }

  const handleUpdateSocialLink = (index: number, field: string, value: string) => {
    setBioData((prev) => {
      const updated = [...prev.social_links]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, social_links: updated }
    })
  }

  const handleRemoveSocialLink = (index: number) => {
    setBioData((prev) => {
      const updated = [...prev.social_links]
      updated.splice(index, 1)
      return { ...prev, social_links: updated }
    })
  }

  const handleSaveBio = async () => {
    setSaving(true)
    setError('')
    setSavedSuccess(false)

    try {
      const res = await fetch('/api/user/bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bioData),
      })
      const json = await res.json()

      if (res.ok && json.data) {
        setBioData(json.data)
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 3000)
      } else {
        setError(json.error || 'Failed to save bio.')
      }
    } catch {
      setError('Network error while saving.')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {}
    document.cookie = 'user_session_id=; path=/; credentials=same-origin; max-age=0;'
    document.cookie = 'user_session_username=; path=/; credentials=same-origin; max-age=0;'
    document.cookie = 'user_session_email=; path=/; credentials=same-origin; max-age=0;'
    document.cookie = 'demo_user=; path=/; credentials=same-origin; max-age=0;'
    document.cookie = 'demo_username=; path=/; credentials=same-origin; max-age=0;'
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-orange-500" />
          <p className="text-white/60 text-sm">Loading your bio dashboard...</p>
        </div>
      </div>
    )
  }

  const totalViews = bioData.views || 0
  const totalClicks = bioData.clicks || 0
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0'

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 glass border-b border-white/[0.06] px-4 md:px-8 py-3.5 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-display font-bold text-white shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
                AJ
              </div>
              <span className="font-display font-bold text-sm tracking-tight text-white hidden sm:inline">
                Bio Builder
              </span>
            </Link>

            <span className="text-white/20 hidden sm:inline">|</span>

            {/* Quick Live Link Pill */}
            <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 rounded-full px-3 py-1 text-xs">
              <span className="text-white/40">Live:</span>
              <span className="text-orange-400 font-mono font-medium">/u/{bioData.username}</span>
              <button
                type="button"
                onClick={handleCopyBioLink}
                title="Copy live bio link"
                className="ml-1 p-1 hover:text-orange-300 text-white/50 transition-colors"
              >
                {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
              <Link
                href={`/u/${bioData.username}`}
                target="_blank"
                title="Open live bio"
                className="p-1 hover:text-orange-300 text-white/50 transition-colors"
              >
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* 1-Click Instagram Story Card Generator */}
            <button
              onClick={() => setStoryModalOpen(true)}
              className="btn-glass text-xs py-2 px-3.5 inline-flex items-center gap-1.5 hover:border-orange-500/50 text-orange-400"
              title="Generate 9:16 Instagram Story Card"
            >
              <Smartphone size={14} />
              <span className="hidden sm:inline">Story Card (9:16)</span>
            </button>

            {/* QR Code Trigger Button */}
            <button
              onClick={() => setQrModalOpen(true)}
              className="btn-glass text-xs py-2 px-3.5 inline-flex items-center gap-1.5 hover:border-orange-500/50"
              title="Get Profile QR Code"
            >
              <QrCode size={14} className="text-orange-400" />
              <span className="hidden sm:inline">QR Code</span>
            </button>

            <button
              onClick={handleSaveBio}
              disabled={saving}
              className="btn-primary text-xs py-2 px-4 shadow-lg shadow-orange-500/20 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : savedSuccess ? (
                <>
                  <Check size={14} className="text-white" />
                  Saved!
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Changes
                </>
              )}
            </button>

            <button
              onClick={handleSignOut}
              className="p-2 rounded-xl glass border border-white/10 text-white/50 hover:text-red-400 hover:border-red-500/30 transition-all text-xs"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 pb-28 lg:pb-8">
        {/* Error / Alert banner */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-white/40 hover:text-white text-xs">Dismiss</button>
          </div>
        )}

        {/* Saved Success Toast */}
        {savedSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
            <Check size={16} />
            <span>Profile and photo updates saved successfully! Live link updated.</span>
          </div>
        )}

        {/* Mobile Native App View Switcher (Editor vs Live Card) */}
        <div className="lg:hidden mb-6 flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/10 shadow-lg">
          <button
            type="button"
            onClick={() => setMobileView('editor')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              mobileView === 'editor'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Sliders size={14} />
            <span>Profile Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileView('preview')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              mobileView === 'preview'
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Eye size={14} />
            <span>Live Interactive Preview</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Editor Tabs & Form (7 Cols) */}
          <div className={`lg:col-span-7 space-y-6 ${mobileView === 'editor' ? 'block' : 'hidden lg:block'}`}>
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/10 overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'profile'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <User size={14} />
                <span>Profile & Bio</span>
              </button>

              <button
                onClick={() => setActiveTab('photos')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'photos'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <ImageIcon size={14} />
                <span>4 Photos</span>
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {bioData.photos?.length || 0}/4
                </span>
              </button>

              <button
                onClick={() => setActiveTab('socials')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'socials'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Share2 size={14} />
                <span>Links & Socials</span>
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                  {bioData.social_links?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('theme')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'theme'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Palette size={14} />
                <span>Styles & 3D</span>
              </button>

              <button
                onClick={() => setActiveTab('inbox')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 relative ${
                  activeTab === 'inbox'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Inbox size={14} />
                <span>Secret Notes</span>
                {userMessages.filter((m) => !m.is_read).length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white font-bold animate-pulse">
                    {userMessages.filter((m) => !m.is_read).length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  activeTab === 'analytics'
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <BarChart3 size={14} />
                <span>Analytics</span>
              </button>
            </div>

            {/* TAB 1: Profile & Bio Details */}
            {activeTab === 'profile' && (
              <div className="glass gradient-border rounded-3xl p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-bold font-display text-white">Personal Profile</h2>
                  <p className="text-white/40 text-xs mt-0.5">Customize how you introduce yourself to visitors</p>
                </div>

                {/* Profile Cover Banner Section */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-white/90">Header Cover Banner</p>
                      <p className="text-[11px] text-white/40">Wide aesthetic cover photo (like Twitter or LinkedIn profile)</p>
                    </div>
                    {bioData.cover_url && (
                      <button
                        type="button"
                        onClick={() => setBioData((p) => ({ ...p, cover_url: '' }))}
                        className="text-xs text-white/40 hover:text-red-400 transition-colors"
                      >
                        Remove Cover
                      </button>
                    )}
                  </div>

                  {/* Banner Preview Box */}
                  <div className="relative aspect-[3/1] w-full rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                    {bioData.cover_url ? (
                      <Image
                        src={bioData.cover_url}
                        alt="Profile cover banner"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-purple-500/10 flex items-center justify-center text-white/30 text-xs">
                        No cover set (using ambient theme gradient)
                      </div>
                    )}
                    {uploadingCover && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin text-orange-400" />
                        <span className="text-xs text-white">Uploading banner...</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Preset Banners */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <label className="btn-glass text-xs py-1.5 px-3 cursor-pointer inline-flex items-center gap-1.5 hover:border-orange-500/50">
                      <Upload size={13} />
                      <span>{bioData.cover_url ? 'Change Banner' : 'Upload Banner'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverUpload}
                        disabled={uploadingCover}
                      />
                    </label>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-white/40 hidden sm:inline">Presets:</span>
                      {PRESET_COVERS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setBioData((p) => ({ ...p, cover_url: preset.url }))}
                          className="text-[10px] px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                          title={preset.name}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Avatar Section */}
                <div className="flex items-center gap-5 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                    {bioData.avatar_url ? (
                      <Image
                        src={bioData.avatar_url}
                        alt={bioData.display_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/30">
                        <User size={28} />
                      </div>
                    )}
                    {uploadingAvatar && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 size={18} className="animate-spin text-orange-400" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-white/80">Avatar Photo</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="btn-glass text-xs py-1.5 px-3 cursor-pointer inline-flex items-center gap-1.5 hover:border-orange-500/50">
                        <Upload size={13} />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-white/30">PNG, JPG or WEBP. Max 10MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Display Name */}
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                      Full / Display Name
                    </label>
                    <input
                      type="text"
                      value={bioData.display_name}
                      onChange={(e) => setBioData((p) => ({ ...p, display_name: e.target.value }))}
                      placeholder="e.g. Sarah Rahman"
                      className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/60"
                    />
                  </div>

                  {/* Username Slug */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-white/60 text-xs font-medium uppercase tracking-wider">
                        Bio URL Slug
                      </label>
                      <span className="text-[10px] text-orange-400 font-mono">/u/{bioData.username}</span>
                    </div>
                    <input
                      type="text"
                      value={bioData.username}
                      onChange={(e) =>
                        setBioData((p) => ({
                          ...p,
                          username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''),
                        }))
                      }
                      placeholder="username"
                      className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white font-mono placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/60"
                    />
                  </div>
                </div>

                {/* Tagline */}
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                    Tagline / Short Title
                  </label>
                  <input
                    type="text"
                    value={bioData.tagline || ''}
                    onChange={(e) => setBioData((p) => ({ ...p, tagline: e.target.value }))}
                    placeholder="e.g. Visual Storyteller & Digital Creator ✨"
                    className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/60"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="text"
                      value={bioData.location || ''}
                      onChange={(e) => setBioData((p) => ({ ...p, location: e.target.value }))}
                      placeholder="e.g. Dhaka, Bangladesh"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/60"
                    />
                  </div>
                </div>

                {/* Live Status & Mood Pulse Badge */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <p className="text-xs font-semibold text-white/90">Live Status &amp; Mood Badge</p>
                    </div>
                    {bioData.status_badge && (
                      <button
                        type="button"
                        onClick={() => setBioData((p) => ({ ...p, status_badge: '' }))}
                        className="text-xs text-white/40 hover:text-red-400 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-white/40">
                    A glowing live pulse status dot and message displayed directly on your bio card
                  </p>
                  <input
                    type="text"
                    value={bioData.status_badge || ''}
                    onChange={(e) => setBioData((p) => ({ ...p, status_badge: e.target.value }))}
                    placeholder="e.g. 🟢 Open for projects or ☕ Vibing & creating"
                    className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-orange-500/60"
                  />
                  {/* Preset Quick Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-white/40">Presets:</span>
                    {STATUS_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBioData((p) => ({ ...p, status_badge: preset }))}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                          bioData.status_badge === preset
                            ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                            : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bio Description */}
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                    About / Bio Story
                  </label>
                  <textarea
                    rows={4}
                    value={bioData.bio || ''}
                    onChange={(e) => setBioData((p) => ({ ...p, bio: e.target.value }))}
                    placeholder="Tell your story, what you love, and welcome people to your social links..."
                    className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/60 resize-none"
                  />
                </div>

                {/* Direct Contact & 1-Click vCard Save */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck size={16} className="text-orange-400" />
                      <p className="text-xs font-semibold text-white">Direct Contact &amp; 1-Click Save vCard</p>
                    </div>
                    <span className="text-[10px] text-white/40">Visible to profile visitors</span>
                  </div>

                  <p className="text-[11px] text-white/50 leading-relaxed">
                    Add your phone number and email address. Visitors on your bio page can 1-click &ldquo;Save Contact&rdquo; to download your official vCard (.vcf) directly into their phone&apos;s contacts.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Direct Phone */}
                    <div>
                      <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                        Phone Number (Call / WhatsApp)
                      </label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                          type="text"
                          value={bioData.phone || ''}
                          onChange={(e) => setBioData((p) => ({ ...p, phone: e.target.value }))}
                          placeholder="+880 1700 000000"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-orange-500/60 font-mono"
                        />
                      </div>
                    </div>

                    {/* Direct Email */}
                    <div>
                      <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                        Contact Email Address
                      </label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                        <input
                          type="email"
                          value={bioData.email || ''}
                          onChange={(e) => setBioData((p) => ({ ...p, email: e.target.value }))}
                          placeholder="hello@yourdomain.com"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-orange-500/60 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1-Tap Direct WhatsApp Instant Chat Dialog Settings */}
                <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.585 1.961.948 2.801.948h.005c3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.735-5.778-5.735zm3.364 8.21c-.143.402-.828.775-1.144.821-.299.043-.687.068-2.029-.488-1.716-.71-2.822-2.456-2.908-2.57-.085-.114-.694-.925-.694-1.764s.437-1.252.592-1.424c.156-.172.341-.215.455-.215.114 0 .228.001.328.006.105.006.246-.04.385.293.143.344.488 1.192.531 1.279.043.086.071.187.014.301-.057.115-.086.187-.171.287-.086.1-.18.223-.257.3-.086.086-.176.18-.076.352.1.171.444.733.953 1.186.656.584 1.209.765 1.38.851.172.086.272.072.373-.043.101-.115.429-.501.544-.673.114-.172.229-.143.386-.086.157.057 1.001.472 1.172.558.172.086.286.129.329.2.043.072.043.416-.1.818zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">1-Tap Direct WhatsApp Instant Chat</p>
                        <p className="text-[11px] text-white/50">Visitors can message you without saving your contact number</p>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer self-start sm:self-auto">
                      <input
                        type="checkbox"
                        checked={bioData.whatsapp_enabled !== false}
                        onChange={(e) => setBioData((p) => ({ ...p, whatsapp_enabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                      <span className="ml-2 text-xs text-white/70">{bioData.whatsapp_enabled !== false ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  </div>

                  {bioData.whatsapp_enabled !== false && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                      {/* WhatsApp Custom Number */}
                      <div>
                        <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                          WhatsApp Number
                        </label>
                        <input
                          type="text"
                          value={bioData.whatsapp_number || ''}
                          onChange={(e) => setBioData((p) => ({ ...p, whatsapp_number: e.target.value }))}
                          placeholder={bioData.phone || '+880 1700 000000'}
                          className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-emerald-500/60 font-mono"
                        />
                        <p className="text-[10px] text-white/40 mt-1">
                          Leave blank to automatically use your phone number above.
                        </p>
                      </div>

                      {/* Online Status Label */}
                      <div>
                        <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                          Online Status Badge
                        </label>
                        <input
                          type="text"
                          value={bioData.whatsapp_status || ''}
                          onChange={(e) => setBioData((p) => ({ ...p, whatsapp_status: e.target.value }))}
                          placeholder="Online • Replies in minutes"
                          className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-emerald-500/60"
                        />
                      </div>

                      {/* Pre-filled Message Greeting */}
                      <div className="md:col-span-2">
                        <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                          Pre-filled Initial Visitor Greeting
                        </label>
                        <input
                          type="text"
                          value={bioData.whatsapp_message || ''}
                          onChange={(e) => setBioData((p) => ({ ...p, whatsapp_message: e.target.value }))}
                          placeholder={`Hi ${bioData.display_name || 'there'}, I just saw your 3D bio page and wanted to connect!`}
                          className="w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-emerald-500/60"
                        />
                        <p className="text-[10px] text-white/40 mt-1">
                          This message will be pre-typed into the visitor&apos;s WhatsApp screen when they click send.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: 4 Personal Photos Showcase */}
            {activeTab === 'photos' && (
              <div className="glass gradient-border rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold font-display text-white">4 Personal Photos Showcase</h2>
                    <p className="text-white/40 text-xs mt-0.5">
                      Upload up to 4 of your best photos. Visitors can click to view them in fullscreen HD.
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 font-medium">
                    Max 4 Photos
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((slotIndex) => {
                    const currentPhoto = bioData.photos?.[slotIndex]
                    const isUploadingThis = uploadingSlot === slotIndex

                    return (
                      <div
                        key={slotIndex}
                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-white/70">
                            Photo Slot #{slotIndex + 1}
                          </span>
                          {currentPhoto && (
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(slotIndex)}
                              className="text-white/30 hover:text-red-400 p-1 transition-colors"
                              title="Delete photo"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>

                        {/* Image Preview Box */}
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center">
                          {currentPhoto ? (
                            <Image
                              src={currentPhoto.url}
                              alt={currentPhoto.caption || `Slot ${slotIndex + 1}`}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              unoptimized
                            />
                          ) : (
                            <div className="text-center p-4">
                              <ImageIcon size={28} className="mx-auto text-white/20 mb-1" />
                              <p className="text-[11px] text-white/30">Slot Empty</p>
                            </div>
                          )}

                          {isUploadingThis && (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                              <Loader2 size={24} className="animate-spin text-orange-500" />
                              <p className="text-xs text-white/80">Uploading photo...</p>
                            </div>
                          )}
                        </div>

                        {/* File Upload Button */}
                        <label className="w-full btn-glass text-xs py-2 justify-center cursor-pointer flex items-center gap-2">
                          <Upload size={13} />
                          <span>{currentPhoto ? 'Change Photo' : 'Upload Photo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handlePhotoUpload(slotIndex, e)}
                            disabled={isUploadingThis}
                          />
                        </label>

                        {/* Caption Input */}
                        {currentPhoto && (
                          <div>
                            <input
                              type="text"
                              value={currentPhoto.caption || ''}
                              onChange={(e) => handlePhotoCaptionChange(slotIndex, e.target.value)}
                              placeholder="Photo caption (e.g. Sunset vibes)"
                              className="w-full px-3 py-1.5 rounded-lg glass border border-white/5 text-white/80 placeholder-white/25 text-xs focus:outline-none focus:border-orange-500/50"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: Social & Custom Web Links */}
            {activeTab === 'socials' && (
              <div className="glass gradient-border rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold font-display text-white">Social & Custom Links</h2>
                    <p className="text-white/40 text-xs mt-0.5">
                      Connect your socials, personal blog, store, or external websites
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSocialLink}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Add Link</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {bioData.social_links?.map((link, idx) => (
                    <div
                      key={link.id || idx}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
                    >
                      {/* Platform Select */}
                      <div className="sm:w-40 flex-shrink-0">
                        <select
                          value={link.platform}
                          onChange={(e) => handleUpdateSocialLink(idx, 'platform', e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-[#141414] border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500/50"
                        >
                          {AVAILABLE_PLATFORMS.map((plat) => (
                            <option key={plat} value={plat}>
                              {plat}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Display Label */}
                      <div className="flex-1">
                        <input
                          type="text"
                          value={link.display_label}
                          onChange={(e) => handleUpdateSocialLink(idx, 'display_label', e.target.value)}
                          placeholder="Label (e.g. My Portfolio or Follow on FB)"
                          className="w-full px-3 py-2 rounded-xl glass border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500/50"
                        />
                      </div>

                      {/* URL */}
                      <div className="flex-[1.5]">
                        <input
                          type="url"
                          value={link.profile_url}
                          onChange={(e) => handleUpdateSocialLink(idx, 'profile_url', e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 rounded-xl glass border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500/50 font-mono"
                        />
                      </div>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => handleRemoveSocialLink(idx)}
                        className="p-2 text-white/30 hover:text-red-400 rounded-lg hover:bg-white/5 transition-colors self-end sm:self-auto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  {(!bioData.social_links || bioData.social_links.length === 0) && (
                    <div className="text-center py-8 border border-dashed border-white/10 rounded-2xl">
                      <Share2 size={24} className="mx-auto text-white/20 mb-2" />
                      <p className="text-white/40 text-xs">No links added yet.</p>
                      <button
                        type="button"
                        onClick={handleAddSocialLink}
                        className="mt-3 text-orange-400 hover:text-orange-300 text-xs font-medium underline"
                      >
                        + Add your first link
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: Theme & Font Styles */}
            {activeTab === 'theme' && (
              <div className="glass gradient-border rounded-3xl p-6 md:p-8 space-y-8">
                {/* Accent Theme */}
                <div>
                  <h2 className="text-lg font-bold font-display text-white mb-1">Visual Glow Theme</h2>
                  <p className="text-white/40 text-xs mb-4">Choose your signature lighting and aesthetic accent</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {THEMES.map((theme) => {
                      const isSelected = (bioData.theme || 'orange') === theme.id
                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() => setBioData((p) => ({ ...p, theme: theme.id }))}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'bg-white/[0.08] border-orange-500 shadow-lg shadow-orange-500/20'
                              : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className="w-4 h-4 rounded-full shadow-sm"
                              style={{ backgroundColor: theme.color }}
                            />
                            <span className="text-xs font-semibold text-white">{theme.name}</span>
                          </div>
                          <span className="text-[10px] text-white/40">Glow effect</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Typography / Font Selector */}
                <div className="pt-6 border-t border-white/[0.06]">
                  <h2 className="text-lg font-bold font-display text-white mb-1">Typography & Font Family</h2>
                  <p className="text-white/40 text-xs mb-4">Select the font that reflects your personal personality</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {FONTS.map((font) => {
                      const isSelected = (bioData.font_family || 'sans') === font.id
                      return (
                        <button
                          key={font.id}
                          type="button"
                          onClick={() => setBioData((p) => ({ ...p, font_family: font.id }))}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'bg-white/[0.08] border-orange-500 shadow-lg shadow-orange-500/20'
                              : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <p className={`text-base font-bold text-white mb-1 ${font.style}`}>{font.name}</p>
                          <p className="text-[10px] text-white/40">{font.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 3D Interactive Canvas Background */}
                <div className="pt-6 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={16} className="text-orange-400" />
                    <h2 className="text-lg font-bold font-display text-white">3D Dynamic Canvas Background</h2>
                  </div>
                  <p className="text-white/40 text-xs mb-4">
                    Immersive interactive 3D WebGL particle simulations rendered live on your bio page
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {BG_3D_STYLES.map((bg) => {
                      const isSelected = (bioData.bg_3d_style || 'particles') === bg.id
                      return (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => setBioData((p) => ({ ...p, bg_3d_style: bg.id as any }))}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'bg-white/[0.08] border-orange-500 shadow-lg shadow-orange-500/20'
                              : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xl">{bg.icon}</span>
                            <span className="text-xs font-semibold text-white">{bg.name}</span>
                          </div>
                          <p className="text-[10px] text-white/40 leading-relaxed">{bg.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Profile Layout Style */}
                <div className="pt-6 border-t border-white/[0.06]">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers size={16} className="text-orange-400" />
                    <h2 className="text-lg font-bold font-display text-white">Profile Layout Style</h2>
                  </div>
                  <p className="text-white/40 text-xs mb-4">
                    Choose between classic stacked links or high-converting 2-column Bento Grid
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {LAYOUT_STYLES.map((lay) => {
                      const isSelected = (bioData.layout_style || 'bento') === lay.id
                      return (
                        <button
                          key={lay.id}
                          type="button"
                          onClick={() => setBioData((p) => ({ ...p, layout_style: lay.id as any }))}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'bg-white/[0.08] border-orange-500 shadow-lg shadow-orange-500/20'
                              : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xl">{lay.icon}</span>
                            <span className="text-xs font-semibold text-white">{lay.name}</span>
                          </div>
                          <p className="text-[10px] text-white/40 leading-relaxed">{lay.desc}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Mini Background Music Player */}
                <div className="pt-6 border-t border-white/[0.06] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Music size={16} className="text-orange-400" />
                      <div>
                        <h2 className="text-lg font-bold font-display text-white">Background Music Player</h2>
                        <p className="text-white/40 text-xs mt-0.5">
                          Mini spinning vinyl disc player on your bio page with chill vibes
                        </p>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => setBioData((p) => ({ ...p, music_enabled: !p.music_enabled }))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        bioData.music_enabled ? 'bg-orange-500' : 'bg-white/10'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          bioData.music_enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {bioData.music_enabled && (
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3.5">
                      <div>
                        <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                          Track Display Title
                        </label>
                        <input
                          type="text"
                          value={bioData.music_title || ''}
                          onChange={(e) => setBioData((p) => ({ ...p, music_title: e.target.value }))}
                          placeholder="e.g. Chill Lofi Beats 🎧"
                          className="w-full px-3 py-2 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-orange-500/60"
                        />
                      </div>

                      <div>
                        <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                          Audio Stream / MP3 URL
                        </label>
                        <input
                          type="url"
                          value={bioData.music_url || ''}
                          onChange={(e) => setBioData((p) => ({ ...p, music_url: e.target.value }))}
                          placeholder="https://... (direct .mp3 link)"
                          className="w-full px-3 py-2 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-orange-500/60 font-mono"
                        />
                      </div>

                      {/* Music Presets */}
                      <div className="pt-1">
                        <span className="text-[10px] text-white/40 block mb-1.5">Free Aesthetic Music Presets:</span>
                        <div className="flex flex-wrap gap-2">
                          {MUSIC_PRESETS.map((m) => (
                            <button
                              key={m.title}
                              type="button"
                              onClick={() =>
                                setBioData((p) => ({
                                  ...p,
                                  music_title: m.title,
                                  music_url: m.url,
                                }))
                              }
                              className={`text-[11px] px-3 py-1.5 rounded-xl border transition-all ${
                                bioData.music_url === m.url
                                  ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                                  : 'bg-white/5 border-white/5 text-white/70 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              {m.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Secret Notes & Anonymous Inbox */}
            {activeTab === 'inbox' && (
              <div className="glass gradient-border rounded-3xl p-6 md:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                      <span>💌 Secret Notes &amp; Anonymous Inbox</span>
                    </h2>
                    <p className="text-white/40 text-xs mt-0.5">
                      Messages sent privately to you by visitors on your bio page
                    </p>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-xl border border-white/10 self-start">
                    <button
                      type="button"
                      onClick={() => setMessageFilter('all')}
                      className={`text-xs px-3 py-1 rounded-lg transition-all ${
                        messageFilter === 'all'
                          ? 'bg-orange-500 text-white font-medium'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      All ({userMessages.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessageFilter('unread')}
                      className={`text-xs px-3 py-1 rounded-lg transition-all ${
                        messageFilter === 'unread'
                          ? 'bg-orange-500 text-white font-medium'
                          : 'text-white/50 hover:text-white'
                      }`}
                    >
                      Unread ({userMessages.filter((m) => !m.is_read).length})
                    </button>
                  </div>
                </div>

                {loadingMessages ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-white/40">
                    <Loader2 size={24} className="animate-spin text-orange-400" />
                    <p className="text-xs">Loading secret notes...</p>
                  </div>
                ) : userMessages.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-white/10 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto text-xl">
                      💌
                    </div>
                    <div>
                      <p className="text-white/80 font-medium text-sm">No secret notes received yet</p>
                      <p className="text-white/40 text-xs mt-1 max-w-sm mx-auto">
                        Share your bio link <span className="text-orange-400">/u/{bioData.username}</span> on your Instagram or TikTok story so friends and followers can send you anonymous notes!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyBioLink}
                      className="btn-glass text-xs py-2 px-4 inline-flex items-center gap-2 hover:border-orange-500/50"
                    >
                      {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedLink ? 'Link Copied!' : 'Copy Bio Link to Share'}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userMessages
                      .filter((m) => (messageFilter === 'unread' ? !m.is_read : true))
                      .map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-4 md:p-5 rounded-2xl border transition-all ${
                            msg.is_read
                              ? 'bg-white/[0.02] border-white/5 text-white/80'
                              : 'bg-gradient-to-r from-orange-500/[0.08] to-amber-500/[0.03] border-orange-500/30 text-white shadow-lg shadow-orange-500/5'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <span className="text-2xl select-none p-2 rounded-xl bg-white/5 border border-white/5 flex-shrink-0">
                                {msg.emoji || '💭'}
                              </span>
                              <div>
                                <p className="text-sm md:text-base leading-relaxed font-medium select-text">
                                  &ldquo;{msg.message}&rdquo;
                                </p>
                                <div className="flex items-center gap-2 mt-2 text-[11px] text-white/40">
                                  <span>{new Date(msg.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                  {!msg.is_read && (
                                    <span className="px-1.5 py-0.2 rounded-full bg-orange-500/20 text-orange-400 font-semibold text-[10px]">
                                      NEW
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => handleShareMessage(msg)}
                                title="Copy note quote to share"
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors text-xs"
                              >
                                <Share2 size={14} />
                              </button>
                              {!msg.is_read && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkMessageRead(msg.id)}
                                  title="Mark as read"
                                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 transition-colors text-xs"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteMessage(msg.id)}
                                title="Delete note"
                                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors text-xs"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: Personal Analytics Overview */}
            {activeTab === 'analytics' && (
              <div className="glass gradient-border rounded-3xl p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-lg font-bold font-display text-white">Bio Traffic & Link Analytics</h2>
                  <p className="text-white/40 text-xs mt-0.5">
                    Real-time visitor counts and clicks on your personal bio profile
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                    <div className="flex items-center justify-between text-white/40 mb-2">
                      <span className="text-xs font-semibold uppercase">Profile Views</span>
                      <Eye size={16} className="text-orange-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{totalViews}</p>
                    <p className="text-[11px] text-white/40 mt-1">Total page impressions</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                    <div className="flex items-center justify-between text-white/40 mb-2">
                      <span className="text-xs font-semibold uppercase">Link Clicks</span>
                      <MousePointerClick size={16} className="text-emerald-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{totalClicks}</p>
                    <p className="text-[11px] text-white/40 mt-1">Clicks across all links</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10">
                    <div className="flex items-center justify-between text-white/40 mb-2">
                      <span className="text-xs font-semibold uppercase">Click Rate (CTR)</span>
                      <TrendingUp size={16} className="text-amber-400" />
                    </div>
                    <p className="text-3xl font-bold text-white">{ctr}%</p>
                    <p className="text-[11px] text-white/40 mt-1">Engagement ratio</p>
                  </div>
                </div>

                {/* Platform Clicks Breakdown */}
                <div className="pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-3">
                    Clicks by Platform / Link
                  </h3>
                  {bioData.clicks_by_platform && Object.keys(bioData.clicks_by_platform).length > 0 ? (
                    <div className="space-y-2">
                      {Object.entries(bioData.clicks_by_platform).map(([plat, count]) => (
                        <div
                          key={plat}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs"
                        >
                          <span className="text-white/80 font-medium">{plat}</span>
                          <span className="text-orange-400 font-mono font-bold">{count} clicks</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-white/40 italic p-3 rounded-xl bg-white/[0.01] border border-white/5">
                      No link clicks recorded yet. Share your bio link to start seeing stats!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Real-time Live Phone Mockup Preview (5 Cols) */}
          <div className={`lg:col-span-5 lg:sticky lg:top-20 ${mobileView === 'preview' ? 'block' : 'hidden lg:block'}`}>
            <div className="text-center mb-3 flex items-center justify-between px-2">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Eye size={14} className="text-orange-400" />
                <span>Live Interactive Mobile Preview</span>
              </div>
              <Link
                href={`/u/${bioData.username}`}
                target="_blank"
                className="text-xs text-orange-400 hover:underline flex items-center gap-1"
              >
                <span>Full Page</span>
                <ExternalLink size={12} />
              </Link>
            </div>

            {/* Phone Bezel */}
            <div className="w-full max-w-[360px] mx-auto rounded-[40px] border-4 border-white/15 bg-[#080808] p-3 shadow-2xl shadow-orange-500/10">
              <div
                className={`w-full aspect-[9/18.5] rounded-[32px] overflow-y-auto bg-[#0a0a0a] p-4 border border-white/5 scrollbar-thin ${
                  bioData.font_family === 'serif' ? 'font-serif' : bioData.font_family === 'mono' ? 'font-mono' : 'font-sans'
                }`}
              >
                {/* Header Cover Banner */}
                <div className="relative w-full h-24 rounded-2xl overflow-hidden bg-white/5 border border-white/10 mb-[-40px]">
                  {bioData.cover_url ? (
                    <Image
                      src={bioData.cover_url}
                      alt="Cover banner"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-purple-500/20" />
                  )}
                </div>

                {/* User Avatar */}
                <div className="text-center pt-2 relative z-10">
                  <div className="relative w-20 h-20 rounded-full mx-auto p-1 bg-gradient-to-tr from-orange-500 to-amber-300 ring-4 ring-[#0a0a0a] shadow-xl">
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-black">
                      {bioData.avatar_url ? (
                        <Image
                          src={bioData.avatar_url}
                          alt={bioData.display_name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30">
                          <User size={24} />
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-base mt-3">
                    {bioData.display_name || 'Your Name'}
                  </h3>
                  <p className="text-[11px] text-orange-400 font-mono">@{bioData.username || 'username'}</p>

                  {bioData.status_badge && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] text-white/90 mt-1">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      <span>{bioData.status_badge}</span>
                    </div>
                  )}

                  {bioData.music_enabled && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-orange-500/30 text-[10px] text-orange-400">
                      <Music size={10} />
                      <span className="truncate max-w-[140px]">{bioData.music_title || 'Music Playing'}</span>
                    </div>
                  )}

                  {bioData.tagline && (
                    <p className="text-[11px] text-white/70 mt-1 font-medium px-2">{bioData.tagline}</p>
                  )}

                  {bioData.location && (
                    <p className="text-[10px] text-white/40 mt-1 flex items-center justify-center gap-1">
                      <MapPin size={10} />
                      <span>{bioData.location}</span>
                    </p>
                  )}

                  {bioData.bio && (
                    <p className="text-[10px] text-white/50 mt-2 line-clamp-3 px-1">{bioData.bio}</p>
                  )}
                </div>

                {/* Social Links Cards (Classic Stack vs Bento 2-Col Grid) */}
                <div className={`mt-5 ${bioData.layout_style === 'bento' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}`}>
                  {bioData.social_links?.map((link) => (
                    <a
                      key={link.id}
                      href={link.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-between p-2.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-orange-500/40 text-xs font-medium text-white transition-all group ${
                        bioData.layout_style === 'bento' ? 'flex-col items-start gap-2 h-20 justify-between' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <PlatformIcon platform={link.platform} className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        <span className="truncate text-[11px]">{link.display_label || link.platform}</span>
                      </div>
                      <ExternalLink size={12} className="text-white/30 group-hover:text-white flex-shrink-0 self-end" />
                    </a>
                  ))}
                </div>

                {/* 4 Photos Preview */}
                {bioData.photos && bioData.photos.length > 0 && (
                  <div className="mt-5">
                    <p className="text-[11px] font-semibold text-white/70 mb-2">Moments & Photos</p>
                    <div className="grid grid-cols-2 gap-2">
                      {bioData.photos.map((photo, i) => (
                        <div
                          key={photo.id || i}
                          className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10"
                        >
                          <Image
                            src={photo.url}
                            alt={photo.caption || `Photo ${i + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Pill */}
                <div className="mt-6 pt-4 border-t border-white/5 text-center">
                  <p className="text-[9px] text-white/30">Built with AJ Bio Builder 🚀</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* QR Code Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm glass gradient-border rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-white/50 hover:text-white rounded-lg glass"
            >
              <X size={16} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mx-auto">
              <QrCode size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Your Bio QR Code</h3>
              <p className="text-white/40 text-xs mt-1">
                Scan with any smartphone camera to visit /u/{bioData.username}
              </p>
            </div>

            {/* QR Code Image */}
            <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-white/10 inline-block mx-auto shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrCodeUrl}
                alt={`QR code for ${bioData.username}`}
                className="w-56 h-56 rounded-xl object-contain mx-auto"
              />
            </div>

            <div className="space-y-2 pt-2">
              <a
                href={qrCodeUrl}
                download={`${bioData.username}-bio-qr.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full justify-center text-xs py-2.5 inline-flex items-center gap-2"
              >
                <Download size={14} />
                <span>Download QR Code Image</span>
              </a>

              <button
                type="button"
                onClick={handleCopyBioLink}
                className="w-full btn-glass justify-center text-xs py-2 inline-flex items-center gap-1.5"
              >
                {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Bio Link'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Native App Bottom Navigation Dock */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c0e]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-2 flex items-center justify-around safe-area-pb shadow-2xl">
        <button
          type="button"
          onClick={() => { setActiveTab('profile'); setMobileView('editor') }}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            activeTab === 'profile' && mobileView === 'editor' ? 'text-orange-400 font-semibold scale-105' : 'text-white/50 hover:text-white'
          }`}
        >
          <User size={18} />
          <span className="text-[10px]">Profile</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('photos'); setMobileView('editor') }}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            activeTab === 'photos' && mobileView === 'editor' ? 'text-orange-400 font-semibold scale-105' : 'text-white/50 hover:text-white'
          }`}
        >
          <ImageIcon size={18} />
          <span className="text-[10px]">Photos</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('socials'); setMobileView('editor') }}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            activeTab === 'socials' && mobileView === 'editor' ? 'text-orange-400 font-semibold scale-105' : 'text-white/50 hover:text-white'
          }`}
        >
          <Share2 size={18} />
          <span className="text-[10px]">Links</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('theme'); setMobileView('editor') }}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            activeTab === 'theme' && mobileView === 'editor' ? 'text-orange-400 font-semibold scale-105' : 'text-white/50 hover:text-white'
          }`}
        >
          <Palette size={18} />
          <span className="text-[10px]">Styles</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('inbox'); setMobileView('editor') }}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl relative transition-all ${
            activeTab === 'inbox' && mobileView === 'editor' ? 'text-orange-400 font-semibold scale-105' : 'text-white/50 hover:text-white'
          }`}
        >
          <Inbox size={18} />
          <span className="text-[10px]">Notes</span>
          {userMessages.filter((m) => !m.is_read).length > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setMobileView(mobileView === 'preview' ? 'editor' : 'preview')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            mobileView === 'preview' ? 'text-orange-400 font-semibold scale-105' : 'text-white/50 hover:text-white'
          }`}
        >
          <Eye size={18} />
          <span className="text-[10px]">Live Card</span>
        </button>
      </nav>

      {/* 9:16 Instagram Story Card Generator Modal */}
      <BioInstagramStoryModal
        isOpen={storyModalOpen}
        onClose={() => setStoryModalOpen(false)}
        bioData={bioData}
      />
    </div>
  )
}
