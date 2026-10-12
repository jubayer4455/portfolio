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

  return (
    <>
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
