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
import { AlertTriangle, Sparkles } from 'lucide-react'
import MaintenanceScreen from '@/components/common/MaintenanceScreen'
import CursorNeonTrail from '@/components/common/CursorNeonTrail'
import MediaEmbedCard from '@/components/interactive/MediaEmbedCard'
import InteractivePollCard from '@/components/interactive/InteractivePollCard'
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
    sessionUser === 'jubayer' ||
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
      <CursorNeonTrail enabled={settings.cursor_effects_enabled !== false} />
      <div className={settings.maintenance_mode_enabled && isAdmin ? 'pt-8' : ''}>
        <Navigation settings={settings} />
      </div>
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

        {/* Media Embed & Community Poll Interactive Section */}
        {(settings.media_embed_enabled !== false || settings.poll_enabled !== false) && (
          <section className="section-padding bg-[#070707] relative overflow-hidden" id="interactive-spotlight">
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] pointer-events-none" />

            <div className="container-max px-4 md:px-8 relative z-10">
              <div className="text-center max-w-xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-3">
                  <Sparkles size={12} />
                  <span>INTERACTIVE SPOTLIGHT</span>
                </div>
                <h2 className="heading-md">Featured Media &amp; Community Voice</h2>
                <p className="text-muted mt-2 text-sm">
                  Watch latest creative visuals and vote on what projects I should ship next.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {settings.media_embed_enabled !== false && (
                  <MediaEmbedCard
                    enabled={true}
                    type={settings.media_embed_type || 'youtube'}
                    url={settings.media_embed_url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                    title={settings.media_embed_title || 'Featured Creative Visual 📺'}
                  />
                )}

                {settings.poll_enabled !== false && (
                  <InteractivePollCard
                    enabled={true}
                    question={settings.poll_question}
                    options={settings.poll_options}
                  />
                )}
              </div>
            </div>
          </section>
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
