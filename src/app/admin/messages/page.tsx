'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  MessageSquare,
  Mail,
  Trash2,
  CheckCircle,
  RefreshCw,
  Loader2,
  Clock,
  Sparkles,
  ExternalLink,
  Reply,
  Search,
  User,
  Filter,
} from 'lucide-react'

interface AnonymousMsg {
  id: string
  message: string
  emoji?: string
  created_at: string
  is_read?: boolean
}

interface ContactInquiry {
  id: string
  name: string
  email: string
  subject: string
  message: string
  ip_address?: string
  created_at: string
  is_read?: boolean
}

export default function AdminMessagesPage() {
  const [activeTab, setActiveTab] = useState<'anonymous' | 'inquiries'>('anonymous')
  
  // Data states
  const [anonMessages, setAnonMessages] = useState<AnonymousMsg[]>([])
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([])
  const [loadingAnon, setLoadingAnon] = useState(true)
  const [loadingInquiries, setLoadingInquiries] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all')

  const loadAnonymousMessages = async () => {
    setLoadingAnon(true)
    try {
      const res = await fetch(`/api/messages/anonymous?_t=${Date.now()}`, { cache: 'no-store' })
      const json = await res.json()
      if (res.ok && json.data) {
        setAnonMessages(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingAnon(false)
    }
  }

  const loadContactInquiries = async () => {
    setLoadingInquiries(true)
    try {
      const res = await fetch(`/api/contact?_t=${Date.now()}`, { cache: 'no-store' })
      const json = await res.json()
      if (res.ok && json.data) {
        setInquiries(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingInquiries(false)
    }
  }

  const reloadAll = () => {
    loadAnonymousMessages()
    loadContactInquiries()
  }

  useEffect(() => {
    reloadAll()
  }, [])

  // Handlers for Anonymous Messages
  const handleToggleAnonRead = async (id: string, current: boolean) => {
    try {
      await fetch('/api/messages/anonymous', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_read: !current }),
      })
      setAnonMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_read: !current } : m))
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteAnon = async (id: string) => {
    if (!confirm('Permanently delete this secret note?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/messages/anonymous?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setAnonMessages((prev) => prev.filter((m) => m.id !== id))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  // Handlers for Contact Inquiries
  const handleToggleInquiryRead = async (id: string, current: boolean) => {
    try {
      await fetch('/api/contact', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_read: !current }),
      })
      setInquiries((prev) =>
        prev.map((i) => (i.id === id ? { ...i, is_read: !current } : i))
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Permanently delete this contact inquiry?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/contact?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setInquiries((prev) => prev.filter((i) => i.id !== id))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  // Filtered lists
  const unreadAnonCount = anonMessages.filter((m) => !m.is_read).length
  const unreadInquiriesCount = inquiries.filter((i) => !i.is_read).length

  const filteredAnon = useMemo(() => {
    return anonMessages.filter((m) => {
      const matchesSearch = !searchQuery || m.message.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRead =
        filterRead === 'all'
          ? true
          : filterRead === 'unread'
          ? !m.is_read
          : !!m.is_read
      return matchesSearch && matchesRead
    })
  }, [anonMessages, searchQuery, filterRead])

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((i) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !searchQuery ||
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.subject.toLowerCase().includes(q) ||
        i.message.toLowerCase().includes(q)
      const matchesRead =
        filterRead === 'all'
          ? true
          : filterRead === 'unread'
          ? !i.is_read
          : !!i.is_read
      return matchesSearch && matchesRead
    })
  }, [inquiries, searchQuery, filterRead])

  const isLoading = activeTab === 'anonymous' ? loadingAnon : loadingInquiries

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Communications &amp; Inbox</h1>
          <p className="text-white/40 text-xs mt-1">
            Real-time hub for both secret anonymous capsule notes and direct client contact inquiries
          </p>
        </div>

        <button
          onClick={reloadAll}
          disabled={loadingAnon || loadingInquiries}
          className="btn-glass text-xs py-2 px-3 self-start sm:self-auto inline-flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loadingAnon || loadingInquiries ? 'animate-spin' : ''} />
          <span>Sync Cloud Inbox</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('anonymous')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'anonymous'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <MessageSquare size={15} />
          <span>Secret Notes</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === 'anonymous'
                ? 'bg-black/30 text-white'
                : 'bg-white/10 text-white/70'
            }`}
          >
            {anonMessages.length}
          </span>
          {unreadAnonCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'inquiries'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Mail size={15} />
          <span>Contact Inquiries</span>
          <span
            className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === 'inquiries'
                ? 'bg-black/30 text-white'
                : 'bg-white/10 text-white/70'
            }`}
          >
            {inquiries.length}
          </span>
          {unreadInquiriesCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activeTab === 'anonymous' ? (
          <>
            <div className="glass gradient-border rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Total Secret Notes</p>
                <p className="text-2xl font-bold text-white mt-1">{anonMessages.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                <MessageSquare size={18} />
              </div>
            </div>

            <div className="glass gradient-border rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-amber-400/80 text-xs font-medium uppercase tracking-wider">Unread Notes</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{unreadAnonCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Clock size={18} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="glass gradient-border rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Total Client Inquiries</p>
                <p className="text-2xl font-bold text-white mt-1">{inquiries.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
                <Mail size={18} />
              </div>
            </div>

            <div className="glass gradient-border rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-amber-400/80 text-xs font-medium uppercase tracking-wider">Unread Inquiries</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{unreadInquiriesCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Clock size={18} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder={activeTab === 'anonymous' ? 'Search note messages...' : 'Search by sender, email, subject, text...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl glass text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-orange-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto w-full sm:w-auto">
          <button
            onClick={() => setFilterRead('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterRead === 'all' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterRead('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterRead === 'unread' ? 'bg-amber-500/20 text-amber-300' : 'text-white/40 hover:text-white/70'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilterRead('read')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterRead === 'read' ? 'bg-emerald-500/20 text-emerald-300' : 'text-white/40 hover:text-white/70'
            }`}
          >
            Read
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {isLoading ? (
        <div className="text-center py-16">
          <Loader2 size={24} className="animate-spin text-orange-400 mx-auto mb-2" />
          <p className="text-white/40 text-xs">
            {activeTab === 'anonymous' ? 'Loading secret notes...' : 'Loading contact inquiries...'}
          </p>
        </div>
      ) : activeTab === 'anonymous' ? (
        /* Anonymous Tab */
        filteredAnon.length > 0 ? (
          <div className="space-y-3">
            {filteredAnon.map((m) => {
              const isDeleting = deletingId === m.id

              return (
                <div
                  key={m.id}
                  className={`glass gradient-border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                    !m.is_read ? 'border-orange-500/30 bg-orange-500/[0.02]' : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl flex-shrink-0">
                      {m.emoji || '💭'}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white/90">Anonymous Visitor</span>
                        {!m.is_read && (
                          <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-semibold">
                            New
                          </span>
                        )}
                        <span className="text-[10px] text-white/30 ml-auto md:ml-0">
                          {new Date(m.created_at).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                        {m.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                    <button
                      onClick={() => handleToggleAnonRead(m.id, !!m.is_read)}
                      className="btn-glass text-xs py-1.5 px-3 text-white/60 hover:text-white"
                    >
                      {m.is_read ? 'Mark Unread' : 'Mark Read'}
                    </button>

                    <button
                      onClick={() => handleDeleteAnon(m.id)}
                      disabled={isDeleting}
                      className="p-2 rounded-xl text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors"
                      title="Delete message"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 glass rounded-2xl border border-white/10">
            <MessageSquare size={32} className="mx-auto text-white/20 mb-2" />
            <p className="text-white/40 text-xs">No secret notes matching criteria.</p>
          </div>
        )
      ) : (
        /* Inquiries Tab */
        filteredInquiries.length > 0 ? (
          <div className="space-y-3">
            {filteredInquiries.map((inq) => {
              const isDeleting = deletingId === inq.id
              const mailtoUrl = `mailto:${encodeURIComponent(inq.email)}?subject=${encodeURIComponent(`Re: ${inq.subject}`)}`

              return (
                <div
                  key={inq.id}
                  className={`glass gradient-border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all ${
                    !inq.is_read ? 'border-orange-500/30 bg-orange-500/[0.02]' : 'border-white/10'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 flex-shrink-0">
                        <User size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white">{inq.name}</span>
                          <span className="text-xs text-orange-400 font-mono">({inq.email})</span>
                          {!inq.is_read && (
                            <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full font-semibold">
                              New Inquiry
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/70 font-medium mt-0.5">
                          Subject: <span className="text-white">{inq.subject}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-[10px] text-white/30 self-start md:self-auto font-mono">
                      {new Date(inq.created_at).toLocaleString()}
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="bg-black/30 rounded-xl p-3.5 border border-white/5 text-xs text-white/80 leading-relaxed whitespace-pre-wrap">
                    {inq.message}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5">
                    <a
                      href={mailtoUrl}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs font-medium transition-colors"
                    >
                      <Reply size={14} />
                      <span>Reply via Email</span>
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleInquiryRead(inq.id, !!inq.is_read)}
                        className="btn-glass text-xs py-1.5 px-3 text-white/60 hover:text-white"
                      >
                        {inq.is_read ? 'Mark Unread' : 'Mark Read'}
                      </button>

                      <button
                        onClick={() => handleDeleteInquiry(inq.id)}
                        disabled={isDeleting}
                        className="p-2 rounded-xl text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors"
                        title="Delete inquiry"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 glass rounded-2xl border border-white/10">
            <Mail size={32} className="mx-auto text-white/20 mb-2" />
            <p className="text-white/40 text-xs">No direct contact inquiries matching criteria.</p>
          </div>
        )
      )}
    </div>
  )
}
