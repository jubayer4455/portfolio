'use client'

import { useState } from 'react'
import {
  Download,
  Database,
  FileSpreadsheet,
  FileJson,
  Check,
  Loader2,
  HardDrive,
  ShieldCheck,
} from 'lucide-react'

export default function DataBackupExport() {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const triggerDownload = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportAllData = async (format: 'json' | 'users_csv' | 'reviews_csv' | 'messages_csv') => {
    setDownloading(format)
    try {
      const res = await fetch('/api/admin/export')
      const json = await res.json()
      if (!res.ok || !json.data) throw new Error('Export failed')

      const timestamp = new Date().toISOString().slice(0, 10)

      if (format === 'json') {
        // Full Backup JSON
        const fullJson = JSON.stringify(json.data, null, 2)
        triggerDownload(`aj-bio-complete-backup-${timestamp}.json`, fullJson, 'application/json')
        showToast('Complete JSON Database Backup downloaded! 💾')
      } else if (format === 'users_csv') {
        // Users CSV
        const headers = ['ID', 'Username', 'Display Name', 'Location', 'Views', 'Clicks', 'Verified', 'Suspended', 'Created At']
        const rows = (json.data.users || []).map((u: any) => [
          `"${u.id || ''}"`,
          `"${u.username || ''}"`,
          `"${(u.display_name || '').replace(/"/g, '""')}"`,
          `"${(u.location || '').replace(/"/g, '""')}"`,
          u.views || 0,
          u.clicks || 0,
          u.is_verified ? 'YES' : 'NO',
          u.is_suspended ? 'YES' : 'NO',
          `"${u.created_at || ''}"`,
        ])
        const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n')
        triggerDownload(`aj-bio-users-${timestamp}.csv`, csvContent, 'text/csv;charset=utf-8;')
        showToast('Users CSV exported successfully! 📊')
      } else if (format === 'reviews_csv') {
        // Reviews CSV
        const headers = ['ID', 'Author Name', 'Rating', 'Comment', 'Approved', 'Created At']
        const rows = (json.data.reviews || []).map((r: any) => [
          `"${r.id || ''}"`,
          `"${(r.user_name || '').replace(/"/g, '""')}"`,
          r.rating || 5,
          `"${(r.comment || '').replace(/"/g, '""')}"`,
          r.is_approved ? 'APPROVED' : 'PENDING',
          `"${r.created_at || ''}"`,
        ])
        const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n')
        triggerDownload(`aj-bio-reviews-${timestamp}.csv`, csvContent, 'text/csv;charset=utf-8;')
        showToast('Reviews CSV exported successfully! 🌟')
      } else if (format === 'messages_csv') {
        // Secret Anonymous Messages CSV
        const headers = ['ID', 'Emoji', 'Message', 'Read', 'Created At']
        const rows = (json.data.secretMessages || []).map((m: any) => [
          `"${m.id || ''}"`,
          `"${m.emoji || '💭'}"`,
          `"${(m.message || '').replace(/"/g, '""')}"`,
          m.is_read ? 'YES' : 'NO',
          `"${m.created_at || ''}"`,
        ])
        const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n')
        triggerDownload(`aj-bio-anonymous-messages-${timestamp}.csv`, csvContent, 'text/csv;charset=utf-8;')
        showToast('Anonymous Messages CSV exported successfully! 💌')
      }
    } catch (err: any) {
      alert(`Export error: ${err.message}`)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="glass gradient-border rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database size={18} className="text-emerald-400" />
          <h2 className="text-white font-bold text-base">Complete Database Backup &amp; CSV Exporter</h2>
        </div>
        <span className="text-white/40 text-xs font-mono">1-Click Instant Local Backup</span>
      </div>

      <p className="text-white/50 text-xs leading-relaxed">
        Download full snapshots of all registered user bios, site reviews, anonymous secret notes, and contacts. Keep your platform data permanently backed up on your device.
      </p>

      {toast && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <Check size={14} />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {/* Full JSON Snapshot */}
        <button
          onClick={() => exportAllData('json')}
          disabled={downloading !== null}
          className="p-3.5 rounded-2xl glass border border-white/10 hover:border-emerald-500/40 text-left transition-all hover:bg-white/5 group"
        >
          <div className="flex items-center justify-between mb-2">
            <FileJson size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            {downloading === 'json' ? (
              <Loader2 size={13} className="animate-spin text-white/50" />
            ) : (
              <Download size={13} className="text-white/40 group-hover:text-white" />
            )}
          </div>
          <p className="text-white font-bold text-xs">Full JSON Backup</p>
          <p className="text-white/40 text-[10px] mt-0.5">Complete platform database snapshot</p>
        </button>

        {/* Users CSV */}
        <button
          onClick={() => exportAllData('users_csv')}
          disabled={downloading !== null}
          className="p-3.5 rounded-2xl glass border border-white/10 hover:border-orange-500/40 text-left transition-all hover:bg-white/5 group"
        >
          <div className="flex items-center justify-between mb-2">
            <FileSpreadsheet size={18} className="text-orange-400 group-hover:scale-110 transition-transform" />
            {downloading === 'users_csv' ? (
              <Loader2 size={13} className="animate-spin text-white/50" />
            ) : (
              <Download size={13} className="text-white/40 group-hover:text-white" />
            )}
          </div>
          <p className="text-white font-bold text-xs">Export Users CSV</p>
          <p className="text-white/40 text-[10px] mt-0.5">All accounts, views &amp; stats</p>
        </button>

        {/* Reviews CSV */}
        <button
          onClick={() => exportAllData('reviews_csv')}
          disabled={downloading !== null}
          className="p-3.5 rounded-2xl glass border border-white/10 hover:border-amber-500/40 text-left transition-all hover:bg-white/5 group"
        >
          <div className="flex items-center justify-between mb-2">
            <FileSpreadsheet size={18} className="text-amber-400 group-hover:scale-110 transition-transform" />
            {downloading === 'reviews_csv' ? (
              <Loader2 size={13} className="animate-spin text-white/50" />
            ) : (
              <Download size={13} className="text-white/40 group-hover:text-white" />
            )}
          </div>
          <p className="text-white font-bold text-xs">Export Reviews CSV</p>
          <p className="text-white/40 text-[10px] mt-0.5">Ratings &amp; public feedback</p>
        </button>

        {/* Secret Notes CSV */}
        <button
          onClick={() => exportAllData('messages_csv')}
          disabled={downloading !== null}
          className="p-3.5 rounded-2xl glass border border-white/10 hover:border-pink-500/40 text-left transition-all hover:bg-white/5 group"
        >
          <div className="flex items-center justify-between mb-2">
            <FileSpreadsheet size={18} className="text-pink-400 group-hover:scale-110 transition-transform" />
            {downloading === 'messages_csv' ? (
              <Loader2 size={13} className="animate-spin text-white/50" />
            ) : (
              <Download size={13} className="text-white/40 group-hover:text-white" />
            )}
          </div>
          <p className="text-white font-bold text-xs">Export Secret Notes</p>
          <p className="text-white/40 text-[10px] mt-0.5">Anonymous inbox messages</p>
        </button>
      </div>
    </div>
  )
}
