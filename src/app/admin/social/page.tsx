'use client'

import { useState, useEffect } from 'react'
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  Github,
  Linkedin,
  Instagram,
  Twitter,
  Youtube,
  Facebook,
  Send,
  MessageCircle,
  Mail,
  Music,
  Globe,
} from 'lucide-react'
import type { SocialProfileData } from '@/lib/content-store'

const iconMap: Record<string, React.ReactNode> = {
  Github: <Github size={18} />,
  Linkedin: <Linkedin size={18} />,
  Instagram: <Instagram size={18} />,
  Twitter: <Twitter size={18} />,
  Youtube: <Youtube size={18} />,
  Facebook: <Facebook size={18} />,
  Send: <Send size={18} />,
  MessageCircle: <MessageCircle size={18} />,
  Mail: <Mail size={18} />,
  Music: <Music size={18} />,
  Globe: <Globe size={18} />,
}

interface AddForm {
  platform: string
  display_label: string
  handle: string
  profile_url: string
  icon_name: string
  color: string
  is_visible: boolean
}

const emptyForm: AddForm = {
  platform: '',
  display_label: '',
  handle: '',
  profile_url: '',
  icon_name: 'Globe',
  color: '#F97316',
  is_visible: true,
}

export default function AdminSocialPage() {
  const [profiles, setProfiles] = useState<SocialProfileData[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<AddForm>(emptyForm)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<SocialProfileData>>({})
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('')

  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/social?all=true')
      const json = await res.json()
      if (json.data) {
        setProfiles(json.data)
      }
    } catch (err) {
      console.error('Failed to load social profiles:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles()
  }, [])

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage(msg)
    setStatusType(type)
    setTimeout(() => {
      setStatusMessage('')
      setStatusType('')
    }, 3500)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addForm.platform || !addForm.display_label || !addForm.profile_url) {
      showNotification('Platform, label, and profile URL are required.', 'error')
      return
    }

    setAdding(true)
    try {
      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      })
      const data = await res.json()
      if (!res.ok) {
        showNotification(data.error || 'Failed to add profile.', 'error')
      } else {
        setProfiles((prev) => [...prev, data.data])
        setAddForm(emptyForm)
        setShowAddForm(false)
        showNotification('New profile added and live on the website!')
      }
    } catch {
      showNotification('Failed to add profile.', 'error')
    } finally {
      setAdding(false)
    }
  }

  const toggleVisibility = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/social/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: !current }),
      })
      if (res.ok) {
        setProfiles((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_visible: !current } : p))
        )
        showNotification(!current ? 'Profile made visible on site' : 'Profile hidden from site')
      }
    } catch {
      showNotification('Failed to update visibility', 'error')
    }
  }

  const startEdit = (p: SocialProfileData) => {
    setEditingId(p.id)
    setEditForm({
      display_label: p.display_label,
      handle: p.handle,
      profile_url: p.profile_url,
      color: p.color,
    })
  }

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/social/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        setProfiles((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...editForm } : p))
        )
        setEditingId(null)
        showNotification('Profile updated and live!')
      }
    } catch {
      showNotification('Failed to save edit', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this social link?')) return
    try {
      const res = await fetch(`/api/social/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setProfiles((prev) => prev.filter((p) => p.id !== id))
        showNotification('Social link removed from website')
      }
    } catch {
      showNotification('Failed to delete', 'error')
    }
  }

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= profiles.length) return

    const reordered = [...profiles]
    const temp = reordered[index]
    reordered[index] = reordered[targetIndex]
    reordered[targetIndex] = temp

    const updated = reordered.map((p, i) => ({ ...p, sort_order: i + 1 }))
    setProfiles(updated)

    try {
      await fetch('/api/social', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      })
      showNotification('Display order updated on website')
    } catch {
      // rollback
      fetchProfiles()
    }
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-orange-500/60 transition-colors'

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-white/40">
        <Loader2 className="animate-spin mr-3" size={20} />
        Loading social links...
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white text-2xl font-bold font-display">Social Links Hub</h1>
          <p className="text-white/40 mt-1">
            Manage all your connected social profiles and icons.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm((p) => !p)}
          className="btn-primary text-sm self-start sm:self-auto"
        >
          <Plus size={16} />
          {showAddForm ? 'Close Form' : 'Add New Profile'}
        </button>
      </div>

      {statusMessage && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl text-sm ${
            statusType === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {statusType === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="glass gradient-border rounded-2xl p-6 space-y-4">
          <h2 className="text-white font-semibold text-base mb-2">New Social Profile</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Platform Name
              </label>
              <input
                type="text"
                placeholder="e.g. YouTube, Twitter, Threads"
                value={addForm.platform}
                onChange={(e) => setAddForm((p) => ({ ...p, platform: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Display Label
              </label>
              <input
                type="text"
                placeholder="e.g. YouTube Channel"
                value={addForm.display_label}
                onChange={(e) => setAddForm((p) => ({ ...p, display_label: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Handle / Username
              </label>
              <input
                type="text"
                placeholder="e.g. @alexmorgan"
                value={addForm.handle}
                onChange={(e) => setAddForm((p) => ({ ...p, handle: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Profile URL
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={addForm.profile_url}
                onChange={(e) => setAddForm((p) => ({ ...p, profile_url: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Icon
              </label>
              <select
                value={addForm.icon_name}
                onChange={(e) => setAddForm((p) => ({ ...p, icon_name: e.target.value }))}
                className={`${inputClass} bg-[#111]`}
              >
                {Object.keys(iconMap).map((icon) => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5 uppercase tracking-wider">
                Card Accent Color
              </label>
              <input
                type="text"
                placeholder="#F97316"
                value={addForm.color}
                onChange={(e) => setAddForm((p) => ({ ...p, color: e.target.value }))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={adding} className="btn-primary text-sm">
              {adding ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              Save to Live Site
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Profiles list */}
      <div className="space-y-3">
        {profiles.map((profile, index) => {
          const isEditing = editingId === profile.id

          return (
            <div
              key={profile.id}
              className={`glass gradient-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-opacity ${
                !profile.is_visible ? 'opacity-40' : 'opacity-100'
              }`}
            >
              {/* Icon & Details */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `${profile.color || '#F97316'}20`,
                    border: `1px solid ${profile.color || '#F97316'}40`,
                    color: profile.color || '#F97316',
                  }}
                >
                  {iconMap[profile.icon_name] || <Globe size={18} />}
                </div>

                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                    <input
                      type="text"
                      value={editForm.display_label ?? profile.display_label}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, display_label: e.target.value }))
                      }
                      className="px-3 py-1.5 rounded-lg glass text-xs text-white"
                      placeholder="Label"
                    />
                    <input
                      type="text"
                      value={editForm.handle ?? profile.handle}
                      onChange={(e) => setEditForm((p) => ({ ...p, handle: e.target.value }))}
                      className="px-3 py-1.5 rounded-lg glass text-xs text-white"
                      placeholder="Handle"
                    />
                    <input
                      type="url"
                      value={editForm.profile_url ?? profile.profile_url}
                      onChange={(e) =>
                        setEditForm((p) => ({ ...p, profile_url: e.target.value }))
                      }
                      className="px-3 py-1.5 rounded-lg glass text-xs text-white sm:col-span-2"
                      placeholder="Profile URL"
                    />
                  </div>
                ) : (
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-semibold">{profile.display_label}</p>
                      <span className="text-white/30 text-xs">({profile.platform})</span>
                    </div>
                    <p className="text-white/50 text-xs mt-0.5">{profile.handle}</p>
                    <a
                      href={profile.profile_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-400 text-xs hover:underline truncate block max-w-xs mt-0.5"
                    >
                      {profile.profile_url}
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                {/* Reorder */}
                <div className="flex flex-col gap-0.5 mr-2">
                  <button
                    onClick={() => moveOrder(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded glass hover:text-orange-400 disabled:opacity-20 text-white/40"
                    title="Move up"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    onClick={() => moveOrder(index, 'down')}
                    disabled={index === profiles.length - 1}
                    className="p-1 rounded glass hover:text-orange-400 disabled:opacity-20 text-white/40"
                    title="Move down"
                  >
                    <ChevronDown size={13} />
                  </button>
                </div>

                {isEditing ? (
                  <>
                    <button
                      onClick={() => saveEdit(profile.id)}
                      className="btn-primary p-2 rounded-xl text-xs"
                      title="Save"
                    >
                      <Save size={15} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="btn-secondary p-2 rounded-xl text-xs"
                      title="Cancel"
                    >
                      <X size={15} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => toggleVisibility(profile.id, profile.is_visible)}
                      className={`p-2.5 rounded-xl glass text-xs transition-colors ${
                        profile.is_visible
                          ? 'text-white/60 hover:text-white'
                          : 'text-white/20 hover:text-white/50'
                      }`}
                      title={profile.is_visible ? 'Hide from website' : 'Show on website'}
                    >
                      {profile.is_visible ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button
                      onClick={() => startEdit(profile)}
                      className="p-2.5 rounded-xl glass text-white/60 hover:text-orange-400 text-xs transition-colors"
                      title="Edit"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(profile.id)}
                      className="p-2.5 rounded-xl glass text-white/60 hover:text-red-400 text-xs transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
