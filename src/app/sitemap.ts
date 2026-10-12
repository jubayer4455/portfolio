import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jubayer.me'

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 1.0,
  },
  {
    url: `${baseUrl}/gallery`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  },
  {
    url: `${baseUrl}/#about`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: `${baseUrl}/#contact`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  },
]

import { getGalleryItems } from '@/lib/content-store'

async function getPublicGallerySlugs(): Promise<
  { slug: string; updated_at: string }[]
> {
  try {
    const items = await getGalleryItems()
    if (items && items.length > 0) {
      return items
        .filter((i) => i.is_public !== false)
        .map((i) => ({ slug: i.slug, updated_at: new Date().toISOString() }))
    }
  } catch {
    // fallback
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'placeholder-key'
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data } = await supabase
      .from('gallery_images')
      .select('slug, updated_at')
      .eq('is_public', true)
      .order('sort_order')

    return data || []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const gallerySlugs = await getPublicGallerySlugs()

  const galleryRoutes: MetadataRoute.Sitemap = gallerySlugs.map(
    ({ slug, updated_at }) => ({
      url: `${baseUrl}/gallery/${slug}`,
      lastModified: new Date(updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })
  )

  return [...staticRoutes, ...galleryRoutes]
}
