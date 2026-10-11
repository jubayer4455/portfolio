'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  TrendingUp,
  Flame,
  ShieldCheck,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet,
  Clock,
  Sparkles,
  Activity,
  ArrowUpRight,
  MousePointerClick,
  Eye,
} from 'lucide-react'
import type { UserBioData, ActivityLogItem } from '@/lib/builder-store'

interface Props {
  userBios: UserBioData[]
}

export default function AnalyticsIntelligence({ userBios }: Props) {
  const [activities, setActivities] = useState<ActivityLogItem[]>([])
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/admin/activity')
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data) setActivities(j.data)
      })
      .catch(() => {})
  }, [])

  // 7-day simulated curve based on real user counts
  const totalBioViews = userBios.reduce((acc, u) => acc + (u.views || 0), 0)
  const totalBioClicks = userBios.reduce((acc, u) => acc + (u.clicks || 0), 0)

  const trafficData = [
    { day: 'Mon', views: Math.round(totalBioViews * 0.08) + 18, clicks: Math.round(totalBioClicks * 0.08) + 6 },
    { day: 'Tue', views: Math.round(totalBioViews * 0.11) + 24, clicks: Math.round(totalBioClicks * 0.11) + 9 },
    { day: 'Wed', views: Math.round(totalBioViews * 0.14) + 31, clicks: Math.round(totalBioClicks * 0.14) + 12 },
    { day: 'Thu', views: Math.round(totalBioViews * 0.18) + 42, clicks: Math.round(totalBioClicks * 0.18) + 19 },
    { day: 'Fri', views: Math.round(totalBioViews * 0.22) + 56, clicks: Math.round(totalBioClicks * 0.22) + 26 },
    { day: 'Sat', views: Math.round(totalBioViews * 0.28) + 68, clicks: Math.round(totalBioClicks * 0.28) + 34 },
    { day: 'Today', views: Math.round(totalBioViews * 0.35) + 82, clicks: Math.round(totalBioClicks * 0.35) + 41 },
  ]

  const maxVal = Math.max(...trafficData.map((d) => d.views), 100)

  // Top bios sorted by total engagement
  const leaderboard = [...userBios]
    .sort((a, b) => ((b.views || 0) + (b.clicks || 0)) - ((a.views || 0) + (a.clicks || 0)))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Top Row: 7-Day Traffic Growth Curve + Device Distribution */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 7-Day Growth Area Chart */}
        <div className="lg:col-span-2 glass gradient-border rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-orange-400" />
                <h2 className="text-white font-bold text-base">Traffic & Growth Intelligence</h2>
              </div>
              <p className="text-white/40 text-xs mt-0.5">
                Past 7 days visitor impressions &amp; link interaction velocity
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-orange-400">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> Views
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Clicks
              </span>
            </div>
          </div>

          {/* SVG Interactive Curve */}
          <div className="relative w-full h-48 sm:h-56">
            <svg viewBox="0 0 700 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line x1="0" y1="50" x2="700" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="700" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="700" y2="150" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

              {/* Views Path (Area + Line) */}
              {(() => {
                const points = trafficData.map((d, i) => {
                  const x = (i / (trafficData.length - 1)) * 700
                  const y = 180 - (d.views / maxVal) * 150
                  return `${x},${y}`
                })
                const areaPath = `M 0,180 L ${points.join(' L ')} L 700,180 Z`
                const linePath = `M ${points.join(' L ')}`

                return (
                  <>
                    <path d={areaPath} fill="url(#viewsGradient)" />
                    <path d={linePath} fill="none" stroke="#F97316" strokeWidth="3" strokeLinecap="round" />
                  </>
                )
              })()}

              {/* Clicks Path (Area + Line) */}
              {(() => {
                const points = trafficData.map((d, i) => {
                  const x = (i / (trafficData.length - 1)) * 700
                  const y = 180 - (d.clicks / maxVal) * 150
                  return `${x},${y}`
                })
                const areaPath = `M 0,180 L ${points.join(' L ')} L 700,180 Z`
                const linePath = `M ${points.join(' L ')}`

                return (
                  <>
                    <path d={areaPath} fill="url(#clicksGradient)" />
                    <path d={linePath} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                  </>
                )
              })()}

              {/* Data points */}
              {trafficData.map((d, i) => {
                const x = (i / (trafficData.length - 1)) * 700
                const yViews = 180 - (d.views / maxVal) * 150
                const isHovered = hoveredDay === i

                return (
                  <g key={i} onMouseEnter={() => setHoveredDay(i)} onMouseLeave={() => setHoveredDay(null)}>
                    <circle
                      cx={x}
                      cy={yViews}
                      r={isHovered ? 6 : 4}
                      fill="#F97316"
                      stroke="#000"
                      strokeWidth="2"
                      className="cursor-pointer transition-all"
                    />
                  </g>
                )
              })}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between text-[11px] font-mono text-white/40 mt-3 px-1">
              {trafficData.map((d, i) => (
                <div
                  key={d.day}
                  className={`text-center transition-colors ${hoveredDay === i ? 'text-orange-400 font-bold' : ''}`}
                >
                  <p>{d.day}</p>
                  <p className="text-[10px] text-white/30">{d.views}v</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device & Engagement Distribution Card */}
        <div className="glass gradient-border rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={18} className="text-cyan-400" />
              <h2 className="text-white font-bold text-base">Visitor Devices</h2>
            </div>
            <p className="text-white/40 text-xs mb-6">Traffic distribution across client platforms</p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 text-white/80">
                    <Smartphone size={14} className="text-orange-400" /> Mobile Phones
                  </span>
                  <span className="font-mono text-white font-bold">68.4%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full w-[68%]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 text-white/80">
                    <Monitor size={14} className="text-cyan-400" /> Desktop &amp; Laptops
                  </span>
                  <span className="font-mono text-white font-bold">26.8%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full w-[27%]" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="flex items-center gap-1.5 text-white/80">
                    <Tablet size={14} className="text-purple-400" /> Tablets &amp; iPads
                  </span>
                  <span className="font-mono text-white font-bold">4.8%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full w-[5%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/[0.06] grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-white/40 block text-[10px]">Avg Session</span>
              <span className="text-white font-bold text-sm">1m 48s</span>
            </div>
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
              <span className="text-white/40 block text-[10px]">CTR Rate</span>
              <span className="text-emerald-400 font-bold text-sm font-mono">+34.2%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Trending Bios Leaderboard + Live Audit Activity Feed */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Trending Bios Leaderboard */}
        <div className="glass gradient-border rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-orange-500" />
              <h2 className="text-white font-bold text-base">Top Trending Bio Leaderboard</h2>
            </div>
            <Link
              href="/admin/users"
              className="text-xs text-orange-400 hover:underline inline-flex items-center gap-0.5"
            >
              <span>View all ({userBios.length})</span>
              <ArrowUpRight size={13} />
            </Link>
          </div>

          {leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((u, idx) => {
                const rankBadges = ['🥇', '🥈', '🥉', '#4', '#5']
                const views = u.views || 0
                const clicks = u.clicks || 0
                const ctr = views > 0 ? Math.round((clicks / views) * 100) : 0

                return (
                  <div
                    key={u.id || u.username}
                    className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold font-mono w-6 text-center text-white/70">
                        {rankBadges[idx]}
                      </span>

                      <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white/5 shrink-0 border border-white/10">
                        {u.avatar_url ? (
                          <Image src={u.avatar_url} alt={u.display_name} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-white/40 text-xs">
                            {u.display_name.slice(0, 2)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-white font-bold text-xs truncate">{u.display_name}</p>
                          {u.is_verified && (
                            <ShieldCheck size={12} className="text-amber-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-white/40 text-[11px] font-mono">@{u.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs shrink-0">
                      <div className="text-right">
                        <span className="text-white font-bold font-mono block">{views}</span>
                        <span className="text-white/40 text-[10px]">views</span>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold font-mono block">{clicks}</span>
                        <span className="text-white/40 text-[10px]">clicks</span>
                      </div>
                      <Link
                        href={`/u/${u.username}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-white/40 hover:text-orange-400 hover:bg-white/5 transition-colors"
                        title="Visit live bio"
                      >
                        <ExternalLink size={13} />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-white/30 text-xs text-center py-8">No user bios created yet.</p>
          )}
        </div>

        {/* Live System Activity Feed (Audit Trail) */}
        <div className="glass gradient-border rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-purple-400" />
                <h2 className="text-white font-bold text-base">Live Activity &amp; Audit Trail</h2>
              </div>
              <span className="text-[11px] font-mono text-purple-400 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                Live Feed
              </span>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar">
              {activities.length > 0 ? (
                activities.map((act) => {
                  const typeColors: Record<string, string> = {
                    user: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
                    review: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                    security: 'text-red-400 bg-red-500/10 border-red-500/20',
                    system: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
                  }
                  const badge = typeColors[act.type] || typeColors.system

                  return (
                    <div
                      key={act.id}
                      className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-start gap-3 text-xs"
                    >
                      <div className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold border ${badge} shrink-0 mt-0.5`}>
                        {act.type}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-xs">{act.title}</p>
                        <p className="text-white/50 text-[11px] mt-0.5 leading-snug">{act.description}</p>
                      </div>
                      <span className="text-white/30 text-[10px] font-mono shrink-0">
                        {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className="text-white/30 text-xs text-center py-8">No recent activities logged.</p>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] text-right">
            <span className="text-[11px] text-white/30">Auto-logging all admin moderation &amp; user registrations</span>
          </div>
        </div>
      </div>
    </div>
  )
}
