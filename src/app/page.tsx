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
        <WebProjectsShowcase projects={projects} />
        <SocialHub socials={socials} settings={settings} />
        <GallerySection items={gallery} />
        <BuilderFeatureBanner />
        <FeaturedCreatorsSection featuredUsers={featuredUsers} />
        <AboutSection settings={settings} />
        <ReviewsSection initialReviews={reviews} />
        <FaqSection />
        <AnonymousMessageBox />
        <ContactSection settings={settings} socials={socials} />
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
