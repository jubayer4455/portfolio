'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Images,
  Share2,
  Settings,
  Mail,
  LogOut,
  Menu,
  X,
  User,
  ExternalLink,
  Star,
  Users,
  MessageSquare,
  Globe,
} from 'lucide-react'

const sidebarLinks = [
  { label: 'Dashboard', href: '/admin', Icon: LayoutDashboard },
  { label: 'My Web Projects', href: '/admin/projects', Icon: Globe },
  { label: 'User Bios & Accounts', href: '/admin/users', Icon: Users },
  { label: 'Anonymous Inbox', href: '/admin/messages', Icon: MessageSquare },
  { label: 'Reviews Moderation', href: '/admin/reviews', Icon: Star },
  { label: 'My Profile', href: '/admin/profile', Icon: User },
  { label: 'Social Links', href: '/admin/social', Icon: Share2 },
  { label: 'Photo Gallery', href: '/admin/gallery', Icon: Images },
  { label: 'Bio Settings', href: '/admin/settings', Icon: Settings },
]

interface AdminSidebarProps {
  userEmail: string
}

export default function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
    } catch {}
    router.push('/admin/login')
    router.refresh()
  }

  const navContent = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-6 border-b border-white/[0.06] flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center font-display font-bold text-white shadow-lg shadow-orange-500/20">
            AJ
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Abdul Al Jubayer</p>
            <p className="text-white/40 text-xs">Bio Hub Admin</p>
          </div>
        </Link>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-white/50 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarLinks.map(({ label, href, Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400 shadow-sm shadow-orange-500/5'
                  : 'text-white/60 hover:text-white hover:bg-white/[0.04] border border-transparent hover:translate-x-1'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-orange-500 rounded-full shadow-sm shadow-orange-500/50" />
              )}
              <Icon size={16} className={`transition-colors duration-200 ${isActive ? 'text-orange-400' : 'text-white/40 group-hover:text-orange-400/70'}`} />
              <span>{label}</span>
            </Link>
          )
        })}

        <div className="pt-4 mt-4 border-t border-white/[0.06]">
          <Link
            href="/"
            target="_blank"
            className="group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-orange-400 hover:bg-white/[0.04] hover:translate-x-1 transition-all duration-200"
          >
            <ExternalLink size={16} className="transition-colors duration-200 group-hover:text-orange-400" />
            <span>View Public Site</span>
          </Link>
        </div>
      </nav>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-white/[0.02]">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
            <Mail size={14} className="text-orange-400" />
          </div>
          <div className="min-w-0">
            <p className="text-white/80 text-xs truncate font-medium">{userEmail}</p>
            <p className="text-white/40 text-[10px]">Administrator</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all text-xs w-full disabled:opacity-50"
        >
          <LogOut size={14} />
          <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 glass border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center font-display font-bold text-white text-xs">
            AJ
          </div>
          <span className="text-white font-semibold text-sm">Abdul Al Jubayer</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 rounded-xl glass border border-white/10 flex items-center justify-center text-white/70"
          aria-label="Open sidebar"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] h-full bg-[#0d0d0d] border-r border-white/10 z-10">
            {navContent}
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 glass border-r border-white/[0.06] flex-col sticky top-0 h-screen">
        {navContent}
      </aside>

      {/* Mobile Native App Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c0e]/95 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around safe-area-pb">
        <Link
          href="/admin"
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            pathname === '/admin' ? 'text-orange-400 font-semibold' : 'text-white/50 hover:text-white'
          }`}
        >
          <LayoutDashboard size={18} />
          <span className="text-[10px]">Stats</span>
        </Link>
        <Link
          href="/admin/projects"
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            pathname === '/admin/projects' ? 'text-orange-400 font-semibold' : 'text-white/50 hover:text-white'
          }`}
        >
          <Globe size={18} />
          <span className="text-[10px]">Websites</span>
        </Link>
        <Link
          href="/admin/users"
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            pathname === '/admin/users' ? 'text-orange-400 font-semibold' : 'text-white/50 hover:text-white'
          }`}
        >
          <Users size={18} />
          <span className="text-[10px]">Users</span>
        </Link>
        <Link
          href="/admin/messages"
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            pathname === '/admin/messages' ? 'text-orange-400 font-semibold' : 'text-white/50 hover:text-white'
          }`}
        >
          <MessageSquare size={18} />
          <span className="text-[10px]">Inbox</span>
        </Link>
        <Link
          href="/admin/settings"
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            pathname === '/admin/settings' ? 'text-orange-400 font-semibold' : 'text-white/50 hover:text-white'
          }`}
        >
          <Settings size={18} />
          <span className="text-[10px]">Settings</span>
        </Link>
      </nav>
    </>
  )
}
