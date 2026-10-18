import type { MetadataRoute } from 'next'
import { getCanonicalSiteUrl } from '@/lib/seo-engine'

const baseUrl = getCanonicalSiteUrl()

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/gallery', '/gallery/*', '/u/*', '/privacy'],
        disallow: ['/admin/', '/api/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/', '/gallery/*', '/u/*', '/uploads/*'],
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/image-sitemap.xml`,
    ],
    host: baseUrl,
  }
}
