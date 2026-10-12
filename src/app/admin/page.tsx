import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import {
  Images,
  Share2,
  Mail,
  TrendingUp,
  Eye,
  Plus,
  MousePointerClick,
  MessageSquareHeart,
  Flame,
  Sparkles,
  Users,
  ShieldCheck,
  Star,
  Download,
  Bell,
  Activity,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import { readContentFile, readAnonymousMessages, getSiteSettings, getSocialProfiles, getGalleryItems } from '@/lib/content-store'
import { getAllUserBios, readAllReviews } from '@/lib/builder-store'
import { getFeaturedProjects } from '@/lib/projects-store'
import fs from 'fs'
import path from 'path'
import PlatformIcon from '@/components/common/PlatformIcon'
import AnalyticsIntelligence from '@/components/admin/AnalyticsIntelligence'
import BroadcastManager from '@/components/admin/BroadcastManager'
import DataBackupExport from '@/components/admin/DataBackupExport'
import MasterControlBar from '@/components/admin/MasterControlBar'

export const dynamic = 'force-dynamic'

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'
  return createServiceClient(url, key, { auth: { persistSession: false } })
}

interface StatCardProps {
  label: string
  value: number | string
  sub?: string
  icon: React.ReactNode
  color: string
}

function StatCard({ label, value, sub, icon, color }: StatCardProps) {
  return (
    <div className="glass gradient-border rounded-2xl p-5 flex items-center gap-4 transition-transform hover:-translate-y-0.5">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}20`, border: `1px solid ${color}30` }}
      >
        <div style={{ color }}>{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-white font-mono">{value}</p>
        <p className="text-white/40 text-xs truncate mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-emerald-400 font-mono mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default async function AdminDashboard() {
  const [content, settings, socials, gallery, projects, allUserBios, allReviews] = await Promise.all([
    readContentFile(),
    getSiteSettings(),
    getSocialProfiles(),
    getGalleryItems(),
    getFeaturedProjects(),
    getAllUserBios(),
    readAllReviews(),
  ])

  const imageCount = gallery.length
  const socialList = socials
  const totalViews = settings.total_views || content.settings?.total_views || 142

  // Aggregate user bio traffic
  const bioViewsSum = allUserBios.reduce((acc, b) => acc + (b.views || 0), 0)
  const bioClicksSum = allUserBios.reduce((acc, b) => acc + (b.clicks || 0), 0)
  const verifiedUsersCount = allUserBios.filter((b) => b.is_verified).length
  const featuredUsersCount = allUserBios.filter((b) => b.is_featured).length

  // Calculate total admin link clicks
  const totalClicks = socialList.reduce((acc, s) => acc + (s.click_count || 0), 0)

  // Anonymous secret messages
  const secretMessages = readAnonymousMessages()
  const unreadSecretCount = secretMessages.filter((m) => !m.is_read).length

  // Direct contact submissions
  let localSubmissions: Array<{
    id: string
    name: string
    email: string
    subject: string | null
    message: string
    created_at: string
    is_read: boolean
  }> = []

  const submissionsPath = path.join(process.cwd(), 'src', 'data', 'contact-submissions.json')
  try {
    if (fs.existsSync(submissionsPath)) {
      localSubmissions = JSON.parse(fs.readFileSync(submissionsPath, 'utf8'))
    }
  } catch {}

  const submissionCount = localSubmissions.length
  let recentSubmissions = localSubmissions.slice(0, 5)

  try {
    const serviceSupabase = getServiceSupabase()
    const { data: subData } = await serviceSupabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
    if (subData && subData.length > 0) recentSubmissions = subData
  } catch {}

  // Sort socials by click count
  const topClickedSocials = [...socialList]
    .sort((a, b) => (b.click_count || 0) - (a.click_count || 0))
    .slice(0, 5)
  const maxClicks = Math.max(...topClickedSocials.map((s) => s.click_count || 1), 1)

  return (
    <div className="space-y-8">
      {/* Super Admin Welcome Banner */}
      <div className="glass gradient-border rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-3">
              <Sparkles size={12} />
              <span>MASTER PLATFORM COMMAND CENTER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
              Welcome back, <span className="text-gradient">Abdul Al Jubayer</span>
            </h1>
            <p className="text-white/50 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
              Real-time platform intelligence, creator moderation, global announcements, and traffic telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/users"
              className="btn-primary text-xs py-2.5 px-4 shadow-lg shadow-orange-500/20"
            >
              <Users size={14} />
              <span>Manage Creators ({allUserBios.length})</span>
            </Link>
            <Link
              href="/"
              target="_blank"
              className="btn-glass text-xs py-2.5 px-4 inline-flex items-center gap-1.5"
            >
              <span>View Live Site</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Super Admin Master Access Center & 1-Click Sync */}
      <MasterControlBar
        imageCount={imageCount}
        socialCount={socialList.length}
        projectsCount={projects.length}
        messagesCount={secretMessages.length}
        reviewsCount={allReviews.length}
        settings={settings}
      />

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          label="Total Platform Impressions"
          value={totalViews + bioViewsSum}
          sub={`+${bioViewsSum} user bio views`}
          icon={<Eye size={20} />}
          color="#F97316"
        />
        <StatCard
          label="Total Link Interactions"
          value={totalClicks + bioClicksSum}
          sub={`+${bioClicksSum} user clicks`}
          icon={<MousePointerClick size={20} />}
          color="#10B981"
        />
        <StatCard
          label="Registered Bio Sites"
          value={allUserBios.length}
          sub={`${verifiedUsersCount} verified creators`}
          icon={<Users size={20} />}
          color="#A855F7"
        />
        <StatCard
          label="Secret Notes &amp; Inbox"
          value={secretMessages.length}
          sub={`${unreadSecretCount} unread notes`}
          icon={<MessageSquareHeart size={20} />}
          color="#EC4899"
        />
        <StatCard
          label="Public Reviews"
          value={allReviews.length}
          sub={`${allReviews.filter((r) => r.is_approved).length} approved`}
          icon={<Star size={20} />}
          color="#FBBF24"
        />
      </div>

      {/* 1. Global Announcement Broadcast Manager */}
      <BroadcastManager />

      {/* 2. Advanced Traffic Intelligence & Top Bios Leaderboard & Audit Feed */}
      <AnalyticsIntelligence userBios={allUserBios} />

      {/* 3. Database Backup & 1-Click CSV/JSON Exporter */}
      <DataBackupExport />

      {/* 4. Link Click Analytics & Inboxes */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Link Click Breakdown */}
        <div className="glass gradient-border rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              <h2 className="text-white font-semibold text-base">Master Social Links</h2>
            </div>
            <span className="text-white/40 text-xs font-mono">{totalClicks} clicks</span>
          </div>

          <div className="space-y-3">
            {topClickedSocials.map((s) => {
              const count = s.click_count || 0
              const percentage = Math.round((count / maxClicks) * 100)

              return (
                <div key={s.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <PlatformIcon name={s.icon_name || s.platform} size={14} style={{ color: s.color }} />
                      <span className="text-white font-medium">{s.display_label || s.platform}</span>
                    </div>
                    <span className="text-emerald-400 font-mono font-semibold">{count}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(percentage, 5)}%`,
                        backgroundColor: s.color || '#F97316',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Secret / Anonymous Messages (NGL Style) */}
        <div className="glass gradient-border rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquareHeart size={18} className="text-pink-400" />
              <h2 className="text-white font-semibold text-base">Secret Notes</h2>
            </div>
            <Link
              href="/admin/messages"
              className="text-pink-400 text-xs hover:underline font-mono"
            >
              View all ({secretMessages.length})
            </Link>
          </div>

          <div className="divide-y divide-white/[0.06] max-h-72 overflow-y-auto no-scrollbar">
            {secretMessages.length > 0 ? (
              secretMessages.slice(0, 5).map((msg) => (
                <div key={msg.id} className="py-2.5 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-sm flex-shrink-0">
                    {msg.emoji || '💭'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium leading-relaxed truncate">
                      &ldquo;{msg.message}&rdquo;
                    </p>
                    <p className="text-white/30 text-[10px] mt-0.5 font-mono">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-white/30 text-xs">
                No secret messages yet.
              </div>
            )}
          </div>
        </div>

        {/* Recent Direct Messages */}
        <div className="glass gradient-border rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail size={18} className="text-orange-400" />
              <h2 className="text-white font-semibold text-base">Direct Inquiries</h2>
            </div>
            <span className="text-white/40 text-xs font-mono">{submissionCount} total</span>
          </div>

          <div className="divide-y divide-white/[0.06] max-h-72 overflow-y-auto no-scrollbar">
            {recentSubmissions && recentSubmissions.length > 0 ? (
              recentSubmissions.map((sub) => (
                <div key={sub.id} className="py-2.5 flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 flex-shrink-0">
                    <Mail size={13} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-white text-xs font-semibold truncate">{sub.name}</p>
                      <p className="text-white/30 text-[10px] font-mono shrink-0">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-white/70 text-xs mt-0.5 truncate">{sub.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-white/30 text-xs">
                No direct messages yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
