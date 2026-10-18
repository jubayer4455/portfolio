import type { MetadataRoute } from 'next'
import { getGalleryItems, getSiteSettings } from '@/lib/content-store'
import { readAllUserBios } from '@/lib/builder-store'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hellojubayer.online'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // 1. Fetch site settings & gallery images for image sitemaps
  let settings: any = null
  let galleryItems: any[] = []
  try {
    settings = await getSiteSettings()
    galleryItems = await getGalleryItems()
  } catch (err) {
    console.warn('Sitemap content load error:', err)
  }

  const publicGallery = (galleryItems || []).filter((item) => item.is_public !== false)
  const allGalleryImageUrls = publicGallery.map((i) => i.public_url).filter(Boolean)

  // 2. Fetch user bio profiles
  let userBios: any[] = []
  try {
    userBios = readAllUserBios().filter((b) => !b.is_suspended)
  } catch (err) {
    console.warn('Sitemap user bios load error:', err)
  }

  // Core Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Dynamic Gallery Image Pages with Dedicated Image URL
  const galleryPages: MetadataRoute.Sitemap = publicGallery.map((img) => ({
    url: `${baseUrl}/gallery/${img.slug}`,
    lastModified: img.updated_at ? new Date(img.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Dynamic User Bio Pages with User Avatars & Showcase Photos
  const userBioPages: MetadataRoute.Sitemap = userBios.map((bio) => ({
    url: `${baseUrl}/u/${bio.username}`,
    lastModified: bio.updated_at ? new Date(bio.updated_at) : now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [...staticPages, ...galleryPages, ...userBioPages]
}
