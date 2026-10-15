/**
 * Universal Intelligent Image & Page SEO Engine
 * - Automatically generates descriptive, keyword-rich Alt Text for any image (Admin & Users)
 * - Automatically crafts Google-optimized SEO Titles & Descriptions (150-160 chars)
 * - Generates Schema.org JSON-LD structured data (ImageObject, ProfilePage, Person, WebSite)
 * - Automatically slugifies filenames into keyword-rich, Google-friendly URLs
 * - Guarantees that future photos added by admin or users are 100% automatically SEO-optimized
 */

export interface PhotoSeoInput {
  title?: string
  caption?: string
  category?: string
  description?: string
  authorName?: string
  username?: string
  displayName?: string
  photoType?: 'gallery' | 'avatar' | 'cover' | 'user-photo' | 'review'
  slotIndex?: number
  url?: string
  width?: number
  height?: number
}

export interface PhotoSeoResult {
  alt_text: string
  title: string
  caption: string
  seo_title: string
  seo_description: string
  slug: string
  keywords: string[]
}

const DEFAULT_AUTHOR = 'Abdul Al Jubayer'
const DEFAULT_SITE_TITLE = 'Abdul Al Jubayer — Visual Creator & Lifestyle Storyteller'

/**
 * Clean and capitalize words nicely
 */
function cleanText(text: string): string {
  return text
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function capitalizeWords(text: string): string {
  return text.replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Generate a clean, SEO-optimized URL slug from title and keywords
 */
export function generateSeoSlug(title: string, suffix?: string | number): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)

  if (suffix !== undefined && suffix !== null) {
    return `${base}-${suffix}`
  }
  return base || `photo-${Date.now()}`
}

/**
 * Generates an SEO-optimized filename for uploads so Google Images can index keywords from the URL
 * e.g. "abdul-al-jubayer-visual-diary-kyoto-wanderlust-x92a.jpg"
 */
export function generateSeoFilename(
  originalName: string,
  contextKeywords: string[] = [],
  author = DEFAULT_AUTHOR
): string {
  const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/)
  const ext = (extMatch ? extMatch[1] : 'jpg').toLowerCase()
  const cleanOriginal = originalName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9]+/g, '-')

  const parts = [
    author.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    ...contextKeywords.map((k) => k.toLowerCase().replace(/[^a-z0-9]+/g, '-')),
    cleanOriginal.slice(0, 30),
  ].filter(Boolean)

  const randomSuffix = Math.random().toString(36).slice(2, 6)
  const baseSlug = parts.join('-').replace(/-+/g, '-').slice(0, 80)

  return `${baseSlug}-${Date.now().toString().slice(-4)}${randomSuffix}.${ext}`
}

/**
 * Universal Photo SEO Generator:
 * Creates high-ranking Alt Text, SEO Titles, Descriptions, and Captions automatically
 */
export function generatePhotoSeo(input: PhotoSeoInput): PhotoSeoResult {
  const type = input.photoType || 'gallery'
  const author = input.authorName || DEFAULT_AUTHOR
  const user = input.displayName || input.username || 'Creator'
  const handle = input.username ? `@${input.username}` : ''

  let title = cleanText(input.title || input.caption || '')
  let altText = ''
  let caption = cleanText(input.caption || input.description || '')
  let seoTitle = ''
  let seoDescription = ''
  const keywords: string[] = []

  switch (type) {
    case 'avatar':
      if (input.username) {
        title = `${user} Profile Avatar`
        altText = `${user} (${handle}) — Official Profile Photo & Link-in-Bio Avatar`
        caption = `${user} official personal avatar on 3D Link in Bio`
        seoTitle = `${user} (${handle}) Profile Photo — Official Bio`
        seoDescription = `Official avatar and profile picture of ${user} (${handle}) on their personalized 3D Link-in-Bio hub.`
        keywords.push(user, handle, 'Profile Photo', 'Avatar', 'Link in Bio')
      } else {
        title = `${author} Official Portrait`
        altText = `${author} — Visual Creator & Lifestyle Storyteller Official Profile Photo`
        caption = `${author} — Visual creator and lifestyle storyteller based in Dhaka, Bangladesh.`
        seoTitle = `${author} — Official Profile Photo & Portrait`
        seoDescription = `Official profile portrait of ${author}, creative visual storyteller and digital creator.`
        keywords.push(author, 'Profile Photo', 'Portrait', 'Visual Creator', 'Dhaka')
      }
      break

    case 'cover':
      title = `${user} Header Banner`
      altText = `${user} (${handle}) — Official Profile Header Banner & Visual Cover`
      caption = `${user} official header cover on 3D Link in Bio`
      seoTitle = `${user} Header Banner — 3D Bio Profile`
      seoDescription = `Visual header banner and cover aesthetic for ${user} (${handle})'s link-in-bio showcase.`
      keywords.push(user, handle, 'Header Banner', 'Cover Photo', 'Aesthetic')
      break

    case 'user-photo':
      const slotNum = (input.slotIndex ?? 0) + 1
      const photoSubject = title || `Showcase Moment ${slotNum}`
      title = photoSubject
      altText = `${user} (${handle}) — ${photoSubject} | Personal Visual Showcase & Story`
      caption = caption || `${photoSubject} captured by ${user}`
      seoTitle = `${photoSubject} — ${user} Showcase`
      seoDescription = `Visual capture "${photoSubject}" featured by ${user} (${handle}) on their official 3D bio showcase.`
      keywords.push(user, handle, photoSubject, 'Showcase Photo', 'Visual Diary')
      break

    case 'review':
      title = `${user} Review Portrait`
      altText = `${user} — Verified User Reviewer & Community Member Portrait`
      caption = `Community testimonial by ${user}`
      seoTitle = `Review by ${user} — Community Feedback`
      seoDescription = `Verified community review and feedback from ${user} on the ${author} platform.`
      keywords.push(user, 'Review', 'Community', 'Testimonial')
      break

    case 'gallery':
    default:
      const category = input.category || 'Photography'
      const cleanCategory = capitalizeWords(cleanText(category))
      title = title || `${cleanCategory} Moment`

      // Rich, natural alt text optimized for Google Images search intent
      altText = `${title} — ${cleanCategory} Photography by ${author} | Captured Moments & Visual Diary`
      caption = caption || `Captured in ${cleanCategory} category by ${author}.`
      seoTitle = `${title} — ${cleanCategory} | ${author}`
      seoDescription = input.description
        ? `${title}: ${input.description.slice(0, 110)} — ${cleanCategory} photography by ${author}.`
        : `Explore "${title}" by ${author}. A captured visual moment in ${cleanCategory} photography, featured in the official Visual Diary.`

      keywords.push(
        author,
        title,
        cleanCategory,
        'Photography',
        'Visual Diary',
        'Captured Moments',
        'Aesthetic'
      )
      break
  }

  const slug = generateSeoSlug(title, Date.now().toString().slice(-4))

  return {
    alt_text: altText,
    title,
    caption,
    seo_title: seoTitle.slice(0, 60),
    seo_description: seoDescription.slice(0, 160),
    slug,
    keywords,
  }
}

/**
 * Generate Schema.org ImageObject structured data for any photo
 */
export function generateImageObjectSchema(params: {
  url: string
  title: string
  altText?: string
  description?: string
  caption?: string
  authorName?: string
  width?: number
  height?: number
  pageUrl?: string
  uploadDate?: string
}) {
  const author = params.authorName || DEFAULT_AUTHOR
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jubayer.me'

  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    contentUrl: params.url,
    thumbnailUrl: params.url,
    url: params.pageUrl || params.url,
    name: params.title,
    headline: params.title,
    description: params.description || params.altText || params.title,
    caption: params.caption || params.title,
    author: {
      '@type': 'Person',
      name: author,
      url: siteUrl,
    },
    creator: {
      '@type': 'Person',
      name: author,
    },
    copyrightHolder: {
      '@type': 'Person',
      name: author,
    },
    width: params.width || 1200,
    height: params.height || 800,
    uploadDate: params.uploadDate || new Date().toISOString(),
    representativeOfPage: true,
  }
}

/**
 * Generate comprehensive Schema.org metadata for a User Bio profile page (/u/[username])
 * Includes ProfilePage, Person with sameAs, and ImageObjects for all user photos
 */
export function generateUserBioSchema(bio: {
  username: string
  display_name: string
  tagline?: string
  bio?: string
  avatar_url?: string
  cover_url?: string
  location?: string
  social_links?: Array<{ platform: string; profile_url: string }>
  photos?: Array<{ id?: string; url: string; caption?: string; alt_text?: string }>
  created_at?: string
}, baseUrl: string) {
  const profileUrl = `${baseUrl}/u/${bio.username}`
  const user = bio.display_name || bio.username
  const sameAsList = (bio.social_links || []).map((l) => l.profile_url).filter((u) => u.startsWith('http'))

  const photoSchemas = (bio.photos || []).map((photo, i) => ({
    '@type': 'ImageObject',
    contentUrl: photo.url,
    name: photo.caption || `${user} Showcase Photo ${i + 1}`,
    description: photo.alt_text || `${user} (@${bio.username}) — ${photo.caption || 'Featured Photo'}`,
    caption: photo.caption || `${user} showcase moment`,
    author: {
      '@type': 'Person',
      name: user,
      url: profileUrl,
    },
  }))

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: `${user} (@${bio.username}) — Official 3D Link in Bio`,
    description: bio.tagline || bio.bio || `Connect with ${user} across social platforms and explore their visual showcase.`,
    url: profileUrl,
    mainEntity: {
      '@type': 'Person',
      name: user,
      alternateName: `@${bio.username}`,
      identifier: bio.username,
      description: bio.bio || bio.tagline,
      jobTitle: bio.tagline,
      image: bio.avatar_url || `${baseUrl}/profile.jpg`,
      url: profileUrl,
      sameAs: sameAsList,
      address: bio.location ? {
        '@type': 'PostalAddress',
        addressLocality: bio.location,
      } : undefined,
    },
    hasPart: photoSchemas.length > 0 ? photoSchemas : undefined,
  }

  return schema
}

/**
 * Generate full WebSite + Person + ImageGallery schema for the main portfolio
 */
export function generateMainSiteSchema(settings: {
  site_name?: string
  first_name?: string
  last_name?: string
  tagline?: string
  bio_intro?: string
  avatar_url?: string
  location?: string
  contact_email?: string
}, galleryImages: Array<{
  title: string
  slug: string
  public_url: string
  description?: string
  alt_text?: string
  caption?: string
  width?: number
  height?: number
}>, baseUrl: string) {
  const fullName = `${settings.first_name || 'Abdul Al'} ${settings.last_name || 'Jubayer'}`.trim()
  const siteName = settings.site_name || `${fullName} Portfolio`

  const imagesSchema = galleryImages.slice(0, 12).map((img, i) => ({
    '@type': 'ImageObject',
    position: i + 1,
    contentUrl: img.public_url,
    url: `${baseUrl}/gallery/${img.slug}`,
    name: img.title,
    description: img.alt_text || img.description || img.title,
    caption: img.caption || img.title,
    width: img.width || 1200,
    height: img.height || 800,
    author: {
      '@type': 'Person',
      name: fullName,
      url: baseUrl,
    },
  }))

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      alternateName: [fullName, 'AJ Bio', 'Abdul Al Jubayer Bio'],
      url: baseUrl,
      description: settings.bio_intro || settings.tagline,
      publisher: {
        '@type': 'Person',
        name: fullName,
        url: baseUrl,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: fullName,
      url: baseUrl,
      image: settings.avatar_url || `${baseUrl}/profile.jpg`,
      jobTitle: settings.tagline || 'Visual Creator & Lifestyle Storyteller',
      description: settings.bio_intro,
      email: settings.contact_email ? `mailto:${settings.contact_email}` : undefined,
      address: settings.location ? {
        '@type': 'PostalAddress',
        addressLocality: settings.location,
      } : undefined,
      knowsAbout: [
        'Visual Storytelling',
        'Photography',
        'Digital Art',
        'Creative Direction',
        'Social Media Architecture',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${fullName} — Visual Diary & Captured Moments`,
      url: `${baseUrl}/gallery`,
      description: 'Curated collection of aesthetic photography, portraits, travel moments, and lifestyle captures.',
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: imagesSchema,
      },
    },
  ]
}
