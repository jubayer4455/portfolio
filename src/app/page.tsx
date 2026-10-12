import Navigation from '@/components/navigation/Navigation'
import HeroSection from '@/components/hero/HeroSection'
import AboutSection from '@/components/about/AboutSection'
import GallerySection from '@/components/gallery/GallerySection'
import SocialHub from '@/components/social/SocialHub'
import ContactSection from '@/components/contact/ContactSection'
import AnonymousMessageBox from '@/components/interactive/AnonymousMessageBox'
import MusicPlayer from '@/components/common/MusicPlayer'
import VisitTracker from '@/components/common/VisitTracker'
import Footer from '@/components/footer/Footer'
import ReviewsSection from '@/components/reviews/ReviewsSection'
import BuilderFeatureBanner from '@/components/builder/BuilderFeatureBanner'
import FeaturedCreatorsSection from '@/components/home/FeaturedCreatorsSection'
import FaqSection from '@/components/home/FaqSection'
import WebProjectsShowcase from '@/components/projects/WebProjectsShowcase'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import MaintenanceScreen from '@/components/common/MaintenanceScreen'
import { getSiteSettings, getSocialProfiles, getGalleryItems } from '@/lib/content-store'
import { getApprovedReviews, getAllUserBios } from '@/lib/builder-store'
import { getFeaturedProjects } from '@/lib/projects-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HomePage() {
  const [settings, socials, gallery, reviews, allBios, projects] = await Promise.all([
    getSiteSettings(),
    getSocialProfiles(),
    getGalleryItems(),
    getApprovedReviews(),
    getAllUserBios(),
    getFeaturedProjects(),
  ])

  const featuredUsers = allBios.filter((b) => b.is_featured || b.username === 'sarah')

  const cookieStore = cookies()
  const isDemoAdmin = cookieStore.get('demo_admin')?.value === 'true'
  const sessionUser = cookieStore.get('user_session_username')?.value
  const sessionEmail = cookieStore.get('user_session_email')?.value
  const isAdmin =
    isDemoAdmin ||
    sessionUser === 'admin' ||
    sessionUser === 'jubayer' ||
    sessionEmail === 'admin@portfolio.com' ||
    sessionEmail === 'jubayerahmmed2k@gmail.com'

  // If maintenance mode is active and user is NOT admin, show maintenance screen
  if (settings.maintenance_mode_enabled && !isAdmin) {
    return <MaintenanceScreen settings={settings} />
  }

  return (
    <>
      {settings.maintenance_mode_enabled && isAdmin && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-black px-4 py-2 text-xs font-bold flex items-center justify-between shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="animate-pulse" />
            <span>⚠️ Maintenance Mode Active: Public visitors see Coming Soon screen. You are previewing as Admin.</span>
          </div>
          <Link
            href="/admin/settings"
            className="px-2.5 py-1 rounded bg-black/20 hover:bg-black/30 text-black text-[11px] font-extrabold uppercase tracking-wider transition-all"
          >
            Manage in Settings ↗
          </Link>
        </div>
      )}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <VisitTracker />
      <Navigation settings={settings} />
      <main id="main-content">
        <HeroSection settings={settings} socials={socials} />

        {settings.projects_enabled !== false && projects.length > 0 && (
          <WebProjectsShowcase
            projects={projects}
            title={settings.projects_title}
            subtitle={settings.projects_subtitle}
          />
        )}

        {settings.socials_enabled !== false && socials.length > 0 && (
          <SocialHub socials={socials} settings={settings} />
        )}

        {settings.gallery_enabled !== false && gallery.length > 0 && (
          <GallerySection
            items={gallery}
            title={settings.gallery_title}
            subtitle={settings.gallery_subtitle}
          />
        )}

        {settings.creators_enabled !== false && (
          <>
            <BuilderFeatureBanner />
            {featuredUsers.length > 0 && (
              <FeaturedCreatorsSection featuredUsers={featuredUsers} />
            )}
          </>
        )}

        {settings.about_enabled !== false && (
          <AboutSection settings={settings} />
        )}

        {settings.reviews_enabled !== false && (
          <ReviewsSection initialReviews={reviews} />
        )}

        {settings.faq_enabled !== false && (
          <FaqSection />
        )}

        {settings.anonymous_box_enabled !== false && (
          <AnonymousMessageBox />
        )}

        {settings.contact_enabled !== false && (
          <ContactSection settings={settings} socials={socials} />
        )}
      </main>
      <MusicPlayer
        enabled={settings.music_enabled !== false}
        title={settings.music_title}
        audioUrl={settings.music_url}
      />
      <Footer settings={settings} socials={socials} />
    </>
  )
}
