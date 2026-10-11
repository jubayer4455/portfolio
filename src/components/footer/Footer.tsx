'use client'

import { ArrowUp, ExternalLink } from 'lucide-react'
import type { SiteSettingsData, SocialProfileData } from '@/lib/content-store'
import PlatformIcon from '@/components/common/PlatformIcon'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Socials', href: '/#social' },
  { label: 'Photos', href: '/#gallery' },
  { label: 'About', href: '/#about' },
  { label: 'Connect', href: '/#contact' },
]

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Sitemap', href: '/sitemap.xml' },
]

interface FooterProps {
  settings?: SiteSettingsData
  socials?: SocialProfileData[]
}

export default function Footer({ settings, socials }: FooterProps) {
  const firstName = settings?.first_name || 'Abdul Al'
  const lastName = settings?.last_name || 'Jubayer'
  const fullName = `${firstName} ${lastName}`.trim()
  const initials = 'AJ'
  const contactEmail = settings?.contact_email || 'hello@jubayer.me'
  const tagline = settings?.tagline || 'Visual creator & lifestyle storyteller sharing moments and connecting with inspiring minds.'

  const activeSocials = (socials && socials.length > 0)
    ? socials.filter((s) => s.is_visible).slice(0, 5)
    : [
        { id: '1', platform: 'GitHub', profile_url: 'https://github.com', display_label: 'GitHub', icon_name: 'Github' },
        { id: '2', platform: 'LinkedIn', profile_url: 'https://linkedin.com', display_label: 'LinkedIn', icon_name: 'Linkedin' },
        { id: '3', platform: 'Instagram', profile_url: 'https://instagram.com', display_label: 'Instagram', icon_name: 'Instagram' },
        { id: '4', platform: 'X / Twitter', profile_url: 'https://twitter.com', display_label: 'X / Twitter', icon_name: 'Twitter' },
      ]
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
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
        el?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#060606] border-t border-white/[0.06]">
      {/* Main footer */}
      <div className="container-max px-4 md:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center font-display font-bold text-white text-lg orange-glow-sm">
                {initials}
              </div>
              <span className="font-display font-semibold text-white text-lg">{fullName}</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">
              {tagline}
            </p>
            <div className="flex items-center gap-2">
              {activeSocials.map((item) => (
                <a
                  key={item.id}
                  href={item.profile_url}
                  target={item.profile_url.startsWith('mailto') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  aria-label={item.display_label || item.platform}
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-white/40 hover:text-orange-400 hover:border-orange-500/30 transition-all duration-300"
                >
                  <PlatformIcon name={item.icon_name || item.platform} size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-5">
              Navigation
            </h3>
            <ul className="space-y-2">
              {navLinks.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    onClick={(e) => handleNavClick(e, href)}
                    className="text-white/40 hover:text-orange-400 text-sm transition-colors duration-200 flex items-center gap-1.5 group"
                  >
                    <span className="w-0 h-px bg-orange-500 group-hover:w-4 transition-all duration-300" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h3 className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-5">
              Let&apos;s Work Together
            </h3>
            <p className="text-white/40 text-sm mb-4">
              Have a project in mind? I&apos;d love to collaborate and bring your vision to life.
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="btn-primary text-xs inline-flex"
            >
              <ExternalLink size={14} />
              {contactEmail}
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.05] px-4 md:px-8 py-5">
        <div className="container-max flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {year} {fullName}. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {legalLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-white/30 hover:text-white/60 text-xs transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </div>

          <button
            onClick={scrollToTop}
            className="w-9 h-9 rounded-xl glass border border-white/10 flex items-center justify-center text-white/40 hover:text-orange-400 hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-0.5"
            aria-label="Back to top"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  )
}
