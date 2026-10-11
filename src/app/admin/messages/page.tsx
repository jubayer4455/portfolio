'use client'

import { useState, useEffect } from 'react'
import {
  MessageSquare,
  Trash2,
  CheckCircle,
  RefreshCw,
  Loader2,
  Clock,
  Sparkles,
  Heart
} from 'lucide-react'

interface AnonymousMsg {
  id: string
  message: string
  emoji?: string
  created_at: string
  is_read?: boolean
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<AnonymousMsg[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadMessages = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/messages/anonymous')
      const json = await res.json()
      if (res.ok && json.data) {
        setMessages(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [])

  const handleToggleRead = async (id: string, current: boolean) => {
    try {
      await fetch('/api/messages/anonymous', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_read: !current }),
      })
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, is_read: !current } : m))
      )
    } catch {}
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/messages/anonymous?id=${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id))
      }
    } catch {} finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-white">Anonymous Messages Inbox</h1>
          <p className="text-white/40 text-xs mt-1">
            Read secret and anonymous feedback sent by visitors through your homepage capsule
          </p>
        </div>

        <button
          onClick={loadMessages}
          disabled={loading}
          className="btn-glass text-xs py-2 px-3 self-start sm:self-auto inline-flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass gradient-border rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Total Received</p>
            <p className="text-2xl font-bold text-white mt-1">{messages.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400">
            <MessageSquare size={18} />
          </div>
        </div>

        <div className="glass gradient-border rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-amber-400/80 text-xs font-medium uppercase tracking-wider">Unread Messages</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {messages.filter((m) => !m.is_read).length}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="text-center py-16">
          <Loader2 size={24} className="animate-spin text-orange-400 mx-auto mb-2" />
          <p className="text-white/40 text-xs">Loading secret messages...</p>
        </div>
      ) : messages.length > 0 ? (
        <div className="space-y-3">
          {messages.map((m) => {
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
                    onClick={() => handleToggleRead(m.id, !!m.is_read)}
                    className="btn-glass text-xs py-1.5 px-3 text-white/60 hover:text-white"
                  >
                    {m.is_read ? 'Mark Unread' : 'Mark as Read'}
                  </button>

                  <button
                    onClick={() => handleDelete(m.id)}
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
          <p className="text-white/40 text-xs">No secret messages received yet.</p>
        </div>
      )}
    </div>
  )
}
