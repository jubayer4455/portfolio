'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  User,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  Lock,
  Mail,
  CheckCircle2,
  MapPin,
  Sparkles,
  Quote,
  Eye,
  EyeOff,
} from 'lucide-react'
import type { SiteSettingsData } from '@/lib/content-store'

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  // Profile fields
  const [firstName, setFirstName] = useState('Abdul Al')
  const [lastName, setLastName] = useState('Jubayer')
  const [tagline, setTagline] = useState('Visual Creator & Life Storyteller')
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
  )
  const [verified, setVerified] = useState(true)
  const [location, setLocation] = useState('Dhaka, Bangladesh')
  const [quoteOrMotto, setQuoteOrMotto] = useState(
    'Living passionately, capturing moments, and connecting with inspiring minds.'
  )
  const [bioIntro, setBioIntro] = useState(
    'Welcome to my official social hub! Connect with me across all my platforms and explore my visual diary.'
  )
  const [bioP1, setBioP1] = useState(
    "Hey there! I'm Abdul Al Jubayer, a passionate visual creator and lifestyle storyteller based in Dhaka, Bangladesh."
  )
  const [bioP2, setBioP2] = useState(
    'I believe every day holds a story waiting to be told. Whether exploring new spots, capturing aesthetic moments, or meeting fascinating people, this space is where I share my personal journey.'
  )

  // Security fields
  const [adminEmail, setAdminEmail] = useState('admin@portfolio.com')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/admin/profile')
        const json = await res.json()
        if (json.data) {
          const s = json.data as SiteSettingsData
          if (s.first_name) setFirstName(s.first_name)
          if (s.last_name) setLastName(s.last_name)
          if (s.tagline) setTagline(s.tagline)
          if (s.avatar_url) setAvatarUrl(s.avatar_url)
          if (s.verified !== undefined) setVerified(!!s.verified)
          if (s.location) setLocation(s.location)
          if (s.quote_or_motto) setQuoteOrMotto(s.quote_or_motto)
          if (s.bio_intro) setBioIntro(s.bio_intro)
          if (s.bio_full_p1) setBioP1(s.bio_full_p1)
          if (s.bio_full_p2) setBioP2(s.bio_full_p2)
          if (s.contact_email) setAdminEmail(s.contact_email)
        }
      } catch (err) {
        console.error('Failed to load profile:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    setStatus('idle')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      if (res.ok && data.url) {
        setAvatarUrl(data.url)
        setStatus('success')
        setStatusMessage('Avatar photo uploaded successfully! Click "Save Changes" to apply.')
      } else {
        // Fallback to FileReader DataURL
        const reader = new FileReader()
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setAvatarUrl(reader.result)
          }
        }
        reader.readAsDataURL(file)
      }
    } catch {
      // Local fallback
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result)
        }
      }
      reader.readAsDataURL(file)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword && newPassword.length < 6) {
      setStatus('error')
      setStatusMessage('New password must be at least 6 characters.')
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      setStatus('error')
      setStatusMessage('Passwords do not match.')
      return
    }

    setSaving(true)
    setStatus('idle')

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          tagline,
          avatar_url: avatarUrl,
          verified,
          location,
          quote_or_motto: quoteOrMotto,
          bio_intro: bioIntro,
          bio_full_p1: bioP1,
          bio_full_p2: bioP2,
          new_email: adminEmail,
          new_password: newPassword || undefined,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Failed to update profile')
      }

      setStatus('success')
      setStatusMessage(json.message || 'Profile updated successfully across the entire site!')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setStatus('error')
      setStatusMessage(err.message || 'Failed to save changes.')
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
        Loading profile...
      </div>
    )
  }

  const fullName = `${firstName} ${lastName}`.trim()

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-bold font-display">My Profile</h1>
        <p className="text-white/40 mt-1 text-sm">
          Update your personal name, photo, bio, and login credentials. Changes reflect across the whole website immediately.
        </p>
      </div>

      {/* Live Profile Header Preview Card */}
      <div className="glass gradient-border rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-orange-500/10 via-black/40 to-amber-500/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar Ring */}
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-orange-500 via-amber-400 to-orange-600 blur-sm opacity-80 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-orange-500/50 bg-neutral-900 shadow-xl">
              <Image
                src={avatarUrl}
                alt={fullName}
                fill
                unoptimized
                className="object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                <Upload size={18} />
                <span className="text-[10px] mt-1 font-semibold">Change</span>
              </div>
            </div>
            {verified && (
              <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-orange-500 border-2 border-[#0a0a0a] flex items-center justify-center text-white shadow-md">
                <CheckCircle2 size={15} />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-white font-bold text-2xl font-display truncate">
                {fullName}
              </h2>
              {verified && (
                <CheckCircle2 size={18} className="text-blue-400 fill-blue-500/20 flex-shrink-0" />
              )}
            </div>
            <p className="text-orange-400 text-sm font-medium mt-1">{tagline}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-white/50 mt-3">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-orange-400" />
                <span>{location}</span>
              </div>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Live on Website</span>
            </div>

            {quoteOrMotto && (
              <p className="text-white/70 text-xs italic font-serif mt-3 line-clamp-2 max-w-xl">
                &ldquo;{quoteOrMotto}&rdquo;
              </p>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Identity & Name */}
        <div className="glass gradient-border rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <User size={18} className="text-orange-400" /> Personal Identity &amp; Full Name
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
                placeholder="Abdul Al"
                required
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Last Name * (Orange Highlight)
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
                placeholder="Jubayer"
                required
              />
            </div>
          </div>

          {/* Avatar Upload / URL */}
          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
              Profile Photo / Avatar
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className={`${inputClass} flex-1`}
                placeholder="Paste image URL (Unsplash, Imgur, Supabase...)"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="btn-secondary w-full sm:w-auto text-xs px-4 py-3 flex-shrink-0 flex items-center justify-center gap-2"
              >
                {uploadingAvatar ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    <span>Upload Image</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Profile Tagline / Headline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className={inputClass}
                placeholder="Visual Creator & Life Storyteller"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputClass}
                placeholder="Dhaka, Bangladesh"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <input
              id="profile-verified"
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              className="w-4 h-4 rounded text-orange-500 bg-white/10 border-white/20 focus:ring-orange-500"
            />
            <label htmlFor="profile-verified" className="text-white text-sm cursor-pointer flex items-center gap-1.5">
              <span>Display Official Blue Verified Creator Badge</span>
              <CheckCircle2 size={16} className="text-blue-400" />
            </label>
          </div>
        </div>

        {/* 2. Bio Story & Philosophy */}
        <div className="glass gradient-border rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <Quote size={18} className="text-orange-400" /> Personal Bio &amp; Life Motto
          </h2>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
              Favorite Life Motto / Quote
            </label>
            <input
              type="text"
              value={quoteOrMotto}
              onChange={(e) => setQuoteOrMotto(e.target.value)}
              className={inputClass}
              placeholder="Living passionately, capturing moments, and connecting with inspiring minds."
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
              Hero Introduction (Top of Profile)
            </label>
            <textarea
              rows={2}
              value={bioIntro}
              onChange={(e) => setBioIntro(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
              About Me — Story Paragraph 1
            </label>
            <textarea
              rows={3}
              value={bioP1}
              onChange={(e) => setBioP1(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
              About Me — Story Paragraph 2
            </label>
            <textarea
              rows={3}
              value={bioP2}
              onChange={(e) => setBioP2(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* 3. Account Login & Security */}
        <div className="glass gradient-border rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-base flex items-center gap-2">
            <Lock size={18} className="text-orange-400" /> Admin Account Credentials &amp; Security
          </h2>
          <p className="text-white/40 text-xs">
            Change your administrator email or set a new password for signing into this admin panel. Leave password blank if you do not want to change it.
          </p>

          <div>
            <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
              Admin Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="admin@portfolio.com"
              />
              <Mail size={16} className="text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                New Admin Password (optional)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`${inputClass} pr-10`}
                  placeholder="Leave blank to keep current"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder="Re-type new password"
              />
            </div>
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
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Save button */}
        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full sm:w-auto px-8 py-3.5 justify-center disabled:opacity-50 text-sm font-semibold"
        >
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saving Profile Changes...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Profile Changes Everywhere
            </>
          )}
        </button>
      </form>
    </div>
  )
}
