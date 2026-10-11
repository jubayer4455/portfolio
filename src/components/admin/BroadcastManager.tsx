'use client'

import { useState, useEffect } from 'react'
import { Bell, Sparkles, Check, Loader2, ArrowRight } from 'lucide-react'
import type { BroadcastData } from '@/components/common/BroadcastBanner'

export default function BroadcastManager() {
  const [data, setData] = useState<BroadcastData>({
    enabled: true,
    message: '🔥 AJ Bio 2.0 is live! Create your free 3D link-in-bio & share with the world.',
    badge_text: 'OFFICIAL UPDATE',
    badge_color: 'orange',
    link_url: '/signup',
    link_label: 'Claim Your Bio →',
    dismissible: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetch('/api/admin/broadcast')
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data) setData(j.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setToast('Global broadcast announcement updated! 📢')
        setTimeout(() => setToast(''), 3000)
      } else {
        alert('Failed to update broadcast.')
      }
    } catch {
      alert('Error updating broadcast.')
    } finally {
      setSaving(false)
    }
  }

  const badgeColors: Record<string, string> = {
    orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    pink: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  }

  return (
    <div className="glass gradient-border rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-orange-400" />
          <h2 className="text-white font-bold text-base">Site-Wide Global Announcement Banner</h2>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
          <span className="text-white/60">Live Broadcast:</span>
          <input
            type="checkbox"
            checked={data.enabled}
            onChange={(e) => setData({ ...data, enabled: e.target.checked })}
            className="sr-only"
          />
          <div
            className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
              data.enabled ? 'bg-orange-500' : 'bg-white/10'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                data.enabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
          <span className={data.enabled ? 'text-emerald-400 font-bold' : 'text-white/40'}>
            {data.enabled ? 'ACTIVE' : 'OFF'}
          </span>
        </label>
      </div>

      <p className="text-white/50 text-xs">
        Broadcast alerts, new feature announcements, or maintenance notices across the very top of all pages on the site.
      </p>

      {/* Live Preview */}
      <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">Live Preview</span>
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
              badgeColors[data.badge_color] || badgeColors.orange
            }`}
          >
            <Sparkles size={10} />
            <span>{data.badge_text || 'NOTICE'}</span>
          </span>
          <span className="text-white font-medium truncate max-w-sm">
            {data.message || 'Your announcement message...'}
          </span>
          {data.link_url && (
            <span className="text-orange-400 font-semibold inline-flex items-center gap-0.5">
              <span>{data.link_label || 'Learn more'}</span>
              <ArrowRight size={11} />
            </span>
          )}
        </div>
      </div>

      {toast && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <Check size={14} />
          <span>{toast}</span>
        </div>
      )}

      {/* Form controls */}
      <form onSubmit={handleSave} className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-medium text-white/70 mb-1">Broadcast Message</label>
          <input
            type="text"
            value={data.message}
            onChange={(e) => setData({ ...data, message: e.target.value })}
            placeholder="e.g. 🎉 New photo collection launched! Check it out below."
            required
            className="w-full px-3.5 py-2 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-orange-500/50"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Badge Text</label>
            <input
              type="text"
              value={data.badge_text}
              onChange={(e) => setData({ ...data, badge_text: e.target.value })}
              placeholder="e.g. UPDATE"
              className="w-full px-3.5 py-2 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-orange-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Badge Glow Color</label>
            <select
              value={data.badge_color}
              onChange={(e) => setData({ ...data, badge_color: e.target.value as any })}
              className="w-full px-3.5 py-2 rounded-xl glass border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500/50 bg-[#0f0f0f]"
            >
              <option value="orange">Electric Orange</option>
              <option value="emerald">Neon Emerald</option>
              <option value="cyan">Cyber Cyan</option>
              <option value="purple">Vivid Purple</option>
              <option value="pink">Hot Pink</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1">Link URL (Optional)</label>
            <input
              type="text"
              value={data.link_url || ''}
              onChange={(e) => setData({ ...data, link_url: e.target.value })}
              placeholder="/signup or https://..."
              className="w-full px-3.5 py-2 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-orange-500/50"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
            <input
              type="checkbox"
              checked={data.dismissible}
              onChange={(e) => setData({ ...data, dismissible: e.target.checked })}
              className="rounded border-white/20 bg-black/40 text-orange-500 focus:ring-0"
            />
            <span>Allow visitors to dismiss (X button)</span>
          </label>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5"
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            <span>Save &amp; Broadcast</span>
          </button>
        </div>
      </form>
    </div>
  )
}
