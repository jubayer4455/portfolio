'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'

import type { SiteSettingsData } from '@/lib/content-store'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Websites', href: '/#projects' },
  { label: 'Socials', href: '/#social' },
  { label: 'Photos', href: '/#gallery' },
  { label: 'Reviews', href: '/#reviews' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'About', href: '/#about' },
  { label: 'Connect', href: '/#contact' },
]

export default function Navigation({ settings }: { settings?: SiteSettingsData }) {
  const firstName = settings?.first_name || 'Abdul Al'
  const lastName = settings?.last_name || 'Jubayer'
  const fullName = `${firstName} ${lastName}`.trim()
  const initials = 'AJ'
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)

      // Determine active section
      const sections = ['social', 'gallery', 'reviews', 'faq', 'about', 'contact']
      let current = 'home'
      for (const id of sections) {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - 120) {
          current = id
        }
      }
      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      setMobileOpen(false)
      const isHome = typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '')

      if (isHome) {
        if (href === '/' || href === '#') {
          e.preventDefault()
          window.scrollTo({ top: 0, behavior: 'smooth' })
          return
        }
        if (href.startsWith('/#')) {
          e.preventDefault()
          const id = href.replace('/#', '')
          const el = document.getElementById(id)
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' })
            return
          }
        }
      }
    },
    []
  )

  const isActive = (href: string) => {
    if (href === '/' || href === '#') return activeSection === 'home'
    return activeSection === href.replace('/#', '').replace('#', '')
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'glass border-b border-white/[0.06] py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <nav
          className="container-max flex items-center justify-between px-4 md:px-8"
          aria-label="Main navigation"
        >
          {/* Logo */}
          <a
            href="#"
            onClick={(e) => handleNavClick(e, '#')}
            className="flex items-center gap-2 group"
            aria-label={`${fullName} — Home`}
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center font-display font-bold text-white text-lg group-hover:scale-110 transition-transform duration-300 orange-glow-sm">
              {initials}
            </div>
            <span className="hidden sm:block font-display font-semibold text-white text-lg tracking-tight">
              {fullName}
            </span>
          </a>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1" role="list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                    isActive(link.href)
                      ? 'text-orange-400'
                      : 'text-white/70 hover:text-white'
                  }`}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                >
                  {isActive(link.href) && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-orange-500/10 border border-orange-500/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </a>
              </li>
            ))}
          </ul>

          {/* CTA + Bio Builder + Mobile toggle */}
          <div className="flex items-center gap-2.5">
            <a
              href="/dashboard"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-full glass border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 transition-colors"
            >
              <span>Build Bio</span>
              <span>🚀</span>
            </a>

            <a
              href="/login"
              className="hidden md:inline-flex text-xs font-medium text-white/70 hover:text-white px-3 py-2 rounded-full transition-colors"
            >
              Sign In
            </a>

            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, '#contact')}
              className="hidden sm:inline-flex btn-primary text-xs px-4 py-2"
            >
              Hire Me
            </a>

            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="md:hidden w-10 h-10 rounded-xl glass flex items-center justify-center text-white/80 hover:text-white transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? 'close' : 'open'}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden border-t border-white/[0.06]"
            >
              <div className="glass px-4 py-4 flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive(link.href)
                        ? 'text-orange-400 bg-orange-500/10 border border-orange-500/20'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </motion.a>
                ))}

                <div className="pt-2 mt-2 border-t border-white/10 flex flex-col gap-2">
                  <a
                    href="/dashboard"
                    className="btn-primary justify-center text-xs py-2.5"
                  >
                    🚀 Build Your 3D Bio Site
                  </a>
                  <a
                    href="/login"
                    className="btn-glass justify-center text-xs py-2 text-white/80"
                  >
                    Sign In / Dashboard
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  )
}
