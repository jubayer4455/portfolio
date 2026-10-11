'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Users,
  ExternalLink,
  Trash2,
  RefreshCw,
  Loader2,
  Eye,
  MousePointerClick,
  Share2,
  ImageIcon,
  Search,
  Check,
  ShieldCheck,
  Shield,
  Star,
  Ban,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'
import type { UserBioData } from '@/lib/builder-store'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserBioData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'verified' | 'featured' | 'suspended'>('all')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      const json = await res.json()
      if (res.ok && json.data) {
        setUsers(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleToggleStatus = async (
    user: UserBioData,
    field: 'is_verified' | 'is_suspended' | 'is_featured'
  ) => {
    const newValue = !user[field]
    setActionLoadingId(`${user.id}-${field}`)

    // Optimistic update
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, [field]: newValue } : u))
    )

    try {
      const res = await fetch('/api/admin/users/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          username: user.username,
          [field]: newValue,
        }),
      })

      if (res.ok) {
        if (field === 'is_verified') {
          showToast(`@${user.username} is now ${newValue ? 'Officially Verified 🏅' : 'Unverified'}`)
        } else if (field === 'is_suspended') {
          showToast(`@${user.username} has been ${newValue ? 'Suspended 🚫' : 'Reactivated ✅'}`)
        } else if (field === 'is_featured') {
          showToast(`@${user.username} is ${newValue ? 'now Featured on Homepage ⭐' : 'removed from Featured'}`)
        }
      } else {
        // Rollback on failure
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, [field]: !newValue } : u))
        )
        alert('Failed to update status.')
      }
    } catch {
      // Rollback
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, [field]: !newValue } : u))
      )
      alert('Failed to update status.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Are you sure you want to delete @${username}'s bio site? This cannot be undone.`)) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id && u.username !== id))
        showToast(`@${username}'s bio site has been deleted.`)
      }
    } catch {
      alert('Failed to delete user.')
    } finally {
      setDeletingId(null)
    }
  }

  const verifiedCount = users.filter((u) => u.is_verified).length
  const featuredCount = users.filter((u) => u.is_featured).length
  const suspendedCount = users.filter((u) => u.is_suspended).length

  const filtered = users.filter((u) => {
    const q = search.toLowerCase()
    const matchesSearch =
      u.username.toLowerCase().includes(q) ||
      u.display_name.toLowerCase().includes(q) ||
      (u.location && u.location.toLowerCase().includes(q))

    if (!matchesSearch) return false

    if (filterTab === 'verified') return !!u.is_verified
    if (filterTab === 'featured') return !!u.is_featured
    if (filterTab === 'suspended') return !!u.is_suspended
    return true
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Registered Users & Bio Sites</h1>
          <p className="text-white/40 text-xs mt-1">
            Super Admin Controls: award verified badges, feature top creators on homepage, and manage accounts.
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={loading}
          className="btn-glass text-xs py-2 px-3 self-start sm:self-auto inline-flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Toast message */}
      {toast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 shadow-lg">
          <Check size={14} />
          <span>{toast}</span>
        </div>
      )}

      {/* Search & Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterTab === 'all'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'glass text-white/60 hover:text-white'
            }`}
          >
            All Bios ({users.length})
          </button>
          <button
            onClick={() => setFilterTab('verified')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 transition-all ${
              filterTab === 'verified'
                ? 'bg-amber-500 text-black font-semibold shadow-md shadow-amber-500/20'
                : 'glass text-white/60 hover:text-white'
            }`}
          >
            <ShieldCheck size={13} className="text-amber-400" />
            <span>Verified ({verifiedCount})</span>
          </button>
          <button
            onClick={() => setFilterTab('featured')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 transition-all ${
              filterTab === 'featured'
                ? 'bg-amber-400 text-black font-semibold'
                : 'glass text-white/60 hover:text-white'
            }`}
          >
            <Star size={13} className="text-amber-400" />
            <span>Featured ({featuredCount})</span>
          </button>
          <button
            onClick={() => setFilterTab('suspended')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 transition-all ${
              filterTab === 'suspended'
                ? 'bg-red-500 text-white'
                : 'glass text-white/60 hover:text-white'
            }`}
          >
            <AlertTriangle size={13} className="text-red-400" />
            <span>Suspended ({suspendedCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username or name..."
            className="w-full pl-9 pr-4 py-2 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-orange-500/50"
          />
        </div>
      </div>

      {/* Users Table / Grid */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 size={24} className="animate-spin text-orange-400 mx-auto mb-2" />
          <p className="text-white/40 text-xs">Loading registered bio profiles...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((u) => {
            const isDeleting = deletingId === u.id
            const liveUrl = `/u/${u.username}`

            return (
              <div
                key={u.id || u.username}
                className={`glass gradient-border rounded-2xl p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 transition-all hover:border-white/20 ${
                  u.is_suspended ? 'border-red-500/30 bg-red-950/10' : ''
                }`}
              >
                {/* User Info */}
                <div className="flex items-center gap-4 min-w-[280px]">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                    {u.avatar_url ? (
                      <Image
                        src={u.avatar_url}
                        alt={u.display_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-white/40 text-sm">
                        {u.display_name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-bold text-sm">{u.display_name}</h3>
                      {u.is_verified && (
                        <span
                          title="Official Verified Creator"
                          className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-black flex items-center justify-center shrink-0"
                        >
                          <ShieldCheck size={11} className="stroke-[2.5]" />
                        </span>
                      )}
                      {u.is_featured && (
                        <span
                          title="Featured on Homepage"
                          className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30"
                        >
                          FEATURED
                        </span>
                      )}
                      {u.is_suspended && (
                        <span
                          title="Account Suspended"
                          className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30"
                        >
                          SUSPENDED
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-0.5">
                      <Link
                        href={liveUrl}
                        target="_blank"
                        className="text-orange-400 font-mono text-xs hover:underline flex items-center gap-0.5"
                      >
                        <span>@{u.username}</span>
                        <ExternalLink size={10} />
                      </Link>
                      {u.location && (
                        <span className="text-white/30 text-[11px]">• {u.location}</span>
                      )}
                    </div>

                    <p className="text-white/40 text-xs mt-1 truncate max-w-xs">
                      {u.tagline || u.bio || 'No tagline set'}
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-5 text-xs py-2 xl:py-0 border-y xl:border-y-0 border-white/5">
                  <div className="text-center min-w-[50px]" title="Total Profile Views">
                    <div className="flex items-center gap-1 text-white/40 justify-center">
                      <Eye size={12} className="text-orange-400" />
                      <span>Views</span>
                    </div>
                    <span className="text-white font-bold">{u.views || 0}</span>
                  </div>

                  <div className="text-center min-w-[50px]" title="Total Link Clicks">
                    <div className="flex items-center gap-1 text-white/40 justify-center">
                      <MousePointerClick size={12} className="text-emerald-400" />
                      <span>Clicks</span>
                    </div>
                    <span className="text-white font-bold">{u.clicks || 0}</span>
                  </div>

                  <div className="text-center min-w-[50px]" title="Uploaded Photos">
                    <div className="flex items-center gap-1 text-white/40 justify-center">
                      <ImageIcon size={12} className="text-amber-400" />
                      <span>Photos</span>
                    </div>
                    <span className="text-white font-bold">{u.photos?.length || 0}/4</span>
                  </div>

                  <div className="text-center min-w-[50px]" title="Social Links">
                    <div className="flex items-center gap-1 text-white/40 justify-center">
                      <Share2 size={12} className="text-cyan-400" />
                      <span>Links</span>
                    </div>
                    <span className="text-white font-bold">{u.social_links?.length || 0}</span>
                  </div>
                </div>

                {/* Admin Status Toggles & Actions */}
                <div className="flex flex-wrap items-center gap-2 self-start xl:self-center">
                  {/* Verified Toggle */}
                  <button
                    onClick={() => handleToggleStatus(u, 'is_verified')}
                    disabled={actionLoadingId === `${u.id}-is_verified`}
                    className={`text-xs py-1.5 px-2.5 rounded-xl border inline-flex items-center gap-1.5 transition-all ${
                      u.is_verified
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                        : 'glass border-white/10 text-white/50 hover:text-white'
                    }`}
                    title={u.is_verified ? 'Remove Verified Badge' : 'Award Official Verified Badge'}
                  >
                    <ShieldCheck size={13} className={u.is_verified ? 'text-amber-400' : 'text-white/40'} />
                    <span>{u.is_verified ? 'Verified' : 'Verify'}</span>
                  </button>

                  {/* Feature on Home Toggle */}
                  <button
                    onClick={() => handleToggleStatus(u, 'is_featured')}
                    disabled={actionLoadingId === `${u.id}-is_featured`}
                    className={`text-xs py-1.5 px-2.5 rounded-xl border inline-flex items-center gap-1.5 transition-all ${
                      u.is_featured
                        ? 'bg-amber-400/15 border-amber-400/30 text-amber-300 hover:bg-amber-400/25'
                        : 'glass border-white/10 text-white/50 hover:text-white'
                    }`}
                    title={u.is_featured ? 'Remove from Homepage' : 'Feature Creator on Homepage'}
                  >
                    <Star
                      size={13}
                      className={u.is_featured ? 'fill-amber-400 text-amber-400' : 'text-white/40'}
                    />
                    <span>{u.is_featured ? 'Featured' : 'Feature'}</span>
                  </button>

                  {/* Ban / Suspend Toggle */}
                  <button
                    onClick={() => handleToggleStatus(u, 'is_suspended')}
                    disabled={actionLoadingId === `${u.id}-is_suspended`}
                    className={`text-xs py-1.5 px-2.5 rounded-xl border inline-flex items-center gap-1.5 transition-all ${
                      u.is_suspended
                        ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30'
                        : 'glass border-white/10 text-white/50 hover:text-red-400'
                    }`}
                    title={u.is_suspended ? 'Reactivate Bio Site' : 'Suspend / Pause Bio Site'}
                  >
                    <Ban size={13} className={u.is_suspended ? 'text-red-400' : 'text-white/40'} />
                    <span>{u.is_suspended ? 'Suspended' : 'Suspend'}</span>
                  </button>

                  {/* Visit Bio */}
                  <Link
                    href={liveUrl}
                    target="_blank"
                    className="btn-glass text-xs py-1.5 px-2.5 inline-flex items-center gap-1 hover:text-orange-400"
                    title="Open Live Bio"
                  >
                    <span>View</span>
                    <ExternalLink size={11} />
                  </Link>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(u.id, u.username)}
                    disabled={isDeleting}
                    className="p-1.5 rounded-xl text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors"
                    title="Delete User Bio"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 glass rounded-2xl border border-white/10">
          <Users size={32} className="mx-auto text-white/20 mb-2" />
          <p className="text-white/40 text-xs">No registered bio profiles match your filter.</p>
        </div>
      )}
    </div>
  )
}
